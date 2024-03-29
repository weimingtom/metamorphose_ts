import { IllegalArgumentException } from "../java/IllegalArgumentException";
import { NullPointerException } from "../java/NullPointerException";
import { SystemUtil } from "../java/SystemUtil";
import { LocVar } from "./LocVar";
import { Lua } from "./Lua";
import { Slot } from "./Slot";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Proto.java#1 $
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
 * Models a function prototype.  This class is internal to Jill and
 * should not be used by clients.  This is the analogue of the PUC-Rio
 * type <code>Proto</code>, hence the name.
 * A function prototype represents the constant part of a function, that
 * is, a function without closures (upvalues) and without an
 * environment.  It's a handle for a block of VM instructions and
 * ancillary constants.
 *
 * For convenience some private arrays are exposed.  Modifying these
 * arrays is punishable by death. (Java has no convenient constant
 * array datatype)
 */
export class Proto
{
	private static D:boolean = false; 
	
	/** Interned 0-element array. */
	private static ZERO_INT_ARRAY:number[] = new Array(); /*int[] = new int[0]*/
	private static ZERO_LOCVAR_ARRAY:LocVar[] = new Array(); /*LocVar[]  = new LocVar[0]*/
	private static ZERO_CONSTANT_ARRAY:Slot[] = new Array();//final Slot[] ZERO_CONSTANT_ARRAY = new Slot[0];
	private static ZERO_PROTO_ARRAY:Proto[] = new Array();//final Proto[] ZERO_PROTO_ARRAY = new Proto[0];
	private static ZERO_STRING_ARRAY:string[] = new Array();//final String[] ZERO_STRING_ARRAY = new String[0];

	
	// Generally the fields are named following the PUC-Rio implementation
	// and so are unusually terse.
	/** Array of constants. */
	private _k:Slot[] | null = null; //Slot[] 
	private _sizek:number = 0;
	/** Array of VM instructions. */
	private _code:number[] | null = null; //int[] 
	private _sizecode:number = 0;
	/** Array of Proto objects. */
	private _p:Proto[] | null = null; //Proto[] 
	private _sizep:number = 0;
	/**
	 * Number of upvalues used by this prototype (and so by all the
	 * functions created from this Proto).
	 */
	private _nups:number = 0;
	/**
	 * Number of formal parameters used by this prototype, and so the
	 * number of argument received by a function created from this Proto.
	 * In a function defined to be variadic then this is the number of
	 * fixed parameters, the number appearing before '...' in the parameter
	 * list.
	 */
	private _numparams:number = 0;
	/**
	 * <code>true</code> if and only if the function is variadic, that is,
	 * defined with '...' in its parameter list.
	 */
	private _isVararg:boolean = false;
	private _maxstacksize:number = 0;
	// Debug info
	/** Map from PC to line number. */
	private _lineinfo:number[] | null = null; //int[]
	private _sizelineinfo:number = 0;
	private _locvars:LocVar[] | null = null; //LocVar[] 
	private _sizelocvars:number = 0;
	private _upvalues:(string | null)[] | null = null; //String[] 
	private _sizeupvalues:number = 0; 
	private _source:string | null = null;
	private _linedefined:number = 0;
	private _lastlinedefined:number = 0;

	//TODO:
	public constructor()
	{
		
	}
	
	/**
	 * Proto synthesized by {@link Loader}.
	 * All the arrays that are passed to the constructor are
	 * referenced by the instance.  Avoid unintentional sharing.  All
	 * arrays must be non-null and all int parameters must not be
	 * negative.  Generally, this constructor is used by {@link Loader}
	 * since that has all the relevant arrays already constructed (as
	 * opposed to the compiler).
	 * @param constant   array of constants.
	 * @param code       array of VM instructions.
	 * @param nups       number of upvalues (used by this function).
	 * @param numparams  number of fixed formal parameters.
	 * @param isVararg   whether '...' is used.
	 * @param maxstacksize  number of stack slots required when invoking.
	 * @throws NullPointerException if any array arguments are null.
	 * @throws IllegalArgumentException if nups or numparams is negative.
	 */
	public init1(constant:Slot[], //Slot[] 
		code:number[], //int[] 
		proto:Proto[], //Proto[] 
		nups:number,
		numparams:number,
		isVararg:boolean,
		maxstacksize:number):void 
	{
		if (null == constant || null == code || null == proto)
		{
			throw new NullPointerException();
		}
		if (nups < 0 || numparams < 0 || maxstacksize < 0)
		{
			throw new IllegalArgumentException();
		}
		this._k = constant; 
		this._sizek = this._k.length ;
		this._code = code;
		this._sizecode = this._code.length ;
		this._p = proto; 
		this._sizep = proto.length ;
		this._nups = nups;
		this._numparams = numparams;
		this.isVararg = isVararg;
		this._maxstacksize = maxstacksize;
	}
	
	/**
	 * Blank Proto in preparation for compilation.
	 * 废弃？
	 */
	public init2(source:string | null, maxstacksize:number):void
	{
		this._maxstacksize = maxstacksize;
		// maxstacksize = 2;   // register 0/1 are always valid.
		// :todo: Consider removing size* members
		this._source = source;
		this._k = Proto.ZERO_CONSTANT_ARRAY;      
		this._sizek = 0;
		this._code = Proto.ZERO_INT_ARRAY;        
		this._sizecode = 0;
		this._p = Proto.ZERO_PROTO_ARRAY;         
		this._sizep = 0;
		this._lineinfo = Proto.ZERO_INT_ARRAY;    
		this._sizelineinfo = 0;
		this._locvars = Proto.ZERO_LOCVAR_ARRAY;  
		this._sizelocvars = 0;
		this._upvalues = Proto.ZERO_STRING_ARRAY; 
		this._sizeupvalues = 0;
	}


	/**
	 * Augment with debug info.  All the arguments are referenced by the
	 * instance after the method has returned, so try not to share them.
	 */
	public debug(lineinfoArg:number[], //int[] 
		locvarsArg:LocVar[], //LocVar[] 
		upvaluesArg:(string | null)[]):void //String[] 
	{
		this._lineinfo = lineinfoArg;  
		this._sizelineinfo = this._lineinfo.length;
		this._locvars = locvarsArg;    
		this._sizelocvars = this._locvars.length;
		this._upvalues = upvaluesArg;  
		this._sizeupvalues = this._upvalues.length;
	}

	/** Gets source. */
	public get source():string | null
	{
		return this._source;
	}

	/** Setter for source. */
	public set source(source:string | null)
	{
		this._source = source;
	}

	public get linedefined():number
	{
		return this._linedefined;
	}
	
	public set linedefined(linedefined:number)
	{
		this._linedefined = linedefined;
	}

	public get lastlinedefined():number
	{
		return this._lastlinedefined;
	}
	
	public set lastlinedefined(lastlinedefined:number)
	{
		this._lastlinedefined = lastlinedefined;
	}

	/** Gets Number of Upvalues */
	public get nups():number
	{
		return this._nups;
	}

	public set nups(nups:number)
	{
		this._nups = nups;
	}
	
	/** Number of Parameters. */
	public get numparams():number
	{
		return this._numparams;
	}

	public set numparams(numparams:number)
	{
		this._numparams = numparams;
	}
	
	/** Maximum Stack Size. */
	public get maxstacksize():number
	{
		return this._maxstacksize;
	}

	/** Setter for maximum stack size. */
	public set maxstacksize(m:number)
	{
		this._maxstacksize = m;
	}

	/** Instruction block (do not modify). */
	public get code():number[] | null //int[] 
	{
		return this._code;
	}

	/** Append instruction. */
	public codeAppend(L:Lua | null, pc:number, instruction:number, line:number):void
	{
		if (Proto.D) 
		{
			console.log("pc:" + pc + 
				", instruction:" + instruction + 
				", line:" + line + 
				", lineinfo.length:" + this.lineinfo!.length);
		}
		
		this.ensureCode(L, pc);
		this._code![pc] = instruction;

		if (pc >= this._lineinfo!.length)
		{
			var newLineinfo:number[] = new Array(this._lineinfo!.length * 2 + 1); //int[]
			SystemUtil.arraycopy(this._lineinfo, 0, newLineinfo, 0, this._lineinfo!.length);
			this._lineinfo = newLineinfo;
		}
		this._lineinfo![pc] = line;
	}

	public ensureLocvars(L:Lua, atleast:number, limit:number):void
	{
		if (atleast + 1 > this._sizelocvars)
		{
			var newsize:number = atleast * 2 + 1 ;
			if (newsize > limit)
				newsize = limit ;
			if (atleast + 1 > newsize)
				L.gRunerror("too many local variables") ;
			var newlocvars:LocVar[] = new Array(newsize); //LocVar []
			SystemUtil.arraycopy(this.locvars, 0, newlocvars, 0, this._sizelocvars) ;
			for (var i:number = this._sizelocvars ; i < newsize ; i++)
				newlocvars[i] = new LocVar();
			this._locvars = newlocvars ;
			this._sizelocvars = newsize ;
		}
	}

	public ensureProtos(L:Lua, atleast:number):void
	{
		if (atleast + 1 > this._sizep)
		{
			var newsize:number = atleast * 2 + 1 ;
			if (newsize > Lua.MAXARG_Bx)
				newsize = Lua.MAXARG_Bx ;
			if (atleast + 1 > newsize)
				L.gRunerror("constant table overflow") ;
			var newprotos:Proto[] = new Array(newsize) ; //Proto [] 
			SystemUtil.arraycopy(this._p, 0, newprotos, 0, this._sizep) ;
			this._p = newprotos ;
			this._sizep = newsize ;
		}
	}

	public ensureUpvals(L:Lua, atleast:number):void
	{
		if (atleast + 1 > this._sizeupvalues)
		{
			var newsize:number = atleast * 2 + 1;
			if (atleast + 1 > newsize)
				L.gRunerror("upvalues overflow") ;
			var newupvalues:string[] = new Array(newsize); //String []
			SystemUtil.arraycopy(this._upvalues, 0, newupvalues, 0, this._sizeupvalues) ;
			this._upvalues = newupvalues ;
			this._sizeupvalues = newsize ;
		}
	}

	public ensureCode(L:Lua | null, atleast:number):void
	{
		if (atleast + 1 > this._sizecode)
		{
			var newsize:number = atleast * 2 + 1;
			if (atleast + 1 > newsize)
				L!.gRunerror("code overflow") ;
			var newcode:number[] = new Array(newsize); //int [] 
			SystemUtil.arraycopy(this._code, 0, newcode, 0, this._sizecode) ;
			this._code = newcode ;
			this._sizecode = newsize ;
		}
	}

	/** Set lineinfo record. */
	public setLineinfo(pc:number, line:number):void
	{
		this._lineinfo![pc] = line;
	}

	/** Get linenumber corresponding to pc, or 0 if no info. */
	public getline(pc:number):number
	{
		if (this._lineinfo!.length == 0)
		{
			return 0;
		}
		return this._lineinfo![pc];
	}

	/** Array of inner protos (do not modify). */
	public get proto():Proto[] | null //Proto[] 
	{
		return this._p;
	}

	/** Constant array (do not modify). */
	public get constant():Slot[] | null //Slot[] 
	{
		return this._k;
	}

	/** Append constant. */
	public constantAppend(idx:number, o:Object | null):void
	{
		if (idx >= this._k!.length)
		{
			var newK:Slot[] = new Array(this._k!.length * 2 + 1); //Slot[]
			SystemUtil.arraycopy(this._k, 0, newK, 0, this._k!.length);
			this._k = newK;
		}
		this._k![idx] = new Slot();
		(this._k![idx] as Slot).init2(o);
	}

	/** Predicate for whether function uses ... in its parameter list. */
	public get isVararg():boolean
	{
		return this._isVararg;
	}

	/** "Setter" for isVararg.  Sets it to true. */
	public set isVararg(isVararg:boolean)
	{
		this._isVararg = true;
	}

	/** LocVar array (do not modify). */
	public get locvars():LocVar[] | null //LocVar[] 
	{
		return this._locvars;
	}

	// All the trim functions, below, check for the redundant case of
	// trimming to the length that they already are.  Because they are
	// initially allocated as interned zero-length arrays this also means
	// that no unnecesary zero-length array objects are allocated.

	/**
	 * Trim an int array to specified size.
	 * @return the trimmed array.
	 */
	private trimInt(old:number[] | null/*int[] */, n:number):number[] | null //int[]
	{
		if (n == old!.length)
		{
			return old;
		}
		var newArray:number[] = new Array(n); //int[] 
		SystemUtil.arraycopy(old, 0, newArray, 0, n);
		return newArray;
	}

	/** Trim code array to specified size. */
	public closeCode(n:number):void
	{
		this._code = this.trimInt(this._code, n);
		this._sizecode = this._code!.length ;
	}

	/** Trim lineinfo array to specified size. */
	public closeLineinfo(n:number):void
	{
		this._lineinfo = this.trimInt(this._lineinfo, n);
		this._sizelineinfo = n;
	}

	/** Trim k (constant) array to specified size. */
	public closeK(n:number):void
	{
		if (this._k!.length > n)
		{
			var newArray:Slot[] = new Array(n); //Slot[] 
			SystemUtil.arraycopy(this._k, 0, newArray, 0, n);
			this._k = newArray;
		}
		this._sizek = n;
		return;
	}

	/** Trim p (proto) array to specified size. */
	public closeP(n:number):void
	{
		if (n == this._p!.length)
		{
			return;
		}
		var newArray:Proto[] = new Array(n); //Proto[] 
		SystemUtil.arraycopy(this._p, 0, newArray, 0, n);
		this._p = newArray;
		this._sizep = n ;
	}

	/** Trim locvar array to specified size. */
	public closeLocvars(n:number):void
	{
		if (n == this.locvars!.length)
		{
			return;
		}
		var newArray:LocVar[] = new Array(n); //LocVar[] 
		SystemUtil.arraycopy(this.locvars, 0, newArray, 0, n);
		this._locvars = newArray;
		this._sizelocvars = n;
	}

	/** Trim upvalues array to size <var>nups</var>. */
	public closeUpvalues():void
	{
		if (this.nups == this._upvalues!.length)
		{
			return;
		}
		var newArray:string[] = new Array(this.nups); //String[] 
		SystemUtil.arraycopy(this._upvalues, 0, newArray, 0, this.nups);
		this._upvalues = newArray;
		this._sizeupvalues = this.nups;
	}
	
	//新增
	public get k():Slot[] | null
	{
		return this._k;
	}
	
	//新增
	public get sizek():number
	{
		return this._sizek;
	}
	
	//新增
	public get sizecode():number
	{
		return this._sizecode;
	}

	//新增
	public get p():Proto[] | null
	{
		return this._p;
	}
	//新增
	public get sizep():number
	{
		return this._sizep;
	}
	//新增
	public get lineinfo():number[] | null
	{
		return this._lineinfo;
	}	
	//新增
	public get sizelineinfo():number
	{
		return this._sizelineinfo;
	}	
	//新增
	public get sizelocvars():number
	{
		return this._sizelocvars;
	}	
	//新增
	public get upvalues():(string | null)[] | null
	{
		return this._upvalues;
	}
	//新增
	public get sizeupvalues():number
	{
		return this._sizeupvalues;
	}
	
}
