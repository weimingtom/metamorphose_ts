(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Character", "../java/Hashtable", "../java/NumberFormatException", "../java/StringBuffer", "./BlockCnt", "./ConsControl", "./Expdesc", "./FuncState", "./LHSAssign", "./Lua", "./Proto"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Syntax = void 0;
    const Character_1 = require("../java/Character");
    const Hashtable_1 = require("../java/Hashtable");
    const NumberFormatException_1 = require("../java/NumberFormatException");
    const StringBuffer_1 = require("../java/StringBuffer");
    const BlockCnt_1 = require("./BlockCnt");
    const ConsControl_1 = require("./ConsControl");
    const Expdesc_1 = require("./Expdesc");
    const FuncState_1 = require("./FuncState");
    const LHSAssign_1 = require("./LHSAssign");
    const Lua_1 = require("./Lua");
    const Proto_1 = require("./Proto");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Syntax.java#1 $
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
     * Syntax analyser.  Lexing, parsing, code generation.
     */
    class Syntax {
        constructor(L, z, source) {
            // From struct LexState
            /** current character */
            this._current = 0;
            /** input line counter */
            this._linenumber = 1;
            /** line of last token 'consumed' */
            this._lastline = 1;
            /**
            * The token value.  For "punctuation" tokens this is the ASCII value
            * for the character for the token; for other tokens a member of the
            * enum (all of which are > 255).
            */
            this._token = 0;
            /** Semantic info for token; a number. */
            this._tokenR = 0;
            /** Semantic info for token; a string. */
            this._tokenS = null;
            /** Lookahead token value. */
            this._lookahead = Syntax.TK_EOS;
            /** Semantic info for lookahead; a number. */
            this._lookaheadR = 0;
            /** Semantic info for lookahead; a string. */
            this._lookaheadS = null;
            /** Semantic info for return value from {@link #llex}; a number. */
            this._semR = 0;
            /** As {@link #semR}, for string. */
            this._semS = null;
            /** FuncState for current (innermost) function being parsed. */
            this._fs = null;
            /** Buffer for tokens. */
            this._buff = new StringBuffer_1.StringBuffer();
            /** locale decimal point. */
            //TODO:这个变量貌似没有使用
            this._decpoint = '.'.charCodeAt(0);
            Syntax.init();
            this._L = L;
            this._z = z;
            this._source = source;
            this.next();
        }
        //TODO:实现静态初始化
        static init() {
            if (Syntax._reserved == null) {
                Syntax._reserved = new Hashtable_1.Hashtable();
                for (var i = 0; i < Syntax.NUM_RESERVED; ++i) {
                    //TODO:
                    Syntax._reserved.put(Syntax._tokens[i], new Number(Syntax.FIRST_RESERVED + i));
                }
            }
        }
        get lastline() {
            return this._lastline;
        }
        // From <ctype.h>
        // Implementations of functions from <ctype.h> are only correct copies
        // to the extent that Lua requires them.
        // Generally they have default access so that StringLib can see them.
        // Unlike C's these version are not locale dependent, they use the
        // ISO-Latin-1 definitions from CLDC 1.1 Character class.
        static isalnum(c) {
            var ch = c;
            return Character_1.Character.isUpperCase(ch) ||
                Character_1.Character.isLowerCase(ch) ||
                Character_1.Character.isDigit(ch);
        }
        static isalpha(c) {
            var ch = c;
            return Character_1.Character.isUpperCase(ch) ||
                Character_1.Character.isLowerCase(ch);
        }
        /** True if and only if the char (when converted from the int) is a
         * control character.
         */
        static iscntrl(c) {
            return c < 0x20 || c == 0x7f;
        }
        static isdigit(c) {
            return Character_1.Character.isDigit(c);
        }
        static islower(c) {
            return Character_1.Character.isLowerCase(c);
        }
        /**
         * A character is punctuation if not cntrl, not alnum, and not space.
         */
        static ispunct(c) {
            return !Syntax.isalnum(c) && !Syntax.iscntrl(c) && !Syntax.isspace(c);
        }
        static isspace(c) {
            return c == ' '.charCodeAt(0) ||
                c == '\f'.charCodeAt(0) ||
                c == '\n'.charCodeAt(0) ||
                c == '\r'.charCodeAt(0) ||
                c == '\t'.charCodeAt(0);
        }
        static isupper(c) {
            return Character_1.Character.isUpperCase(c);
        }
        static isxdigit(c) {
            return Character_1.Character.isDigit(c) ||
                ('a'.charCodeAt(0) <= c && c <= 'f'.charCodeAt(0)) ||
                ('A'.charCodeAt(0) <= c && c <= 'F'.charCodeAt(0));
        }
        // From llex.c
        check_next(_set) {
            if (_set.indexOf(String.fromCharCode(this._current)) < 0) {
                return false;
            }
            this.save_and_next();
            return true;
        }
        currIsNewline() {
            return this._current == '\n'.charCodeAt(0) ||
                this._current == '\r'.charCodeAt(0);
        }
        inclinenumber() {
            var old = this._current;
            //# assert currIsNewline()
            this.next(); // skip '\n' or '\r'
            if (this.currIsNewline() && this._current != old) {
                this.next(); // skip '\n\r' or '\r\n'
            }
            if (++this._linenumber < 0) // overflow
             {
                this.xSyntaxerror("chunk has too many lines");
            }
        }
        skip_sep() {
            var count = 0;
            var s = this._current;
            //# assert s == '[' || s == ']'
            this.save_and_next();
            while (this._current == '='.charCodeAt(0)) {
                this.save_and_next();
                count++;
            }
            return (this._current == s) ? count : (-count) - 1;
        }
        read_long_string(isString, sep) {
            var cont = 0;
            this.save_and_next(); /* skip 2nd `[' */
            if (this.currIsNewline()) /* string starts with a newline? */
                this.inclinenumber(); /* skip it */
            loop: while (true) {
                switch (String.fromCharCode(this._current)) {
                    case String.fromCharCode(Syntax.EOZ): //TODO:
                        this.xLexerror(isString ? "unfinished long string" :
                            "unfinished long comment", Syntax.TK_EOS);
                        break; /* to avoid warnings */
                    case ']':
                        if (this.skip_sep() == sep) {
                            this.save_and_next(); /* skip 2nd `]' */
                            break loop;
                        }
                        break;
                    case '\n':
                    case '\r':
                        this.__save('\n'.charCodeAt(0));
                        this.inclinenumber();
                        if (!isString)
                            this._buff.setLength(0); /* avoid wasting space */
                        break;
                    default:
                        if (isString)
                            this.save_and_next();
                        else
                            this.next();
                }
            } /* loop */
            if (isString) {
                var rawtoken = this._buff.toString();
                var trim_by = 2 + sep;
                this._semS = rawtoken.substring(trim_by, rawtoken.length - trim_by);
            }
        }
        /** Lex a token and return it.  The semantic info for the token is
         * stored in <code>this.semR</code> or <code>this.semS</code> as
         * appropriate.
         */
        llex() {
            if (Lua_1.Lua.D) {
                console.log("llex() enter, current:" + this._current);
            }
            this._buff.setLength(0);
            while (true) {
                switch (String.fromCharCode(this._current)) {
                    case '\n':
                    case '\r':
                        if (Lua_1.Lua.D) {
                            console.log("case \\n\\r");
                        }
                        this.inclinenumber();
                        continue;
                    case '-':
                        if (Lua_1.Lua.D) {
                            console.log("case -");
                        }
                        this.next();
                        if (this._current != '-'.charCodeAt(0))
                            return '-'.charCodeAt(0);
                        /* else is a comment */
                        this.next();
                        if (this._current == '['.charCodeAt(0)) {
                            var sep2 = this.skip_sep();
                            this._buff.setLength(0); /* `skip_sep' may dirty the buffer */
                            if (sep2 >= 0) {
                                this.read_long_string(false, sep2); /* long comment */
                                this._buff.setLength(0);
                                continue;
                            }
                        }
                        /* else short comment */
                        while (!this.currIsNewline() && this._current != Syntax.EOZ)
                            this.next();
                        continue;
                    case '[':
                        if (Lua_1.Lua.D) {
                            console.log("case [");
                        }
                        var sep = this.skip_sep();
                        if (sep >= 0) {
                            this.read_long_string(true, sep);
                            return Syntax.TK_STRING;
                        }
                        else if (sep == -1)
                            return '['.charCodeAt(0);
                        else
                            this.xLexerror("invalid long string delimiter", Syntax.TK_STRING);
                        continue; // avoids Checkstyle warning.
                    case '=':
                        if (Lua_1.Lua.D) {
                            console.log("case =");
                        }
                        this.next();
                        if (this._current != '='.charCodeAt(0)) {
                            return '='.charCodeAt(0);
                        }
                        else {
                            this.next();
                            return Syntax.TK_EQ;
                        }
                    case '<':
                        if (Lua_1.Lua.D) {
                            console.log("case <");
                        }
                        this.next();
                        if (this._current != '='.charCodeAt(0)) {
                            return '<'.charCodeAt(0);
                        }
                        else {
                            this.next();
                            return Syntax.TK_LE;
                        }
                    case '>':
                        if (Lua_1.Lua.D) {
                            console.log("case >");
                        }
                        this.next();
                        if (this._current != '='.charCodeAt(0)) {
                            return '>'.charCodeAt(0);
                        }
                        else {
                            this.next();
                            return Syntax.TK_GE;
                        }
                    case '~':
                        if (Lua_1.Lua.D) {
                            console.log("case ~");
                        }
                        this.next();
                        if (this._current != '='.charCodeAt(0)) {
                            return '~'.charCodeAt(0);
                        }
                        else {
                            this.next();
                            return Syntax.TK_NE;
                        }
                    case '"':
                    case '\'':
                        if (Lua_1.Lua.D) {
                            console.log("case \"'");
                        }
                        this.read_string(this._current);
                        return Syntax.TK_STRING;
                    case '.':
                        if (Lua_1.Lua.D) {
                            console.log("case .");
                        }
                        this.save_and_next();
                        if (this.check_next(".")) {
                            if (this.check_next(".")) {
                                return Syntax.TK_DOTS;
                            }
                            else {
                                return Syntax.TK_CONCAT;
                            }
                        }
                        else if (!Syntax.isdigit(this._current)) {
                            return '.'.charCodeAt(0);
                        }
                        else {
                            this.read_numeral();
                            return Syntax.TK_NUMBER;
                        }
                    case String.fromCharCode(Syntax.EOZ): //TODO:
                        if (Lua_1.Lua.D) {
                            console.log("case EOZ");
                        }
                        return Syntax.TK_EOS;
                    default:
                        if (Syntax.isspace(this._current)) {
                            if (Lua_1.Lua.D) {
                                console.log("isspace");
                            }
                            // assert !currIsNewline();
                            this.next();
                            continue;
                        }
                        else if (Syntax.isdigit(this._current)) {
                            if (Lua_1.Lua.D) {
                                console.log("isdigit");
                            }
                            this.read_numeral();
                            return Syntax.TK_NUMBER;
                        }
                        else if (Syntax.isalpha(this._current) || this._current == '_'.charCodeAt(0)) {
                            if (Lua_1.Lua.D) {
                                console.log("isalpha or _");
                            }
                            // identifier or reserved word
                            do {
                                this.save_and_next();
                            } while (Syntax.isalnum(this._current) || this._current == '_'.charCodeAt(0));
                            var s = this._buff.toString();
                            var t = Syntax._reserved._get(s); //TODO:
                            if (t == null) {
                                this._semS = s;
                                return Syntax.TK_NAME;
                            }
                            else {
                                //return t as number;
                                return parseFloat(t.toString());
                            }
                        }
                        else {
                            var c = this._current;
                            this.next();
                            return c; // single-char tokens
                        }
                }
            }
            //unreachable
            return 0;
        }
        next() {
            this._current = this._z.read();
            if (Lua_1.Lua.D) {
                console.log("Syntax.next(), current:" + this._current + "(" + String.fromCharCode(this._current) + ")");
            }
        }
        /** Reads number.  Writes to semR. */
        read_numeral() {
            // assert isdigit(current);
            do {
                this.save_and_next();
            } while (Syntax.isdigit(this._current) || this._current == '.'.charCodeAt(0));
            if (this.check_next("Ee")) // 'E' ?
             {
                this.check_next("+-"); // optional exponent sign
            }
            while (Syntax.isalnum(this._current) || this._current == '_'.charCodeAt(0)) {
                this.save_and_next();
            }
            // :todo: consider doing PUC-Rio's decimal point tricks.
            try {
                this._semR = Number(this._buff.toString());
                return;
            }
            catch (e) {
                if (e instanceof NumberFormatException_1.NumberFormatException) {
                    console.log(e.stack);
                }
                this.xLexerror("malformed number", Syntax.TK_NUMBER);
            }
        }
        /** Reads string.  Writes to semS. */
        read_string(del) {
            this.save_and_next();
            while (this._current != del) {
                switch (String.fromCharCode(this._current)) {
                    case String.fromCharCode(Syntax.EOZ): //TODO:
                        this.xLexerror("unfinished string", Syntax.TK_EOS);
                        continue; // avoid compiler warning
                    case '\n':
                    case '\r':
                        this.xLexerror("unfinished string", Syntax.TK_STRING);
                        continue; // avoid compiler warning
                    case '\\':
                        {
                            var c;
                            this.next(); // do not save the '\'
                            switch (String.fromCharCode(this._current)) {
                                case 'a':
                                    c = 7;
                                    break; // no '\a' in Java.
                                case 'b':
                                    c = '\b'.charCodeAt(0);
                                    break;
                                case 'f':
                                    c = '\f'.charCodeAt(0);
                                    break;
                                case 'n':
                                    c = '\n'.charCodeAt(0);
                                    break;
                                case 'r':
                                    c = '\r'.charCodeAt(0);
                                    break;
                                case 't':
                                    c = '\t'.charCodeAt(0);
                                    break;
                                case 'v':
                                    c = 11;
                                    break; // no '\v' in Java.
                                case '\n':
                                case '\r':
                                    this.__save('\n'.charCodeAt(0));
                                    this.inclinenumber();
                                    continue;
                                case String.fromCharCode(Syntax.EOZ):
                                    continue; // will raise an error next loop
                                default:
                                    if (!Syntax.isdigit(this._current)) {
                                        this.save_and_next(); // handles \\, \", \', \?
                                    }
                                    else // \xxx
                                     {
                                        var i = 0;
                                        c = 0;
                                        do {
                                            c = 10 * c + (this._current - '0'.charCodeAt(0));
                                            this.next();
                                        } while (++i < 3 && Syntax.isdigit(this._current));
                                        // In unicode, there are no bounds on a 3-digit decimal.
                                        this.__save(c);
                                    }
                                    continue;
                            }
                            this.__save(c);
                            this.next();
                            continue;
                        }
                    default:
                        this.save_and_next();
                }
            }
            this.save_and_next(); // skip delimiter
            var rawtoken = this._buff.toString();
            this._semS = rawtoken.substring(1, rawtoken.length - 1);
        }
        save() {
            this._buff.append(this._current);
        }
        __save(c) {
            this._buff.append(c);
        }
        save_and_next() {
            this.save();
            this.next();
        }
        /** Getter for source. */
        get source() {
            return this._source;
        }
        txtToken(tok) {
            switch (tok) {
                case Syntax.TK_NAME:
                case Syntax.TK_STRING:
                case Syntax.TK_NUMBER:
                    return this._buff.toString();
                default:
                    return Syntax.xToken2str(tok);
            }
        }
        /** Equivalent to <code>luaX_lexerror</code>. */
        xLexerror(msg, tok) {
            msg = this.source + ":" + this._linenumber + ": " + msg;
            if (tok != 0) {
                msg = msg + " near '" + this.txtToken(tok) + "'";
            }
            this._L.pushString(msg);
            this._L.dThrow(Lua_1.Lua.ERRSYNTAX);
        }
        /** Equivalent to <code>luaX_next</code>. */
        xNext() {
            this._lastline = this._linenumber;
            if (this._lookahead != Syntax.TK_EOS) // is there a look-ahead token?
             {
                this._token = this._lookahead; // Use this one,
                this._tokenR = this._lookaheadR;
                this._tokenS = this._lookaheadS;
                this._lookahead = Syntax.TK_EOS; // and discharge it.
            }
            else {
                this._token = this.llex();
                this._tokenR = this._semR;
                this._tokenS = this._semS;
            }
        }
        /** Equivalent to <code>luaX_syntaxerror</code>. */
        xSyntaxerror(msg) {
            this.xLexerror(msg, this._token);
        }
        static xToken2str(token) {
            if (token < Syntax.FIRST_RESERVED) {
                // assert token == (char)token;
                if (Syntax.iscntrl(token)) {
                    return "char(" + token + ")";
                }
                return String.fromCharCode(token);
            }
            return Syntax._tokens[token - Syntax.FIRST_RESERVED];
        }
        // From lparser.c
        static block_follow(token) {
            switch (token) {
                case Syntax.TK_ELSE:
                case Syntax.TK_ELSEIF:
                case Syntax.TK_END:
                case Syntax.TK_UNTIL:
                case Syntax.TK_EOS:
                    return true;
                default:
                    return false;
            }
        }
        check(c) {
            if (this._token != c) {
                this.error_expected(c);
            }
        }
        /**
         * @param what   the token that is intended to end the match.
         * @param who    the token that begins the match.
         * @param where  the line number of <var>what</var>.
         */
        check_match(what, who, where) {
            if (!this.testnext(what)) {
                if (where == this._linenumber) {
                    this.error_expected(what);
                }
                else {
                    this.xSyntaxerror("'" + Syntax.xToken2str(what) + "' expected (to close '" +
                        Syntax.xToken2str(who) + "' at line " + where + ")");
                }
            }
        }
        close_func() {
            this.removevars(0);
            this._fs.kRet(0, 0); // final return;
            this._fs.close();
            // :todo: check this is a valid assertion to make
            //# assert fs != fs.prev
            this._fs = this._fs.prev;
        }
        static opcode_name(op) {
            switch (op) {
                case Lua_1.Lua.OP_MOVE:
                    return "MOVE";
                case Lua_1.Lua.OP_LOADK:
                    return "LOADK";
                case Lua_1.Lua.OP_LOADBOOL:
                    return "LOADBOOL";
                case Lua_1.Lua.OP_LOADNIL:
                    return "LOADNIL";
                case Lua_1.Lua.OP_GETUPVAL:
                    return "GETUPVAL";
                case Lua_1.Lua.OP_GETGLOBAL:
                    return "GETGLOBAL";
                case Lua_1.Lua.OP_GETTABLE:
                    return "GETTABLE";
                case Lua_1.Lua.OP_SETGLOBAL:
                    return "SETGLOBAL";
                case Lua_1.Lua.OP_SETUPVAL:
                    return "SETUPVAL";
                case Lua_1.Lua.OP_SETTABLE:
                    return "SETTABLE";
                case Lua_1.Lua.OP_NEWTABLE:
                    return "NEWTABLE";
                case Lua_1.Lua.OP_SELF:
                    return "SELF";
                case Lua_1.Lua.OP_ADD:
                    return "ADD";
                case Lua_1.Lua.OP_SUB:
                    return "SUB";
                case Lua_1.Lua.OP_MUL:
                    return "MUL";
                case Lua_1.Lua.OP_DIV:
                    return "DIV";
                case Lua_1.Lua.OP_MOD:
                    return "MOD";
                case Lua_1.Lua.OP_POW:
                    return "POW";
                case Lua_1.Lua.OP_UNM:
                    return "UNM";
                case Lua_1.Lua.OP_NOT:
                    return "NOT";
                case Lua_1.Lua.OP_LEN:
                    return "LEN";
                case Lua_1.Lua.OP_CONCAT:
                    return "CONCAT";
                case Lua_1.Lua.OP_JMP:
                    return "JMP";
                case Lua_1.Lua.OP_EQ:
                    return "EQ";
                case Lua_1.Lua.OP_LT:
                    return "LT";
                case Lua_1.Lua.OP_LE:
                    return "LE";
                case Lua_1.Lua.OP_TEST:
                    return "TEST";
                case Lua_1.Lua.OP_TESTSET:
                    return "TESTSET";
                case Lua_1.Lua.OP_CALL:
                    return "CALL";
                case Lua_1.Lua.OP_TAILCALL:
                    return "TAILCALL";
                case Lua_1.Lua.OP_RETURN:
                    return "RETURN";
                case Lua_1.Lua.OP_FORLOOP:
                    return "FORLOOP";
                case Lua_1.Lua.OP_FORPREP:
                    return "FORPREP";
                case Lua_1.Lua.OP_TFORLOOP:
                    return "TFORLOOP";
                case Lua_1.Lua.OP_SETLIST:
                    return "SETLIST";
                case Lua_1.Lua.OP_CLOSE:
                    return "CLOSE";
                case Lua_1.Lua.OP_CLOSURE:
                    return "CLOSURE";
                case Lua_1.Lua.OP_VARARG:
                    return "VARARG";
                default:
                    return "??" + op;
            }
        }
        codestring(e, s) {
            e.init(Expdesc_1.Expdesc.VK, this._fs.kStringK(s));
        }
        checkname(e) {
            this.codestring(e, this.str_checkname());
        }
        enterlevel() {
            this._L.nCcalls++;
        }
        error_expected(tok) {
            this.xSyntaxerror("'" + Syntax.xToken2str(tok) + "' expected");
        }
        leavelevel() {
            this._L.nCcalls--;
        }
        /** Equivalent to luaY_parser. */
        static parser(L, _in, name) {
            var ls = new Syntax(L, _in, name);
            var fs = new FuncState_1.FuncState(ls);
            ls.open_func(fs);
            fs.f.isVararg = true;
            ls.xNext();
            ls.chunk();
            ls.check(Syntax.TK_EOS);
            ls.close_func();
            //# assert fs.prev == null
            //# assert fs.f.nups == 0
            //# assert ls.fs == null
            return fs.f;
        }
        removevars(tolevel) {
            // :todo: consider making a method in FuncState.
            while (this._fs.nactvar > tolevel) {
                this._fs.getlocvar(--this._fs.nactvar).endpc = this._fs.pc;
            }
        }
        singlevar(_var) {
            var varname = this.str_checkname();
            if (this.singlevaraux(this._fs, varname, _var, true) == Expdesc_1.Expdesc.VGLOBAL) {
                _var.info = this._fs.kStringK(varname);
            }
        }
        singlevaraux(f, n, _var, base) {
            if (f == null) // no more levels?
             {
                _var.init(Expdesc_1.Expdesc.VGLOBAL, Lua_1.Lua.NO_REG); // default is global variable
                return Expdesc_1.Expdesc.VGLOBAL;
            }
            else {
                var v = f.searchvar(n);
                if (v >= 0) {
                    _var.init(Expdesc_1.Expdesc.VLOCAL, v);
                    if (!base) {
                        f.markupval(v); // local will be used as an upval
                    }
                    return Expdesc_1.Expdesc.VLOCAL;
                }
                else // not found at current level; try upper one
                 {
                    if (this.singlevaraux(f.prev, n, _var, false) == Expdesc_1.Expdesc.VGLOBAL) {
                        return Expdesc_1.Expdesc.VGLOBAL;
                    }
                    _var.upval(this.indexupvalue(f, n, _var)); // else was LOCAL or UPVAL
                    return Expdesc_1.Expdesc.VUPVAL;
                }
            }
        }
        str_checkname() {
            this.check(Syntax.TK_NAME);
            var s = this._tokenS;
            this.xNext();
            return s;
        }
        testnext(c) {
            if (this._token == c) {
                this.xNext();
                return true;
            }
            return false;
        }
        // GRAMMAR RULES
        chunk() {
            // chunk -> { stat [';'] }
            var islast = false;
            this.enterlevel();
            while (!islast && !Syntax.block_follow(this._token)) {
                islast = this.statement();
                this.testnext(';'.charCodeAt(0));
                //# assert fs.f.maxstacksize >= fs.freereg && fs.freereg >= fs.nactvar
                this._fs.freereg = this._fs.nactvar;
            }
            this.leavelevel();
        }
        constructor_(t) {
            // constructor -> ??
            var line = this._linenumber;
            var pc = this._fs.kCodeABC(Lua_1.Lua.OP_NEWTABLE, 0, 0, 0);
            var cc = new ConsControl_1.ConsControl(t);
            t.init(Expdesc_1.Expdesc.VRELOCABLE, pc);
            cc.v.init(Expdesc_1.Expdesc.VVOID, 0); /* no value (yet) */
            this._fs.kExp2nextreg(t); /* fix it at stack top (for gc) */
            this.checknext('{'.charCodeAt(0));
            do {
                //# assert cc.v.k == Expdesc.VVOID || cc.tostore > 0
                if (this._token == '}'.charCodeAt(0))
                    break;
                this.closelistfield(cc);
                switch (String.fromCharCode(this._token)) {
                    case String.fromCharCode(Syntax.TK_NAME): /* may be listfields or recfields */
                        this.xLookahead();
                        if (this._lookahead != '='.charCodeAt(0)) /* expression? */
                            this.listfield(cc);
                        else
                            this.recfield(cc);
                        break;
                    case '[': /* constructor_item -> recfield */
                        this.recfield(cc);
                        break;
                    default: /* constructor_part -> listfield */
                        this.listfield(cc);
                        break;
                }
            } while (this.testnext(','.charCodeAt(0)) || this.testnext(';'.charCodeAt(0)));
            this.check_match('}'.charCodeAt(0), '{'.charCodeAt(0), line);
            this.lastlistfield(cc);
            var code = this._fs.f.code; //int [] 
            code[pc] = Lua_1.Lua.SETARG_B(code[pc], Syntax.oInt2fb(cc.na)); /* set initial array size */
            code[pc] = Lua_1.Lua.SETARG_C(code[pc], Syntax.oInt2fb(cc.nh)); /* set initial table size */
        }
        static oInt2fb(x) {
            var e = 0; /* exponent */
            while (x < 0 || x >= 16) {
                x = (x + 1) >>> 1;
                e++;
            }
            return (x < 8) ? x : (((e + 1) << 3) | (x - 8));
        }
        recfield(cc) {
            /* recfield -> (NAME | `['exp1`]') = exp1 */
            var reg = this._fs.freereg;
            var key = new Expdesc_1.Expdesc();
            var val = new Expdesc_1.Expdesc();
            if (this._token == Syntax.TK_NAME) {
                // yChecklimit(fs, cc.nh, MAX_INT, "items in a constructor");
                this.checkname(key);
            }
            else /* token == '[' */
                this.yindex(key);
            cc.nh++;
            this.checknext('='.charCodeAt(0));
            this._fs.kExp2RK(key);
            this.expr(val);
            this._fs.kCodeABC(Lua_1.Lua.OP_SETTABLE, cc.t.info, this._fs.kExp2RK(key), this._fs.kExp2RK(val));
            this._fs.freereg = reg; /* free registers */
        }
        lastlistfield(cc) {
            if (cc.tostore == 0)
                return;
            if (Syntax.hasmultret(cc.v.k)) {
                this._fs.kSetmultret(cc.v);
                this._fs.kSetlist(cc.t.info, cc.na, Lua_1.Lua.MULTRET);
                cc.na--; /* do not count last expression (unknown number of elements) */
            }
            else {
                if (cc.v.k != Expdesc_1.Expdesc.VVOID)
                    this._fs.kExp2nextreg(cc.v);
                this._fs.kSetlist(cc.t.info, cc.na, cc.tostore);
            }
        }
        closelistfield(cc) {
            if (cc.v.k == Expdesc_1.Expdesc.VVOID)
                return; /* there is no list item */
            this._fs.kExp2nextreg(cc.v);
            cc.v.k = Expdesc_1.Expdesc.VVOID;
            if (cc.tostore == Lua_1.Lua.LFIELDS_PER_FLUSH) {
                this._fs.kSetlist(cc.t.info, cc.na, cc.tostore); /* flush */
                cc.tostore = 0; /* no more items pending */
            }
        }
        expr(v) {
            this.subexpr(v, 0);
        }
        /** @return number of expressions in expression list. */
        explist1(v) {
            // explist1 -> expr { ',' expr }
            var n = 1; // at least one expression
            this.expr(v);
            while (this.testnext(','.charCodeAt(0))) {
                this._fs.kExp2nextreg(v);
                this.expr(v);
                ++n;
            }
            return n;
        }
        exprstat() {
            // stat -> func | assignment
            var v = new LHSAssign_1.LHSAssign();
            this.primaryexp(v.v);
            if (v.v.k == Expdesc_1.Expdesc.VCALL) // stat -> func
             {
                this._fs.setargc(v.v, 1); // call statement uses no results
            }
            else // stat -> assignment
             {
                v.prev = null;
                this.assignment(v, 1);
            }
        }
        /*
        ** check whether, in an assignment to a local variable, the local variable
        ** is needed in a previous assignment (to a table). If so, save original
        ** local value in a safe place and use this safe copy in the previous
        ** assignment.
        */
        check_conflict(lh, v) {
            var extra = this._fs.freereg; /* eventual position to save local variable */
            var conflict = false;
            for (; lh != null; lh = lh.prev) {
                if (lh.v.k == Expdesc_1.Expdesc.VINDEXED) {
                    if (lh.v.info == v.info) /* conflict? */ {
                        conflict = true;
                        lh.v.info = extra; /* previous assignment will use safe copy */
                    }
                    if (lh.v.aux == v.info) /* conflict? */ {
                        conflict = true;
                        lh.v.aux = extra; /* previous assignment will use safe copy */
                    }
                }
            }
            if (conflict) {
                this._fs.kCodeABC(Lua_1.Lua.OP_MOVE, this._fs.freereg, v.info, 0); /* make copy */
                this._fs.kReserveregs(1);
            }
        }
        assignment(lh, nvars) {
            var e = new Expdesc_1.Expdesc();
            var kind = lh.v.k;
            if (!(Expdesc_1.Expdesc.VLOCAL <= kind && kind <= Expdesc_1.Expdesc.VINDEXED))
                this.xSyntaxerror("syntax error");
            if (this.testnext(','.charCodeAt(0))) /* assignment -> `,' primaryexp assignment */ {
                var nv = new LHSAssign_1.LHSAssign();
                nv.init(lh); //TODO:
                this.primaryexp(nv.v);
                if (nv.v.k == Expdesc_1.Expdesc.VLOCAL)
                    this.check_conflict(lh, nv.v);
                this.assignment(nv, nvars + 1);
            }
            else /* assignment -> `=' explist1 */ {
                var nexps;
                this.checknext('='.charCodeAt(0));
                nexps = this.explist1(e);
                if (nexps != nvars) {
                    this.adjust_assign(nvars, nexps, e);
                    if (nexps > nvars)
                        this._fs.freereg -= nexps - nvars; /* remove extra values */
                }
                else {
                    this._fs.kSetoneret(e); /* close last expression */
                    this._fs.kStorevar(lh.v, e);
                    return; /* avoid default */
                }
            }
            e.init(Expdesc_1.Expdesc.VNONRELOC, this._fs.freereg - 1); /* default assignment */
            this._fs.kStorevar(lh.v, e);
        }
        funcargs(f) {
            var args = new Expdesc_1.Expdesc();
            var line = this._linenumber;
            switch (String.fromCharCode(this._token)) {
                case '(': // funcargs -> '(' [ explist1 ] ')'
                    if (line != this.lastline) {
                        this.xSyntaxerror("ambiguous syntax (function call x new statement)");
                    }
                    this.xNext();
                    if (this._token == ')'.charCodeAt(0)) // arg list is empty?
                     {
                        args.kind = Expdesc_1.Expdesc.VVOID;
                    }
                    else {
                        this.explist1(args);
                        this._fs.kSetmultret(args);
                    }
                    this.check_match(')'.charCodeAt(0), '('.charCodeAt(0), line);
                    break;
                case '{': // funcargs -> constructor
                    this.constructor_(args);
                    break;
                case String.fromCharCode(Syntax.TK_STRING): // funcargs -> STRING
                    this.codestring(args, this._tokenS);
                    this.xNext(); // must use tokenS before 'next'
                    break;
                default:
                    this.xSyntaxerror("function arguments expected");
                    return;
            }
            // assert (f.kind() == VNONRELOC);
            var nparams;
            var base = f.info; // base register for call
            if (args.hasmultret()) {
                nparams = Lua_1.Lua.MULTRET; // open call
            }
            else {
                if (args.kind != Expdesc_1.Expdesc.VVOID) {
                    this._fs.kExp2nextreg(args); // close last argument
                }
                nparams = this._fs.freereg - (base + 1);
            }
            f.init(Expdesc_1.Expdesc.VCALL, this._fs.kCodeABC(Lua_1.Lua.OP_CALL, base, nparams + 1, 2));
            this._fs.kFixline(line);
            this._fs.freereg = base + 1; // call removes functions and arguments
            // and leaves (unless changed) one result.
        }
        prefixexp(v) {
            // prefixexp -> NAME | '(' expr ')'
            switch (String.fromCharCode(this._token)) {
                case '(':
                    {
                        var line = this._linenumber;
                        this.xNext();
                        this.expr(v);
                        this.check_match(')'.charCodeAt(0), '('.charCodeAt(0), line);
                        this._fs.kDischargevars(v);
                        return;
                    }
                case String.fromCharCode(Syntax.TK_NAME):
                    this.singlevar(v);
                    return;
                default:
                    this.xSyntaxerror("unexpected symbol");
                    return;
            }
        }
        primaryexp(v) {
            // primaryexp ->
            //    prefixexp { '.' NAME | '[' exp ']' | ':' NAME funcargs | funcargs }
            this.prefixexp(v);
            while (true) {
                switch (String.fromCharCode(this._token)) {
                    case '.': /* field */
                        this.field(v);
                        break;
                    case '[': /* `[' exp1 `]' */
                        {
                            var key = new Expdesc_1.Expdesc();
                            this._fs.kExp2anyreg(v);
                            this.yindex(key);
                            this._fs.kIndexed(v, key);
                        }
                        break;
                    case ':': /* `:' NAME funcargs */
                        {
                            var key2 = new Expdesc_1.Expdesc();
                            this.xNext();
                            this.checkname(key2);
                            this._fs.kSelf(v, key2);
                            this.funcargs(v);
                        }
                        break;
                    case '(':
                    case String.fromCharCode(Syntax.TK_STRING):
                    case '{': // funcargs
                        this._fs.kExp2nextreg(v);
                        this.funcargs(v);
                        break;
                    default:
                        return;
                }
            }
        }
        retstat() {
            // stat -> RETURN explist
            this.xNext(); // skip RETURN
            // registers with returned values (first, nret)
            var first = 0;
            var nret;
            if (Syntax.block_follow(this._token) || this._token == ';'.charCodeAt(0)) {
                // return no values
                first = 0;
                nret = 0;
            }
            else {
                var e = new Expdesc_1.Expdesc();
                nret = this.explist1(e);
                if (Syntax.hasmultret(e.k)) {
                    this._fs.kSetmultret(e);
                    if (e.k == Expdesc_1.Expdesc.VCALL && nret == 1) /* tail call? */ {
                        this._fs.setcode(e, Lua_1.Lua.SET_OPCODE(this._fs.getcode(e), Lua_1.Lua.OP_TAILCALL));
                        //# assert Lua.ARGA(fs.getcode(e)) == fs.nactvar
                    }
                    first = this._fs.nactvar;
                    nret = Lua_1.Lua.MULTRET; /* return all values */
                }
                else {
                    if (nret == 1) // only one single value?
                     {
                        first = this._fs.kExp2anyreg(e);
                    }
                    else {
                        this._fs.kExp2nextreg(e); /* values must go to the `stack' */
                        first = this._fs.nactvar; /* return all `active' values */
                        //# assert nret == fs.freereg - first
                    }
                }
            }
            this._fs.kRet(first, nret);
        }
        simpleexp(v) {
            // simpleexp -> NUMBER | STRING | NIL | true | false | ... |
            //              constructor | FUNCTION body | primaryexp
            switch (this._token) {
                case Syntax.TK_NUMBER:
                    v.init(Expdesc_1.Expdesc.VKNUM, 0);
                    v.nval = this._tokenR;
                    break;
                case Syntax.TK_STRING:
                    this.codestring(v, this._tokenS);
                    break;
                case Syntax.TK_NIL:
                    v.init(Expdesc_1.Expdesc.VNIL, 0);
                    break;
                case Syntax.TK_TRUE:
                    v.init(Expdesc_1.Expdesc.VTRUE, 0);
                    break;
                case Syntax.TK_FALSE:
                    v.init(Expdesc_1.Expdesc.VFALSE, 0);
                    break;
                case Syntax.TK_DOTS: /* vararg */
                    if (!this._fs.f.isVararg)
                        this.xSyntaxerror("cannot use \"...\" outside a vararg function");
                    v.init(Expdesc_1.Expdesc.VVARARG, this._fs.kCodeABC(Lua_1.Lua.OP_VARARG, 0, 1, 0));
                    break;
                case '{'.charCodeAt(0): /* constructor */
                    this.constructor_(v);
                    return;
                case Syntax.TK_FUNCTION:
                    this.xNext();
                    this.body(v, false, this._linenumber);
                    return;
                default:
                    this.primaryexp(v);
                    return;
            }
            this.xNext();
        }
        statement() {
            var line = this._linenumber;
            switch (this._token) {
                case Syntax.TK_IF: // stat -> ifstat
                    this.ifstat(line);
                    return false;
                case Syntax.TK_WHILE: // stat -> whilestat
                    this.whilestat(line);
                    return false;
                case Syntax.TK_DO: // stat -> DO block END
                    this.xNext(); // skip DO
                    this.block();
                    this.check_match(Syntax.TK_END, Syntax.TK_DO, line);
                    return false;
                case Syntax.TK_FOR: // stat -> forstat
                    this.forstat(line);
                    return false;
                case Syntax.TK_REPEAT: // stat -> repeatstat
                    this.repeatstat(line);
                    return false;
                case Syntax.TK_FUNCTION:
                    this.funcstat(line); // stat -> funcstat
                    return false;
                case Syntax.TK_LOCAL: // stat -> localstat
                    this.xNext(); // skip LOCAL
                    if (this.testnext(Syntax.TK_FUNCTION)) // local function?
                        this.localfunc();
                    else
                        this.localstat();
                    return false;
                case Syntax.TK_RETURN:
                    this.retstat();
                    return true; // must be last statement
                case Syntax.TK_BREAK: // stat -> breakstat
                    this.xNext(); // skip BREAK
                    this.breakstat();
                    return true; // must be last statement
                default:
                    this.exprstat();
                    return false;
            }
        }
        /** Converts token into binary operator.  */
        static getbinopr(op) {
            switch (String.fromCharCode(op)) {
                case '+':
                    return Syntax.OPR_ADD;
                case '-':
                    return Syntax.OPR_SUB;
                case '*':
                    return Syntax.OPR_MUL;
                case '/':
                    return Syntax.OPR_DIV;
                case '%':
                    return Syntax.OPR_MOD;
                case '^':
                    return Syntax.OPR_POW;
                case String.fromCharCode(Syntax.TK_CONCAT):
                    return Syntax.OPR_CONCAT;
                case String.fromCharCode(Syntax.TK_NE):
                    return Syntax.OPR_NE;
                case String.fromCharCode(Syntax.TK_EQ):
                    return Syntax.OPR_EQ;
                case '<':
                    return Syntax.OPR_LT;
                case String.fromCharCode(Syntax.TK_LE):
                    return Syntax.OPR_LE;
                case '>':
                    return Syntax.OPR_GT;
                case String.fromCharCode(Syntax.TK_GE):
                    return Syntax.OPR_GE;
                case String.fromCharCode(Syntax.TK_AND):
                    return Syntax.OPR_AND;
                case String.fromCharCode(Syntax.TK_OR):
                    return Syntax.OPR_OR;
                default:
                    return Syntax.OPR_NOBINOPR;
            }
        }
        static getunopr(op) {
            switch (String.fromCharCode(op)) {
                case String.fromCharCode(Syntax.TK_NOT):
                    return Syntax.OPR_NOT;
                case '-':
                    return Syntax.OPR_MINUS;
                case '#':
                    return Syntax.OPR_LEN;
                default:
                    return Syntax.OPR_NOUNOPR;
            }
        }
        /**
         * Operator precedence parser.
         * <code>subexpr -> (simpleexp) | unop subexpr) { binop subexpr }</code>
         * where <var>binop</var> is any binary operator with a priority
         * higher than <var>limit</var>.
         */
        subexpr(v, limit) {
            this.enterlevel();
            var uop = Syntax.getunopr(this._token);
            if (uop != Syntax.OPR_NOUNOPR) {
                this.xNext();
                this.subexpr(v, Syntax.UNARY_PRIORITY);
                this._fs.kPrefix(uop, v);
            }
            else {
                this.simpleexp(v);
            }
            // expand while operators have priorities higher than 'limit'
            var op = Syntax.getbinopr(this._token);
            while (op != Syntax.OPR_NOBINOPR && Syntax.PRIORITY[op][0] > limit) {
                var v2 = new Expdesc_1.Expdesc();
                this.xNext();
                this._fs.kInfix(op, v);
                // read sub-expression with higher priority
                var nextop = this.subexpr(v2, Syntax.PRIORITY[op][1]);
                this._fs.kPosfix(op, v, v2);
                op = nextop;
            }
            this.leavelevel();
            return op;
        }
        enterblock(f, bl, isbreakable) {
            bl.breaklist = FuncState_1.FuncState.NO_JUMP;
            bl.isbreakable = isbreakable;
            bl.nactvar = f.nactvar;
            bl.upval = false;
            bl.previous = f.bl;
            f.bl = bl;
            //# assert f.freereg == f.nactvar
        }
        leaveblock(f) {
            var bl = f.bl;
            f.bl = bl.previous;
            this.removevars(bl.nactvar);
            if (bl.upval)
                f.kCodeABC(Lua_1.Lua.OP_CLOSE, bl.nactvar, 0, 0);
            /* loops have no body */
            //# assert (!bl.isbreakable) || (!bl.upval)
            //# assert bl.nactvar == f.nactvar
            f.freereg = f.nactvar; /* free registers */
            f.kPatchtohere(bl.breaklist);
        }
        /*
        ** {======================================================================
        ** Rules for Statements
        ** =======================================================================
        */
        block() {
            /* block -> chunk */
            var bl = new BlockCnt_1.BlockCnt();
            this.enterblock(this._fs, bl, false);
            this.chunk();
            //# assert bl.breaklist == FuncState.NO_JUMP
            this.leaveblock(this._fs);
        }
        breakstat() {
            var bl = this._fs.bl;
            var upval = false;
            while (bl != null && !bl.isbreakable) {
                //TODO:||=
                upval || (upval = bl.upval);
                bl = bl.previous;
            }
            if (bl == null)
                this.xSyntaxerror("no loop to break");
            if (upval)
                this._fs.kCodeABC(Lua_1.Lua.OP_CLOSE, bl.nactvar, 0, 0);
            bl.breaklist = this._fs.kConcat(bl.breaklist, this._fs.kJump());
        }
        funcstat(line) {
            /* funcstat -> FUNCTION funcname body */
            var b = new Expdesc_1.Expdesc();
            var v = new Expdesc_1.Expdesc();
            this.xNext(); /* skip FUNCTION */
            var needself = this.funcname(v);
            this.body(b, needself, line);
            this._fs.kStorevar(v, b);
            this._fs.kFixline(line); /* definition `happens' in the first line */
        }
        checknext(c) {
            this.check(c);
            this.xNext();
        }
        parlist() {
            /* parlist -> [ param { `,' param } ] */
            var f = this._fs.f;
            var nparams = 0;
            if (this._token != ')'.charCodeAt(0)) /* is `parlist' not empty? */ {
                do {
                    switch (this._token) {
                        case Syntax.TK_NAME: /* param -> NAME */
                            {
                                this.new_localvar(this.str_checkname(), nparams++);
                                break;
                            }
                        case Syntax.TK_DOTS: /* param -> `...' */
                            {
                                this.xNext();
                                f.isVararg = true;
                                break;
                            }
                        default:
                            this.xSyntaxerror("<name> or '...' expected");
                    }
                } while ((!f.isVararg) && this.testnext(','.charCodeAt(0)));
            }
            this.adjustlocalvars(nparams);
            f.numparams = this._fs.nactvar; /* VARARG_HASARG not now used */
            this._fs.kReserveregs(this._fs.nactvar); /* reserve register for parameters */
        }
        getlocvar(i) {
            var fstate = this._fs;
            return fstate.f.locvars[fstate.actvar[i]];
        }
        adjustlocalvars(nvars) {
            this._fs.nactvar += nvars;
            for (; nvars != 0; nvars--) {
                this.getlocvar(this._fs.nactvar - nvars).startpc = this._fs.pc;
            }
        }
        new_localvarliteral(v, n) {
            this.new_localvar(v, n);
        }
        errorlimit(limit, what) {
            var msg = this._fs.f.linedefined == 0 ?
                "main function has more than " + limit + " " + what :
                "function at line " + this._fs.f.linedefined + " has more than " + limit + " " + what;
            this.xLexerror(msg, 0);
        }
        yChecklimit(v, l, m) {
            if (v > l)
                this.errorlimit(l, m);
        }
        new_localvar(name, n) {
            this.yChecklimit(this._fs.nactvar + n + 1, Lua_1.Lua.MAXVARS, "local variables");
            this._fs.actvar[this._fs.nactvar + n] = this.registerlocalvar(name);
        }
        registerlocalvar(varname) {
            var f = this._fs.f;
            f.ensureLocvars(this._L, this._fs.nlocvars, /*Short*/ Number.MAX_SAFE_INTEGER); //TODO:
            f.locvars[this._fs.nlocvars].varname = varname;
            return this._fs.nlocvars++;
        }
        body(e, needself, line) {
            /* body ->  `(' parlist `)' chunk END */
            var new_fs = new FuncState_1.FuncState(this);
            this.open_func(new_fs);
            new_fs.f.linedefined = line;
            this.checknext('('.charCodeAt(0));
            if (needself) {
                this.new_localvarliteral("self", 0);
                this.adjustlocalvars(1);
            }
            this.parlist();
            this.checknext(')'.charCodeAt(0));
            this.chunk();
            new_fs.f.lastlinedefined = this._linenumber;
            this.check_match(Syntax.TK_END, Syntax.TK_FUNCTION, line);
            this.close_func();
            this.pushclosure(new_fs, e);
        }
        UPVAL_K(upvaldesc) {
            return (upvaldesc >>> 8) & 0xFF;
        }
        UPVAL_INFO(upvaldesc) {
            return upvaldesc & 0xFF;
        }
        UPVAL_ENCODE(k, info) {
            //# assert (k & 0xFF) == k && (info & 0xFF) == info
            return ((k & 0xFF) << 8) | (info & 0xFF);
        }
        pushclosure(func, v) {
            var f = this._fs.f;
            f.ensureProtos(this._L, this._fs.np);
            var ff = func.f;
            f.p[this._fs.np++] = ff;
            v.init(Expdesc_1.Expdesc.VRELOCABLE, this._fs.kCodeABx(Lua_1.Lua.OP_CLOSURE, 0, this._fs.np - 1));
            for (var i = 0; i < ff.nups; i++) {
                var upvalue = func.upvalues[i];
                var o = (this.UPVAL_K(upvalue) == Expdesc_1.Expdesc.VLOCAL) ? Lua_1.Lua.OP_MOVE :
                    Lua_1.Lua.OP_GETUPVAL;
                this._fs.kCodeABC(o, 0, this.UPVAL_INFO(upvalue), 0);
            }
        }
        funcname(v) {
            /* funcname -> NAME {field} [`:' NAME] */
            var needself = false;
            this.singlevar(v);
            while (this._token == '.'.charCodeAt(0))
                this.field(v);
            if (this._token == ':'.charCodeAt(0)) {
                needself = true;
                this.field(v);
            }
            return needself;
        }
        field(v) {
            /* field -> ['.' | ':'] NAME */
            var key = new Expdesc_1.Expdesc();
            this._fs.kExp2anyreg(v);
            this.xNext(); /* skip the dot or colon */
            this.checkname(key);
            this._fs.kIndexed(v, key);
        }
        repeatstat(line) {
            /* repeatstat -> REPEAT block UNTIL cond */
            var repeat_init = this._fs.kGetlabel();
            var bl1 = new BlockCnt_1.BlockCnt();
            var bl2 = new BlockCnt_1.BlockCnt();
            this.enterblock(this._fs, bl1, true); /* loop block */
            this.enterblock(this._fs, bl2, false); /* scope block */
            this.xNext(); /* skip REPEAT */
            this.chunk();
            this.check_match(Syntax.TK_UNTIL, Syntax.TK_REPEAT, line);
            var condexit = this.cond(); /* read condition (inside scope block) */
            if (!bl2.upval) /* no upvalues? */ {
                this.leaveblock(this._fs); /* finish scope */
                this._fs.kPatchlist(condexit, repeat_init); /* close the loop */
            }
            else /* complete semantics when there are upvalues */ {
                this.breakstat(); /* if condition then break */
                this._fs.kPatchtohere(condexit); /* else... */
                this.leaveblock(this._fs); /* finish scope... */
                this._fs.kPatchlist(this._fs.kJump(), repeat_init); /* and repeat */
            }
            this.leaveblock(this._fs); /* finish loop */
        }
        cond() {
            /* cond -> exp */
            var v = new Expdesc_1.Expdesc();
            this.expr(v); /* read condition */
            if (v.k == Expdesc_1.Expdesc.VNIL)
                v.k = Expdesc_1.Expdesc.VFALSE; /* `falses' are all equal here */
            this._fs.kGoiftrue(v);
            return v.f;
        }
        open_func(funcstate) {
            var f = new Proto_1.Proto(); /* registers 0/1 are always valid */
            f.init2(this.source, 2);
            funcstate.f = f;
            funcstate.ls = this;
            funcstate.L = this._L;
            funcstate.prev = this._fs; /* linked list of funcstates */
            this._fs = funcstate;
        }
        localstat() {
            /* stat -> LOCAL NAME {`,' NAME} [`=' explist1] */
            var nvars = 0;
            var nexps;
            var e = new Expdesc_1.Expdesc();
            do {
                this.new_localvar(this.str_checkname(), nvars++);
            } while (this.testnext(','.charCodeAt(0)));
            if (this.testnext('='.charCodeAt(0))) {
                nexps = this.explist1(e);
            }
            else {
                e.k = Expdesc_1.Expdesc.VVOID;
                nexps = 0;
            }
            this.adjust_assign(nvars, nexps, e);
            this.adjustlocalvars(nvars);
        }
        forstat(line) {
            /* forstat -> FOR (fornum | forlist) END */
            var bl = new BlockCnt_1.BlockCnt();
            this.enterblock(this._fs, bl, true); /* scope for loop and control variables */
            this.xNext(); /* skip `for' */
            var varname = this.str_checkname(); /* first variable name */
            switch (String.fromCharCode(this._token)) {
                case '=':
                    this.fornum(varname, line);
                    break;
                case ',':
                case String.fromCharCode(Syntax.TK_IN):
                    this.forlist(varname);
                    break;
                default:
                    this.xSyntaxerror("\"=\" or \"in\" expected");
            }
            this.check_match(Syntax.TK_END, Syntax.TK_FOR, line);
            this.leaveblock(this._fs); /* loop scope (`break' jumps to this point) */
        }
        fornum(varname, line) {
            /* fornum -> NAME = exp1,exp1[,exp1] forbody */
            var base = this._fs.freereg;
            this.new_localvarliteral("(for index)", 0);
            this.new_localvarliteral("(for limit)", 1);
            this.new_localvarliteral("(for step)", 2);
            this.new_localvar(varname, 3);
            this.checknext('='.charCodeAt(0));
            this.exp1(); /* initial value */
            this.checknext(','.charCodeAt(0));
            this.exp1(); /* limit */
            if (this.testnext(','.charCodeAt(0)))
                this.exp1(); /* optional step */
            else /* default step = 1 */ {
                this._fs.kCodeABx(Lua_1.Lua.OP_LOADK, this._fs.freereg, this._fs.kNumberK(1));
                this._fs.kReserveregs(1);
            }
            this.forbody(base, line, 1, true);
        }
        exp1() {
            var e = new Expdesc_1.Expdesc();
            this.expr(e);
            var k = e.k;
            this._fs.kExp2nextreg(e);
            return k;
        }
        forlist(indexname) {
            /* forlist -> NAME {,NAME} IN explist1 forbody */
            var e = new Expdesc_1.Expdesc();
            var nvars = 0;
            var base = this._fs.freereg;
            /* create control variables */
            this.new_localvarliteral("(for generator)", nvars++);
            this.new_localvarliteral("(for state)", nvars++);
            this.new_localvarliteral("(for control)", nvars++);
            /* create declared variables */
            this.new_localvar(indexname, nvars++);
            while (this.testnext(','.charCodeAt(0)))
                this.new_localvar(this.str_checkname(), nvars++);
            this.checknext(Syntax.TK_IN);
            var line = this._linenumber;
            this.adjust_assign(3, this.explist1(e), e);
            this._fs.kCheckstack(3); /* extra space to call generator */
            this.forbody(base, line, nvars - 3, false);
        }
        forbody(base, line, nvars, isnum) {
            /* forbody -> DO block */
            var bl = new BlockCnt_1.BlockCnt();
            this.adjustlocalvars(3); /* control variables */
            this.checknext(Syntax.TK_DO);
            var prep = isnum ? this._fs.kCodeAsBx(Lua_1.Lua.OP_FORPREP, base, FuncState_1.FuncState.NO_JUMP) : this._fs.kJump();
            this.enterblock(this._fs, bl, false); /* scope for declared variables */
            this.adjustlocalvars(nvars);
            this._fs.kReserveregs(nvars);
            this.block();
            this.leaveblock(this._fs); /* end of scope for declared variables */
            this._fs.kPatchtohere(prep);
            var endfor = isnum ?
                this._fs.kCodeAsBx(Lua_1.Lua.OP_FORLOOP, base, FuncState_1.FuncState.NO_JUMP) :
                this._fs.kCodeABC(Lua_1.Lua.OP_TFORLOOP, base, 0, nvars);
            this._fs.kFixline(line); /* pretend that `OP_FOR' starts the loop */
            this._fs.kPatchlist((isnum ? endfor : this._fs.kJump()), prep + 1);
        }
        ifstat(line) {
            /* ifstat -> IF cond THEN block {ELSEIF cond THEN block} [ELSE block] END */
            var escapelist = FuncState_1.FuncState.NO_JUMP;
            var flist = this.test_then_block(); /* IF cond THEN block */
            while (this._token == Syntax.TK_ELSEIF) {
                escapelist = this._fs.kConcat(escapelist, this._fs.kJump());
                this._fs.kPatchtohere(flist);
                flist = this.test_then_block(); /* ELSEIF cond THEN block */
            }
            if (this._token == Syntax.TK_ELSE) {
                escapelist = this._fs.kConcat(escapelist, this._fs.kJump());
                this._fs.kPatchtohere(flist);
                this.xNext(); /* skip ELSE (after patch, for correct line info) */
                this.block(); /* `else' part */
            }
            else
                escapelist = this._fs.kConcat(escapelist, flist);
            this._fs.kPatchtohere(escapelist);
            this.check_match(Syntax.TK_END, Syntax.TK_IF, line);
        }
        test_then_block() {
            /* test_then_block -> [IF | ELSEIF] cond THEN block */
            this.xNext(); /* skip IF or ELSEIF */
            var condexit = this.cond();
            this.checknext(Syntax.TK_THEN);
            this.block(); /* `then' part */
            return condexit;
        }
        whilestat(line) {
            /* whilestat -> WHILE cond DO block END */
            var bl = new BlockCnt_1.BlockCnt();
            this.xNext(); /* skip WHILE */
            var whileinit = this._fs.kGetlabel();
            var condexit = this.cond();
            this.enterblock(this._fs, bl, true);
            this.checknext(Syntax.TK_DO);
            this.block();
            this._fs.kPatchlist(this._fs.kJump(), whileinit);
            this.check_match(Syntax.TK_END, Syntax.TK_WHILE, line);
            this.leaveblock(this._fs);
            this._fs.kPatchtohere(condexit); /* false conditions finish the loop */
        }
        static hasmultret(k) {
            return k == Expdesc_1.Expdesc.VCALL || k == Expdesc_1.Expdesc.VVARARG;
        }
        adjust_assign(nvars, nexps, e) {
            var extra = nvars - nexps;
            if (Syntax.hasmultret(e.k)) {
                extra++; /* includes call itself */
                if (extra < 0)
                    extra = 0;
                this._fs.kSetreturns(e, extra); /* last exp. provides the difference */
                if (extra > 1)
                    this._fs.kReserveregs(extra - 1);
            }
            else {
                if (e.k != Expdesc_1.Expdesc.VVOID)
                    this._fs.kExp2nextreg(e); /* close last expression */
                if (extra > 0) {
                    var reg = this._fs.freereg;
                    this._fs.kReserveregs(extra);
                    this._fs.kNil(reg, extra);
                }
            }
        }
        localfunc() {
            var b = new Expdesc_1.Expdesc();
            this.new_localvar(this.str_checkname(), 0);
            var v = new Expdesc_1.Expdesc();
            v.init(Expdesc_1.Expdesc.VLOCAL, this._fs.freereg);
            this._fs.kReserveregs(1);
            this.adjustlocalvars(1);
            this.body(b, false, this._linenumber);
            this._fs.kStorevar(v, b);
            /* debug information will only see the variable after this point! */
            this._fs.getlocvar(this._fs.nactvar - 1).startpc = this._fs.pc;
        }
        yindex(v) {
            /* index -> '[' expr ']' */
            this.xNext(); /* skip the '[' */
            this.expr(v);
            this._fs.kExp2val(v);
            this.checknext(']'.charCodeAt(0));
        }
        xLookahead() {
            //# assert lookahead == TK_EOS
            this._lookahead = this.llex();
            this._lookaheadR = this._semR;
            this._lookaheadS = this._semS;
        }
        listfield(cc) {
            this.expr(cc.v);
            this.yChecklimit(cc.na, Lua_1.Lua.MAXARG_Bx, "items in a constructor");
            cc.na++;
            cc.tostore++;
        }
        indexupvalue(funcstate, name, v) {
            var f = funcstate.f;
            var oldsize = f.sizeupvalues;
            for (var i = 0; i < f.nups; i++) {
                var entry = funcstate.upvalues[i];
                if (this.UPVAL_K(entry) == v.k && this.UPVAL_INFO(entry) == v.info) {
                    //# assert name.equals(f.upvalues[i])
                    return i;
                }
            }
            /* new one */
            this.yChecklimit(f.nups + 1, Lua_1.Lua.MAXUPVALUES, "upvalues");
            f.ensureUpvals(this._L, f.nups);
            f.upvalues[f.nups] = name;
            //# assert v.k == Expdesc.VLOCAL || v.k == Expdesc.VUPVAL
            funcstate.upvalues[f.nups] = this.UPVAL_ENCODE(v.k, v.info);
            return f.nups++;
        }
        //新增
        get L() {
            return this._L;
        }
    }
    exports.Syntax = Syntax;
    /** End of File, must be -1 as that is what read() returns. */
    Syntax.EOZ = -1;
    Syntax.FIRST_RESERVED = 257;
    // WARNING: if you change the order of this enumeration,
    // grep "ORDER RESERVED"
    Syntax.TK_AND = Syntax.FIRST_RESERVED + 0;
    Syntax.TK_BREAK = Syntax.FIRST_RESERVED + 1;
    Syntax.TK_DO = Syntax.FIRST_RESERVED + 2;
    Syntax.TK_ELSE = Syntax.FIRST_RESERVED + 3;
    Syntax.TK_ELSEIF = Syntax.FIRST_RESERVED + 4;
    Syntax.TK_END = Syntax.FIRST_RESERVED + 5;
    Syntax.TK_FALSE = Syntax.FIRST_RESERVED + 6;
    Syntax.TK_FOR = Syntax.FIRST_RESERVED + 7;
    Syntax.TK_FUNCTION = Syntax.FIRST_RESERVED + 8;
    Syntax.TK_IF = Syntax.FIRST_RESERVED + 9;
    Syntax.TK_IN = Syntax.FIRST_RESERVED + 10;
    Syntax.TK_LOCAL = Syntax.FIRST_RESERVED + 11;
    Syntax.TK_NIL = Syntax.FIRST_RESERVED + 12;
    Syntax.TK_NOT = Syntax.FIRST_RESERVED + 13;
    Syntax.TK_OR = Syntax.FIRST_RESERVED + 14;
    Syntax.TK_REPEAT = Syntax.FIRST_RESERVED + 15;
    Syntax.TK_RETURN = Syntax.FIRST_RESERVED + 16;
    Syntax.TK_THEN = Syntax.FIRST_RESERVED + 17;
    Syntax.TK_TRUE = Syntax.FIRST_RESERVED + 18;
    Syntax.TK_UNTIL = Syntax.FIRST_RESERVED + 19;
    Syntax.TK_WHILE = Syntax.FIRST_RESERVED + 20;
    Syntax.TK_CONCAT = Syntax.FIRST_RESERVED + 21;
    Syntax.TK_DOTS = Syntax.FIRST_RESERVED + 22;
    Syntax.TK_EQ = Syntax.FIRST_RESERVED + 23;
    Syntax.TK_GE = Syntax.FIRST_RESERVED + 24;
    Syntax.TK_LE = Syntax.FIRST_RESERVED + 25;
    Syntax.TK_NE = Syntax.FIRST_RESERVED + 26;
    Syntax.TK_NUMBER = Syntax.FIRST_RESERVED + 27;
    Syntax.TK_NAME = Syntax.FIRST_RESERVED + 28;
    Syntax.TK_STRING = Syntax.FIRST_RESERVED + 29;
    Syntax.TK_EOS = Syntax.FIRST_RESERVED + 30;
    Syntax.NUM_RESERVED = Syntax.TK_WHILE - Syntax.FIRST_RESERVED + 1;
    /** Equivalent to luaX_tokens.  ORDER RESERVED */
    Syntax._tokens = [
        "and", "break", "do", "else", "elseif",
        "end", "false", "for", "function", "if",
        "in", "local", "nil", "not", "or", "repeat",
        "return", "then", "true", "until", "while",
        "..", "...", "==", ">=", "<=", "~=",
        "<number>", "<name>", "<string>", "<eof>"
    ];
    // grep "ORDER OPR" if you change these enums.
    // default access so that FuncState can access them.
    Syntax.OPR_ADD = 0;
    Syntax.OPR_SUB = 1;
    Syntax.OPR_MUL = 2;
    Syntax.OPR_DIV = 3;
    Syntax.OPR_MOD = 4;
    Syntax.OPR_POW = 5;
    Syntax.OPR_CONCAT = 6;
    Syntax.OPR_NE = 7;
    Syntax.OPR_EQ = 8;
    Syntax.OPR_LT = 9;
    Syntax.OPR_LE = 10;
    Syntax.OPR_GT = 11;
    Syntax.OPR_GE = 12;
    Syntax.OPR_AND = 13;
    Syntax.OPR_OR = 14;
    Syntax.OPR_NOBINOPR = 15;
    Syntax.OPR_MINUS = 0;
    Syntax.OPR_NOT = 1;
    Syntax.OPR_LEN = 2;
    Syntax.OPR_NOUNOPR = 3;
    // ORDER OPR
    /**
    * Priority table.  left-priority of an operator is
    * <code>priority[op][0]</code>, its right priority is
    * <code>priority[op][1]</code>.  Please do not modify this table.
    */
    Syntax.PRIORITY = [
        [6, 6], [6, 6], [7, 7], [7, 7], [7, 7],
        [10, 9], [5, 4],
        [3, 3], [3, 3],
        [3, 3], [3, 3], [3, 3], [3, 3],
        [2, 2], [1, 1] // logical (and/or)
    ];
    /** Priority for unary operators. */
    Syntax.UNARY_PRIORITY = 8;
});
//# sourceMappingURL=Syntax.js.map