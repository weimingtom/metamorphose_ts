(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/NumberFormatException", "../java/SystemUtil", "./BaseLibReader", "./DumpedInput", "./Lua", "./LuaJavaCallback"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseLib = void 0;
    const NumberFormatException_1 = require("../java/NumberFormatException");
    const SystemUtil_1 = require("../java/SystemUtil");
    const BaseLibReader_1 = require("./BaseLibReader");
    const DumpedInput_1 = require("./DumpedInput");
    const Lua_1 = require("./Lua");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BaseLib.java#1 $
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
     * Contains Lua's base library.  The base library is generally
     * considered essential for running any Lua program.  The base library
     * can be opened using the {@link #open} method.
     */
    class BaseLib extends LuaJavaCallback_1.LuaJavaCallback {
        /** Constructs instance, filling in the 'which' member. */
        constructor(which) {
            super();
            /**
            * For wrapped threads created by coroutine.wrap, this references the
            * Lua thread object.
            */
            this.thread = null;
            this.which = which;
            BaseLib.OutputArr = new Array();
            BaseLib.OutputArr.push("");
        }
        /** Instance constructor used by coroutine.wrap. */
        init(L) {
            this.which = BaseLib.WRAP_AUX;
            this.thread = L;
        }
        /**
         * Implements all of the functions in the Lua base library.  Do not
         * call directly.
         * @param L  the Lua state in which to execute.
         * @return number of returned parameters, as per convention.
         */
        luaFunction(L) {
            switch (this.which) {
                case BaseLib.ASSERT:
                    return BaseLib.assertFunction(L);
                case BaseLib.COLLECTGARBAGE:
                    return BaseLib.collectgarbage(L);
                case BaseLib.DOFILE:
                    return BaseLib.dofile(L);
                case BaseLib.ERROR:
                    return BaseLib.error(L);
                case BaseLib.GETFENV:
                    return BaseLib.getfenv(L);
                case BaseLib.GETMETATABLE:
                    return BaseLib.getmetatable(L);
                case BaseLib.IPAIRS:
                    return BaseLib.ipairs(L);
                case BaseLib.LOAD:
                    return BaseLib.load(L);
                case BaseLib.LOADFILE:
                    return BaseLib.loadfile(L);
                case BaseLib.LOADSTRING:
                    return BaseLib.loadstring(L);
                case BaseLib.NEXT:
                    return BaseLib.next(L);
                case BaseLib.PAIRS:
                    return BaseLib.pairs(L);
                case BaseLib.PCALL:
                    return BaseLib.pcall(L);
                case BaseLib.PRINT:
                    return BaseLib.print(L);
                case BaseLib.RAWEQUAL:
                    return BaseLib.rawequal(L);
                case BaseLib.RAWGET:
                    return BaseLib.rawget(L);
                case BaseLib.RAWSET:
                    return BaseLib.rawset(L);
                case BaseLib.SELECT:
                    return BaseLib.select(L);
                case BaseLib.SETFENV:
                    return BaseLib.setfenv(L);
                case BaseLib.SETMETATABLE:
                    return BaseLib.setmetatable(L);
                case BaseLib.TONUMBER:
                    return BaseLib.tonumber(L);
                case BaseLib.TOSTRING:
                    return BaseLib.tostring(L);
                case BaseLib.TYPE:
                    return BaseLib.type(L);
                case BaseLib.UNPACK:
                    return BaseLib.unpack(L);
                case BaseLib.XPCALL:
                    return BaseLib.xpcall(L);
                case BaseLib.IPAIRS_AUX:
                    return BaseLib.ipairsaux(L);
                case BaseLib.PAIRS_AUX:
                    return BaseLib.pairsaux(L);
                case BaseLib.CREATE:
                    return BaseLib.create(L);
                case BaseLib.RESUME:
                    return BaseLib.resume(L);
                case BaseLib.RUNNING:
                    return BaseLib.running(L);
                case BaseLib.STATUS:
                    return BaseLib.status(L);
                case BaseLib.WRAP:
                    return BaseLib.wrap(L);
                case BaseLib.YIELD:
                    return BaseLib.yield(L);
                case BaseLib.WRAP_AUX:
                    return this.wrapaux(L);
            }
            return 0;
        }
        /**
         * Opens the base library into the given Lua state.  This registers
         * the symbols of the base library in the global table.
         * @param L  The Lua state into which to open.
         */
        static open(L) {
            // set global _G
            L.setGlobal("_G", L.getGlobals());
            // set global _VERSION
            L.setGlobal("_VERSION", Lua_1.Lua.VERSION);
            BaseLib.r(L, "assert", BaseLib.ASSERT);
            BaseLib.r(L, "collectgarbage", BaseLib.COLLECTGARBAGE);
            BaseLib.r(L, "dofile", BaseLib.DOFILE);
            BaseLib.r(L, "error", BaseLib.ERROR);
            BaseLib.r(L, "getfenv", BaseLib.GETFENV);
            BaseLib.r(L, "getmetatable", BaseLib.GETMETATABLE);
            BaseLib.r(L, "ipairs", BaseLib.IPAIRS);
            BaseLib.r(L, "loadfile", BaseLib.LOADFILE);
            BaseLib.r(L, "load", BaseLib.LOAD);
            BaseLib.r(L, "loadstring", BaseLib.LOADSTRING);
            BaseLib.r(L, "next", BaseLib.NEXT);
            BaseLib.r(L, "pairs", BaseLib.PAIRS);
            BaseLib.r(L, "pcall", BaseLib.PCALL);
            BaseLib.r(L, "print", BaseLib.PRINT);
            BaseLib.r(L, "rawequal", BaseLib.RAWEQUAL);
            BaseLib.r(L, "rawget", BaseLib.RAWGET);
            BaseLib.r(L, "rawset", BaseLib.RAWSET);
            BaseLib.r(L, "select", BaseLib.SELECT);
            BaseLib.r(L, "setfenv", BaseLib.SETFENV);
            BaseLib.r(L, "setmetatable", BaseLib.SETMETATABLE);
            BaseLib.r(L, "tonumber", BaseLib.TONUMBER);
            BaseLib.r(L, "tostring", BaseLib.TOSTRING);
            BaseLib.r(L, "type", BaseLib.TYPE);
            BaseLib.r(L, "unpack", BaseLib.UNPACK);
            BaseLib.r(L, "xpcall", BaseLib.XPCALL);
            L.__register("coroutine");
            BaseLib.c(L, "create", BaseLib.CREATE);
            BaseLib.c(L, "resume", BaseLib.RESUME);
            BaseLib.c(L, "running", BaseLib.RUNNING);
            BaseLib.c(L, "status", BaseLib.STATUS);
            BaseLib.c(L, "wrap", BaseLib.WRAP);
            BaseLib.c(L, "yield", BaseLib.YIELD);
        }
        /** Register a function. */
        static r(L, name, which) {
            var f = new BaseLib(which);
            L.setGlobal(name, f);
        }
        /** Register a function in the coroutine table. */
        static c(L, name, which) {
            var f = new BaseLib(which);
            L.setField(L.getGlobal("coroutine"), name, f);
        }
        /** Implements assert.  <code>assert</code> is a keyword in some
         * versions of Java, so this function has a mangled name.
         */
        static assertFunction(L) {
            L.checkAny(1);
            if (!L.toBoolean(L.value(1))) {
                L.error(L.optString(2, "assertion failed!"));
            }
            return L.getTop();
        }
        /** Implements collectgarbage. */
        static collectgarbage(L) {
            var o = L.checkOption(1, "collect", BaseLib.CGOPTS);
            var ex = L.optInt(2, 0);
            var res = L.gc(BaseLib.CGOPTSNUM[o], ex);
            switch (BaseLib.CGOPTSNUM[o]) {
                case Lua_1.Lua.GCCOUNT:
                    {
                        var b = L.gc(Lua_1.Lua.GCCOUNTB, 0);
                        L.pushNumber(res + b / 1024);
                        return 1;
                    }
                case Lua_1.Lua.GCSTEP:
                    L.pushBoolean(res != 0);
                    return 1;
                default:
                    L.pushNumber(res);
                    return 1;
            }
        }
        /** Implements dofile. */
        static dofile(L) {
            var fname = L.optString(1, null);
            var n = L.getTop();
            if (L.loadFile(fname) != 0) {
                L.error(L.value(-1));
            }
            L.call(0, Lua_1.Lua.MULTRET);
            return L.getTop() - n;
        }
        /** Implements error. */
        static error(L) {
            var level = L.optInt(2, 1);
            L.setTop(1);
            if (Lua_1.Lua.isString(L.value(1)) && level > 0) {
                L.insert(L.where(level), 1);
                L.concat(2);
            }
            L.error(L.value(1));
            // NOTREACHED
            return 0;
        }
        /** Helper for getfenv and setfenv. */
        static getfunc(L) {
            var o = L.value(1);
            if (Lua_1.Lua.isFunction(o)) {
                return o;
            }
            else {
                var level = L.optInt(1, 1);
                L.argCheck(level >= 0, 1, "level must be non-negative");
                var ar = L.getStack(level);
                if (ar == null) {
                    L.argError(1, "invalid level");
                }
                L.getInfo("f", ar);
                o = L.value(-1);
                if (Lua_1.Lua.isNil(o)) {
                    L.error("no function environment for tail call at level " + level);
                }
                L.pop(1);
                return o;
            }
        }
        /** Implements getfenv. */
        static getfenv(L) {
            var o = BaseLib.getfunc(L);
            if (Lua_1.Lua.isJavaFunction(o)) {
                L.pushObject(L.getGlobals());
            }
            else {
                var f = o;
                L.pushObject(f.env);
            }
            return 1;
        }
        /** Implements getmetatable. */
        static getmetatable(L) {
            L.checkAny(1);
            var mt = L.getMetatable(L.value(1));
            if (mt == null) {
                L.pushNil();
                return 1;
            }
            var protectedmt = L.getMetafield(L.value(1), "__metatable");
            if (Lua_1.Lua.isNil(protectedmt)) {
                L.pushObject(mt); // return metatable
            }
            else {
                L.pushObject(protectedmt); // return __metatable field
            }
            return 1;
        }
        /** Implements load. */
        static load(L) {
            var cname = L.optString(2, "=(load)");
            L.checkType(1, Lua_1.Lua.TFUNCTION);
            var r = new BaseLibReader_1.BaseLibReader(L, L.value(1));
            var status;
            status = L.__load(r, cname);
            return BaseLib.load_aux(L, status);
        }
        /** Implements loadfile. */
        static loadfile(L) {
            var fname = L.optString(1, null);
            return BaseLib.load_aux(L, L.loadFile(fname));
        }
        /** Implements loadstring. */
        static loadstring(L) {
            var s = L.checkString(1);
            var chunkname = L.optString(2, s);
            if (s.substr(0, 1) == "0x1B") //"\033")
             {
                // "binary" dumped into string using string.dump.
                return BaseLib.load_aux(L, L.load(new DumpedInput_1.DumpedInput(s), chunkname));
            }
            else {
                return BaseLib.load_aux(L, L.loadString(s, chunkname));
            }
        }
        static load_aux(L, status) {
            if (status == 0) // OK?
             {
                return 1;
            }
            else {
                L.insert(Lua_1.Lua.NIL, -1); // put before error message
                return 2; // return nil plus error message
            }
        }
        /** Implements next. */
        static next(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            L.setTop(2); // Create a 2nd argument is there isn't one
            if (L.next(1)) {
                return 2;
            }
            L.pushObject(Lua_1.Lua.NIL);
            return 1;
        }
        /** Implements ipairs. */
        static ipairs(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            L.pushObject(BaseLib.IPAIRS_AUX_FUN);
            L.pushValue(1);
            L.pushNumber(0);
            return 3;
        }
        /** Generator for ipairs. */
        static ipairsaux(L) {
            var i = L.checkInt(2);
            L.checkType(1, Lua_1.Lua.TTABLE);
            ++i;
            var v = Lua_1.Lua.rawGetI(L.value(1), i);
            if (Lua_1.Lua.isNil(v)) {
                return 0;
            }
            L.pushNumber(i);
            L.pushObject(v);
            return 2;
        }
        /** Implements pairs.  PUC-Rio uses "next" as the generator for pairs.
         * Jill doesn't do that because it would be way too slow.  We use the
         * {@link java.util.Enumeration} returned from
         * {@link java.util.Hashtable#keys}.  The {@link #pairsaux} method
         * implements the step-by-step iteration.
         */
        static pairs(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            L.pushObject(BaseLib.PAIRS_AUX_FUN); // return generator,
            var t = L.value(1);
            L.pushObject([t, t.keys()]); //TODO:   				 // state,
            L.pushObject(Lua_1.Lua.NIL); // and initial value.
            return 3;
        }
        /** Generator for pairs.  This expects a <var>state</var> and
         * <var>var</var> as (Lua) arguments.
         * The state is setup by {@link #pairs} and is a
         * pair of {LuaTable, Enumeration} stored in a 2-element array.  The
         * <var>var</var> is not used.  This is in contrast to the PUC-Rio
         * implementation, where the state is the table, and the var is used
         * to generated the next key in sequence.  The implementation, of
         * pairs and pairsaux, has no control over <var>var</var>,  Lua's
         * semantics of <code>for</code> force it to be the previous result
         * returned by this function.  In Jill this value is not suitable to
         * use for enumeration, which is why it isn't used.
         */
        static pairsaux(L) {
            var a = L.value(1); //(Object[])
            var t = a[0];
            var e = a[1];
            if (!e.hasMoreElements()) {
                return 0;
            }
            var key = e.nextElement();
            L.pushObject(key);
            L.pushObject(t.getlua(key));
            return 2;
        }
        /** Implements pcall. */
        static pcall(L) {
            L.checkAny(1);
            var status = L.pcall(L.getTop() - 1, Lua_1.Lua.MULTRET, null);
            var b = (status == 0);
            L.insert(Lua_1.Lua.valueOfBoolean(b), 1);
            return L.getTop();
        }
        /** Implements print. */
        static print(L) {
            var n = L.getTop();
            var tostring = L.getGlobal("tostring");
            for (var i = 1; i <= n; ++i) {
                L.pushObject(tostring);
                L.pushValue(i);
                L.call(1, 1);
                var s = L.toString_(L.value(-1));
                if (s == null) {
                    return L.error("'tostring' must return a string to 'print'");
                }
                if (i > 1) {
                    this.OutputArr[this.OutputArr.length - 1] += "\t";
                    this.OUT.print('\t');
                }
                this.OutputArr[this.OutputArr.length - 1] += s;
                this.OUT.print(s);
                L.pop(1);
            }
            this.OutputArr.push("");
            this.OUT.println();
            return 0;
        }
        /** Implements rawequal. */
        static rawequal(L) {
            L.checkAny(1);
            L.checkAny(2);
            L.pushBoolean(Lua_1.Lua.rawEqual(L.value(1), L.value(2)));
            return 1;
        }
        /** Implements rawget. */
        static rawget(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            L.checkAny(2);
            L.pushObject(Lua_1.Lua.rawGet(L.value(1), L.value(2)));
            return 1;
        }
        /** Implements rawset. */
        static rawset(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            L.checkAny(2);
            L.checkAny(3);
            L.rawSet(L.value(1), L.value(2), L.value(3));
            return 0;
        }
        /** Implements select. */
        static select(L) {
            var n = L.getTop();
            if (L.type(1) == Lua_1.Lua.TSTRING && "#" == L.toString_(L.value(1))) {
                L.pushNumber(n - 1);
                return 1;
            }
            var i = L.checkInt(1);
            if (i < 0) {
                i = n + i;
            }
            else if (i > n) {
                i = n;
            }
            L.argCheck(1 <= i, 1, "index out of range");
            return n - i;
        }
        /** Implements setfenv. */
        static setfenv(L) {
            L.checkType(2, Lua_1.Lua.TTABLE);
            var o = BaseLib.getfunc(L);
            var first = L.value(1);
            if (Lua_1.Lua.isNumber(first) && L.toNumber(first) == 0) {
                // :todo: change environment of current thread.
                return 0;
            }
            else if (Lua_1.Lua.isJavaFunction(o) || !L.setFenv(o, L.value(2))) {
                L.error("'setfenv' cannot change environment of given object");
            }
            L.pushObject(o);
            return 1;
        }
        /** Implements setmetatable. */
        static setmetatable(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            var t = L.type(2);
            L.argCheck(t == Lua_1.Lua.TNIL || t == Lua_1.Lua.TTABLE, 2, "nil or table expected");
            if (!Lua_1.Lua.isNil(L.getMetafield(L.value(1), "__metatable"))) {
                L.error("cannot change a protected metatable");
            }
            L.setMetatable(L.value(1), L.value(2));
            L.setTop(1);
            return 1;
        }
        /** Implements tonumber. */
        static tonumber(L) {
            var base = L.optInt(2, 10);
            if (base == 10) // standard conversion
             {
                L.checkAny(1);
                var o = L.value(1);
                if (Lua_1.Lua.isNumber(o)) {
                    L.pushNumber(L.toNumber(o));
                    return 1;
                }
            }
            else {
                var s = L.checkString(1);
                L.argCheck(2 <= base && base <= 36, 2, "base out of range");
                // :todo: consider stripping space and sharing some code with
                // Lua.vmTostring
                try {
                    var i = parseInt(s); //Integer.parseInt(s, base); //TODO:
                    L.pushNumber(i);
                    return 1;
                }
                catch (e_) {
                    if (e_ instanceof NumberFormatException_1.NumberFormatException) {
                        console.log(e_.stack);
                    }
                }
            }
            L.pushObject(Lua_1.Lua.NIL);
            return 1;
        }
        /** Implements tostring. */
        static tostring(L) {
            L.checkAny(1);
            var o = L.value(1);
            if (L.callMeta(1, "__tostring")) // is there a metafield?
             {
                return 1; // use its value
            }
            switch (L.type(1)) {
                case Lua_1.Lua.TNUMBER:
                    L.pushString(L.toString_(o));
                    break;
                case Lua_1.Lua.TSTRING:
                    L.pushObject(o);
                    break;
                case Lua_1.Lua.TBOOLEAN:
                    if (L.toBoolean(o)) {
                        L.pushLiteral("true");
                    }
                    else {
                        L.pushLiteral("false");
                    }
                    break;
                case Lua_1.Lua.TNIL:
                    L.pushLiteral("nil");
                    break;
                default:
                    L.pushString(o.toString());
                    break;
            }
            return 1;
        }
        /** Implements type. */
        static type(L) {
            L.checkAny(1);
            L.pushString(L.typeNameOfIndex(1));
            return 1;
        }
        /** Implements unpack. */
        static unpack(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            var t = L.value(1);
            var i = L.optInt(2, 1);
            var e = L.optInt(3, t.getn());
            var n = e - i + 1; // number of elements
            if (n <= 0) {
                return 0; // empty range
            }
            // i already initialised to start index, which isn't necessarily 1
            for (; i <= e; ++i) {
                L.pushObject(t.getnum(i));
            }
            return n;
        }
        /** Implements xpcall. */
        static xpcall(L) {
            L.checkAny(2);
            var errfunc = L.value(2);
            L.setTop(1); // remove error function from stack
            var status = L.pcall(0, Lua_1.Lua.MULTRET, errfunc);
            L.insert(Lua_1.Lua.valueOfBoolean(status == 0), 1);
            return L.getTop(); // return status + all results
        }
        /** Implements coroutine.create. */
        static create(L) {
            var NL = L.newThread();
            var faso = L.value(1);
            L.argCheck(Lua_1.Lua.isFunction(faso) && !Lua_1.Lua.isJavaFunction(faso), 1, "Lua function expected");
            L.setTop(1); // function is at top
            L.xmove(NL, 1); // move function from L to NL
            L.pushObject(NL);
            return 1;
        }
        /** Implements coroutine.resume. */
        static resume(L) {
            var co = L.toThread(L.value(1));
            L.argCheck(co != null, 1, "coroutine expected");
            var r = BaseLib.auxresume(L, co, L.getTop() - 1);
            if (r < 0) {
                L.insert(Lua_1.Lua.valueOfBoolean(false), -1);
                return 2; // return false + error message
            }
            L.insert(Lua_1.Lua.valueOfBoolean(true), L.getTop() - (r - 1));
            return r + 1; // return true + 'resume' returns
        }
        /** Implements coroutine.running. */
        static running(L) {
            if (L.isMain()) {
                return 0; // main thread is not a coroutine
            }
            L.pushObject(L);
            return 1;
        }
        /** Implements coroutine.status. */
        static status(L) {
            var co = L.toThread(L.value(1));
            L.argCheck(co != null, 1, "coroutine expected");
            if (L == co) {
                L.pushLiteral("running");
            }
            else {
                switch (co.status) {
                    case Lua_1.Lua.YIELD:
                        L.pushLiteral("suspended");
                        break;
                    case 0:
                        {
                            var ar = co.getStack(0);
                            if (ar != null) // does it have frames?
                             {
                                L.pushLiteral("normal"); // it is running
                            }
                            else if (co.getTop() == 0) {
                                L.pushLiteral("dead");
                            }
                            else {
                                L.pushLiteral("suspended"); // initial state
                            }
                        }
                        break;
                    default: // some error occured
                        L.pushLiteral("dead");
                }
            }
            return 1;
        }
        /** Implements coroutine.wrap. */
        static wrap(L) {
            BaseLib.create(L);
            L.pushObject(BaseLib.wrapit(L.toThread(L.value(-1))));
            return 1;
        }
        /** Helper for wrap.  Returns a LuaJavaCallback that has access to the
         * Lua thread.
         * @param L the Lua thread to be wrapped.
         */
        static wrapit(L) {
            var lib = new BaseLib(0);
            lib.init(L);
            return lib;
        }
        /** Helper for wrap.  This implements the function returned by wrap. */
        wrapaux(L) {
            var co = this.thread;
            var r = BaseLib.auxresume(L, co, L.getTop());
            if (r < 0) {
                if (Lua_1.Lua.isString(L.value(-1))) // error object is a string?
                 {
                    var w = L.where(1);
                    L.insert(w, -1);
                    L.concat(2);
                }
                L.error(L.value(-1)); // propagate error
            }
            return r;
        }
        static auxresume(L, co, narg) {
            // if (!co.checkStack...
            if (co.status == 0 && co.getTop() == 0) {
                L.pushLiteral("cannot resume dead coroutine");
                return -1; // error flag;
            }
            L.xmove(co, narg);
            var status = co.resume(narg);
            if (status == 0 || status == Lua_1.Lua.YIELD) {
                var nres = co.getTop();
                // if (!L.checkStack...
                co.xmove(L, nres); // move yielded values
                return nres;
            }
            co.xmove(L, 1); // move error message
            return -1; // error flag;
        }
        /** Implements coroutine.yield. */
        static yield(L) {
            return L.yield(L.getTop());
        }
    }
    exports.BaseLib = BaseLib;
    // :todo: consider making the enums contiguous so that the compiler
    // uses the compact and faster form of switch.
    // Each function in the base library corresponds to an instance of
    // this class which is associated (the 'which' member) with an integer
    // which is unique within this class.  They are taken from the following
    // set.
    BaseLib.ASSERT = 1;
    BaseLib.COLLECTGARBAGE = 2;
    BaseLib.DOFILE = 3;
    BaseLib.ERROR = 4;
    // private static const GCINFO:int = 5;
    BaseLib.GETFENV = 6;
    BaseLib.GETMETATABLE = 7;
    BaseLib.LOADFILE = 8;
    BaseLib.LOAD = 9;
    BaseLib.LOADSTRING = 10;
    BaseLib.NEXT = 11;
    BaseLib.PCALL = 12;
    BaseLib.PRINT = 13;
    BaseLib.RAWEQUAL = 14;
    BaseLib.RAWGET = 15;
    BaseLib.RAWSET = 16;
    BaseLib.SELECT = 17;
    BaseLib.SETFENV = 18;
    BaseLib.SETMETATABLE = 19;
    BaseLib.TONUMBER = 20;
    BaseLib.TOSTRING = 21;
    BaseLib.TYPE = 22;
    BaseLib.UNPACK = 23;
    BaseLib.XPCALL = 24;
    BaseLib.IPAIRS = 25;
    BaseLib.PAIRS = 26;
    BaseLib.IPAIRS_AUX = 27;
    BaseLib.PAIRS_AUX = 28;
    // The coroutine functions (which reside in the table "coroutine") are also
    // part of the base library.
    BaseLib.CREATE = 50;
    BaseLib.RESUME = 51;
    BaseLib.RUNNING = 52;
    BaseLib.STATUS = 53;
    BaseLib.WRAP = 54;
    BaseLib.YIELD = 55;
    BaseLib.WRAP_AUX = 56;
    /**
    * Lua value that represents the generator function for ipairs.  In
    * PUC-Rio this is implemented as an upvalue of ipairs.
    */
    BaseLib.IPAIRS_AUX_FUN = new BaseLib(BaseLib.IPAIRS_AUX);
    /**
    * Lua value that represents the generator function for pairs.  In
    * PUC-Rio this is implemented as an upvalue of pairs.
    */
    BaseLib.PAIRS_AUX_FUN = new BaseLib(BaseLib.PAIRS_AUX);
    /** Used by {@link #collectgarbage}. */
    BaseLib.CGOPTS = [
        "stop", "restart", "collect",
        "count", "step", "setpause", "setstepmul"
    ];
    /** Used by {@link #collectgarbage}. */
    BaseLib.CGOPTSNUM = [
        Lua_1.Lua.GCSTOP, Lua_1.Lua.GCRESTART, Lua_1.Lua.GCCOLLECT,
        Lua_1.Lua.GCCOUNT, Lua_1.Lua.GCSTEP, Lua_1.Lua.GCSETPAUSE, Lua_1.Lua.GCSETSTEPMUL
    ];
    /**
     * The {@link PrintStream} used by print.  Makes it more convenient if
     * redirection is desired.  For example, client code could implement
     * their own instance which sent output to the screen of a JME device.
     */
    BaseLib.OUT = SystemUtil_1.SystemUtil.out;
});
//# sourceMappingURL=BaseLib.js.map