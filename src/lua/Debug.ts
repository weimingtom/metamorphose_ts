import { Lua } from "./Lua";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Debug.java#1 $
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
 * Equivalent to struct lua_Debug.  This implementation is incomplete
 * because it is not intended to form part of the public API.  It has
 * only been implemented to the extent necessary for internal use.
 */
export class Debug
{	
	// private, no public accessors defined.
	private _ici:number = 0;

	// public accessors may be defined for these.
	private _event:number = 0;
	private _what:string | null = null;
	private _source:string | null = null;
	private _currentline:number = 0;
	private _linedefined:number = 0;
	private _lastlinedefined:number = 0;
	private _shortsrc:string | null = null;
	
	/**
	 * @param ici  index of CallInfo record in L.civ
	 */
	public constructor(ici:number)
	{
		this._ici = ici;
	}
	
	public set ici(ici:number)
	{
		this._ici = ici;
	}

	/**
	 * Get ici, index of the {@link CallInfo} record.
	 */
	public get ici():number
	{
		return this._ici;
	}

	/**
	 * Setter for event.
	 */
	public set event(event:number)
	{
		this._event = event;
	}

	/**
	 * Sets the what field.
	 */
	public set what(what:string)
	{
		this._what = what;
	}
		
	/**
	 * Sets the source, and the shortsrc.
	 */
	public set source(source:string | null)
	{
		this._source = source;
		this._shortsrc = Lua.oChunkid(source);
	}

	/**
	 * Gets the current line.  May become public.
	 */
	public get currentline():number
	{
		return this._currentline;
	}

	/**
	 * Set currentline.
	 */
	public set currentline(currentline:number)
	{
		this._currentline = currentline;
	}
	
	/**
	 * Get linedefined.
	 */
	public get linedefined():number
	{
		return this._linedefined;
	}

	/**
	 * Set linedefined.
	 */
	public set linedefined(linedefined:number)
	{
		this._linedefined = linedefined;
	}

	/**
	 * Set lastlinedefined.
	 */
	public set lastlinedefined(lastlinedefined:number)
	{
		this._lastlinedefined = lastlinedefined;
	}

	/**
	 * Gets the "printable" version of source, for error messages.
	 * May become public.
	 */
	public get shortsrc():string | null
	{
		return this._shortsrc;
	}  
}
