import { StringBuffer } from "../java/StringBuffer";
import { Character } from "../java/Character";
import { NumberFormatException } from "../java/NumberFormatException";
import { Lua } from "./Lua";
import { Syntax } from "./Syntax";

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

export class FormatItem
{
	private _L:Lua | null;
	private _left:boolean = false; // '-' flag
	private _sign:boolean = false; // '+' flag
	private _space:boolean = false; // ' ' flag
	private _alt:boolean = false;  // '#' flag
	private _zero:boolean = false; // '0' flag
	private _width:number = 0;    // minimum field width
	private	_precision:number = -1;   // precision, -1 when no precision specified.
	private _type:number = 0;    // the type of the conversion
	private _length:number = 0;   // length of the format item in the format string.

	/**
	 * Character used in formatted output when %e or %g format is used.
	 */
	public static E_LOWER:number = 'E'.charCodeAt(0);
	/**
	 * Character used in formatted output when %E or %G format is used.
	 */
	public static E_UPPER:number = 'E'.charCodeAt(0);
	
	/**
	 * Parse a format item (starting from after the <code>L_ESC</code>).
	 * If you promise that there won't be any format errors, then
	 * <var>L</var> can be <code>null</code>.
	 */
	public constructor(L:Lua | null, s:String)
	{
		this._L = L;
		var i:number = 0;
		var l:number = s.length;
// parse flags
flag:
		while (true)
		{
			if (i >=l )
				L!.error("invalid format");
			switch (s.charAt(i))
			{
				case '-':
					this._left = true;
					break;
					
				case '+':
					this._sign = true;
					break;
					
				case ' ':
					this._space = true;
					break;
				
				case '#':
					this._alt = true;
					break;
				
				case '0':
					this._zero = true;
					break;
				
				default:
					break flag;
			}
			++i;
		} /* flag */
		// parse width
		var widths:number = i;       // index of start of width specifier
		while (true)
		{
			if (i >= l)
				this._L!.error("invalid format");
			if (Syntax.isdigit(s.charCodeAt(i))) //TODO:
				++i;
			else
				break;
		}
		if (widths < i)
		{
			try
			{
				this._width = parseInt(s.substring(widths, i)); //TODO:
			}
			catch (e_)
			{
				if (e_ instanceof Error) {
					console.log((e_ as Error).stack);
				}
			}
		}
		// parse precision
		if (s.charAt(i) == '.')
		{
			++i;
			var precisions:number = i; // index of start of precision specifier
			while (true)
			{
				if (i >= l)
					L!.error("invalid format");
				if (Syntax.isdigit(s.charCodeAt(i))) //TODO:
					++i;
				else
					break;
			}
			if (precisions < i)
			{
				try
				{
					this._precision = parseInt(s.substring(precisions, i)); //TODO:
				}
				catch (e_)
				{
					if (e_ instanceof NumberFormatException) {
						console.log((e_ as NumberFormatException).stack);
					}
				}
			}
		}
		switch (s.charAt(i))
		{
			case 'c':
			case 'd': case 'i':
			case 'o': case 'u': case 'x': case 'X':
			case 'e': case 'E': case 'f': case 'g': case 'G':
			case 'q':
			case 's':
				this._type = s.charCodeAt(i);
				this.length = i + 1;
				return;
		}
		this._L!.error("invalid option to 'format'");
	}

	public get length():number 
	{
		return this._length;
	}
	
	public set length(length:number) 
	{
		this._length = length;
	}
	
	public get type():number 
	{
		return this._type;
	}

	public set type(type:number) 
	{
		this._type = type;
	}
	
	/**
	 * Format the converted string according to width, and left.
	 * zero padding is handled in either {@link FormatItem#formatInteger}
	 * or {@link FormatItem#formatFloat}
	 * (and width is fixed to 0 in such cases).  Therefore we can ignore
	 * zero.
	 */
	private format(b:StringBuffer, s:string | null):void
	{
		var l:number = s!.length;
		if (l >= this._width)
		{
			b.appendString(s);
			return;
		}
		var pad:StringBuffer = new StringBuffer();
		while (l < this._width)
		{
			pad.append(' '.charCodeAt(0));
			++l;
		}
		if (this._left)
		{
			b.appendString(s);
			b.appendStringBuffer(pad);
		}	
		else
		{
			b.appendStringBuffer(pad);
			b.appendString(s);
		}
	}
	
	// All the format* methods take a StringBuffer and append the
	// formatted representation of the value to it.
	// Sadly after a format* method has been invoked the object is left in
	// an unusable state and should not be used again.
		
	public formatChar(b:StringBuffer, c:number):void 
	{
		var s:string = String.fromCharCode(c); //TODO:
		this.format(b, s);
	}

	public formatInteger(b:StringBuffer, i:number):void
	{
		// :todo: improve inefficient use of implicit StringBuffer
		
		if (this._left)
			this._zero = false;
		if (this._precision >= 0)
			this._zero = false;

		var radix:number = 10;
		switch (String.fromCharCode(this.type))
		{
			case 'o':
				radix = 8;
				break;
			
			case 'd': case 'i': case 'u':
				radix = 10;
				break;
			
			case 'x': case 'X':
				radix = 16;
				break;
			
			default:
				this._L!.error("invalid format");
		}
		var s:string  = i.toString(radix);//Long.toString(i, radix);
		if (this._type == 'X'.charCodeAt(0))
			s = s.toUpperCase();
		if (this._precision == 0 && s == "0")
			s = "";
			
		// form a prefix by strippping possible leading '-',
		// pad to precision,
		// add prefix,
		// pad to width.
		// extra wart: padding with '0' is implemented using precision
		// because this makes handling the prefix easier.
		var prefix:string = "";
		if (s.substr(0, 1) == "-")
		{
			prefix = "-";
			s = s.substring(1);
		}
		if (this._alt && radix == 16)
			prefix = "0x";
		if (prefix == "")
		{
			if (this._sign)
				prefix = "+";
			else if (this._space)
				prefix = " ";
		}
		if (this._alt && radix == 8 && s.substr(0, 1) != "0")
			s = "0" + s;
		var l:number = s.length;
		if (this._zero)
		{
			this._precision = this._width - prefix.length;
			this._width = 0;
		}
		if (l < this._precision)
		{
			var p:StringBuffer = new StringBuffer();
			while (l < this._precision)
			{
				p.append('0'.charCodeAt(0));
				++l;
			}
			p.appendString(s);
			s = p.toString();
		}
		s = prefix + s;
		this.format(b, s);
	}
		
	public formatFloat(b:StringBuffer, d:number):void
	{
		switch (String.fromCharCode(this._type))
		{
			case 'g': case 'G':
				this.formatFloatG(b, d);
				return;
			
			case 'f':
				this.formatFloatF(b, d);
				return;
			
			case 'e': case 'E':
				this.formatFloatE(b, d);
				return;
		}
	}

	private formatFloatE(b:StringBuffer, d:number):void
	{
		var s:string = this.formatFloatRawE(d);
		this.format(b, s);
	}

	/**
	 * Returns the formatted string for the number without any padding
	 * (which can be added by invoking {@link FormatItem#format} later).
	 */
	private formatFloatRawE(d:number):string 
	{
		var m:number = Math.abs(d);
		var offset:number = 0;
		if (m >= 1e-3 && m < 1e7)
		{
			d *= 1e10;
			offset = 10;
		}
		//FIXME:如果使用toPrecision会消除掉中间的e指数符号
		var s:string = d.toPrecision(this._precision);//String(d); //FIXME:整数转浮点问题
		var t:StringBuffer = new StringBuffer(s);
		var e:number;      // Exponent value
		if (d == 0)
		{
			e = 0;
		}
		else
		{
			var ei:number = s.indexOf('E');
			e = parseInt(s.substring(ei+1));
			t._delete(ei, Number.MAX_SAFE_INTEGER); //TODO:
		}
		
		this.precisionTrim(t);

		e -= offset;
		if (Character.isLowerCase(this.type))
		{
			t.append(FormatItem.E_LOWER);
		}
		else
		{
			t.append(FormatItem.E_UPPER);
		}
		if (e >= 0)
		{
			t.append('+'.charCodeAt(0));
		}
		t.appendString(String(e)); //TODO:

		this.zeroPad(t);
		return t.toString();
	}
	
	private formatFloatF(b:StringBuffer, d:number):void
	{
		var s:string = this.formatFloatRawF(d);
		this.format(b, s);
	}
		
	/**
	 * Returns the formatted string for the number without any padding
	 * (which can be added by invoking {@link FormatItem#format} later).
	 */
	private formatFloatRawF(d:number):string
	{
		//toPrecision
		var s:string = d.toPrecision(this._precision);//String(d); //FIXME:整数转字符串会丢失小数点后1位精度
		if (d % 1 === 0)
		{
			s = d.toFixed(1);
		}
		var t:StringBuffer = new StringBuffer(s);

		var di:number = s.indexOf('.');
		var ei:number = s.indexOf('E');
		if (ei >= 0)
		{
			t._delete(ei, Number.MAX_SAFE_INTEGER); //TODO:
			var e:number = parseInt(s.substring(ei+1));
			
			var z:StringBuffer = new StringBuffer();
			for (var i:number = 0; i < Math.abs(e); ++i)
			{
				z.append('0'.charCodeAt(0));
			}
			
			if (e > 0)
			{
				t.deleteCharAt(di);
				t.appendStringBuffer(z);
				t.insert(di+e, '.'.charCodeAt(0));
			}
			else
			{
				t.deleteCharAt(di);
				var at:number = t.charAt(0) == '-'.charCodeAt(0) ? 1 : 0;
				t.insertStringBuffer(at, z);
				t.insert(di, '.'.charCodeAt(0));
			}
		}

		this.precisionTrim(t);
		this.zeroPad(t);

		return t.toString();
	}

	private formatFloatG(b:StringBuffer, d:number):void
	{
		if (this._precision == 0)
		{
			this._precision = 1;
		}
		if (this._precision < 0)
		{
			this._precision = 6;
		}
		var s:string;
		// Decide whether to use %e or %f style.
		var m:number = Math.abs(d);
		if (m == 0)
		{
			// :todo: Could test for -0 and use "-0" appropriately.
			s = "0";
		}
		else if (m < 1e-4 || m >= Lua.iNumpow(10, this._precision))
		{
			// %e style
			--this._precision;
			s = this.formatFloatRawE(d);
			var di:number = s.indexOf('.');
			if (di >= 0)
			{
				// Trim trailing zeroes from fractional part
				var ei:number = s.indexOf('E');
				if (ei < 0)
				{
					ei = s.indexOf('e');
				}
				var i:number = ei - 1;
				while (s.charAt(i) == '0')
				{
					--i;
				}
				if (s.charAt(i) != '.')
				{
					++i;
				}
				var a:StringBuffer = new StringBuffer(s);
				a._delete(i, ei); //TODO:
				s = a.toString();
			}
		}
		else
		{
			// %f style
			// For %g precision specifies the number of significant digits,
			// for %f precision specifies the number of fractional digits.
			// There is a problem because it's not obvious how many fractional
			// digits to format, it could be more than precision
			// (when .0001 <= m < 1) or it could be less than precision
			// (when m >= 1).
			// Instead of trying to work out the correct precision to use for
			// %f formatting we use a worse case to get at least all the
			// necessary digits, then we trim using string editing.  The worst
			// case is that 3 zeroes come after the decimal point before there
			// are any significant digits.
			// Save the required number of significant digits
			var required:number = this._precision;
			this._precision += 3;
			s = this.formatFloatRawF(d);
			var fsd:number = 0;      // First Significant Digit
			while (s.charAt(fsd) == '0' || s.charAt(fsd) == '.')
			{
				++fsd;
			}
			// Note that all the digits to the left of the decimal point in
			// the formatted number are required digits (either significant
			// when m >= 1 or 0 when m < 1).  We know this because otherwise 
			// m >= (10**precision) and so formatting falls under the %e case.
			// That means that we can always trim the string at fsd+required
			// (this will remove the decimal point when m >=
			// (10**(precision-1)).
			var a2:StringBuffer = new StringBuffer(s);
			a2._delete(fsd+required, Number.MAX_SAFE_INTEGER); //TODO:
			if (s.indexOf('.') < a2.length())
			{
				// Trim trailing zeroes
				var i2:number = a2.length() - 1;
				while (a2.charAt(i2) == '0'.charCodeAt(0))
				{
					a2.deleteCharAt(i2);
					--i2;
				}
				if (a2.charAt(i2) == '.'.charCodeAt(0))
				{
					a2.deleteCharAt(i2);
				}
			}
			s = a2.toString();
		}
		this.format(b, s);
	}
		
	public formatString(b:StringBuffer, s:string | null):void
	{
		var p:string | null = s;

		if (this._precision >= 0 && this._precision < s!.length)
		{
			p = s!.substring(0, this._precision);
		}
		this.format(b, p);
	}
	
	private precisionTrim(t:StringBuffer):void
	{
		if (this._precision < 0)
		{
			this._precision = 6;
		}

		var s:string = t.toString();
		var di:number = s.indexOf('.');
		var l:number = t.length();
		if (0 == this._precision)
		{
			t._delete(di, Number.MAX_SAFE_INTEGER); //TODO:
		}
		else if (l > di + this._precision)
		{
			t._delete(di + this._precision + 1, Number.MAX_SAFE_INTEGER); //TODO:
		}
		else
		{
			for(; l <= di + this._precision; ++l)
			{
				t.append('0'.charCodeAt(0));
			}
		}
	}
	
	private zeroPad(t:StringBuffer):void
	{
		if (this._zero && t.length() < this._width)
		{
			var at:number = t.charAt(0) == '-'.charCodeAt(0) ? 1 : 0;
			while (t.length() < this._width)
			{
				t.insert(at, '0'.charCodeAt(0));
			}
		}
	}	
}
