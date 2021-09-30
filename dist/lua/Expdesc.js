(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./FuncState"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Expdesc = void 0;
    const FuncState_1 = require("./FuncState");
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
    class Expdesc extends Object {
        //TODO:
        constructor() {
            super();
            this._k = 0; // one of V* enums above
            this._info = 0;
            this._aux = 0;
            this._nval = 0;
            this._t = 0;
            this._f = 0;
        }
        //public function Expdesc(k:int, i:int):void
        //{
        //init(k, i);
        //}
        /** Equivalent to init_exp from lparser.c */
        init(kind, i) {
            this._t = FuncState_1.FuncState.NO_JUMP;
            this._f = FuncState_1.FuncState.NO_JUMP;
            this._k = kind;
            this._info = i;
        }
        copy(e) {
            // Must initialise all members of this.
            this._k = e._k;
            this._info = e._info;
            this._aux = e._aux;
            this._nval = e._nval;
            this._t = e._t;
            this._f = e._f;
        }
        get kind() {
            return this._k;
        }
        set kind(kind) {
            this._k = kind;
        }
        get k() {
            return this._k;
        }
        set k(kind) {
            this._k = kind;
        }
        get info() {
            return this._info;
        }
        set info(i) {
            this._info = i;
        }
        get aux() {
            return this._aux;
        }
        set aux(aux) {
            this._aux = aux;
        }
        get nval() {
            return this._nval;
        }
        set nval(d) {
            this._nval = d;
        }
        /** Equivalent to hasmultret from lparser.c */
        hasmultret() {
            return this._k == Expdesc.VCALL || this._k == Expdesc.VVARARG;
        }
        /** Equivalent to hasjumps from lcode.c. */
        hasjumps() {
            return this._t != this._f;
        }
        nonreloc(i) {
            this._k = Expdesc.VNONRELOC;
            this._info = i;
        }
        reloc(i) {
            this._k = Expdesc.VRELOCABLE;
            this._info = i;
        }
        upval(i) {
            this._k = Expdesc.VUPVAL;
            this._info = i;
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
        get t() {
            return this._t;
        }
        //新增
        set t(t) {
            this._t = t;
        }
    }
    exports.Expdesc = Expdesc;
    Expdesc.VVOID = 0; // no value
    Expdesc.VNIL = 1;
    Expdesc.VTRUE = 2;
    Expdesc.VFALSE = 3;
    Expdesc.VK = 4; // info = index into 'k'
    Expdesc.VKNUM = 5; // nval = numerical value
    Expdesc.VLOCAL = 6; // info = local register
    Expdesc.VUPVAL = 7; // info = index into 'upvalues'
    Expdesc.VGLOBAL = 8; // info = index of table;
    // aux = index of global name in 'k'
    Expdesc.VINDEXED = 9; // info = table register
    // aux = index register (or 'k')
    Expdesc.VJMP = 10; // info = instruction pc
    Expdesc.VRELOCABLE = 11; // info = instruction pc
    Expdesc.VNONRELOC = 12; // info = result register
    Expdesc.VCALL = 13; // info = instruction pc
    Expdesc.VVARARG = 14; // info = instruction pc
});
//# sourceMappingURL=Expdesc.js.map