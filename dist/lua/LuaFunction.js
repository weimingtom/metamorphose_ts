(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/NullPointerException", "../java/IllegalArgumentException"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LuaFunction = void 0;
    const NullPointerException_1 = require("../java/NullPointerException");
    const IllegalArgumentException_1 = require("../java/IllegalArgumentException");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaFunction.java#1 $
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
     * Models a Lua function.
     * Note that whilst the class is public, its constructors are not.
     * Functions are created by loading Lua chunks (in source or binary
     * form) or executing Lua code which defines functions (and, for
     * example, places them in the global table).  {@link
     * Lua#load(InputStream, String) Lua.load} is used
     * to load a Lua chunk (it returns a <code>LuaFunction</code>),
     * and {@link Lua#call Lua.call} is used to call a function.
     */
    class LuaFunction {
        /**
         * Constructs an instance from a triple of {Proto, upvalues,
         * environment}.  Deliberately not public, See {@link
         * Lua#load(InputStream, String) Lua.load} for
         * public construction.  All arguments are referenced from the
         * instance.  The <code>upval</code> array must have exactly the same
         * number of elements as the number of upvalues in <code>proto</code>
         * (the value of the <code>nups</code> parameter in the
         * <code>Proto</code> constructor).
         *
         * @param proto  A Proto object.
         * @param upval  Array of upvalues.
         * @param env    The function's environment.
         * @throws NullPointerException if any arguments are null.
         * @throws IllegalArgumentsException if upval.length is wrong.
         */
        constructor(proto, upval /*UpVal[]*/, env) {
            if (null == proto || null == upval || null == env) {
                throw new NullPointerException_1.NullPointerException();
            }
            if (upval.length != proto.nups) {
                throw new IllegalArgumentException_1.IllegalArgumentException();
            }
            this._p = proto;
            this._upval = upval;
            //FIXME:调试用
            //if (this._upval != null && 
            //	this._upval.length == 2)
            //{
            //	(this._upval[0] as UpVal)._s.tagUpVal = true;
            //	(this._upval[1] as UpVal)._s.tagUpVal = true;
            //	trace("this._upval.length == 2");
            //}
            this._env = env;
        }
        /** Get nth UpVal. */
        upVal(n) {
            return this._upval[n];
        }
        /** Get the Proto object. */
        get proto() {
            return this._p;
        }
        /** Getter for environment. */
        get env() {
            return this._env;
        }
        /** Setter for environment. */
        set env(env) {
            if (null == env) {
                throw new NullPointerException_1.NullPointerException();
            }
            this._env = env;
        }
    }
    exports.LuaFunction = LuaFunction;
});
//# sourceMappingURL=LuaFunction.js.map