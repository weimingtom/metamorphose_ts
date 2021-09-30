(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LuaUserdata = void 0;
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaUserdata.java#1 $
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
     * Models an arbitrary Java reference as a Lua value.
     * This class provides a facility that is equivalent to the userdata
     * facility provided by the PUC-Rio implementation.  It has two primary
     * uses: the first is when you wish to store an arbitrary Java reference
     * in a Lua table; the second is when you wish to create a new Lua type
     * by defining an opaque object with metamethods.  The former is
     * possible because a <code>LuaUserdata</code> can be stored in tables,
     * and passed to functions, just like any other Lua value.  The latter
     * is possible because each <code>LuaUserdata</code> supports a
     * metatable.
     */
    class LuaUserdata {
        /**
         * Wraps an arbitrary Java reference.  To retrieve the reference that
         * was wrapped, use {@link Lua#toUserdata}.
         * @param  o The Java reference to wrap.
         */
        constructor(o) {
            this._metatable = null;
            this._env = null;
            this._userdata = o;
        }
        /**
         * Getter for userdata.
         * @return the userdata that was passed to the constructor of this
         * instance.
         */
        get userdata() {
            return this._userdata;
        }
        /**
         * Getter for metatable.
         * @return the metatable.
         */
        get metatable() {
            return this._metatable;
        }
        /**
         * Setter for metatable.
         * @param metatable The metatable.
         */
        set metatable(metatable) {
            this._metatable = metatable;
        }
        /**
         * Getter for environment.
         * @return The environment.
         */
        get env() {
            return this._env;
        }
        /**
         * Setter for environment.
         * @param env  The environment.
         */
        set env(env) {
            this._env = env;
        }
    }
    exports.LuaUserdata = LuaUserdata;
});
//# sourceMappingURL=LuaUserdata.js.map