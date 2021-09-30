/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/CallInfo.java#1 $
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
    exports.CallInfo = void 0;
    //see jillcode(Java Implementation of Lua Language, Jill):
    //	http://code.google.com/p/jillcode/
    //这里的代码移植自jillcode(Lua的Java实现，Jill):
    //	http://code.google.com/p/jillcode/	
    class CallInfo {
        /** Only used to create the first instance. */
        constructor() {
            this._savedpc = 0;
            this._func = 0;
            this._base = 0;
            this._top = 0;
            this._nresults = 0;
            this._tailcalls = 0;
        }
        /**
         * @param func  stack index of function
         * @param base  stack base for this frame
         * @param top   top-of-stack for this frame
         * @param nresults  number of results expected by caller
         */
        init(func, base, top, nresults) {
            this._func = func;
            this._base = base;
            this._top = top;
            this._nresults = nresults;
        }
        /** Setter for savedpc. */
        set savedpc(pc) {
            this._savedpc = pc;
        }
        /** Getter for savedpc. */
        get savedpc() {
            return this._savedpc;
        }
        /**
         * Get the stack index for the function object for this record.
         */
        get func() {
            return this._func;
        }
        /**
         * Get stack index where results should end up.  This is an absolute
         * stack index, not relative to L.base.
         */
        res() {
            // Same location as function.
            return this._func;
        }
        /**
         * Get stack base for this record.
         */
        get base() {
            return this._base;
        }
        /**
         * Get top-of-stack for this record.  This is the number of elements
         * in the stack (or will be when the function is resumed).
         */
        get top() {
            return this._top;
        }
        /**
         * Setter for top.
         */
        set top(top) {
            this._top = top;
        }
        /**
         * Get number of results expected by the caller of this function.
         * Used to adjust the returned results to the correct number.
         */
        get nresults() {
            return this._nresults;
        }
        /**
         * Get number of tailcalls
         */
        get tailcalls() {
            return this._tailcalls;
        }
        /**
         * Used during tailcall to set the base and top members.
         */
        tailcall(baseArg, topArg) {
            this._base = baseArg;
            this._top = topArg;
            ++this._tailcalls;
        }
    }
    exports.CallInfo = CallInfo;
});
//# sourceMappingURL=CallInfo.js.map