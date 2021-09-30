(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/InputStreamReader", "./LuaJavaCallback", "./Lua", "./Loader", "./FromReader", "./Syntax", "./LuaFunction"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LuaInternal = void 0;
    const InputStreamReader_1 = require("../java/InputStreamReader");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    const Lua_1 = require("./Lua");
    const Loader_1 = require("./Loader");
    const FromReader_1 = require("./FromReader");
    const Syntax_1 = require("./Syntax");
    const LuaFunction_1 = require("./LuaFunction");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaInternal.java#1 $
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
     * Class used to implement internal callbacks.  Currently there is only
     * one callback used, one that parses or loads a Lua chunk into binary
     * form.
     */
    class LuaInternal extends LuaJavaCallback_1.LuaJavaCallback {
        constructor() {
            super();
            this._stream = null;
            this._reader = null;
            this._chunkname = null;
        }
        init1(_in, chunkname) {
            this._stream = _in;
            this._chunkname = chunkname;
        }
        init2(_in, chunkname) {
            this._reader = _in;
            this._chunkname = chunkname;
        }
        luaFunction(L) {
            try {
                var p = null;
                // In either the stream or the reader case there is a way of
                // converting the input to the other type.
                if (this._stream != null) {
                    this._stream.mark(1);
                    var c = this._stream.read();
                    this._stream.reset();
                    // Convert to Reader if looks like source code instead of
                    // binary.
                    if (c == Loader_1.Loader.HEADER[0]) {
                        var l = new Loader_1.Loader(this._stream, this._chunkname);
                        p = l.undump();
                    }
                    else {
                        this._reader = new InputStreamReader_1.InputStreamReader(this._stream, "UTF-8");
                        p = Syntax_1.Syntax.parser(L, this._reader, this._chunkname);
                    }
                }
                else {
                    // Convert to Stream if looks like binary (dumped via
                    // string.dump) instead of source code.
                    if (this._reader.markSupported()) {
                        this._reader.mark(1);
                        var c2 = this._reader.read();
                        this._reader.reset();
                        if (c2 == Loader_1.Loader.HEADER[0]) {
                            this._stream = new FromReader_1.FromReader(this._reader);
                            var l2 = new Loader_1.Loader(this._stream, this._chunkname);
                            p = l2.undump();
                        }
                        else {
                            p = Syntax_1.Syntax.parser(L, this._reader, this._chunkname);
                        }
                    }
                    else {
                        p = Syntax_1.Syntax.parser(L, this._reader, this._chunkname);
                    }
                }
                //
                //new UpVal[0] : 
                //Error #1007: 尝试实例化的函数不是构造函数。
                //TypeError: Error #1007: Instantiation attempted on a non-constructor.
                //
                //L.push(new LuaFunction(p, new UpVal[0], L.getGlobals()));
                L.pushObject(new LuaFunction_1.LuaFunction(p, new Array(), L.getGlobals()));
                return 1;
            }
            catch (e) {
                if (e instanceof Error) {
                    console.log(e.stack);
                }
                if (e instanceof Object) {
                    L.pushString("cannot read " + this._chunkname + ": " + e.toString());
                }
                L.dThrow(Lua_1.Lua.ERRFILE);
                return 0;
            }
            //unreachable
            return 0;
        }
    }
    exports.LuaInternal = LuaInternal;
});
//# sourceMappingURL=LuaInternal.js.map