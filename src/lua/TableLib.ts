import { LuaJavaCallback } from "./LuaJavaCallback";
import { Enumeration } from "../java/Enumeration";
import { StringBuffer } from "../java/StringBuffer";
import { Lua } from "./Lua";
import { LuaTable } from "./LuaTable";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/TableLib.java#1 $
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
 * Contains Lua's table library.
 * The library can be opened using the {@link #open} method.
 */
export class TableLib extends LuaJavaCallback
{
	
	// Each function in the table library corresponds to an instance of
	// this class which is associated (the 'which' member) with an integer
	// which is unique within this class.  They are taken from the following
	// set.  
	
	private static CONCAT:number = 1;
	private static INSERT:number = 2;
	private static MAXN:number = 3;
	private static REMOVE:number = 4;
	private static SORT:number = 5;
	private static GETN:number = 6;

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
	 * Implements all of the functions in the Lua table library.  Do not
	 * call directly.
	 * @param L  the Lua state in which to execute.
	 * @return number of returned parameters, as per convention.
	 */
	override luaFunction(L:Lua):number
	{
		switch (this._which)
		{
			case TableLib.CONCAT:
				return TableLib.concat(L);
		
			case TableLib.INSERT:
				return TableLib.insert(L);
		
			case TableLib.MAXN:
				return TableLib.maxn(L);
		
			case TableLib.REMOVE:
				return TableLib.remove(L);
		
			case TableLib.SORT:
				return TableLib.sort(L);
				
			//FIXME: added
			case TableLib.GETN:
				return TableLib.getn(L);	
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
		L.__register("table");

		TableLib.r(L, "concat", TableLib.CONCAT);
		TableLib.r(L, "insert", TableLib.INSERT);
		TableLib.r(L, "getn", TableLib.GETN); //FIXME: added
		TableLib.r(L, "maxn", TableLib.MAXN);
		TableLib.r(L, "remove", TableLib.REMOVE);
		TableLib.r(L, "sort", TableLib.SORT);
	}

	/** Register a function. */
	private static r(L:Lua, name:string, which:number):void
	{
		var f:TableLib = new TableLib(which);
		var lib:Object | null = L.getGlobal("table");
		L.setField(lib, name, f);
	}

	/** Implements table.concat. */
	private static concat(L:Lua):number
	{
		var sep:string | null = L.optString(2, "");
		L.checkType(1, Lua.TTABLE);
		var i:number = L.optInt(3, 1);
		var last:number = L.optInt(4, Lua.objLen(L.value(1)));
		var b:StringBuffer = new StringBuffer();
		var t:Object | null = L.value(1);
		for (; i <= last; ++i)
		{
			var v:Object | null = Lua.rawGetI(t, i);
			L.argCheck(Lua.isString(v), 1, "table contains non-strings");
			b.appendString(L.toString_(v));
			if (i != last)
				b.appendString(L.toString_(sep));
		}
		L.pushString(b.toString());
		return 1;
	}

	/** Implements table.insert. */
	private static insert(L:Lua):number
	{
		var e:number = TableLib.aux_getn(L, 1) + 1; // first empty element
		var pos:number;    // where to insert new element
		var t:Object | null = L.value(1);
	
		switch (L.getTop())
		{
			case 2:   // called with only 2 arguments
				pos = e;        // insert new element at the end
				break;

			case 3:
				{
					var i:number;
					pos = L.checkInt(2);  // 2nd argument is the position
					if (pos > e)
						e = pos;    // grow array if necessary
					for (i = e; i > pos; --i)     // move up elements
					{
						// t[i] = t[i-1]
						L.rawSetI(t, i, Lua.rawGetI(t, i-1));
					}
				}
				break;

			default:
				return L.error("wrong number of arguments to 'insert'");
		}
		L.rawSetI(t, pos, L.value(-1));     // t[pos] = v
		return 0;
	}

	/** Implements table.maxn. */
	private static maxn(L:Lua):number
	{
		var max:number = 0;
		L.checkType(1, Lua.TTABLE);
		var t:LuaTable = L.value(1) as LuaTable;
		var e:Enumeration = t.keys();
		while (e.hasMoreElements())
		{
			var o:Object | null = e.nextElement();
			if (Lua.____type(o) == Lua.TNUMBER)
			{
				var v:number = L.toNumber(o);
				if (v > max)
					max = v;
			}
		}
		L.pushNumber(max);
		return 1;
	}

	/** Implements table.remove. */
	private static remove(L:Lua):number
	{
		var e:number = TableLib.aux_getn(L, 1);
		var pos:number = L.optInt(2, e);
		if (e == 0)
			return 0;         // table is 'empty'
		var t:Object | null = L.value(1);
		var o:Object | null = Lua.rawGetI(t, pos);       // result = t[pos]
		for ( ; pos < e; ++pos)
		{
			L.rawSetI(t, pos, Lua.rawGetI(t, pos+1));   // t[pos] = t[pos+1]
		}
		L.rawSetI(t, e, Lua.NIL);   // t[e] = nil
		L.pushObject(o);
		return 1;
	}

	/** Implements table.sort. */
	private static sort(L:Lua):number
	{
		var n:number = TableLib.aux_getn(L, 1);
		if (!L.isNoneOrNil(2))      // is there a 2nd argument?
			L.checkType(2, Lua.TFUNCTION);
		L.setTop(2);        // make sure there is two arguments
		TableLib.auxsort(L, 1, n);
		return 0;
	}

	public static auxsort(L:Lua, l:number, u:number):void
	{
		var t:Object | null = L.value(1);
		while (l < u)       // for tail recursion
		{
			var i:number;
			var j:number;
			// sort elements a[l], a[l+u/2], and a[u]
			var o1:Object | null = Lua.rawGetI(t, l);
			var o2:Object | null = Lua.rawGetI(t, u);
			if (TableLib.sort_comp(L, o2, o1)) // a[u] < a[l]?
			{	
				L.rawSetI(t, l, o2);
				L.rawSetI(t, u, o1);
			}
			if (u-l == 1)
				break;  // only 2 elements
			i = (l+u)/2;
			o1 = Lua.rawGetI(t, i);
			o2 = Lua.rawGetI(t, l);
			if (TableLib.sort_comp(L, o1, o2)) // a[i]<a[l]?
			{
				L.rawSetI(t, i, o2);
				L.rawSetI(t, l, o1);
			}
			else
			{
				o2 = Lua.rawGetI(t, u);
				if (TableLib.sort_comp(L, o2, o1))       // a[u]<a[i]?
				{
					L.rawSetI(t, i, o2);
					L.rawSetI(t, u, o1);
				}
			}
			if (u-l == 2)
				break;  // only 3 elements
			var p:Object | null = Lua.rawGetI(t, i); // Pivot
			o2 = Lua.rawGetI(t, u-1);
			L.rawSetI(t, i, o2);
			L.rawSetI(t, u-1, p);
			// a[l] <= P == a[u-1] <= a[u], only need to sort from l+1 to u-2
			i = l;
			j = u-1;
			// NB: Pivot P is in p
			while (true)      // invariant: a[l..i] <= P <= a[j..u]
			{
				// repeat ++i until a[i] >= P
				while (true)
				{
					o1 = Lua.rawGetI(t, ++i);
					if (!TableLib.sort_comp(L, o1, p))
						break;
					if (i>u)
						L.error("invalid order function for sorting");
				}
				// repreat --j until a[j] <= P
				while (true)
				{
					o2 = Lua.rawGetI(t, --j);
					if (!TableLib.sort_comp(L, p, o2))
						break;
					if (j<l)
						L.error("invalid order function for sorting");
				}
				if (j < i)
					break;
				L.rawSetI(t, i, o2);
				L.rawSetI(t, j, o1);
			}
			o1 = Lua.rawGetI(t, u-1);
			o2 = Lua.rawGetI(t, i);
			L.rawSetI(t, u-1, o2);
			L.rawSetI(t, i, o1);      // swap pivot (a[u-1]) with a[i]
			// a[l..i-1 <= a[i] == P <= a[i+1..u]
			// adjust so that smaller half is in [j..i] and larger one in [l..u]
			if (i-l < u-i)
			{
				j = l;
				i = i - 1;
				l = i + 2;
			}
			else
			{
				j = i + 1;
				i = u;
				u = j - 2;
			}
			TableLib.auxsort(L, j, i); // call recursively the smaller one
		} // repeat the routine for the larger one
	}

	private static sort_comp(L:Lua, a:Object | null, b:Object | null):boolean
	{
		if (!Lua.isNil(L.value(2)))   // function?
		{
			L.pushValue(2);
			L.pushObject(a);
			L.pushObject(b);
			L.call(2, 1);
			var res:boolean = L.toBoolean(L.value(-1));
			L.pop(1);
			return res;
		}
		else        // a < b?
		{
			return L.lessThan(a, b);
		}
	}

	private static aux_getn(L:Lua, n:number):number
	{
		L.checkType(n, Lua.TTABLE);
		var t:LuaTable = L.value(n) as LuaTable;
		return t.getn();
	}
	
	//FIXME: added
	private static getn(L:Lua):number 
	{
		L.pushNumber(TableLib.aux_getn(L, 1));
		return 1;
	}
}
