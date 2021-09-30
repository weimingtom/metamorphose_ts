(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Slot = void 0;
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BlockCnt.java#1 $
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
    class Slot {
        //private var _tag:boolean = false;
        //public var tagUpVal:boolean = false;
        constructor() {
            this._r = null;
            this._d = 0;
        }
        init1(s) {
            this._r = s._r;
            this._d = s._d;
            //testD();
        }
        //TODO:
        init2(o) {
            this.setObject(o);
        }
        asObject() {
            if (this._r == Lua_1.Lua.NUMBER) {
                return new Number(this._d);
            }
            return this._r;
        }
        setObject(o) {
            //_tag = true;
            //if (!Lua.D)
            //{
            //	if (o == null)
            //	{
            //		trace("setObject:", o.toString());
            //	}
            //}
            this._r = o;
            if (typeof (o) == 'number' || o instanceof Number) {
                this._r = Lua_1.Lua.NUMBER;
                this._d = parseFloat(o.toString());
                //testD();
            }
            //if (_d == 150048)
            //{
            //	trace("setObject 150048:", o.toString());
            //}
        }
        //新增
        set r(r) {
            this._r = r;
            //if (r == null)
            //{
            //	if (Lua.D)
            //	{
            //		//FIXME:如果为空值的话报错，可以用于发现问题(index no value错误）
            //		trace("Slot set r : ", r.toString());
            //	}
            //}	
        }
        //新增
        get r() {
            return this._r;
        }
        //新增
        set d(d) {
            //if (this.tagUpVal == true)
            //{
            //	trace("======this.tagUpVal == true, set d from " + this._d + "=>" + d);
            //}
            this._d = d;
            //testD();
        }
        //新增
        get d() {
            return this._d;
        }
        //调试用
        testD__() {
            /*
            if (this._d == 150048)
            {
                trace("setObject 150048:xxx r==" + this._r);
            }
            */
            //if (isNaN(this._d))
            //{
            //	trace("setObject 150048:xxxxx");
            //}
            //if (this.tagUpVal == true)
            //{
            //	trace("==============");
            //}
            //if (this.tagUpVal == true)
            //{
            //	trace("======this.tagUpVal == true, =>" + this._d);
            //}
        }
    }
    exports.Slot = Slot;
});
//# sourceMappingURL=Slot.js.map