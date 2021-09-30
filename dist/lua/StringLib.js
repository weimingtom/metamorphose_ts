(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/StringBuffer", "../java/ByteArrayOutputStream", "./LuaJavaCallback", "./FormatItem", "./Lua", "./LuaTable", "./MatchState"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringLib = void 0;
    const StringBuffer_1 = require("../java/StringBuffer");
    const ByteArrayOutputStream_1 = require("../java/ByteArrayOutputStream");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    const FormatItem_1 = require("./FormatItem");
    const Lua_1 = require("./Lua");
    const LuaTable_1 = require("./LuaTable");
    const MatchState_1 = require("./MatchState");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/StringLib.java#1 $
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
     * Contains Lua's string library.
     * The library can be opened using the {@link #open} method.
     */
    class StringLib extends LuaJavaCallback_1.LuaJavaCallback {
        /** Constructs instance, filling in the 'which' member. */
        constructor(which) {
            super();
            this._which = which;
        }
        /**
         * Adjusts the output of string.format so that %e and %g use 'e'
         * instead of 'E' to indicate the exponent.  In other words so that
         * string.format follows the ISO C (ISO 9899) standard for printf.
         */
        formatISO() {
            FormatItem_1.FormatItem.E_LOWER = 'e'.charCodeAt(0);
        }
        /**
         * Implements all of the functions in the Lua string library.  Do not
         * call directly.
         * @param L  the Lua state in which to execute.
         * @return number of returned parameters, as per convention.
         */
        luaFunction(L) {
            switch (this._which) {
                case StringLib.BYTE:
                    return StringLib.byteFunction(L);
                case StringLib.CHAR:
                    return StringLib.charFunction(L);
                case StringLib.DUMP:
                    return StringLib.dump(L);
                case StringLib.FIND:
                    return StringLib.find(L);
                case StringLib.FORMAT:
                    return StringLib.format(L);
                case StringLib.GMATCH:
                    return StringLib.gmatch(L);
                case StringLib.GSUB:
                    return StringLib.gsub(L);
                case StringLib.LEN:
                    return StringLib.len(L);
                case StringLib.LOWER:
                    return StringLib.lower(L);
                case StringLib.MATCH:
                    return StringLib.match(L);
                case StringLib.REP:
                    return StringLib.rep(L);
                case StringLib.REVERSE:
                    return StringLib.reverse(L);
                case StringLib.SUB:
                    return StringLib.sub(L);
                case StringLib.UPPER:
                    return StringLib.upper(L);
                case StringLib.GMATCH_AUX:
                    return StringLib.gmatchaux(L);
            }
            return 0;
        }
        /**
         * Opens the string library into the given Lua state.  This registers
         * the symbols of the string library in a newly created table called
         * "string".
         * @param L  The Lua state into which to open.
         */
        static open(L) {
            var lib = L.__register("string");
            StringLib.r(L, "byte", StringLib.BYTE);
            StringLib.r(L, "char", StringLib.CHAR);
            StringLib.r(L, "dump", StringLib.DUMP);
            StringLib.r(L, "find", StringLib.FIND);
            StringLib.r(L, "format", StringLib.FORMAT);
            StringLib.r(L, "gfind", StringLib.GFIND);
            StringLib.r(L, "gmatch", StringLib.GMATCH);
            StringLib.r(L, "gsub", StringLib.GSUB);
            StringLib.r(L, "len", StringLib.LEN);
            StringLib.r(L, "lower", StringLib.LOWER);
            StringLib.r(L, "match", StringLib.MATCH);
            StringLib.r(L, "rep", StringLib.REP);
            StringLib.r(L, "reverse", StringLib.REVERSE);
            StringLib.r(L, "sub", StringLib.SUB);
            StringLib.r(L, "upper", StringLib.UPPER);
            var mt = new LuaTable_1.LuaTable();
            L.setMetatable("", mt); // set string metatable
            L.setField(mt, "__index", lib);
        }
        /** Register a function. */
        static r(L, name, which) {
            var f = new StringLib(which);
            var lib = L.getGlobal("string");
            L.setField(lib, name, f);
        }
        /** Implements string.byte.  Name mangled to avoid keyword. */
        static byteFunction(L) {
            var s = L.checkString(1);
            var posi = StringLib.posrelat(L.optInt(2, 1), s);
            var pose = StringLib.posrelat(L.optInt(3, posi), s);
            if (posi <= 0) {
                posi = 1;
            }
            if (pose > s.length) {
                pose = s.length;
            }
            if (posi > pose) {
                return 0; // empty interval; return no values
            }
            var n = pose - posi + 1;
            for (var i = 0; i < n; ++i) {
                L.pushNumber(s.charCodeAt(posi + i - 1));
            }
            return n;
        }
        /** Implements string.char.  Name mangled to avoid keyword. */
        static charFunction(L) {
            var n = L.getTop(); // number of arguments
            var b = new StringBuffer_1.StringBuffer();
            for (var i = 1; i <= n; ++i) {
                var c = L.checkInt(i);
                L.argCheck(c == c, i, "invalid value");
                b.append(c);
            }
            L.pushString(b.toString());
            return 1;
        }
        /** Implements string.dump. */
        static dump(L) {
            L.checkType(1, Lua_1.Lua.TFUNCTION);
            L.setTop(1);
            try {
                var s = new ByteArrayOutputStream_1.ByteArrayOutputStream();
                Lua_1.Lua.dump(L.value(1), s);
                var a = s.toByteArray();
                s = null;
                var b = new StringBuffer_1.StringBuffer();
                for (var i = 0; i < a.length; ++i) {
                    b.append((a.get(i) & 0xff));
                }
                L.pushString(b.toString());
                return 1;
            }
            catch (e_) {
                if (e_ instanceof Error) {
                    console.log(e_.stack);
                }
                L.error("unabe to dump given function");
            }
            // NOTREACHED
            return 0;
        }
        /** Helper for find and match.  Equivalent to str_find_aux. */
        static findAux(L, isFind) {
            var s = L.checkString(1);
            var p = L.checkString(2);
            var l1 = s.length;
            var l2 = p.length;
            var init = StringLib.posrelat(L.optInt(3, 1), s) - 1;
            if (init < 0) {
                init = 0;
            }
            else if (init > l1) {
                init = l1;
            }
            if (isFind && (L.toBoolean(L.value(4)) || // explicit request
                StringLib.strpbrk(p, MatchState_1.MatchState.SPECIALS) < 0)) // or no special characters?
             { // do a plain search
                var off = StringLib.lmemfind(s.substring(init), l1 - init, p, l2);
                if (off >= 0) {
                    L.pushNumber(init + off + 1);
                    L.pushNumber(init + off + l2);
                    return 2;
                }
            }
            else {
                var ms = new MatchState_1.MatchState(L, s, l1);
                var anchor = p.charAt(0) == '^';
                var si = init;
                do {
                    ms.level = 0;
                    var res = ms.match(si, p, anchor ? 1 : 0);
                    if (res >= 0) {
                        if (isFind) {
                            L.pushNumber(si + 1); // start
                            L.pushNumber(res); // end
                            return ms.push_captures(-1, -1) + 2;
                        } // else
                        return ms.push_captures(si, res);
                    }
                } while (si++ < ms.end && !anchor);
            }
            L.pushNil(); // not found
            return 1;
        }
        /** Implements string.find. */
        static find(L) {
            return StringLib.findAux(L, true);
        }
        /** Implement string.match.  Operates slightly differently from the
         * PUC-Rio code because instead of storing the iteration state as
         * upvalues of the C closure the iteration state is stored in an
         * Object[3] and kept on the stack.
         */
        static gmatch(L) {
            var state = new Array(3); //Object[]
            state[0] = L.checkString(1);
            state[1] = L.checkString(2);
            state[2] = 0;
            L.pushObject(StringLib.GMATCH_AUX_FUN);
            L.pushObject(state);
            return 2;
        }
        /**
         * Expects the iteration state, an Object[3] (see {@link
         * #gmatch}), to be first on the stack.
         */
        static gmatchaux(L) {
            var state = L.value(1); //Object[] 
            var s = state[0];
            var p = state[1];
            var i = state[2];
            var ms = new MatchState_1.MatchState(L, s, s.length);
            for (; i <= ms.end; ++i) {
                ms.level = 0;
                var e = ms.match(i, p, 0);
                if (e >= 0) {
                    var newstart = e;
                    if (e == i) // empty match?
                        ++newstart; // go at least one position
                    state[2] = parseInt(newstart.toFixed(0));
                    return ms.push_captures(i, e);
                }
            }
            return 0; // not found.
        }
        /** Implements string.gsub. */
        static gsub(L) {
            var s = L.checkString(1);
            var sl = s.length;
            var p = L.checkString(2);
            var maxn = L.optInt(4, sl + 1);
            var anchor = false;
            if (p.length > 0) {
                anchor = p.charAt(0) == '^';
            }
            if (anchor)
                p = p.substring(1);
            var ms = new MatchState_1.MatchState(L, s, sl);
            var b = new StringBuffer_1.StringBuffer();
            var n = 0;
            var si = 0;
            while (n < maxn) {
                ms.level = 0;
                var e = ms.match(si, p, 0);
                if (e >= 0) {
                    ++n;
                    ms.addvalue(b, si, e);
                }
                if (e >= 0 && e > si) // non empty match?
                    si = e; // skip it
                else if (si < ms.end)
                    b.append(s.charCodeAt(si++));
                else
                    break;
                if (anchor)
                    break;
            }
            b.appendString(s.substring(si));
            L.pushString(b.toString());
            L.pushNumber(n); // number of substitutions
            return 2;
        }
        static addquoted(L, b, arg) {
            var s = L.checkString(arg);
            var l = s.length;
            b.append('"'.charCodeAt(0));
            for (var i = 0; i < l; ++i) {
                switch (s.charAt(i)) {
                    case '"':
                    case '\\':
                    case '\n':
                        b.append('\\'.charCodeAt(0));
                        b.append(s.charCodeAt(i));
                        break;
                    case '\r':
                        b.appendString("\\r");
                        break;
                    case '\0':
                        b.appendString("\\u0000" /*"\\000"*/);
                        break;
                    default:
                        b.append(s.charCodeAt(i));
                        break;
                }
            }
            b.append('"'.charCodeAt(0));
        }
        static format(L) {
            var arg = 1;
            var strfrmt = L.checkString(1);
            var sfl = strfrmt.length;
            var b = new StringBuffer_1.StringBuffer();
            var i = 0;
            while (i < sfl) {
                if (strfrmt.charCodeAt(i) != MatchState_1.MatchState.L_ESC) {
                    b.append(strfrmt.charCodeAt(i++));
                }
                else if (strfrmt.charCodeAt(++i) == MatchState_1.MatchState.L_ESC) {
                    b.append(strfrmt.charCodeAt(i++));
                }
                else // format item
                 {
                    ++arg;
                    var item = new FormatItem_1.FormatItem(L, strfrmt.substring(i));
                    i += item.length;
                    switch (String.fromCharCode(item.type)) {
                        case 'c':
                            item.formatChar(b, L.checkNumber(arg));
                            break;
                        case 'd':
                        case 'i':
                        case 'o':
                        case 'u':
                        case 'x':
                        case 'X':
                            // :todo: should be unsigned conversions cope better with
                            // negative number?
                            item.formatInteger(b, L.checkNumber(arg));
                            break;
                        case 'e':
                        case 'E':
                        case 'f':
                        case 'g':
                        case 'G':
                            item.formatFloat(b, L.checkNumber(arg));
                            break;
                        case 'q':
                            StringLib.addquoted(L, b, arg);
                            break;
                        case 's':
                            item.formatString(b, L.checkString(arg));
                            break;
                        default:
                            return L.error("invalid option to 'format'");
                    }
                }
            }
            L.pushString(b.toString());
            return 1;
        }
        /** Implements string.len. */
        static len(L) {
            var s = L.checkString(1);
            L.pushNumber(s.length);
            return 1;
        }
        /** Implements string.lower. */
        static lower(L) {
            var s = L.checkString(1);
            L.pushString(s.toLowerCase());
            return 1;
        }
        /** Implements string.match. */
        static match(L) {
            return StringLib.findAux(L, false);
        }
        /** Implements string.rep. */
        static rep(L) {
            var s = L.checkString(1);
            var n = L.checkInt(2);
            var b = new StringBuffer_1.StringBuffer();
            for (var i = 0; i < n; ++i) {
                b.appendString(s);
            }
            L.pushString(b.toString());
            return 1;
        }
        /** Implements string.reverse. */
        static reverse(L) {
            var s = L.checkString(1);
            var b = new StringBuffer_1.StringBuffer();
            var l = s.length;
            while (--l >= 0) {
                b.append(s.charCodeAt(l));
            }
            L.pushString(b.toString());
            return 1;
        }
        /** Helper for {@link #sub} and friends. */
        static posrelat(pos, s) {
            if (pos >= 0) {
                return pos;
            }
            var len = s.length;
            return len + pos + 1;
        }
        /** Implements string.sub. */
        static sub(L) {
            var s = L.checkString(1);
            var start = StringLib.posrelat(L.checkInt(2), s);
            var end = StringLib.posrelat(L.optInt(3, -1), s);
            if (start < 1) {
                start = 1;
            }
            if (end > s.length) {
                end = s.length;
            }
            if (start <= end) {
                L.pushString(s.substring(start - 1, end));
            }
            else {
                L.pushLiteral("");
            }
            return 1;
        }
        /** Implements string.upper. */
        static upper(L) {
            var s = L.checkString(1);
            L.pushString(s.toUpperCase());
            return 1;
        }
        /**
         * @return  character index of start of match (-1 if no match).
         */
        static lmemfind(s1, l1, s2, l2) {
            if (l2 == 0) {
                return 0; // empty strings are everywhere
            }
            else if (l2 > l1) {
                return -1; // avoids a negative l1
            }
            return s1.indexOf(s2);
        }
        /**
         * Just like C's strpbrk.
         * @return an index into <var>s</var> or -1 for no match.
         */
        static strpbrk(s, _set) {
            var l = _set.length;
            for (var i = 0; i < l; ++i) {
                var idx = s.indexOf(_set.charAt(i));
                if (idx >= 0)
                    return idx;
            }
            return -1;
        }
    }
    exports.StringLib = StringLib;
    // Each function in the string library corresponds to an instance of
    // this class which is associated (the 'which' member) with an integer
    // which is unique within this class.  They are taken from the following
    // set.
    StringLib.BYTE = 1;
    StringLib.CHAR = 2;
    StringLib.DUMP = 3;
    StringLib.FIND = 4;
    StringLib.FORMAT = 5;
    StringLib.GFIND = 6;
    StringLib.GMATCH = 7;
    StringLib.GSUB = 8;
    StringLib.LEN = 9;
    StringLib.LOWER = 10;
    StringLib.MATCH = 11;
    StringLib.REP = 12;
    StringLib.REVERSE = 13;
    StringLib.SUB = 14;
    StringLib.UPPER = 15;
    StringLib.GMATCH_AUX = 16;
    StringLib.GMATCH_AUX_FUN = new StringLib(StringLib.GMATCH_AUX);
});
//# sourceMappingURL=StringLib.js.map