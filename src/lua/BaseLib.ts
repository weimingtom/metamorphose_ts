import { Enumeration } from "../java/Enumeration";
import { NumberFormatException } from "../java/NumberFormatException";
import { PrintStream } from "../java/PrintStream";
import { Reader } from "../java/Reader";
import { SystemUtil } from "../java/SystemUtil";
import { BaseLibReader } from "./BaseLibReader";
import { Debug } from "./Debug";
import { DumpedInput } from "./DumpedInput";
import { Lua } from "./Lua";
import { LuaFunction } from "./LuaFunction";
import { LuaJavaCallback } from "./LuaJavaCallback";
import { LuaTable } from "./LuaTable";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BaseLib.java#1 $
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
 * Contains Lua's base library.  The base library is generally
 * considered essential for running any Lua program.  The base library
 * can be opened using the {@link #open} method.
 */
export class BaseLib extends LuaJavaCallback
{
	// :todo: consider making the enums contiguous so that the compiler
	// uses the compact and faster form of switch.

	// Each function in the base library corresponds to an instance of
	// this class which is associated (the 'which' member) with an integer
	// which is unique within this class.  They are taken from the following
	// set.
	private static ASSERT:number = 1;
	private static COLLECTGARBAGE:number = 2;
	private static DOFILE:number = 3;
	private static ERROR:number = 4;
	// private static const GCINFO:int = 5;
	private static GETFENV:number = 6;
	private static GETMETATABLE:number = 7;
	private static LOADFILE:number = 8;
	private static LOAD:number = 9;
	private static LOADSTRING:number = 10;
	private static NEXT:number = 11;
	private static PCALL:number = 12;
	private static PRINT:number = 13;
	private static RAWEQUAL:number = 14;
	private static RAWGET:number = 15;
	private static RAWSET:number = 16;
	private static SELECT:number = 17;
	private static SETFENV:number = 18;
	private static SETMETATABLE:number = 19;
	private static TONUMBER:number = 20;
	private static TOSTRING:number = 21;
	private static TYPE:number = 22;
	private static UNPACK:number = 23;
	private static XPCALL:number = 24;

	private static IPAIRS:number = 25;
	private static PAIRS:number = 26;
	private static IPAIRS_AUX:number = 27;
	private static PAIRS_AUX:number = 28;

	// The coroutine functions (which reside in the table "coroutine") are also
	// part of the base library.
	private static CREATE:number = 50;
	private static RESUME:number = 51;
	private static RUNNING:number = 52;
	private static STATUS:number = 53;
	private static WRAP:number = 54;
	private static YIELD:number = 55;
	
	private static WRAP_AUX:number = 56;
	
	/**
	* Lua value that represents the generator function for ipairs.  In
	* PUC-Rio this is implemented as an upvalue of ipairs.
	*/
	private static IPAIRS_AUX_FUN:Object = new BaseLib(BaseLib.IPAIRS_AUX);
	/**
	* Lua value that represents the generator function for pairs.  In
	* PUC-Rio this is implemented as an upvalue of pairs.
	*/
	private static PAIRS_AUX_FUN:Object = new BaseLib(BaseLib.PAIRS_AUX);

	/**
	* Which library function this object represents.  This value should
	* be one of the "enums" defined in the class.
	*/
	private which:number;

	/**
	* For wrapped threads created by coroutine.wrap, this references the
	* Lua thread object.
	*/
	private thread:Lua | null = null;
	
	/** Constructs instance, filling in the 'which' member. */
	public constructor(which:number)
	{
		super();
		this.which = which;
		BaseLib.OutputArr = new Array();
		BaseLib.OutputArr.push("");
	}

	/** Instance constructor used by coroutine.wrap. */
	private init(L:Lua | null):void
	{
		this.which = BaseLib.WRAP_AUX;
		this.thread = L;
	}
	
	/**
	 * Implements all of the functions in the Lua base library.  Do not
	 * call directly.
	 * @param L  the Lua state in which to execute.
	 * @return number of returned parameters, as per convention.
	 */
	override luaFunction(L:Lua):number
	{
		switch (this.which)
		{
			case BaseLib.ASSERT:
				return BaseLib.assertFunction(L);
			
			case BaseLib.COLLECTGARBAGE:
				return BaseLib.collectgarbage(L);
			
			case BaseLib.DOFILE:
				return BaseLib.dofile(L);
			
			case BaseLib.ERROR:
				return BaseLib.error(L);
			
			case BaseLib.GETFENV:
				return BaseLib.getfenv(L);
			
			case BaseLib.GETMETATABLE:
				return BaseLib.getmetatable(L);
			
			case BaseLib.IPAIRS:
				return BaseLib.ipairs(L);
			
			case BaseLib.LOAD:
				return BaseLib.load(L);
			
			case BaseLib.LOADFILE:
				return BaseLib.loadfile(L);
			
			case BaseLib.LOADSTRING:
				return BaseLib.loadstring(L);
			
			case BaseLib.NEXT:
				return BaseLib.next(L);
			
			case BaseLib.PAIRS:
				return BaseLib.pairs(L);
			
			case BaseLib.PCALL:
				return BaseLib.pcall(L);
			
			case BaseLib.PRINT:
				return BaseLib.print(L);
			
			case BaseLib.RAWEQUAL:
				return BaseLib.rawequal(L);
			
			case BaseLib.RAWGET:
				return BaseLib.rawget(L);
			
			case BaseLib.RAWSET:
				return BaseLib.rawset(L);
			
			case BaseLib.SELECT:
				return BaseLib.select(L);
			
			case BaseLib.SETFENV:
				return BaseLib.setfenv(L);
			
			case BaseLib.SETMETATABLE:
				return BaseLib.setmetatable(L);
			
			case BaseLib.TONUMBER:
				return BaseLib.tonumber(L);
			
			case BaseLib.TOSTRING:
				return BaseLib.tostring(L);
			
			case BaseLib.TYPE:
				return BaseLib.type(L);
			
			case BaseLib.UNPACK:
				return BaseLib.unpack(L);
			
			case BaseLib.XPCALL:
				return BaseLib.xpcall(L);
			
			case BaseLib.IPAIRS_AUX:
				return BaseLib.ipairsaux(L);
			
			case BaseLib.PAIRS_AUX:
				return BaseLib.pairsaux(L);

			case BaseLib.CREATE:
				return BaseLib.create(L);
			
			case BaseLib.RESUME:
				return BaseLib.resume(L);
			
			case BaseLib.RUNNING:
				return BaseLib.running(L);
			
			case BaseLib.STATUS:
				return BaseLib.status(L);
			
			case BaseLib.WRAP:
				return BaseLib.wrap(L);
			
			case BaseLib.YIELD:
				return BaseLib.yield(L);
			
			case BaseLib.WRAP_AUX:
				return this.wrapaux(L);
		}
		return 0;
	}

	/**
	 * Opens the base library into the given Lua state.  This registers
	 * the symbols of the base library in the global table.
	 * @param L  The Lua state into which to open.
	 */
	public static open(L:Lua):void
	{
		// set global _G
		L.setGlobal("_G", L.getGlobals());
		// set global _VERSION
		L.setGlobal("_VERSION", Lua.VERSION);
		BaseLib.r(L, "assert", BaseLib.ASSERT);
		BaseLib.r(L, "collectgarbage", BaseLib.COLLECTGARBAGE);
		BaseLib.r(L, "dofile", BaseLib.DOFILE);
		BaseLib.r(L, "error", BaseLib.ERROR);
		BaseLib.r(L, "getfenv", BaseLib.GETFENV);
		BaseLib.r(L, "getmetatable", BaseLib.GETMETATABLE);
		BaseLib.r(L, "ipairs", BaseLib.IPAIRS);
		BaseLib.r(L, "loadfile", BaseLib.LOADFILE);
		BaseLib.r(L, "load", BaseLib.LOAD);
		BaseLib.r(L, "loadstring", BaseLib.LOADSTRING);
		BaseLib.r(L, "next", BaseLib.NEXT);
		BaseLib.r(L, "pairs", BaseLib.PAIRS);
		BaseLib.r(L, "pcall", BaseLib.PCALL);
		BaseLib.r(L, "print", BaseLib.PRINT);
		BaseLib.r(L, "rawequal", BaseLib.RAWEQUAL);
		BaseLib.r(L, "rawget", BaseLib.RAWGET);
		BaseLib.r(L, "rawset", BaseLib.RAWSET);
		BaseLib.r(L, "select", BaseLib.SELECT);
		BaseLib.r(L, "setfenv", BaseLib.SETFENV);
		BaseLib.r(L, "setmetatable", BaseLib.SETMETATABLE);
		BaseLib.r(L, "tonumber", BaseLib.TONUMBER);
		BaseLib.r(L, "tostring", BaseLib.TOSTRING);
		BaseLib.r(L, "type", BaseLib.TYPE);
		BaseLib.r(L, "unpack", BaseLib.UNPACK);
		BaseLib.r(L, "xpcall", BaseLib.XPCALL);

		L.__register("coroutine");

		BaseLib.c(L, "create", BaseLib.CREATE);
		BaseLib.c(L, "resume", BaseLib.RESUME);
		BaseLib.c(L, "running", BaseLib.RUNNING);
		BaseLib.c(L, "status", BaseLib.STATUS);
		BaseLib.c(L, "wrap", BaseLib.WRAP);
		BaseLib.c(L, "yield", BaseLib.YIELD);
	}

	/** Register a function. */
	private static r(L:Lua, name:string, which:number):void
	{
		var f:BaseLib = new BaseLib(which);
		L.setGlobal(name, f);
	}
	
	/** Register a function in the coroutine table. */
	private static c(L:Lua, name:string, which:number):void
	{
		var f:BaseLib = new BaseLib(which);
		L.setField(L.getGlobal("coroutine"), name, f);
	}
	
	/** Implements assert.  <code>assert</code> is a keyword in some
	 * versions of Java, so this function has a mangled name.
	 */
	private static assertFunction(L:Lua):number
	{
		L.checkAny(1);
		if (!L.toBoolean(L.value(1)))
		{
			L.error(L.optString(2, "assertion failed!"));
		}
		return L.getTop();
	}

	/** Used by {@link #collectgarbage}. */
	private static CGOPTS:string[] = //new String[]
	[
		"stop", "restart", "collect",
		"count", "step", "setpause", "setstepmul"
	];
	
	/** Used by {@link #collectgarbage}. */
	private static CGOPTSNUM:number[] = //new int[]
	[
		Lua.GCSTOP, Lua.GCRESTART, Lua.GCCOLLECT,
		Lua.GCCOUNT, Lua.GCSTEP, Lua.GCSETPAUSE, Lua.GCSETSTEPMUL
	];
	
	/** Implements collectgarbage. */
	private static collectgarbage(L:Lua):number
	{
		var o:number = L.checkOption(1, "collect", BaseLib.CGOPTS);
		var ex:number = L.optInt(2, 0);
		var res:number = L.gc(BaseLib.CGOPTSNUM[o], ex);
		switch (BaseLib.CGOPTSNUM[o])
		{
			case Lua.GCCOUNT:
				{
					var b:number = L.gc(Lua.GCCOUNTB, 0);
					L.pushNumber(res + (b as number)/1024);
					return 1;
				}
			
			case Lua.GCSTEP:
				L.pushBoolean(res != 0);
				return 1;
			
			default:
				L.pushNumber(res);
				return 1;
		}
	}

	/** Implements dofile. */
	private static dofile(L:Lua):number
	{
		var fname:string | null = L.optString(1, null);
		var n:number = L.getTop();
		if (L.loadFile(fname) != 0)
		{
			L.error(L.value(-1));
		}
		L.call(0, Lua.MULTRET);
		return L.getTop() - n;
	}

	/** Implements error. */
	private static error(L:Lua):number
	{
		var level:number = L.optInt(2, 1);
		L.setTop(1);
		if (Lua.isString(L.value(1)) && level > 0)
		{
			L.insert(L.where(level), 1);
			L.concat(2);
		}
		L.error(L.value(1));
		// NOTREACHED
		return 0;
	}

	/** Helper for getfenv and setfenv. */
	private static getfunc(L:Lua):Object | null
	{
		var o:Object | null = L.value(1);
		if (Lua.isFunction(o))
		{
			return o;
		}
		else
		{
			var level:number = L.optInt(1, 1);
			L.argCheck(level >= 0, 1, "level must be non-negative");
			var ar:Debug | null = L.getStack(level);
			if (ar == null)
			{
				L.argError(1, "invalid level");
			}
			L.getInfo("f", ar);
			o = L.value(-1);
			if (Lua.isNil(o))
			{
				L.error("no function environment for tail call at level " + level);
			}
			L.pop(1);
			return o;
		}
	}

	/** Implements getfenv. */
	private static getfenv(L:Lua):number
	{
		var o:Object | null = BaseLib.getfunc(L);
		if (Lua.isJavaFunction(o))
		{
			L.pushObject(L.getGlobals());
		}
		else
		{
			var f:LuaFunction = o as LuaFunction;
			L.pushObject(f.env);
		}
		return 1;
	}

	/** Implements getmetatable. */
	private static getmetatable(L:Lua):number
	{
		L.checkAny(1);
		var mt:Object | null = L.getMetatable(L.value(1));
		if (mt == null)
		{
			L.pushNil();
			return 1;
		}
		var protectedmt:Object | null = L.getMetafield(L.value(1), "__metatable");
		if (Lua.isNil(protectedmt))
		{
			L.pushObject(mt);               // return metatable
		}
		else
		{
			L.pushObject(protectedmt);      // return __metatable field
		}
		return 1;
	}
		
	/** Implements load. */
	private static load(L:Lua):number
	{
		var cname:string | null = L.optString(2, "=(load)");
		L.checkType(1, Lua.TFUNCTION);
		var r:Reader = new BaseLibReader(L, L.value(1));
		var status:number;

		status = L.__load(r, cname);
		return BaseLib.load_aux(L, status);
	}

	/** Implements loadfile. */
	private static loadfile(L:Lua):number
	{
		var fname:string | null = L.optString(1, null);
		return BaseLib.load_aux(L, L.loadFile(fname));
	}

	/** Implements loadstring. */
	private static loadstring(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		var chunkname:string | null = L.optString(2, s);
		if (s!.substr(0, 1) == "0x1B")//"\033")
		{
			// "binary" dumped into string using string.dump.
			return BaseLib.load_aux(L, L.load(new DumpedInput(s), chunkname));
		}
		else
		{
			return BaseLib.load_aux(L, L.loadString(s, chunkname));
		}
	}
		
	private static load_aux(L:Lua, status:number):number
	{
		if (status == 0)    // OK?
		{
			return 1;
		}
		else
		{
			L.insert(Lua.NIL, -1);      // put before error message
			return 2; // return nil plus error message
		}
	}

	/** Implements next. */
	private static next(L:Lua):number
	{
		L.checkType(1, Lua.TTABLE);
		L.setTop(2);        // Create a 2nd argument is there isn't one
		if (L.next(1))
		{
			return 2;
		}
		L.pushObject(Lua.NIL);
		return 1;
	}

	/** Implements ipairs. */
	private static ipairs(L:Lua):number 
	{
		L.checkType(1, Lua.TTABLE);
		L.pushObject(BaseLib.IPAIRS_AUX_FUN);
		L.pushValue(1);
		L.pushNumber(0);
		return 3;
	}

	/** Generator for ipairs. */
	private static ipairsaux(L:Lua):number
	{
		var i:number = L.checkInt(2);
		L.checkType(1, Lua.TTABLE);
		++i;
		var v:Object | null = Lua.rawGetI(L.value(1), i);
		if (Lua.isNil(v))
		{
			return 0;
		}
		L.pushNumber(i);
		L.pushObject(v);
		return 2;
	}

	/** Implements pairs.  PUC-Rio uses "next" as the generator for pairs.
	 * Jill doesn't do that because it would be way too slow.  We use the
	 * {@link java.util.Enumeration} returned from
	 * {@link java.util.Hashtable#keys}.  The {@link #pairsaux} method
	 * implements the step-by-step iteration.
	 */
	private static pairs(L:Lua):number
	{
		L.checkType(1, Lua.TTABLE);
		L.pushObject(BaseLib.PAIRS_AUX_FUN);                   // return generator,
		var t:LuaTable = L.value(1) as LuaTable;
		L.pushObject([t, t.keys()]); //TODO:   				 // state,
		L.pushObject(Lua.NIL);                         // and initial value.
		return 3;
	}

	/** Generator for pairs.  This expects a <var>state</var> and
	 * <var>var</var> as (Lua) arguments.
	 * The state is setup by {@link #pairs} and is a
	 * pair of {LuaTable, Enumeration} stored in a 2-element array.  The
	 * <var>var</var> is not used.  This is in contrast to the PUC-Rio
	 * implementation, where the state is the table, and the var is used
	 * to generated the next key in sequence.  The implementation, of
	 * pairs and pairsaux, has no control over <var>var</var>,  Lua's
	 * semantics of <code>for</code> force it to be the previous result
	 * returned by this function.  In Jill this value is not suitable to
	 * use for enumeration, which is why it isn't used.
	 */
	private static pairsaux(L:Lua):number
	{
		var a:Object[] = L.value(1) as Object[]; //(Object[])
		var t:LuaTable = a[0] as LuaTable;
		var e:Enumeration = a[1] as Enumeration;
		if (!e.hasMoreElements())
		{
			return 0;
		}
		var key:Object | null = e.nextElement();
		L.pushObject(key);
		L.pushObject(t.getlua(key));
		return 2;
	}

	/** Implements pcall. */
	private static pcall(L:Lua):number
	{
		L.checkAny(1);
		var status:number = L.pcall(L.getTop()-1, Lua.MULTRET, null);
		var b:boolean = (status == 0);
		L.insert(Lua.valueOfBoolean(b), 1);
		return L.getTop();
	}
		
	/**
	 * The {@link PrintStream} used by print.  Makes it more convenient if
	 * redirection is desired.  For example, client code could implement
	 * their own instance which sent output to the screen of a JME device.
	 */
	public static OUT:PrintStream = SystemUtil.out;
	public static OutputArr:string[];
	
	/** Implements print. */
	private static print(L:Lua):number
	{
		var n:number = L.getTop();
		var tostring:Object | null = L.getGlobal("tostring");
		for (var i:number = 1; i <= n; ++i)
		{
			L.pushObject(tostring);
			L.pushValue(i);
			L.call(1, 1);
			var s:string | null = L.toString_(L.value(-1));
			if (s == null)
			{
				return L.error("'tostring' must return a string to 'print'");
			}
			if (i > 1)
			{
				this.OutputArr[this.OutputArr.length - 1] += "\t";
				this.OUT.print('\t');
			}
			this.OutputArr[this.OutputArr.length - 1] += s;
			this.OUT.print(s);
			L.pop(1);
		}
		this.OutputArr.push("");
		this.OUT.println();
		return 0;
	}
		
	/** Implements rawequal. */
	private static rawequal(L:Lua):number
	{
		L.checkAny(1);
		L.checkAny(2);
		L.pushBoolean(Lua.rawEqual(L.value(1), L.value(2)));
		return 1;
	}

	/** Implements rawget. */
	private static rawget(L:Lua):number
	{
		L.checkType(1, Lua.TTABLE);
		L.checkAny(2);
		L.pushObject(Lua.rawGet(L.value(1), L.value(2)));
		return 1;
	}

	/** Implements rawset. */
	private static rawset(L:Lua):number 
	{
		L.checkType(1, Lua.TTABLE);
		L.checkAny(2);
		L.checkAny(3);
		L.rawSet(L.value(1), L.value(2), L.value(3));
		return 0;
	}

	/** Implements select. */
	private static select(L:Lua):number
	{
		var n:number = L.getTop();
		if (L.type(1) == Lua.TSTRING && "#" == L.toString_(L.value(1)))
		{
			L.pushNumber(n-1);
			return 1;
		}
		var i:number = L.checkInt(1);
		if (i < 0)
		{
			i = n + i;
		}
		else if (i > n)
		{
			i = n;
		}
		L.argCheck(1 <= i, 1, "index out of range");
		return n-i;
	}
	
	/** Implements setfenv. */
	private static setfenv(L:Lua):number
	{
		L.checkType(2, Lua.TTABLE);
		var o:Object | null = BaseLib.getfunc(L);
		var first:Object | null = L.value(1);
		if (Lua.isNumber(first) && L.toNumber(first) == 0)
		{
			// :todo: change environment of current thread.
			return 0;
		}
		else if (Lua.isJavaFunction(o) || !L.setFenv(o, L.value(2)))
		{
			L.error("'setfenv' cannot change environment of given object");
		}
		L.pushObject(o);
		return 1;
	}
	
	/** Implements setmetatable. */
	private static setmetatable(L:Lua):number
	{
		L.checkType(1, Lua.TTABLE);
		var t:number = L.type(2);
		L.argCheck(t == Lua.TNIL || t == Lua.TTABLE, 2,
			"nil or table expected");
		if (!Lua.isNil(L.getMetafield(L.value(1), "__metatable")))
		{
			L.error("cannot change a protected metatable");
		}
		L.setMetatable(L.value(1), L.value(2));
		L.setTop(1);
		return 1;
	}

	/** Implements tonumber. */
	private static tonumber(L:Lua):number
	{
		var base:number = L.optInt(2, 10);
		if (base == 10)     // standard conversion
		{
			L.checkAny(1);
			var o:Object | null = L.value(1);
			if (Lua.isNumber(o))
			{
				L.pushNumber(L.toNumber(o));
				return 1;
			}
		}
		else
		{
			var s:string | null = L.checkString(1);
			L.argCheck(2 <= base && base <= 36, 2, "base out of range");
			// :todo: consider stripping space and sharing some code with
			// Lua.vmTostring
			try
			{
				var i:number = parseInt(s!);//Integer.parseInt(s, base); //TODO:
				L.pushNumber(i);
				return 1;
			}
			catch (e_)
			{
				if (e_ instanceof NumberFormatException) {
					console.log((e_ as NumberFormatException).stack);
				}
			}
		}
		L.pushObject(Lua.NIL);
		return 1;
	}
	
	/** Implements tostring. */
	private static tostring(L:Lua):number
	{
		L.checkAny(1);
		var o:Object | null = L.value(1);

		if (L.callMeta(1, "__tostring"))    // is there a metafield?
		{
			return 1; // use its value
		}
		switch (L.type(1))
		{
			case Lua.TNUMBER:
				L.pushString(L.toString_(o));
				break;
			
			case Lua.TSTRING:
				L.pushObject(o);
				break;
			
			case Lua.TBOOLEAN:
				if (L.toBoolean(o))
				{
					L.pushLiteral("true");
				}
				else
				{
					L.pushLiteral("false");
				}
				break;
			
			case Lua.TNIL:
				L.pushLiteral("nil");
				break;
			
			default:
				L.pushString(o!.toString());
				break;
		}
		return 1;
	}
	
	/** Implements type. */
	private static type(L:Lua):number
	{
		L.checkAny(1);
		L.pushString(L.typeNameOfIndex(1));
		return 1;
	}
		
	/** Implements unpack. */
	private static unpack(L:Lua):number
	{
		L.checkType(1, Lua.TTABLE);
		var t:LuaTable = L.value(1) as LuaTable;
		var i:number = L.optInt(2, 1);
		var e:number = L.optInt(3, t.getn());
		var n:number = e - i + 1;  // number of elements
		if (n <= 0)
		{
			return 0;         // empty range
		}
		// i already initialised to start index, which isn't necessarily 1
		for (; i <= e; ++i)
		{
			L.pushObject(t.getnum(i));
		}
		return n;
	}
	
	/** Implements xpcall. */
	private static xpcall(L:Lua):number
	{
		L.checkAny(2);
		var errfunc:Object | null = L.value(2);
		L.setTop(1);        // remove error function from stack
		var status:number = L.pcall(0, Lua.MULTRET, errfunc);
		L.insert(Lua.valueOfBoolean(status == 0), 1);
		return L.getTop();  // return status + all results
	}
		
	/** Implements coroutine.create. */
	private static create(L:Lua):number
	{
		var NL:Lua = L.newThread();
		var faso:Object | null = L.value(1);
		L.argCheck(Lua.isFunction(faso) && !Lua.isJavaFunction(faso), 1,
			"Lua function expected");
		L.setTop(1);        // function is at top
		L.xmove(NL, 1);     // move function from L to NL
		L.pushObject(NL);
		return 1;
	}
	
	/** Implements coroutine.resume. */
	private static resume(L:Lua):number
	{
		var co:Lua | null = L.toThread(L.value(1));
		L.argCheck(co != null, 1, "coroutine expected");
		var r:number = BaseLib.auxresume(L, co, L.getTop() - 1);
		if (r < 0)
		{
			L.insert(Lua.valueOfBoolean(false), -1);
			return 2; // return false + error message
		}
		L.insert(Lua.valueOfBoolean(true), L.getTop()-(r-1));
		return r + 1;       // return true + 'resume' returns
	}

	/** Implements coroutine.running. */
	private static running(L:Lua):number
	{
		if (L.isMain())
		{
			return 0; // main thread is not a coroutine
		}
		L.pushObject(L);
		return 1;
	}
	
	/** Implements coroutine.status. */
	private static status(L:Lua):number
	{
		var co:Lua | null = L.toThread(L.value(1));
		L.argCheck(co != null, 1, "coroutine expected");
		if (L == co)
		{
			L.pushLiteral("running");
		}
		else
		{
			switch (co!.status)
			{
				case Lua.YIELD:
					L.pushLiteral("suspended");
					break;
			
				case 0:
					{
						var ar:Debug | null = co!.getStack(0);
						if (ar != null)       // does it have frames?
						{
							L.pushLiteral("normal");    // it is running
						}
						else if (co!.getTop() == 0)
						{
							L.pushLiteral("dead");
						}
						else
						{
							L.pushLiteral("suspended"); // initial state
						}
					}
					break;
			
				default:        // some error occured
					L.pushLiteral("dead");
			}
		}
		return 1;
	}

	/** Implements coroutine.wrap. */
	private static wrap(L:Lua):number
	{
		BaseLib.create(L);
		L.pushObject(BaseLib.wrapit(L.toThread(L.value(-1))));
		return 1;
	}

	/** Helper for wrap.  Returns a LuaJavaCallback that has access to the
	 * Lua thread.
	 * @param L the Lua thread to be wrapped.
	 */
	private static wrapit(L:Lua | null):LuaJavaCallback
	{
		var lib:BaseLib = new BaseLib(0);
		lib.init(L);
		return lib;
	}

	/** Helper for wrap.  This implements the function returned by wrap. */
	private wrapaux(L:Lua):number
	{
		var co:Lua | null = this.thread;
		var r:number = BaseLib.auxresume(L, co, L.getTop());
		if (r < 0)
		{
			if (Lua.isString(L.value(-1)))      // error object is a string?
			{
				var w:string = L.where(1);
				L.insert(w, -1);
				L.concat(2);
			}
			L.error(L.value(-1));     // propagate error
		}
		return r;
	}
	
	private static auxresume(L:Lua, co:Lua | null, narg:number):number
	{
		// if (!co.checkStack...
		if (co!.status == 0 && co!.getTop() == 0)
		{
			L.pushLiteral("cannot resume dead coroutine");
			return -1;        // error flag;
		}
		L.xmove(co, narg);
		var status:number = co!.resume(narg);
		if (status == 0 || status == Lua.YIELD)
		{
			var nres:number = co!.getTop();
			// if (!L.checkStack...
			co!.xmove(L, nres);        // move yielded values
			return nres;
		}
		co!.xmove(L, 1);   // move error message
		return -1;        // error flag;
	}
	
	/** Implements coroutine.yield. */
	private static yield(L:Lua):number
	{
		return L.yield(L.getTop());
	}
}
