(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/StringBuffer", "../java/SystemUtil", "./LuaJavaCallback", "./Lua", "./FormatItem"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IOLib = void 0;
    const StringBuffer_1 = require("../java/StringBuffer");
    const SystemUtil_1 = require("../java/SystemUtil");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    const Lua_1 = require("./Lua");
    const FormatItem_1 = require("./FormatItem");
    /*
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
    class IOLib extends LuaJavaCallback_1.LuaJavaCallback {
        constructor(which) {
            super();
            this.which = 0;
            this.which = which;
        }
        luaFunction(L) {
            switch (this.which) {
                case IOLib.WRITE:
                    return IOLib.write(L);
            }
            return 0;
        }
        static open(L) {
            /*var t:LuaTable = */ L.__register("io");
            IOLib.r(L, "write", IOLib.WRITE);
        }
        /** Register a function. */
        static r(L, name, which) {
            var f = new IOLib(which);
            L.setField(L.getGlobal("io"), name, f);
        }
        static write(L) {
            return this.g_write(L, SystemUtil_1.SystemUtil.out, 1);
        }
        //FIXME:
        static g_write(L, stream, arg) {
            //FIXME:
            var nargs = L.getTop(); //FIXME:notice here, original code is 'lua_gettop(L) - 1' (something pushed before?)
            var status = 1;
            for (; nargs != 0; arg++) {
                nargs--;
                if (L.type(arg) == Lua_1.Lua.TNUMBER) {
                    if (status != 0) {
                        try {
                            //stream.print(String.format("%s", L.toNumber(L.value(arg))));
                            //@see http://stackoverflow.com/questions/703396/how-to-nicely-format-floating-numbers-to-string-without-unnecessary-decimal-0
                            //stream.print(new DecimalFormat("#.##########").format(L.value(arg)));
                            //@see Lua#vmToString
                            var f = new FormatItem_1.FormatItem(null, IOLib.NUMBER_FMT);
                            var b = new StringBuffer_1.StringBuffer();
                            var d = L.toNumber(L.value(arg));
                            f.formatFloat(b, d);
                            stream.print(b.toString());
                        }
                        catch (e) {
                            status = 0;
                        }
                    }
                }
                else {
                    var s = L.checkString(arg);
                    if (status != 0) {
                        try {
                            stream.print(s);
                        }
                        catch (e) {
                            status = 0;
                        }
                    }
                }
            }
            return this.pushresult(L, status, null);
        }
        static pushresult(L, i, filename) {
            var en = this.errno; /* calls to Lua API may change this value */
            if (i != 0) {
                L.pushBoolean(true);
                return 1;
            }
            else {
                L.pushNil();
                if (filename != null) {
                    //FIXME: not implemented
                    //L.pushString(String.format("%s: %s", filename, "io error"/*strerror(en)*/));
                    L.pushString("" + filename + ": " + "io error" /*strerror(en)*/);
                }
                else {
                    //FIXME: not implemented
                    //L.pushString(String.format("%s", "io error"/*strerror(en)*/));
                    L.pushString("" + "io error" /*strerror(en)*/);
                }
                L.pushNumber(en);
                return 3;
            }
        }
    }
    exports.IOLib = IOLib;
    IOLib.WRITE = 1;
    IOLib.NUMBER_FMT = ".14g";
    IOLib.errno = 0; //FIXME: not implemented
});
//# sourceMappingURL=IOLib.js.map