(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/RuntimeException"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LuaError = void 0;
    const RuntimeException_1 = require("../java/RuntimeException");
    /*  $Header$
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
     * Represent a Lua error
     */
    class LuaError extends RuntimeException_1.RuntimeException {
        constructor(errorStatus) {
            super();
            this.message = "Lua error"; //super("Lua error");
            this._errorStatus = errorStatus;
        }
        get errorStatus() {
            return this._errorStatus;
        }
    }
    exports.LuaError = LuaError;
});
//# sourceMappingURL=LuaError.js.map