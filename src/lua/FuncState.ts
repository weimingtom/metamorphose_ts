import { Hashtable } from "../java/Hashtable";
import { IllegalArgumentException } from "../java/IllegalArgumentException";
import { BlockCnt } from "./BlockCnt";
import { Expdesc } from "./Expdesc";
import { LocVar } from "./LocVar";
import { Lua } from "./Lua";
import { Proto } from "./Proto";
import { Syntax } from "./Syntax";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/FuncState.java#1 $
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
 * Used to model a function during compilation.  Code generation uses
 * this structure extensively.  Most of the PUC-Rio functions from
 * lcode.c have moved into this class, alongwith a few functions from
 * lparser.c
 */
export class FuncState
{
	/** See NO_JUMP in lcode.h. */
	public static NO_JUMP:number = -1;

	/** Proto object for this function. */
	private _f:Proto;

	/**
	* Table to find (and reuse) elements in <var>f.k</var>.  Maps from
	* Object (a constant Lua value) to an index into <var>f.k</var>.
	*/
	private _h:Hashtable = new Hashtable();

	/** Enclosing function. */
	private _prev:FuncState | null = null;

	/** Lexical state. */
	private _ls:Syntax;

	/** Lua state. */
	private _L:Lua | null;

	/** chain of current blocks */
	private _bl:BlockCnt | null = null;  // = null;

	/** next position to code. */
	private _pc:number = 0;       // = 0;

	/** pc of last jump target. */
	private _lasttarget:number = -1;

	/** List of pending jumps to <var>pc</var>. */
	private _jpc:number = FuncState.NO_JUMP;

	/** First free register. */
	private _freereg:number = 0;  // = 0;

	/** number of elements in <var>k</var>. */
	private _nk:number = 0;       // = 0;

	/** number of elements in <var>p</var>. */
	private _np:number = 0;       // = 0;

	/** number of elements in <var>locvars</var>. */
	private _nlocvars:number = 0;       // = 0;

	/** number of active local variables. */
	private _nactvar:number = 0;        // = 0;

	/** upvalues as 8-bit k and 8-bit info */
	private _upvalues:number[] = new Array(Lua.MAXUPVALUES); //int [] 

	/** declared-variable stack. */
	private _actvar:number[] = new Array(Lua.MAXVARS); //short[] 

	/**
	 * Constructor.  Much of this is taken from <code>open_func</code> in
	 * <code>lparser.c</code>.
	 */
	public constructor(ls:Syntax)
	{
		this._f = new Proto();
		this._f.init2(ls.source, 2); // default value for maxstacksize=2
		this._L = ls.L;
		this._ls = ls;
		//    prev = ls.linkfs(this);
	}

	/** Equivalent to <code>close_func</code> from <code>lparser.c</code>. */
	public close():void
	{
		this._f.closeCode(this._pc);
		this._f.closeLineinfo(this._pc);
		this._f.closeK(this._nk);
		this._f.closeP(this._np);
		this._f.closeLocvars(this._nlocvars);
		this._f.closeUpvalues();
		var checks:boolean = this._L!.gCheckcode(this._f);
		//# assert checks
		//# assert bl == null
	}

	/** Equivalent to getlocvar from lparser.c.
	* Accesses <code>LocVar</code>s of the {@link Proto}.
	*/
	public getlocvar(idx:number):LocVar
	{
		return this._f.locvars![this._actvar[idx]];
	}


	// Functions from lcode.c

	/** Equivalent to luaK_checkstack. */
	public kCheckstack(n:number):void 
	{
		var newstack:number = this._freereg + n;
		if (newstack > this._f.maxstacksize)
		{
			if (newstack >= Lua.MAXSTACK)
			{
				this._ls.xSyntaxerror("function or expression too complex");
			}
			this._f.maxstacksize = newstack;
		}
	}

	/** Equivalent to luaK_code. */
	public kCode(i:number, line:number):number
	{
		this.dischargejpc();
		// Put new instruction in code array.
		this._f.codeAppend(this._L, this._pc, i, line);
		return this._pc++;
	}

	/** Equivalent to luaK_codeABC. */
	public kCodeABC(o:number, a:number, b:number, c:number):number
	{
		// assert getOpMode(o) == iABC;
		// assert getBMode(o) != OP_ARG_N || b == 0;
		// assert getCMode(o) != OP_ARG_N || c == 0;
		return this.kCode(Lua.CREATE_ABC(o, a, b, c), this._ls.lastline);
	}

	/** Equivalent to luaK_codeABx. */
	public kCodeABx(o:number, a:number, bc:number):number
	{
		// assert getOpMode(o) == iABx || getOpMode(o) == iAsBx);
		// assert getCMode(o) == OP_ARG_N);
		return this.kCode(Lua.CREATE_ABx(o, a, bc), this._ls.lastline);
	}

	/** Equivalent to luaK_codeAsBx. */
	public kCodeAsBx(o:number, a:number, bc:number):number
	{
		return this.kCodeABx(o, a, bc+Lua.MAXARG_sBx);
	}

	/** Equivalent to luaK_dischargevars. */
	public kDischargevars(e:Expdesc):void
	{
		switch (e.kind)
		{
			case Expdesc.VLOCAL:
				e.kind = Expdesc.VNONRELOC;
				break;
		
			case Expdesc.VUPVAL:
				e.reloc(this.kCodeABC(Lua.OP_GETUPVAL, 0, e.info, 0));
				break;
		
			case Expdesc.VGLOBAL:
				e.reloc(this.kCodeABx(Lua.OP_GETGLOBAL, 0, e.info));
				break;
		
			case Expdesc.VINDEXED:
				this.__freereg(e.aux); //TODO:
				this.__freereg(e.info); //TODO:
				e.reloc(this.kCodeABC(Lua.OP_GETTABLE, 0, e.info, e.aux));
				break;
		
			case Expdesc.VVARARG:
			case Expdesc.VCALL:
				this.kSetoneret(e);
				break;
		
			default:
				break;  // there is one value available (somewhere)
		}
	}

	/** Equivalent to luaK_exp2anyreg. */
	public kExp2anyreg(e:Expdesc):number
	{
		this.kDischargevars(e);
		if (e.k == Expdesc.VNONRELOC)
		{
			if (!e.hasjumps())
			{
				return e.info;
			}
			if (e.info >= this._nactvar)          // reg is not a local?
			{
				this.exp2reg(e, e.info);   // put value on it
				return e.info;
			}
		}
		this.kExp2nextreg(e);    // default
		return e.info;
	}

	/** Equivalent to luaK_exp2nextreg. */
	public kExp2nextreg(e:Expdesc):void 
	{
		this.kDischargevars(e);
		this.freeexp(e);
		this.kReserveregs(1);
		this.exp2reg(e, this._freereg - 1);
	}

	/** Equivalent to luaK_fixline. */
	public kFixline(line:number):void 
	{
		this._f.setLineinfo(this._pc - 1, line);
	}

	/** Equivalent to luaK_infix. */
	public kInfix(op:number, v:Expdesc):void
	{
		switch (op)
		{
			case Syntax.OPR_AND:
				this.kGoiftrue(v);
				break;
			
			case Syntax.OPR_OR:
				this.kGoiffalse(v);
				break;
	
			case Syntax.OPR_CONCAT:
				this.kExp2nextreg(v);  /* operand must be on the `stack' */
				break;
	
			default:
				if (!this.isnumeral(v))
					this.kExp2RK(v);
				break;
		}
	}
	
	private isnumeral(e:Expdesc):boolean
	{
		return e.k == Expdesc.VKNUM &&
			e.t == FuncState.NO_JUMP &&
			e.f == FuncState.NO_JUMP;
	}

	/** Equivalent to luaK_nil. */
	public kNil(from:number, n:number):void 
	{
		var previous:number;
		if (this._pc > this._lasttarget)   /* no jumps to current position? */
		{
			if (this._pc == 0)  /* function start? */
				return;  /* positions are already clean */
			previous = this._pc - 1 ;
			var instr:number = this._f.code![previous] ;
			if (Lua.OPCODE(instr) == Lua.OP_LOADNIL)
			{
				var pfrom:number = Lua.ARGA(instr);
				var pto:number = Lua.ARGB(instr);
				if (pfrom <= from && from <= pto+1)  /* can connect both? */
				{
					if (from+n-1 > pto)
						this._f.code![previous] = Lua.SETARG_B(instr, from+n-1);
					return;
				}
			}
		}
		this.kCodeABC(Lua.OP_LOADNIL, from, from + n - 1, 0);
	}

	/** Equivalent to luaK_numberK. */
	public kNumberK(r:number):number 
	{
		return this.addk(Lua.valueOfNumber(r)); //TODO:L->Lua
	}

	/** Equivalent to luaK_posfix. */
	public kPosfix(op:number, e1:Expdesc, e2:Expdesc):void
	{
		switch (op)
		{
			case Syntax.OPR_AND:
				/* list must be closed */
				//# assert e1.t == NO_JUMP
				this.kDischargevars(e2);
				e2.f = this.kConcat(e2.f, e1.f);
				e1.copy(e2); //TODO:
				break;

			case Syntax.OPR_OR:
				/* list must be closed */
				//# assert e1.f == NO_JUMP
				this.kDischargevars(e2);
				e2.t = this.kConcat(e2.t, e1.t);
				e1.copy(e2); //TODO:
				break;

			case Syntax.OPR_CONCAT:
				this.kExp2val(e2);
				if (e2.k == Expdesc.VRELOCABLE && Lua.OPCODE(this.getcode(e2)) == Lua.OP_CONCAT)
				{
					//# assert e1.info == Lua.ARGB(getcode(e2))-1
					this.freeexp(e1);
					this.setcode(e2, Lua.SETARG_B(this.getcode(e2), e1.info));
					e1.k = e2.k;
					e1.info = e2.info;
				}
				else
				{
					this.kExp2nextreg(e2);  /* operand must be on the 'stack' */
					this.codearith(Lua.OP_CONCAT, e1, e2);
				}
				break;
		
			case Syntax.OPR_ADD: 
				this.codearith(Lua.OP_ADD, e1, e2); 
				break;
			
			case Syntax.OPR_SUB: 
				this.codearith(Lua.OP_SUB, e1, e2); 
				break;
			
			case Syntax.OPR_MUL: 
				this.codearith(Lua.OP_MUL, e1, e2); 
				break;
			
			case Syntax.OPR_DIV: 
				this.codearith(Lua.OP_DIV, e1, e2); 
				break;
			
			case Syntax.OPR_MOD: 
				this.codearith(Lua.OP_MOD, e1, e2); 
				break;
			
			case Syntax.OPR_POW: 
				this.codearith(Lua.OP_POW, e1, e2); 
				break;
			
			case Syntax.OPR_EQ: 
				this.codecomp(Lua.OP_EQ, true,  e1, e2); 
				break;
			
			case Syntax.OPR_NE: 
				this.codecomp(Lua.OP_EQ, false, e1, e2); 
				break;
			
			case Syntax.OPR_LT: 
				this.codecomp(Lua.OP_LT, true,  e1, e2); 
				break;
			
			case Syntax.OPR_LE: 
				this.codecomp(Lua.OP_LE, true,  e1, e2); 
				break;
			
			case Syntax.OPR_GT: 
				this.codecomp(Lua.OP_LT, false, e1, e2); 
				break;
			
			case Syntax.OPR_GE: 
				this.codecomp(Lua.OP_LE, false, e1, e2); 
				break;
			
			default:
				//# assert false
		}
	}
	
	/** Equivalent to luaK_prefix. */
	public kPrefix(op:number, e:Expdesc):void
	{
		var e2:Expdesc = new Expdesc();// TODO:
		e2.init(Expdesc.VKNUM, 0);
		switch (op)
		{
			case Syntax.OPR_MINUS:
				if (e.kind == Expdesc.VK)
				{
					this.kExp2anyreg(e);
				}
				this.codearith(Lua.OP_UNM, e, e2);
				break;
				
			case Syntax.OPR_NOT:
				this.codenot(e);
				break;
			
			case Syntax.OPR_LEN:
				this.kExp2anyreg(e);
				this.codearith(Lua.OP_LEN, e, e2);
				break;
			
			default:
				throw new IllegalArgumentException();
		}
	}

	/** Equivalent to luaK_reserveregs. */
	public kReserveregs(n:number):void
	{
		this.kCheckstack(n);
		this._freereg += n;
	}

	/** Equivalent to luaK_ret. */
	public kRet(first:number, nret:number):void
	{
		this.kCodeABC(Lua.OP_RETURN, first, nret+1, 0);
	}
	
	/** Equivalent to luaK_setmultret (in lcode.h). */
	public kSetmultret(e:Expdesc):void
	{
		this.kSetreturns(e, Lua.MULTRET);
	}
	
	/** Equivalent to luaK_setoneret. */
	public kSetoneret(e:Expdesc):void
	{
		if (e.kind == Expdesc.VCALL)      // expression is an open function call?
		{
			e.nonreloc(Lua.ARGA(this.getcode(e)));
		}
		else if (e.kind == Expdesc.VVARARG)
		{
			this.setargb(e, 2);
			e.kind = Expdesc.VRELOCABLE;
		}
	}
	
	/** Equivalent to luaK_setreturns. */
	public kSetreturns(e:Expdesc, nresults:number):void
	{
		if (e.kind == Expdesc.VCALL)      // expression is an open function call?
		{
			this.setargc(e, nresults+1);
		}
		else if (e.kind == Expdesc.VVARARG)
		{
			this.setargb(e, nresults+1);
			this.setarga(e, this._freereg);
			this.kReserveregs(1);
		}
	}

	/** Equivalent to luaK_stringK. */
	public kStringK(s:string | null):number
	{
		return this.addk(s/*.intern()*/);
	}

	private addk(o:Object | null):number
	{
		var hash:Object | null = o;
		var v:Object = this._h._get(hash); //TODO:get
		if (v != null)
		{
			// :todo: assert
			return v as number; //TODO:
		}
		// constant not found; create a new entry
		this._f.constantAppend(this._nk, o);
		this._h.put(hash, new Number(this._nk)); //TODO:
		return this._nk++;
	}
	
	private codearith(op:number, e1:Expdesc, e2:Expdesc):void
	{
		if (this.constfolding(op, e1, e2))
			return;
		else
		{
			var o1:number = this.kExp2RK(e1);
			var o2:number = (op != Lua.OP_UNM && op != Lua.OP_LEN) ? this.kExp2RK(e2) : 0;
			this.freeexp(e2);
			this.freeexp(e1);
			e1.info = this.kCodeABC(op, 0, o1, o2);
			e1.k = Expdesc.VRELOCABLE;
		}
	}

	private constfolding(op:number, e1:Expdesc, e2:Expdesc):boolean
	{
		var r:number = 0;
		if (!this.isnumeral(e1) || !this.isnumeral(e2))
			return false;
		
		var v1:number = e1.nval;
		var v2:number = e2.nval;
		switch (op)
		{
			case Lua.OP_ADD: 
				r = v1 + v2; 
				break;
			
			case Lua.OP_SUB: 
				r = v1 - v2; 
				break;
			
			case Lua.OP_MUL: 
				r = v1 * v2; 
				break;
			
			case Lua.OP_DIV:
				if (v2 == 0.0)
					return false;  /* do not attempt to divide by 0 */
				r = v1 / v2;
				break;
			
			case Lua.OP_MOD:
				if (v2 == 0.0)
					return false;  /* do not attempt to divide by 0 */
				r = v1 % v2;
				break;
			
			case Lua.OP_POW: 
				r = Lua.iNumpow(v1, v2);  //TODO:L->Lua
				break;
			
			case Lua.OP_UNM: 
				r = -v1; 
				break;
			
			case Lua.OP_LEN: 
				return false;  /* no constant folding for 'len' */
			
			default:
				//# assert false
				r = 0.0; 
				break;
		}
		if (isNaN(r))
			return false;  /* do not attempt to produce NaN */
		e1.nval = r;
		return true;
	}

	private codenot(e:Expdesc):void
	{
		this.kDischargevars(e);
		switch (e.k)
		{
			case Expdesc.VNIL:
			case Expdesc.VFALSE:
				e.k = Expdesc.VTRUE;
				break;

			case Expdesc.VK:
			case Expdesc.VKNUM:
			case Expdesc.VTRUE:
				e.k = Expdesc.VFALSE;
				break;

			case Expdesc.VJMP:
				this.invertjump(e);
				break;

			case Expdesc.VRELOCABLE:
			case Expdesc.VNONRELOC:
				this.discharge2anyreg(e);
				this.freeexp(e);
				e.info = this.kCodeABC(Lua.OP_NOT, 0, e.info, 0);
				e.k = Expdesc.VRELOCABLE;
				break;

			default:
				//# assert false
				break;
		}
		/* interchange true and false lists */
		{ 
			var temp:number = e.f; 
			e.f = e.t; 
			e.t = temp; 
		}
		this.removevalues(e.f);
		this.removevalues(e.t);
	}

	private removevalues(list:number):void
	{
		for (; list != FuncState.NO_JUMP; list = this.getjump(list))
			this.patchtestreg(list, Lua.NO_REG);
	}
	
	private dischargejpc():void
	{
		this.patchlistaux(this._jpc, this._pc, Lua.NO_REG, this._pc);
		this._jpc = FuncState.NO_JUMP;
	}

	private discharge2reg(e:Expdesc, reg:number):void
	{
		this.kDischargevars(e);
		switch (e.k)
		{
			case Expdesc.VNIL:
				this.kNil(reg, 1);
				break;

			case Expdesc.VFALSE:
			case Expdesc.VTRUE:
				this.kCodeABC(Lua.OP_LOADBOOL, reg, (e.k == Expdesc.VTRUE ? 1 : 0), 0);
				break;

			case Expdesc.VK:
				this.kCodeABx(Lua.OP_LOADK, reg, e.info);
				break;

			case Expdesc.VKNUM:
				this.kCodeABx(Lua.OP_LOADK, reg, this.kNumberK(e.nval));
				break;

			case Expdesc.VRELOCABLE:
				this.setarga(e, reg);
				break;

			case Expdesc.VNONRELOC:
				if (reg != e.info)
				{
					this.kCodeABC(Lua.OP_MOVE, reg, e.info, 0);
				}
				break;

			case Expdesc.VVOID:
			case Expdesc.VJMP:
				return ;

			default:
				//# assert false
		}
		e.nonreloc(reg);
	}

	private exp2reg(e:Expdesc, reg:number):void
	{
		this.discharge2reg(e, reg);
		if (e.k == Expdesc.VJMP)
		{
			e.t = this.kConcat(e.t, e.info);  /* put this jump in `t' list */
		}
		if (e.hasjumps())
		{
			var p_f:number = FuncState.NO_JUMP;  /* position of an eventual LOAD false */
			var p_t:number = FuncState.NO_JUMP;  /* position of an eventual LOAD true */
			if (this.need_value(e.t) || this.need_value(e.f))
			{
				var fj:number = (e.k == Expdesc.VJMP) ? FuncState.NO_JUMP : this.kJump();
				p_f = this.code_label(reg, 0, 1);
				p_t = this.code_label(reg, 1, 0);
				this.kPatchtohere(fj);
			}
			var finalpos:number = this.kGetlabel(); /* position after whole expression */
			this.patchlistaux(e.f, finalpos, reg, p_f);
			this.patchlistaux(e.t, finalpos, reg, p_t);
		}
		e.init(Expdesc.VNONRELOC, reg);
	}
	
	private code_label(a:number, b:number, jump:number):number
	{
		this.kGetlabel();  /* those instructions may be jump targets */
		return this.kCodeABC(Lua.OP_LOADBOOL, a, b, jump);
	}
	
	/**
	 * check whether list has any jump that do not produce a value
	 * (or produce an inverted value)
	 */
	private need_value(list:number):boolean
	{
		for (; list != FuncState.NO_JUMP; list = this.getjump(list))
		{
			var i:number = this.getjumpcontrol(list);
			var instr:number = this._f.code![i] ;
			if (Lua.OPCODE(instr) != Lua.OP_TESTSET)
				return true;
		}
		return false;  /* not found */
	}

	private freeexp(e:Expdesc):void
	{
		if (e.kind == Expdesc.VNONRELOC)
		{
			this.__freereg(e.info);
		}
	}
	
	public set freereg(freereg:number)
	{
		this._freereg = freereg;
	}

	public get freereg():number
	{
		return this._freereg;
	}
	
	private __freereg(reg:number):void
	{
		if (!Lua.ISK(reg) && reg >= this._nactvar)
		{
			--this._freereg;
			// assert reg == freereg;
		}
	}
	
	public getcode(e:Expdesc):number
	{
		return this._f.code![e.info];
	}

	public setcode(e:Expdesc, code:number):void
	{
		this._f.code![e.info] = code ;
	}

	/** Equivalent to searchvar from lparser.c */
	public searchvar(n:string | null):number
	{
		// caution: descending loop (in emulation of PUC-Rio).
		for (var i:number = this._nactvar - 1; i >= 0; i--)
		{
			if (n == this.getlocvar(i).varname)
				return i;
		}
		return -1;  // not found
	}

	public setarga(e:Expdesc, a:number):void
	{
		var at:number = e.info;
		var code:number[] | null = this._f.code; //int[] 
		code![at] = Lua.SETARG_A(code![at] as number, a);
	}

	public setargb(e:Expdesc, b:number):void
	{
		var at:number = e.info;
		var code:number[] | null = this._f.code; //int[] 
		code![at] = Lua.SETARG_B(code![at] as number, b);
	}

	public setargc(e:Expdesc, c:number):void
	{
		var at:number = e.info;
		var code:number[] | null = this._f.code; //int[]
		code![at] = Lua.SETARG_C(code![at] as number, c);
	}
	
	/** Equivalent to <code>luaK_getlabel</code>. */
	public kGetlabel():number
	{
		this._lasttarget = this._pc ;
		return this._pc;
	}

	/**
	* Equivalent to <code>luaK_concat</code>.
	* l1 was an int*, now passing back as result.
	*/
	public kConcat(l1:number, l2:number):number 
	{
		if (l2 == FuncState.NO_JUMP)
			return l1;
		else if (l1 == FuncState.NO_JUMP)
			return l2;
		else
		{
			var list:number = l1;
			var next:number;
			while ((next = this.getjump(list)) != FuncState.NO_JUMP)  /* find last element */
				list = next;
			this.fixjump(list, l2);
			return l1;
		}
	}

	/** Equivalent to <code>luaK_patchlist</code>. */
	public kPatchlist(list:number, target:number):void
	{
		if (target == this._pc)
			this.kPatchtohere(list);
		else
		{
			//# assert target < pc
			this.patchlistaux(list, target, Lua.NO_REG, target);
		}
	}

	private patchlistaux(list:number, vtarget:number, reg:number,
							dtarget:number):void
	{
		while (list != FuncState.NO_JUMP)
		{
			var next:number = this.getjump(list);
			if (this.patchtestreg(list, reg))
				this.fixjump(list, vtarget);
			else
				this.fixjump(list, dtarget);  /* jump to default target */
			list = next;
		}
	}

	private patchtestreg(node:number, reg:number):boolean
	{
		var i:number = this.getjumpcontrol(node);
		var code:number[] | null = this._f.code; //int [] 
		var instr:number = code![i] ;
		if (Lua.OPCODE(instr) != Lua.OP_TESTSET)
			return false;  /* cannot patch other instructions */
		if (reg != Lua.NO_REG && reg != Lua.ARGB(instr))
			code![i] = Lua.SETARG_A(instr, reg);
		else  /* no register to put value or register already has the value */
			code![i] = Lua.CREATE_ABC(Lua.OP_TEST, Lua.ARGB(instr), 0, Lua.ARGC(instr));
	
		return true;
	}

	private getjumpcontrol(at:number):number
	{
		var code:number[] | null = this._f.code; //int []
		if (at >= 1 && this.testTMode(Lua.OPCODE(code![at-1])))
			return at - 1;
		else
			return at;
	}

	/*
	** masks for instruction properties. The format is:
	** bits 0-1: op mode
	** bits 2-3: C arg mode
	** bits 4-5: B arg mode
	** bit 6: instruction set register A
	** bit 7: operator is a test
	*/

	/** arg modes */
	private static OP_ARG_N:number = 0 ;
	private static OP_ARG_U:number = 1 ;
	private static OP_ARG_R:number = 2 ;
	private static OP_ARG_K:number = 3 ;
	
	/** op modes */
	private static iABC:number = 0 ;
	private static iABx:number = 1 ;
	private static iAsBx:number = 2 ;

	public static opmode(t:number, a:number, b:number, c:number, m:number):number
	{
		return ((t<<7) | (a<<6) | (b<<4) | (c<<2) | m) as number;
	}

	private static OPMODE:number[] = //new byte []
	[
		/*      T  A  B         C         mode                opcode  */
		 FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_MOVE */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx)            /* OP_LOADK */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_LOADBOOL */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_LOADNIL */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_GETUPVAL */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx)            /* OP_GETGLOBAL */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_GETTABLE */
		,FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx)            /* OP_SETGLOBAL */
		,FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_SETUPVAL */
		,FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_SETTABLE */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_NEWTABLE */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_SELF */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_ADD */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_SUB */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_MUL */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_DIV */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_MOD */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_POW */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_UNM */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_NOT */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_LEN */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_R, FuncState.iABC)            /* OP_CONCAT */
		,FuncState.opmode(0, 0, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx)           /* OP_JMP */
		,FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_EQ */
		,FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_LT */
		,FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC)            /* OP_LE */
		,FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_TEST */
		,FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_TESTSET */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_CALL */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_TAILCALL */
		,FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_RETURN */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx)           /* OP_FORLOOP */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx)           /* OP_FORPREP */
		,FuncState.opmode(1, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_TFORLOOP */
		,FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC)            /* OP_SETLIST */
		,FuncState.opmode(0, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_CLOSE */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABx)            /* OP_CLOSURE */
		,FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC)            /* OP_VARARG */
	];

	private getOpMode(m:number):number
	{
		return FuncState.OPMODE[m] & 3 ;
	}
	
	private testAMode(m:number):boolean
	{
		return (FuncState.OPMODE[m] & (1<<6)) != 0 ;
	}
	
	private testTMode(m:number):boolean 
	{
		return (FuncState.OPMODE[m] & (1<<7)) != 0 ;
	}

	/** Equivalent to <code>luaK_patchtohere</code>. */
	public kPatchtohere(list:number):void
	{
		this.kGetlabel();
		this._jpc = this.kConcat(this._jpc, list);
	}

	private fixjump(at:number, dest:number):void
	{
		var jmp:number = this._f.code![at];
		var offset:number = dest-(at+1);
		//# assert dest != NO_JUMP
		if (Math.abs(offset) > Lua.MAXARG_sBx)
			this._ls.xSyntaxerror("control structure too long");
		this._f.code![at] = Lua.SETARG_sBx(jmp, offset);
	}
	
	private getjump(at:number):number
	{
		var offset:number = Lua.ARGsBx(this._f.code![at]);
		if (offset == FuncState.NO_JUMP)  /* point to itself represents end of list */
			return FuncState.NO_JUMP;  /* end of list */
		else
			return (at+1)+offset;  /* turn offset into absolute position */
	}

	/** Equivalent to <code>luaK_jump</code>. */
	public kJump():number
	{
		var old_jpc:number = this._jpc;  /* save list of jumps to here */
		this._jpc = FuncState.NO_JUMP;
		var j:number = this.kCodeAsBx(Lua.OP_JMP, 0, FuncState.NO_JUMP);
		j = this.kConcat(j, old_jpc);  /* keep them on hold */
		return j;
	}

	/** Equivalent to <code>luaK_storevar</code>. */
	public kStorevar(_var:Expdesc, ex:Expdesc):void
	{
		switch (_var.k)
		{
			case Expdesc.VLOCAL:
				{
					this.freeexp(ex);
					this.exp2reg(ex, _var.info);
					return;
				}
			
			case Expdesc.VUPVAL:
				{
					var e:number = this.kExp2anyreg(ex);
					this.kCodeABC(Lua.OP_SETUPVAL, e, _var.info, 0);
					break;
				}
			
			case Expdesc.VGLOBAL:
				{
					var e2:number = this.kExp2anyreg(ex);
					this.kCodeABx(Lua.OP_SETGLOBAL, e2, _var.info);
					break;
				}
			
			case Expdesc.VINDEXED:
				{
					var e3:number = this.kExp2RK(ex);
					this.kCodeABC(Lua.OP_SETTABLE, _var.info, _var.aux, e3);
					break;
				}
			
			default:
				{
					/* invalid var kind to store */
					//# assert false
					break;
				}
		}
		this.freeexp(ex);
	}

	/** Equivalent to <code>luaK_indexed</code>. */
	public kIndexed(t:Expdesc, k:Expdesc):void
	{
		t.aux = this.kExp2RK(k);
		t.k = Expdesc.VINDEXED;
	}
	
	/** Equivalent to <code>luaK_exp2RK</code>. */
	public kExp2RK(e:Expdesc):number
	{
		this.kExp2val(e);
		switch (e.k)
		{
			case Expdesc.VKNUM:
			case Expdesc.VTRUE:
			case Expdesc.VFALSE:
			case Expdesc.VNIL:
				if (this._nk <= Lua.MAXINDEXRK)    /* constant fit in RK operand? */
				{
					e.info = (e.k == Expdesc.VNIL)  ? this.nilK() :
						(e.k == Expdesc.VKNUM) ? this.kNumberK(e.nval) :
						this.boolK(e.k == Expdesc.VTRUE);
					e.k = Expdesc.VK;
					return e.info | Lua.BITRK;
				}
				else 
					break;

			case Expdesc.VK:
				if (e.info <= Lua.MAXINDEXRK)  /* constant fit in argC? */
					return e.info | Lua.BITRK;
				else 
					break;

			default: 
				break;
		}
		/* not a constant in the right range: put it in a register */
		return this.kExp2anyreg(e);
	}
	
	/** Equivalent to <code>luaK_exp2val</code>. */
	public kExp2val(e:Expdesc):void
	{
		if (e.hasjumps())
			this.kExp2anyreg(e);
		else
			this.kDischargevars(e);
	}

	private boolK(b:boolean):number
	{
		return this.addk(Lua.valueOfBoolean(b));
	}

	private nilK():number
	{
		return this.addk(Lua.NIL);
	}
	
	/** Equivalent to <code>luaK_goiffalse</code>. */
	public kGoiffalse(e:Expdesc):void
	{
		var lj:number;  /* pc of last jump */
		this.kDischargevars(e);
		switch (e.k)
		{
			case Expdesc.VNIL:
			case Expdesc.VFALSE:
				lj = FuncState.NO_JUMP;  /* always false; do nothing */
				break;

			case Expdesc.VTRUE:
				lj = this.kJump();  /* always jump */
				break;

			case Expdesc.VJMP:
				lj = e.info;
				break;

			default:
				lj = this.jumponcond(e, true);
				break;
		}
		e.t = this.kConcat(e.t, lj);  /* insert last jump in `t' list */
		this.kPatchtohere(e.f);
		e.f = FuncState.NO_JUMP;
	}
	
	/** Equivalent to <code>luaK_goiftrue</code>. */
	public kGoiftrue(e:Expdesc):void
	{
		var lj:number;  /* pc of last jump */
		this.kDischargevars(e);
		switch (e.k)
		{
			case Expdesc.VK:
			case Expdesc.VKNUM:
			case Expdesc.VTRUE:
				lj = FuncState.NO_JUMP;  /* always true; do nothing */
				break;

			case Expdesc.VFALSE:
				lj = this.kJump();  /* always jump */
				break;

			case Expdesc.VJMP:
				this.invertjump(e);
				lj = e.info;
				break;
			
			default:
				lj = this.jumponcond(e, false);
				break;
		}
		e.f = this.kConcat(e.f, lj);  /* insert last jump in `f' list */
		this.kPatchtohere(e.t);
		e.t = FuncState.NO_JUMP;
	}

	private invertjump(e:Expdesc):void
	{
		var at:number = this.getjumpcontrol(e.info);
		var code:number[] | null = this._f.code; //int []
		var instr:number = code![at] ;
		//# assert testTMode(Lua.OPCODE(instr)) && Lua.OPCODE(instr) != Lua.OP_TESTSET && Lua.OPCODE(instr) != Lua.OP_TEST
		code![at] = Lua.SETARG_A(instr, (Lua.ARGA(instr) == 0 ? 1 : 0));
	}
	
	private jumponcond(e:Expdesc, cond:boolean):number
	{
		if (e.k == Expdesc.VRELOCABLE)
		{
			var ie:number = this.getcode(e);
			if (Lua.OPCODE(ie) == Lua.OP_NOT)
			{
				this._pc--;  /* remove previous OP_NOT */
				return this.condjump(Lua.OP_TEST, Lua.ARGB(ie), 0, cond ? 0 : 1);
			}
			/* else go through */
		}
		this.discharge2anyreg(e);
		this.freeexp(e);
		return this.condjump(Lua.OP_TESTSET, Lua.NO_REG, e.info, cond ? 1 : 0);
	}

	private condjump(op:number, a:number, b:number, c:number):number
	{
		this.kCodeABC(op, a, b, c);
		return this.kJump();
	}

	private discharge2anyreg(e:Expdesc):void
	{
		if (e.k != Expdesc.VNONRELOC)
		{
			this.kReserveregs(1);
			this.discharge2reg(e, this._freereg - 1);
		}
	}


	public kSelf(e:Expdesc, key:Expdesc):void
	{
		this.kExp2anyreg(e);
		this.freeexp(e);
		var func:number = this._freereg;
		this.kReserveregs(2);
		this.kCodeABC(Lua.OP_SELF, func, e.info, this.kExp2RK(key));
		this.freeexp(key);
		e.info = func;
		e.k = Expdesc.VNONRELOC;
	}

	public kSetlist(base:number, nelems:number, tostore:number):void
	{
		var c:number =  (nelems - 1) / Lua.LFIELDS_PER_FLUSH + 1;
		var b:number = (tostore == Lua.MULTRET) ? 0 : tostore;
		//# assert tostore != 0
		if (c <= Lua.MAXARG_C)
			this.kCodeABC(Lua.OP_SETLIST, base, b, c);
		else
		{
			this.kCodeABC(Lua.OP_SETLIST, base, b, 0);
			this.kCode(c, this._ls.lastline);
		}
		this._freereg = base + 1;  /* free registers with list values */
	}


	public codecomp(op:number, cond:boolean, e1:Expdesc, e2:Expdesc):void
	{
		var o1:number = this.kExp2RK(e1);
		var o2:number = this.kExp2RK(e2);
		this.freeexp(e2);
		this.freeexp(e1);
		if ((!cond) && op != Lua.OP_EQ)
		{
			/* exchange args to replace by `<' or `<=' */
			var temp:number = o1; 
			o1 = o2; 
			o2 = temp;  /* o1 <==> o2 */
			cond = true;
		}
		e1.info = this.condjump(op, (cond ? 1 : 0), o1, o2);
		e1.k = Expdesc.VJMP;
	}

	public markupval(level:number):void
	{
		var b:BlockCnt | null = this.bl;
		while (b != null && b.nactvar > level)
			b = b.previous;
		if (b != null)
			b.upval = true;
	}
	
	//新增
	public get f():Proto
	{
		return this._f;
	}
	
	//新增
	public set f(f:Proto)
	{
		this._f = f;
	}
	
	//新增
	public get prev():FuncState | null
	{
		return this._prev;
	}
	
	//新增
	public set prev(prev:FuncState | null)
	{
		this._prev = prev;
	}

	//新增
	public set ls(ls:Syntax)
	{
		this._ls = ls;
	}
	
	//新增
	public set L(L:Lua)
	{
		this._L = L;
	}
	
	//新增
	public get bl():BlockCnt | null
	{
		return this._bl;
	}
	
	//新增
	public set bl(bl:BlockCnt | null)
	{
		this._bl = bl;
	}
	
	//新增
	public get pc():number
	{
		return this._pc;
	}		
	
	//新增
	public get np():number
	{
		return this._np;
	}			
	//新增
	public set np(np:number)
	{
		this._np = np;
	}
	
	//新增
	public get nlocvars():number
	{
		return this._nlocvars;
	}			
	//新增
	public set nlocvars(nlocvars:number)
	{
		this._nlocvars = nlocvars;
	}	
	
	
	//新增
	public get nactvar():number
	{
		return this._nactvar;
	}			
	//新增
	public set nactvar(nactvar:number)
	{
		this._nactvar = nactvar;
	}
	
	//新增
	public get upvalues():number[]
	{
		return this._upvalues;
	}		
	
	//新增
	public get actvar():number[]
	{
		return this._actvar;
	}				
}
