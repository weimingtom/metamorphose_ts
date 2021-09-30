import { Reader } from "../java/Reader";
import { ByteArray } from "../java/ByteArray";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/StringReader.java#1 $
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

/** Ersatz replacement for {@link java.io.StringReader} from JSE. */
export class StringReader extends Reader
{
	private _s:string | null;
	/** Index of the current read position.  -1 if closed. */
	private _current:number = 0;  // = 0
	/**
	 * Index of the current mark (set with {@link #mark}).
	 */
	private _mark:number = 0;     // = 0;
	
	public constructor(s:string | null) 
	{
		super();
		this._s = s;
	}
	
	override close():void
	{
		this._current = -1;
	}

	override mark(limit:number):void
	{
		this._mark = this._current;
	}

	override markSupported():boolean
	{
		return true;
	}

	override read():number
	{
		if (this._current < 0)
		{
			throw new Error("StringReader read error");
		}
		if (this._current >= this._s!.length)
		{
			return -1;
		}
		
		return this._s!.charCodeAt(this._current++);
	}

	override readMultiBytes(cbuf:number[], off:number, len:number):number
	{
		if (this._current < 0 || len < 0)
		{
			throw new Error();
		}
		if (this._current >= this._s!.length)
		{
			return 0;
		}
		if (this._current + len > this._s!.length)
		{
			len = this._s!.length - this._current;
		}
		for (var i:number = 0; i < len; ++i)
		{
			cbuf[off + i] = this._s!.charCodeAt(this._current + i);
		}
		this._current += len;
		return len;
	}

	override reset():void
	{
		this._current = this._mark;
	}  
}
