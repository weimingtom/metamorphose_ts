(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/InputStream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DumpedInput = void 0;
    const InputStream_1 = require("../java/InputStream");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/DumpedInput.java#1 $
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
     * Converts a string obtained using string.dump into an
     * {@link java.io.InputStream} so that it can be passed to {@link
     * Lua#load(java.io.InputStream, java.lang.String)}.
     */
    class DumpedInput extends InputStream_1.InputStream {
        constructor(s) {
            super();
            this._i = 0; // = 0
            this._mark = -1;
            this._s = s;
        }
        available() {
            return this._s.length - this._i;
        }
        close() {
            this._s = null;
            this._i = -1;
        }
        mark(readlimit) {
            this._mark = this._i;
        }
        markSupported() {
            return true;
        }
        read() {
            if (this._i >= this._s.length) {
                return -1;
            }
            var c = this._s.charCodeAt(this._i);
            ++this._i;
            return c & 0xff;
        }
        reset() {
            this._i = this._mark;
        }
        skip(n) {
            console.log("DumpedInput.skip() not implement");
            return 0;
        }
    }
    exports.DumpedInput = DumpedInput;
});
//# sourceMappingURL=DumpedInput.js.map