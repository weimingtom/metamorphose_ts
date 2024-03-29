import { Enumeration } from "../java/Enumeration";
import { LuaTable } from "./LuaTable";
import { Lua } from "./Lua";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Syntax.java#1 $
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

export class Enum implements Enumeration
{
	private _t:LuaTable;
	private _i:number = 0;        // = 0
	private _e:Enumeration;
	
	public constructor(t:LuaTable, e:Enumeration)
	{
		this._t = t;
		this._e = e;
		this.inci();
	}
	
	/**
	* Increments {@link #i} until it either exceeds
	* <code>t.sizeArray</code> or indexes a non-nil element.
	*/
	public inci():void
	{
		while (this._i < this._t.sizeArray && this._t.array[this._i] == Lua.NIL)
		{
			++this._i;
		}
	}

	public hasMoreElements():boolean
	{
		if (this._i < this._t.sizeArray)
		{
			return true;
		}
		return this._e.hasMoreElements();
	}

	public nextElement():Object | null
	{
		var r:Object | null;
		if (this._i < this._t.sizeArray)
		{
			++this._i;      // array index i corresponds to key i+1
			r = new Number(this._i);
			this.inci();
		}
		else
		{
			r = this._e.nextElement();
		}
		return r;
	}
}
