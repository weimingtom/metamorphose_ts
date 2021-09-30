(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/IOException", "../java/Reader", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseLibReader = void 0;
    const IOException_1 = require("../java/IOException");
    const Reader_1 = require("../java/Reader");
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BaseLibReader.java#1 $
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
     * Extends {@link java.io.Reader} to create a Reader from a Lua
     * function.  So that the <code>load</code> function from Lua's base
     * library can be implemented.
     */
    class BaseLibReader extends Reader_1.Reader {
        constructor(L, f) {
            super();
            this._s = "";
            this._i = 0; // = 0;
            this._mark = -1;
            this._L = L;
            this._f = f;
        }
        close() {
            this._f = null;
        }
        mark(l) {
            if (l > 1) {
                throw new IOException_1.IOException("Readahead must be <= 1");
            }
            this._mark = this._i;
        }
        markSupported() {
            return true;
        }
        read() {
            if (this._i >= this._s.length) {
                this._L.pushObject(this._f);
                this._L.call(0, 1);
                if (Lua_1.Lua.isNil(this._L.value(-1))) {
                    return -1;
                }
                else if (Lua_1.Lua.isString(this._L.value(-1))) {
                    this._s = this._L.toString_(this._L.value(-1));
                    if (this._s.length == 0) {
                        return -1;
                    }
                    if (this._mark == this._i) {
                        this._mark = 0;
                    }
                    else {
                        this._mark = -1;
                    }
                    this._i = 0;
                }
                else {
                    this._L.error("reader function must return a string");
                }
            }
            return this._s.charCodeAt(this._i++);
        }
        readMultiBytes(cbuf, off, len) {
            var j = 0; // loop index required after loop
            for (j = 0; j < len; ++j) {
                var c = this.read();
                if (c == -1) {
                    if (j == 0) {
                        return -1;
                    }
                    else {
                        return j;
                    }
                }
                cbuf[off + j] = c;
            }
            return j;
        }
        reset() {
            if (this._mark < 0) {
                throw new IOException_1.IOException("reset() not supported now");
            }
            this._i = this._mark;
        }
    }
    exports.BaseLibReader = BaseLibReader;
});
//# sourceMappingURL=BaseLibReader.js.map