import { FuncState } from "./FuncState";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Expdesc.java#1 $
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

/** Equivalent to struct expdesc. */
export class Expdesc extends Object
{
	public static VVOID:number = 0;           // no value
	public static VNIL:number = 1;
	public static VTRUE:number = 2;
	public static VFALSE:number = 3;
	public static VK:number = 4;              // info = index into 'k'
	public static VKNUM:number = 5;           // nval = numerical value
	public static VLOCAL:number = 6;          // info = local register
	public static VUPVAL:number = 7;          // info = index into 'upvalues'
	public static VGLOBAL:number = 8;         // info = index of table;
													// aux = index of global name in 'k'
	public static VINDEXED:number = 9;        // info = table register
													// aux = index register (or 'k')
	public static VJMP:number = 10;           // info = instruction pc
	public static VRELOCABLE:number = 11;     // info = instruction pc
	public static VNONRELOC:number = 12;      // info = result register
	public static VCALL:number = 13;          // info = instruction pc
	public static VVARARG:number = 14;        // info = instruction pc

	private _k:number = 0;        // one of V* enums above
	private _info:number = 0;
	private _aux:number = 0;
	private _nval:number = 0;
	private _t:number = 0;
	private _f:number = 0;
	
	//TODO:
	public constructor() 
	{
		super();
	}
	
	//public function Expdesc(k:int, i:int):void
	//{
		//init(k, i);
	//}

	/** Equivalent to init_exp from lparser.c */
	public init(kind:number, i:number):void
	{
		this._t = FuncState.NO_JUMP;
		this._f = FuncState.NO_JUMP;
		this._k = kind;
		this._info = i;
	}
	
	public copy(e:Expdesc):void
	{
		// Must initialise all members of this.
		this._k = e._k;
		this._info = e._info;
		this._aux = e._aux;
		this._nval = e._nval;
		this._t = e._t;
		this._f = e._f;
	}

	public get kind():number
	{
		return this._k;
	}

	public set kind(kind:number)
	{
		this._k = kind;
	}

	public get k():number
	{
		return this._k;
	}

	public set k(kind:number)
	{
		this._k = kind;
	}
	
	public get info():number
	{
		return this._info;
	}

	public set info(i:number)
	{
		this._info = i;
	}

	public get aux():number
	{
		return this._aux;
	}
	
	public set aux(aux:number)
	{
		this._aux = aux;
	}
	
	public get nval():number
	{
		return this._nval;
	}

	public set nval(d:number)
	{
		this._nval = d;
	}

	/** Equivalent to hasmultret from lparser.c */
	public hasmultret():boolean
	{
		return this._k == Expdesc.VCALL || this._k == Expdesc.VVARARG;
	}

	/** Equivalent to hasjumps from lcode.c. */
	public hasjumps():boolean
	{
		return this._t != this._f;
	}

	public nonreloc(i:number):void
	{
		this._k = Expdesc.VNONRELOC;
		this._info = i;
	}

	public reloc(i:number):void
	{
		this._k = Expdesc.VRELOCABLE;
		this._info = i;
	}

	public upval(i:number):void
	{
		this._k = Expdesc.VUPVAL;
		this._info = i;
	}
	
	//新增
	public get f():number
	{
		return this._f;
	}
	
	//新增
	public set f(f:number)
	{
		this._f = f;
	}

	//新增
	public get t():number
	{
		return this._t;
	}
	
	//新增
	public set t(t:number)
	{
		this._t = t;
	}
	
}
