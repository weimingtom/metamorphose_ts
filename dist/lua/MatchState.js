(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Character", "./Lua", "./Syntax"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MatchState = void 0;
    const Character_1 = require("../java/Character");
    const Lua_1 = require("./Lua");
    const Syntax_1 = require("./Syntax");
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
    class MatchState {
        // :todo: consider adding the pattern string as a member (and removing
        // p parameter from methods).
        // :todo: consider removing end parameter, if end always == // src.length()
        constructor(L, src, end) {
            /** Total number of captures (finished or unfinished). */
            this._level = 0;
            /** Each capture element is a 2-element array of (index, len). */
            this._capture = new Array();
            this._L = L;
            this._src = src;
            this._end = end;
        }
        /**
         * Returns the length of capture <var>i</var>.
         */
        captureLen(i) {
            var c = this._capture[i]; //(int[])
            return c[1];
        }
        /**
         * Returns the init index of capture <var>i</var>.
         */
        captureInit(i) {
            var c = this._capture[i]; //(int[])
            return c[0];
        }
        /**
         * Returns the 2-element array for the capture <var>i</var>.
         */
        capture(i) {
            return this._capture[i]; //(int[])
        }
        capInvalid() {
            return this._L.error("invalid capture index");
        }
        malBra() {
            return this._L.error("malformed pattern (missing '[')");
        }
        capUnfinished() {
            return this._L.error("unfinished capture");
        }
        malEsc() {
            return this._L.error("malformed pattern (ends with '%')");
        }
        check_capture(l) {
            l -= '1'.charCodeAt(0); // relies on wraparound.
            if (l >= this._level || this.captureLen(l) == MatchState.CAP_UNFINISHED)
                this.capInvalid();
            return l;
        }
        capture_to_close() {
            var lev = this._level;
            for (lev--; lev >= 0; lev--)
                if (this.captureLen(lev) == MatchState.CAP_UNFINISHED)
                    return lev;
            return this.capInvalid();
        }
        classend(p, pi) {
            switch (p.charAt(pi++)) {
                case String.fromCharCode(MatchState.L_ESC):
                    // assert pi < p.length() // checked by callers
                    return pi + 1;
                case '[':
                    if (p.length == pi)
                        return this.malBra();
                    if (p.charAt(pi) == '^')
                        ++pi;
                    do // look for a ']'
                     {
                        if (p.length == pi)
                            return this.malBra();
                        if (p.charCodeAt(pi++) == MatchState.L_ESC) {
                            if (p.length == pi)
                                return this.malBra();
                            ++pi; // skip escapes (e.g. '%]')
                            if (p.length == pi)
                                return this.malBra();
                        }
                    } while (p.charAt(pi) != ']');
                    return pi + 1;
                default:
                    return pi;
            }
        }
        /**
         * @param c   char match.
         * @param cl  character class.
         */
        static match_class(c, cl) {
            var res;
            switch (Character_1.Character.toLowerCase(cl)) {
                case 'a':
                    res = Syntax_1.Syntax.isalpha(c);
                    break;
                case 'c':
                    res = Syntax_1.Syntax.iscntrl(c);
                    break;
                case 'd':
                    res = Syntax_1.Syntax.isdigit(c);
                    break;
                case 'l':
                    res = Syntax_1.Syntax.islower(c);
                    break;
                case 'p':
                    res = Syntax_1.Syntax.ispunct(c);
                    break;
                case 's':
                    res = Syntax_1.Syntax.isspace(c);
                    break;
                case 'u':
                    res = Syntax_1.Syntax.isupper(c);
                    break;
                case 'w':
                    res = Syntax_1.Syntax.isalnum(c);
                    break;
                case 'x':
                    res = Syntax_1.Syntax.isxdigit(c);
                    break;
                case 'z':
                    res = (c == 0);
                    break;
                default:
                    return (cl == c);
            }
            return Character_1.Character.isLowerCase(cl) ? res : !res;
        }
        /**
         * @param pi  index in p of start of class.
         * @param ec  index in p of end of class.
         */
        static matchbracketclass(c, p, pi, ec) {
            // :todo: consider changing char c to int c, then -1 could be used
            // represent a guard value at the beginning and end of all strings (a
            // better NUL).  -1 of course would match no positive class.
            // assert p.charAt(pi) == '[';
            // assert p.charAt(ec) == ']';
            var sig = true;
            if (p.charCodeAt(pi + 1) == '^'.charCodeAt(0)) {
                sig = false;
                ++pi; // skip the '6'
            }
            while (++pi < ec) {
                if (p.charCodeAt(pi) == MatchState.L_ESC) {
                    ++pi;
                    if (this.match_class(c, p.charCodeAt(pi)))
                        return sig;
                }
                else if ((p.charAt(pi + 1) == '-') && (pi + 2 < ec)) {
                    pi += 2;
                    if (p.charCodeAt(pi - 2) <= c && c <= p.charCodeAt(pi))
                        return sig;
                }
                else if (p.charCodeAt(pi) == c) {
                    return sig;
                }
            }
            return !sig;
        }
        static singlematch(c, p, pi, ep) {
            switch (p.charAt(pi)) {
                case '.':
                    return true; // matches any char
                case String.fromCharCode(MatchState.L_ESC):
                    return this.match_class(c, p.charCodeAt(pi + 1));
                case '[':
                    return this.matchbracketclass(c, p, pi, ep - 1);
                default:
                    return p.charCodeAt(pi) == c;
            }
        }
        // Generally all the various match functions from PUC-Rio which take a
        // MatchState and return a "const char *" are transformed into
        // instance methods that take and return string indexes.
        matchbalance(si, p, pi) {
            if (pi + 1 >= p.length)
                this._L.error("unbalanced pattern");
            if (si >= this._end || this._src.charAt(si) != p.charAt(pi)) {
                return -1;
            }
            var b = p.charCodeAt(pi);
            var e = p.charCodeAt(pi + 1);
            var cont = 1;
            while (++si < this._end) {
                if (this._src.charCodeAt(si) == e) {
                    if (--cont == 0)
                        return si + 1;
                }
                else if (this._src.charCodeAt(si) == b) {
                    ++cont;
                }
            }
            return -1; // string ends out of balance
        }
        max_expand(si, p, pi, ep) {
            var i = 0; // counts maximum expand for item
            while (si + i < this._end && MatchState.singlematch(this._src.charCodeAt(si + i), p, pi, ep)) {
                ++i;
            }
            // keeps trying to match with the maximum repetitions
            while (i >= 0) {
                var res = this.match(si + i, p, ep + 1);
                if (res >= 0)
                    return res;
                --i; // else didn't match; reduce 1 repetition to try again
            }
            return -1;
        }
        min_expand(si, p, pi, ep) {
            while (true) {
                var res = this.match(si, p, ep + 1);
                if (res >= 0)
                    return res;
                else if (si < this._end && MatchState.singlematch(this._src.charCodeAt(si), p, pi, ep))
                    ++si; // try with one more repetition
                else
                    return -1;
            }
            //unreachable
            return -1;
        }
        start_capture(si, p, pi, what) {
            var temp = new Array(this._level + 1);
            for (var kk = 0; kk < temp.length; ++kk) {
                temp[kk] = this._capture[kk];
            }
            this._capture = temp;
            this._capture[this._level] = [si, what];
            ++this._level;
            var res = this.match(si, p, pi);
            if (res < 0) // match failed
             {
                --this._level;
            }
            return res;
        }
        end_capture(si, p, pi) {
            var l = this.capture_to_close();
            this.capture(l)[1] = si - this.captureInit(l); // close it
            var res = this.match(si, p, pi);
            if (res < 0) // match failed?
             {
                this.capture(l)[1] = MatchState.CAP_UNFINISHED; // undo capture
            }
            return res;
        }
        match_capture(si, l) {
            l = this.check_capture(l);
            var len = this.captureLen(l);
            if (this._end - si >= len) //TODO: 
             
            /*              &&
                        src.regionMatches(false,
                            captureInit(l),
                            src,
                            si,
                            len))*/
            {
                return si + len;
            }
            return -1;
        }
        /**
         * @param si  index of subject at which to attempt match.
         * @param p   pattern string.
         * @param pi  index into pattern (from which to being matching).
         * @return the index of the end of the match, -1 for no match.
         */
        match(si, p, pi) {
            // This code has been considerably changed in the transformation
            // from C to Java.  There are the following non-obvious changes:
            // - The C code routinely relies on NUL being accessible at the end of
            //   the pattern string.  In Java we can't do this, so we use many
            //   more explicit length checks and pull error cases into this
            //   function.  :todo: consider appending NUL to the pattern string.
            // - The C code uses a "goto dflt" which is difficult to transform in
            //   the usual way.
            init: // labelled while loop emulates "goto init", which we use to
             
            // optimize tail recursion.
            while (true) {
                if (p.length == pi) // end of pattern
                    return si; // match succeeded
                switch (p.charAt(pi)) {
                    case '(':
                        if (p.length == pi + 1) {
                            return this.capUnfinished();
                        }
                        if (p.charAt(pi + 1) == ')') // position capture?
                            return this.start_capture(si, p, pi + 2, MatchState.CAP_POSITION);
                        return this.start_capture(si, p, pi + 1, MatchState.CAP_UNFINISHED);
                    case ')': // end capture
                        return this.end_capture(si, p, pi + 1);
                    case String.fromCharCode(MatchState.L_ESC):
                        if (p.length == pi + 1) {
                            return this.malEsc();
                        }
                        switch (p.charAt(pi + 1)) {
                            case 'b': // balanced string?
                                si = this.matchbalance(si, p, pi + 2);
                                if (si < 0)
                                    return si;
                                pi += 4;
                                // else return match(ms, s, p+4);
                                continue init; // goto init
                            case 'f': // frontier
                                {
                                    pi += 2;
                                    if (p.length == pi || p.charAt(pi) != '[')
                                        return this._L.error("missing '[' after '%f' in pattern");
                                    var ep = this.classend(p, pi); // indexes what is next
                                    var previous = (si == 0) ? '\0'.charCodeAt(0) : this._src.charCodeAt(si - 1);
                                    var at = (si == this._end) ? '\0'.charCodeAt(0) : this._src.charCodeAt(si);
                                    if (MatchState.matchbracketclass(previous, p, pi, ep - 1) ||
                                        !MatchState.matchbracketclass(at, p, pi, ep - 1)) {
                                        return -1;
                                    }
                                    pi = ep;
                                    // else return match(ms, s, ep);
                                }
                                continue init; // goto init
                            default:
                                if (Syntax_1.Syntax.isdigit(p.charCodeAt(pi + 1))) // capture results (%0-%09)?
                                 {
                                    si = this.match_capture(si, p.charCodeAt(pi + 1));
                                    if (si < 0)
                                        return si;
                                    pi += 2;
                                    // else return match(ms, s, p+2);
                                    continue init; // goto init
                                }
                            // We emulate a goto dflt by a fallthrough to the next
                            // case (of the outer switch) and making sure that the
                            // next case has no effect when we fallthrough to it from here.
                            // goto dflt;
                        }
                    // FALLTHROUGH
                    case '$':
                        if (p.charAt(pi) == '$') {
                            if (p.length == pi + 1) // is the '$' the last char in pattern?
                                return (si == this._end) ? si : -1; // check end of string
                            // else goto dflt;
                        }
                    // FALLTHROUGH
                    default: // it is a pattern item
                        {
                            var ep2 = this.classend(p, pi); // indexes what is next
                            var m = si < this._end && MatchState.singlematch(this._src.charCodeAt(si), p, pi, ep2);
                            if (p.length > ep2) {
                                switch (p.charAt(ep2)) {
                                    case '?': // optional
                                        if (m) {
                                            var res = this.match(si + 1, p, ep2 + 1);
                                            if (res >= 0)
                                                return res;
                                        }
                                        pi = ep2 + 1;
                                        // else return match(s, ep+1);
                                        continue init; // goto init
                                    case '*': // 0 or more repetitions
                                        return this.max_expand(si, p, pi, ep2);
                                    case '+': // 1 or more repetitions
                                        return m ? this.max_expand(si + 1, p, pi, ep2) : -1;
                                    case '-': // 0 or more repetitions (minimum)
                                        return this.min_expand(si, p, pi, ep2);
                                }
                            }
                            // else or default:
                            if (!m)
                                return -1;
                            ++si;
                            pi = ep2;
                            // return match(ms, s+1, ep);
                            continue init;
                        }
                }
            }
            //unreachable
            return -1;
        }
        /**
         * @param s  index of start of match.
         * @param e  index of end of match.
         */
        onecapture(i, s, e) {
            if (i >= this._level) {
                if (i == 0) // level == 0, too
                    return this._src.substring(s, e); // add whole match
                else
                    this.capInvalid();
                // NOTREACHED;
            }
            var l = this.captureLen(i);
            if (l == MatchState.CAP_UNFINISHED)
                this.capUnfinished();
            if (l == MatchState.CAP_POSITION)
                return Lua_1.Lua.valueOfNumber(this.captureInit(i) + 1);
            return this._src.substring(this.captureInit(i), this.captureInit(i) + l);
        }
        push_onecapture(i, s, e) {
            this._L.pushObject(this.onecapture(i, s, e));
        }
        /**
         * @param s  index of start of match.
         * @param e  index of end of match.
         */
        push_captures(s, e) {
            var nlevels = (this._level == 0 && s >= 0) ? 1 : this._level;
            for (var i = 0; i < nlevels; ++i)
                this.push_onecapture(i, s, e);
            return nlevels; // number of strings pushed
        }
        /** A helper for gsub.  Equivalent to add_s from lstrlib.c. */
        adds(b, si, ei) {
            var news = this._L.toString_(this._L.value(3));
            var l = news.length;
            for (var i = 0; i < l; ++i) {
                if (news.charCodeAt(i) != MatchState.L_ESC) {
                    b.append(news.charCodeAt(i));
                }
                else {
                    ++i; // skip L_ESC
                    if (!Syntax_1.Syntax.isdigit(news.charCodeAt(i))) {
                        b.append(news.charCodeAt(i));
                    }
                    else if (news.charAt(i) == '0') {
                        b.appendString(this._src.substring(si, ei));
                    }
                    else {
                        // add capture to accumulated result
                        b.appendString(this._L.toString_(this.onecapture(news.charCodeAt(i) - '1'.charCodeAt(0), si, ei)));
                    }
                }
            }
        }
        /** A helper for gsub.  Equivalent to add_value from lstrlib.c. */
        addvalue(b, si, ei) {
            switch (this._L.type(3)) {
                case Lua_1.Lua.TNUMBER:
                case Lua_1.Lua.TSTRING:
                    this.adds(b, si, ei);
                    return;
                case Lua_1.Lua.TFUNCTION:
                    {
                        this._L.pushValue(3);
                        var n = this.push_captures(si, ei);
                        this._L.call(n, 1);
                    }
                    break;
                case Lua_1.Lua.TTABLE:
                    this._L.pushObject(this._L.getTable(this._L.value(3), this.onecapture(0, si, ei)));
                    break;
                default:
                    {
                        this._L.argError(3, "string/function/table expected");
                        return;
                    }
            }
            if (!this._L.toBoolean(this._L.value(-1))) // nil or false
             {
                this._L.pop(1);
                this._L.pushString(this._src.substring(si, ei));
            }
            else if (!Lua_1.Lua.isString(this._L.value(-1))) {
                this._L.error("invalid replacement value (a " +
                    Lua_1.Lua.typeName(this._L.type(-1)) + ")");
            }
            b.appendString(this._L.toString_(this._L.value(-1))); // add result to accumulator
            this._L.pop(1);
        }
        //新增
        get end() {
            return this._end;
        }
        //新增
        set level(level) {
            this._level = level;
        }
    }
    exports.MatchState = MatchState;
    MatchState.L_ESC = '%'.charCodeAt(0);
    MatchState.SPECIALS = "^$*+?.([%-";
    MatchState.CAP_UNFINISHED = -1;
    MatchState.CAP_POSITION = -2;
});
//# sourceMappingURL=MatchState.js.map