(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Calendar", "../java/StringBuffer", "../java/SystemUtil", "../java/TimeZone", "./Lua", "./LuaJavaCallback"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OSLib = void 0;
    const Calendar_1 = require("../java/Calendar");
    const StringBuffer_1 = require("../java/StringBuffer");
    const SystemUtil_1 = require("../java/SystemUtil");
    const TimeZone_1 = require("../java/TimeZone");
    const Lua_1 = require("./Lua");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/OSLib.java#1 $
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
    // REFERENCES
    // [C1990] "ISO Standard: Programming languages - C"; ISO 9899:1990;
    //see jillcode(Java Implementation of Lua Language, Jill):
    //	http://code.google.com/p/jillcode/
    //这里的代码移植自jillcode(Lua的Java实现，Jill):
    //	http://code.google.com/p/jillcode/	
    /**
     * The OS Library.  Can be opened into a {@link Lua} state by invoking
     * the {@link #open} method.
     */
    class OSLib extends LuaJavaCallback_1.LuaJavaCallback {
        /** Constructs instance, filling in the 'which' member. */
        constructor(which) {
            super();
            this._which = which;
        }
        /**
         * Implements all of the functions in the Lua os library (that are
         * provided).  Do not call directly.
         * @param L  the Lua state in which to execute.
         * @return number of returned parameters, as per convention.
         */
        luaFunction(L) {
            switch (this._which) {
                case OSLib.CLOCK:
                    return OSLib.clock(L);
                case OSLib.DATE:
                    return OSLib.date(L);
                case OSLib.DIFFTIME:
                    return OSLib.difftime(L);
                case OSLib.GETENV:
                    return OSLib.getenv(L);
                case OSLib.SETLOCALE:
                    return OSLib.setlocale(L);
                case OSLib.TIME:
                    return OSLib.time(L);
            }
            return 0;
        }
        /**
         * Opens the library into the given Lua state.  This registers
         * the symbols of the library in the table "os".
         * @param L  The Lua state into which to open.
         */
        static open(L) {
            L.__register("os");
            OSLib.r(L, "clock", OSLib.CLOCK);
            OSLib.r(L, "date", OSLib.DATE);
            OSLib.r(L, "difftime", OSLib.DIFFTIME);
            OSLib.r(L, "getenv", OSLib.GETENV);
            OSLib.r(L, "setlocale", OSLib.SETLOCALE);
            OSLib.r(L, "time", OSLib.TIME);
        }
        /** Register a function. */
        static r(L, name, which) {
            var f = new OSLib(which);
            var lib = L.getGlobal("os");
            L.setField(lib, name, f);
        }
        /** Implements clock.  Java provides no way to get CPU time, so we
         * return the amount of wall clock time since this class was loaded.
         */
        static clock(L) {
            var d = SystemUtil_1.SystemUtil.currentTimeMillis();
            d = d - OSLib.T0;
            d /= 1000;
            L.pushNumber(d);
            return 1;
        }
        /** Implements date. */
        static date(L) {
            var t;
            if (L.isNoneOrNil(2)) {
                t = SystemUtil_1.SystemUtil.currentTimeMillis();
            }
            else {
                t = L.checkNumber(2);
            }
            var s = L.optString(1, "%c");
            var tz = TimeZone_1.TimeZone.getDefault();
            if (s.substr(0, 1) == "!") {
                tz = TimeZone_1.TimeZone.getTimeZone("GMT");
                s = s.substring(1);
            }
            var c = Calendar_1.Calendar.getInstance(tz);
            c.setTime(new Date(t));
            if (s == "*t") {
                L.pushObject(L.createTable(0, 8)); // 8 = number of fields
                OSLib.setfield(L, "sec", c._get(Calendar_1.Calendar.SECOND));
                OSLib.setfield(L, "min", c._get(Calendar_1.Calendar.MINUTE));
                OSLib.setfield(L, "hour", c._get(Calendar_1.Calendar.HOUR));
                OSLib.setfield(L, "day", c._get(Calendar_1.Calendar.DAY_OF_MONTH));
                OSLib.setfield(L, "month", OSLib.canonicalmonth(c._get(Calendar_1.Calendar.MONTH)));
                OSLib.setfield(L, "year", c._get(Calendar_1.Calendar.YEAR));
                OSLib.setfield(L, "wday", OSLib.canonicalweekday(c._get(Calendar_1.Calendar.DAY_OF_WEEK)));
                // yday is not supported because CLDC 1.1 does not provide it.
                // setfield(L, "yday", c.get("???"));
                if (tz.useDaylightTime()) {
                    // CLDC 1.1 does not provide any way to determine isdst, so we set
                    // it to -1 (which in C means that the information is not
                    // available).
                    OSLib.setfield(L, "isdst", -1);
                }
                else {
                    // On the other hand if the timezone does not do DST then it
                    // can't be in effect.
                    OSLib.setfield(L, "isdst", 0);
                }
            }
            else {
                var b = new StringBuffer_1.StringBuffer();
                var i = 0;
                var l = s.length;
                while (i < l) {
                    var ch = s.charCodeAt(i);
                    ++i;
                    if (ch != '%'.charCodeAt(0)) {
                        b.append(ch);
                        continue;
                    }
                    if (i >= l) {
                        break;
                    }
                    ch = s.charCodeAt(i);
                    ++i;
                    // Generally in order to save space, the abbreviated forms are
                    // identical to the long forms.
                    // The specifiers are from [C1990].
                    switch (String.fromCharCode(ch)) {
                        case 'a':
                        case 'A':
                            b.appendString(OSLib.weekdayname(c));
                            break;
                        case 'b':
                        case 'B':
                            b.appendString(OSLib.monthname(c));
                            break;
                        case 'c':
                            b.appendString(c.getTime().toString());
                            break;
                        case 'd':
                            b.appendString(OSLib.format(c._get(Calendar_1.Calendar.DAY_OF_MONTH), 2));
                            break;
                        case 'H':
                            b.appendString(OSLib.format(c._get(Calendar_1.Calendar.HOUR), 2));
                            break;
                        case 'I':
                            {
                                var h = c._get(Calendar_1.Calendar.HOUR);
                                h = (h + 11) % 12 + 1; // force into range 1-12
                                b.appendString(OSLib.format(h, 2));
                            }
                            break;
                        case 'j':
                        case 'U':
                        case 'W':
                            // Not supported because CLDC 1.1 doesn't provide it.
                            b.append('%'.charCodeAt(0));
                            b.append(ch);
                            break;
                        case 'm':
                            {
                                var m = OSLib.canonicalmonth(c._get(Calendar_1.Calendar.MONTH));
                                b.appendString(OSLib.format(m, 2));
                            }
                            break;
                        case 'M':
                            b.appendString(OSLib.format(c._get(Calendar_1.Calendar.MINUTE), 2));
                            break;
                        case 'p':
                            {
                                var h2 = c._get(Calendar_1.Calendar.HOUR);
                                b.appendString(h2 < 12 ? "am" : "pm");
                            }
                            break;
                        case 'S':
                            b.appendString(OSLib.format(c._get(Calendar_1.Calendar.SECOND), 2));
                            break;
                        case 'w':
                            b.append(OSLib.canonicalweekday(c._get(Calendar_1.Calendar.DAY_OF_WEEK)));
                            break;
                        case 'x':
                            {
                                var u = c.getTime().toString();
                                // We extract fields from the result of Date.toString.
                                // The output of which is of the form:
                                // dow mon dd hh:mm:ss zzz yyyy
                                // except that zzz is optional.
                                b.appendString(u.substring(0, 11));
                                b.append(c._get(Calendar_1.Calendar.YEAR));
                            }
                            break;
                        case 'X':
                            {
                                var u2 = c.getTime().toString();
                                b.appendString(u2.substring(11, u2.length - 5));
                            }
                            break;
                        case 'y':
                            b.appendString(OSLib.format(c._get(Calendar_1.Calendar.YEAR) % 100, 2));
                            break;
                        case 'Y':
                            b.append(c._get(Calendar_1.Calendar.YEAR));
                            break;
                        case 'Z':
                            b.appendString(tz.getID());
                            break;
                        case '%':
                            b.append('%'.charCodeAt(0));
                            break;
                    }
                } /* while */
                L.pushString(b.toString());
            }
            return 1;
        }
        /** Implements difftime. */
        static difftime(L) {
            L.pushNumber((L.checkNumber(1) - L.optNumber(2, 0)) / 1000);
            return 1;
        }
        /** Implements setlocale. */
        static setlocale(L) {
            if (L.isNoneOrNil(1)) {
                L.pushString("");
            }
            else {
                L.pushNil();
            }
            return 1;
        }
        /** Implements time. */
        static time(L) {
            if (L.isNoneOrNil(1)) // called without args?
             {
                L.pushNumber(SystemUtil_1.SystemUtil.currentTimeMillis());
                return 1;
            }
            L.checkType(1, Lua_1.Lua.TTABLE);
            L.setTop(1); // make sure table is at the top
            var c = Calendar_1.Calendar.getInstance();
            c._set(Calendar_1.Calendar.SECOND, OSLib.getfield(L, "sec", 0));
            c._set(Calendar_1.Calendar.MINUTE, OSLib.getfield(L, "min", 0));
            c._set(Calendar_1.Calendar.HOUR, OSLib.getfield(L, "hour", 12));
            c._set(Calendar_1.Calendar.DAY_OF_MONTH, OSLib.getfield(L, "day", -1));
            c._set(Calendar_1.Calendar.MONTH, OSLib.MONTH[OSLib.getfield(L, "month", -1) - 1]);
            c._set(Calendar_1.Calendar.YEAR, OSLib.getfield(L, "year", -1));
            // ignore isdst field
            L.pushNumber(c.getTime().getTime());
            return 1;
        }
        static getfield(L, key, d) {
            var o = L.getField(L.value(-1), key);
            if (Lua_1.Lua.isNumber(o))
                return L.toNumber(o);
            if (d < 0)
                return L.error("field '" + key + "' missing in date table");
            return d;
        }
        static setfield(L, key, value) {
            L.setField(L.value(-1), key, Lua_1.Lua.valueOfNumber(value));
        }
        /** Format a positive integer in a 0-filled field of width
         * <var>w</var>.
         */
        static format(i, w) {
            var b = new StringBuffer_1.StringBuffer();
            b.append(i);
            while (b.length() < w) {
                b.insert(0, '0'.charCodeAt(0));
            }
            return b.toString();
        }
        static weekdayname(c) {
            var s = c.getTime().toString();
            return s.substring(0, 3);
        }
        static monthname(c) {
            var s = c.getTime().toString();
            return s.substring(4, 7);
        }
        /**
         * (almost) inverts the conversion provided by {@link #MONTH}.  Converts
         * from a {@link Calendar} value to a month in the range 1-12.
         * @param m  a value from the enum Calendar.JANUARY, Calendar.FEBRUARY, etc
         * @return a month in the range 1-12, or the original value.
         */
        static canonicalmonth(m) {
            for (var i = 0; i < OSLib.MONTH.length; ++i) {
                if (m == OSLib.MONTH[i]) {
                    return i + 1;
                }
            }
            return m;
        }
        /**
         * Converts from a {@link Calendar} value to a weekday in the range
         * 0-6 where 0 is Sunday (as per the convention used in [C1990]).
         * @param w  a value from the enum Calendar.SUNDAY, Calendar.MONDAY, etc
         * @return a weekday in the range 0-6, or the original value.
         */
        static canonicalweekday(w) {
            for (var i = 0; i < OSLib.WEEKDAY.length; ++i) {
                if (w == OSLib.WEEKDAY[i]) {
                    return i;
                }
            }
            return w;
        }
        //FIXME:not implemented
        static getenv(L) {
            var name = L.checkString(1);
            //FIXME:
            var value = null;
            if (value == null) {
                L.pushNil();
            }
            else {
                L.pushString(value);
            }
            return 1;
        }
    }
    exports.OSLib = OSLib;
    // Each function in the library corresponds to an instance of
    // this class which is associated (the 'which' member) with an integer
    // which is unique within this class.  They are taken from the following
    // set.
    OSLib.CLOCK = 1;
    OSLib.DATE = 2;
    OSLib.DIFFTIME = 3;
    // EXECUTE = 4;
    // EXIT = 5;
    OSLib.GETENV = 6;
    // REMOVE = 7;
    // RENAME = 8;
    OSLib.SETLOCALE = 9;
    OSLib.TIME = 10;
    OSLib.T0 = SystemUtil_1.SystemUtil.currentTimeMillis();
    // Incredibly, the spec doesn't give a numeric value and range for
    // Calendar.JANUARY through to Calendar.DECEMBER.
    /**
     * Converts from 0-11 to required Calendar value.  DO NOT MODIFY THIS
     * ARRAY.
     */
    OSLib.MONTH = [
        Calendar_1.Calendar.JANUARY,
        Calendar_1.Calendar.FEBRUARY,
        Calendar_1.Calendar.MARCH,
        Calendar_1.Calendar.APRIL,
        Calendar_1.Calendar.MAY,
        Calendar_1.Calendar.JUNE,
        Calendar_1.Calendar.JULY,
        Calendar_1.Calendar.AUGUST,
        Calendar_1.Calendar.SEPTEMBER,
        Calendar_1.Calendar.OCTOBER,
        Calendar_1.Calendar.NOVEMBER,
        Calendar_1.Calendar.DECEMBER
    ];
    // DO NOT MODIFY ARRAY
    OSLib.WEEKDAY = [
        Calendar_1.Calendar.SUNDAY,
        Calendar_1.Calendar.MONDAY,
        Calendar_1.Calendar.TUESDAY,
        Calendar_1.Calendar.WEDNESDAY,
        Calendar_1.Calendar.THURSDAY,
        Calendar_1.Calendar.FRIDAY,
        Calendar_1.Calendar.SATURDAY,
    ];
});
//# sourceMappingURL=OSLib.js.map