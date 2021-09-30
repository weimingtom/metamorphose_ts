import { InputStream } from "../java/InputStream";
import { StringBuffer } from "../java/StringBuffer";
import { IOException } from "../java/IOException";
import { SystemUtil } from "../java/SystemUtil";
import { LuaJavaCallback } from "./LuaJavaCallback";
import { LuaTable } from "./LuaTable";
import { Lua } from "./Lua";
import { Debug } from "./Debug";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/PackageLib.java#1 $
 * Copyright (c) 2006 Nokia Corporation and/or its subsidiary(-ies).
 * All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//see jillcode(Java Implementation of Lua Language, Jill):
//	http://code.google.com/p/jillcode/
//这里的代码移植自jillcode(Lua的Java实现，Jill):
//	http://code.google.com/p/jillcode/	

/**
 * Contains Lua's package library.
 * The library
 * can be opened using the {@link #open} method.
 */
export class PackageLib extends LuaJavaCallback
{
	// Each function in the library corresponds to an instance of
	// this class which is associated (the 'which' member) with an integer
	// which is unique within this class.  They are taken from the following
	// set.
	private static MODULE:number = 1;
	private static REQUIRE:number = 2;
	private static SEEALL:number = 3;
	private static LOADER_PRELOAD:number = 4;
	private static LOADER_LUA:number = 5;
	
	
	/**
	 * Which library function this object represents.  This value should
	 * be one of the "enums" defined in the class.
	 */
	private _which:number;

	/**
	 * Module Environment; a reference to the package table so that
	 * package functions can access it without using the global table.
	 * In PUC-Rio this reference is stored in the function's environment.
	 * Not all instances (Lua Java functions) require this member, but
	 * another subclass would be too wasteful.
	 */
	private _me:LuaTable | null;

	public constructor(which:number, me?:LuaTable) 
	{
		super();
		this._which = which;
		this._me = ((me !== undefined) ? me : null);
	}
	
	//private function __init(which:int, me:LuaTable):void
	//{
	//	this._which = which;
	//	this.me = me;
	//}
	
	
	/**
	* Implements all of the functions in the Lua package library.  Do not
	* call directly.
	* @param L  the Lua state in which to execute.
	* @return number of returned parameters, as per convention.
	*/
	override luaFunction(L:Lua):number
	{
		switch (this._which)
		{
			case PackageLib.MODULE:
				return this.module(L);
		
			case PackageLib.REQUIRE:
				return this.require(L);
		
			case PackageLib.SEEALL:
				return PackageLib.seeall(L);
		
			case PackageLib.LOADER_LUA:
				return this.loaderLua(L);
		
			case PackageLib.LOADER_PRELOAD:
				return this.loaderPreload(L);
		}
		return 0;
	}

	/**
	 * Opens the library into the given Lua state.  This registers
	 * the symbols of the library in the global table.
	 * @param L  The Lua state into which to open.
	 */
	public static open(L:Lua):void
	{
		var t:LuaTable = L.__register("package");

		PackageLib.g(L, t, "module", PackageLib.MODULE);
		PackageLib.g(L, t, "require", PackageLib.REQUIRE);

		PackageLib.r(L, "seeall", PackageLib.SEEALL);

		L.setField(t, "loaders", L.newTable());
		PackageLib.p(L, t, PackageLib.LOADER_PRELOAD);
		PackageLib.p(L, t, PackageLib.LOADER_LUA);
		PackageLib.setpath(L, t, "path", PackageLib.PATH_DEFAULT);        // set field 'path'

		// set field 'loaded'
		L.findTable(L.getRegistry(), Lua.LOADED, 1);
		L.setField(t, "loaded", L.value(-1));
		L.pop(1);
		L.setField(t, "preload", L.newTable());
	}

	/** Register a function. */
	private static r(L:Lua, name:string, which:number):void
	{
		var f:PackageLib = new PackageLib(which);
		L.setField(L.getGlobal("package"), name, f);
	}

	/** Register a function in the global table. */
	private static g(L:Lua, t:LuaTable, name:string, which:number):void
	{
		var f:PackageLib = new PackageLib(which, t);
		L.setGlobal(name, f);
	}
	
	/** Register a loader in package.loaders. */
	private static p(L:Lua, t:LuaTable, which:number):void
	{
		var f:PackageLib = new PackageLib(which, t);
		var loaders:Object | null = L.getField(t, "loaders");
		L.rawSetI(loaders, Lua.objLen(loaders)+1, f);
	}

	private static DIRSEP:string = "/";
	private static PATHSEP:string  = ';'; //TODO:
	private static PATH_MARK:string = "?";
	private static PATH_DEFAULT:string = "?.lua;?/init.lua";

	private static SENTINEL:Object = new Object();

	/**
	* Implements the preload loader.  This is conventionally stored
	* first in the package.loaders table.
	*/
	private loaderPreload(L:Lua):number
	{
		var name:string | null = L.checkString(1);
		var preload:Object | null = L.getField(this._me, "preload");
		if (!Lua.isTable(preload))
			L.error("'package.preload' must be a table");
		var loader:Object | null = L.getField(preload, name);
		if (Lua.isNil(loader))        // not found?
			L.pushString("\n\tno field package.preload['" + name + "']");
		L.pushObject(loader);
		return 1;
	}

	/**
	 * Implements the lua loader.  This is conventionally stored second in
	 * the package.loaders table.
	 */
	private loaderLua(L:Lua):number
	{
		var name:string | null = L.checkString(1);
		var filename:string | null = this.findfile(L, name, "path");
		if (filename == null)
			return 1; // library not found in this path
		if (L.loadFile(filename) != 0)
			PackageLib.loaderror(L, filename);
		return 1;   // library loaded successfully
	}

	/** Implements module. */
	private module(L:Lua):number
	{
		var modname:string | null = L.checkString(1);
		var loaded:Object | null = L.getField(this._me, "loaded");
		var module:Object | null = L.getField(loaded, modname);
		if (!Lua.isTable(module))     // not found?
		{
			// try global variable (and create one if it does not exist)
			if (L.findTable(L.getGlobals(), modname, 1) != null)
				return L.error("name conflict for module '" + modname + "'");
			module = L.value(-1);
			L.pop(1);
			// package.loaded = new table
			L.setField(loaded, modname, module);
		}
		// check whether table already has a _NAME field
		if (Lua.isNil(L.getField(module, "_NAME")))
		{
			PackageLib.modinit(L, module, modname);
		}
		PackageLib.setfenv(L, module);
		PackageLib.dooptions(L, module, L.getTop());
		return 0;
	}

	/** Implements require. */
	private require(L:Lua):number
	{
		var name:string | null = L.checkString(1);
		L.setTop(1);
		// PUC-Rio's use of lua_getfield(L, LUA_REGISTRYINDEX, "_LOADED");
		// (package.loaded is kept in the registry in PUC-Rio) is translated
		// into this:
		var loaded:Object | null = L.getField(this._me, "loaded");
		var module:Object | null = L.getField(loaded, name);
		if (L.toBoolean(module))    // is it there?
		{
			if (module == PackageLib.SENTINEL)   // check loops
				L.error("loop or previous error loading module '" + name + "'");
			L.pushObject(module);
			return 1;
		}
		// else must load it; iterate over available loaders.
		var loaders:Object | null = L.getField(this._me, "loaders");
		if (!Lua.isTable(loaders))
			L.error("'package.loaders' must be a table");
		L.pushString("");   // error message accumulator
		for (var i:number = 1; ; ++i)
		{
			var loader:Object | null = Lua.rawGetI(loaders, i);    // get a loader
			if (Lua.isNil(loader))
				L.error("module '" + name + "' not found:" +
			L.toString_(L.value(-1)));
			L.pushObject(loader);
			L.pushString(name);
			L.call(1, 1);     // call it
			if (Lua.isFunction(L.value(-1)))    // did it find module?
				break;  // module loaded successfully
			else if (Lua.isString(L.value(-1))) // loader returned error message?
				L.concat(2);    // accumulate it
			else
				L.pop(1);
		}
		L.setField(loaded, name, PackageLib.SENTINEL); // package.loaded[name] = sentinel
		L.pushString(name); // pass name as argument to module
		L.call(1, 1);       // run loaded module
		if (!Lua.isNil(L.value(-1)))  // non-nil return?
		{
			// package.loaded[name] = returned value
			L.setField(loaded, name, L.value(-1));
		}
		module = L.getField(loaded, name);
		if (module == PackageLib.SENTINEL)  // module did not set a value?
		{
			module = Lua.valueOfBoolean(true);  // use true as result
			L.setField(loaded, name, module); // package.loaded[name] = true
		}
		L.pushObject(module);
		return 1;
	}
	
	/** Implements package.seeall. */
	private static seeall(L:Lua):number
	{
		L.checkType(1, Lua.TTABLE);
		var mt:LuaTable | null = L.getMetatable(L.value(1));
		if (mt == null)
		{
			mt = L.createTable(0, 1);
			L.setMetatable(L.value(1), mt);
		}
		L.setField(mt, "__index", L.getGlobals());
		return 0;
	}

	/**
	* Helper for module.  <var>module</var> parameter replaces PUC-Rio
	* use of passing it on the stack.
	*/
	public static setfenv(L:Lua, module:Object | null):void
	{
		var ar:Debug | null = L.getStack(1);
		L.getInfo("f", ar);
		L.setFenv(L.value(-1), module);
		L.pop(1);
	}

	/**
	 * Helper for module.  <var>module</var> parameter replaces PUC-Rio
	 * use of passing it on the stack.
	 */
	private static dooptions(L:Lua, module:Object | null, n:number):void
	{
		for (var i:number = 2; i <= n; ++i)
		{
			L.pushValue(i);   // get option (a function)
			L.pushObject(module);
			L.call(1, 0);
		}
	}

	/**
	* Helper for module.  <var>module</var> parameter replaces PUC-Rio
	* use of passing it on the stack.
	*/
	private static modinit(L:Lua, module:Object | null, modname:string | null):void
	{
		L.setField(module, "_M", module);   // module._M = module
		L.setField(module, "_NAME", modname);
		var dot:number = modname!.lastIndexOf('.'); // look for last dot in module name
		// Surprisingly, ++dot works when '.' was found and when it wasn't.
		++dot;
		// set _PACKAGE as package name (full module name minus last part)
		L.setField(module, "_PACKAGE", modname!.substring(0, dot));
	}

	private static loaderror(L:Lua, filename:string):void
	{
		L.error("error loading module '" + L.toString_(L.value(1)) +
			"' from file '" + filename + "':\n\t" +
			L.toString_(L.value(-1)));
	}

	private static readable(filename:string):boolean
	{
		var f:InputStream | null = SystemUtil.getResourceAsStream(filename);
		if (f == null)
			return false;
		try
		{
			f.close();
		}
		catch (e_)
		{
			if (e_ instanceof IOException) {
				console.log((e_ as IOException).getStackTrace());
			}
		}
		return true;
	}

	private static pushnexttemplate(L:Lua, path:string | null):string | null
	{
		var i:number = 0;
		// skip seperators
		while (i < path!.length && path!.substr(i, 1) == PackageLib.PATHSEP) //TODO:
			++i;
		if (i == path!.length)
			return null;      // no more templates
		var l:number = path!.indexOf(PackageLib.PATHSEP, i);
		if (l < 0)
			l = path!.length;
		L.pushString(path!.substring(i, l)); // template
		return path!.substring(l);
	}

	private findfile(L:Lua, name:string | null, pname:string):string | null
	{
		name = PackageLib.gsub(name, ".", PackageLib.DIRSEP);
		var path:string | null = L.toString_(L.getField(this._me, pname));
		if (path == null)
			L.error("'package." + pname + "' must be a string");
		L.pushString("");   // error accumulator
		while (true)
		{
			path = PackageLib.pushnexttemplate(L, path);
			if (path == null)
				break;
			var filename:string = PackageLib.gsub(L.toString_(L.value(-1)), PackageLib.PATH_MARK, name);
			if (PackageLib.readable(filename))   // does file exist and is readable?
				return filename;        // return that file name
			L.pop(1); // remove path template
			L.pushString("\n\tno file '" + filename + "'");
			L.concat(2);
		}
		return null;        // not found
	}

	/** Almost equivalent to luaL_gsub. */
	private static gsub(s:string | null, p:string, r:string):string
	{
		var b:StringBuffer = new StringBuffer();
		// instead of incrementing the char *s, we use the index i
		var i:number = 0;
		var l:number = p.length;
		
		while (true)
		{
			var wild:number = s!.indexOf(p, i);
			if (wild < 0)
				break;
			b.appendString(s!.substring(i, wild));   // add prefix
			b.appendString(r);      // add replacement in place of pattern
			i = wild + l;     // continue after 'p'
		}
		b.appendString(s!.substring(i));
		return b.toString();
	}
	
	private static setpath(L:Lua,
		t:LuaTable,
		fieldname:string,
		def:String):void
	{
		// :todo: consider implementing a user-specified path via
		// javax.microedition.midlet.MIDlet.getAppProperty or similar.
		// Currently we just use a default path defined by Jill.
		L.setField(t, fieldname, def);
	}
}
