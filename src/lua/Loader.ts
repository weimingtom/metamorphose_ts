import { EOFException } from "../java/EOFException";
import { IOException } from "../java/IOException";
import { InputStream } from "../java/InputStream";
import { NullPointerException } from "../java/NullPointerException";
import { ByteArray } from "../java/ByteArray";
import { Proto } from "./Proto";
import { Slot } from "./Slot";
import { LocVar } from "./LocVar";
import { Lua } from "./Lua";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Loader.java#1 $
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
 * Loads Lua 5.1 binary chunks.
 * This loader is restricted to loading Lua 5.1 binary chunks where:
 * <ul>
 * <li><code>LUAC_VERSION</code> is <code>0x51</code>.</li>
 * <li><code>int</code> is 32 bits.</li>
 * <li><code>size_t</code> is 32 bits.</li>
 * <li><code>Instruction</code> is 32 bits (this is a type defined in
 * the PUC-Rio Lua).</li>
 * <li><code>lua_Number</code> is an IEEE 754 64-bit double.  Suitable
 * for passing to {@link java.lang.Double#longBitsToDouble}.</li>
 * <li>endianness does not matter (the loader swabs as appropriate).</li>
 * </ul>
 * Any Lua chunk compiled by a stock Lua 5.1 running on a 32-bit Windows
 * PC or at 32-bit OS X machine should be fine.
 */
export class Loader
{
	
	/**
	 * Whether integers in the binary chunk are stored big-endian or
	 * little-endian.  Recall that the number 0x12345678 is stored: 0x12
	 * 0x34 0x56 0x78 in big-endian format; and, 0x78 0x56 0x34 0x12 in
	 * little-endian format.
	 */
	private _bigendian:boolean = false;
	private _in:InputStream;
	private _name:string | null;

	//TODO:这里有问题
	// auxiliary for reading ints/numbers
	private _intbuf:ByteArray = new ByteArray();//new Array(4) ; //byte [] 
	private _longbuf:ByteArray = new ByteArray();//new Array(8) ; //byte [] 

	/**
	* A new chunk loader.  The <code>InputStream</code> must be
	* positioned at the beginning of the <code>LUA_SIGNATURE</code> that
	* marks the beginning of a Lua binary chunk.
	* @param in    The binary stream from which the chunk is read.
	* @param name  The name of the chunk.
	*/
	public constructor(_in:InputStream, name:string | null) 
	{
		if (null == _in)
		{
			throw new NullPointerException();
		}
		this._in = _in;
		// The name is treated slightly.  See lundump.c in the PUC-Rio
		// source for details.
		if (name!.substr(0, 1) == "@" || name!.substr(0, 1) == "=")
		{
			this._name = name!.substring(1);
		}
		else if (false)
		{
			// :todo: Select some equivalent for the binary string case.
			this._name = "binary string";
		}
		else
		{
			this._name = name;
		}
	}
	
	
	
	/**
	 * Loads (undumps) a dumped binary chunk.
	 * @throws IOException  if chunk is malformed or unacceptable.
	 */
	public undump():Proto // throws IOException
	{
		this.header();
		return this._function(null);
	}
	
	/**
	 * Primitive reader for undumping.
	 * Reads exactly enough bytes from <code>this.in</code> to fill the
	 * array <code>b</code>.  If there aren't enough to fill
	 * <code>b</code> then an exception is thrown.  Similar to
	 * <code>LoadBlock</code> from PUC-Rio's <code>lundump.c</code>.
	 * @param b  byte array to fill.
	 * @throws EOFException when the stream is exhausted too early.
	 * @throws IOException when the underlying stream does.
	 */
	private block(b:ByteArray):void //  throws IOException
	{
		var n:number = this._in.readBytes(b);
		if (n != b.length)
			throw new EOFException();
	}

	/**
	 * Undumps a byte as an 8 bit unsigned number.  Returns
	 * an int to accommodate the range.
	 */
	private byteLoad():number// throws IOException
	{
		var c:number = this._in.read() ;
		if (c == -1)
			throw new EOFException();
		else
			return c & 0xFF ;  // paranoia
	}

	/**
	 * Undumps the code for a <code>Proto</code>.  The code is an array of
	 * VM instructions.
	 */
	private code():number[] // int[]  throws IOException
	{
		var n:number = this.intLoad();
		var code:number[] = new Array(n); //int[] 

		for (var i:number = 0; i < n; ++i)
		{
			// :Instruction:size  Here we assume that a dumped Instruction is
			// the same size as a dumped int.
			code[i] = this.intLoad();
		}

		return code;
	}

	/**
	 * Undumps the constant array contained inside a <code>Proto</code>
	 * object.  First half of <code>LoadConstants</code>, see
	 * <code>proto</code> for the second half of
	 * <code>LoadConstants</code>.
	 */
	private constant():Slot[] //Slot[] throws IOException
	{
		var n:number = this.intLoad();
		var k:Slot[] = new Array(n); //Slot[] 

		// Load each constant one by one.  We use the following values for
		// the Lua tagtypes (taken from <code>lua.h</code> from the PUC-Rio
		// Lua 5.1 distribution):
		// LUA_TNIL         0
		// LUA_TBOOLEAN     1
		// LUA_TNUMBER      3
		// LUA_TSTRING      4
		// All other tagtypes are invalid

		// :todo: Currently a new Slot is created for each constant.
		// Consider a space optimisation whereby identical constants have
		// the same Slot.  Constants are pooled per function anyway (so a
		// function never has 2 identical constants), so would have to work
		// across functions.  The easy cases of nil, true, false, might be
		// worth doing since that doesn't require a global table.
		// 
		for (var i:number = 0; i < n; ++i)
		{
			var t:number = this.byteLoad();
			switch (t)
			{
				case 0: // LUA_TNIL
					k[i] = new Slot();
					(k[i] as Slot).init2(Lua.NIL); //TODO:
					break;

				case 1: // LUA_TBOOLEAN
					var b:number = this.byteLoad();
					// assert b >= 0;
					if (b > 1)
						throw new IOException();
					k[i] = new Slot();
					(k[i] as Slot).init2(Lua.valueOfBoolean(b != 0));
					break;

				case 3: // LUA_TNUMBER
					k[i] = new Slot();
					(k[i] as Slot).init2(this.number());
					break;

				case 4: // LUA_TSTRING
					k[i] = new Slot();
					(k[i] as Slot).init2(this.string() as Object);
					break;

				default:
					throw new IOException();
			}
		}
		return k;
	}

	/**
	 * Undumps the debug info for a <code>Proto</code>.
	 * @param proto  The Proto instance to which debug info will be added.
	 */
	private debug(proto:Proto):void // throws IOException
	{
		// lineinfo
		var n:number = this.intLoad();
		var lineinfo:number[] = new Array(n); //int[] 

		for (var i:number = 0; i < n; ++i)
		{
			lineinfo[i] = this.intLoad();
		}

		// locvars
		n = this.intLoad();
		var locvar:LocVar[] = new Array(n); //LocVar[] 
		for (i = 0; i < n; ++i)
		{
			var s:string | null = this.string();
			var start:number = this.intLoad();
			var end:number = this.intLoad();
			locvar[i] = new LocVar();
			(locvar[i] as LocVar).init(s, start, end);
		}

		// upvalue (names)
		n = this.intLoad();
		var upvalue:(string | null)[] = new Array(n); //String[]
		for (i = 0; i < n; ++i)
		{
			upvalue[i] = this.string();
		}
		proto.debug(lineinfo, locvar, upvalue);
		return;
	}
	
	/**
	 * Undumps a Proto object.  This is named 'function' after
	 * <code>LoadFunction</code> in PUC-Rio's <code>lundump.c</code>.
	 * @param parentSource  Name of parent source "file".
	 * @throws IOException  when binary is malformed.
	 */
	private _function(parentSource:string | null):Proto // throws IOException
	{
		var source:string | null;
		var linedefined:number;
		var lastlinedefined:number;
		var nups:number;
		var numparams:number;
		var varargByte:number;
		var vararg:boolean;
		var maxstacksize:number;
		var code:number[]; //int[] 
		var constant:Slot[];//Slot[] 
		var proto:Proto[]; //Proto[] 

		source = this.string();
		if (null == source)
		{
			source = parentSource;
		}
		linedefined = this.intLoad();
		lastlinedefined = this.intLoad();
		nups = this.byteLoad();
		numparams = this.byteLoad();
		varargByte = this.byteLoad();
		// "is_vararg" is a 3-bit field, with the following bit meanings
		// (see "lobject.h"):
		// 1 - VARARG_HASARG
		// 2 - VARARG_ISVARARG
		// 4 - VARARG_NEEDSARG
		// Values 1 and 4 (bits 0 and 2) are only used for 5.0
		// compatibility.
		// HASARG indicates that a function was compiled in 5.0
		// compatibility mode and is declared to have ... in its parameter
		// list.
		// NEEDSARG indicates that a function was compiled in 5.0
		// compatibility mode and is declared to have ... in its parameter
		// list and does _not_ use the 5.1 style of vararg access (using ...
		// as an expression).  It is assumed to use 5.0 style vararg access
		// (the local 'arg' variable).  This is not supported in Jill.
		// ISVARARG indicates that a function has ... in its parameter list
		// (whether compiled in 5.0 compatibility mode or not).
		//
		// At runtime NEEDSARG changes the protocol for calling a vararg
		// function.  We don't support this, so we check that it is absent
		// here in the loader.
		//
		// That means that the legal values for this field ar 0,1,2,3.
		if (varargByte < 0 || varargByte > 3)
		{
			throw new IOException();
		}
		vararg = (0 != varargByte);
		maxstacksize = this.byteLoad();
		code = this.code();
		constant = this.constant();
		proto = this.proto(source);
		var newProto:Proto = new Proto();
		newProto.init1(constant, code, proto, nups,
			numparams, vararg, maxstacksize); //TODO:
		newProto.source = source;
		newProto.linedefined = linedefined;
		newProto.lastlinedefined = lastlinedefined;
		
		this.debug(newProto);
		// :todo: call code verifier
		return newProto;
	}

	private static HEADERSIZE:number = 12;
	
	/** A chunk header that is correct.  Except for the endian byte, at
	 * index 6, which is always overwritten with the one from the file,
	 * before comparison.  We cope with either endianness.
	 * Default access so that {@link Lua#load} can read the first entry.
	 * On no account should anyone except {@link #header} modify
	 * this array.
	 */
	public static HEADER:number[] = //byte[]
	[
		parseInt("033", 8), ('L'.charCodeAt(0)), ('u'.charCodeAt(0)), ('a'.charCodeAt(0)),
		0x51, 0, 99, 4,
		4, 4, 8, 0
	];

	/**
	 * Loads and checks the binary chunk header.  Sets
	 * <code>this.bigendian</code> accordingly.
	 *
	 * A Lua 5.1 header looks like this:
	 * <pre>
		 * b[0]    0x33
		 * b[1..3] "Lua";
		 * b[4]    0x51 (LUAC_VERSION)
		 * b[5]    0 (LUAC_FORMAT)
		 * b[6]    0 big-endian, 1 little-endian
		 * b[7]    4 (sizeof(int))
		 * b[8]    4 (sizeof(size_t))
		 * b[9]    4 (sizeof(Instruction))
		 * b[10]   8 (sizeof(lua_Number))
		 * b[11]   0 (floating point)
		 * </pre>
		 *
		 * To conserve JVM bytecodes the sizes of the types <code>int</code>,
		 * <code>size_t</code>, <code>Instruction</code>,
		 * <code>lua_Number</code> are assumed by the code to be 4, 4, 4, and
		 * 8, respectively.  Where this assumption is made the tags :int:size,
		 * :size_t:size :Instruction:size :lua_Number:size will appear so that
		 * you can grep for them, should you wish to modify this loader to
		 * load binary chunks from different architectures.
		 *
		 * @throws IOException  when header is malformed or not suitable.
		 */
	private header():void // throws IOException
	{
		//TODO:Java to AS3
		var buf:ByteArray = new ByteArray();// (HEADERSIZE); //byte[]
		var arrBuf:number[] = new Array(Loader.HEADERSIZE); 
		for (var i:number = 0; i < Loader.HEADERSIZE; i++)
		{
			arrBuf[i] = 0;
		}
		
		var n:number;
		this.block(buf);
		
		for (i = 0; i < Loader.HEADERSIZE; i++)
		{
			arrBuf[i] = buf.readByte();
		}
		// poke the HEADER's endianness byte and compare.
		Loader.HEADER[6] = arrBuf[6];
		
		if (buf.get(6) < 0 || buf.get(6) > 1 || !Loader.arrayEquals(Loader.HEADER, arrBuf))
		{
			throw new IOException();
		}
		this._bigendian = (buf.get(6) == 0);
	}

	/**
	 * Undumps an int.  This method swabs accordingly.
	 * size_t and Instruction need swabbing too, but the code
	 * simply uses this method to load size_t and Instruction.
	 */
	private intLoad():number // throws IOException
	{
		// :int:size  Here we assume an int is 4 bytes.
		this.block(this._intbuf);

		var i:number;
		// Caution: byte is signed so "&0xff" converts to unsigned value.
		if (this._bigendian)
		{
			i = ((this._intbuf.get(0)&0xff) << 24) | ((this._intbuf.get(1)&0xff) << 16) |
				((this._intbuf.get(2)&0xff) << 8) | (this._intbuf.get(3)&0xff);
		}
		else
		{
			i = ((this._intbuf.get(3)&0xff) << 24) | ((this._intbuf.get(2)&0xff) << 16) |
				((this._intbuf.get(1)&0xff) << 8) | (this._intbuf.get(0)&0xff);
		}
		return i;

		/* minimum footprint version?
		int result = 0 ;
		for (int shift = 0 ; shift < 32 ; shift+=8)
		{
			int byt = byteLoad () ;
			if (bigendian)
			result = (result << 8) | byt ;
			else
			result |= byt << shift ;
		}
		return result ;
		*/

		/* another version?
		if (bigendian)
		{
			int result = byteLoad() << 24 ;
			result |= byteLoad () << 16 ;
			result |= byteLoad () << 8 ;
			result |= byteLoad () ;
			return result;
		}
		else
		{
			int result = byteLoad() ;
			result |= byteLoad () << 8 ;
			result |= byteLoad () << 16 ;
			result |= byteLoad () << 24 ;
			return result ;
		}
		*/
	}

	/**
	 * Undumps a Lua number.  Which is assumed to be a 64-bit IEEE double.
	 */
	private number():Object// throws IOException
	{
		// :lua_Number:size  Here we assume that the size is 8.
		this.block(this._longbuf);
		// Big-endian architectures store doubles with the sign bit first;
		// little-endian is the other way around.
		var l:number = 0;
		for (var i:number = 0; i < 8; ++i)
		{
			if (this._bigendian)
				l = (l << 8) | (this._longbuf.get(i) & 0xff);
			else
				l = (l >>> 8) | (((this._longbuf.get(i) & 0xff) as number) << 56);
		}
		//TODO:
		var d:number = l;//Double.longBitsToDouble(l);
		return Lua.valueOfNumber(d);
	}

	/**
	 * Undumps the <code>Proto</code> array contained inside a
	 * <code>Proto</code> object.  These are the <code>Proto</code>
	 * objects for all inner functions defined inside an existing
	 * function.  Corresponds to the second half of PUC-Rio's
	 * <code>LoadConstants</code> function.  See <code>constant</code> for
	 * the first half.
	 */
	private proto(source:string | null):Proto[] //Proto[]  throws IOException
	{
		var n:number = this.intLoad();
		var p:Proto[] = new Array(n); //Proto[] 

		for (var i:number = 0; i < n; ++i)
		{
			p[i] = this._function(source);
		}
		return p;
	}

	/**
	 * Undumps a {@link String} or <code>null</code>.  As per
	 * <code>LoadString</code> in
	 * PUC-Rio's lundump.c.  Strings are converted from the binary
	 * using the UTF-8 encoding, using the {@link
	 * java.lang.String#String(byte[], String) String(byte[], String)}
	 * constructor.
	 */
	private string():string | null //throws IOException
	{
		// :size_t:size we assume that size_t is same size as int.
		var size:number = this.intLoad();
		if (size == 0)
		{
			return null;
		}

		//var buf:Array = new Array(size - 1); //byte[]
		var buf:ByteArray = new ByteArray();
		this.block(buf);
		// Discard trailing NUL byte
		if (this._in.read() == -1)
			throw new EOFException() ;

		return buf.readUTFBytes(size - 1); //(new String(buf, "UTF-8")).intern();
	}

	/**
	 * CLDC 1.1 does not provide <code>java.util.Arrays</code> so we make
	 * do with this.
	 */
	private static arrayEquals(x:number[], y:number[]):boolean //byte[] 
	{
		if (x.length != y.length)
		{
			return false;
		}
		for (var i:number = 0; i < x.length; ++i)
		{
			if (x[i] != y[i])
			{
				return false;
			}
		}
		return true;
	}
}
