import { ByteArray } from "../java/ByteArray";
import { StringBuffer } from "../java/StringBuffer";
import { ByteArrayOutputStream } from "../java/ByteArrayOutputStream";
import { LuaJavaCallback } from "./LuaJavaCallback";
import { FormatItem } from "./FormatItem";
import { Lua } from "./Lua";
import { LuaTable } from "./LuaTable";
import { MatchState } from "./MatchState";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/StringLib.java#1 $
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
 * Contains Lua's string library.
 * The library can be opened using the {@link #open} method.
 */
export class StringLib extends LuaJavaCallback
{
	// Each function in the string library corresponds to an instance of
	// this class which is associated (the 'which' member) with an integer
	// which is unique within this class.  They are taken from the following
	// set.
	private static BYTE:number = 1;
	private static CHAR:number = 2;
	private static DUMP:number = 3;
	private static FIND:number = 4;
	private static FORMAT:number = 5;
	private static GFIND:number = 6;
	private static GMATCH:number = 7;
	private static GSUB:number = 8;
	private static LEN:number = 9;
	private static LOWER:number = 10;
	private static MATCH:number = 11;
	private static REP:number = 12;
	private static REVERSE:number = 13;
	private static SUB:number = 14;
	private static UPPER:number = 15;
	
	private static GMATCH_AUX:number = 16;
	
	private static GMATCH_AUX_FUN:StringLib = new StringLib(StringLib.GMATCH_AUX);
	
	/**
	* Which library function this object represents.  This value should
	* be one of the "enums" defined in the class.
	*/
	private _which:number;
	
	/** Constructs instance, filling in the 'which' member. */
	public constructor(which:number) 
	{
		super();
		this._which = which;
	}
		
	/**
	 * Adjusts the output of string.format so that %e and %g use 'e'
	 * instead of 'E' to indicate the exponent.  In other words so that
	 * string.format follows the ISO C (ISO 9899) standard for printf.
	 */
	public formatISO():void
	{
		FormatItem.E_LOWER = 'e'.charCodeAt(0);
	}

	/**
	 * Implements all of the functions in the Lua string library.  Do not
	 * call directly.
	 * @param L  the Lua state in which to execute.
	 * @return number of returned parameters, as per convention.
	 */
	override luaFunction(L:Lua):number
	{
		switch (this._which)
		{
			case StringLib.BYTE:
				return StringLib.byteFunction(L);
			
			case StringLib.CHAR:
				return StringLib.charFunction(L);
			
			case StringLib.DUMP:
				return StringLib.dump(L);
			
			case StringLib.FIND:
				return StringLib.find(L);
			
			case StringLib.FORMAT:
				return StringLib.format(L);
			
			case StringLib.GMATCH:
				return StringLib.gmatch(L);
			
			case StringLib.GSUB:
				return StringLib.gsub(L);
			
			case StringLib.LEN:
				return StringLib.len(L);
			
			case StringLib.LOWER:
				return StringLib.lower(L);
			
			case StringLib.MATCH:
				return StringLib.match(L);
			
			case StringLib.REP:
				return StringLib.rep(L);
			
			case StringLib.REVERSE:
				return StringLib.reverse(L);
			
			case StringLib.SUB:
				return StringLib.sub(L);
			
			case StringLib.UPPER:
				return StringLib.upper(L);
			
			case StringLib.GMATCH_AUX:
				return StringLib.gmatchaux(L);
		}
		return 0;
	}
	
	/**
	 * Opens the string library into the given Lua state.  This registers
	 * the symbols of the string library in a newly created table called
	 * "string".
	 * @param L  The Lua state into which to open.
	 */
	public static open(L:Lua):void
	{
		var lib:Object = L.__register("string");
		
		StringLib.r(L, "byte", StringLib.BYTE);
		StringLib.r(L, "char", StringLib.CHAR);
		StringLib.r(L, "dump", StringLib.DUMP);
		StringLib.r(L, "find", StringLib.FIND);
		StringLib.r(L, "format", StringLib.FORMAT);
		StringLib.r(L, "gfind", StringLib.GFIND);
		StringLib.r(L, "gmatch", StringLib.GMATCH);
		StringLib.r(L, "gsub", StringLib.GSUB);
		StringLib.r(L, "len", StringLib.LEN);
		StringLib.r(L, "lower", StringLib.LOWER);
		StringLib.r(L, "match", StringLib.MATCH);
		StringLib.r(L, "rep", StringLib.REP);
		StringLib.r(L, "reverse", StringLib.REVERSE);
		StringLib.r(L, "sub", StringLib.SUB);
		StringLib.r(L, "upper", StringLib.UPPER);

		var mt:LuaTable = new LuaTable();
		L.setMetatable("", mt);     // set string metatable
		L.setField(mt, "__index", lib);
	}
	
	/** Register a function. */
	private static r(L:Lua, name:string, which:number):void
	{
		var f:StringLib = new StringLib(which);
		var lib:Object | null = L.getGlobal("string");
		L.setField(lib, name, f);
	}
		
	/** Implements string.byte.  Name mangled to avoid keyword. */
	private static byteFunction(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		var posi:number = StringLib.posrelat(L.optInt(2, 1), s);
		var pose:number = StringLib.posrelat(L.optInt(3, posi), s);
		if (posi <= 0)
		{
			posi = 1;
		}
		if (pose > s!.length)
		{
			pose = s!.length;
		}
		if (posi > pose)
		{
			return 0; // empty interval; return no values
		}
		var n:number = pose - posi + 1;
		for (var i:number = 0; i < n; ++i)
		{
			L.pushNumber(s!.charCodeAt(posi+i-1));
		}
		return n;
	}
		
	/** Implements string.char.  Name mangled to avoid keyword. */
	private static charFunction(L:Lua):number
	{
		var n:number = L.getTop(); // number of arguments
		var b:StringBuffer = new StringBuffer();
		for (var i:number = 1; i <= n; ++i)
		{
			var c:number = L.checkInt(i);
			L.argCheck(c as number == c, i, "invalid value");
			b.append(c as number);
		}
		L.pushString(b.toString());
		return 1;
	}

	/** Implements string.dump. */
	private static dump(L:Lua):number
	{
		L.checkType(1, Lua.TFUNCTION);
		L.setTop(1);
		try
		{
			var s:ByteArrayOutputStream | null = new ByteArrayOutputStream();
			Lua.dump(L.value(1), s);
			var a:ByteArray/*byte[]*/ = s.toByteArray();
			s = null;
			var b:StringBuffer = new StringBuffer();
			for (var i:number=0; i<a.length; ++i)
			{
				b.append((a.get(i) & 0xff) as number);
			}
			L.pushString(b.toString());
			return 1;
		}
		catch (e_)
		{
			if (e_ instanceof Error) {
				console.log((e_ as Error).stack);
			}
			L.error("unabe to dump given function");
		}
		// NOTREACHED
		return 0;
	}

	/** Helper for find and match.  Equivalent to str_find_aux. */
	private static findAux(L:Lua, isFind:boolean):number
	{
		var s:string | null = L.checkString(1);
		var p:string | null = L.checkString(2);
		var l1:number = s!.length;
		var l2:number = p!.length;
		var init:number = StringLib.posrelat(L.optInt(3, 1), s) - 1;
		if (init < 0)
		{
			init = 0;
		}
		else if (init > l1)
		{
			init = l1;
		}
		if (isFind && (L.toBoolean(L.value(4)) ||   // explicit request
			StringLib.strpbrk(p, MatchState.SPECIALS) < 0)) // or no special characters?
		{   // do a plain search
			var off:number = StringLib.lmemfind(s!.substring(init), l1-init, p, l2);
			if (off >= 0)
			{
				L.pushNumber(init+off+1);
				L.pushNumber(init+off+l2);
				return 2;
			}
		}
		else
		{
			var ms:MatchState = new MatchState(L, s, l1);
			var anchor:boolean = p!.charAt(0) == '^';
			var si:number = init;
			do
			{
				ms.level = 0;
				var res:number = ms.match(si, p, anchor ? 1 : 0);
				if (res >= 0)
				{
					if (isFind)
					{
						L.pushNumber(si + 1);       // start
						L.pushNumber(res);          // end
						return ms.push_captures(-1, -1) + 2;
					}     // else
					return ms.push_captures(si, res);
				}
			} while (si++ < ms.end && !anchor);
		}
		L.pushNil();        // not found
		return 1;
	}
		
	/** Implements string.find. */
	private static find(L:Lua):number
	{
		return StringLib.findAux(L, true);
	}

	/** Implement string.match.  Operates slightly differently from the
	 * PUC-Rio code because instead of storing the iteration state as
	 * upvalues of the C closure the iteration state is stored in an
	 * Object[3] and kept on the stack.
	 */
	private static gmatch(L:Lua):number
	{
		var state:any[] = new Array(3); //Object[]
		state[0] = L.checkString(1);
		state[1] = L.checkString(2);
		state[2] = 0;
		L.pushObject(StringLib.GMATCH_AUX_FUN);
		L.pushObject(state);
		return 2;
	}
		
	/**
	 * Expects the iteration state, an Object[3] (see {@link
	 * #gmatch}), to be first on the stack.
	 */
	private static gmatchaux(L:Lua):number
	{
		var state:Object[] = L.value(1) as Object[]; //Object[] 
		var s:string = state[0] as string;
		var p:string = state[1] as string;
		var i:number = state[2] as number;
		var ms:MatchState = new MatchState(L, s, s.length);
		for ( ; i <= ms.end ; ++i)
		{
			ms.level = 0;
			var e:number = ms.match(i, p, 0);
			if (e >= 0)
			{
				var newstart:number = e;
				if (e == i)     // empty match?
					++newstart;   // go at least one position
				state[2] = parseInt(newstart.toFixed(0));
				return ms.push_captures(i, e);
			}
		}
		return 0;   // not found.
	}

	/** Implements string.gsub. */
	private static gsub(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		var sl:number = s!.length;
		var p:string | null = L.checkString(2);
		var maxn:number = L.optInt(4, sl+1);
		var anchor:boolean = false;
		if (p!.length > 0)
		{
			anchor = p!.charAt(0) == '^';
		}
		if (anchor)
			p = p!.substring(1);
		var ms:MatchState = new MatchState(L, s, sl);
		var b:StringBuffer = new StringBuffer();
		
		var n:number = 0;
		var si:number = 0;
		while (n < maxn)
		{
			ms.level = 0;
			var e:number = ms.match(si, p, 0);
			if (e >= 0)
			{
				++n;
				ms.addvalue(b, si, e);
			}
			if (e >= 0 && e > si)     // non empty match?
				si = e; // skip it
			else if (si < ms.end)
				b.append(s!.charCodeAt(si++));
			else
				break;
			if (anchor)
				break;
		}
		b.appendString(s!.substring(si));
		L.pushString(b.toString());
		L.pushNumber(n);    // number of substitutions
		return 2;
	}

	public static addquoted(L:Lua, b:StringBuffer, arg:number):void
	{
		var s:string | null = L.checkString(arg);
		var l:number = s!.length;
		b.append('"'.charCodeAt(0));
		for (var i:number = 0; i < l; ++i)
		{
			switch (s!.charAt(i))
			{
				case '"': case '\\': case '\n':
					b.append('\\'.charCodeAt(0));
					b.append(s!.charCodeAt(i));
					break;

				case '\r':
					b.appendString("\\r");
					break;
			
				case '\0':
					b.appendString("\\u0000"/*"\\000"*/);
					break;

				default:
					b.append(s!.charCodeAt(i));
					break;
			}
		}
		b.append('"'.charCodeAt(0));
	}

	public static format(L:Lua):number
	{
		var arg:number = 1;
		var strfrmt:string | null = L.checkString(1);
		var sfl:number = strfrmt!.length;
		var b:StringBuffer = new StringBuffer();
		var i:number = 0;
		while (i < sfl)
		{
			if (strfrmt!.charCodeAt(i) != MatchState.L_ESC)
			{
				b.append(strfrmt!.charCodeAt(i++));
			}
			else if (strfrmt!.charCodeAt(++i) == MatchState.L_ESC)
			{
				b.append(strfrmt!.charCodeAt(i++));
			}
			else      // format item
			{
				++arg;
				var item:FormatItem = new FormatItem(L, strfrmt!.substring(i));
				i += item.length;
				switch (String.fromCharCode(item.type))
				{
					case 'c':
						item.formatChar(b, L.checkNumber(arg) as number);
						break;
				
					case 'd': case 'i':
					case 'o': case 'u': case 'x': case 'X':
						// :todo: should be unsigned conversions cope better with
						// negative number?
						item.formatInteger(b, L.checkNumber(arg) as number);
						break;

					case 'e': case 'E': case 'f':
					case 'g': case 'G':
						item.formatFloat(b, L.checkNumber(arg));
						break;

					case 'q':
						StringLib.addquoted(L, b, arg);
						break;

					case 's':
						item.formatString(b, L.checkString(arg));
						break;

					default:
						return L.error("invalid option to 'format'");
				}
			}
		}
		L.pushString(b.toString());
		return 1;
	}
		
	/** Implements string.len. */
	private static len(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		L.pushNumber(s!.length);
		return 1;
	}

	/** Implements string.lower. */
	private static lower(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		L.pushString(s!.toLowerCase());
		return 1;
	}

	/** Implements string.match. */
	private static match(L:Lua):number
	{
		return StringLib.findAux(L, false);
	}

	/** Implements string.rep. */
	private static rep(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		var n:number = L.checkInt(2);
		var b:StringBuffer = new StringBuffer();
		for (var i:number = 0; i < n; ++i)
		{
			b.appendString(s);
		}
		L.pushString(b.toString());
		return 1;
	}

	/** Implements string.reverse. */
	private static reverse(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		var b:StringBuffer = new StringBuffer();
		var l:number = s!.length;
		while (--l >= 0)
		{
			b.append(s!.charCodeAt(l));
		}
		L.pushString(b.toString());
		return 1;
	}
		
	/** Helper for {@link #sub} and friends. */
	private static posrelat(pos:number, s:string | null):number
	{
		if (pos >= 0)
		{
			return pos;
		}
		var len:number = s!.length;
		return len+pos+1;
	}
		
	/** Implements string.sub. */
	private static sub(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		var start:number = StringLib.posrelat(L.checkInt(2), s);
		var end:number = StringLib.posrelat(L.optInt(3, -1), s);
		if (start < 1)
		{
			start = 1;
		}
		if (end > s!.length)
		{
			end = s!.length;
		}
		if (start <= end)
		{
			L.pushString(s!.substring(start-1, end));
		}
		else
		{
			L.pushLiteral("");
		}
		return 1;
	}
	
	/** Implements string.upper. */
	private static upper(L:Lua):number
	{
		var s:string | null = L.checkString(1);
		L.pushString(s!.toUpperCase());
		return 1;
	}
		
	/**
	 * @return  character index of start of match (-1 if no match).
	 */
	private static lmemfind(s1:string, l1:number, s2:string | null, l2:number):number
	{
		if (l2 == 0)
		{
			return 0; // empty strings are everywhere
		}
		else if (l2 > l1)
		{
			return -1;        // avoids a negative l1
		}
		return s1.indexOf(s2!);
	}
		
	/**
	 * Just like C's strpbrk.
	 * @return an index into <var>s</var> or -1 for no match.
	 */
	private static strpbrk(s:string | null, _set:string):number
	{
		var l:number = _set.length;
		for (var i:number = 0; i < l; ++i)
		{
			var idx:number = s!.indexOf(_set.charAt(i));
			if (idx >= 0)
				return idx;
		}
		return -1;
	}
}
