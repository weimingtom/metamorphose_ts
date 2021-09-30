(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Hashtable", "../java/IllegalArgumentException", "./Expdesc", "./Lua", "./Proto", "./Syntax"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FuncState = void 0;
    const Hashtable_1 = require("../java/Hashtable");
    const IllegalArgumentException_1 = require("../java/IllegalArgumentException");
    const Expdesc_1 = require("./Expdesc");
    const Lua_1 = require("./Lua");
    const Proto_1 = require("./Proto");
    const Syntax_1 = require("./Syntax");
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
    class FuncState {
        /**
         * Constructor.  Much of this is taken from <code>open_func</code> in
         * <code>lparser.c</code>.
         */
        constructor(ls) {
            /**
            * Table to find (and reuse) elements in <var>f.k</var>.  Maps from
            * Object (a constant Lua value) to an index into <var>f.k</var>.
            */
            this._h = new Hashtable_1.Hashtable();
            /** Enclosing function. */
            this._prev = null;
            /** chain of current blocks */
            this._bl = null; // = null;
            /** next position to code. */
            this._pc = 0; // = 0;
            /** pc of last jump target. */
            this._lasttarget = -1;
            /** List of pending jumps to <var>pc</var>. */
            this._jpc = FuncState.NO_JUMP;
            /** First free register. */
            this._freereg = 0; // = 0;
            /** number of elements in <var>k</var>. */
            this._nk = 0; // = 0;
            /** number of elements in <var>p</var>. */
            this._np = 0; // = 0;
            /** number of elements in <var>locvars</var>. */
            this._nlocvars = 0; // = 0;
            /** number of active local variables. */
            this._nactvar = 0; // = 0;
            /** upvalues as 8-bit k and 8-bit info */
            this._upvalues = new Array(Lua_1.Lua.MAXUPVALUES); //int [] 
            /** declared-variable stack. */
            this._actvar = new Array(Lua_1.Lua.MAXVARS); //short[] 
            this._f = new Proto_1.Proto();
            this._f.init2(ls.source, 2); // default value for maxstacksize=2
            this._L = ls.L;
            this._ls = ls;
            //    prev = ls.linkfs(this);
        }
        /** Equivalent to <code>close_func</code> from <code>lparser.c</code>. */
        close() {
            this._f.closeCode(this._pc);
            this._f.closeLineinfo(this._pc);
            this._f.closeK(this._nk);
            this._f.closeP(this._np);
            this._f.closeLocvars(this._nlocvars);
            this._f.closeUpvalues();
            var checks = this._L.gCheckcode(this._f);
            //# assert checks
            //# assert bl == null
        }
        /** Equivalent to getlocvar from lparser.c.
        * Accesses <code>LocVar</code>s of the {@link Proto}.
        */
        getlocvar(idx) {
            return this._f.locvars[this._actvar[idx]];
        }
        // Functions from lcode.c
        /** Equivalent to luaK_checkstack. */
        kCheckstack(n) {
            var newstack = this._freereg + n;
            if (newstack > this._f.maxstacksize) {
                if (newstack >= Lua_1.Lua.MAXSTACK) {
                    this._ls.xSyntaxerror("function or expression too complex");
                }
                this._f.maxstacksize = newstack;
            }
        }
        /** Equivalent to luaK_code. */
        kCode(i, line) {
            this.dischargejpc();
            // Put new instruction in code array.
            this._f.codeAppend(this._L, this._pc, i, line);
            return this._pc++;
        }
        /** Equivalent to luaK_codeABC. */
        kCodeABC(o, a, b, c) {
            // assert getOpMode(o) == iABC;
            // assert getBMode(o) != OP_ARG_N || b == 0;
            // assert getCMode(o) != OP_ARG_N || c == 0;
            return this.kCode(Lua_1.Lua.CREATE_ABC(o, a, b, c), this._ls.lastline);
        }
        /** Equivalent to luaK_codeABx. */
        kCodeABx(o, a, bc) {
            // assert getOpMode(o) == iABx || getOpMode(o) == iAsBx);
            // assert getCMode(o) == OP_ARG_N);
            return this.kCode(Lua_1.Lua.CREATE_ABx(o, a, bc), this._ls.lastline);
        }
        /** Equivalent to luaK_codeAsBx. */
        kCodeAsBx(o, a, bc) {
            return this.kCodeABx(o, a, bc + Lua_1.Lua.MAXARG_sBx);
        }
        /** Equivalent to luaK_dischargevars. */
        kDischargevars(e) {
            switch (e.kind) {
                case Expdesc_1.Expdesc.VLOCAL:
                    e.kind = Expdesc_1.Expdesc.VNONRELOC;
                    break;
                case Expdesc_1.Expdesc.VUPVAL:
                    e.reloc(this.kCodeABC(Lua_1.Lua.OP_GETUPVAL, 0, e.info, 0));
                    break;
                case Expdesc_1.Expdesc.VGLOBAL:
                    e.reloc(this.kCodeABx(Lua_1.Lua.OP_GETGLOBAL, 0, e.info));
                    break;
                case Expdesc_1.Expdesc.VINDEXED:
                    this.__freereg(e.aux); //TODO:
                    this.__freereg(e.info); //TODO:
                    e.reloc(this.kCodeABC(Lua_1.Lua.OP_GETTABLE, 0, e.info, e.aux));
                    break;
                case Expdesc_1.Expdesc.VVARARG:
                case Expdesc_1.Expdesc.VCALL:
                    this.kSetoneret(e);
                    break;
                default:
                    break; // there is one value available (somewhere)
            }
        }
        /** Equivalent to luaK_exp2anyreg. */
        kExp2anyreg(e) {
            this.kDischargevars(e);
            if (e.k == Expdesc_1.Expdesc.VNONRELOC) {
                if (!e.hasjumps()) {
                    return e.info;
                }
                if (e.info >= this._nactvar) // reg is not a local?
                 {
                    this.exp2reg(e, e.info); // put value on it
                    return e.info;
                }
            }
            this.kExp2nextreg(e); // default
            return e.info;
        }
        /** Equivalent to luaK_exp2nextreg. */
        kExp2nextreg(e) {
            this.kDischargevars(e);
            this.freeexp(e);
            this.kReserveregs(1);
            this.exp2reg(e, this._freereg - 1);
        }
        /** Equivalent to luaK_fixline. */
        kFixline(line) {
            this._f.setLineinfo(this._pc - 1, line);
        }
        /** Equivalent to luaK_infix. */
        kInfix(op, v) {
            switch (op) {
                case Syntax_1.Syntax.OPR_AND:
                    this.kGoiftrue(v);
                    break;
                case Syntax_1.Syntax.OPR_OR:
                    this.kGoiffalse(v);
                    break;
                case Syntax_1.Syntax.OPR_CONCAT:
                    this.kExp2nextreg(v); /* operand must be on the `stack' */
                    break;
                default:
                    if (!this.isnumeral(v))
                        this.kExp2RK(v);
                    break;
            }
        }
        isnumeral(e) {
            return e.k == Expdesc_1.Expdesc.VKNUM &&
                e.t == FuncState.NO_JUMP &&
                e.f == FuncState.NO_JUMP;
        }
        /** Equivalent to luaK_nil. */
        kNil(from, n) {
            var previous;
            if (this._pc > this._lasttarget) /* no jumps to current position? */ {
                if (this._pc == 0) /* function start? */
                    return; /* positions are already clean */
                previous = this._pc - 1;
                var instr = this._f.code[previous];
                if (Lua_1.Lua.OPCODE(instr) == Lua_1.Lua.OP_LOADNIL) {
                    var pfrom = Lua_1.Lua.ARGA(instr);
                    var pto = Lua_1.Lua.ARGB(instr);
                    if (pfrom <= from && from <= pto + 1) /* can connect both? */ {
                        if (from + n - 1 > pto)
                            this._f.code[previous] = Lua_1.Lua.SETARG_B(instr, from + n - 1);
                        return;
                    }
                }
            }
            this.kCodeABC(Lua_1.Lua.OP_LOADNIL, from, from + n - 1, 0);
        }
        /** Equivalent to luaK_numberK. */
        kNumberK(r) {
            return this.addk(Lua_1.Lua.valueOfNumber(r)); //TODO:L->Lua
        }
        /** Equivalent to luaK_posfix. */
        kPosfix(op, e1, e2) {
            switch (op) {
                case Syntax_1.Syntax.OPR_AND:
                    /* list must be closed */
                    //# assert e1.t == NO_JUMP
                    this.kDischargevars(e2);
                    e2.f = this.kConcat(e2.f, e1.f);
                    e1.copy(e2); //TODO:
                    break;
                case Syntax_1.Syntax.OPR_OR:
                    /* list must be closed */
                    //# assert e1.f == NO_JUMP
                    this.kDischargevars(e2);
                    e2.t = this.kConcat(e2.t, e1.t);
                    e1.copy(e2); //TODO:
                    break;
                case Syntax_1.Syntax.OPR_CONCAT:
                    this.kExp2val(e2);
                    if (e2.k == Expdesc_1.Expdesc.VRELOCABLE && Lua_1.Lua.OPCODE(this.getcode(e2)) == Lua_1.Lua.OP_CONCAT) {
                        //# assert e1.info == Lua.ARGB(getcode(e2))-1
                        this.freeexp(e1);
                        this.setcode(e2, Lua_1.Lua.SETARG_B(this.getcode(e2), e1.info));
                        e1.k = e2.k;
                        e1.info = e2.info;
                    }
                    else {
                        this.kExp2nextreg(e2); /* operand must be on the 'stack' */
                        this.codearith(Lua_1.Lua.OP_CONCAT, e1, e2);
                    }
                    break;
                case Syntax_1.Syntax.OPR_ADD:
                    this.codearith(Lua_1.Lua.OP_ADD, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_SUB:
                    this.codearith(Lua_1.Lua.OP_SUB, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_MUL:
                    this.codearith(Lua_1.Lua.OP_MUL, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_DIV:
                    this.codearith(Lua_1.Lua.OP_DIV, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_MOD:
                    this.codearith(Lua_1.Lua.OP_MOD, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_POW:
                    this.codearith(Lua_1.Lua.OP_POW, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_EQ:
                    this.codecomp(Lua_1.Lua.OP_EQ, true, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_NE:
                    this.codecomp(Lua_1.Lua.OP_EQ, false, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_LT:
                    this.codecomp(Lua_1.Lua.OP_LT, true, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_LE:
                    this.codecomp(Lua_1.Lua.OP_LE, true, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_GT:
                    this.codecomp(Lua_1.Lua.OP_LT, false, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_GE:
                    this.codecomp(Lua_1.Lua.OP_LE, false, e1, e2);
                    break;
                default:
                //# assert false
            }
        }
        /** Equivalent to luaK_prefix. */
        kPrefix(op, e) {
            var e2 = new Expdesc_1.Expdesc(); // TODO:
            e2.init(Expdesc_1.Expdesc.VKNUM, 0);
            switch (op) {
                case Syntax_1.Syntax.OPR_MINUS:
                    if (e.kind == Expdesc_1.Expdesc.VK) {
                        this.kExp2anyreg(e);
                    }
                    this.codearith(Lua_1.Lua.OP_UNM, e, e2);
                    break;
                case Syntax_1.Syntax.OPR_NOT:
                    this.codenot(e);
                    break;
                case Syntax_1.Syntax.OPR_LEN:
                    this.kExp2anyreg(e);
                    this.codearith(Lua_1.Lua.OP_LEN, e, e2);
                    break;
                default:
                    throw new IllegalArgumentException_1.IllegalArgumentException();
            }
        }
        /** Equivalent to luaK_reserveregs. */
        kReserveregs(n) {
            this.kCheckstack(n);
            this._freereg += n;
        }
        /** Equivalent to luaK_ret. */
        kRet(first, nret) {
            this.kCodeABC(Lua_1.Lua.OP_RETURN, first, nret + 1, 0);
        }
        /** Equivalent to luaK_setmultret (in lcode.h). */
        kSetmultret(e) {
            this.kSetreturns(e, Lua_1.Lua.MULTRET);
        }
        /** Equivalent to luaK_setoneret. */
        kSetoneret(e) {
            if (e.kind == Expdesc_1.Expdesc.VCALL) // expression is an open function call?
             {
                e.nonreloc(Lua_1.Lua.ARGA(this.getcode(e)));
            }
            else if (e.kind == Expdesc_1.Expdesc.VVARARG) {
                this.setargb(e, 2);
                e.kind = Expdesc_1.Expdesc.VRELOCABLE;
            }
        }
        /** Equivalent to luaK_setreturns. */
        kSetreturns(e, nresults) {
            if (e.kind == Expdesc_1.Expdesc.VCALL) // expression is an open function call?
             {
                this.setargc(e, nresults + 1);
            }
            else if (e.kind == Expdesc_1.Expdesc.VVARARG) {
                this.setargb(e, nresults + 1);
                this.setarga(e, this._freereg);
                this.kReserveregs(1);
            }
        }
        /** Equivalent to luaK_stringK. */
        kStringK(s) {
            return this.addk(s /*.intern()*/);
        }
        addk(o) {
            var hash = o;
            var v = this._h._get(hash); //TODO:get
            if (v != null) {
                // :todo: assert
                return v; //TODO:
            }
            // constant not found; create a new entry
            this._f.constantAppend(this._nk, o);
            this._h.put(hash, new Number(this._nk)); //TODO:
            return this._nk++;
        }
        codearith(op, e1, e2) {
            if (this.constfolding(op, e1, e2))
                return;
            else {
                var o1 = this.kExp2RK(e1);
                var o2 = (op != Lua_1.Lua.OP_UNM && op != Lua_1.Lua.OP_LEN) ? this.kExp2RK(e2) : 0;
                this.freeexp(e2);
                this.freeexp(e1);
                e1.info = this.kCodeABC(op, 0, o1, o2);
                e1.k = Expdesc_1.Expdesc.VRELOCABLE;
            }
        }
        constfolding(op, e1, e2) {
            var r = 0;
            if (!this.isnumeral(e1) || !this.isnumeral(e2))
                return false;
            var v1 = e1.nval;
            var v2 = e2.nval;
            switch (op) {
                case Lua_1.Lua.OP_ADD:
                    r = v1 + v2;
                    break;
                case Lua_1.Lua.OP_SUB:
                    r = v1 - v2;
                    break;
                case Lua_1.Lua.OP_MUL:
                    r = v1 * v2;
                    break;
                case Lua_1.Lua.OP_DIV:
                    if (v2 == 0.0)
                        return false; /* do not attempt to divide by 0 */
                    r = v1 / v2;
                    break;
                case Lua_1.Lua.OP_MOD:
                    if (v2 == 0.0)
                        return false; /* do not attempt to divide by 0 */
                    r = v1 % v2;
                    break;
                case Lua_1.Lua.OP_POW:
                    r = Lua_1.Lua.iNumpow(v1, v2); //TODO:L->Lua
                    break;
                case Lua_1.Lua.OP_UNM:
                    r = -v1;
                    break;
                case Lua_1.Lua.OP_LEN:
                    return false; /* no constant folding for 'len' */
                default:
                    //# assert false
                    r = 0.0;
                    break;
            }
            if (isNaN(r))
                return false; /* do not attempt to produce NaN */
            e1.nval = r;
            return true;
        }
        codenot(e) {
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VNIL:
                case Expdesc_1.Expdesc.VFALSE:
                    e.k = Expdesc_1.Expdesc.VTRUE;
                    break;
                case Expdesc_1.Expdesc.VK:
                case Expdesc_1.Expdesc.VKNUM:
                case Expdesc_1.Expdesc.VTRUE:
                    e.k = Expdesc_1.Expdesc.VFALSE;
                    break;
                case Expdesc_1.Expdesc.VJMP:
                    this.invertjump(e);
                    break;
                case Expdesc_1.Expdesc.VRELOCABLE:
                case Expdesc_1.Expdesc.VNONRELOC:
                    this.discharge2anyreg(e);
                    this.freeexp(e);
                    e.info = this.kCodeABC(Lua_1.Lua.OP_NOT, 0, e.info, 0);
                    e.k = Expdesc_1.Expdesc.VRELOCABLE;
                    break;
                default:
                    //# assert false
                    break;
            }
            /* interchange true and false lists */
            {
                var temp = e.f;
                e.f = e.t;
                e.t = temp;
            }
            this.removevalues(e.f);
            this.removevalues(e.t);
        }
        removevalues(list) {
            for (; list != FuncState.NO_JUMP; list = this.getjump(list))
                this.patchtestreg(list, Lua_1.Lua.NO_REG);
        }
        dischargejpc() {
            this.patchlistaux(this._jpc, this._pc, Lua_1.Lua.NO_REG, this._pc);
            this._jpc = FuncState.NO_JUMP;
        }
        discharge2reg(e, reg) {
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VNIL:
                    this.kNil(reg, 1);
                    break;
                case Expdesc_1.Expdesc.VFALSE:
                case Expdesc_1.Expdesc.VTRUE:
                    this.kCodeABC(Lua_1.Lua.OP_LOADBOOL, reg, (e.k == Expdesc_1.Expdesc.VTRUE ? 1 : 0), 0);
                    break;
                case Expdesc_1.Expdesc.VK:
                    this.kCodeABx(Lua_1.Lua.OP_LOADK, reg, e.info);
                    break;
                case Expdesc_1.Expdesc.VKNUM:
                    this.kCodeABx(Lua_1.Lua.OP_LOADK, reg, this.kNumberK(e.nval));
                    break;
                case Expdesc_1.Expdesc.VRELOCABLE:
                    this.setarga(e, reg);
                    break;
                case Expdesc_1.Expdesc.VNONRELOC:
                    if (reg != e.info) {
                        this.kCodeABC(Lua_1.Lua.OP_MOVE, reg, e.info, 0);
                    }
                    break;
                case Expdesc_1.Expdesc.VVOID:
                case Expdesc_1.Expdesc.VJMP:
                    return;
                default:
                //# assert false
            }
            e.nonreloc(reg);
        }
        exp2reg(e, reg) {
            this.discharge2reg(e, reg);
            if (e.k == Expdesc_1.Expdesc.VJMP) {
                e.t = this.kConcat(e.t, e.info); /* put this jump in `t' list */
            }
            if (e.hasjumps()) {
                var p_f = FuncState.NO_JUMP; /* position of an eventual LOAD false */
                var p_t = FuncState.NO_JUMP; /* position of an eventual LOAD true */
                if (this.need_value(e.t) || this.need_value(e.f)) {
                    var fj = (e.k == Expdesc_1.Expdesc.VJMP) ? FuncState.NO_JUMP : this.kJump();
                    p_f = this.code_label(reg, 0, 1);
                    p_t = this.code_label(reg, 1, 0);
                    this.kPatchtohere(fj);
                }
                var finalpos = this.kGetlabel(); /* position after whole expression */
                this.patchlistaux(e.f, finalpos, reg, p_f);
                this.patchlistaux(e.t, finalpos, reg, p_t);
            }
            e.init(Expdesc_1.Expdesc.VNONRELOC, reg);
        }
        code_label(a, b, jump) {
            this.kGetlabel(); /* those instructions may be jump targets */
            return this.kCodeABC(Lua_1.Lua.OP_LOADBOOL, a, b, jump);
        }
        /**
         * check whether list has any jump that do not produce a value
         * (or produce an inverted value)
         */
        need_value(list) {
            for (; list != FuncState.NO_JUMP; list = this.getjump(list)) {
                var i = this.getjumpcontrol(list);
                var instr = this._f.code[i];
                if (Lua_1.Lua.OPCODE(instr) != Lua_1.Lua.OP_TESTSET)
                    return true;
            }
            return false; /* not found */
        }
        freeexp(e) {
            if (e.kind == Expdesc_1.Expdesc.VNONRELOC) {
                this.__freereg(e.info);
            }
        }
        set freereg(freereg) {
            this._freereg = freereg;
        }
        get freereg() {
            return this._freereg;
        }
        __freereg(reg) {
            if (!Lua_1.Lua.ISK(reg) && reg >= this._nactvar) {
                --this._freereg;
                // assert reg == freereg;
            }
        }
        getcode(e) {
            return this._f.code[e.info];
        }
        setcode(e, code) {
            this._f.code[e.info] = code;
        }
        /** Equivalent to searchvar from lparser.c */
        searchvar(n) {
            // caution: descending loop (in emulation of PUC-Rio).
            for (var i = this._nactvar - 1; i >= 0; i--) {
                if (n == this.getlocvar(i).varname)
                    return i;
            }
            return -1; // not found
        }
        setarga(e, a) {
            var at = e.info;
            var code = this._f.code; //int[] 
            code[at] = Lua_1.Lua.SETARG_A(code[at], a);
        }
        setargb(e, b) {
            var at = e.info;
            var code = this._f.code; //int[] 
            code[at] = Lua_1.Lua.SETARG_B(code[at], b);
        }
        setargc(e, c) {
            var at = e.info;
            var code = this._f.code; //int[]
            code[at] = Lua_1.Lua.SETARG_C(code[at], c);
        }
        /** Equivalent to <code>luaK_getlabel</code>. */
        kGetlabel() {
            this._lasttarget = this._pc;
            return this._pc;
        }
        /**
        * Equivalent to <code>luaK_concat</code>.
        * l1 was an int*, now passing back as result.
        */
        kConcat(l1, l2) {
            if (l2 == FuncState.NO_JUMP)
                return l1;
            else if (l1 == FuncState.NO_JUMP)
                return l2;
            else {
                var list = l1;
                var next;
                while ((next = this.getjump(list)) != FuncState.NO_JUMP) /* find last element */
                    list = next;
                this.fixjump(list, l2);
                return l1;
            }
        }
        /** Equivalent to <code>luaK_patchlist</code>. */
        kPatchlist(list, target) {
            if (target == this._pc)
                this.kPatchtohere(list);
            else {
                //# assert target < pc
                this.patchlistaux(list, target, Lua_1.Lua.NO_REG, target);
            }
        }
        patchlistaux(list, vtarget, reg, dtarget) {
            while (list != FuncState.NO_JUMP) {
                var next = this.getjump(list);
                if (this.patchtestreg(list, reg))
                    this.fixjump(list, vtarget);
                else
                    this.fixjump(list, dtarget); /* jump to default target */
                list = next;
            }
        }
        patchtestreg(node, reg) {
            var i = this.getjumpcontrol(node);
            var code = this._f.code; //int [] 
            var instr = code[i];
            if (Lua_1.Lua.OPCODE(instr) != Lua_1.Lua.OP_TESTSET)
                return false; /* cannot patch other instructions */
            if (reg != Lua_1.Lua.NO_REG && reg != Lua_1.Lua.ARGB(instr))
                code[i] = Lua_1.Lua.SETARG_A(instr, reg);
            else /* no register to put value or register already has the value */
                code[i] = Lua_1.Lua.CREATE_ABC(Lua_1.Lua.OP_TEST, Lua_1.Lua.ARGB(instr), 0, Lua_1.Lua.ARGC(instr));
            return true;
        }
        getjumpcontrol(at) {
            var code = this._f.code; //int []
            if (at >= 1 && this.testTMode(Lua_1.Lua.OPCODE(code[at - 1])))
                return at - 1;
            else
                return at;
        }
        static opmode(t, a, b, c, m) {
            return ((t << 7) | (a << 6) | (b << 4) | (c << 2) | m);
        }
        getOpMode(m) {
            return FuncState.OPMODE[m] & 3;
        }
        testAMode(m) {
            return (FuncState.OPMODE[m] & (1 << 6)) != 0;
        }
        testTMode(m) {
            return (FuncState.OPMODE[m] & (1 << 7)) != 0;
        }
        /** Equivalent to <code>luaK_patchtohere</code>. */
        kPatchtohere(list) {
            this.kGetlabel();
            this._jpc = this.kConcat(this._jpc, list);
        }
        fixjump(at, dest) {
            var jmp = this._f.code[at];
            var offset = dest - (at + 1);
            //# assert dest != NO_JUMP
            if (Math.abs(offset) > Lua_1.Lua.MAXARG_sBx)
                this._ls.xSyntaxerror("control structure too long");
            this._f.code[at] = Lua_1.Lua.SETARG_sBx(jmp, offset);
        }
        getjump(at) {
            var offset = Lua_1.Lua.ARGsBx(this._f.code[at]);
            if (offset == FuncState.NO_JUMP) /* point to itself represents end of list */
                return FuncState.NO_JUMP; /* end of list */
            else
                return (at + 1) + offset; /* turn offset into absolute position */
        }
        /** Equivalent to <code>luaK_jump</code>. */
        kJump() {
            var old_jpc = this._jpc; /* save list of jumps to here */
            this._jpc = FuncState.NO_JUMP;
            var j = this.kCodeAsBx(Lua_1.Lua.OP_JMP, 0, FuncState.NO_JUMP);
            j = this.kConcat(j, old_jpc); /* keep them on hold */
            return j;
        }
        /** Equivalent to <code>luaK_storevar</code>. */
        kStorevar(_var, ex) {
            switch (_var.k) {
                case Expdesc_1.Expdesc.VLOCAL:
                    {
                        this.freeexp(ex);
                        this.exp2reg(ex, _var.info);
                        return;
                    }
                case Expdesc_1.Expdesc.VUPVAL:
                    {
                        var e = this.kExp2anyreg(ex);
                        this.kCodeABC(Lua_1.Lua.OP_SETUPVAL, e, _var.info, 0);
                        break;
                    }
                case Expdesc_1.Expdesc.VGLOBAL:
                    {
                        var e2 = this.kExp2anyreg(ex);
                        this.kCodeABx(Lua_1.Lua.OP_SETGLOBAL, e2, _var.info);
                        break;
                    }
                case Expdesc_1.Expdesc.VINDEXED:
                    {
                        var e3 = this.kExp2RK(ex);
                        this.kCodeABC(Lua_1.Lua.OP_SETTABLE, _var.info, _var.aux, e3);
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
        kIndexed(t, k) {
            t.aux = this.kExp2RK(k);
            t.k = Expdesc_1.Expdesc.VINDEXED;
        }
        /** Equivalent to <code>luaK_exp2RK</code>. */
        kExp2RK(e) {
            this.kExp2val(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VKNUM:
                case Expdesc_1.Expdesc.VTRUE:
                case Expdesc_1.Expdesc.VFALSE:
                case Expdesc_1.Expdesc.VNIL:
                    if (this._nk <= Lua_1.Lua.MAXINDEXRK) /* constant fit in RK operand? */ {
                        e.info = (e.k == Expdesc_1.Expdesc.VNIL) ? this.nilK() :
                            (e.k == Expdesc_1.Expdesc.VKNUM) ? this.kNumberK(e.nval) :
                                this.boolK(e.k == Expdesc_1.Expdesc.VTRUE);
                        e.k = Expdesc_1.Expdesc.VK;
                        return e.info | Lua_1.Lua.BITRK;
                    }
                    else
                        break;
                case Expdesc_1.Expdesc.VK:
                    if (e.info <= Lua_1.Lua.MAXINDEXRK) /* constant fit in argC? */
                        return e.info | Lua_1.Lua.BITRK;
                    else
                        break;
                default:
                    break;
            }
            /* not a constant in the right range: put it in a register */
            return this.kExp2anyreg(e);
        }
        /** Equivalent to <code>luaK_exp2val</code>. */
        kExp2val(e) {
            if (e.hasjumps())
                this.kExp2anyreg(e);
            else
                this.kDischargevars(e);
        }
        boolK(b) {
            return this.addk(Lua_1.Lua.valueOfBoolean(b));
        }
        nilK() {
            return this.addk(Lua_1.Lua.NIL);
        }
        /** Equivalent to <code>luaK_goiffalse</code>. */
        kGoiffalse(e) {
            var lj; /* pc of last jump */
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VNIL:
                case Expdesc_1.Expdesc.VFALSE:
                    lj = FuncState.NO_JUMP; /* always false; do nothing */
                    break;
                case Expdesc_1.Expdesc.VTRUE:
                    lj = this.kJump(); /* always jump */
                    break;
                case Expdesc_1.Expdesc.VJMP:
                    lj = e.info;
                    break;
                default:
                    lj = this.jumponcond(e, true);
                    break;
            }
            e.t = this.kConcat(e.t, lj); /* insert last jump in `t' list */
            this.kPatchtohere(e.f);
            e.f = FuncState.NO_JUMP;
        }
        /** Equivalent to <code>luaK_goiftrue</code>. */
        kGoiftrue(e) {
            var lj; /* pc of last jump */
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VK:
                case Expdesc_1.Expdesc.VKNUM:
                case Expdesc_1.Expdesc.VTRUE:
                    lj = FuncState.NO_JUMP; /* always true; do nothing */
                    break;
                case Expdesc_1.Expdesc.VFALSE:
                    lj = this.kJump(); /* always jump */
                    break;
                case Expdesc_1.Expdesc.VJMP:
                    this.invertjump(e);
                    lj = e.info;
                    break;
                default:
                    lj = this.jumponcond(e, false);
                    break;
            }
            e.f = this.kConcat(e.f, lj); /* insert last jump in `f' list */
            this.kPatchtohere(e.t);
            e.t = FuncState.NO_JUMP;
        }
        invertjump(e) {
            var at = this.getjumpcontrol(e.info);
            var code = this._f.code; //int []
            var instr = code[at];
            //# assert testTMode(Lua.OPCODE(instr)) && Lua.OPCODE(instr) != Lua.OP_TESTSET && Lua.OPCODE(instr) != Lua.OP_TEST
            code[at] = Lua_1.Lua.SETARG_A(instr, (Lua_1.Lua.ARGA(instr) == 0 ? 1 : 0));
        }
        jumponcond(e, cond) {
            if (e.k == Expdesc_1.Expdesc.VRELOCABLE) {
                var ie = this.getcode(e);
                if (Lua_1.Lua.OPCODE(ie) == Lua_1.Lua.OP_NOT) {
                    this._pc--; /* remove previous OP_NOT */
                    return this.condjump(Lua_1.Lua.OP_TEST, Lua_1.Lua.ARGB(ie), 0, cond ? 0 : 1);
                }
                /* else go through */
            }
            this.discharge2anyreg(e);
            this.freeexp(e);
            return this.condjump(Lua_1.Lua.OP_TESTSET, Lua_1.Lua.NO_REG, e.info, cond ? 1 : 0);
        }
        condjump(op, a, b, c) {
            this.kCodeABC(op, a, b, c);
            return this.kJump();
        }
        discharge2anyreg(e) {
            if (e.k != Expdesc_1.Expdesc.VNONRELOC) {
                this.kReserveregs(1);
                this.discharge2reg(e, this._freereg - 1);
            }
        }
        kSelf(e, key) {
            this.kExp2anyreg(e);
            this.freeexp(e);
            var func = this._freereg;
            this.kReserveregs(2);
            this.kCodeABC(Lua_1.Lua.OP_SELF, func, e.info, this.kExp2RK(key));
            this.freeexp(key);
            e.info = func;
            e.k = Expdesc_1.Expdesc.VNONRELOC;
        }
        kSetlist(base, nelems, tostore) {
            var c = (nelems - 1) / Lua_1.Lua.LFIELDS_PER_FLUSH + 1;
            var b = (tostore == Lua_1.Lua.MULTRET) ? 0 : tostore;
            //# assert tostore != 0
            if (c <= Lua_1.Lua.MAXARG_C)
                this.kCodeABC(Lua_1.Lua.OP_SETLIST, base, b, c);
            else {
                this.kCodeABC(Lua_1.Lua.OP_SETLIST, base, b, 0);
                this.kCode(c, this._ls.lastline);
            }
            this._freereg = base + 1; /* free registers with list values */
        }
        codecomp(op, cond, e1, e2) {
            var o1 = this.kExp2RK(e1);
            var o2 = this.kExp2RK(e2);
            this.freeexp(e2);
            this.freeexp(e1);
            if ((!cond) && op != Lua_1.Lua.OP_EQ) {
                /* exchange args to replace by `<' or `<=' */
                var temp = o1;
                o1 = o2;
                o2 = temp; /* o1 <==> o2 */
                cond = true;
            }
            e1.info = this.condjump(op, (cond ? 1 : 0), o1, o2);
            e1.k = Expdesc_1.Expdesc.VJMP;
        }
        markupval(level) {
            var b = this.bl;
            while (b != null && b.nactvar > level)
                b = b.previous;
            if (b != null)
                b.upval = true;
        }
        //新增
        get f() {
            return this._f;
        }
        //新增
        set f(f) {
            this._f = f;
        }
        //新增
        get prev() {
            return this._prev;
        }
        //新增
        set prev(prev) {
            this._prev = prev;
        }
        //新增
        set ls(ls) {
            this._ls = ls;
        }
        //新增
        set L(L) {
            this._L = L;
        }
        //新增
        get bl() {
            return this._bl;
        }
        //新增
        set bl(bl) {
            this._bl = bl;
        }
        //新增
        get pc() {
            return this._pc;
        }
        //新增
        get np() {
            return this._np;
        }
        //新增
        set np(np) {
            this._np = np;
        }
        //新增
        get nlocvars() {
            return this._nlocvars;
        }
        //新增
        set nlocvars(nlocvars) {
            this._nlocvars = nlocvars;
        }
        //新增
        get nactvar() {
            return this._nactvar;
        }
        //新增
        set nactvar(nactvar) {
            this._nactvar = nactvar;
        }
        //新增
        get upvalues() {
            return this._upvalues;
        }
        //新增
        get actvar() {
            return this._actvar;
        }
    }
    exports.FuncState = FuncState;
    /** See NO_JUMP in lcode.h. */
    FuncState.NO_JUMP = -1;
    /*
    ** masks for instruction properties. The format is:
    ** bits 0-1: op mode
    ** bits 2-3: C arg mode
    ** bits 4-5: B arg mode
    ** bit 6: instruction set register A
    ** bit 7: operator is a test
    */
    /** arg modes */
    FuncState.OP_ARG_N = 0;
    FuncState.OP_ARG_U = 1;
    FuncState.OP_ARG_R = 2;
    FuncState.OP_ARG_K = 3;
    /** op modes */
    FuncState.iABC = 0;
    FuncState.iABx = 1;
    FuncState.iAsBx = 2;
    FuncState.OPMODE = [
        /*      T  A  B         C         mode                opcode  */
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_MOVE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx) /* OP_LOADK */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_LOADBOOL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_LOADNIL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_GETUPVAL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx) /* OP_GETGLOBAL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC) /* OP_GETTABLE */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx) /* OP_SETGLOBAL */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_SETUPVAL */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_SETTABLE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_NEWTABLE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC) /* OP_SELF */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_ADD */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_SUB */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_MUL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_DIV */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_MOD */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_POW */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_UNM */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_NOT */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_LEN */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_R, FuncState.iABC) /* OP_CONCAT */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx) /* OP_JMP */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_EQ */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_LT */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_LE */,
        FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TEST */,
        FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TESTSET */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_CALL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TAILCALL */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_RETURN */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx) /* OP_FORLOOP */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx) /* OP_FORPREP */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TFORLOOP */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_SETLIST */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_N, FuncState.iABC) /* OP_CLOSE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABx) /* OP_CLOSURE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_VARARG */
    ];
});
//# sourceMappingURL=FuncState.js.map