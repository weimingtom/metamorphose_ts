(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Random", "../java/MathUtil", "./LuaJavaCallback", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MathLib = void 0;
    const Random_1 = require("../java/Random");
    const MathUtil_1 = require("../java/MathUtil");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/MathLib.java#1 $
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
     * Contains Lua's math library.
     * The library can be opened using the {@link #open} method.
     * Because this library is implemented on top of CLDC 1.1 it is not as
     * complete as the PUC-Rio math library.  Trigononmetric inverses
     * (EG <code>acos</code>) and hyperbolic trigonometric functions (EG
     * <code>cosh</code>) are not provided.
     */
    class MathLib extends LuaJavaCallback_1.LuaJavaCallback {
        /** Constructs instance, filling in the 'which' member. */
        constructor(which) {
            super();
            this._which = which;
        }
        /**
         * Implements all of the functions in the Lua math library.  Do not
         * call directly.
         * @param L  the Lua state in which to execute.
         * @return number of returned parameters, as per convention.
         */
        luaFunction(L) {
            switch (this._which) {
                case MathLib.ABS:
                    return MathLib.abs(L);
                case MathLib.CEIL:
                    return MathLib.ceil(L);
                case MathLib.COS:
                    return MathLib.cos(L);
                case MathLib.DEG:
                    return MathLib.deg(L);
                case MathLib.EXP:
                    return MathLib.exp(L);
                case MathLib.FLOOR:
                    return MathLib.floor(L);
                case MathLib.FMOD:
                    return MathLib.fmod(L);
                case MathLib.MAX:
                    return MathLib.max(L);
                case MathLib.MIN:
                    return MathLib.min(L);
                case MathLib.MODF:
                    return MathLib.modf(L);
                case MathLib.POW:
                    return MathLib.pow(L);
                case MathLib.RAD:
                    return MathLib.rad(L);
                case MathLib.RANDOM:
                    return MathLib.random(L);
                case MathLib.RANDOMSEED:
                    return MathLib.randomseed(L);
                case MathLib.SIN:
                    return MathLib.sin(L);
                case MathLib.SQRT:
                    return MathLib.sqrt(L);
                case MathLib.TAN:
                    return MathLib.tan(L);
            }
            return 0;
        }
        /**
         * Opens the library into the given Lua state.  This registers
         * the symbols of the library in the global table.
         * @param L  The Lua state into which to open.
         */
        static open(L) {
            var t = L.__register("math");
            MathLib.r(L, "abs", MathLib.ABS);
            MathLib.r(L, "ceil", MathLib.CEIL);
            MathLib.r(L, "cos", MathLib.COS);
            MathLib.r(L, "deg", MathLib.DEG);
            MathLib.r(L, "exp", MathLib.EXP);
            MathLib.r(L, "floor", MathLib.FLOOR);
            MathLib.r(L, "fmod", MathLib.FMOD);
            MathLib.r(L, "max", MathLib.MAX);
            MathLib.r(L, "min", MathLib.MIN);
            MathLib.r(L, "modf", MathLib.MODF);
            MathLib.r(L, "pow", MathLib.POW);
            MathLib.r(L, "rad", MathLib.RAD);
            MathLib.r(L, "random", MathLib.RANDOM);
            MathLib.r(L, "randomseed", MathLib.RANDOMSEED);
            MathLib.r(L, "sin", MathLib.SIN);
            MathLib.r(L, "sqrt", MathLib.SQRT);
            MathLib.r(L, "tan", MathLib.TAN);
            L.setField(t, "pi", Lua_1.Lua.valueOfNumber(Math.PI));
            L.setField(t, "huge", Lua_1.Lua.valueOfNumber(Number.POSITIVE_INFINITY));
        }
        /** Register a function. */
        static r(L, name, which) {
            var f = new MathLib(which);
            L.setField(L.getGlobal("math"), name, f);
        }
        static abs(L) {
            L.pushNumber(Math.abs(L.checkNumber(1)));
            return 1;
        }
        static ceil(L) {
            L.pushNumber(Math.ceil(L.checkNumber(1)));
            return 1;
        }
        static cos(L) {
            L.pushNumber(Math.cos(L.checkNumber(1)));
            return 1;
        }
        static deg(L) {
            L.pushNumber(MathUtil_1.MathUtil.toDegrees(L.checkNumber(1)));
            return 1;
        }
        static exp(L) {
            // CLDC 1.1 has Math.E but no exp, pow, or log.  Bizarre.
            L.pushNumber(Lua_1.Lua.iNumpow(Math.E, L.checkNumber(1)));
            return 1;
        }
        static floor(L) {
            L.pushNumber(Math.floor(L.checkNumber(1)));
            return 1;
        }
        static fmod(L) {
            L.pushNumber(L.checkNumber(1) % L.checkNumber(2));
            return 1;
        }
        static max(L) {
            var n = L.getTop(); // number of arguments
            var dmax = L.checkNumber(1);
            for (var i = 2; i <= n; ++i) {
                var d = L.checkNumber(i);
                dmax = Math.max(dmax, d);
            }
            L.pushNumber(dmax);
            return 1;
        }
        static min(L) {
            var n = L.getTop(); // number of arguments
            var dmin = L.checkNumber(1);
            for (var i = 2; i <= n; ++i) {
                var d = L.checkNumber(i);
                dmin = Math.min(dmin, d);
            }
            L.pushNumber(dmin);
            return 1;
        }
        static modf(L) {
            var x = L.checkNumber(1);
            var fp = x % 1;
            var ip = x - fp;
            L.pushNumber(ip);
            L.pushNumber(fp);
            return 2;
        }
        static pow(L) {
            L.pushNumber(Lua_1.Lua.iNumpow(L.checkNumber(1), L.checkNumber(2)));
            return 1;
        }
        static rad(L) {
            L.pushNumber(MathUtil_1.MathUtil.toRadians(L.checkNumber(1)));
            return 1;
        }
        static random(L) {
            // It would seem better style to associate the java.util.Random
            // instance with the Lua instance (by implementing and using a
            // registry for example).  However, PUC-rio uses the ISO C library
            // and so will share the same random number generator across all Lua
            // states.  So we do too.
            switch (L.getTop()) // check number of arguments
             {
                case 0: // no arguments
                    L.pushNumber(MathLib._rng.nextDouble());
                    break;
                case 1: // only upper limit
                    {
                        var u = L.checkInt(1);
                        L.argCheck(1 <= u, 1, "interval is empty");
                        L.pushNumber(MathLib._rng.nextInt(u) + 1);
                    }
                    break;
                case 2: // lower and upper limits
                    {
                        var l = L.checkInt(1);
                        var u2 = L.checkInt(2);
                        L.argCheck(l <= u2, 2, "interval is empty");
                        L.pushNumber(MathLib._rng.nextInt(u2) + l);
                    }
                    break;
                default:
                    return L.error("wrong number of arguments");
            }
            return 1;
        }
        static randomseed(L) {
            MathLib._rng.setSeed(L.checkNumber(1));
            return 0;
        }
        static sin(L) {
            L.pushNumber(Math.sin(L.checkNumber(1)));
            return 1;
        }
        static sqrt(L) {
            L.pushNumber(Math.sqrt(L.checkNumber(1)));
            return 1;
        }
        static tan(L) {
            L.pushNumber(Math.tan(L.checkNumber(1)));
            return 1;
        }
    }
    exports.MathLib = MathLib;
    // Each function in the library corresponds to an instance of
    // this class which is associated (the 'which' member) with an integer
    // which is unique within this class.  They are taken from the following
    // set.
    MathLib.ABS = 1;
    //private static const acos:int = 2;
    //private static const asin:int = 3;
    //private static const atan2:int = 4;
    //private static const atan:int = 5;
    MathLib.CEIL = 6;
    //private static const cosh:int = 7;
    MathLib.COS = 8;
    MathLib.DEG = 9;
    MathLib.EXP = 10;
    MathLib.FLOOR = 11;
    MathLib.FMOD = 12;
    //private static const frexp:int = 13;
    //private static const ldexp:int = 14;
    //private static const log:int = 15;
    MathLib.MAX = 16;
    MathLib.MIN = 17;
    MathLib.MODF = 18;
    MathLib.POW = 19;
    MathLib.RAD = 20;
    MathLib.RANDOM = 21;
    MathLib.RANDOMSEED = 22;
    //private static const sinh:int = 23;
    MathLib.SIN = 24;
    MathLib.SQRT = 25;
    //private static const tanh:int = 26;
    MathLib.TAN = 27;
    MathLib._rng = new Random_1.Random();
});
//# sourceMappingURL=MathLib.js.map