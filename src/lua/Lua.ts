import { DataOutputStream } from "../java/DataOutputStream";
import { Enumeration } from "../java/Enumeration";
import { IOException } from "../java/IOException";
import { IllegalArgumentException } from "../java/IllegalArgumentException";
import { InputStream } from "../java/InputStream";
import { NullPointerException } from "../java/NullPointerException";
import { NumberFormatException } from "../java/NumberFormatException";
import { OutOfMemoryError } from "../java/OutOfMemoryError";
import { OutputStream } from "../java/OutputStream";
import { Reader } from "../java/Reader";
import { Runtime } from "../java/Runtime";
import { RuntimeException } from "../java/RuntimeException";
import { Stack } from "../java/Stack";
import { StringBuffer } from "../java/StringBuffer";
import { SystemUtil } from "../java/SystemUtil";
import { Slot } from "./Slot";
import { LuaTable } from "./LuaTable";
import { CallInfo } from "./CallInfo";
import { LuaFunction } from "./LuaFunction";
import { LuaJavaCallback } from "./LuaJavaCallback";
import { LuaUserdata } from "./LuaUserdata";
import { LuaError } from "./LuaError";
import { Debug } from "./Debug";
import { StringReader } from "./StringReader";
import { LuaInternal } from "./LuaInternal";
import { Hook } from "./Hook";
import { Proto } from "./Proto";
import { UpVal } from "./UpVal";
import { FormatItem } from "./FormatItem";
import { DumpState } from "./DumpState";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Lua.java#3 $
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
 * <p>
 * Encapsulates a Lua execution environment.  A lot of Jill's public API
 * manifests as public methods in this class.  A key part of the API is
 * the ability to call Lua functions from Java (ultimately, all Lua code
 * is executed in this manner).
 * </p>
 *
 * <p>
 * The Stack
 * </p>
 *
 * <p>
 * All arguments to Lua functions and all results returned by Lua
 * functions are placed onto a stack.  The stack can be indexed by an
 * integer in the same way as the PUC-Rio implementation.  A positive
 * index is an absolute index and ranges from 1 (the bottom-most
 * element) through to <var>n</var> (the top-most element),
 * where <var>n</var> is the number of elements on the stack.  Negative
 * indexes are relative indexes, -1 is the top-most element, -2 is the
 * element underneath that, and so on.  0 is not used.
 * </p>
 *
 * <p>
 * Note that in Jill the stack is used only for passing arguments and
 * returning results, unlike PUC-Rio.
 * </p>
 *
 * <p>
 * The protocol for calling a function is described in the {@link #call}
 * method.  In brief: push the function onto the stack, then push the
 * arguments to the call.
 * </p>
 *
 * <p>
 * The methods {@link #push}, {@link #pop}, {@link #value},
 * {@link #getTop}, {@link #setTop} are used to manipulate the stack.
 * </p>
 */
export class Lua
{		
	public static D:boolean = true; 
	
	/** Version string. */
	public static VERSION:string = "Lua 5.1 (Jill 1.0.1)";
	
	public static RELEASE:string = "Lua 5.1.4 (Jill 1.0.1)";
	public static VERSION_NUM:number = 501;
	public static COPYRIGHT:string = "Copyright (C) 1994-2008 Lua.org, PUC-Rio (Copyright (C) 2006 Nokia Corporation and/or its subsidiary(-ies))";
	/** http://www.ravenbrook.com */
	public static AUTHORS:string = "R. Ierusalimschy, L. H. de Figueiredo & W. Celes (Ravenbrook Limited)";
	
	/** Table of globals (global variables).  This actually shared across
	* all threads (with the same main thread), but kept in each Lua
	* thread as an optimisation.
	*/
	private _global:LuaTable;
	private _registry:LuaTable;
	
	/** Reference the main Lua thread.  Itself if this is the main Lua
	* thread.
	*/
	private _main:Lua;

	/** VM data stack.
	*/
	private _stack:Slot[] = new Array(); //TODO:=0? Slot[] 
	/**
	* One more than the highest stack slot that has been written to
	* (ever).
	* Used by {@link #stacksetsize} to determine which stack slots
	* need nilling when growing the stack.
	*/
	private _stackhighwater:number = 0;   // = 0;
	/**
	* Number of active elemements in the VM stack.  Should always be
	* <code><= stack.length</code>.
	*/
	private _stackSize:number = 0;        // = 0;
	/**
	* The base stack element for this stack frame.  If in a Lua function
	* then this is the element indexed by operand field 0; if in a Java
	* functipn then this is the element indexed by Lua.value(1).
	*/
	private _base:number = 0;     // = 0;

	//TODO:public
	private _nCcalls:number = 0;  // = 0;
	/** Instruction to resume execution at.  Index into code array. */
	private _savedpc:number = 0;  // = 0;
	/**
	* Vector of CallInfo records.  Actually it's a Stack which is a
	* subclass of Vector, but it mostly the Vector methods that are used.
	*/
	private _civ:Stack = new Stack();
	
	//TODO:
	private initCiv():void
	{
		this._civ.addElement(new CallInfo());
	}
	
	/** CallInfo record for currently active function. */
	private __ci():CallInfo
	{
		return this._civ.lastElement() as CallInfo;
	}

	/** Open Upvalues.  All UpVal objects that reference the VM stack.
	* openupval is a java.util.Vector of UpVal stored in order of stack
	* slot index: higher stack indexes are stored at higher Vector
	* positions.
	*/
	private _openupval:UpVal[] = new Array();//Vector = new Vector();

	private _hookcount:number = 0;
	private _basehookcount:number = 0;
	private _allowhook:boolean = true;
	private _hook:Hook | null = null;
	private _hookmask:number = 0;

	/** Number of list items to accumulate before a SETLIST instruction. */
	public static LFIELDS_PER_FLUSH:number = 50;
	
	/** Limit for table tag-method chains (to avoid loops) */
	private static MAXTAGLOOP:number = 100;

	/**
	* The current error handler (set by {@link #pcall}).  A Lua
	* function to call.
	*/
	private _errfunc:Object | null = null;

	/**
	* thread activation status.
	*/
	private _status:number = 0;

	/** Nonce object used by pcall and friends (to detect when an
	* exception is a Lua error). */
	private static LUA_ERROR:string = "";

	/** Metatable for primitive types.  Shared between all threads. */
	private _metatable:LuaTable[]; //LuaTable[]

	/**
	 * Maximum number of local variables per function.  As per
	 * LUAI_MAXVARS from "luaconf.h".  Default access so that {@link
	 * FuncState} can see it.
	 */
	public static MAXVARS:number = 200;
	public static MAXSTACK:number = 250;
	public static MAXUPVALUES:number = 60;

	/**
	 * Stored in Slot.r to denote a numeric value (which is stored at 
	 * Slot.d).
	 */
	public static NUMBER:Object = new Object();
	
	/**
	 * Spare Slot used for a temporary.
	 */
	private static SPARE_SLOT:Slot = new Slot();

	/**
	* Registry key for loaded modules.
	*/
	public static LOADED:string = "_LOADED";
	
	/**
	 * Used to construct a Lua thread that shares its global state with
	 * another Lua state.
	 */
	public constructor(L?:Lua | null) 
	{
		if (L == null)
		{
			//Creates a fresh Lua state.
			this._global = new LuaTable();
			this._registry = new LuaTable();
			this._metatable = new Array(Lua.NUM_TAGS); //LuaTable[]
			this._main = this;				
		}
		else
		{
			// Copy the global state, that's shared across all threads that
			// share the same main thread, into the new Lua thread.
			// Any more than this and the global state should be shunted to a
			// separate object (as it is in PUC-Rio).
			this._global = L._global;
			this._registry = L._registry;
			this._metatable = L._metatable;
			this._main = (L == null ? L : this);
		}
		
		//TODO:附加操作，初始化CallInfo堆栈
		this.initCiv();
	}
	
	//////////////////////////////////////////////////////////////////////
	// Public API

	/**
	 * Creates a fresh Lua state.
	 */
	/*
	public function Lua()
	{
		this._global = new LuaTable();
		this._registry = new LuaTable();
		this._metatable = new Array(NUM_TAGS); //LuaTable[]
		this._main = this;
	}
	*/

	/**
	* Equivalent of LUA_MULTRET.
	*/
	// Required, by vmPoscall, to be negative.
	public static MULTRET:number = -1;
	/**
	* The Lua <code>nil</code> value.
	*/
	public static NIL:Object = new Object();

	// Lua type tags, from lua.h
	/** Lua type tag, representing no stack value. */
	public static TNONE:number         = -1;
	/** Lua type tag, representing <code>nil</code>. */
	public static TNIL:number          = 0;
	/** Lua type tag, representing boolean. */
	public static TBOOLEAN:number      = 1;
	// TLIGHTUSERDATA not available.  :todo: make available?
	/** Lua type tag, representing numbers. */
	public static TNUMBER:number       = 3;
	/** Lua type tag, representing strings. */
	public static TSTRING:number       = 4;
	/** Lua type tag, representing tables. */
	public static TTABLE:number        = 5;
	/** Lua type tag, representing functions. */
	public static TFUNCTION:number     = 6;
	/** Lua type tag, representing userdata. */
	public static TUSERDATA:number     = 7;
	/** Lua type tag, representing threads. */
	public static TTHREAD:number       = 8;
	/** 
	 * Number of type tags.  Should be one more than the
	 * last entry in the list of tags.
	 * 类型标签个数
	 */
	private static NUM_TAGS:number     = 9;
	/** Names for above type tags, starting from {@link #TNIL}.
	* Equivalent to luaT_typenames.
	*/
	private static TYPENAME:string[] =  //final String[]
	[
		"nil", "boolean", "userdata", "number",
		"string", "table", "function", "userdata", "thread"
	];

	/**
	* Minimum stack size that Lua Java functions gets.  May turn out to
	* be silly / redundant.
	*/
	public static MINSTACK:number = 20;

	/** Status code, returned from pcall and friends, that indicates the
	* thread has yielded.
	*/
	public static YIELD:number         = 1;
	/** Status code, returned from pcall and friends, that indicates
	* a runtime error.
	*/
	public static ERRRUN:number        = 2;
	/** Status code, returned from pcall and friends, that indicates
	* a syntax error.
	*/
	public static ERRSYNTAX:number     = 3;
	/** Status code, returned from pcall and friends, that indicates
	* a memory allocation error.
	*/
	private static ERRMEM:number        = 4;
	/** Status code, returned from pcall and friends, that indicates
	* an error whilst running the error handler function.
	*/
	public static ERRERR:number        = 5;
	/** Status code, returned from loadFile and friends, that indicates
	* an IO error.
	*/
	public static ERRFILE:number       = 6;

	// Enums for gc().
	/** Action, passed to {@link #gc}, that requests the GC to stop. */
	public static GCSTOP:number        = 0;
	/** Action, passed to {@link #gc}, that requests the GC to restart. */
	public static GCRESTART:number     = 1;
	/** Action, passed to {@link #gc}, that requests a full collection. */
	public static GCCOLLECT:number     = 2;
	/** Action, passed to {@link #gc}, that returns amount of memory
	 * (in Kibibytes) in use (by the entire Java runtime).
	 */
	public static GCCOUNT:number       = 3;
	/** Action, passed to {@link #gc}, that returns the remainder of
	 * dividing the amount of memory in use by 1024.
	 */
	public static GCCOUNTB:number      = 4;
	/** Action, passed to {@link #gc}, that requests an incremental
	 * garbage collection be performed.
	 */
	public static GCSTEP:number        = 5;
	/** Action, passed to {@link #gc}, that sets a new value for the
	 * <var>pause</var> of the collector.
	 */
	public static GCSETPAUSE:number    = 6;
	/** Action, passed to {@link #gc}, that sets a new values for the
	 * <var>step multiplier</var> of the collector.
	 */
	public static GCSETSTEPMUL:number  = 7;

	// Some of the hooks, etc, aren't implemented, so remain private.
	private static HOOKCALL:number = 0;
	private static HOOKRET:number = 1;
	private static HOOKLINE:number = 2;
	/**
	 * When {@link Hook} callback is called as a line hook, its
	 * <var>ar.event</var> field is <code>HOOKCOUNT</code>.
	 */
	public static HOOKCOUNT:number = 3;
	private static HOOKTAILRET:number = 4;

	private static MASKCALL:number = 1 << Lua.HOOKCALL;
	private static MASKRET:number  = 1 << Lua.HOOKRET;
	private static MASKLINE:number = 1 << Lua.HOOKLINE;
	/**
	* Bitmask that specifies count hook in call to {@link #setHook}.
	*/
	public static MASKCOUNT:number = 1 << Lua.HOOKCOUNT;
	
	/**
	 * Calls a Lua value.  Normally this is called on functions, but the
	 * semantics of Lua permit calls on any value as long as its metatable
	 * permits it.
	 *
	 * In order to call a function, the function must be
	 * pushed onto the stack, then its arguments must be
	 * {@link #push pushed} onto the stack; the first argument is pushed
	 * directly after the function,
	 * then the following arguments are pushed in order (direct
	 * order).  The parameter <var>nargs</var> specifies the number of
	 * arguments (which may be 0).
	 *
	 * When the function returns the function value on the stack and all
	 * the arguments are removed from the stack and replaced with the
	 * results of the function, adjusted to the number specified by
	 * <var>nresults</var>.  So the first result from the function call will
	 * be at the same index where the function was immediately prior to
	 * calling this method.
	 *
	 * @param nargs     The number of arguments in this function call.
	 * @param nresults  The number of results required.
	 */
	public call(nargs:number, nresults:number):void
	{
		this.apiChecknelems(nargs+1);
		var func:number = this._stackSize - (nargs + 1);
		this.vmCall(func, nresults);
	}

	/**
	 * Closes a Lua state.  In this implementation, this method does
	 * nothing.
	 */
	public close():void
	{
		
	}

	/**
	 * Concatenate values (usually strings) on the stack.
	 * <var>n</var> values from the top of the stack are concatenated, as
	 * strings, and replaced with the resulting string.
	 * @param n  the number of values to concatenate.
	 */
	public concat(n:number):void
	{
		this.apiChecknelems(n);
		if (n >= 2)
		{
			this.vmConcat(n, (this._stackSize - this._base) - 1);
			this.pop(n-1);
		}
		else if (n == 0)          // push empty string
		{
			this.pushString("");
		} // else n == 1; nothing to do
	}

	/**
	* Creates a new empty table and returns it.
	* @param narr  number of array elements to pre-allocate.
	* @param nrec  number of non-array elements to pre-allocate.
	* @return a fresh table.
	* @see #newTable
	*/
	public createTable(narr:number, nrec:number):LuaTable
	{
		var t:LuaTable = new LuaTable();
		t.init(narr, nrec);
		return t;
	}

	/**
	 * Dumps a function as a binary chunk.
	 * @param function  the Lua function to dump.
	 * @param writer    the stream that receives the dumped binary.
	 * @throws IOException when writer does.
	 */
	public static dump(_function:Object | null, writer:OutputStream | null):void 
		//throws IOException
	{
		if (!(_function instanceof LuaFunction))
		{
			throw new IOException("Cannot dump " + this.typeName(this.____type(_function)));
		}
		var f:LuaFunction = _function as LuaFunction;
		this.uDump(f.proto, writer, false);
	}

	/**
	 * Tests for equality according to the semantics of Lua's
	 * <code>==</code> operator (so may call metamethods).
	 * @param o1  a Lua value.
	 * @param o2  another Lua value.
	 * @return true when equal.
	 */
	public equal(o1:Object, o2:Object):boolean
	{
		if (o1 instanceof Number || typeof(o1) == 'number')
		{
			return (o1 as Number)===(o2);
		}
		return this.vmEqualRef(o1, o2);
	}

	/**
	 * Generates a Lua error using the error message.
	 * @param message  the error message.
	 * @return never.
	 */
	public error(message:Object | null):number
	{
		return this.gErrormsg(message);
	}

	/**
	* Control garbage collector.  Note that in Jill most of the options
	* to this function make no sense and they will not do anything.
	* @param what  specifies what GC action to take.
	* @param data  data that may be used by the action.
	* @return varies.
	*/
	public gc(what:number, data:number):number
	{
		var rt:Runtime;

		switch (what)
		{
			case Lua.GCSTOP:
				return 0;
				
			case Lua.GCRESTART:
			case Lua.GCCOLLECT:
			case Lua.GCSTEP:
				SystemUtil.gc();
				return 0;
			
			case Lua.GCCOUNT:
				rt = Runtime.getRuntime();
				return ((rt.totalMemory() - rt.freeMemory()) / 1024) as number;
			
			case Lua.GCCOUNTB:
				rt = Runtime.getRuntime();
				return ((rt.totalMemory() - rt.freeMemory()) % 1024) as number;
			
			case Lua.GCSETPAUSE:
			case Lua.GCSETSTEPMUL:
				return 0;
		}
		return 0;
	}

	/**
	* Returns the environment table of the Lua value.
	* @param o  the Lua value.
	* @return its environment table.
	*/
	public getFenv(o:Object):LuaTable | null
	{
		if (o instanceof LuaFunction)
		{
			var f1:LuaFunction = o as LuaFunction;
			return f1.env;
		}
		if (o instanceof LuaJavaCallback)
		{
			var f2:LuaJavaCallback = o as LuaJavaCallback;
			// :todo: implement this case.
			return null;
		}
		
		if (o instanceof LuaUserdata)
		{
			var u:LuaUserdata = o as LuaUserdata;
			return u.env;
		}
		if (o instanceof Lua)
		{
			var l:Lua = o as Lua;
			return l.global;
		}
		return null;
	}

	/**
	 * Get a field from a table (or other object).
	 * @param t      The object whose field to retrieve.
	 * @param field  The name of the field.
	 * @return  the Lua value
	 */
	public getField(t:Object | null, field:string | null):Object | null
	{
		return this.getTable(t, field);
	}

	/**
	 * Get a global variable.
	 * @param name  The name of the global variable.
	 * @return  The value of the global variable.
	 */
	public getGlobal(name:string):Object | null
	{
		return this.getField(this._global, name);
	}

	/**
	 * Gets the global environment.  The global environment, where global
	 * variables live, is returned as a <code>LuaTable</code>.  Note that
	 * modifying this table has exactly the same effect as creating or
	 * changing global variables from within Lua.
	 * @return  The global environment as a table.
	 */
	public getGlobals():LuaTable
	{
		return this._global;
	}

	/** Get metatable.
	 * @param o  the Lua value whose metatable to retrieve.
	 * @return The metatable, or null if there is no metatable.
	 */
	public getMetatable(o:Object | null):LuaTable | null
	{
		var mt:LuaTable | null;

		if (o instanceof LuaTable)
		{
			var t:LuaTable = o as LuaTable;
			mt = t.metatable;
		}
		else if (o instanceof LuaUserdata)
		{
			var u:LuaUserdata = o as LuaUserdata;
			mt = u.metatable;
		}
		else
		{
			mt = this._metatable[Lua.____type(o)];
		}
		return mt;
	}

	/**
	 * Gets the registry table.
	 */
	public getRegistry():LuaTable
	{
		return this._registry;
	}

	/**
	 * Indexes into a table and returns the value.
	 * @param t  the Lua value to index.
	 * @param k  the key whose value to return.
	 * @return the value t[k].
	 */
	public getTable(t:Object | null, k:Object | null):Object | null
	{
		var s:Slot = new Slot();
		s.init2(k);
		var v:Slot = new Slot();
		this.vmGettable(t, s, v);
		return v.asObject();
	}

	/**
	 * Gets the number of elements in the stack.  If the stack is not
	 * empty then this is the index of the top-most element.
	 * @return number of stack elements.
	*/
	public getTop():number
	{
		return this._stackSize - this._base;
	}

	/**
	 * Insert Lua value into stack immediately at specified index.  Values
	 * in stack at that index and higher get pushed up.
	 * @param o    the Lua value to insert into the stack.
	 * @param idx  the stack index at which to insert.
	 */
	public insert(o:Object, idx:number):void
	{
		idx = this.absIndexUnclamped(idx);
		this.stackInsertAt(o, idx);
	}

	/**
	 * Tests that an object is a Lua boolean.
	 * @param o  the Object to test.
	 * @return true if and only if the object is a Lua boolean.
	 */
	public static isBoolean(o:Object):boolean
	{
		return o instanceof Boolean || typeof(o) == 'boolean';
	}

	/**
	 * Tests that an object is a Lua function implementated in Java (a Lua
	 * Java Function).
	 * @param o  the Object to test.
	 * @return true if and only if the object is a Lua Java Function.
	 */
	public static isJavaFunction(o:Object | null):boolean
	{
		return o instanceof LuaJavaCallback;
	}

	/**
	 * Tests that an object is a Lua function (implemented in Lua or
	 * Java).
	 * @param o  the Object to test.
	 * @return true if and only if the object is a function.
	 */
	public static isFunction(o:Object | null):boolean
	{
		return o instanceof LuaFunction ||
			o instanceof LuaJavaCallback;
	}

	/**
	 * Tests that a Lua thread is the main thread.
	 * @return true if and only if is the main thread.
	 */
	public isMain():boolean
	{
		return this == this._main;
	}

	/**
	 * Tests that an object is Lua <code>nil</code>.
	 * @param o  the Object to test.
	 * @return true if and only if the object is Lua <code>nil</code>.
	 */
	public static isNil(o:Object | null):boolean
	{
		return Lua.NIL == o;
	}

	/**
	 * Tests that an object is a Lua number or a string convertible to a
	 * number.
	 * @param o  the Object to test.
	 * @return true if and only if the object is a number or a convertible string.
	 */
	public static isNumber(o:Object | null):boolean
	{
		Lua.SPARE_SLOT.setObject(o);
		return Lua.tonumber(Lua.SPARE_SLOT, Lua.NUMOP);
	}

	/**
	 * Tests that an object is a Lua string or a number (which is always
	 * convertible to a string).
	 * @param o  the Object to test.
	 * @return true if and only if object is a string or number.
	 */
	public static isString(o:Object | null):boolean
	{
		return o instanceof String || o instanceof Number || typeof(o) == 'string' || typeof(o) == 'number';
	}

	/**
	 * Tests that an object is a Lua table.
	 * @param o  the Object to test.
	 * @return <code>true</code> if and only if the object is a Lua table.
	 */
	public static isTable(o:Object | null):boolean
	{
		return o instanceof LuaTable;
	}

	/**
	 * Tests that an object is a Lua thread.
	 * @param o  the Object to test.
	 * @return <code>true</code> if and only if the object is a Lua thread.
	 */
	public static isThread(o:Object):boolean
	{
		return o instanceof Lua;
	}

	/**
	 * Tests that an object is a Lua userdata.
	 * @param o  the Object to test.
	 * @return true if and only if the object is a Lua userdata.
	 */
	public static isUserdata(o:Object):boolean
	{
		return o instanceof LuaUserdata;
	}

	/**
	 * <p>
	 * Tests that an object is a Lua value.  Returns <code>true</code> for
	 * an argument that is a Jill representation of a Lua value,
	 * <code>false</code> for Java references that are not Lua values.
	 * For example <code>isValue(new LuaTable())</code> is
	 * <code>true</code>, but <code>isValue(new Object[] { })</code> is
	 * <code>false</code> because Java arrays are not a representation of
	 * any Lua value.
	 * </p>
	 * <p>
	 * PUC-Rio Lua provides no
	 * counterpart for this method because in their implementation it is
	 * impossible to get non Lua values on the stack, whereas in Jill it
	 * is common to mix Lua values with ordinary, non Lua, Java objects.
	 * </p>
	 * @param o  the Object to test.
	 * @return true if and if it represents a Lua value.
	 */
	public static isValue(o:Object):boolean
	{
		return o == Lua.NIL ||
			o instanceof Boolean || typeof(o) == 'boolean' ||
			o instanceof String || typeof(o) == 'string' ||
			o instanceof Number || typeof(o) == 'number' ||
			o instanceof LuaFunction ||
			o instanceof LuaJavaCallback ||
			o instanceof LuaTable ||
			o instanceof LuaUserdata;
	}

	/**
	 * Compares two Lua values according to the semantics of Lua's
	 * <code>&lt;</code> operator, so may call metamethods.
	 * @param o1  the left-hand operand.
	 * @param o2  the right-hand operand.
	 * @return true when <code>o1 < o2</code>.
	 */
	public lessThan(o1:Object | null, o2:Object | null):boolean
	{
		var a:Slot = new Slot();
		a.init2(o1);
		var b:Slot = new Slot();
		b.init2(o2);
		return this.vmLessthan(a, b);
	}

	/**
	 * <p>
	 * Loads a Lua chunk in binary or source form.
	 * Comparable to C's lua_load.  If the chunk is determined to be
	 * binary then it is loaded directly.  Otherwise the chunk is assumed
	 * to be a Lua source chunk and compilation is required first; the
	 * <code>InputStream</code> is used to create a <code>Reader</code>
	 * using the UTF-8 encoding
	 * (using a second argument of <code>"UTF-8"</code> to the
	 * {@link java.io.InputStreamReader#InputStreamReader(java.io.InputStream,
	 * java.lang.String)}
	 * constructor) and the Lua source is compiled.
	 * </p>
	 * <p>
	 * If successful, The compiled chunk, a Lua function, is pushed onto
	 * the stack and a zero status code is returned.  Otherwise a non-zero
	 * status code is returned to indicate an error and the error message
	 * is pushed onto the stack.
	 * </p>
	 * @param in         The binary chunk as an InputStream, for example from
	 *                   {@link Class#getResourceAsStream}.
	 * @param chunkname  The name of the chunk.
	 * @return           A status code.
	 */
	public load(_in:InputStream, chunkname:string | null):number
	{
		var li:LuaInternal = new LuaInternal();
		li.init1(_in, chunkname);
		this.pushObject(li);
		return this.pcall(0, 1, null);
	}

	/**
	 * Loads a Lua chunk in source form.
	 * Comparable to C's lua_load.  This method takes a {@link
	 * java.io.Reader} parameter,
	 * and is normally used to load Lua chunks in source form.
	 * However, it if the input looks like it is the output from Lua's
	 * <code>string.dump</code> function then it will be processed as a
	 * binary chunk.
	 * In every other respect this method is just like {@link
	 * #load(InputStream, String)}.
	 * 废弃，合并入load
	 * @param in         The source chunk as a Reader, for example from
	 *                   <code>java.io.InputStreamReader(Class.getResourceAsStream())</code>.
	 * @param chunkname  The name of the chunk.
	 * @return           A status code.
	 * @see java.io.InputStreamReader
	 */
	public __load(_in:Reader, chunkname:string | null):number
	{
		var li:LuaInternal = new LuaInternal();
		li.init2(_in, chunkname);
		this.pushObject(li);
		return this.pcall(0, 1, null);
	}

	/**
	 * Slowly get the next key from a table.  Unlike most other functions
	 * in the API this one uses the stack.  The top-of-stack is popped and
	 * used to find the next key in the table at the position specified by
	 * index.  If there is a next key then the key and its value are
	 * pushed onto the stack and <code>true</code> is returned.
	 * Otherwise (the end of the table has been reached)
	 * <code>false</code> is returned.
	 * @param idx  stack index of table.
	 * @return  true if and only if there are more keys in the table.
	 * @deprecated Use {@link #tableKeys} enumeration protocol instead.
	 */
	public next(idx:number):boolean
	{
		var o:Object | null = this.value(idx);
		// :todo: api check
		var t:LuaTable = o as LuaTable;
		var key:Object | null = this.value(-1);
		this.pop(1);
		var e:Enumeration = t.keys();
		if (key == Lua.NIL)
		{
			if (e.hasMoreElements())
			{
				key = e.nextElement();
				this.pushObject(key);
				this.pushObject(t.getlua(key));
				return true;
			}
			return false;
		}
		while (e.hasMoreElements())
		{
			var k:Object | null = e.nextElement();
			if (k===(key))
			{
				if (e.hasMoreElements())
				{
					key = e.nextElement();
					this.pushObject(key);
					this.pushObject(t.getlua(key));
					return true;
				}
				return false;
			}
		}
		// protocol error which we could potentially diagnose.
		return false;
	}

	/**
	 * Creates a new empty table and returns it.
	 * @return a fresh table.
	 * @see #createTable
	 */
	public newTable():LuaTable
	{
		return new LuaTable();
	}

	/**
	 * Creates a new Lua thread and returns it.
	 * @return a new Lua thread.
	 */
	public newThread():Lua
	{
		return new Lua(this);
	}

	/**
	 * Wraps an arbitrary Java reference in a Lua userdata and returns it.
	 * @param ref  the Java reference to wrap.
	 * @return the new LuaUserdata.
	 */
	public newUserdata(ref:Object):LuaUserdata
	{
		return new LuaUserdata(ref);
	}

	/**
	 * Return the <em>length</em> of a Lua value.  For strings this is
	 * the string length; for tables, this is result of the <code>#</code>
	 * operator; for other values it is 0.
	 * @param o  a Lua value.
	 * @return its length.
	 */
	public static objLen(o:Object | null):number
	{
		if (o instanceof String || typeof(o) == 'string')
		{
			var s:String = o as String;
			return s.length;
		}
		if (o instanceof LuaTable)
		{
			var t:LuaTable = o as LuaTable;
			return t.getn();
		}
		if (o instanceof Number || typeof(o) == 'number')
		{
			return this.vmTostring(o)!.length;
		}
		return 0;
	}


	/**
	 * <p>
	 * Protected {@link #call}.  <var>nargs</var> and
	 * <var>nresults</var> have the same meaning as in {@link #call}.
	 * If there are no errors during the call, this method behaves as
	 * {@link #call}.  Any errors are caught, the error object (usually
	 * a message) is pushed onto the stack, and a non-zero error code is
	 * returned.
	 * </p>
	 * <p>
	 * If <var>er</var> is <code>null</code> then the error object that is
	 * on the stack is the original error object.  Otherwise
	 * <var>ef</var> specifies an <em>error handling function</em> which
	 * is called when the original error is generated; its return value
	 * becomes the error object left on the stack by <code>pcall</code>.
	 * </p>
	 * @param nargs     number of arguments.
	 * @param nresults  number of result required.
	 * @param ef        error function to call in case of error.
	 * @return 0 if successful, else a non-zero error code.
	 */
	public pcall(nargs:number, nresults:number, ef:Object | null):number
	{
		this.apiChecknelems(nargs + 1);
		var restoreStack:number = this._stackSize - (nargs + 1);
		// Most of this code comes from luaD_pcall
		var restoreCi:number = this._civ.size;
		var oldnCcalls:number = this._nCcalls;
		var old_errfunc:Object | null = this._errfunc;
		this._errfunc = ef;
		var old_allowhook:boolean = this._allowhook;
		var errorStatus:number = 0;
		try
		{
			this.call(nargs, nresults);
		}
		catch (e)
		{
			if (e instanceof LuaError) {
				console.log((e as LuaError).stack);
				this.fClose(restoreStack);   // close eventual pending closures
				this.dSeterrorobj(e.errorStatus, restoreStack);
				this._nCcalls = oldnCcalls;
				this._civ.size = restoreCi;
				var ci:CallInfo = this.__ci();
				this._base = ci.base;
				this._savedpc = ci.savedpc;
				this._allowhook = old_allowhook;
				errorStatus = e.errorStatus;
			} else if (e instanceof OutOfMemoryError) {
				console.log((e as OutOfMemoryError).stack);
				this.fClose(restoreStack);     // close eventual pending closures
				this.dSeterrorobj(Lua.ERRMEM, restoreStack);
				this._nCcalls = oldnCcalls;
				this._civ.size = restoreCi;
				var ci2:CallInfo = this.__ci();
				this._base = ci2.base;
				this._savedpc = ci2.savedpc;
				this._allowhook = old_allowhook;
				errorStatus = Lua.ERRMEM;
			}
		}
		/**/
		this._errfunc = old_errfunc;
		return errorStatus;
	}

	/**
	 * Removes (and discards) the top-most <var>n</var> elements from the stack.
	 * @param n  the number of elements to remove.
	 */
	public pop(n:number):void
	{
		if (n < 0)
		{
			throw new IllegalArgumentException();
		}
		this.stacksetsize(this._stackSize - n);
	}

	/**
	 * Pushes a value onto the stack in preparation for calling a
	 * function (or returning from one).  See {@link #call} for
	 * the protocol to be used for calling functions.  See {@link
	 * #pushNumber} for pushing numbers, and {@link #pushValue} for
	 * pushing a value that is already on the stack.
	 * @param o  the Lua value to push.
	 */
	public pushObject(o:Object | null):void
	{
		// see also a private overloaded version of this for Slot.
		this.stackAdd(o);
	}

	/**
	 * Push boolean onto the stack.
	 * @param b  the boolean to push.
	 */
	public pushBoolean(b:boolean):void
	{
		this.pushObject(Lua.valueOfBoolean(b));
	}

	/**
	 * Push literal string onto the stack.
	 * @param s  the string to push.
	 */
	public pushLiteral(s:String):void
	{
		this.pushObject(s);
	}

	/** Push nil onto the stack. */
	public pushNil():void
	{
		this.pushObject(Lua.NIL);
	}

	/**
	* Pushes a number onto the stack.  See also {@link #push}.
	* @param d  the number to push.
	*/
	public pushNumber(d:number):void
	{
		// :todo: optimise to avoid creating Double instance
		this.pushObject(/*new Number(d)*/d);
	}

	/**
	 * Push string onto the stack.
	 * @param s  the string to push.
	 */
	public pushString(s:String | null):void
	{
		this.pushObject(s);
	}

	/**
	 * Copies a stack element onto the top of the stack.
	 * Equivalent to <code>L.push(L.value(idx))</code>.
	 * @param idx  stack index of value to push.
	 */
	public pushValue(idx:number):void
	{
		// :todo: optimised to avoid creating Double instance
		this.pushObject(this.value(idx));
	}

	/**
	 * Implements equality without metamethods.
	 * @param o1  the first Lua value to compare.
	 * @param o2  the other Lua value.
	 * @return  true if and only if they compare equal.
	 */
	public static rawEqual(o1:Object | null, o2:Object | null):boolean
	{
		return Lua.oRawequal(o1, o2);
	}

	/**
	 * Gets an element from a table, without using metamethods.
	 * @param t  The table to access.
	 * @param k  The index (key) into the table.
	 * @return The value at the specified index.
	 */
	public static rawGet(t:Object | null, k:Object | null):Object | null
	{
		var table:LuaTable = t as LuaTable;
		return table.getlua(k);
	}

	/**
	* Gets an element from an array, without using metamethods.
	* @param t  the array (table).
	* @param i  the index of the element to retrieve.
	* @return  the value at the specified index.
	*/
	public static rawGetI(t:Object | null, i:number):Object | null
	{
		var table:LuaTable = t as LuaTable;
		return table.getnum(i);
	}

	/**
	 * Sets an element in a table, without using metamethods.
	 * @param t  The table to modify.
	 * @param k  The index into the table.
	 * @param v  The new value to be stored at index <var>k</var>.
	 */
	public rawSet(t:Object | null, k:Object | null, v:Object | null):void
	{
		var table:LuaTable = t as LuaTable;
		table.putluaObj(this, k, v);
	}

	/**
	* Sets an element in an array, without using metamethods.
	* @param t  the array (table).
	* @param i  the index of the element to set.
	* @param v  the new value to be stored at index <var>i</var>.
	*/
	public rawSetI(t:Object | null, i:number, v:Object | null):void
	{
		this.apiCheck(t instanceof LuaTable);
		var h:LuaTable = t as LuaTable;
		h.putnum(i, v);
	}

	/**
	 * Register a {@link LuaJavaCallback} as the new value of the global
	 * <var>name</var>.
	 * @param name  the name of the global.
	 * @param f     the LuaJavaCallback to register.
	 */
	public register(name:String, f:LuaJavaCallback):void
	{
		this.setGlobal(name, f);
	}

	/**
	 * Starts and resumes a Lua thread.  Threads can be created using
	 * {@link #newThread}.  Once a thread has begun executing it will
	 * run until it either completes (with error or normally) or has been
	 * suspended by invoking {@link #yield}.
	 * @param narg  Number of values to pass to thread.
	 * @return Lua.YIELD, 0, or an error code.
	 */
	public resume(narg:number):number
	{
		if (this.status != Lua.YIELD)
		{
			if (this.status != 0)
				return this.resume_error("cannot resume dead coroutine");
			else if (this._civ.size != 1)
				return this.resume_error("cannot resume non-suspended coroutine");
		}
		// assert errfunc == 0 && nCcalls == 0;
		var errorStatus:number = 0;
	protect:
		try
		{
			// This block is equivalent to resume from ldo.c
			var firstArg:number = this._stackSize - narg;
			if (this.status == 0)  // start coroutine?
			{
				// assert civ.size() == 1 && firstArg > base);
				if (this.vmPrecall(firstArg - 1, Lua.MULTRET) != Lua.PCRLUA)
					break protect;
			}
			else      // resuming from previous yield
			{
				// assert status == YIELD;
				this.status = 0;
				if (!this.isLua(this.__ci()))       // 'common' yield
				{
					// finish interrupted execution of 'OP_CALL'
					// assert ...
					if (this.vmPoscall(firstArg))      // complete it...
						this.stacksetsize(this.__ci().top);  // and correct top
				}
				else    // yielded inside a hook: just continue its execution
					this._base = this.__ci().base;
			}
			this.vmExecute(this._civ.size - 1);
		}
		catch (e)
		{
			if (e instanceof LuaError) {
				console.log((e as LuaError).stack);
				this.status = (e as LuaError).errorStatus;   // mark thread as 'dead'
				this.dSeterrorobj(e.errorStatus, this._stackSize);
				this.__ci().top = this._stackSize;
			}
		}
		return this.status;
	}

	/**
	* Set the environment for a function, thread, or userdata.
	* @param o      Object whose environment will be set.
	* @param table  Environment table to use.
	* @return true if the object had its environment set, false otherwise.
	*/
	public setFenv(o:Object | null, table:Object | null):boolean
	{
		// :todo: consider implementing common env interface for
		// LuaFunction, LuaJavaCallback, LuaUserdata, Lua.  One cast to an
		// interface and an interface method call may be shorter
		// than this mess.
		var t:LuaTable = table as LuaTable;

		if (o instanceof LuaFunction)
		{
			var f1:LuaFunction = o as LuaFunction;
			f1.env = t;
			return true;
		}
		if (o instanceof LuaJavaCallback)
		{
			var f2:LuaJavaCallback = o as LuaJavaCallback;
			// :todo: implement this case.
			return false;
		}
		if (o instanceof LuaUserdata)
		{
			var u:LuaUserdata = o as LuaUserdata;
			u.env = t;
			return true;
		}
		if (o instanceof Lua)
		{
			var l:Lua = o as Lua;
			l.global = t;
			return true;
		}
		return false;
	}

	/**
	 * Set a field in a Lua value.
	 * @param t     Lua value of which to set a field.
	 * @param name  Name of field to set.
	 * @param v     new Lua value for field.
	 */
	public setField(t:Object | null, name:string | null, v:Object | null):void
	{
		var s:Slot = new Slot();
		s.init2(name as Object);
		this.vmSettable(t, s, v);
	}

	/**
	* Sets the metatable for a Lua value.
	* @param o   Lua value of which to set metatable.
	* @param mt  The new metatable.
	*/
	public setMetatable(o:Object | null, mt:Object | null):void
	{
		if (Lua.isNil(mt))
		{
			mt = null;
		}
		else
		{
			this.apiCheck(mt instanceof LuaTable);
		}
		var mtt:LuaTable = mt as LuaTable;
		if (o instanceof LuaTable)
		{
			var t:LuaTable = o as LuaTable;
			t.setMetatable(mtt);
		}
		else if (o instanceof LuaUserdata)
		{
			var u:LuaUserdata = o as LuaUserdata;
			u.metatable = mtt;
		}
		else
		{
			this._metatable[Lua.____type(o)] = mtt;
		}
	}

	/**
	 * Set a global variable.
	 * @param name   name of the global variable to set.
	 * @param value  desired new value for the variable.
	 */
	public setGlobal(name:String, value:Object):void
	{
		var s:Slot = new Slot();
		s.init2(name as Object);
		this.vmSettable(this._global, s, value);
	}

	/**
	 * Does the equivalent of <code>t[k] = v</code>.
	 * @param t  the table to modify.
	 * @param k  the index to modify.
	 * @param v  the new value at index <var>k</var>.
	 */
	public setTable(t:Object, k:Object, v:Object):void
	{
		var s:Slot = new Slot();
		s.init2(k);
		this.vmSettable(t, s, v);
	}

	/**
	* Set the stack top.
	* @param n  the desired size of the stack (in elements).
	*/
	public setTop(n:number):void
	{
		if (n < 0)
		{
			throw new IllegalArgumentException();
		}
		this.stacksetsize(this._base + n);
	} 

	/**
	 * Status of a Lua thread.
	 * @return 0, an error code, or Lua.YIELD.
	 */
	public get status():number
	{
		return this._status;
	}

	public set status(status:number)
	{
		this._status = status;
	}
	
	/**
	 * Returns an {@link java.util.Enumeration} for the keys of a table.
	 * @param t  a Lua table.
	 * @return an Enumeration object.
	 */
	public tableKeys(t:Object):Enumeration
	{
		if (!(t instanceof LuaTable))
		{
			this.error("table required");
			// NOTREACHED
		}
		return (t as LuaTable).keys();
	}

	/**
	 * Convert to boolean.
	 * @param o  Lua value to convert.
	 * @return  the resulting primitive boolean.
	 */
	public toBoolean(o:Object | null):boolean
	{
		return !(o == Lua.NIL || o == false);
	}

	/**
	 * Convert to integer and return it.  Returns 0 if cannot be
	 * converted.
	 * @param o  Lua value to convert.
	 * @return  the resulting int.
	 */
	public toInteger(o:Object):number
	{
		return this.toNumber(o) as number;
	}

	/**
	 * Convert to number and return it.  Returns 0 if cannot be
	 * converted.
	 * @param o  Lua value to convert.
	 * @return  The resulting number.
	 */
	public toNumber(o:Object | null):number
	{
		Lua.SPARE_SLOT.setObject(o);
		if (Lua.tonumber(Lua.SPARE_SLOT, Lua.NUMOP))
		{
			return Lua.NUMOP[0];
		}
		return 0;
	}

	/**
	 * Convert to string and return it.  If value cannot be converted then
	 * <code>null</code> is returned.  Note that unlike
	 * <code>lua_tostring</code> this
	 * does not modify the Lua value.
	 * @param o  Lua value to convert.
	 * @return  The resulting string.
	 */
	public toString_(o:Object | null):string | null
	{
		return Lua.vmTostring(o);
	}

	/**
	 * Convert to Lua thread and return it or <code>null</code>.
	 * @param o  Lua value to convert.
	 * @return  The resulting Lua instance.
	 */
	public toThread(o:Object | null):Lua | null
	{
		if (!(o instanceof Lua))
		{
			return null;
		}
		return o as Lua;
	}

	/**
	 * Convert to userdata or <code>null</code>.  If value is a {@link
	 * LuaUserdata} then it is returned, otherwise, <code>null</code> is
	 * returned.
	 * @param o  Lua value.
	 * @return  value as userdata or <code>null</code>.
	 */
	public toUserdata(o:Object):LuaUserdata | null
	{
		if (o instanceof LuaUserdata)
		{
			return o as LuaUserdata;
		}
		return null;
	}

	/**
	 * Type of the Lua value at the specified stack index.
	 * @param idx  stack index to type.
	 * @return  the type, or {@link #TNONE} if there is no value at <var>idx</var>
	 */
	public /*static*/ type(idx:number):number
	{
		idx = this.absIndex(idx);
		if (idx < 0)
		{
			return Lua.TNONE;
		}
		return this.___type(this._stack[idx] as Slot);
	}

	/**
	 * 废弃，并入type
	 * @param	s
	 * @return
	 */
	private ___type(s:Slot):number
	{
		if (s.r == Lua.NUMBER)
		{
			return Lua.TNUMBER;
		}
		return Lua.____type(s.r);
	}

	/**
	 * Type of a Lua value.
	 * 废弃，并入type
	 * @param o  the Lua value whose type to return.
	 * @return  the Lua type from an enumeration.
	 */
	public static ____type(o:Object | null):number
	{
		if (o == Lua.NIL)
		{
			return Lua.TNIL;
		}
		else if (o instanceof Number || (typeof(o) == 'string'))
		{
			return Lua.TNUMBER;
		}
		else if (o instanceof Boolean || (typeof(o) == 'boolean'))
		{
			return Lua.TBOOLEAN;
		}
		else if (o instanceof String)
		{
			return Lua.TSTRING;
		}
		else if (o instanceof LuaTable)
		{
			return Lua.TTABLE;
		}
		else if (o instanceof LuaFunction || o instanceof LuaJavaCallback)
		{
			return Lua.TFUNCTION;
		}
		else if (o instanceof LuaUserdata)
		{
			return Lua.TUSERDATA;
		}
		else if (o instanceof Lua)
		{
			return Lua.TTHREAD;
		}
		return Lua.TNONE;
	}

	/**
	 * Name of type.
	 * @param type  a Lua type from, for example, {@link #type}.
	 * @return  the type's name.
	 */
	public static typeName(type:number):string
	{
		if (Lua.TNONE == type)
		{
			return "no value";
		}
		return Lua.TYPENAME[type];
	}

	/**
	 * Gets a value from the stack.
	 * If <var>idx</var> is positive and exceeds
	 * the size of the stack, {@link #NIL} is returned.
	 * @param idx  the stack index of the value to retrieve.
	 * @return  the Lua value from the stack.
	 */
	public value(idx:number):Object | null
	{
		idx = this.absIndex(idx);
		if (idx < 0)
		{
			return Lua.NIL;
		}
		return (this._stack[idx] as Slot).asObject();
	}

	/**
	* Converts primitive boolean into a Lua value.
	* @param b  the boolean to convert.
	* @return  the resulting Lua value.
	*/
	public static valueOfBoolean(b:boolean):Object
	{
		// If CLDC 1.1 had
		// <code>java.lang.Boolean.valueOf(boolean);</code> then I probably
		// wouldn't have written this.  This does have a small advantage:
		// code that uses this method does not need to assume that Lua booleans in
		// Jill are represented using Java.lang.Boolean.
		if (b)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	/**
	 * Converts primitive number into a Lua value.
	 * @param d  the number to convert.
	 * @return  the resulting Lua value.
	 */
	public static valueOfNumber(d:number):Object
	{
		// :todo: consider interning "common" numbers, like 0, 1, -1, etc.
		return new Number(d);
	}

	/**
	* Exchange values between different threads.
	* @param to  destination Lua thread.
	* @param n   numbers of stack items to move.
	*/
	public xmove(to:Lua | null, n:number):void
	{
		if (this == to)
		{
			return;
		}
		this.apiChecknelems(n);
		// L.apiCheck(from.G() == to.G());
		for (var i:number = 0; i < n; ++i)
		{
			to!.pushObject(this.value( -n + i));
		}
		this.pop(n);
	}

	/**
	 * Yields a thread.  Should only be called as the return expression
	 * of a Lua Java function: <code>return L.yield(nresults);</code>.
	 * A {@link RuntimeException} can also be thrown to yield.  If the
	 * Java code that is executing throws an instance of {@link
	 * RuntimeException} (direct or indirect) then this causes the Lua 
	 * thread to be suspended, as if <code>L.yield(0);</code> had been
	 * executed, and the exception is re-thrown to the code that invoked
	 * {@link #resume}.
	 * @param nresults  Number of results to return to {@link #resume}.
	 * @return  a secret value.
	 */
	public yield(nresults:number):number
	{
		if (this._nCcalls > 0)
			this.gRunerror("attempt to yield across metamethod/Java-call boundary");
		this._base = this._stackSize - nresults;     // protect stack slots below
		this.status = Lua.YIELD;
		return -1;
	}

	// Miscellaneous private functions.

	/** Convert from Java API stack index to absolute index.
	 * @return an index into <code>this.stack</code> or -1 if out of range.
	 */
	private absIndex(idx:number):number
	{
		var s:number = this._stackSize;

		if (idx == 0)
		{
			return -1;
		}
		if (idx > 0)
		{
			if (idx + this._base > s)
			{
				return -1;
			}
			return this._base + idx - 1;
		}
		// idx < 0
		if (s + idx < this._base)
		{
			return -1;
		}
		return s + idx;
	}

	/**
	* As {@link #absIndex} but does not return -1 for out of range
	* indexes.  Essential for {@link #insert} because an index equal
	* to the size of the stack is valid for that call.
	*/
	private absIndexUnclamped(idx:number):number
	{
		if (idx == 0)
		{
			return -1;
		}
		if (idx > 0)
		{
			return this._base + idx - 1;
		}
		// idx < 0
		return this._stackSize + idx;
	}


	//////////////////////////////////////////////////////////////////////
	// Auxiliary API

	// :todo: consider placing in separate class (or macroised) so that we
	// can change its definition (to remove the check for example).
	private apiCheck(cond:boolean):void
	{
		if (!cond)
		{
			throw new IllegalArgumentException();
		}
	}

	private apiChecknelems(n:number):void
	{
		this.apiCheck(n <= this._stackSize - this._base);
	}

	/**
	 * Checks a general condition and raises error if false.
	 * @param cond      the (evaluated) condition to check.
	 * @param numarg    argument index.
	 * @param extramsg  extra error message to append.
	 */
	public argCheck(cond:boolean, numarg:number, extramsg:String):void
	{
		if (cond)
		{
			return;
		}
		this.argError(numarg, extramsg);
	}

	/**
	 * Raise a general error for an argument.
	 * @param narg      argument index.
	 * @param extramsg  extra message string to append.
	 * @return never (used idiomatically in <code>return argError(...)</code>)
	 */
	public argError(narg:number, extramsg:String):number
	{
		// :todo: use debug API as per PUC-Rio
		if (true)
		{
			return this.error("bad argument " + narg + " (" + extramsg + ")");
		}
		return 0;
	}

	/**
	 * Calls a metamethod.  Pushes 1 result onto stack if method called.
	 * @param obj    stack index of object whose metamethod to call
	 * @param event  metamethod (event) name.
	 * @return  true if and only if metamethod was found and called.
	 */
	public callMeta(obj:number, event:string):boolean
	{
		var o:Object | null = this.value(obj);
		var ev:Object | null = this.getMetafield(o, event);
		if (ev == Lua.NIL)
		{
			return false;
		}
		this.pushObject(ev);
		this.pushObject(o);
		this.call(1, 1);
		return true;
	}

	/**
	 * Checks that an argument is present (can be anything).
	 * Raises error if not.
	 * @param narg  argument index.
	 */
	public checkAny(narg:number):void
	{
		if (this.type(narg) == Lua.TNONE)
		{
			this.argError(narg, "value expected");
		}
	}

	/**
	 * Checks is a number and returns it as an integer.  Raises error if
	 * not a number.
	 * @param narg  argument index.
	 * @return  the argument as an int.
	 */
	public checkInt(narg:number):number
	{
		return this.checkNumber(narg) as number;
	}

	/**
	 * Checks is a number.  Raises error if not a number.
	 * @param narg  argument index.
	 * @return  the argument as a double.
	 */
	public checkNumber(narg:number):number
	{
		var o:Object | null = this.value(narg);
		var d:number = this.toNumber(o);
		if (d == 0 && !Lua.isNumber(o))
		{
			this.tagError(narg, Lua.TNUMBER);
		}
		return d;
	}

	/**
	 * Checks that an optional string argument is an element from a set of
	 * strings.  Raises error if not.
	 * @param narg  argument index.
	 * @param def   default string to use if argument not present.
	 * @param lst   the set of strings to match against.
	 * @return an index into <var>lst</var> specifying the matching string.
	 */
	public checkOption(narg:number, def:string, lst:string[] /*String[] */):number
	{
		var name:string | null;

		if (def == null)
		{
			name = this.checkString(narg);
		}
		else
		{
			name = this.optString(narg, def);
		}
		for (var i:number = 0; i < lst.length; ++i)
		{
			if (lst[i]===(name))
			{
				return i;
			}
		}
		return this.argError(narg, "invalid option '" + name + "'");
	}

	/**
	 * Checks argument is a string and returns it.  Raises error if not a
	 * string.
	 * @param narg  argument index.
	 * @return  the argument as a string.
	 */
	public checkString(narg:number):string | null
	{
		var s:string | null = this.toString_(this.value(narg) as string);
		if (s == null)
		{
			this.tagError(narg, Lua.TSTRING);
		}
		return s;
	}

	/**
	 * Checks the type of an argument, raises error if not matching.
	 * @param narg  argument index.
	 * @param t     typecode (from {@link #type} for example).
	 */
	public checkType(narg:number, t:number):void
	{
		if (this.type(narg) != t)
		{
			this.tagError(narg, t);
		}
	}

	/**
	 * Loads and runs the given string.
	 * @param s  the string to run.
	 * @return  a status code, as per {@link #load}.
	 */
	public doString(s:string):number
	{
		var status:number = this.__load(Lua.stringReader(s), s);
		if (status == 0)
		{
			status = this.pcall(0, Lua.MULTRET, null);
		}
		return status;
	}

	private errfile(what:String, fname:String, e:Error):number
	{
		this.pushString("cannot " + what + " " + fname + ": " + e.toString());
		return Lua.ERRFILE;
	}

	/**
	 * Equivalent to luaL_findtable.  Instead of the table being passed on
	 * the stack, it is passed as the argument <var>t</var>.
	 * Likes its PUC-Rio equivalent however, this method leaves a table on
	 * the Lua stack.
	 */
	public findTable(t:LuaTable, fname:string | null, szhint:number):string | null
	{
		var e:number = 0;
		var i:number = 0;
		do
		{
			e = fname!.indexOf('.', i);
			var part:string;
			if (e < 0)
			{
				part = fname!.substring(i);
			}
			else
			{
				part = fname!.substring(i, e);
			}
			var v:Object | null = Lua.rawGet(t, part);
			if (Lua.isNil(v))     // no such field?
			{
				v = this.createTable(0,
					(e >= 0) ? 1 : szhint);     // new table for field
				this.setTable(t, part, v);
			}
			else if (!Lua.isTable(v))     // field has a non-table value?
			{
				return part;
			}
			t = v as LuaTable;
			i = e + 1;
		} while (e >= 0);
		this.pushObject(t);
		return null;
	}

	/**
	 * Get a field (event) from an Lua value's metatable.  Returns Lua
	 * <code>nil</code> if there is either no metatable or no field.
	 * @param o           Lua value to get metafield for.
	 * @param event       name of metafield (event).
	 * @return            the field from the metatable, or nil.
	 */
	public getMetafield(o:Object | null, event:string | null):Object | null
	{
		var mt:LuaTable | null = this.getMetatable(o);
		if (mt == null)
		{
			return Lua.NIL;
		}
		return mt.getlua(event);
	}

	public isNoneOrNil(narg:number):boolean
	{
		return this.type(narg) <= Lua.TNIL;
	}

	/**
	 * Loads a Lua chunk from a file.  The <var>filename</var> argument is
	 * used in a call to {@link Class#getResourceAsStream} where
	 * <code>this</code> is the {@link Lua} instance, thus relative
	 * pathnames will be relative to the location of the
	 * <code>Lua.class</code> file.  Pushes compiled chunk, or error
	 * message, onto stack.
	 * @param filename  location of file.
	 * @return status code, as per {@link #load}.
	 */
	public loadFile(filename:string | null):number
	{
		if (filename == null)
		{
			throw new NullPointerException();
		}
		var _in:InputStream | null = /*getClass()*/SystemUtil.getResourceAsStream(filename); //TODO:
		if (_in == null)
		{
			return this.errfile("open", filename, new IOException());
		}
		var status:number = 0;
		try
		{
			_in.mark(1);
			var c:number = _in.read();
			if (c == '#'.charCodeAt(0))       // Unix exec. file?
			{
				// :todo: handle this case
			}
			_in.reset();
			status = this.load(_in, "@" + filename);
		}
		catch (e)
		{
			if (e instanceof IOException) {
				console.log((e as IOException).stack)
				return this.errfile("read", filename, e);
			}
		}
		return status;
	}

	/**
	 * Loads a Lua chunk from a string.  Pushes compiled chunk, or error
	 * message, onto stack.
	 * @param s           the string to load.
	 * @param chunkname   the name of the chunk.
	 * @return status code, as per {@link #load}.
	 */
	public loadString(s:string | null, chunkname:string | null):number
	{
		return this.__load(Lua.stringReader(s), chunkname);
	}

	/**
	 * Get optional integer argument.  Raises error if non-number
	 * supplied.
	 * @param narg  argument index.
	 * @param def   default value for integer.
	 * @return an int.
	 */
	public optInt(narg:number, def:number):number
	{
		if (this.isNoneOrNil(narg))
		{
			return def;
		}
		return this.checkInt(narg);
	}

	/**
	 * Get optional number argument.  Raises error if non-number supplied.
	 * @param narg  argument index.
	 * @param def   default value for number.
	 * @return a double.
	 */
	public optNumber(narg:number, def:number):number
	{
		if (this.isNoneOrNil(narg))
		{
			return def;
		}
		return this.checkNumber(narg);
	}

	/**
	 * Get optional string argument.  Raises error if non-string supplied.
	 * @param narg  argument index.
	 * @param def   default value for string.
	 * @return a string.
	 */
	public optString(narg:number, def:string | null):string | null
	{
		if (this.isNoneOrNil(narg))
		{
			return def;
		}
		return this.checkString(narg);
	}

	/**
	 * Creates a table in the global namespace and registers it as a loaded
	 * module.
	 * @return the new table
	 */
	public __register(name:string):LuaTable
	{
		this.findTable(this._registry, Lua.LOADED, 1);
		var loaded:Object | null = this.value(-1);
		this.pop(1);
		var t:Object | null = this.getField(loaded, name);
		if (!Lua.isTable(t))    // not found?
		{
			// try global variable (and create one if it does not exist)
			if (this.findTable(this.getGlobals(), name, 0) != null)
			{
				this.error("name conflict for module '" + name + "'");
			}
			t = this.value(-1);
			this.pop(1);
			this.setField(loaded, name, t);        // _LOADED[name] = new table
		}
		return t as LuaTable;
	}

	private tagError(narg:number, tag:number):void
	{
		this.typerror(narg, Lua.typeName(tag));
	}

	/**
	 * Name of type of value at <var>idx</var>.
	 * @param idx  stack index.
	 * @return  the name of the value's type.
	 */
	public typeNameOfIndex(idx:number):String
	{
		return Lua.TYPENAME[this.type(idx)];
	}

	/**
	 * Declare type error in argument.
	 * @param narg   Index of argument.
	 * @param tname  Name of type expected.
	 */
	public typerror(narg:number, tname:String):void
	{
		this.argError(narg, tname + " expected, got " + this.typeNameOfIndex(narg));
	}

	/**
	 * Return string identifying current position of the control at level
	 * <var>level</var>.
	 * @param level  specifies the call-stack level.
	 * @return a description for that level.
	 */
	public where(level:number):string 
	{
		var ar:Debug | null = this.getStack(level);         // check function at level
		if (ar != null)
		{
			this.getInfo("Sl", ar);                // get info about it
			if (ar.currentline > 0)         // is there info?
			{
				return ar.shortsrc + ":" + ar.currentline + ": ";
			}
		}
		return "";  // else, no information available...
	}

	/**
	 * Provide {@link java.io.Reader} interface over a <code>String</code>.
	 * Equivalent of {@link java.io.StringReader#StringReader} from J2SE.
	 * The ability to convert a <code>String</code> to a
	 * <code>Reader</code> is required internally,
	 * to provide the Lua function <code>loadstring</code>; exposed
	 * externally as a convenience.
	 * @param s  the string from which to read.
	 * @return a {@link java.io.Reader} that reads successive chars from <var>s</var>.
	 */
	public static stringReader(s:string | null):Reader
	{
		return new StringReader(s);
	}

	//////////////////////////////////////////////////////////////////////
	// Debug

	// Methods equivalent to debug API.  In PUC-Rio most of these are in
	// ldebug.c

	public getInfo(what:String, ar:Debug | null):boolean
	{
		var f:Object | null = null;
		var callinfo:CallInfo | null = null;
		// :todo: complete me
		if (ar!.ici > 0)   // no tail call?
		{
			callinfo = this._civ.elementAt(ar!.ici) as CallInfo;
			f = (this._stack[callinfo.func] as Slot).r;
			//# assert isFunction(f)
		}
		var status:boolean = this.auxgetinfo(what, ar, f, callinfo);
		if (what.indexOf('f') >= 0)
		{
			if (f == null)
			{
				this.pushObject(Lua.NIL);
			}
			else
			{
				this.pushObject(f);
			}
		}
		return status;
	}

	/**
	 * Locates function activation at specified call level and returns a
	 * {@link Debug}
	 * record for it, or <code>null</code> if level is too high.
	 * May become public.
	 * @param level  the call level.
	 * @return a {@link Debug} instance describing the activation record.
	 */
	public getStack(level:number):Debug | null
	{
		var ici:number;    // Index of CallInfo

		for (ici = this._civ.size - 1; level > 0 && ici > 0; --ici)
		{
			var ci:CallInfo = this._civ.elementAt(ici) as CallInfo;
			--level;
			if (this.isLua(ci))                    // Lua function?
			{
				level -= ci.tailcalls;        // skip lost tail calls
			}
		}
		if (level == 0 && ici > 0)          // level found?
		{
			return new Debug(ici);
		}
		else if (level < 0)       // level is of a lost tail call?
		{
			return new Debug(0);
		}
		return null;
	}

	/**
	 * Sets the debug hook.
	 */
	public setHook(func:Hook | null, mask:number, count:number):void
	{
		if (func == null || mask == 0)      // turn off hooks?
		{
			mask = 0;
			func = null;
		}
		this._hook = func;
		this._basehookcount = count;
		this.resethookcount();
		this._hookmask = mask;
	}

	/**
	 * @return true is okay, false otherwise (for example, error).
	 */
	private auxgetinfo(what:String, ar:Debug | null, f:Object | null, ci:CallInfo | null):boolean
	{
		var status:boolean = true;
		if (f == null)
		{
			// :todo: implement me
			return status;
		}
		for (var i:number = 0; i < what.length; ++i)
		{
			switch (what.charAt(i))
			{
				case 'S':
					this.funcinfo(ar, f);
					break;
			
				case 'l':
					ar!.currentline = (ci != null) ? this.currentline(ci) : -1;
					break;
			
				case 'f':       // handled by getInfo
					break;
			
				// :todo: more cases.
				default:
					status = false;
			}
		}
		return status;
	}

	private currentline(ci:CallInfo):number
	{
		var pc:number = this.currentpc(ci);
		if (pc < 0)
		{
			return -1;        // only active Lua functions have current-line info
		}
		else
		{
			var faso:Object | null = (this._stack[ci.func] as Slot).r;
			var f:LuaFunction = faso as LuaFunction;
			return f.proto.getline(pc);
		}
	}

	private currentpc(ci:CallInfo):number
	{
		if (!this.isLua(ci))     // function is not a Lua function?
		{
			return -1;
		}
		if (ci == this.__ci())
		{
			ci.savedpc = this._savedpc;
		}
		return Lua.pcRel(ci.savedpc);
	}

	private funcinfo(ar:Debug | null, cl:Object):void
	{
		if (cl instanceof LuaJavaCallback)
		{
			ar!.source = "=[Java]";
			ar!.linedefined = -1;
			ar!.lastlinedefined = -1;
			ar!.what = "Java";
		}
		else
		{
			var p:Proto = (cl as LuaFunction).proto;
			ar!.source = p.source;
			ar!.linedefined = p.linedefined;
			ar!.lastlinedefined = p.lastlinedefined;
			ar!.what = ar!.linedefined == 0 ? "main" : "Lua";
		}
	}

	/** Equivalent to macro isLua _and_ f_isLua from lstate.h. */
	private isLua(callinfo:CallInfo):boolean
	{
		var f:Object | null = (this._stack[callinfo.func] as Slot).r;
		return f instanceof LuaFunction;
	}

	private static pcRel(pc:number):number
	{
		return pc - 1;
	}

	//////////////////////////////////////////////////////////////////////
	// Do

	// Methods equivalent to the file ldo.c.  Prefixed with d.
	// Some of these are in vm* instead.

	/**
	* Equivalent to luaD_callhook.
	*/
	private dCallhook(event:number, line:number):void
	{
		var hook:Hook | null = this._hook;
		if (hook != null && this._allowhook)
		{
			var top:number = this._stackSize;
			var ci_top:number = this.__ci().top;
			var ici:number = this._civ.size - 1;
			if (event == Lua.HOOKTAILRET) // not supported yet
			{
				ici = 0;
			}
			var ar:Debug = new Debug(ici);
			ar.event = event;
			ar.currentline = line;
			this.__ci().top = this._stackSize;
			this._allowhook = false;        // cannot call hooks inside a hook
			hook.luaHook(this, ar);
			//# assert !allowhook
			this._allowhook = true;
			this.__ci().top = ci_top;
			this.stacksetsize(top);
		}
	}

	private static MEMERRMSG:String = "not enough memory";

	/** Equivalent to luaD_seterrorobj.  It is valid for oldtop to be
	* equal to the current stack size (<code>stackSize</code>).
	* {@link #resume} uses this value for oldtop.
	*/
	private dSeterrorobj(errcode:number, oldtop:number):void
	{
		var msg:Object | null = this.objectAt(this._stackSize - 1);
		if (this._stackSize == oldtop)
		{
			this.stacksetsize(oldtop + 1);
		}
		switch (errcode)
		{
			case Lua.ERRMEM:
				(this._stack[oldtop] as Slot).r = Lua.MEMERRMSG;
				break;

			case Lua.ERRERR:
				(this._stack[oldtop] as Slot).r = "error in error handling";
				break;

			case Lua.ERRFILE:
			case Lua.ERRRUN:
			case Lua.ERRSYNTAX:
				this.setObjectAt(msg, oldtop);
				break;
		}
		this.stacksetsize(oldtop+1);
	}

	public dThrow(status:number):void 
	{
		throw new LuaError(status);
	}


	//////////////////////////////////////////////////////////////////////
	// Func

	// Methods equivalent to the file lfunc.c.  Prefixed with f.

	/** Equivalent of luaF_close.  All open upvalues referencing stack
	 * slots level or higher are closed.
	 * @param level  Absolute stack index.
	 */
	private fClose(level:number):void
	{
		var i:number = this._openupval.length;
		while (--i >= 0)
		{
			var uv:UpVal = this._openupval[i] as UpVal; //FIXME:var uv:UpVal = this._openupval.elementAt(i) as UpVal;
			if (uv.offset < level)
			{
				break;
			}
			uv.close();
		}
		this._openupval.length = i + 1;
		//openupval.setSize(i+1);
		return;
	}

	private fFindupval(idx:number):UpVal 
	{
		/*
			* We search from the end of the Vector towards the beginning,
			* looking for an UpVal for the required stack-slot.
			*/
		var i:number = this._openupval.length;//FIXME:.size();
		while (--i >= 0)
		{
			var uv2:UpVal = this._openupval[i] as UpVal; //FIXME:var uv2:UpVal = this._openupval.elementAt(i) as UpVal;
			if (uv2.offset == idx)
			{
				return uv2;
			}
			if (uv2.offset < idx)
			{
				break;
			}
		}
		// i points to be position _after_ which we want to insert a new
		// UpVal (it's -1 when we want to insert at the beginning).
		var uv:UpVal = new UpVal(idx, this._stack[idx] as Slot);
		this._openupval.splice(i+1, 0, uv);//FIXME:this._openupval.insertElementAt(uv, i+1);
		return uv;
	}


	//////////////////////////////////////////////////////////////////////
	// Debug

	// Methods equivalent to the file ldebug.c.  Prefixed with g.

	/** <var>p1</var> and <var>p2</var> are operands to a numeric opcode.
	 * Corrupts <code>NUMOP[0]</code>.
	 * There is the possibility of using <var>p1</var> and <var>p2</var> to
	 * identify (for example) for local variable being used in the
	 * computation (consider the error message for code like <code>local
	 * y='a'; return y+1</code> for example).  Currently the debug info is
	 * not used, and this opportunity is wasted (it would require changing
	 * or overloading gTypeerror).
	 */
	private gAritherror(p1:Slot, p2:Slot):void
	{
		if (!Lua.tonumber(p1, Lua.NUMOP))
		{
			p2 = p1;  // first operand is wrong
		}
		this.gTypeerror(p2, "perform arithmetic on");
	}

	/** <var>p1</var> and <var>p2</var> are absolute stack indexes. */
	private gConcaterror(p1:number, p2:number):void
	{
		if ((this._stack[p1] as Slot).r instanceof String || typeof((this._stack[p1] as Slot).r) == 'string')
		{
			p1 = p2;
		}
		// assert !(p1 instanceof String);
		this.gTypeerror(this._stack[p1] as Slot, "concatenate");
	}

	public gCheckcode(p:Proto):boolean
	{
		// :todo: implement me.
		return true;
	}

	private gErrormsg(message:Object | null):number
	{
		this.pushObject(message);
		if (this._errfunc != null)        // is there an error handling function
		{
			if (!Lua.isFunction(this._errfunc))
			{
				this.dThrow(Lua.ERRERR);
			}
			this.insert(this._errfunc, this.getTop());        // push function (under error arg)
			this.vmCall(this._stackSize - 2, 1);        // call it
		}
		this.dThrow(Lua.ERRRUN);
		// NOTREACHED
		return 0;
	}

	private gOrdererror(p1:Slot, p2:Slot):boolean
	{
		var t1:String = Lua.typeName(this.___type(p1));
		var t2:String = Lua.typeName(this.___type(p2));
		if (t1.charAt(2) == t2.charAt(2))
		{
			this.gRunerror("attempt to compare two " + t1 + "values");
		}
		else
		{
			this.gRunerror("attempt to compare " + t1 + " with " + t2);
		}
		// NOTREACHED
		return false;
	}

	public gRunerror(s:string):void
	{
		this.gErrormsg(s);
	}

	private gTypeerror(o:Object | null, op:string):void
	{
		var t:string | null = Lua.typeName(Lua.____type(o));
		this.gRunerror("attempt to " + op + " a " + t + " value");
	}

	private __gTypeerror(p:Slot, op:string):void
	{
		// :todo: PUC-Rio searches the stack to see if the value (which may
		// be a reference to stack cell) is a local variable.
		// For now we cop out and just call gTypeerror(Object, String)
		this.gTypeerror(p.asObject(), op);
	}


	//////////////////////////////////////////////////////////////////////
	// Object

	// Methods equivalent to the file lobject.c.  Prefixed with o.

	private static IDSIZE:number = 60;
	
	/**
	 * @return a string no longer than IDSIZE.
	 */
	public static oChunkid(source:string | null):string
	{
		var len:number = Lua.IDSIZE;
		if (source!.charAt(0) == "=")
		{
			if (source!.length < Lua.IDSIZE + 1)
			{
				return source!.substring(1);
			}
			else
			{
				return source!.substring(1, 1+len);
			}
		}
		// else  "source" or "...source"
		if (source!.charAt(0) == "@")
		{
			source = source!.substring(1);
			len -= " '...' ".length;
			var l2:number = source.length;
			if (l2 > len)
			{
				return "..." +  // get last part of file name
					source.substring(source.length - len, source.length);
			}
			return source;
		}
		// else  [string "string"]
		var l:number = source!.indexOf('\n');
		if (l == -1)
		{
			l = source!.length;
		}
		len -= " [string \"...\"] ".length;
		if (l > len)
		{
			l = len;
		}
		var buf:StringBuffer = new StringBuffer();
		buf.appendString("[string \"");
		buf.appendString(source!.substring(0, l));
		if (source!.length > l)    // must truncate
		{
			buf.appendString("...");
		}
		buf.appendString("\"]");
		return buf.toString();
	}

	/**
	 * Equivalent to luaO_fb2int.
	 * @see Syntax#oInt2fb
	 */
	private static oFb2int(x:number):number
	{
		var e:number = (x >>> 3) & 31;
		if (e == 0)
		{
			return x;
		}
		return ((x & 7) + 8) << (e - 1);
	}

	/** Equivalent to luaO_rawequalObj. */
	private static oRawequal(a:Object | null, b:Object | null):boolean
	{
		// see also vmEqual
		if (Lua.NIL == a)
		{
			return Lua.NIL == b;
		}
		// Now a is not null, so a.equals() is a valid call.
		// Numbers (Doubles), Booleans, Strings all get compared by value,
		// as they should; tables, functions, get compared by identity as
		// they should.
		return a===(b);
	}

	/** Equivalent to luaO_str2d. */
	private static oStr2d(s:string, out:number[]/*double[] */):boolean
	{
		// :todo: using try/catch may be too slow.  In which case we'll have
		// to recognise the valid formats first.
		try
		{
			out[0] = Number(s);
			return true;
		}
		catch (e0_)
		{
			if (e0_ instanceof NumberFormatException) {
				console.log((e0_ as NumberFormatException).stack);
			}
			try
			{
				// Attempt hexadecimal conversion.
				// :todo: using String.trim is not strictly accurate, because it
				// trims other ASCII control characters as well as whitespace.
				s = s.replace(/ /g, "").toUpperCase(); //TODO:
				if (s.substr(0, 2) == "0X")
				{
					s = s.substring(2);  
				}
				else if (s.substr(0, 3) ==  ("-0X"))
				{
					s = "-" + s.substring(3);
				}
				else
				{
					return false;
				}
				out[0] = parseInt(s);// TODO:16进制 16);
				return true;
			}
			catch (e1_)
			{
				if (e1_ instanceof NumberFormatException) { 
					console.log((e1_ as NumberFormatException).stack);
					return false;
				}
			}
		}
		
		//unreachable
		return false;
	}


	////////////////////////////////////////////////////////////////////////
	// VM

	// Most of the methods in this section are equivalent to the files
	// lvm.c and ldo.c from PUC-Rio.  They're mostly prefixed with vm as
	// well.

	private static PCRLUA:number =     0;
	private static PCRJ:number =       1;
	private static PCRYIELD:number =   2;

	// Instruction decomposition.

	// There follows a series of methods that extract the various fields
	// from a VM instruction.  See lopcodes.h from PUC-Rio.
	// :todo: Consider replacing with m4 macros (or similar).
	// A brief overview of the instruction format:
	// Logically an instruction has an opcode (6 bits), op, and up to
	// three fields using one of three formats:
	// A B C  (8 bits, 9 bits, 9 bits)
	// A Bx   (8 bits, 18 bits)
	// A sBx  (8 bits, 18 bits signed - excess K)
	// Some instructions do not use all the fields (EG OP_UNM only uses A
	// and B).
	// When packed into a word (an int in Jill) the following layouts are
	// used:
	//  31 (MSB)    23 22          14 13         6 5      0 (LSB)
	// +--------------+--------------+------------+--------+
	// | B            | C            | A          | OPCODE |
	// +--------------+--------------+------------+--------+
	//
	// +--------------+--------------+------------+--------+
	// | Bx                          | A          | OPCODE |
	// +--------------+--------------+------------+--------+
	//
	// +--------------+--------------+------------+--------+
	// | sBx                         | A          | OPCODE |
	// +--------------+--------------+------------+--------+

	public static NO_REG:number = 0xff;       // SIZE_A == 8, (1 << 8)-1

	// Hardwired values for speed.
	/** Equivalent of macro GET_OPCODE */
	public static OPCODE(instruction:number):number
	{
		// POS_OP == 0 (shift amount)
		// SIZE_OP == 6 (opcode width)
		return instruction & 0x3f;
	}

	/** Equivalent of macro GET_OPCODE */
	public static SET_OPCODE(i:number, op:number):number
	{
		// POS_OP == 0 (shift amount)
		// SIZE_OP == 6 (opcode width)
		return (i & ~0x3F) | (op & 0x3F);
	}

	/** Equivalent of macro GETARG_A */
	public static ARGA(instruction:number):number
	{
		// POS_A == POS_OP + SIZE_OP == 6 (shift amount)
		// SIZE_A == 8 (operand width)
		return (instruction >>> 6) & 0xff;
	}

	public static SETARG_A(i:number, u:number):number
	{
		return (i & ~(0xff << 6)) | ((u & 0xff) << 6);
	}

	/** Equivalent of macro GETARG_B */
	public static ARGB(instruction:number):number
	{
		// POS_B == POS_OP + SIZE_OP + SIZE_A + SIZE_C == 23 (shift amount)
		// SIZE_B == 9 (operand width)
		/* No mask required as field occupies the most significant bits of a
			* 32-bit int. */
		return (instruction >>> 23);
	}

	public static SETARG_B(i:number, b:number):number
	{
		return (i & ~(0x1ff << 23)) | ((b & 0x1ff) << 23);
	}

	/** Equivalent of macro GETARG_C */
	public static ARGC(instruction:number):number
	{
		// POS_C == POS_OP + SIZE_OP + SIZE_A == 14 (shift amount)
		// SIZE_C == 9 (operand width)
		return (instruction >>> 14) & 0x1ff;
	}

	public static SETARG_C(i:number, c:number):number
	{
		return (i & ~(0x1ff << 14)) | ((c & 0x1ff) << 14);
	}

	/** Equivalent of macro GETARG_Bx */
	public static ARGBx(instruction:number):number
	{
		// POS_Bx = POS_C == 14
		// SIZE_Bx == SIZE_C + SIZE_B == 18
		/* No mask required as field occupies the most significant bits of a
			* 32 bit int. */
		return (instruction >>> 14);
	}

	public static SETARG_Bx(i:number, bx:number):number
	{
		return (i & 0x3fff) | (bx << 14) ;
	}


	/** Equivalent of macro GETARG_sBx */
	public static ARGsBx(instruction:number):number
	{
		// As ARGBx but with (2**17-1) subtracted.
		return (instruction >>> 14) - Lua.MAXARG_sBx;
	}
	
	public static SETARG_sBx(i:number, bx:number):number
	{
		return (i & 0x3fff) | ((bx+Lua.MAXARG_sBx) << 14) ;  // CHECK THIS IS RIGHT
	}

	public static ISK(field:number):boolean
	{
		// The "is constant" bit position depends on the size of the B and C
		// fields (required to be the same width).
		// SIZE_B == 9
		return field >= 0x100;
	}

	/**
	* Near equivalent of macros RKB and RKC.  Note: non-static as it
	* requires stack and base instance members.  Stands for "Register or
	* Konstant" by the way, it gets value from either the register file
	* (stack) or the constant array (k).
	*/
	private RK(k:Slot[] | null/*Slot[] */, field:number):Slot
	{
		if (Lua.ISK(field))
		{
			return k![field & 0xff] as Slot;
		}
		return this._stack[this._base + field] as Slot;
	}

	/**
	* Slower version of RK that does not receive the constant array.  Not
	* recommend for routine use, but is used by some error handling code
	* to avoid having a constant array passed around too much.
	*/
	private __RK(field:number):Slot
	{
		var _function:LuaFunction = (this._stack[this.__ci().func] as Slot).r as LuaFunction;
		var k:Slot[] | null = _function.proto.constant; //Slot[]
		return this.RK(k, field);
	}

	// CREATE functions are required by FuncState, so default access.
	public static CREATE_ABC(o:number, a:number, b:number, c:number):number
	{
		// POS_OP == 0
		// POS_A == 6
		// POS_B == 23
		// POS_C == 14
		return o | (a << 6) | (b << 23) | (c << 14);
	}

	public static CREATE_ABx(o:number, a:number, bc:number):number
	{
		// POS_OP == 0
		// POS_A == 6
		// POS_Bx == POS_C == 14
		return o | (a << 6) | (bc << 14);
	}

	// opcode enumeration.
	// Generated by a script:
	// awk -f opcode.awk < lopcodes.h
	// and then pasted into here.
	// Made default access so that code generation, in FuncState, can see
	// the enumeration as well.

	public static OP_MOVE:number = 0;
	public static OP_LOADK:number = 1;
	public static OP_LOADBOOL:number = 2;
	public static OP_LOADNIL:number = 3;
	public static OP_GETUPVAL:number = 4;
	public static OP_GETGLOBAL:number = 5;
	public static OP_GETTABLE:number = 6;
	public static OP_SETGLOBAL:number = 7;
	public static OP_SETUPVAL:number = 8;
	public static OP_SETTABLE:number = 9;
	public static OP_NEWTABLE:number = 10;
	public static OP_SELF:number = 11;
	public static OP_ADD:number = 12;
	public static OP_SUB:number = 13;
	public static OP_MUL:number = 14;
	public static OP_DIV:number = 15;
	public static OP_MOD:number = 16;
	public static OP_POW:number = 17;
	public static OP_UNM:number = 18;
	public static OP_NOT:number = 19;
	public static OP_LEN:number = 20;
	public static OP_CONCAT:number = 21;
	public static OP_JMP:number = 22;
	public static OP_EQ:number = 23;
	public static OP_LT:number = 24;
	public static OP_LE:number = 25;
	public static OP_TEST:number = 26;
	public static OP_TESTSET:number = 27;
	public static OP_CALL:number = 28;
	public static OP_TAILCALL:number = 29;
	public static OP_RETURN:number = 30;
	public static OP_FORLOOP:number = 31;
	public static OP_FORPREP:number = 32;
	public static OP_TFORLOOP:number = 33;
	public static OP_SETLIST:number = 34;
	public static OP_CLOSE:number = 35;
	public static OP_CLOSURE:number = 36;
	public static OP_VARARG:number = 37;

	// end of instruction decomposition

	public static SIZE_C:number = 9;
	public static SIZE_B:number = 9;
	public static SIZE_Bx:number = Lua.SIZE_C + Lua.SIZE_B;
	public static SIZE_A:number = 8;

	public static SIZE_OP:number = 6;

	public static POS_OP:number = 0;
	public static POS_A:number = Lua.POS_OP + Lua.SIZE_OP;
	public static POS_C:number = Lua.POS_A + Lua.SIZE_A;
	public static POS_B:number = Lua.POS_C + Lua.SIZE_C;
	public static POS_Bx:number = Lua.POS_C;

	public static MAXARG_Bx:number = (1<<Lua.SIZE_Bx)-1;
	public static MAXARG_sBx:number = Lua.MAXARG_Bx>>1;    // `sBx' is signed


	public static MAXARG_A:number = (1<<Lua.SIZE_A)-1;
	public static MAXARG_B:number = (1<<Lua.SIZE_B)-1;
	public static MAXARG_C:number = (1<<Lua.SIZE_C)-1;

	/* this bit 1 means constant (0 means register) */
	public static BITRK:number = 1 << (Lua.SIZE_B - 1) ;
	public static MAXINDEXRK:number = Lua.BITRK - 1 ;


	/**
	 * Equivalent of luaD_call.
	 * @param func  absolute stack index of function to call.
	 * @param r     number of required results.
	 */
	private vmCall(func:number, r:number):void
	{
		++this._nCcalls;
		if (this.vmPrecall(func, r) == Lua.PCRLUA)
		{
			this.vmExecute(1);
		}
		--this._nCcalls;
	}
	
	/** Equivalent of luaV_concat. */
	private vmConcat(total:number, last:number):void
	{
		try 
		{
			do
			{
				var top:number = this._base + last + 1;
				var n:number = 2;  // number of elements handled in this pass (at least 2)
				if (!this.tostring(top-2) || !this.tostring(top-1))
				{
					if (Lua.D) {
						console.log("----------------->OP_CONCAT 1");
					}
					if (!this.call_binTM(this._stack[top - 2] as Slot, this._stack[top - 1],
						this._stack[top - 2] as Slot, "__concat"))
					{
						this.gConcaterror(top-2, top-1);
					}
				}
				else if (((this._stack[top - 1] as Slot).r!.toString()).length > 0)
				{
					if (Lua.D) {
						console.log("----------------->OP_CONCAT 2");
					}
					var tl:number = ((this._stack[top - 1] as Slot).r!.toString()).length;
					for (n = 1; n < total && this.tostring(top-n-1); ++n)
					{
						tl += ((this._stack[top - n - 1] as Slot).r!.toString()).length;
						if (tl < 0)
						{
							this.gRunerror("string length overflow");
						}
					}
					var buffer:StringBuffer = new StringBuffer();
					buffer.init(tl);
					console.log("--------->buffer.appendString begin");
					for (var i:number = n; i > 0; i--)         // concat all strings
					{
						if (Lua.D) 
						{
							console.log("--------->buffer.appendString " + (this._stack[top - i] as Slot).r + ", " + typeof((this._stack[top - i] as Slot).r));
						}
						buffer.appendString((this._stack[top - i] as Slot).r!.toString());
					}
					(this._stack[top - n] as Slot).r = buffer.toString();
				}
				if (Lua.D) {
					console.log("----------------->OP_CONCAT 3");
				}			
				total -= n-1;     // got n strings to create 1 new
				last -= n-1;
			} while (total > 1); // repeat until only 1 result left
		} catch(e) {
			console.log("----------------->got exception :" + (e as Error).stack);
		} 
	}

	/**
	 * Primitive for testing Lua equality of two values.  Equivalent of
	 * PUC-Rio's <code>equalobj</code> macro.
	 * In the loosest sense, this is the equivalent of
	 * <code>luaV_equalval</code>.
	 */
	private vmEqual(a:Slot, b:Slot):boolean
	{
		// Deal with number case first
		if (Lua.NUMBER == a.r)
		{
			if (Lua.NUMBER != b.r)
			{
				return false;
			}
			return a.d == b.d;
		}
		// Now we're only concerned with the .r field.
		return this.vmEqualRef(a.r, b.r);
	}
	
	/**
	 * Part of {@link #vmEqual}.  Compares the reference part of two
	 * Slot instances.  That is, compares two Lua values, as long as
	 * neither is a number.
	 */
	private vmEqualRef(a:Object | null, b:Object | null):boolean
	{
		if (a===(b))
		{
			return true;
		}
		//TODO:
		//if (a.getClass != b.getClass())
		if (typeof(a) != typeof(b))
		{
			return false;
		}
		// Same class, but different objects.
		if (a instanceof LuaJavaCallback ||
			a instanceof LuaTable)
		{
			// Resort to metamethods.
			var tm:Object | null = this.get_compTM(this.getMetatable(a), this.getMetatable(b), "__eq");
			if (Lua.NIL == tm)    // no TM?
			{
				return false;
			}
			var s:Slot = new Slot();
			this.__callTMres(s, tm, a, b);   // call TM   //TODO:
			return !this.isFalse(s.r);
		}
		return false;
	}

	/**
	 * Array of numeric operands.  Used when converting strings to numbers
	 * by an arithmetic opcode (ADD, SUB, MUL, DIV, MOD, POW, UNM).
	 */
	private static NUMOP:number[] = new Array(2); //double[]

	public static getOpcodeName(code:number):String
	{
		var name:String = "";
		switch (code) 
		{
			case Lua.OP_MOVE: 
				name = "OP_MOVE"; 
				break;
			case Lua.OP_LOADK:
				name = "OP_LOADK"; 
				break;
			case Lua.OP_LOADBOOL:
				name = "OP_LOADBOOL"; 
				break;
			case Lua.OP_LOADNIL:
				name = "OP_LOADNIL"; 
				break;
			case Lua.OP_GETUPVAL:
				name = "OP_GETUPVAL"; 
				break;
			case Lua.OP_GETGLOBAL:
				name = "OP_GETGLOBAL"; 
				break;
			case Lua.OP_GETTABLE:
				name = "OP_GETTABLE"; 
				break;
			case Lua.OP_SETGLOBAL:
				name = "OP_SETGLOBAL"; 
				break;
			case Lua.OP_SETUPVAL:
				name = "OP_SETUPVAL"; 
				break;
			case Lua.OP_SETTABLE:
				name = "OP_SETTABLE"; 
				break;
			case Lua.OP_NEWTABLE:
				name = "OP_NEWTABLE"; 
				break;
			case Lua.OP_SELF:
				name = "OP_SELF"; 
				break;
			case Lua.OP_ADD:
				name = "OP_ADD"; 
				break;
			case Lua.OP_SUB:
				name = "OP_SUB"; 
				break;
			case Lua.OP_MUL:
				name = "OP_MUL"; 
				break;
			case Lua.OP_DIV:
				name = "OP_DIV"; 
				break;
			case Lua.OP_MOD:
				name = "OP_MOD"; 
				break;
			case Lua.OP_POW:
				name = "OP_POW"; 
				break;
			case Lua.OP_UNM:
				name = "OP_UNM"; 
				break;
			case Lua.OP_NOT:
				name = "OP_NOT"; 
				break;
			case Lua.OP_LEN:
				name = "OP_LEN"; 
				break;
			case Lua.OP_CONCAT:
				name = "OP_CONCAT"; 
				break;
			case Lua.OP_JMP:
				name = "OP_JMP"; 
				break;
			case Lua.OP_EQ:
				name = "OP_EQ"; 
				break;
			case Lua.OP_LT:
				name = "OP_LT"; 
				break;
			case Lua.OP_LE:
				name = "OP_LE"; 
				break;
			case Lua.OP_TEST:
				name = "OP_TEST"; 
				break;
			case Lua.OP_TESTSET:
				name = "OP_TESTSET"; 
				break;
			case Lua.OP_CALL:
				name = "OP_CALL"; 
				break;
			case Lua.OP_TAILCALL:
				name = "OP_TAILCALL"; 
				break;
			case Lua.OP_RETURN:
				name = "OP_RETURN"; 
				break;
			case Lua.OP_FORLOOP:
				name = "OP_FORLOOP"; 
				break;
			case Lua.OP_FORPREP:
				name = "OP_FORPREP"; 
				break;
			case Lua.OP_TFORLOOP:
				name = "OP_TFORLOOP"; 
				break;
			case Lua.OP_SETLIST:
				name = "OP_SETLIST"; 
				break;
			case Lua.OP_CLOSE:
				name = "OP_CLOSE"; 
				break;
			case Lua.OP_CLOSURE:
				name = "OP_CLOSURE"; 
				break;
			case Lua.OP_VARARG:
				name = "OP_VARARG"; 
				break;
		}
		return name;
	}
	
	/** The core VM execution engine. */
	private vmExecute(nexeccalls:number):void
	{
		// This labelled while loop is used to simulate the effect of C's
		// goto.  The end of the while loop is never reached.  The beginning
		// of the while loop is branched to using a "continue reentry;"
		// statement (when a Lua function is called or returns).
	reentry:
		while (true)
		{
			// assert stack[ci.function()].r instanceof LuaFunction;
			var _function:LuaFunction = (this._stack[this.__ci().func] as Slot).r as LuaFunction;
			var proto:Proto = _function.proto;
			var code:number[] | null = proto.code; //int[]
			var k:Slot[] | null = proto.constant; //Slot[] 
			var pc:number = this._savedpc;

			
			//20170402:added
			if (Lua.D) 
			{
				//usage:luac -p -l cf.lua
				for (var i_test:number = 0; i_test < code!.length; i_test++) 
				{
					var name1:String = Lua.getOpcodeName(Lua.OPCODE(code![i_test]));
					console.log(">>>OPCODE(code(" + (i_test + 1) + ")) == " + name1);
				}
			}				
			
			
			while (true)        // main loop of interpreter
			{
				
				// Where the PUC-Rio code used the Protect macro, this has been
				// replaced with "savedpc = pc" and a "// Protect" comment.
			
				// Where the PUC-Rio code used the dojump macro, this has been
				// replaced with the equivalent increment of the pc and a
				// "//dojump" comment.
				
				var i:number = code![pc++];       // VM instruction.
				// :todo: line hook
				if ((this._hookmask & Lua.MASKCOUNT) != 0 && --this._hookcount == 0)
				{
					this.traceexec(pc);
					if (this.status == Lua.YIELD)  // did hook yield?
					{
						this._savedpc = pc - 1;
						return;
					}
					// base = this.base
				}
				
				var a:number  = Lua.ARGA(i);          // its A field.
				var rb:Slot;
				var rc:Slot;
					
				//20170402:added
				if (Lua.D) 
				{
					var name2:String = Lua.getOpcodeName(Lua.OPCODE(i));
					console.log(">>>pc == " + pc + ", name == " + name2);
				}

				switch (Lua.OPCODE(i))
				{
					case Lua.OP_MOVE:
						(this._stack[this._base + a] as Slot).r = (this._stack[this._base + Lua.ARGB(i)] as Slot).r;
						(this._stack[this._base + a] as Slot).d = (this._stack[this._base + Lua.ARGB(i)] as Slot).d;
						continue;
				
					case Lua.OP_LOADK:
						(this._stack[this._base + a] as Slot).r = (k![Lua.ARGBx(i)] as Slot).r;
						(this._stack[this._base + a] as Slot).d = (k![Lua.ARGBx(i)] as Slot).d;
						if (Lua.D) 
						{
							console.log("OP_LOADK:stack[" + (this._base+a) + 
								"]=k[" + Lua.ARGBx(i) + "]=" + (k![Lua.ARGBx(i)] as Slot).d);
						}
						continue;
				
					case Lua.OP_LOADBOOL:
						(this._stack[this._base + a] as Slot).r = Lua.valueOfBoolean(Lua.ARGB(i) != 0);
						if (Lua.ARGC(i) != 0)
						{
							++pc;
						}
						continue;
				
					case Lua.OP_LOADNIL:
						{
							var b:number = this._base + Lua.ARGB(i);
							do
							{
								(this._stack[b--] as Slot).r = Lua.NIL;
							} while (b >= this._base + a);
							continue;
						}
				
					case Lua.OP_GETUPVAL:
						{
							var b2:number = Lua.ARGB(i);
							// :todo: optimise path
							this.setObjectAt(_function.upVal(b2).value, this._base + a);
							continue;
						}
					
					case Lua.OP_GETGLOBAL:
						rb = k![Lua.ARGBx(i)];
						// assert rb instance of String;
						this._savedpc = pc; // Protect
						this.vmGettable(_function.env, rb, this._stack[this._base + a] as Slot);
						continue;
					
					case Lua.OP_GETTABLE:
						{
							this._savedpc = pc; // Protect
							var h:Object | null = (this._stack[this._base + Lua.ARGB(i)] as Slot).asObject();
							if (Lua.D)
							{
								console.log("OP_GETTABLE index = " + (this._base + Lua.ARGB(i)) + 
									", size = " + this._stack.length +
									", h = " + h);
							}
							this.vmGettable(h, this.RK(k, Lua.ARGC(i)), this._stack[this._base + a] as Slot);
							continue;
						}
					
					case Lua.OP_SETUPVAL:
						{
							var uv:UpVal = _function.upVal(Lua.ARGB(i));
							uv.value = this.objectAt(this._base + a);
							continue;
						}
					
					case Lua.OP_SETGLOBAL:
						this._savedpc = pc; // Protect
						// :todo: consider inlining objectAt
						this.vmSettable(_function.env, k![Lua.ARGBx(i)] as Slot,
							this.objectAt(this._base + a));
						continue;
					
					case Lua.OP_SETTABLE:
						{
							this._savedpc = pc; // Protect
							var t:Object | null = this._stack[this._base + a].asObject();
							this.vmSettable(t, this.RK(k, Lua.ARGB(i)), this.RK(k, Lua.ARGC(i)).asObject());
							continue;
						}
					
					case Lua.OP_NEWTABLE:
						{
							var b3:number = Lua.ARGB(i);
							var c:number = Lua.ARGC(i);
							(this._stack[this._base + a] as Slot).r = new LuaTable();
							((this._stack[this._base + a] as Slot).r as LuaTable).init(Lua.oFb2int(b3), Lua.oFb2int(c));
							continue;
						}
					
					case Lua.OP_SELF:
						{
							var b4:number = Lua.ARGB(i);
							rb = this._stack[this._base + b4];
							(this._stack[this._base + a + 1] as Slot).r = rb.r;
							(this._stack[this._base + a + 1] as Slot).d = rb.d;
							this._savedpc = pc; // Protect
							this.vmGettable(rb.asObject(), this.RK(k, Lua.ARGC(i)), (this._stack[this._base + a] as Slot));
							continue;
						}
					
					case Lua.OP_ADD:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER)
						{
							var sum:number = rb.d + rc.d;
							(this._stack[this._base+a] as Slot).d = sum;
							(this._stack[this._base+a] as Slot).r = Lua.NUMBER;
						}
						else if (Lua.toNumberPair(rb, rc, Lua.NUMOP))
						{
							var sum2:number = Lua.NUMOP[0] + Lua.NUMOP[1];
							(this._stack[this._base + a] as Slot).d = sum2;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (!this.call_binTM(rb, rc, this._stack[this._base + a] as Slot, "__add"))
						{
							this.gAritherror(rb, rc);
						}
						continue;
					
					case Lua.OP_SUB:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER)
						{
							var difference:number = rb.d - rc.d;
							(this._stack[this._base + a] as Slot).d = difference;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (Lua.toNumberPair(rb, rc, Lua.NUMOP))
						{
							var difference2:number = (Lua.NUMOP[0] as number) - (Lua.NUMOP[1] as number);
							(this._stack[this._base + a] as Slot).d = difference2;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (!this.call_binTM(rb, rc, this._stack[this._base + a] as Slot, "__sub"))
						{
							this.gAritherror(rb, rc);
						}
						continue;
					
					case Lua.OP_MUL:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER)
						{
							var product:number = rb.d * rc.d;
							(this._stack[this._base + a] as Slot).d = product;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (Lua.toNumberPair(rb, rc, Lua.NUMOP))
						{
							var product2:number = (Lua.NUMOP[0] as number) * (Lua.NUMOP[1] as number);
							(this._stack[this._base + a] as Slot).d = product2;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (!this.call_binTM(rb, rc, this._stack[this._base + a] as Slot, "__mul"))
						{
							this.gAritherror(rb, rc);
						}
						continue;
					
					case Lua.OP_DIV:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER)
						{
							var quotient:number = rb.d / rc.d;
							(this._stack[this._base + a] as Slot).d = quotient;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (Lua.toNumberPair(rb, rc, Lua.NUMOP))
						{
							var quotient2:number = (Lua.NUMOP[0] as number) / (Lua.NUMOP[1] as number);
							(this._stack[this._base + a] as Slot).d = quotient2;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (!this.call_binTM(rb, rc, this._stack[this._base + a] as Slot, "__div"))
						{
							this.gAritherror(rb, rc);
						}
						continue;
						
					case Lua.OP_MOD:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER)
						{
							var modulus:number = Lua.__modulus(rb.d, rc.d);
							(this._stack[this._base + a] as Slot).d = modulus;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (Lua.toNumberPair(rb, rc, Lua.NUMOP))
						{
							var modulus2:number = Lua.__modulus(Lua.NUMOP[0] as number, Lua.NUMOP[1] as number);
							(this._stack[this._base + a] as Slot).d = modulus2;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (!this.call_binTM(rb, rc, this._stack[this._base + a] as Slot, "__mod"))
						{
							this.gAritherror(rb, rc);
						}
						continue;
					
					case Lua.OP_POW:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER)
						{
							var result:number = Lua.iNumpow(rb.d, rc.d);
							(this._stack[this._base + a] as Slot).d = result;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (Lua.toNumberPair(rb, rc, Lua.NUMOP))
						{
							var result2:number = Lua.iNumpow(Lua.NUMOP[0], Lua.NUMOP[1]);
							(this._stack[this._base + a] as Slot).d = result2;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
						}
						else if (!this.call_binTM(rb, rc, this._stack[this._base + a] as Slot, "__pow"))
						{
							this.gAritherror(rb, rc);
						}
						continue;
						
					case Lua.OP_UNM:
						rb = this._stack[this._base + Lua.ARGB(i)] as Slot;
						if (rb.r == Lua.NUMBER)
						{
							(this._stack[this._base+a] as Slot).d = -rb.d;
							(this._stack[this._base+a] as Slot).r = Lua.NUMBER;
						}
						else if (Lua.tonumber(rb, Lua.NUMOP))
						{
							(this._stack[this._base+a] as Slot).d = -(Lua.NUMOP[0] as Number);
							(this._stack[this._base+a] as Slot).r = Lua.NUMBER;
						}
						else if (!this.call_binTM(rb, rb, this._stack[this._base + a] as Slot, "__unm"))
						{
							this.gAritherror(rb, rb);
						}
						continue;
					
					case Lua.OP_NOT:
						{
							// All numbers are treated as true, so no need to examine
							// the .d field.
							var ra:Object | null = (this._stack[this._base + Lua.ARGB(i)] as Slot).r;
							(this._stack[this._base+a] as Slot).r = Lua.valueOfBoolean(this.isFalse(ra));
							continue;
						}
						
					case Lua.OP_LEN:
						rb = this._stack[this._base + Lua.ARGB(i)] as Slot;
						if (rb.r instanceof LuaTable)
						{
							var t2:LuaTable = rb.r as LuaTable;
							(this._stack[this._base + a] as Slot).d = t2.getn();
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
							continue;
						}
						else if (rb.r instanceof String || typeof(rb.r) == 'string')
						{
							var s:String = rb.r as String;
							(this._stack[this._base + a] as Slot).d = s.length;
							(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
							continue;
						}
						this._savedpc = pc; // Protect
						if (!this.call_binTM(rb, rb, this._stack[this._base + a] as Slot, "__len"))
						{
							this.gTypeerror(rb, "get length of");
						}
						continue;
					
					case Lua.OP_CONCAT:
						{
							var b_CONCAT:number = Lua.ARGB(i);
							var c_CONCAT:number = Lua.ARGC(i);
							this._savedpc = pc; // Protect
							// :todo: The compiler assumes that all
							// stack locations _above_ b end up with junk in them.  In
							// which case we can improve the speed of vmConcat (by not
							// converting each stack slot, but simply using
							// StringBuffer.append on whatever is there).
							this.vmConcat(c_CONCAT - b_CONCAT + 1, c_CONCAT);
							(this._stack[this._base + a] as Slot).r = (this._stack[this._base + b_CONCAT] as Slot).r;
							(this._stack[this._base + a] as Slot).d = (this._stack[this._base + b_CONCAT] as Slot).d;
							continue;
						}
					
					case Lua.OP_JMP:
						// dojump
						pc += Lua.ARGsBx(i);
						continue;
					
					case Lua.OP_EQ:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						if (this.vmEqual(rb, rc) == (a != 0))
						{
							// dojump
							pc += Lua.ARGsBx(code![pc] as number);
						}
						++pc;
						continue;
					
					case Lua.OP_LT:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						this._savedpc = pc; // Protect
						if (this.vmLessthan(rb, rc) == (a != 0))
						{
							// dojump
							pc += Lua.ARGsBx(code![pc] as number);
						}
						++pc;
						continue;
					
					case Lua.OP_LE:
						rb = this.RK(k, Lua.ARGB(i));
						rc = this.RK(k, Lua.ARGC(i));
						this._savedpc = pc; // Protect
						if (this.vmLessequal(rb, rc) == (a != 0))
						{
							// dojump
							pc += Lua.ARGsBx(code![pc] as number);
						}
						++pc;
						continue;
					
					case Lua.OP_TEST:
						if (this.isFalse((this._stack[this._base + a] as Slot).r) != (Lua.ARGC(i) != 0))
						{
							// dojump
							pc += Lua.ARGsBx(code![pc] as number);
						}
						++pc;
						continue;
					
					case Lua.OP_TESTSET:
						rb = this._stack[this._base + Lua.ARGB(i)] as Slot;
						if (this.isFalse(rb.r) != (Lua.ARGC(i) != 0))
						{
							(this._stack[this._base + a] as Slot).r = rb.r;
							(this._stack[this._base + a] as Slot).d = rb.d;
							// dojump
							pc += Lua.ARGsBx(code![pc] as number);
						}
						++pc;
						continue;
					
					case Lua.OP_CALL:
						{
							var b_CALL:number = Lua.ARGB(i);
							var nresults:number = Lua.ARGC(i) - 1;
							if (b_CALL != 0) //FIXME:bug: b->b_CALL
							{
								this.stacksetsize(this._base + a + b_CALL);
							}
							this._savedpc = pc;
							switch (this.vmPrecall(this._base + a, nresults))
							{
								case Lua.PCRLUA:
									nexeccalls++;
									continue reentry;
								
								case Lua.PCRJ:
									// Was Java function called by precall, adjust result
									if (nresults >= 0)
									{
										this.stacksetsize(this.__ci().top);
									}
									continue;
								
								default:
									return; // yield
							}
						}
						
					case Lua.OP_TAILCALL:
						{
							var b_TAILCALL:number = Lua.ARGB(i);
							if (b_TAILCALL != 0)
							{
								this.stacksetsize(this._base + a + b_TAILCALL);
							}
							this._savedpc = pc;
							// assert ARGC(i) - 1 == MULTRET
							switch (this.vmPrecall(this._base + a, Lua.MULTRET))
							{
								case Lua.PCRLUA:
									{
										// tail call: put new frame in place of previous one.
										var ci:CallInfo = this._civ.elementAt(this._civ.size - 2) as CallInfo;
										var func:number = ci.func;
										var fci:CallInfo = this.__ci();    // Fresh CallInfo
										var pfunc:number = fci.func;
										this.fClose(ci.base);
										this._base = func + (fci.base - pfunc);
										var aux:number;        // loop index is used after loop ends
										for (aux=0; pfunc + aux < this._stackSize; ++aux)
										{
											// move frame down
											(this._stack[func + aux] as Slot).r = (this._stack[pfunc + aux] as Slot).r;
											(this._stack[func + aux] as Slot).d = (this._stack[pfunc + aux] as Slot).d;
										}
										this.stacksetsize(func + aux);        // correct top
										// assert stackSize == base + ((LuaFunction)stack[func]).proto().maxstacksize();
										ci.tailcall(this._base, this._stackSize);
										this.dec_ci();       // remove new frame.
										continue reentry;
									}
								
								case Lua.PCRJ:        // It was a Java function
									{
										continue;
									}
								
								default:
									{
										return; // yield
									}
							}
						}
					
					case Lua.OP_RETURN:
						{
							this.fClose(this._base);
							var b_RETURN:number = Lua.ARGB(i);
							if (b_RETURN != 0)
							{
								var top:number = a + b_RETURN - 1;
								this.stacksetsize(this._base + top);
							}
							this._savedpc = pc;
							// 'adjust' replaces aliased 'b' in PUC-Rio code.
							var adjust:boolean = this.vmPoscall(this._base + a);
							if (--nexeccalls == 0)
							{
								return;
							}
							if (adjust)
							{
								this.stacksetsize(this.__ci().top);
							}
							continue reentry;
						}
					
					case Lua.OP_FORLOOP:
						{
							var step:number = (this._stack[this._base + a + 2] as Slot).d;
							var idx:number = (this._stack[this._base + a] as Slot).d + step;
							var limit:number = (this._stack[this._base + a + 1] as Slot).d;
							if ((0 < step && idx <= limit) ||
								(step <= 0 && limit <= idx))
							{
								// dojump
								pc += Lua.ARGsBx(i);
								(this._stack[this._base + a] as Slot).d = idx;    // internal index
								(this._stack[this._base + a] as Slot).r = Lua.NUMBER;
								(this._stack[this._base + a + 3] as Slot).d = idx;  // external index
								(this._stack[this._base + a + 3] as Slot).r = Lua.NUMBER;
							}
							continue;
						}
					
					case Lua.OP_FORPREP:
						{
							var init:number = this._base + a;
							var plimit:number = this._base + a + 1;
							var pstep:number = this._base + a + 2;
							this._savedpc = pc;       // next steps may throw errors
							if (!this.tonumber(init))
							{
								this.gRunerror("'for' initial value must be a number");
							}
							else if (!this.tonumber(plimit))
							{
								this.gRunerror("'for' limit must be a number");
							}
							else if (!this.tonumber(pstep))
							{
								this.gRunerror("'for' step must be a number");
							}
							var step_FORPREP:number = (this._stack[pstep] as Slot).d;
							var idx_FORPREP:number = (this._stack[init] as Slot).d - step_FORPREP;
							(this._stack[init] as Slot).d = idx_FORPREP;
							(this._stack[init] as Slot).r = Lua.NUMBER;
							// dojump
							pc += Lua.ARGsBx(i);
							continue;
						}
						
					
					case Lua.OP_TFORLOOP:
						{
							var cb:number = this._base+a+3;  // call base
							(this._stack[cb + 2] as Slot).r = (this._stack[this._base + a + 2] as Slot).r;
							(this._stack[cb + 2] as Slot).d = (this._stack[this._base + a + 2] as Slot).d;
							(this._stack[cb + 1] as Slot).r = (this._stack[this._base + a + 1] as Slot).r;
							(this._stack[cb + 1] as Slot).d = (this._stack[this._base + a + 1] as Slot).d;
							(this._stack[cb] as Slot).r = (this._stack[this._base + a] as Slot).r;
							(this._stack[cb] as Slot).d = (this._stack[this._base + a] as Slot).d;
							this.stacksetsize(cb + 3);
							this._savedpc = pc; // Protect
							this.vmCall(cb, Lua.ARGC(i));
							this.stacksetsize(this.__ci().top);
							if (Lua.NIL != (this._stack[cb] as Slot).r)     // continue loop
							{
								(this._stack[cb - 1] as Slot).r = (this._stack[cb] as Slot).r;
								(this._stack[cb - 1] as Slot).d = (this._stack[cb] as Slot).d;
								// dojump
								pc += Lua.ARGsBx(code![pc] as number);
							}
							++pc;
							continue;
						}
					
					case Lua.OP_SETLIST:
						{
							var n:number = Lua.ARGB(i);
							var c_SETLIST:number = Lua.ARGC(i);
							var setstack:boolean = false;
							if (0 == n)
							{
								n = (this._stackSize - (this._base + a)) - 1;
								setstack = true;
							}
							if (0 == c_SETLIST)
							{
								c_SETLIST = code![pc++] as number;
							}
							var t3:LuaTable = (this._stack[this._base+a] as Slot).r as LuaTable;
							var last:number = ((c_SETLIST - 1) * Lua.LFIELDS_PER_FLUSH) + n;
							// :todo: consider expanding space in table
							for (; n > 0; n--)
							{
								var val:Object | null = this.objectAt(this._base + a + n);
								t3.putnum(last--, val);
							}
							if (setstack)
							{
								this.stacksetsize(this.__ci().top);
							}
							continue;
						}
					
					case Lua.OP_CLOSE:
						this.fClose(this._base + a);
						continue;
					
					case Lua.OP_CLOSURE:
						{
							var p:Proto = _function.proto.proto![Lua.ARGBx(i)] as Proto;
							var nup:number = p.nups;
							var up:UpVal[] = new Array(nup); //UpVal[] 
							for (var j:number = 0; j < nup; j++, pc++)
							{
								var _in:number = code![pc] as number;
								if (Lua.OPCODE(_in) == Lua.OP_GETUPVAL)
								{
									up[j] = _function.upVal(Lua.ARGB(_in)) as UpVal;
								}
								else
								{
									// assert OPCODE(in) == OP_MOVE;
									up[j] = this.fFindupval(this._base + Lua.ARGB(_in)) as UpVal;
								}	
							}
							var nf:LuaFunction = new LuaFunction(p, up, _function.env);
							//up = null;
							(this._stack[this._base + a] as Slot).r = nf;
							continue;
						}
					
					case Lua.OP_VARARG:
						{
							var b_VARARG:number = Lua.ARGB(i) - 1;
							var n_VARARG:number = (this._base - this.__ci().func) -
								_function.proto.numparams - 1;
							if (b_VARARG == Lua.MULTRET)
							{
								// :todo: Protect
								// :todo: check stack
								b_VARARG = n_VARARG;
								this.stacksetsize(this._base + a + n_VARARG);
							}
							for (var j_VARARG:number = 0; j_VARARG < b_VARARG; ++j_VARARG)
							{
								if (j_VARARG < n_VARARG)
								{
									var src:Slot = this._stack[this._base - n_VARARG + j_VARARG] as Slot;
									(this._stack[this._base + a + j_VARARG] as Slot).r = src.r;
									(this._stack[this._base + a + j_VARARG] as Slot).d = src.d;
								}
								else
								{
									(this._stack[this._base + a + j_VARARG] as Slot).r = Lua.NIL;
								}
							}
							continue;
						}							
				} /* switch */
			} /* while */
		} /* reentry: while */
	}

	public static iNumpow(a:number, b:number):number
	{
		// :todo: this needs proper checking for boundary cases
		// EG, is currently wrong for (-0)^2.
		var invert:boolean = b < 0.0;
		if (invert) 
			b = -b;
		if (a == 0.0)
			return invert ? NaN : a ;
		var result:number = 1.0 ;
		var ipow:number = b as number;
		b -= ipow ;
		var t:number = a ;
		while (ipow > 0)
		{
			if ((ipow & 1) != 0)
				result *= t ;
			ipow >>= 1 ;
			t = t*t ;
		}
		if (b != 0.0) // integer only case, save doing unnecessary work
		{
			if (a < 0.0)  // doesn't work if a negative (complex result!)
				return NaN;
			t = Math.sqrt(a);
			var half:number = 0.5;
			while (b > 0.0)
			{
				if (b >= half)
				{
					result = result * t ;
					b -= half ;
				}
				b = b+b ;
				t = Math.sqrt(t) ;
				if (t == 1.0)
					break ;
			}
		}
		return invert ?  1.0 / result : result ;
	}

	/** Equivalent of luaV_gettable. */
	private vmGettable(t:Object | null, key:Slot, val:Slot):void
	{
		var tm:Object | null;
		for (var loop:number = 0; loop < Lua.MAXTAGLOOP; ++loop)
		{
			if (t instanceof LuaTable)        // 't' is a table?
			{
				var h:LuaTable = t as LuaTable;
				h.__getlua(key, Lua.SPARE_SLOT);

				if (Lua.SPARE_SLOT.r != Lua.NIL)
				{
					val.r = Lua.SPARE_SLOT.r;
					val.d = Lua.SPARE_SLOT.d;
					return;
				}
				tm = this.tagmethod(h, "__index");
				if (tm == Lua.NIL)
				{
					val.r = Lua.NIL;
					return;
				}
				// else will try the tag method
			}
			else
			{
				tm = this.tagmethod(t, "__index");
				if (tm == Lua.NIL)
					this.gTypeerror(t, "index");
			}
			if (Lua.isFunction(tm))
			{
				Lua.SPARE_SLOT.setObject(t);
				this.callTMres(val, tm, Lua.SPARE_SLOT, key);
				return;
			}
			t = tm;     // else repeat with 'tm'
		}
		this.gRunerror("loop in gettable");
	}

	/** Equivalent of luaV_lessthan. */
	private vmLessthan(l:Slot, r:Slot):boolean
	{
		//TODO:
		//if (l.r.getClass() != r.r.getClass())
		if(typeof(l.r) != typeof(r.r))
		{
			this.gOrdererror(l, r);
		}
		else if (l.r == Lua.NUMBER)
		{
			return l.d < r.d;
		}
		else if (l.r instanceof String || (typeof(l.r) == 'string'))
		{
			// :todo: PUC-Rio use strcoll, maybe we should use something
			// equivalent.
			return (l.r as String) < (r.r as String); //TODO:compareTo
		}
		var res:number = this.call_orderTM(l, r, "__lt");
		if (res >= 0)
		{
			return res != 0;
		}
		return this.gOrdererror(l, r);
	}

	/** Equivalent of luaV_lessequal. */
	private vmLessequal(l:Slot, r:Slot):boolean
	{
		//TODO:
		//if (l.r.getClass() != r.r.getClass())
		if(typeof(l.r) != typeof(r.r))
		{
			this.gOrdererror(l, r);
		}
		else if (l.r == Lua.NUMBER)
		{
			return l.d <= r.d;
		}
		else if (l.r instanceof String || typeof(l.r) == 'string')
		{
			return (l.r as String) <= (r.r as String); //TODO: CompareTo
		}
		var res:number = this.call_orderTM(l, r, "__le");       // first try 'le'
		if (res >= 0)
		{
			return res != 0;
		}
		res = this.call_orderTM(r, l, "__lt");   // else try 'lt'
		if (res >= 0)
		{
			return res == 0;
		}
		return this.gOrdererror(l, r);
	}

	/**
	 * Equivalent of luaD_poscall.
	 * @param firstResult  stack index (absolute) of the first result
	 */
	private vmPoscall(firstResult:number):boolean
	{
		// :todo: call hook
		var lci:CallInfo; // local copy, for faster access
		lci = this.dec_ci();
		// Now (as a result of the dec_ci call), lci is the CallInfo record
		// for the current function (the function executing an OP_RETURN
		// instruction), and this.ci is the CallInfo record for the function
		// we are returning to.
		var res:number = lci.res();
		var wanted:number = lci.nresults;        // Caution: wanted could be == MULTRET
		var cci:CallInfo = this.__ci();        // Continuation CallInfo
		this._base = cci.base;
		this._savedpc = cci.savedpc;
		// Move results (and pad with nils to required number if necessary)
		var i:number = wanted;
		var top:number = this._stackSize;
		// The movement is always downwards, so copying from the top-most
		// result first is always correct.
		while (i != 0 && firstResult < top)
		{
			(this._stack[res] as Slot).r = (this._stack[firstResult] as Slot).r;
			(this._stack[res] as Slot).d = (this._stack[firstResult] as Slot).d;
			++res;
			++firstResult;
			i--;
		}
		if (i > 0)
		{
			this.stacksetsize(res+i);
		}
		// :todo: consider using two stacksetsize calls to nil out
		// remaining required results.
		while (i-- > 0)
		{
			(this._stack[res++] as Slot).r = Lua.NIL;
		}
		this.stacksetsize(res);
		return wanted != Lua.MULTRET;
	}

	/**
	* Equivalent of LuaD_precall.  This method expects that the arguments
	* to the function are placed above the function on the stack.
	* @param func  absolute stack index of the function to call.
	* @param r     number of results expected.
	*/
	private vmPrecall(func:number, r:number):number
	{
		var faso:Object | null;        // Function AS Object
		faso = (this._stack[func] as Slot).r;
		if (!Lua.isFunction(faso))
		{
			faso = this.tryfuncTM(func);
		}
		this.__ci().savedpc = this._savedpc;
		if (faso instanceof LuaFunction)
		{
			var f:LuaFunction = faso as LuaFunction;
			var p:Proto = f.proto;
			// :todo: ensure enough stack
			
			if (!p.isVararg)
			{
				this._base = func + 1;
				if (this._stackSize > this._base + p.numparams)
				{
					// trim stack to the argument list
					this.stacksetsize(this._base + p.numparams);
				}
			}
			else
			{
				var nargs:number = (this._stackSize - func) - 1;
				this._base = this.adjust_varargs(p, nargs);
			}

			var top:number = this._base + p.maxstacksize;
			this.inc_ci(func, this._base, top, r);
		
			this._savedpc = 0;
			// expand stack to the function's max stack size.
			this.stacksetsize(top);
			// :todo: implement call hook.
			return Lua.PCRLUA;
		}
		else if (faso instanceof LuaJavaCallback)
		{
			var fj:LuaJavaCallback = faso as LuaJavaCallback;
			// :todo: checkstack (not sure it's necessary)
			this._base = func + 1;
			this.inc_ci(func, this._base, this._stackSize + Lua.MINSTACK, r);
			// :todo: call hook
			var n:number = 99;
			try
			{
				n = fj.luaFunction(this);
			}
			catch (e1)
			{
				if (e1 instanceof LuaError) {
					console.log((e1 as LuaError).stack);
					throw e1;
				} else if (e1 instanceof RuntimeException) {
					console.log((e1 as RuntimeException).stack);
					this.yield(0);
					throw e1;
				}
			}
			if (n < 0)        // yielding?
			{
				return Lua.PCRYIELD;
			}
			else
			{
				this.vmPoscall(this._stackSize - n);
				return Lua.PCRJ;
			}
		}
		
		throw new IllegalArgumentException();
	}

	/** Equivalent of luaV_settable. */
	private vmSettable(t:Object | null, key:Slot, val:Object | null):void
	{
		for (var loop:number = 0; loop < Lua.MAXTAGLOOP; ++loop)
		{
			var tm:Object | null;
			if (t instanceof LuaTable) // 't' is a table
			{
				var h:LuaTable = t as LuaTable;
				h.__getlua(key, Lua.SPARE_SLOT);
				if (Lua.SPARE_SLOT.r != Lua.NIL)   // result is not nil?
				{
					h.putluaSlot(this, key, val);
					return;
				}
				tm = this.tagmethod(h, "__newindex");
				if (tm == Lua.NIL)  // or no TM?
				{
					h.putluaSlot(this, key, val);
					return;
				}
				// else will try the tag method
			}
			else
			{
				tm = this.tagmethod(t, "__newindex");
				if (tm == Lua.NIL)
					this.gTypeerror(t, "index");
			}
			if (Lua.isFunction(tm))
			{
				this.callTM(tm, t, key, val);
				return;
			}
			t = tm;     // else repeat with 'tm'
		}
		this.gRunerror("loop in settable");
	}

	/**
	* Printf format item used to convert numbers to strings (in {@link
	* #vmTostring}).  The initial '%' should be not specified.
	*/
	private static NUMBER_FMT:string = ".14g";

	private static vmTostring(o:Object | null):string | null
	{
		if (o instanceof String || typeof(o) == 'string')
		{
			return o.toString() as string;
		}
		if (!(o instanceof Number || typeof(o) == 'number'))
		{
			return null;
		}
		// Convert number to string.  PUC-Rio abstracts this operation into
		// a macro, lua_number2str.  The macro is only invoked from their
		// equivalent of this code.
		// Formerly this code used Double.toString (and remove any trailing
		// ".0") but this does not give an accurate emulation of the PUC-Rio
		// behaviour which Intuwave require.  So now we use "%.14g" like
		// PUC-Rio.
		// :todo: consider optimisation of making FormatItem an immutable
		// class and keeping a static reference to the required instance
		// (which never changes).  A possible half-way house would be to
		// create a copied instance from an already create prototype
		// instance which would be faster than parsing the format string
		// each time.
		var f:FormatItem = new FormatItem(null, Lua.NUMBER_FMT);
		var b:StringBuffer = new StringBuffer();
		var d:number = o as number;
		f.formatFloat(b, d as number);
		return b.toString();
	}

	/** Equivalent of adjust_varargs in "ldo.c". */
	private adjust_varargs(p:Proto, actual:number):number
	{
		var nfixargs:number = p.numparams;
		for (; actual < nfixargs; ++actual)
		{
			this.stackAdd(Lua.NIL);
		}
		// PUC-Rio's LUA_COMPAT_VARARG is not supported here.

		// Move fixed parameters to final position
		var fixed:number = this._stackSize - actual;  // first fixed argument
		var newbase:number = this._stackSize; // final position of first argument
		for (var i:number = 0; i < nfixargs; ++i)
		{
			// :todo: arraycopy?
			this.pushSlot(this._stack[fixed + i] as Slot);
			(this._stack[fixed + i] as Slot).r = Lua.NIL;
		}
		return newbase;
	}

	/**
	 * Does not modify contents of p1 or p2.  Modifies contents of res.
	 * @param p1  left hand operand.
	 * @param p2  right hand operand.
	 * @param res absolute stack index of result.
	 * @return false if no tagmethod, true otherwise
	 */
	private call_binTM(p1:Slot, p2:Slot, res:Slot, event:string):boolean
	{
		var tm:Object | null = this.tagmethod(p1.asObject(), event);        // try first operand
		if (Lua.isNil(tm))
		{
			tm = this.tagmethod(p2.asObject(), event);     // try second operand
		}
		if (!Lua.isFunction(tm))
		{
			return false;
		}
		this.callTMres(res, tm, p1, p2);
		return true;
	}

	/**
	* @return -1 if no tagmethod, 0 false, 1 true
	*/
	private call_orderTM(p1:Slot, p2:Slot, event:string):number
	{
		var tm1:Object | null = this.tagmethod(p1.asObject(), event);
		if (tm1 == Lua.NIL)     // not metamethod
		{
			return -1;
		}
		var tm2:Object | null = this.tagmethod(p2.asObject(), event);
		if (!Lua.oRawequal(tm1, tm2))   // different metamethods?
		{
			return -1;
		}
		var s:Slot = new Slot();
		this.callTMres(s, tm1, p1, p2);
		return this.isFalse(s.r) ? 0 : 1;
	}

	private callTM(f:Object | null, p1:Object | null, p2:Slot, p3:Object | null):void 
	{
		this.pushObject(f);
		this.pushObject(p1);
		this.pushSlot(p2);
		this.pushObject(p3);
		this.vmCall(this._stackSize - 4, 0);
	}

	private callTMres(res:Slot, f:Object | null, p1:Slot, p2:Slot):void
	{
		this.pushObject(f);
		this.pushSlot(p1);
		this.pushSlot(p2);
		this.vmCall(this._stackSize - 3, 1);
		res.r = (this._stack[this._stackSize - 1] as Slot).r;
		res.d = (this._stack[this._stackSize - 1] as Slot).d;
		this.pop(1);
	}

	/**
	 * Overloaded version of callTMres used by {@link #vmEqualRef}.
	 * Textuall identical, but a different (overloaded) push method is
	 * invoked.
	 */
	private __callTMres(res:Slot, f:Object | null, p1:Object, p2:Object | null):void
	{
		this.pushObject(f);
		this.pushObject(p1);
		this.pushObject(p2);
		this.vmCall(this._stackSize - 3, 1);
		res.r = (this._stack[this._stackSize - 1] as Slot).r;
		res.d = (this._stack[this._stackSize - 1] as Slot).d;
		this.pop(1);
	}

	private get_compTM(mt1:LuaTable | null, mt2:LuaTable | null, event:string):Object | null
	{
		if (mt1 == null)
		{
			return Lua.NIL;
		}
		var tm1:Object | null = mt1.getlua(event);
		if (Lua.isNil(tm1))
		{
			return Lua.NIL;       // no metamethod
		}
		if (mt1 == mt2)
		{
			return tm1;       // same metatables => same metamethods
		}
		if (mt2 == null)
		{
			return Lua.NIL;
		}
		var tm2:Object | null = mt2.getlua(event);
		if (Lua.isNil(tm2))
		{
			return Lua.NIL;       // no metamethod
		}
		if (Lua.oRawequal(tm1, tm2))    // same metamethods?
		{
			return tm1;
		}
		return Lua.NIL;
	}

	/**
	* Gets tagmethod for object.
	* @return method or nil.
	*/
	private tagmethod(o:Object | null, event:string | null):Object | null
	{
		return this.getMetafield(o, event);
	}

	/** @deprecated DO NOT CALL */
	private __tagmethod(o:Slot, event:String):Object
	{
		throw new IllegalArgumentException("tagmethod called");
	}

	/**
	* Computes the result of Lua's modules operator (%).  Note that this
	* modulus operator does not match Java's %.
	*/
	private static __modulus(x:number, y:number):number
	{
		return x - Math.floor(x / y) * y;
	}

	/**
	* Changes the stack size, padding with NIL where necessary, and
	* allocate a new stack array if necessary.
	*/
	private stacksetsize(n:number):void
	{
		if(n == 3)
		{
			if (Lua.D)
			{
				console.log("stacksetsize:" + n);
			}
		}
		//20170402:added
		if (n == 7)
		{
			if (Lua.D)
			{
				console.log(">>>stacksetsize:" + n);
			}
		}
		// It is absolutely critical that when the stack changes sizes those
		// elements that are common to both old and new stack are unchanged.

		// First implementation of this simply ensures that the stack array
		// has at least the required size number of elements.
		// :todo: consider policies where the stack may also shrink.
		var old:number = this._stackSize;
		if (n > this._stack.length)
		{
			//以2倍速度增加堆栈的深度
			var newLength:number = Math.max(n, 2 * this._stack.length);
			var newStack:Slot[] = new Array(newLength); //Slot[] 
			// Currently the stack only ever grows, so the number of items to
			// copy is the length of the old stack.
			var toCopy:number = this._stack.length;
			SystemUtil.arraycopy(this._stack, 0, newStack, 0, toCopy);
			//trace(newStack[0]);
			this._stack = newStack;
		}
		this._stackSize = n;
		// Nilling out.  The VM requires that fresh stack slots allocated
		// for a new function activation are initialised to nil (which is
		// Lua.NIL, which is not Java null).
		// There are basically two approaches: nil out when the stack grows,
		// or nil out when it shrinks.  Nilling out when the stack grows is
		// slightly simpler, but nilling out when the stack shrinks means
		// that semantic garbage is not retained by the GC.
		// We nil out slots when the stack shrinks, but we also need to make
		// sure they are nil initially.
		// In order to avoid nilling the entire array when we allocate one
		// we maintain a stackhighwater which is 1 more than that largest
		// stack slot that has been nilled.  We use this to nil out stacks
		// slow when we grow.
		if (n <= old)
		{
			// when shrinking
			for (var i:number = n; i < old; ++i)
			{
				(this._stack[i] as Slot).r = Lua.NIL;
			}
		}
		if (n > this._stackhighwater)
		{
			// when growing above stackhighwater for the first time
			for (i = this._stackhighwater; i < n; ++i)
			{
				this._stack[i] = new Slot();
				(this._stack[i] as Slot).r = Lua.NIL;
			}
			this._stackhighwater = n;
		}
	}
		
	/**
	 * Pushes a Lua value onto the stack.
	 * 压入一个Lua值进堆栈
	 */
	private stackAdd(o:Object | null):void
	{
		var i:number = this._stackSize;
		this.stacksetsize(i + 1);
		(this._stack[i] as Slot).setObject(o);
	}

	/**
	 * Copies a slot into a new space in the stack.
	 */
	private pushSlot(p:Slot):void 
	{
		var i:number = this._stackSize;
		this.stacksetsize(i + 1);
		(this._stack[i] as Slot).r = p.r;
		(this._stack[i] as Slot).d = p.d;
	}

	private stackInsertAt(o:Object | null, i:number):void 
	{
		var n:number = this._stackSize - i;
		this.stacksetsize(this._stackSize + 1);
		// Copy each slot N into its neighbour N+1.  Loop proceeds from high
		// index slots to lower index slots.
		// A loop from n to 1 copies n slots.
		for (var j:number = n; j >= 1; --j)
		{
			(this._stack[i + j] as Slot).r = (this._stack[i + j - 1] as Slot).r;
			(this._stack[i + j] as Slot).d = (this._stack[i + j - 1] as Slot).d;
		}
		(this._stack[i] as Slot).setObject(o);
	}

	/**
	* Equivalent of macro in ldebug.h.
	*/
	private resethookcount():void
	{
		this._hookcount = this._basehookcount;
	}

	/**
	 * Equivalent of traceexec in lvm.c.
	 */
	private traceexec(pc:number):void
	{
		var mask:number = this._hookmask;
		var oldpc:number = this._savedpc;
		this._savedpc = pc;
		if (mask > Lua.MASKLINE)        // instruction-hook set?
		{
			if (this._hookcount == 0)
			{
				this.resethookcount();
				this.dCallhook(Lua.HOOKCOUNT, -1);
			}
		}
		// :todo: line hook.
	}

	/**
	* Convert to number.  Returns true if the argument <var>o</var> was
	* converted to a number.  Converted number is placed in <var>out[0]</var>.
	* Returns
	* false if the argument <var>o</var> could not be converted to a number.
	* Overloaded.
	*/
	private static tonumber(o:Slot, out:number[] /*double[] */):boolean
	{
		if (o.r == Lua.NUMBER)
		{
			out[0] = o.d;
			return true;
		}
		if (!(o.r instanceof String || typeof(o.r) == 'string'))
		{
			return false;
		}
		if (Lua.oStr2d(o.r as string, out))
		{
			return true;
		}
		return false;
	}

	/**
	 * Converts a stack slot to number.  Returns true if the element at
	 * the specified stack slot was converted to a number.  False
	 * otherwise.  Note that this actually modifies the element stored at
	 * <var>idx</var> in the stack (in faithful emulation of the PUC-Rio
	 * code).  Corrupts <code>NUMOP[0]</code>.  Overloaded.
	 * @param idx  absolute stack slot.
	 */
	private tonumber(idx:number):boolean
	{
		if (Lua.tonumber(this._stack[idx] as Slot, Lua.NUMOP))
		{
			(this._stack[idx] as Slot).d = Lua.NUMOP[0] as number;
			(this._stack[idx] as Slot).r = Lua.NUMBER;
			return true;
		}
		return false;
	}

	/**
	 * Convert a pair of operands for an arithmetic opcode.  Stores
	 * converted results in <code>out[0]</code> and <code>out[1]</code>.
	 * @return true if and only if both values converted to number.
	 */
	private static toNumberPair(x:Slot, y:Slot, out:number[] /*double[] */):boolean
	{
		if (this.tonumber(y, out))
		{
			out[1] = out[0];
			if (this.tonumber(x, out))
			{
				return true;
			}
		}
		return false;
	}

	/**
	 * Convert to string.  Returns true if element was number or string
	 * (the number will have been converted to a string), false otherwise.
	 * Note this actually modifies the element stored at <var>idx</var> in
	 * the stack (in faithful emulation of the PUC-Rio code), and when it
	 * returns <code>true</code>, <code>stack[idx].r instanceof String</code>
	 * is true.
	 */
	private tostring(idx:number):boolean 
	{
		// :todo: optimise
		var o:Object | null = this.objectAt(idx);
		var s:string | null = Lua.vmTostring(o);
		if (s == null)
		{
			return false;
		}
		(this._stack[idx] as Slot).r = s;
		return true;
	}

	/**
	 * Equivalent to tryfuncTM from ldo.c.
	 * @param func  absolute stack index of the function object.
	 */
	private tryfuncTM(func:number):Object | null
	{
		var tm:Object | null = this.tagmethod((this._stack[func] as Slot).asObject(), "__call");
		if (!Lua.isFunction(tm))
		{
			this.gTypeerror(this._stack[func] as Slot, "call");
		}
		this.stackInsertAt(tm, func);
		return tm;
	}

	/** Lua's is False predicate. */
	private isFalse(o:Object | null):boolean
	{
		return o == Lua.NIL || o == false;
	}

	/** @deprecated DO NOT CALL. */
	private __isFalse(o:Slot):boolean
	{
		throw new IllegalArgumentException("isFalse called");
	}

	/** Make new CallInfo record. */
	private inc_ci(func:number, baseArg:number, top:number, nresults:number):CallInfo
	{
		var ci:CallInfo = new CallInfo();
		ci.init(func, baseArg, top, nresults);
		this._civ.addElement(ci);
		return ci;
	}

	/** Pop topmost CallInfo record and return it. */
	private dec_ci():CallInfo
	{
		var ci:CallInfo = this._civ.pop() as CallInfo;
		return ci;
	}

	/** Equivalent to resume_error from ldo.c */
	private resume_error(msg:String):number
	{
		this.stacksetsize(this.__ci().base);
		this.stackAdd(msg);
		return Lua.ERRRUN;
	}

	/**
	 * Return the stack element as an Object.  Converts double values into
	 * Double objects.
	 * @param idx  absolute index into stack (0 <= idx < stackSize).
	 */
	private objectAt(idx:number):Object | null
	{
		var r:Object | null = (this._stack[idx] as Slot).r;
		if (r != Lua.NUMBER)
		{
			return r;
		}
		return new Number((this._stack[idx] as Slot).d);
	}

	/**
	 * Sets the stack element.  Double instances are converted to double.
	 * @param o  Object to store.
	 * @param idx  absolute index into stack (0 <= idx < stackSize).
	 */
	private setObjectAt(o:Object | null, idx:number):void
	{
		if (o instanceof Number)
		{
			(this._stack[idx] as Slot).r = Lua.NUMBER;
			(this._stack[idx] as Slot).d = o as number;
			return;
		}
		if (Lua.D)
		{
			console.log("setObjectAt(o, " + idx + ") from " + this._stack);
		}
		(this._stack[idx] as Slot).r = o;
	}

	/**
	 * Corresponds to ldump's luaU_dump method, but with data gone and writer
	 * replaced by OutputStream.
	 */
	public static uDump(f:Proto, writer:OutputStream | null, strip:boolean):number
		//throws IOException
	{
		var d:DumpState = new DumpState(new DataOutputStream(writer), strip) ;
		d.DumpHeader();
		d.DumpFunction(f, null);
		d.writer.flush();
		return 0;   // Any errors result in thrown exceptions.
	}
	
	public get global():LuaTable
	{
		return this._global;
	}
	
	public set global(global:LuaTable)
	{
		this._global = global;
	}
	
	//新增
	public set nCcalls(nCcalls:number)
	{
		this._nCcalls = nCcalls;
	}
	
	//新增
	public get nCcalls():number
	{
		return this._nCcalls;
	}
	
}
