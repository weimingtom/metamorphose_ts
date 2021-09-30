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
    exports.Debug = void 0;
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Debug.java#1 $
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
     * Equivalent to struct lua_Debug.  This implementation is incomplete
     * because it is not intended to form part of the public API.  It has
     * only been implemented to the extent necessary for internal use.
     */
    class Debug {
        /**
         * @param ici  index of CallInfo record in L.civ
         */
        constructor(ici) {
            // private, no public accessors defined.
            this._ici = 0;
            // public accessors may be defined for these.
            this._event = 0;
            this._what = null;
            this._source = null;
            this._currentline = 0;
            this._linedefined = 0;
            this._lastlinedefined = 0;
            this._shortsrc = null;
            this._ici = ici;
        }
        set ici(ici) {
            this._ici = ici;
        }
        /**
         * Get ici, index of the {@link CallInfo} record.
         */
        get ici() {
            return this._ici;
        }
        /**
         * Setter for event.
         */
        set event(event) {
            this._event = event;
        }
        /**
         * Sets the what field.
         */
        set what(what) {
            this._what = what;
        }
        /**
         * Sets the source, and the shortsrc.
         */
        set source(source) {
            this._source = source;
            this._shortsrc = Lua_1.Lua.oChunkid(source);
        }
        /**
         * Gets the current line.  May become public.
         */
        get currentline() {
            return this._currentline;
        }
        /**
         * Set currentline.
         */
        set currentline(currentline) {
            this._currentline = currentline;
        }
        /**
         * Get linedefined.
         */
        get linedefined() {
            return this._linedefined;
        }
        /**
         * Set linedefined.
         */
        set linedefined(linedefined) {
            this._linedefined = linedefined;
        }
        /**
         * Set lastlinedefined.
         */
        set lastlinedefined(lastlinedefined) {
            this._lastlinedefined = lastlinedefined;
        }
        /**
         * Gets the "printable" version of source, for error messages.
         * May become public.
         */
        get shortsrc() {
            return this._shortsrc;
        }
    }
    exports.Debug = Debug;
});
//# sourceMappingURL=Debug.js.map