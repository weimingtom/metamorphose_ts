(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./lua/Lua", "./lua/PackageLib", "./lua/MathLib", "./lua/BaseLib", "./lua/OSLib", "./lua/TableLib", "./lua/StringLib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Lua_1 = require("./lua/Lua");
    const PackageLib_1 = require("./lua/PackageLib");
    const MathLib_1 = require("./lua/MathLib");
    const BaseLib_1 = require("./lua/BaseLib");
    const OSLib_1 = require("./lua/OSLib");
    const TableLib_1 = require("./lua/TableLib");
    const StringLib_1 = require("./lua/StringLib");
    function trace(s) {
        if (typeof document !== 'undefined' && document) {
            document.write(s.replace(/\n/g, '<br>'));
            document.write('<br>');
        }
        console.log(s);
    }
    var test001 = "n = 99 + (1 * 10) / 2 - 0.5;\n" +
        "if n > 10 then return 'Oh, 真的比10还大哦:'..n end\n" +
        "return n\n";
    var test002 = "return _VERSION";
    var test003 = "return nil";
    var isLoadLib = true;
    //try {
    trace("Start test...");
    var L = new Lua_1.Lua();
    if (isLoadLib) {
        BaseLib_1.BaseLib.open(L);
        PackageLib_1.PackageLib.open(L);
        MathLib_1.MathLib.open(L);
        OSLib_1.OSLib.open(L);
        StringLib_1.StringLib.open(L);
        TableLib_1.TableLib.open(L);
        isLoadLib = false;
    }
    L.setTop(0);
    var status = L.doString(test003);
    if (status != 0) {
        var errObj = L.value(1);
        var tostring = L.getGlobal("tostring");
        L.pushObject(tostring);
        L.pushObject(errObj);
        L.call(1, 1);
        var errObjStr = L.toString_(L.value(-1));
        throw new Error("Error compiling : " + L.value(1));
    }
    else {
        var result = L.value(1);
        var tostring_ = L.getGlobal("tostring");
        L.pushObject(tostring_);
        L.pushObject(result);
        L.call(1, 1); // call BaseLib.tostring = function() {...}
        var resultStr = L.toString_(L.value(-1));
        trace("Result >>> " + resultStr);
    }
});
//} catch (e) {
//    //trace(e.getStackTrace()); //FIXME:
//    trace(e.stack);
//}

},{"./lua/BaseLib":29,"./lua/Lua":45,"./lua/MathLib":53,"./lua/OSLib":54,"./lua/PackageLib":55,"./lua/StringLib":58,"./lua/TableLib":61}],2:[function(require,module,exports){
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
    exports.ByteArray = void 0;
    class ByteArray {
        get length() {
            this.throwError("ByteArray.length not implement");
            return 0;
        }
        constructor() {
            //FIXME:
        }
        clear() {
            //TODO:
            this.throwError("ByteArray.clear() not implement");
        }
        //b:number[]
        writeBytes(b, off, len) {
            //TODO:
            this.throwError("ByteArray.writeBytes() not implement");
        }
        writeByte(x) {
            //TODO:
            this.throwError("ByteArray.writeByte() not implement");
        }
        setByIndex(index, val) {
            this.throwError("ByteArray.setByIndex() not implement");
        }
        writeUTFBytes(x) {
            this.throwError("ByteArray.writeUTFBytes() not implement");
        }
        get(x) {
            this.throwError("ByteArray.get() not implement");
            return 0;
        }
        readUTFBytes(a) {
            this.throwError("ByteArray.readUTFBytes() not implement");
            return "";
        }
        readByte() {
            this.throwError("ByteArray.readByte() not implement");
            return 0;
        }
        throwError(str) {
            console.log(str);
            throw new Error(str);
        }
    }
    exports.ByteArray = ByteArray;
});

},{}],3:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ByteArray", "./OutputStream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ByteArrayOutputStream = void 0;
    const ByteArray_1 = require("./ByteArray");
    const OutputStream_1 = require("./OutputStream");
    class ByteArrayOutputStream extends OutputStream_1.OutputStream {
        constructor() {
            super();
            this._bytes = new ByteArray_1.ByteArray();
        }
        toByteArray() {
            return this._bytes;
        }
        close() {
            this._bytes.clear();
        }
        flush() {
        }
        //FIXME:number[]
        write(b) {
            this._bytes.writeBytes(b);
        }
        //FIXME:number[]
        writeBytes(b, off, len) {
            this._bytes.writeBytes(b, off, len);
        }
        //TODO: 这个方法有待修改
        //Writes a char to the underlying output stream as a 2-byte value, high byte first
        writeChar(b) {
            // var bytes:ByteArray = new ByteArray();
            // bytes.writeMultiByte(String.fromCharCode(b), "");
            // this._bytes.writeBytes(bytes);
            this._bytes.writeByte(b);
        }
    }
    exports.ByteArrayOutputStream = ByteArrayOutputStream;
});

},{"./ByteArray":2,"./OutputStream":19}],4:[function(require,module,exports){
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
    exports.Calendar = void 0;
    class Calendar {
        constructor() {
            this._date = null;
        }
        _get(field) {
            switch (field) {
                case Calendar.SECOND:
                    return this._date.getSeconds();
                case Calendar.MINUTE:
                    return this._date.getMinutes();
                case Calendar.HOUR:
                    return this._date.getHours();
                case Calendar.MONTH:
                    return this._date.getMonth();
                case Calendar.YEAR:
                    return this._date.getFullYear();
                case Calendar.DAY_OF_WEEK:
                    console.log("DAY_OF_WEEK not implement");
                    return 0;
                case Calendar.DAY_OF_MONTH:
                    return this._date.getDay();
            }
            console.log("Calendar._get(): field not implement");
            return 0;
        }
        _set(field, value) {
            var _a, _b, _c, _d, _e;
            switch (field) {
                case Calendar.SECOND:
                    (_a = this._date) === null || _a === void 0 ? void 0 : _a.setSeconds(value);
                    return;
                case Calendar.MINUTE:
                    (_b = this._date) === null || _b === void 0 ? void 0 : _b.setMinutes(value);
                    return;
                case Calendar.HOUR:
                    (_c = this._date) === null || _c === void 0 ? void 0 : _c.setHours(value);
                    return;
                case Calendar.MONTH:
                    (_d = this._date) === null || _d === void 0 ? void 0 : _d.setMonth(value);
                    return;
                case Calendar.YEAR:
                    (_e = this._date) === null || _e === void 0 ? void 0 : _e.setFullYear(value);
                    return;
            }
            console.log("Calendar._set(): field not implement");
        }
        static getInstance(tz) {
            return Calendar._instance;
        }
        setTime(d) {
            this._date = d;
        }
        getTime() {
            return this._date;
        }
    }
    exports.Calendar = Calendar;
    Calendar.SECOND = 1;
    Calendar.MINUTE = 2;
    Calendar.HOUR = 3;
    Calendar.DAY_OF_MONTH = 4;
    Calendar.MONTH = 5;
    Calendar.YEAR = 6;
    Calendar.DAY_OF_WEEK = 7;
    Calendar.SUNDAY = 8;
    Calendar.MONDAY = 9;
    Calendar.TUESDAY = 10;
    Calendar.WEDNESDAY = 11;
    Calendar.THURSDAY = 12;
    Calendar.FRIDAY = 13;
    Calendar.SATURDAY = 14;
    Calendar.JANUARY = 15;
    Calendar.FEBRUARY = 16;
    Calendar.MARCH = 17;
    Calendar.APRIL = 18;
    Calendar.MAY = 19;
    Calendar.JUNE = 20;
    Calendar.JULY = 21;
    Calendar.AUGUST = 22;
    Calendar.SEPTEMBER = 23;
    Calendar.OCTOBER = 24;
    Calendar.NOVEMBER = 25;
    Calendar.DECEMBER = 26;
    Calendar._instance = new Calendar();
});

},{}],5:[function(require,module,exports){
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
    exports.Character = void 0;
    // 注意：Character.toString用String.fromCharCode()代替
    class Character {
        static isUpperCase(ch) {
            return ch >= 'A'.charCodeAt(0) && ch <= 'Z'.charCodeAt(0);
        }
        static isLowerCase(ch) {
            return ch >= 'a'.charCodeAt(0) && ch <= 'z'.charCodeAt(0);
        }
        static isDigit(ch) {
            return ch >= '0'.charCodeAt(0) && ch <= '9'.charCodeAt(0);
        }
        static toLowerCase(ch) {
            return String.fromCharCode(ch).toLowerCase();
        }
    }
    exports.Character = Character;
});

},{}],6:[function(require,module,exports){
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
    exports.DataOutputStream = void 0;
    /**
     * 数据输出流允许应用程序以适当方式将基本 Java 数据类型写入输出流中。
     * 然后，应用程序可以使用数据输入流将数据读入。
     *
     * 封装构造函数中的OutputStream，而这个类的特点是统计了写入字节数。
     * 实现这个类，基本上只用writeByte处理
     */
    /**
     * 实际传入的是 ByteArrayOutputStream，见StringLib
     */
    class DataOutputStream {
        constructor(writer) {
            this.written = 0;
            this.written = 0;
            this._writer = writer;
        }
        flush() {
            this._writer.flush();
        }
        //FIXME: not used
        size() {
            return this.written;
        }
        //FIXME:number[]
        write(b, off, len) {
            if (off === undefined) {
                off = 0;
            }
            if (len === undefined) {
                len = 0;
            }
            // var bytes = new ByteArray();
            // bytes.writeBytes(b, off, len);
            // this._writer!.write(bytes);
            //this.written += bytes.length;   
            this._writer.writeBytes(b, off, len);
            this.written += len;
        }
        //public write(b:int):void
        //{
        //	
        //}
        writeBoolean(v) {
            this.throwError("DataOutputStream.writeBoolean() not implement");
            // var bytes = new ByteArray();
            // bytes.writeBoolean(v);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        writeByte(v) {
            this.throwError("DataOutputStream.writeByte() not implement");
            // //???
            // //this._writer.writeChar(v);
            // var bytes = new ByteArray();
            // bytes.writeByte(v);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        writeBytes(s) {
            this.throwError("DataOutputStream.writeBytes() not implement");
            // var bytes = new ByteArray();
            // bytes.writeMultiByte(s, "");
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        //TODO: 这个方法有待修改
        writeChar(v) {
            this.throwError("DataOutputStream.writeChar() not implement");
            // var bytes = new ByteArray();
            // bytes.writeMultiByte(String.fromCharCode(v), "");
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        //TODO: 这个方法有待修改
        writeChars(s) {
            this.throwError("DataOutputStream.writeChars() not implement");
            // var bytes = new ByteArray();
            // bytes.writeMultiByte(s, "");
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        writeDouble(v) {
            this.throwError("DataOutputStream.writeDouble() not implement");
            // var bytes = new ByteArray();
            // bytes.writeDouble(v);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        writeFloat(v) {
            this.throwError("DataOutputStream.writeFloat() not implement");
            // var bytes = new ByteArray();
            // bytes.writeFloat(v);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        writeInt(v) {
            this.throwError("DataOutputStream.writeInt() not implement");
            // var bytes = new ByteArray();
            // bytes.writeInt(v);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        //这里可能有问题
        writeLong(v) {
            this.throwError("DataOutputStream.writeLong() not implement");
            // var bytes = new ByteArray();
            // bytes.writeInt(v);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        writeShort(v) {
            this.throwError("DataOutputStream.writeShort() not implement");
            // var bytes = new ByteArray();
            // bytes.writeShort(v);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        writeUTF(str) {
            this.throwError("DataOutputStream.writeUTF() not implement");
            // var bytes = new ByteArray();
            // bytes.writeUTFBytes(str);
            // this._writer.write(bytes);
            // this.written += bytes.length;
        }
        throwError(str) {
            console.log(str);
            throw new Error(str);
        }
    }
    exports.DataOutputStream = DataOutputStream;
});

},{}],7:[function(require,module,exports){
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
    exports.EOFException = void 0;
    class EOFException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(this.message).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.EOFException = EOFException;
});

},{}],8:[function(require,module,exports){
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
    exports.Enumeration = void 0;
    class Enumeration {
        hasMoreElements() {
            return false;
        }
        nextElement() {
            return null;
        }
    }
    exports.Enumeration = Enumeration;
});

},{}],9:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./HashtableEnum"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Hashtable = void 0;
    const HashtableEnum_1 = require("./HashtableEnum");
    class Hashtable {
        constructor(initialCapacity) {
            if (initialCapacity === undefined) {
                initialCapacity = 11;
            }
            //Dictionary支持用Object作为键，而Array会对键进行toString的转换
            this._dic = new Map();
        }
        rehash() {
        }
        keys() {
            var enum_ = new HashtableEnum_1.HashtableEnum();
            var arr = new Array();
            for (var key in this._dic) {
                arr.push(key);
            }
            enum_.setArr(arr);
            return enum_;
        }
        _get(key) {
            //    if (typeof this._dic === 'undefined') {
            //        console.log('here');
            //    }
            return this._dic.get(key);
        }
        put(key, value) {
            //    if (typeof this._dic === 'undefined') {
            //        console.log('here');
            //    }
            var pre = this._dic.get(key);
            this._dic.set(key, value);
            return pre;
        }
        remove(key) {
            var pre = null;
            if (this._dic.get(key)) {
                pre = this._dic.get(key);
                this._dic.set(key, null);
                // delete this._dic[key];
                this._dic.delete(key);
            }
            return pre;
        }
    }
    exports.Hashtable = Hashtable;
});

},{"./HashtableEnum":10}],10:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Enumeration"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashtableEnum = void 0;
    const Enumeration_1 = require("./Enumeration");
    // 注意：这个类不应该由Hashtable以外的类创建
    class HashtableEnum extends Enumeration_1.Enumeration {
        constructor() {
            super();
            this._arr = null;
            this._idx = 0;
            this._len = 0;
            this._arr = null;
            this._idx = 0;
            this._len = 0;
        }
        hasMoreElements() {
            return this._idx < this._len;
        }
        nextElement() {
            return this._arr[this._idx++];
        }
        //注意：仅暴露给Hashtable使用的方法
        setArr(arr) {
            if (arr != null) {
                this._arr = arr;
                this._idx = 0;
                this._len = this._arr.length;
            }
        }
    }
    exports.HashtableEnum = HashtableEnum;
});

},{"./Enumeration":8}],11:[function(require,module,exports){
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
    exports.IOException = void 0;
    class IOException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(this.message).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.IOException = IOException;
});

},{}],12:[function(require,module,exports){
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
    exports.IllegalArgumentException = void 0;
    class IllegalArgumentException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(this.message).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.IllegalArgumentException = IllegalArgumentException;
});

},{}],13:[function(require,module,exports){
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
    exports.InputStream = void 0;
    /**
     *
     * 此抽象类是表示字节输入流的所有类的超类。
     * 需要定义 InputStream 的子类的应用程序
     * 必须始终提供返回下一个输入字节的方法。
     *
     */
    class InputStream {
        //FIXME: number[]->ByteArray
        readBytes(b) {
            this.throwError("InputStream.readBytes() not implement");
            return 0;
        }
        // 从输入流读取下一个数据字节。
        read() {
            this.throwError("InputStream.readChar() not implement");
            return 0;
        }
        reset() {
            this.throwError("InputStream.reset() not implement");
        }
        mark(readahead) {
            this.throwError("InputStream.mark() not implement");
        }
        markSupported() {
            this.throwError("InputStream.markSupported() not implement");
            return false;
        }
        close() {
            this.throwError("InputStream.close() not implement");
        }
        available() {
            this.throwError("InputStream.available() not implement");
            return 0;
        }
        skip(n) {
            this.throwError("InputStream.skip() not implement");
            return 0;
        }
        readMultiBytes(bytes, off, len) {
            this.throwError("InputStream.readBytes() not implement");
            return 0;
        }
        throwError(str) {
            console.log(str);
            throw new Error(str);
        }
    }
    exports.InputStream = InputStream;
});

},{}],14:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Reader"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputStreamReader = void 0;
    const Reader_1 = require("./Reader");
    /**
     *	用于读取字符流的抽象类。
     *	子类必须实现的方法只有 read(char[], int, int) 和 close()。
     *	但是，多数子类将重写此处定义的一些方法，
     *	以提供更高的效率和/或其他功能。
     */
    /**
     *  InputStreamReader 是字节流通向字符流的桥梁：
     * 	它使用指定的 charset 读取字节并将其解码为字符。
     * 	它使用的字符集可以由名称指定或显式给定，
     * 	否则可能接受平台默认的字符集。
     * 	每次调用 InputStreamReader 中的一个 read() 方法都会导致从基础输入流读取一个或多个字节。
     * 	要启用从字节到字符的有效转换，可以提前从基础流读取更多的字节，
     * 	使其超过满足当前读取操作所需的字节。
     * 	为了达到最高效率，可要考虑在 BufferedReader 内包装 InputStreamReader。
     */
    //见LuaInternal，创建一个带字符集（UTF8）的读出器
    //i可能是DumpedInput
    //charsetName可能是"UTF8"
    class InputStreamReader extends Reader_1.Reader {
        constructor(i, charsetName) {
            super();
            this._i = i;
            this._charsetName = charsetName;
        }
        close() {
            this._i.close();
        }
        mark(readAheadLimit) {
            this._i.mark(readAheadLimit);
        }
        markSupported() {
            return this._i.markSupported();
        }
        read() {
            return this._i.read();
        }
        readBytes(cbuf) {
            return this._i.readBytes(cbuf);
        }
        //本工程未使用
        readMultiBytes(cbuf, off, len) {
            return this._i.readMultiBytes(cbuf, off, len);
        }
        //TODO:?
        ready() {
            return true;
        }
        reset() {
            this._i.reset();
        }
        // 本工程未使用
        skip(n) {
            return this._i.skip(n);
        }
    }
    exports.InputStreamReader = InputStreamReader;
});

},{"./Reader":22}],15:[function(require,module,exports){
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
    exports.MathUtil = void 0;
    //see http://codesnipp.it/code/939
    class MathUtil {
        // 弧度转换为角度
        // convert radians to degrees  
        static toDegrees(rad) {
            return (rad / 180 * Math.PI);
        }
        // convert degrees to radians  
        // 角度转换为弧度
        static toRadians(deg) {
            return (deg * Math.PI / 180);
        }
    }
    exports.MathUtil = MathUtil;
});

},{}],16:[function(require,module,exports){
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
    exports.NullPointerException = void 0;
    class NullPointerException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(this.message).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.NullPointerException = NullPointerException;
});

},{}],17:[function(require,module,exports){
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
    exports.NumberFormatException = void 0;
    class NumberFormatException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(this.message).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.NumberFormatException = NumberFormatException;
});

},{}],18:[function(require,module,exports){
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
    exports.OutOfMemoryError = void 0;
    class OutOfMemoryError extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(this.message).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.OutOfMemoryError = OutOfMemoryError;
});

},{}],19:[function(require,module,exports){
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
    exports.OutputStream = void 0;
    /**
     * 此抽象类是表示输出字节流的所有类的超类。
     * 输出流接受输出字节并将这些字节发送到某个接收器。
     * 需要定义 OutputStream 子类的应用程序必须始终提供
     * 至少一种可写入一个输出字节的方法。
     *
     * 这个类不应该实例化
     * 略加修改，让所有写方法都可以返回写入字节数
     */
    class OutputStream {
        constructor() {
        }
        //FIXME: not used
        close() {
            this.throwError("OutputStream.close() not implement");
        }
        //FIXME: not used
        flush() {
            this.throwError("OutputStream.flush() not implement");
        }
        //FIXME: not used //FIXME:
        write(b) {
            this.throwError("OutputStream.write() not implement");
        }
        //FIXME: not used //number[]
        writeBytes(b, off, len) {
            this.throwError("OutputStream.writeBytes() not implement");
        }
        //FIXME: not used
        writeChar(b) {
            this.throwError("OutputStream.writeChar() not implement");
        }
        //FIXME: not used
        throwError(str) {
            console.log(str);
            throw new Error(str);
        }
    }
    exports.OutputStream = OutputStream;
});

},{}],20:[function(require,module,exports){
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
    exports.PrintStream = void 0;
    class PrintStream {
        constructor() {
            PrintStream.init();
        }
        static init() {
            PrintStream.OutputArr = new Array();
            PrintStream.OutputArr.push("");
        }
        //TODO:
        print(str) {
            PrintStream.OutputArr[PrintStream.OutputArr.length - 1] += str;
            console.log(str);
        }
        //TODO:
        println() {
            PrintStream.OutputArr.push("");
            console.log("\n");
        }
    }
    exports.PrintStream = PrintStream;
    PrintStream.OutputArr = null;
});

},{}],21:[function(require,module,exports){
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
    exports.Random = void 0;
    class Random {
        nextDouble() {
            return Math.random();
        }
        nextInt(i) {
            return Math.floor(Math.random() * i);
        }
        setSeed(seed) {
        }
    }
    exports.Random = Random;
});

},{}],22:[function(require,module,exports){
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
    exports.Reader = void 0;
    /**
     *	用于读取字符流的抽象类。
     *	子类必须实现的方法只有 read(char[], int, int) 和 close()。
     *	但是，多数子类将重写此处定义的一些方法，
     *	以提供更高的效率和/或其他功能。
     */
    class Reader {
        close() {
            this.throwError("Reader.close() not implement");
        }
        mark(readahead) {
            this.throwError("Reader.mark() not implement");
        }
        markSupported() {
            this.throwError("Reader.markSupported() not implement");
            return false;
        }
        read() {
            this.throwError("Reader.read() not implement");
            return 0;
        }
        //FIXME: not used //FIXME:number[]
        readBytes(cbuf) {
            this.throwError("Reader.readBytes() not implement");
            return 0;
        }
        readMultiBytes(cbuf, off, len) {
            this.throwError("Reader.readMultiBytes() not implement");
            return 0;
        }
        //FIXME: not used
        ready() {
            this.throwError("Reader.ready() not implement");
            return false;
        }
        reset() {
            this.throwError("Reader.reset() not implement");
        }
        //FIXME:not used
        skip(n) {
            this.throwError("Reader.skip() not implement");
            return 0;
        }
        // 新增
        throwError(str) {
            console.log(str);
            throw new Error(str);
        }
    }
    exports.Reader = Reader;
});

},{}],23:[function(require,module,exports){
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
    exports.Runtime = void 0;
    class Runtime {
        static getRuntime() {
            return Runtime._instance;
        }
        totalMemory() {
            return 0; //FIXME:
        }
        freeMemory() {
            console.log("Runtime.freeMemory() not implement");
            return 0;
        }
    }
    exports.Runtime = Runtime;
    Runtime._instance = new Runtime();
});

},{}],24:[function(require,module,exports){
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
    exports.RuntimeException = void 0;
    class RuntimeException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(str).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.RuntimeException = RuntimeException;
});

},{}],25:[function(require,module,exports){
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
    exports.Stack = void 0;
    /**
     * Stack 类表示后进先出（LIFO）的对象堆栈。
     * 它通过五个操作对类 Vector 进行了扩展 ，
     * 允许将向量视为堆栈。
     * 它提供了通常的 push 和 pop 操作，
     * 以及取栈顶点的 peek 方法、
     * 测试堆栈是否为空的 empty 方法、
     * 在堆栈中查找项并确定到栈顶距离的 search 方法。
     * 首次创建堆栈时，它不包含数据项。
     *
     * 在Java中Stack继承Vector，需要注意转换问题。
     */
    class Stack {
        constructor() {
            this._arr = new Array();
            this.size = 0;
        }
        /**
         *  相当于push
         */
        addElement(o) {
            this._arr.push(o);
        }
        lastElement() {
            var len = this._arr.length;
            if (len > 0) {
                //trace("lastElement:", this._arr[len - 1]);
                return this._arr[len - 1];
            }
            return null;
        }
        //FIXME:not used
        getSize() {
            return this._arr.length;
        }
        //FIXME:not used
        /**
         * 设置此向量的大小。
         * ]如果新大小大于当前大小，则会在向量的末尾添加相应数量的 null 项。
         * 如果新大小小于当前大小，
         * 则丢弃索引 newSize 处及其之后的所有项。
         */
        //TODO:
        setSize(size) {
            var i;
            var len = this._arr.length;
            if (size >= 0) {
                if (size > len) {
                    for (i = 0; i < size - len; i++) {
                        //this._arr.push(new Object());
                        this._arr.push(null);
                    }
                }
                else {
                    for (i = 0; i < len - size; i++) {
                        this._arr.pop();
                    }
                }
            }
        }
        pop() {
            var obj = this._arr.pop();
            return obj;
        }
        elementAt(i) {
            var obj = this._arr[i];
            return obj;
        }
    }
    exports.Stack = Stack;
});

},{}],26:[function(require,module,exports){
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
    exports.StringBuffer = void 0;
    class StringBuffer {
        constructor(str) {
            if (str === undefined) {
                str = "";
            }
            this._str = str;
        }
        //并不创建任何字符，只是预留空间
        init(i) {
        }
        //主要用于清空长度，一般为0
        setLength(i) {
            if (i == 0) {
                this._str = "";
            }
            else if (i > 0) {
                this._str = this._str.substr(0, i);
            }
            else {
                throw new Error("StringBuffer.setLength() error: i < 0");
            }
        }
        toString() {
            return this._str;
        }
        append(ch) {
            this._str = this._str.concat(String.fromCharCode(ch));
        }
        appendStringBuffer(buf) {
            this._str = this._str.concat(buf._str);
        }
        appendString(str) {
            this._str = this._str.concat(str);
        }
        /**
         * 移除此序列的子字符串中的字符。该子字符串从指定的 start 处开始，
         * 一直到索引 end - 1 处的字符，如果不存在这种字符，则一直到序列尾部。
         * 如果 start 等于 end，则不发生任何更改。
         *
         * delete在Java中不是关键字，但在AS3中是关键字
         */
        _delete(start, end) {
            //console.log("StringBuffer._delete(" + start + "," + end + ")");
            if (end > this._str.length) {
                end = this._str.length; //end可能是个过大的数
            }
            if (0 <= start && start < end && end <= this._str.length) {
                this._str = this._str.substring(0, start) +
                    this._str.substring(end);
                return this;
            }
            else {
                throw new Error("StringBuffer.delete() error");
            }
        }
        insert(at, ch) {
            this._str = this._str.substring(0, at) +
                String(ch) +
                this._str.substring(at);
        }
        insertStringBuffer(at, buf) {
            this._str = this._str.substring(0, at) +
                buf._str +
                this._str.substring(at);
        }
        length() {
            return this._str.length;
        }
        charAt(index) {
            return this._str.charCodeAt(index);
        }
        deleteCharAt(index) {
            return this._delete(index, index + 1);
        }
    }
    exports.StringBuffer = StringBuffer;
});

},{}],27:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./PrintStream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SystemUtil = void 0;
    const PrintStream_1 = require("./PrintStream");
    class SystemUtil {
        static arraycopy(src, srcPos, dest, destPos, length) {
            if (src != null && dest != null && src instanceof Array && dest instanceof Array) {
                for (var i = destPos; i < destPos + length; i++) {
                    dest[i] = src[i];
                    //console.log("arraycopy:", i, (src as Array)[i]); 
                }
            }
        }
        static gc() {
        }
        static identityHashCode(obj) {
            return 0;
        }
        static getResourceAsStream(s) {
            return null;
        }
        static currentTimeMillis() {
            return 0;
        }
    }
    exports.SystemUtil = SystemUtil;
    SystemUtil.out = new PrintStream_1.PrintStream();
});

},{"./PrintStream":20}],28:[function(require,module,exports){
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
    exports.TimeZone = void 0;
    class TimeZone {
        constructor() {
            this._id = null;
            this._id = null;
        }
        //Flash自动调整夏令时
        useDaylightTime() {
            return true;
        }
        //获取本地时间
        static getDefault() {
            if (TimeZone.tz._id == null)
                TimeZone.tz._id = "default";
            return TimeZone.tz;
        }
        //获取GMT时间
        static getTimeZone(ID) {
            if (ID != "GMT") {
                console.log("TimeZone.getTimeZone(): not support name");
                throw new Error("TimeZone.getTimeZone(): not support name");
                //return TimeZone.tz; //FIXME:
            }
            if (TimeZone.tzGMT._id == null)
                TimeZone.tzGMT._id = "GMT";
            return TimeZone.tzGMT;
        }
        //时区字符串
        getID() {
            return this._id;
        }
    }
    exports.TimeZone = TimeZone;
    TimeZone.tz = new TimeZone();
    TimeZone.tzGMT = new TimeZone();
});

},{}],29:[function(require,module,exports){
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

},{"../java/NumberFormatException":17,"../java/SystemUtil":27,"./BaseLibReader":30,"./DumpedInput":36,"./Lua":45,"./LuaJavaCallback":49}],30:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/IOException", "../java/Reader", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseLibReader = void 0;
    const IOException_1 = require("../java/IOException");
    const Reader_1 = require("../java/Reader");
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BaseLibReader.java#1 $
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
     * Extends {@link java.io.Reader} to create a Reader from a Lua
     * function.  So that the <code>load</code> function from Lua's base
     * library can be implemented.
     */
    class BaseLibReader extends Reader_1.Reader {
        constructor(L, f) {
            super();
            this._s = "";
            this._i = 0; // = 0;
            this._mark = -1;
            this._L = L;
            this._f = f;
        }
        close() {
            this._f = null;
        }
        mark(l) {
            if (l > 1) {
                throw new IOException_1.IOException("Readahead must be <= 1");
            }
            this._mark = this._i;
        }
        markSupported() {
            return true;
        }
        read() {
            if (this._i >= this._s.length) {
                this._L.pushObject(this._f);
                this._L.call(0, 1);
                if (Lua_1.Lua.isNil(this._L.value(-1))) {
                    return -1;
                }
                else if (Lua_1.Lua.isString(this._L.value(-1))) {
                    this._s = this._L.toString_(this._L.value(-1));
                    if (this._s.length == 0) {
                        return -1;
                    }
                    if (this._mark == this._i) {
                        this._mark = 0;
                    }
                    else {
                        this._mark = -1;
                    }
                    this._i = 0;
                }
                else {
                    this._L.error("reader function must return a string");
                }
            }
            return this._s.charCodeAt(this._i++);
        }
        readMultiBytes(cbuf, off, len) {
            var j = 0; // loop index required after loop
            for (j = 0; j < len; ++j) {
                var c = this.read();
                if (c == -1) {
                    if (j == 0) {
                        return -1;
                    }
                    else {
                        return j;
                    }
                }
                cbuf[off + j] = c;
            }
            return j;
        }
        reset() {
            if (this._mark < 0) {
                throw new IOException_1.IOException("reset() not supported now");
            }
            this._i = this._mark;
        }
    }
    exports.BaseLibReader = BaseLibReader;
});

},{"../java/IOException":11,"../java/Reader":22,"./Lua":45}],31:[function(require,module,exports){
/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BlockCnt.java#1 $
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
    exports.BlockCnt = void 0;
    //see jillcode(Java Implementation of Lua Language, Jill):
    //	http://code.google.com/p/jillcode/
    //这里的代码移植自jillcode(Lua的Java实现，Jill):
    //	http://code.google.com/p/jillcode/	
    /*
    ** nodes for block list (list of active blocks)
    */
    class BlockCnt {
        constructor() {
            this.previous = null; /* chain */
            this.breaklist = 0; /* list of jumps out of this loop */
            this.nactvar = 0; /* # active locals outside the breakable structure */
            this.upval = false; /* true if some variable in the block is an upvalue */
            this.isbreakable = false; /* true if `block' is a loop */
        }
    }
    exports.BlockCnt = BlockCnt;
});

},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Expdesc"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConsControl = void 0;
    const Expdesc_1 = require("./Expdesc");
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
    class ConsControl {
        constructor(t) {
            this.v = new Expdesc_1.Expdesc(); /* last list item read */
            this.nh = 0; /* total number of `record' elements */
            this.na = 0; /* total number of array elements */
            this.tostore = 0; /* number of array elements pending to be stored */
            this.t = t;
        }
    }
    exports.ConsControl = ConsControl;
});

},{"./Expdesc":38}],34:[function(require,module,exports){
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

},{"./Lua":45}],35:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/ByteArray", "./Loader", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DumpState = void 0;
    const ByteArray_1 = require("../java/ByteArray");
    const Loader_1 = require("./Loader");
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BlockCnt.java#1 $
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
    class DumpState {
        constructor(writer, strip) {
            this._writer = writer;
            this._strip = strip;
        }
        //////////////// dumper ////////////////////
        DumpHeader() {
            /*
                * In order to make the code more compact the dumper re-uses the
                * header defined in Loader.java.  It has to fix the endianness byte
                * first.
                */
            Loader_1.Loader.HEADER[6] = 0;
            //TODO:Java to AS3
            var b = new ByteArray_1.ByteArray();
            var len = Loader_1.Loader.HEADER.length;
            for (var i = 0; i < len; ++i) {
                b.writeByte(Loader_1.Loader.HEADER[i]);
            }
            this._writer.write(b);
        }
        DumpInt(i) {
            this._writer.writeInt(i); // big-endian
        }
        DumpNumber(d) {
            this._writer.writeDouble(d); // big-endian
        }
        DumpFunction(f, p) {
            this.DumpString((f.source == p || this._strip) ? null : f.source);
            this.DumpInt(f.linedefined);
            this.DumpInt(f.lastlinedefined);
            this._writer.writeByte(f.nups);
            this._writer.writeByte(f.numparams);
            this._writer.writeBoolean(f.isVararg);
            this._writer.writeByte(f.maxstacksize);
            this.DumpCode(f);
            this.DumpConstants(f);
            this.DumpDebug(f);
        }
        DumpCode(f) {
            var n = f.sizecode;
            var code = f.code; //int [] 
            this.DumpInt(n);
            for (var i = 0; i < n; i++)
                this.DumpInt(code[i]);
        }
        DumpConstants(f) {
            var n = f.sizek;
            var k = f.k; //Slot[]
            this.DumpInt(n);
            for (var i = 0; i < n; i++) {
                var o = k[i].r;
                if (o == Lua_1.Lua.NIL) {
                    this._writer.writeByte(Lua_1.Lua.TNIL);
                }
                else if (typeof (o) == "boolean") {
                    this._writer.writeByte(Lua_1.Lua.TBOOLEAN);
                    this._writer.writeBoolean(o);
                }
                else if (o == Lua_1.Lua.NUMBER) {
                    this._writer.writeByte(Lua_1.Lua.TNUMBER);
                    this.DumpNumber(k[i].d);
                }
                else if (typeof (o) == "string") {
                    this._writer.writeByte(Lua_1.Lua.TSTRING);
                    this.DumpString(o);
                }
                else {
                    //# assert false
                }
            }
            n = f.sizep;
            this.DumpInt(n);
            for (i = 0; i < n; i++) {
                var subfunc = f.p[i];
                this.DumpFunction(subfunc, f.source);
            }
        }
        DumpString(s) {
            if (s == null) {
                this.DumpInt(0);
            }
            else {
                /*
                    * Strings are dumped by converting to UTF-8 encoding.  The MIDP
                    * 2.0 spec guarantees that this encoding will be supported (see
                    * page 9 of midp-2_0-fr-spec.pdf).  Nonetheless, any
                    * possible UnsupportedEncodingException is left to be thrown
                    * (it's a subclass of IOException which is declared to be thrown).
                    */
                //TODO: Java to AS3
                var contents = new ByteArray_1.ByteArray(); // s.getBytes("UTF-8"); //byte []
                contents.writeUTFBytes(s);
                var size = contents.length;
                this.DumpInt(size + 1);
                this._writer.write(contents, 0, size);
                this._writer.writeByte(0);
            }
        }
        DumpDebug(f) {
            if (this._strip) {
                this.DumpInt(0);
                this.DumpInt(0);
                this.DumpInt(0);
                return;
            }
            var n = f.sizelineinfo;
            this.DumpInt(n);
            for (var i = 0; i < n; i++)
                this.DumpInt(f.lineinfo[i]);
            n = f.sizelocvars;
            this.DumpInt(n);
            for (i = 0; i < n; i++) {
                var locvar = f.locvars[i];
                this.DumpString(locvar.varname);
                this.DumpInt(locvar.startpc);
                this.DumpInt(locvar.endpc);
            }
            n = f.sizeupvalues;
            this.DumpInt(n);
            for (i = 0; i < n; i++)
                this.DumpString(f.upvalues[i]);
        }
        //新增
        get writer() {
            return this._writer;
        }
    }
    exports.DumpState = DumpState;
});

},{"../java/ByteArray":2,"./Loader":43,"./Lua":45}],36:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/InputStream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DumpedInput = void 0;
    const InputStream_1 = require("../java/InputStream");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/DumpedInput.java#1 $
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
     * Converts a string obtained using string.dump into an
     * {@link java.io.InputStream} so that it can be passed to {@link
     * Lua#load(java.io.InputStream, java.lang.String)}.
     */
    class DumpedInput extends InputStream_1.InputStream {
        constructor(s) {
            super();
            this._i = 0; // = 0
            this._mark = -1;
            this._s = s;
        }
        available() {
            return this._s.length - this._i;
        }
        close() {
            this._s = null;
            this._i = -1;
        }
        mark(readlimit) {
            this._mark = this._i;
        }
        markSupported() {
            return true;
        }
        read() {
            if (this._i >= this._s.length) {
                return -1;
            }
            var c = this._s.charCodeAt(this._i);
            ++this._i;
            return c & 0xff;
        }
        reset() {
            this._i = this._mark;
        }
        skip(n) {
            console.log("DumpedInput.skip() not implement");
            return 0;
        }
    }
    exports.DumpedInput = DumpedInput;
});

},{"../java/InputStream":13}],37:[function(require,module,exports){
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
    exports.Enum = void 0;
    const Lua_1 = require("./Lua");
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
    class Enum {
        constructor(t, e) {
            this._i = 0; // = 0
            this._t = t;
            this._e = e;
            this.inci();
        }
        /**
        * Increments {@link #i} until it either exceeds
        * <code>t.sizeArray</code> or indexes a non-nil element.
        */
        inci() {
            while (this._i < this._t.sizeArray && this._t.array[this._i] == Lua_1.Lua.NIL) {
                ++this._i;
            }
        }
        hasMoreElements() {
            if (this._i < this._t.sizeArray) {
                return true;
            }
            return this._e.hasMoreElements();
        }
        nextElement() {
            var r;
            if (this._i < this._t.sizeArray) {
                ++this._i; // array index i corresponds to key i+1
                r = new Number(this._i);
                this.inci();
            }
            else {
                r = this._e.nextElement();
            }
            return r;
        }
    }
    exports.Enum = Enum;
});

},{"./Lua":45}],38:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./FuncState"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Expdesc = void 0;
    const FuncState_1 = require("./FuncState");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Expdesc.java#1 $
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
    /** Equivalent to struct expdesc. */
    class Expdesc extends Object {
        //TODO:
        constructor() {
            super();
            this._k = 0; // one of V* enums above
            this._info = 0;
            this._aux = 0;
            this._nval = 0;
            this._t = 0;
            this._f = 0;
        }
        //public function Expdesc(k:int, i:int):void
        //{
        //init(k, i);
        //}
        /** Equivalent to init_exp from lparser.c */
        init(kind, i) {
            this._t = FuncState_1.FuncState.NO_JUMP;
            this._f = FuncState_1.FuncState.NO_JUMP;
            this._k = kind;
            this._info = i;
        }
        copy(e) {
            // Must initialise all members of this.
            this._k = e._k;
            this._info = e._info;
            this._aux = e._aux;
            this._nval = e._nval;
            this._t = e._t;
            this._f = e._f;
        }
        get kind() {
            return this._k;
        }
        set kind(kind) {
            this._k = kind;
        }
        get k() {
            return this._k;
        }
        set k(kind) {
            this._k = kind;
        }
        get info() {
            return this._info;
        }
        set info(i) {
            this._info = i;
        }
        get aux() {
            return this._aux;
        }
        set aux(aux) {
            this._aux = aux;
        }
        get nval() {
            return this._nval;
        }
        set nval(d) {
            this._nval = d;
        }
        /** Equivalent to hasmultret from lparser.c */
        hasmultret() {
            return this._k == Expdesc.VCALL || this._k == Expdesc.VVARARG;
        }
        /** Equivalent to hasjumps from lcode.c. */
        hasjumps() {
            return this._t != this._f;
        }
        nonreloc(i) {
            this._k = Expdesc.VNONRELOC;
            this._info = i;
        }
        reloc(i) {
            this._k = Expdesc.VRELOCABLE;
            this._info = i;
        }
        upval(i) {
            this._k = Expdesc.VUPVAL;
            this._info = i;
        }
        //新增
        get f() {
            return this._f;
        }
        //新增
        set f(f) {
            this._f = f;
        }
        //新增
        get t() {
            return this._t;
        }
        //新增
        set t(t) {
            this._t = t;
        }
    }
    exports.Expdesc = Expdesc;
    Expdesc.VVOID = 0; // no value
    Expdesc.VNIL = 1;
    Expdesc.VTRUE = 2;
    Expdesc.VFALSE = 3;
    Expdesc.VK = 4; // info = index into 'k'
    Expdesc.VKNUM = 5; // nval = numerical value
    Expdesc.VLOCAL = 6; // info = local register
    Expdesc.VUPVAL = 7; // info = index into 'upvalues'
    Expdesc.VGLOBAL = 8; // info = index of table;
    // aux = index of global name in 'k'
    Expdesc.VINDEXED = 9; // info = table register
    // aux = index register (or 'k')
    Expdesc.VJMP = 10; // info = instruction pc
    Expdesc.VRELOCABLE = 11; // info = instruction pc
    Expdesc.VNONRELOC = 12; // info = result register
    Expdesc.VCALL = 13; // info = instruction pc
    Expdesc.VVARARG = 14; // info = instruction pc
});

},{"./FuncState":41}],39:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/StringBuffer", "../java/Character", "../java/NumberFormatException", "./Lua", "./Syntax"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormatItem = void 0;
    const StringBuffer_1 = require("../java/StringBuffer");
    const Character_1 = require("../java/Character");
    const NumberFormatException_1 = require("../java/NumberFormatException");
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
    class FormatItem {
        /**
         * Parse a format item (starting from after the <code>L_ESC</code>).
         * If you promise that there won't be any format errors, then
         * <var>L</var> can be <code>null</code>.
         */
        constructor(L, s) {
            this._left = false; // '-' flag
            this._sign = false; // '+' flag
            this._space = false; // ' ' flag
            this._alt = false; // '#' flag
            this._zero = false; // '0' flag
            this._width = 0; // minimum field width
            this._precision = -1; // precision, -1 when no precision specified.
            this._type = 0; // the type of the conversion
            this._length = 0; // length of the format item in the format string.
            this._L = L;
            var i = 0;
            var l = s.length;
            // parse flags
            flag: while (true) {
                if (i >= l)
                    L.error("invalid format");
                switch (s.charAt(i)) {
                    case '-':
                        this._left = true;
                        break;
                    case '+':
                        this._sign = true;
                        break;
                    case ' ':
                        this._space = true;
                        break;
                    case '#':
                        this._alt = true;
                        break;
                    case '0':
                        this._zero = true;
                        break;
                    default:
                        break flag;
                }
                ++i;
            } /* flag */
            // parse width
            var widths = i; // index of start of width specifier
            while (true) {
                if (i >= l)
                    this._L.error("invalid format");
                if (Syntax_1.Syntax.isdigit(s.charCodeAt(i))) //TODO:
                    ++i;
                else
                    break;
            }
            if (widths < i) {
                try {
                    this._width = parseInt(s.substring(widths, i)); //TODO:
                }
                catch (e_) {
                    if (e_ instanceof Error) {
                        console.log(e_.stack);
                    }
                }
            }
            // parse precision
            if (s.charAt(i) == '.') {
                ++i;
                var precisions = i; // index of start of precision specifier
                while (true) {
                    if (i >= l)
                        L.error("invalid format");
                    if (Syntax_1.Syntax.isdigit(s.charCodeAt(i))) //TODO:
                        ++i;
                    else
                        break;
                }
                if (precisions < i) {
                    try {
                        this._precision = parseInt(s.substring(precisions, i)); //TODO:
                    }
                    catch (e_) {
                        if (e_ instanceof NumberFormatException_1.NumberFormatException) {
                            console.log(e_.stack);
                        }
                    }
                }
            }
            switch (s.charAt(i)) {
                case 'c':
                case 'd':
                case 'i':
                case 'o':
                case 'u':
                case 'x':
                case 'X':
                case 'e':
                case 'E':
                case 'f':
                case 'g':
                case 'G':
                case 'q':
                case 's':
                    this._type = s.charCodeAt(i);
                    length = i + 1;
                    return;
            }
            this._L.error("invalid option to 'format'");
        }
        get length() {
            return this._length;
        }
        set length(length) {
            this._length = length;
        }
        get type() {
            return this._type;
        }
        set type(type) {
            this._type = type;
        }
        /**
         * Format the converted string according to width, and left.
         * zero padding is handled in either {@link FormatItem#formatInteger}
         * or {@link FormatItem#formatFloat}
         * (and width is fixed to 0 in such cases).  Therefore we can ignore
         * zero.
         */
        format(b, s) {
            var l = s.length;
            if (l >= this._width) {
                b.appendString(s);
                return;
            }
            var pad = new StringBuffer_1.StringBuffer();
            while (l < this._width) {
                pad.append(' '.charCodeAt(0));
                ++l;
            }
            if (this._left) {
                b.appendString(s);
                b.appendStringBuffer(pad);
            }
            else {
                b.appendStringBuffer(pad);
                b.appendString(s);
            }
        }
        // All the format* methods take a StringBuffer and append the
        // formatted representation of the value to it.
        // Sadly after a format* method has been invoked the object is left in
        // an unusable state and should not be used again.
        formatChar(b, c) {
            var s = String.fromCharCode(c); //TODO:
            this.format(b, s);
        }
        formatInteger(b, i) {
            // :todo: improve inefficient use of implicit StringBuffer
            if (this._left)
                this._zero = false;
            if (this._precision >= 0)
                this._zero = false;
            var radix = 10;
            switch (String.fromCharCode(this.type)) {
                case 'o':
                    radix = 8;
                    break;
                case 'd':
                case 'i':
                case 'u':
                    radix = 10;
                    break;
                case 'x':
                case 'X':
                    radix = 16;
                    break;
                default:
                    this._L.error("invalid format");
            }
            var s = i.toString(radix); //Long.toString(i, radix);
            if (this._type == 'X'.charCodeAt(0))
                s = s.toUpperCase();
            if (this._precision == 0 && s == "0")
                s = "";
            // form a prefix by strippping possible leading '-',
            // pad to precision,
            // add prefix,
            // pad to width.
            // extra wart: padding with '0' is implemented using precision
            // because this makes handling the prefix easier.
            var prefix = "";
            if (s.substr(0, 1) == "-") {
                prefix = "-";
                s = s.substring(1);
            }
            if (this._alt && radix == 16)
                prefix = "0x";
            if (prefix == "") {
                if (this._sign)
                    prefix = "+";
                else if (this._space)
                    prefix = " ";
            }
            if (this._alt && radix == 8 && s.substr(0, 1) != "0")
                s = "0" + s;
            var l = s.length;
            if (this._zero) {
                this._precision = this._width - prefix.length;
                this._width = 0;
            }
            if (l < this._precision) {
                var p = new StringBuffer_1.StringBuffer();
                while (l < this._precision) {
                    p.append('0'.charCodeAt(0));
                    ++l;
                }
                p.appendString(s);
                s = p.toString();
            }
            s = prefix + s;
            this.format(b, s);
        }
        formatFloat(b, d) {
            switch (String.fromCharCode(this._type)) {
                case 'g':
                case 'G':
                    this.formatFloatG(b, d);
                    return;
                case 'f':
                    this.formatFloatF(b, d);
                    return;
                case 'e':
                case 'E':
                    this.formatFloatE(b, d);
                    return;
            }
        }
        formatFloatE(b, d) {
            var s = this.formatFloatRawE(d);
            this.format(b, s);
        }
        /**
         * Returns the formatted string for the number without any padding
         * (which can be added by invoking {@link FormatItem#format} later).
         */
        formatFloatRawE(d) {
            var m = Math.abs(d);
            var offset = 0;
            if (m >= 1e-3 && m < 1e7) {
                d *= 1e10;
                offset = 10;
            }
            //FIXME:如果使用toPrecision会消除掉中间的e指数符号
            var s = d.toPrecision(this._precision); //String(d); //FIXME:整数转浮点问题
            var t = new StringBuffer_1.StringBuffer(s);
            var e; // Exponent value
            if (d == 0) {
                e = 0;
            }
            else {
                var ei = s.indexOf('E');
                e = parseInt(s.substring(ei + 1));
                t._delete(ei, Number.MAX_SAFE_INTEGER); //TODO:
            }
            this.precisionTrim(t);
            e -= offset;
            if (Character_1.Character.isLowerCase(this.type)) {
                t.append(FormatItem.E_LOWER);
            }
            else {
                t.append(FormatItem.E_UPPER);
            }
            if (e >= 0) {
                t.append('+'.charCodeAt(0));
            }
            t.appendString(String(e)); //TODO:
            this.zeroPad(t);
            return t.toString();
        }
        formatFloatF(b, d) {
            var s = this.formatFloatRawF(d);
            this.format(b, s);
        }
        /**
         * Returns the formatted string for the number without any padding
         * (which can be added by invoking {@link FormatItem#format} later).
         */
        formatFloatRawF(d) {
            //toPrecision
            var s = d.toPrecision(this._precision); //String(d); //FIXME:整数转字符串会丢失小数点后1位精度
            if (d % 1 === 0) {
                s = d.toFixed(1);
            }
            var t = new StringBuffer_1.StringBuffer(s);
            var di = s.indexOf('.');
            var ei = s.indexOf('E');
            if (ei >= 0) {
                t._delete(ei, Number.MAX_SAFE_INTEGER); //TODO:
                var e = parseInt(s.substring(ei + 1));
                var z = new StringBuffer_1.StringBuffer();
                for (var i = 0; i < Math.abs(e); ++i) {
                    z.append('0'.charCodeAt(0));
                }
                if (e > 0) {
                    t.deleteCharAt(di);
                    t.appendStringBuffer(z);
                    t.insert(di + e, '.'.charCodeAt(0));
                }
                else {
                    t.deleteCharAt(di);
                    var at = t.charAt(0) == '-'.charCodeAt(0) ? 1 : 0;
                    t.insertStringBuffer(at, z);
                    t.insert(di, '.'.charCodeAt(0));
                }
            }
            this.precisionTrim(t);
            this.zeroPad(t);
            return t.toString();
        }
        formatFloatG(b, d) {
            if (this._precision == 0) {
                this._precision = 1;
            }
            if (this._precision < 0) {
                this._precision = 6;
            }
            var s;
            // Decide whether to use %e or %f style.
            var m = Math.abs(d);
            if (m == 0) {
                // :todo: Could test for -0 and use "-0" appropriately.
                s = "0";
            }
            else if (m < 1e-4 || m >= Lua_1.Lua.iNumpow(10, this._precision)) {
                // %e style
                --this._precision;
                s = this.formatFloatRawE(d);
                var di = s.indexOf('.');
                if (di >= 0) {
                    // Trim trailing zeroes from fractional part
                    var ei = s.indexOf('E');
                    if (ei < 0) {
                        ei = s.indexOf('e');
                    }
                    var i = ei - 1;
                    while (s.charAt(i) == '0') {
                        --i;
                    }
                    if (s.charAt(i) != '.') {
                        ++i;
                    }
                    var a = new StringBuffer_1.StringBuffer(s);
                    a._delete(i, ei); //TODO:
                    s = a.toString();
                }
            }
            else {
                // %f style
                // For %g precision specifies the number of significant digits,
                // for %f precision specifies the number of fractional digits.
                // There is a problem because it's not obvious how many fractional
                // digits to format, it could be more than precision
                // (when .0001 <= m < 1) or it could be less than precision
                // (when m >= 1).
                // Instead of trying to work out the correct precision to use for
                // %f formatting we use a worse case to get at least all the
                // necessary digits, then we trim using string editing.  The worst
                // case is that 3 zeroes come after the decimal point before there
                // are any significant digits.
                // Save the required number of significant digits
                var required = this._precision;
                this._precision += 3;
                s = this.formatFloatRawF(d);
                var fsd = 0; // First Significant Digit
                while (s.charAt(fsd) == '0' || s.charAt(fsd) == '.') {
                    ++fsd;
                }
                // Note that all the digits to the left of the decimal point in
                // the formatted number are required digits (either significant
                // when m >= 1 or 0 when m < 1).  We know this because otherwise 
                // m >= (10**precision) and so formatting falls under the %e case.
                // That means that we can always trim the string at fsd+required
                // (this will remove the decimal point when m >=
                // (10**(precision-1)).
                var a2 = new StringBuffer_1.StringBuffer(s);
                a2._delete(fsd + required, Number.MAX_SAFE_INTEGER); //TODO:
                if (s.indexOf('.') < a2.length()) {
                    // Trim trailing zeroes
                    var i2 = a2.length() - 1;
                    while (a2.charAt(i2) == '0'.charCodeAt(0)) {
                        a2.deleteCharAt(i2);
                        --i2;
                    }
                    if (a2.charAt(i2) == '.'.charCodeAt(0)) {
                        a2.deleteCharAt(i2);
                    }
                }
                s = a2.toString();
            }
            this.format(b, s);
        }
        formatString(b, s) {
            var p = s;
            if (this._precision >= 0 && this._precision < s.length) {
                p = s.substring(0, this._precision);
            }
            this.format(b, p);
        }
        precisionTrim(t) {
            if (this._precision < 0) {
                this._precision = 6;
            }
            var s = t.toString();
            var di = s.indexOf('.');
            var l = t.length();
            if (0 == this._precision) {
                t._delete(di, Number.MAX_SAFE_INTEGER); //TODO:
            }
            else if (l > di + this._precision) {
                t._delete(di + this._precision + 1, Number.MAX_SAFE_INTEGER); //TODO:
            }
            else {
                for (; l <= di + this._precision; ++l) {
                    t.append('0'.charCodeAt(0));
                }
            }
        }
        zeroPad(t) {
            if (this._zero && t.length() < this._width) {
                var at = t.charAt(0) == '-'.charCodeAt(0) ? 1 : 0;
                while (t.length() < this._width) {
                    t.insert(at, '0'.charCodeAt(0));
                }
            }
        }
    }
    exports.FormatItem = FormatItem;
    /**
     * Character used in formatted output when %e or %g format is used.
     */
    FormatItem.E_LOWER = 'E'.charCodeAt(0);
    /**
     * Character used in formatted output when %E or %G format is used.
     */
    FormatItem.E_UPPER = 'E'.charCodeAt(0);
});

},{"../java/Character":5,"../java/NumberFormatException":17,"../java/StringBuffer":26,"./Lua":45,"./Syntax":60}],40:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/InputStream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FromReader = void 0;
    const InputStream_1 = require("../java/InputStream");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/FromReader.java#1 $
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
     * Takes a {@link Reader} and converts to an {@link InputStream} by
     * reversing the transformation performed by <code>string.dump</code>.
     * Similar to {@link DumpedInput} which does the same job for {@link
     * String}.  This class is used by {@link BaseLib}'s load in order to
     * load binary chunks.
     */
    class FromReader extends InputStream_1.InputStream {
        constructor(reader) {
            super();
            this._reader = reader;
        }
        mark(readahead) {
            this._reader.mark(readahead);
        }
        reset() {
            this._reader.reset();
        }
        read() {
            var c = this._reader.read();
            if (c == -1) {
                return c;
            }
            return c & 0xff;
        }
    }
    exports.FromReader = FromReader;
});

},{"../java/InputStream":13}],41:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Hashtable", "../java/IllegalArgumentException", "./Expdesc", "./Lua", "./Proto", "./Syntax"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FuncState = void 0;
    const Hashtable_1 = require("../java/Hashtable");
    const IllegalArgumentException_1 = require("../java/IllegalArgumentException");
    const Expdesc_1 = require("./Expdesc");
    const Lua_1 = require("./Lua");
    const Proto_1 = require("./Proto");
    const Syntax_1 = require("./Syntax");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/FuncState.java#1 $
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
     * Used to model a function during compilation.  Code generation uses
     * this structure extensively.  Most of the PUC-Rio functions from
     * lcode.c have moved into this class, alongwith a few functions from
     * lparser.c
     */
    class FuncState {
        /**
         * Constructor.  Much of this is taken from <code>open_func</code> in
         * <code>lparser.c</code>.
         */
        constructor(ls) {
            /**
            * Table to find (and reuse) elements in <var>f.k</var>.  Maps from
            * Object (a constant Lua value) to an index into <var>f.k</var>.
            */
            this._h = new Hashtable_1.Hashtable();
            /** Enclosing function. */
            this._prev = null;
            /** chain of current blocks */
            this._bl = null; // = null;
            /** next position to code. */
            this._pc = 0; // = 0;
            /** pc of last jump target. */
            this._lasttarget = -1;
            /** List of pending jumps to <var>pc</var>. */
            this._jpc = FuncState.NO_JUMP;
            /** First free register. */
            this._freereg = 0; // = 0;
            /** number of elements in <var>k</var>. */
            this._nk = 0; // = 0;
            /** number of elements in <var>p</var>. */
            this._np = 0; // = 0;
            /** number of elements in <var>locvars</var>. */
            this._nlocvars = 0; // = 0;
            /** number of active local variables. */
            this._nactvar = 0; // = 0;
            /** upvalues as 8-bit k and 8-bit info */
            this._upvalues = new Array(Lua_1.Lua.MAXUPVALUES); //int [] 
            /** declared-variable stack. */
            this._actvar = new Array(Lua_1.Lua.MAXVARS); //short[] 
            this._f = new Proto_1.Proto();
            this._f.init2(ls.source, 2); // default value for maxstacksize=2
            this._L = ls.L;
            this._ls = ls;
            //    prev = ls.linkfs(this);
        }
        /** Equivalent to <code>close_func</code> from <code>lparser.c</code>. */
        close() {
            this._f.closeCode(this._pc);
            this._f.closeLineinfo(this._pc);
            this._f.closeK(this._nk);
            this._f.closeP(this._np);
            this._f.closeLocvars(this._nlocvars);
            this._f.closeUpvalues();
            var checks = this._L.gCheckcode(this._f);
            //# assert checks
            //# assert bl == null
        }
        /** Equivalent to getlocvar from lparser.c.
        * Accesses <code>LocVar</code>s of the {@link Proto}.
        */
        getlocvar(idx) {
            return this._f.locvars[this._actvar[idx]];
        }
        // Functions from lcode.c
        /** Equivalent to luaK_checkstack. */
        kCheckstack(n) {
            var newstack = this._freereg + n;
            if (newstack > this._f.maxstacksize) {
                if (newstack >= Lua_1.Lua.MAXSTACK) {
                    this._ls.xSyntaxerror("function or expression too complex");
                }
                this._f.maxstacksize = newstack;
            }
        }
        /** Equivalent to luaK_code. */
        kCode(i, line) {
            this.dischargejpc();
            // Put new instruction in code array.
            this._f.codeAppend(this._L, this._pc, i, line);
            return this._pc++;
        }
        /** Equivalent to luaK_codeABC. */
        kCodeABC(o, a, b, c) {
            // assert getOpMode(o) == iABC;
            // assert getBMode(o) != OP_ARG_N || b == 0;
            // assert getCMode(o) != OP_ARG_N || c == 0;
            return this.kCode(Lua_1.Lua.CREATE_ABC(o, a, b, c), this._ls.lastline);
        }
        /** Equivalent to luaK_codeABx. */
        kCodeABx(o, a, bc) {
            // assert getOpMode(o) == iABx || getOpMode(o) == iAsBx);
            // assert getCMode(o) == OP_ARG_N);
            return this.kCode(Lua_1.Lua.CREATE_ABx(o, a, bc), this._ls.lastline);
        }
        /** Equivalent to luaK_codeAsBx. */
        kCodeAsBx(o, a, bc) {
            return this.kCodeABx(o, a, bc + Lua_1.Lua.MAXARG_sBx);
        }
        /** Equivalent to luaK_dischargevars. */
        kDischargevars(e) {
            switch (e.kind) {
                case Expdesc_1.Expdesc.VLOCAL:
                    e.kind = Expdesc_1.Expdesc.VNONRELOC;
                    break;
                case Expdesc_1.Expdesc.VUPVAL:
                    e.reloc(this.kCodeABC(Lua_1.Lua.OP_GETUPVAL, 0, e.info, 0));
                    break;
                case Expdesc_1.Expdesc.VGLOBAL:
                    e.reloc(this.kCodeABx(Lua_1.Lua.OP_GETGLOBAL, 0, e.info));
                    break;
                case Expdesc_1.Expdesc.VINDEXED:
                    this.__freereg(e.aux); //TODO:
                    this.__freereg(e.info); //TODO:
                    e.reloc(this.kCodeABC(Lua_1.Lua.OP_GETTABLE, 0, e.info, e.aux));
                    break;
                case Expdesc_1.Expdesc.VVARARG:
                case Expdesc_1.Expdesc.VCALL:
                    this.kSetoneret(e);
                    break;
                default:
                    break; // there is one value available (somewhere)
            }
        }
        /** Equivalent to luaK_exp2anyreg. */
        kExp2anyreg(e) {
            this.kDischargevars(e);
            if (e.k == Expdesc_1.Expdesc.VNONRELOC) {
                if (!e.hasjumps()) {
                    return e.info;
                }
                if (e.info >= this._nactvar) // reg is not a local?
                 {
                    this.exp2reg(e, e.info); // put value on it
                    return e.info;
                }
            }
            this.kExp2nextreg(e); // default
            return e.info;
        }
        /** Equivalent to luaK_exp2nextreg. */
        kExp2nextreg(e) {
            this.kDischargevars(e);
            this.freeexp(e);
            this.kReserveregs(1);
            this.exp2reg(e, this._freereg - 1);
        }
        /** Equivalent to luaK_fixline. */
        kFixline(line) {
            this._f.setLineinfo(this._pc - 1, line);
        }
        /** Equivalent to luaK_infix. */
        kInfix(op, v) {
            switch (op) {
                case Syntax_1.Syntax.OPR_AND:
                    this.kGoiftrue(v);
                    break;
                case Syntax_1.Syntax.OPR_OR:
                    this.kGoiffalse(v);
                    break;
                case Syntax_1.Syntax.OPR_CONCAT:
                    this.kExp2nextreg(v); /* operand must be on the `stack' */
                    break;
                default:
                    if (!this.isnumeral(v))
                        this.kExp2RK(v);
                    break;
            }
        }
        isnumeral(e) {
            return e.k == Expdesc_1.Expdesc.VKNUM &&
                e.t == FuncState.NO_JUMP &&
                e.f == FuncState.NO_JUMP;
        }
        /** Equivalent to luaK_nil. */
        kNil(from, n) {
            var previous;
            if (this._pc > this._lasttarget) /* no jumps to current position? */ {
                if (this._pc == 0) /* function start? */
                    return; /* positions are already clean */
                previous = this._pc - 1;
                var instr = this._f.code[previous];
                if (Lua_1.Lua.OPCODE(instr) == Lua_1.Lua.OP_LOADNIL) {
                    var pfrom = Lua_1.Lua.ARGA(instr);
                    var pto = Lua_1.Lua.ARGB(instr);
                    if (pfrom <= from && from <= pto + 1) /* can connect both? */ {
                        if (from + n - 1 > pto)
                            this._f.code[previous] = Lua_1.Lua.SETARG_B(instr, from + n - 1);
                        return;
                    }
                }
            }
            this.kCodeABC(Lua_1.Lua.OP_LOADNIL, from, from + n - 1, 0);
        }
        /** Equivalent to luaK_numberK. */
        kNumberK(r) {
            return this.addk(Lua_1.Lua.valueOfNumber(r)); //TODO:L->Lua
        }
        /** Equivalent to luaK_posfix. */
        kPosfix(op, e1, e2) {
            switch (op) {
                case Syntax_1.Syntax.OPR_AND:
                    /* list must be closed */
                    //# assert e1.t == NO_JUMP
                    this.kDischargevars(e2);
                    e2.f = this.kConcat(e2.f, e1.f);
                    e1.copy(e2); //TODO:
                    break;
                case Syntax_1.Syntax.OPR_OR:
                    /* list must be closed */
                    //# assert e1.f == NO_JUMP
                    this.kDischargevars(e2);
                    e2.t = this.kConcat(e2.t, e1.t);
                    e1.copy(e2); //TODO:
                    break;
                case Syntax_1.Syntax.OPR_CONCAT:
                    this.kExp2val(e2);
                    if (e2.k == Expdesc_1.Expdesc.VRELOCABLE && Lua_1.Lua.OPCODE(this.getcode(e2)) == Lua_1.Lua.OP_CONCAT) {
                        //# assert e1.info == Lua.ARGB(getcode(e2))-1
                        this.freeexp(e1);
                        this.setcode(e2, Lua_1.Lua.SETARG_B(this.getcode(e2), e1.info));
                        e1.k = e2.k;
                        e1.info = e2.info;
                    }
                    else {
                        this.kExp2nextreg(e2); /* operand must be on the 'stack' */
                        this.codearith(Lua_1.Lua.OP_CONCAT, e1, e2);
                    }
                    break;
                case Syntax_1.Syntax.OPR_ADD:
                    this.codearith(Lua_1.Lua.OP_ADD, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_SUB:
                    this.codearith(Lua_1.Lua.OP_SUB, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_MUL:
                    this.codearith(Lua_1.Lua.OP_MUL, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_DIV:
                    this.codearith(Lua_1.Lua.OP_DIV, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_MOD:
                    this.codearith(Lua_1.Lua.OP_MOD, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_POW:
                    this.codearith(Lua_1.Lua.OP_POW, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_EQ:
                    this.codecomp(Lua_1.Lua.OP_EQ, true, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_NE:
                    this.codecomp(Lua_1.Lua.OP_EQ, false, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_LT:
                    this.codecomp(Lua_1.Lua.OP_LT, true, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_LE:
                    this.codecomp(Lua_1.Lua.OP_LE, true, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_GT:
                    this.codecomp(Lua_1.Lua.OP_LT, false, e1, e2);
                    break;
                case Syntax_1.Syntax.OPR_GE:
                    this.codecomp(Lua_1.Lua.OP_LE, false, e1, e2);
                    break;
                default:
                //# assert false
            }
        }
        /** Equivalent to luaK_prefix. */
        kPrefix(op, e) {
            var e2 = new Expdesc_1.Expdesc(); // TODO:
            e2.init(Expdesc_1.Expdesc.VKNUM, 0);
            switch (op) {
                case Syntax_1.Syntax.OPR_MINUS:
                    if (e.kind == Expdesc_1.Expdesc.VK) {
                        this.kExp2anyreg(e);
                    }
                    this.codearith(Lua_1.Lua.OP_UNM, e, e2);
                    break;
                case Syntax_1.Syntax.OPR_NOT:
                    this.codenot(e);
                    break;
                case Syntax_1.Syntax.OPR_LEN:
                    this.kExp2anyreg(e);
                    this.codearith(Lua_1.Lua.OP_LEN, e, e2);
                    break;
                default:
                    throw new IllegalArgumentException_1.IllegalArgumentException();
            }
        }
        /** Equivalent to luaK_reserveregs. */
        kReserveregs(n) {
            this.kCheckstack(n);
            this._freereg += n;
        }
        /** Equivalent to luaK_ret. */
        kRet(first, nret) {
            this.kCodeABC(Lua_1.Lua.OP_RETURN, first, nret + 1, 0);
        }
        /** Equivalent to luaK_setmultret (in lcode.h). */
        kSetmultret(e) {
            this.kSetreturns(e, Lua_1.Lua.MULTRET);
        }
        /** Equivalent to luaK_setoneret. */
        kSetoneret(e) {
            if (e.kind == Expdesc_1.Expdesc.VCALL) // expression is an open function call?
             {
                e.nonreloc(Lua_1.Lua.ARGA(this.getcode(e)));
            }
            else if (e.kind == Expdesc_1.Expdesc.VVARARG) {
                this.setargb(e, 2);
                e.kind = Expdesc_1.Expdesc.VRELOCABLE;
            }
        }
        /** Equivalent to luaK_setreturns. */
        kSetreturns(e, nresults) {
            if (e.kind == Expdesc_1.Expdesc.VCALL) // expression is an open function call?
             {
                this.setargc(e, nresults + 1);
            }
            else if (e.kind == Expdesc_1.Expdesc.VVARARG) {
                this.setargb(e, nresults + 1);
                this.setarga(e, this._freereg);
                this.kReserveregs(1);
            }
        }
        /** Equivalent to luaK_stringK. */
        kStringK(s) {
            return this.addk(s /*.intern()*/);
        }
        addk(o) {
            var hash = o;
            var v = this._h._get(hash); //TODO:get
            if (v != null) {
                // :todo: assert
                return v; //TODO:
            }
            // constant not found; create a new entry
            this._f.constantAppend(this._nk, o);
            this._h.put(hash, new Number(this._nk)); //TODO:
            return this._nk++;
        }
        codearith(op, e1, e2) {
            if (this.constfolding(op, e1, e2))
                return;
            else {
                var o1 = this.kExp2RK(e1);
                var o2 = (op != Lua_1.Lua.OP_UNM && op != Lua_1.Lua.OP_LEN) ? this.kExp2RK(e2) : 0;
                this.freeexp(e2);
                this.freeexp(e1);
                e1.info = this.kCodeABC(op, 0, o1, o2);
                e1.k = Expdesc_1.Expdesc.VRELOCABLE;
            }
        }
        constfolding(op, e1, e2) {
            var r = 0;
            if (!this.isnumeral(e1) || !this.isnumeral(e2))
                return false;
            var v1 = e1.nval;
            var v2 = e2.nval;
            switch (op) {
                case Lua_1.Lua.OP_ADD:
                    r = v1 + v2;
                    break;
                case Lua_1.Lua.OP_SUB:
                    r = v1 - v2;
                    break;
                case Lua_1.Lua.OP_MUL:
                    r = v1 * v2;
                    break;
                case Lua_1.Lua.OP_DIV:
                    if (v2 == 0.0)
                        return false; /* do not attempt to divide by 0 */
                    r = v1 / v2;
                    break;
                case Lua_1.Lua.OP_MOD:
                    if (v2 == 0.0)
                        return false; /* do not attempt to divide by 0 */
                    r = v1 % v2;
                    break;
                case Lua_1.Lua.OP_POW:
                    r = Lua_1.Lua.iNumpow(v1, v2); //TODO:L->Lua
                    break;
                case Lua_1.Lua.OP_UNM:
                    r = -v1;
                    break;
                case Lua_1.Lua.OP_LEN:
                    return false; /* no constant folding for 'len' */
                default:
                    //# assert false
                    r = 0.0;
                    break;
            }
            if (isNaN(r))
                return false; /* do not attempt to produce NaN */
            e1.nval = r;
            return true;
        }
        codenot(e) {
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VNIL:
                case Expdesc_1.Expdesc.VFALSE:
                    e.k = Expdesc_1.Expdesc.VTRUE;
                    break;
                case Expdesc_1.Expdesc.VK:
                case Expdesc_1.Expdesc.VKNUM:
                case Expdesc_1.Expdesc.VTRUE:
                    e.k = Expdesc_1.Expdesc.VFALSE;
                    break;
                case Expdesc_1.Expdesc.VJMP:
                    this.invertjump(e);
                    break;
                case Expdesc_1.Expdesc.VRELOCABLE:
                case Expdesc_1.Expdesc.VNONRELOC:
                    this.discharge2anyreg(e);
                    this.freeexp(e);
                    e.info = this.kCodeABC(Lua_1.Lua.OP_NOT, 0, e.info, 0);
                    e.k = Expdesc_1.Expdesc.VRELOCABLE;
                    break;
                default:
                    //# assert false
                    break;
            }
            /* interchange true and false lists */
            {
                var temp = e.f;
                e.f = e.t;
                e.t = temp;
            }
            this.removevalues(e.f);
            this.removevalues(e.t);
        }
        removevalues(list) {
            for (; list != FuncState.NO_JUMP; list = this.getjump(list))
                this.patchtestreg(list, Lua_1.Lua.NO_REG);
        }
        dischargejpc() {
            this.patchlistaux(this._jpc, this._pc, Lua_1.Lua.NO_REG, this._pc);
            this._jpc = FuncState.NO_JUMP;
        }
        discharge2reg(e, reg) {
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VNIL:
                    this.kNil(reg, 1);
                    break;
                case Expdesc_1.Expdesc.VFALSE:
                case Expdesc_1.Expdesc.VTRUE:
                    this.kCodeABC(Lua_1.Lua.OP_LOADBOOL, reg, (e.k == Expdesc_1.Expdesc.VTRUE ? 1 : 0), 0);
                    break;
                case Expdesc_1.Expdesc.VK:
                    this.kCodeABx(Lua_1.Lua.OP_LOADK, reg, e.info);
                    break;
                case Expdesc_1.Expdesc.VKNUM:
                    this.kCodeABx(Lua_1.Lua.OP_LOADK, reg, this.kNumberK(e.nval));
                    break;
                case Expdesc_1.Expdesc.VRELOCABLE:
                    this.setarga(e, reg);
                    break;
                case Expdesc_1.Expdesc.VNONRELOC:
                    if (reg != e.info) {
                        this.kCodeABC(Lua_1.Lua.OP_MOVE, reg, e.info, 0);
                    }
                    break;
                case Expdesc_1.Expdesc.VVOID:
                case Expdesc_1.Expdesc.VJMP:
                    return;
                default:
                //# assert false
            }
            e.nonreloc(reg);
        }
        exp2reg(e, reg) {
            this.discharge2reg(e, reg);
            if (e.k == Expdesc_1.Expdesc.VJMP) {
                e.t = this.kConcat(e.t, e.info); /* put this jump in `t' list */
            }
            if (e.hasjumps()) {
                var p_f = FuncState.NO_JUMP; /* position of an eventual LOAD false */
                var p_t = FuncState.NO_JUMP; /* position of an eventual LOAD true */
                if (this.need_value(e.t) || this.need_value(e.f)) {
                    var fj = (e.k == Expdesc_1.Expdesc.VJMP) ? FuncState.NO_JUMP : this.kJump();
                    p_f = this.code_label(reg, 0, 1);
                    p_t = this.code_label(reg, 1, 0);
                    this.kPatchtohere(fj);
                }
                var finalpos = this.kGetlabel(); /* position after whole expression */
                this.patchlistaux(e.f, finalpos, reg, p_f);
                this.patchlistaux(e.t, finalpos, reg, p_t);
            }
            e.init(Expdesc_1.Expdesc.VNONRELOC, reg);
        }
        code_label(a, b, jump) {
            this.kGetlabel(); /* those instructions may be jump targets */
            return this.kCodeABC(Lua_1.Lua.OP_LOADBOOL, a, b, jump);
        }
        /**
         * check whether list has any jump that do not produce a value
         * (or produce an inverted value)
         */
        need_value(list) {
            for (; list != FuncState.NO_JUMP; list = this.getjump(list)) {
                var i = this.getjumpcontrol(list);
                var instr = this._f.code[i];
                if (Lua_1.Lua.OPCODE(instr) != Lua_1.Lua.OP_TESTSET)
                    return true;
            }
            return false; /* not found */
        }
        freeexp(e) {
            if (e.kind == Expdesc_1.Expdesc.VNONRELOC) {
                this.__freereg(e.info);
            }
        }
        set freereg(freereg) {
            this._freereg = freereg;
        }
        get freereg() {
            return this._freereg;
        }
        __freereg(reg) {
            if (!Lua_1.Lua.ISK(reg) && reg >= this._nactvar) {
                --this._freereg;
                // assert reg == freereg;
            }
        }
        getcode(e) {
            return this._f.code[e.info];
        }
        setcode(e, code) {
            this._f.code[e.info] = code;
        }
        /** Equivalent to searchvar from lparser.c */
        searchvar(n) {
            // caution: descending loop (in emulation of PUC-Rio).
            for (var i = this._nactvar - 1; i >= 0; i--) {
                if (n == this.getlocvar(i).varname)
                    return i;
            }
            return -1; // not found
        }
        setarga(e, a) {
            var at = e.info;
            var code = this._f.code; //int[] 
            code[at] = Lua_1.Lua.SETARG_A(code[at], a);
        }
        setargb(e, b) {
            var at = e.info;
            var code = this._f.code; //int[] 
            code[at] = Lua_1.Lua.SETARG_B(code[at], b);
        }
        setargc(e, c) {
            var at = e.info;
            var code = this._f.code; //int[]
            code[at] = Lua_1.Lua.SETARG_C(code[at], c);
        }
        /** Equivalent to <code>luaK_getlabel</code>. */
        kGetlabel() {
            this._lasttarget = this._pc;
            return this._pc;
        }
        /**
        * Equivalent to <code>luaK_concat</code>.
        * l1 was an int*, now passing back as result.
        */
        kConcat(l1, l2) {
            if (l2 == FuncState.NO_JUMP)
                return l1;
            else if (l1 == FuncState.NO_JUMP)
                return l2;
            else {
                var list = l1;
                var next;
                while ((next = this.getjump(list)) != FuncState.NO_JUMP) /* find last element */
                    list = next;
                this.fixjump(list, l2);
                return l1;
            }
        }
        /** Equivalent to <code>luaK_patchlist</code>. */
        kPatchlist(list, target) {
            if (target == this._pc)
                this.kPatchtohere(list);
            else {
                //# assert target < pc
                this.patchlistaux(list, target, Lua_1.Lua.NO_REG, target);
            }
        }
        patchlistaux(list, vtarget, reg, dtarget) {
            while (list != FuncState.NO_JUMP) {
                var next = this.getjump(list);
                if (this.patchtestreg(list, reg))
                    this.fixjump(list, vtarget);
                else
                    this.fixjump(list, dtarget); /* jump to default target */
                list = next;
            }
        }
        patchtestreg(node, reg) {
            var i = this.getjumpcontrol(node);
            var code = this._f.code; //int [] 
            var instr = code[i];
            if (Lua_1.Lua.OPCODE(instr) != Lua_1.Lua.OP_TESTSET)
                return false; /* cannot patch other instructions */
            if (reg != Lua_1.Lua.NO_REG && reg != Lua_1.Lua.ARGB(instr))
                code[i] = Lua_1.Lua.SETARG_A(instr, reg);
            else /* no register to put value or register already has the value */
                code[i] = Lua_1.Lua.CREATE_ABC(Lua_1.Lua.OP_TEST, Lua_1.Lua.ARGB(instr), 0, Lua_1.Lua.ARGC(instr));
            return true;
        }
        getjumpcontrol(at) {
            var code = this._f.code; //int []
            if (at >= 1 && this.testTMode(Lua_1.Lua.OPCODE(code[at - 1])))
                return at - 1;
            else
                return at;
        }
        static opmode(t, a, b, c, m) {
            return ((t << 7) | (a << 6) | (b << 4) | (c << 2) | m);
        }
        getOpMode(m) {
            return FuncState.OPMODE[m] & 3;
        }
        testAMode(m) {
            return (FuncState.OPMODE[m] & (1 << 6)) != 0;
        }
        testTMode(m) {
            return (FuncState.OPMODE[m] & (1 << 7)) != 0;
        }
        /** Equivalent to <code>luaK_patchtohere</code>. */
        kPatchtohere(list) {
            this.kGetlabel();
            this._jpc = this.kConcat(this._jpc, list);
        }
        fixjump(at, dest) {
            var jmp = this._f.code[at];
            var offset = dest - (at + 1);
            //# assert dest != NO_JUMP
            if (Math.abs(offset) > Lua_1.Lua.MAXARG_sBx)
                this._ls.xSyntaxerror("control structure too long");
            this._f.code[at] = Lua_1.Lua.SETARG_sBx(jmp, offset);
        }
        getjump(at) {
            var offset = Lua_1.Lua.ARGsBx(this._f.code[at]);
            if (offset == FuncState.NO_JUMP) /* point to itself represents end of list */
                return FuncState.NO_JUMP; /* end of list */
            else
                return (at + 1) + offset; /* turn offset into absolute position */
        }
        /** Equivalent to <code>luaK_jump</code>. */
        kJump() {
            var old_jpc = this._jpc; /* save list of jumps to here */
            this._jpc = FuncState.NO_JUMP;
            var j = this.kCodeAsBx(Lua_1.Lua.OP_JMP, 0, FuncState.NO_JUMP);
            j = this.kConcat(j, old_jpc); /* keep them on hold */
            return j;
        }
        /** Equivalent to <code>luaK_storevar</code>. */
        kStorevar(_var, ex) {
            switch (_var.k) {
                case Expdesc_1.Expdesc.VLOCAL:
                    {
                        this.freeexp(ex);
                        this.exp2reg(ex, _var.info);
                        return;
                    }
                case Expdesc_1.Expdesc.VUPVAL:
                    {
                        var e = this.kExp2anyreg(ex);
                        this.kCodeABC(Lua_1.Lua.OP_SETUPVAL, e, _var.info, 0);
                        break;
                    }
                case Expdesc_1.Expdesc.VGLOBAL:
                    {
                        var e2 = this.kExp2anyreg(ex);
                        this.kCodeABx(Lua_1.Lua.OP_SETGLOBAL, e2, _var.info);
                        break;
                    }
                case Expdesc_1.Expdesc.VINDEXED:
                    {
                        var e3 = this.kExp2RK(ex);
                        this.kCodeABC(Lua_1.Lua.OP_SETTABLE, _var.info, _var.aux, e3);
                        break;
                    }
                default:
                    {
                        /* invalid var kind to store */
                        //# assert false
                        break;
                    }
            }
            this.freeexp(ex);
        }
        /** Equivalent to <code>luaK_indexed</code>. */
        kIndexed(t, k) {
            t.aux = this.kExp2RK(k);
            t.k = Expdesc_1.Expdesc.VINDEXED;
        }
        /** Equivalent to <code>luaK_exp2RK</code>. */
        kExp2RK(e) {
            this.kExp2val(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VKNUM:
                case Expdesc_1.Expdesc.VTRUE:
                case Expdesc_1.Expdesc.VFALSE:
                case Expdesc_1.Expdesc.VNIL:
                    if (this._nk <= Lua_1.Lua.MAXINDEXRK) /* constant fit in RK operand? */ {
                        e.info = (e.k == Expdesc_1.Expdesc.VNIL) ? this.nilK() :
                            (e.k == Expdesc_1.Expdesc.VKNUM) ? this.kNumberK(e.nval) :
                                this.boolK(e.k == Expdesc_1.Expdesc.VTRUE);
                        e.k = Expdesc_1.Expdesc.VK;
                        return e.info | Lua_1.Lua.BITRK;
                    }
                    else
                        break;
                case Expdesc_1.Expdesc.VK:
                    if (e.info <= Lua_1.Lua.MAXINDEXRK) /* constant fit in argC? */
                        return e.info | Lua_1.Lua.BITRK;
                    else
                        break;
                default:
                    break;
            }
            /* not a constant in the right range: put it in a register */
            return this.kExp2anyreg(e);
        }
        /** Equivalent to <code>luaK_exp2val</code>. */
        kExp2val(e) {
            if (e.hasjumps())
                this.kExp2anyreg(e);
            else
                this.kDischargevars(e);
        }
        boolK(b) {
            return this.addk(Lua_1.Lua.valueOfBoolean(b));
        }
        nilK() {
            return this.addk(Lua_1.Lua.NIL);
        }
        /** Equivalent to <code>luaK_goiffalse</code>. */
        kGoiffalse(e) {
            var lj; /* pc of last jump */
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VNIL:
                case Expdesc_1.Expdesc.VFALSE:
                    lj = FuncState.NO_JUMP; /* always false; do nothing */
                    break;
                case Expdesc_1.Expdesc.VTRUE:
                    lj = this.kJump(); /* always jump */
                    break;
                case Expdesc_1.Expdesc.VJMP:
                    lj = e.info;
                    break;
                default:
                    lj = this.jumponcond(e, true);
                    break;
            }
            e.t = this.kConcat(e.t, lj); /* insert last jump in `t' list */
            this.kPatchtohere(e.f);
            e.f = FuncState.NO_JUMP;
        }
        /** Equivalent to <code>luaK_goiftrue</code>. */
        kGoiftrue(e) {
            var lj; /* pc of last jump */
            this.kDischargevars(e);
            switch (e.k) {
                case Expdesc_1.Expdesc.VK:
                case Expdesc_1.Expdesc.VKNUM:
                case Expdesc_1.Expdesc.VTRUE:
                    lj = FuncState.NO_JUMP; /* always true; do nothing */
                    break;
                case Expdesc_1.Expdesc.VFALSE:
                    lj = this.kJump(); /* always jump */
                    break;
                case Expdesc_1.Expdesc.VJMP:
                    this.invertjump(e);
                    lj = e.info;
                    break;
                default:
                    lj = this.jumponcond(e, false);
                    break;
            }
            e.f = this.kConcat(e.f, lj); /* insert last jump in `f' list */
            this.kPatchtohere(e.t);
            e.t = FuncState.NO_JUMP;
        }
        invertjump(e) {
            var at = this.getjumpcontrol(e.info);
            var code = this._f.code; //int []
            var instr = code[at];
            //# assert testTMode(Lua.OPCODE(instr)) && Lua.OPCODE(instr) != Lua.OP_TESTSET && Lua.OPCODE(instr) != Lua.OP_TEST
            code[at] = Lua_1.Lua.SETARG_A(instr, (Lua_1.Lua.ARGA(instr) == 0 ? 1 : 0));
        }
        jumponcond(e, cond) {
            if (e.k == Expdesc_1.Expdesc.VRELOCABLE) {
                var ie = this.getcode(e);
                if (Lua_1.Lua.OPCODE(ie) == Lua_1.Lua.OP_NOT) {
                    this._pc--; /* remove previous OP_NOT */
                    return this.condjump(Lua_1.Lua.OP_TEST, Lua_1.Lua.ARGB(ie), 0, cond ? 0 : 1);
                }
                /* else go through */
            }
            this.discharge2anyreg(e);
            this.freeexp(e);
            return this.condjump(Lua_1.Lua.OP_TESTSET, Lua_1.Lua.NO_REG, e.info, cond ? 1 : 0);
        }
        condjump(op, a, b, c) {
            this.kCodeABC(op, a, b, c);
            return this.kJump();
        }
        discharge2anyreg(e) {
            if (e.k != Expdesc_1.Expdesc.VNONRELOC) {
                this.kReserveregs(1);
                this.discharge2reg(e, this._freereg - 1);
            }
        }
        kSelf(e, key) {
            this.kExp2anyreg(e);
            this.freeexp(e);
            var func = this._freereg;
            this.kReserveregs(2);
            this.kCodeABC(Lua_1.Lua.OP_SELF, func, e.info, this.kExp2RK(key));
            this.freeexp(key);
            e.info = func;
            e.k = Expdesc_1.Expdesc.VNONRELOC;
        }
        kSetlist(base, nelems, tostore) {
            var c = (nelems - 1) / Lua_1.Lua.LFIELDS_PER_FLUSH + 1;
            var b = (tostore == Lua_1.Lua.MULTRET) ? 0 : tostore;
            //# assert tostore != 0
            if (c <= Lua_1.Lua.MAXARG_C)
                this.kCodeABC(Lua_1.Lua.OP_SETLIST, base, b, c);
            else {
                this.kCodeABC(Lua_1.Lua.OP_SETLIST, base, b, 0);
                this.kCode(c, this._ls.lastline);
            }
            this._freereg = base + 1; /* free registers with list values */
        }
        codecomp(op, cond, e1, e2) {
            var o1 = this.kExp2RK(e1);
            var o2 = this.kExp2RK(e2);
            this.freeexp(e2);
            this.freeexp(e1);
            if ((!cond) && op != Lua_1.Lua.OP_EQ) {
                /* exchange args to replace by `<' or `<=' */
                var temp = o1;
                o1 = o2;
                o2 = temp; /* o1 <==> o2 */
                cond = true;
            }
            e1.info = this.condjump(op, (cond ? 1 : 0), o1, o2);
            e1.k = Expdesc_1.Expdesc.VJMP;
        }
        markupval(level) {
            var b = this.bl;
            while (b != null && b.nactvar > level)
                b = b.previous;
            if (b != null)
                b.upval = true;
        }
        //新增
        get f() {
            return this._f;
        }
        //新增
        set f(f) {
            this._f = f;
        }
        //新增
        get prev() {
            return this._prev;
        }
        //新增
        set prev(prev) {
            this._prev = prev;
        }
        //新增
        set ls(ls) {
            this._ls = ls;
        }
        //新增
        set L(L) {
            this._L = L;
        }
        //新增
        get bl() {
            return this._bl;
        }
        //新增
        set bl(bl) {
            this._bl = bl;
        }
        //新增
        get pc() {
            return this._pc;
        }
        //新增
        get np() {
            return this._np;
        }
        //新增
        set np(np) {
            this._np = np;
        }
        //新增
        get nlocvars() {
            return this._nlocvars;
        }
        //新增
        set nlocvars(nlocvars) {
            this._nlocvars = nlocvars;
        }
        //新增
        get nactvar() {
            return this._nactvar;
        }
        //新增
        set nactvar(nactvar) {
            this._nactvar = nactvar;
        }
        //新增
        get upvalues() {
            return this._upvalues;
        }
        //新增
        get actvar() {
            return this._actvar;
        }
    }
    exports.FuncState = FuncState;
    /** See NO_JUMP in lcode.h. */
    FuncState.NO_JUMP = -1;
    /*
    ** masks for instruction properties. The format is:
    ** bits 0-1: op mode
    ** bits 2-3: C arg mode
    ** bits 4-5: B arg mode
    ** bit 6: instruction set register A
    ** bit 7: operator is a test
    */
    /** arg modes */
    FuncState.OP_ARG_N = 0;
    FuncState.OP_ARG_U = 1;
    FuncState.OP_ARG_R = 2;
    FuncState.OP_ARG_K = 3;
    /** op modes */
    FuncState.iABC = 0;
    FuncState.iABx = 1;
    FuncState.iAsBx = 2;
    FuncState.OPMODE = [
        /*      T  A  B         C         mode                opcode  */
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_MOVE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx) /* OP_LOADK */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_LOADBOOL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_LOADNIL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_GETUPVAL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx) /* OP_GETGLOBAL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC) /* OP_GETTABLE */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_N, FuncState.iABx) /* OP_SETGLOBAL */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_SETUPVAL */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_SETTABLE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_NEWTABLE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_K, FuncState.iABC) /* OP_SELF */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_ADD */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_SUB */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_MUL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_DIV */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_MOD */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_POW */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_UNM */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_NOT */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iABC) /* OP_LEN */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_R, FuncState.iABC) /* OP_CONCAT */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx) /* OP_JMP */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_EQ */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_LT */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_K, FuncState.OP_ARG_K, FuncState.iABC) /* OP_LE */,
        FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TEST */,
        FuncState.opmode(1, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TESTSET */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_CALL */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TAILCALL */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_RETURN */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx) /* OP_FORLOOP */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_R, FuncState.OP_ARG_N, FuncState.iAsBx) /* OP_FORPREP */,
        FuncState.opmode(1, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_U, FuncState.iABC) /* OP_TFORLOOP */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_U, FuncState.OP_ARG_U, FuncState.iABC) /* OP_SETLIST */,
        FuncState.opmode(0, 0, FuncState.OP_ARG_N, FuncState.OP_ARG_N, FuncState.iABC) /* OP_CLOSE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABx) /* OP_CLOSURE */,
        FuncState.opmode(0, 1, FuncState.OP_ARG_U, FuncState.OP_ARG_N, FuncState.iABC) /* OP_VARARG */
    ];
});

},{"../java/Hashtable":9,"../java/IllegalArgumentException":12,"./Expdesc":38,"./Lua":45,"./Proto":56,"./Syntax":60}],42:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Expdesc"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LHSAssign = void 0;
    const Expdesc_1 = require("./Expdesc");
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
    class LHSAssign {
        //TODO:
        constructor() {
            this._prev = null;
            this._v = new Expdesc_1.Expdesc();
        }
        init(prev) {
            this._prev = prev;
        }
        //新增
        get prev() {
            return this._prev;
        }
        //新增
        set prev(prev) {
            this._prev = prev;
        }
        //新增
        get v() {
            return this._v;
        }
    }
    exports.LHSAssign = LHSAssign;
});

},{"./Expdesc":38}],43:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/EOFException", "../java/IOException", "../java/NullPointerException", "../java/ByteArray", "./Proto", "./Slot", "./LocVar", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Loader = void 0;
    const EOFException_1 = require("../java/EOFException");
    const IOException_1 = require("../java/IOException");
    const NullPointerException_1 = require("../java/NullPointerException");
    const ByteArray_1 = require("../java/ByteArray");
    const Proto_1 = require("./Proto");
    const Slot_1 = require("./Slot");
    const LocVar_1 = require("./LocVar");
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Loader.java#1 $
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
     * Loads Lua 5.1 binary chunks.
     * This loader is restricted to loading Lua 5.1 binary chunks where:
     * <ul>
     * <li><code>LUAC_VERSION</code> is <code>0x51</code>.</li>
     * <li><code>int</code> is 32 bits.</li>
     * <li><code>size_t</code> is 32 bits.</li>
     * <li><code>Instruction</code> is 32 bits (this is a type defined in
     * the PUC-Rio Lua).</li>
     * <li><code>lua_Number</code> is an IEEE 754 64-bit double.  Suitable
     * for passing to {@link java.lang.Double#longBitsToDouble}.</li>
     * <li>endianness does not matter (the loader swabs as appropriate).</li>
     * </ul>
     * Any Lua chunk compiled by a stock Lua 5.1 running on a 32-bit Windows
     * PC or at 32-bit OS X machine should be fine.
     */
    class Loader {
        /**
        * A new chunk loader.  The <code>InputStream</code> must be
        * positioned at the beginning of the <code>LUA_SIGNATURE</code> that
        * marks the beginning of a Lua binary chunk.
        * @param in    The binary stream from which the chunk is read.
        * @param name  The name of the chunk.
        */
        constructor(_in, name) {
            /**
             * Whether integers in the binary chunk are stored big-endian or
             * little-endian.  Recall that the number 0x12345678 is stored: 0x12
             * 0x34 0x56 0x78 in big-endian format; and, 0x78 0x56 0x34 0x12 in
             * little-endian format.
             */
            this._bigendian = false;
            //TODO:这里有问题
            // auxiliary for reading ints/numbers
            this._intbuf = new ByteArray_1.ByteArray(); //new Array(4) ; //byte [] 
            this._longbuf = new ByteArray_1.ByteArray(); //new Array(8) ; //byte [] 
            if (null == _in) {
                throw new NullPointerException_1.NullPointerException();
            }
            this._in = _in;
            // The name is treated slightly.  See lundump.c in the PUC-Rio
            // source for details.
            if (name.substr(0, 1) == "@" || name.substr(0, 1) == "=") {
                this._name = name.substring(1);
            }
            else if (false) {
                // :todo: Select some equivalent for the binary string case.
                this._name = "binary string";
            }
            else {
                this._name = name;
            }
        }
        /**
         * Loads (undumps) a dumped binary chunk.
         * @throws IOException  if chunk is malformed or unacceptable.
         */
        undump() {
            this.header();
            return this._function(null);
        }
        /**
         * Primitive reader for undumping.
         * Reads exactly enough bytes from <code>this.in</code> to fill the
         * array <code>b</code>.  If there aren't enough to fill
         * <code>b</code> then an exception is thrown.  Similar to
         * <code>LoadBlock</code> from PUC-Rio's <code>lundump.c</code>.
         * @param b  byte array to fill.
         * @throws EOFException when the stream is exhausted too early.
         * @throws IOException when the underlying stream does.
         */
        block(b) {
            var n = this._in.readBytes(b);
            if (n != b.length)
                throw new EOFException_1.EOFException();
        }
        /**
         * Undumps a byte as an 8 bit unsigned number.  Returns
         * an int to accommodate the range.
         */
        byteLoad() {
            var c = this._in.read();
            if (c == -1)
                throw new EOFException_1.EOFException();
            else
                return c & 0xFF; // paranoia
        }
        /**
         * Undumps the code for a <code>Proto</code>.  The code is an array of
         * VM instructions.
         */
        code() {
            var n = this.intLoad();
            var code = new Array(n); //int[] 
            for (var i = 0; i < n; ++i) {
                // :Instruction:size  Here we assume that a dumped Instruction is
                // the same size as a dumped int.
                code[i] = this.intLoad();
            }
            return code;
        }
        /**
         * Undumps the constant array contained inside a <code>Proto</code>
         * object.  First half of <code>LoadConstants</code>, see
         * <code>proto</code> for the second half of
         * <code>LoadConstants</code>.
         */
        constant() {
            var n = this.intLoad();
            var k = new Array(n); //Slot[] 
            // Load each constant one by one.  We use the following values for
            // the Lua tagtypes (taken from <code>lua.h</code> from the PUC-Rio
            // Lua 5.1 distribution):
            // LUA_TNIL         0
            // LUA_TBOOLEAN     1
            // LUA_TNUMBER      3
            // LUA_TSTRING      4
            // All other tagtypes are invalid
            // :todo: Currently a new Slot is created for each constant.
            // Consider a space optimisation whereby identical constants have
            // the same Slot.  Constants are pooled per function anyway (so a
            // function never has 2 identical constants), so would have to work
            // across functions.  The easy cases of nil, true, false, might be
            // worth doing since that doesn't require a global table.
            // 
            for (var i = 0; i < n; ++i) {
                var t = this.byteLoad();
                switch (t) {
                    case 0: // LUA_TNIL
                        k[i] = new Slot_1.Slot();
                        k[i].init2(Lua_1.Lua.NIL); //TODO:
                        break;
                    case 1: // LUA_TBOOLEAN
                        var b = this.byteLoad();
                        // assert b >= 0;
                        if (b > 1)
                            throw new IOException_1.IOException();
                        k[i] = new Slot_1.Slot();
                        k[i].init2(Lua_1.Lua.valueOfBoolean(b != 0));
                        break;
                    case 3: // LUA_TNUMBER
                        k[i] = new Slot_1.Slot();
                        k[i].init2(this.number());
                        break;
                    case 4: // LUA_TSTRING
                        k[i] = new Slot_1.Slot();
                        k[i].init2(this.string());
                        break;
                    default:
                        throw new IOException_1.IOException();
                }
            }
            return k;
        }
        /**
         * Undumps the debug info for a <code>Proto</code>.
         * @param proto  The Proto instance to which debug info will be added.
         */
        debug(proto) {
            // lineinfo
            var n = this.intLoad();
            var lineinfo = new Array(n); //int[] 
            for (var i = 0; i < n; ++i) {
                lineinfo[i] = this.intLoad();
            }
            // locvars
            n = this.intLoad();
            var locvar = new Array(n); //LocVar[] 
            for (i = 0; i < n; ++i) {
                var s = this.string();
                var start = this.intLoad();
                var end = this.intLoad();
                locvar[i] = new LocVar_1.LocVar();
                locvar[i].init(s, start, end);
            }
            // upvalue (names)
            n = this.intLoad();
            var upvalue = new Array(n); //String[]
            for (i = 0; i < n; ++i) {
                upvalue[i] = this.string();
            }
            proto.debug(lineinfo, locvar, upvalue);
            return;
        }
        /**
         * Undumps a Proto object.  This is named 'function' after
         * <code>LoadFunction</code> in PUC-Rio's <code>lundump.c</code>.
         * @param parentSource  Name of parent source "file".
         * @throws IOException  when binary is malformed.
         */
        _function(parentSource) {
            var source;
            var linedefined;
            var lastlinedefined;
            var nups;
            var numparams;
            var varargByte;
            var vararg;
            var maxstacksize;
            var code; //int[] 
            var constant; //Slot[] 
            var proto; //Proto[] 
            source = this.string();
            if (null == source) {
                source = parentSource;
            }
            linedefined = this.intLoad();
            lastlinedefined = this.intLoad();
            nups = this.byteLoad();
            numparams = this.byteLoad();
            varargByte = this.byteLoad();
            // "is_vararg" is a 3-bit field, with the following bit meanings
            // (see "lobject.h"):
            // 1 - VARARG_HASARG
            // 2 - VARARG_ISVARARG
            // 4 - VARARG_NEEDSARG
            // Values 1 and 4 (bits 0 and 2) are only used for 5.0
            // compatibility.
            // HASARG indicates that a function was compiled in 5.0
            // compatibility mode and is declared to have ... in its parameter
            // list.
            // NEEDSARG indicates that a function was compiled in 5.0
            // compatibility mode and is declared to have ... in its parameter
            // list and does _not_ use the 5.1 style of vararg access (using ...
            // as an expression).  It is assumed to use 5.0 style vararg access
            // (the local 'arg' variable).  This is not supported in Jill.
            // ISVARARG indicates that a function has ... in its parameter list
            // (whether compiled in 5.0 compatibility mode or not).
            //
            // At runtime NEEDSARG changes the protocol for calling a vararg
            // function.  We don't support this, so we check that it is absent
            // here in the loader.
            //
            // That means that the legal values for this field ar 0,1,2,3.
            if (varargByte < 0 || varargByte > 3) {
                throw new IOException_1.IOException();
            }
            vararg = (0 != varargByte);
            maxstacksize = this.byteLoad();
            code = this.code();
            constant = this.constant();
            proto = this.proto(source);
            var newProto = new Proto_1.Proto();
            newProto.init1(constant, code, proto, nups, numparams, vararg, maxstacksize); //TODO:
            newProto.source = source;
            newProto.linedefined = linedefined;
            newProto.lastlinedefined = lastlinedefined;
            this.debug(newProto);
            // :todo: call code verifier
            return newProto;
        }
        /**
         * Loads and checks the binary chunk header.  Sets
         * <code>this.bigendian</code> accordingly.
         *
         * A Lua 5.1 header looks like this:
         * <pre>
             * b[0]    0x33
             * b[1..3] "Lua";
             * b[4]    0x51 (LUAC_VERSION)
             * b[5]    0 (LUAC_FORMAT)
             * b[6]    0 big-endian, 1 little-endian
             * b[7]    4 (sizeof(int))
             * b[8]    4 (sizeof(size_t))
             * b[9]    4 (sizeof(Instruction))
             * b[10]   8 (sizeof(lua_Number))
             * b[11]   0 (floating point)
             * </pre>
             *
             * To conserve JVM bytecodes the sizes of the types <code>int</code>,
             * <code>size_t</code>, <code>Instruction</code>,
             * <code>lua_Number</code> are assumed by the code to be 4, 4, 4, and
             * 8, respectively.  Where this assumption is made the tags :int:size,
             * :size_t:size :Instruction:size :lua_Number:size will appear so that
             * you can grep for them, should you wish to modify this loader to
             * load binary chunks from different architectures.
             *
             * @throws IOException  when header is malformed or not suitable.
             */
        header() {
            //TODO:Java to AS3
            var buf = new ByteArray_1.ByteArray(); // (HEADERSIZE); //byte[]
            var arrBuf = new Array(Loader.HEADERSIZE);
            for (var i = 0; i < Loader.HEADERSIZE; i++) {
                arrBuf[i] = 0;
            }
            var n;
            this.block(buf);
            for (i = 0; i < Loader.HEADERSIZE; i++) {
                arrBuf[i] = buf.readByte();
            }
            // poke the HEADER's endianness byte and compare.
            Loader.HEADER[6] = arrBuf[6];
            if (buf.get(6) < 0 || buf.get(6) > 1 || !Loader.arrayEquals(Loader.HEADER, arrBuf)) {
                throw new IOException_1.IOException();
            }
            this._bigendian = (buf.get(6) == 0);
        }
        /**
         * Undumps an int.  This method swabs accordingly.
         * size_t and Instruction need swabbing too, but the code
         * simply uses this method to load size_t and Instruction.
         */
        intLoad() {
            // :int:size  Here we assume an int is 4 bytes.
            this.block(this._intbuf);
            var i;
            // Caution: byte is signed so "&0xff" converts to unsigned value.
            if (this._bigendian) {
                i = ((this._intbuf.get(0) & 0xff) << 24) | ((this._intbuf.get(1) & 0xff) << 16) |
                    ((this._intbuf.get(2) & 0xff) << 8) | (this._intbuf.get(3) & 0xff);
            }
            else {
                i = ((this._intbuf.get(3) & 0xff) << 24) | ((this._intbuf.get(2) & 0xff) << 16) |
                    ((this._intbuf.get(1) & 0xff) << 8) | (this._intbuf.get(0) & 0xff);
            }
            return i;
            /* minimum footprint version?
            int result = 0 ;
            for (int shift = 0 ; shift < 32 ; shift+=8)
            {
                int byt = byteLoad () ;
                if (bigendian)
                result = (result << 8) | byt ;
                else
                result |= byt << shift ;
            }
            return result ;
            */
            /* another version?
            if (bigendian)
            {
                int result = byteLoad() << 24 ;
                result |= byteLoad () << 16 ;
                result |= byteLoad () << 8 ;
                result |= byteLoad () ;
                return result;
            }
            else
            {
                int result = byteLoad() ;
                result |= byteLoad () << 8 ;
                result |= byteLoad () << 16 ;
                result |= byteLoad () << 24 ;
                return result ;
            }
            */
        }
        /**
         * Undumps a Lua number.  Which is assumed to be a 64-bit IEEE double.
         */
        number() {
            // :lua_Number:size  Here we assume that the size is 8.
            this.block(this._longbuf);
            // Big-endian architectures store doubles with the sign bit first;
            // little-endian is the other way around.
            var l = 0;
            for (var i = 0; i < 8; ++i) {
                if (this._bigendian)
                    l = (l << 8) | (this._longbuf.get(i) & 0xff);
                else
                    l = (l >>> 8) | ((this._longbuf.get(i) & 0xff) << 56);
            }
            //TODO:
            var d = l; //Double.longBitsToDouble(l);
            return Lua_1.Lua.valueOfNumber(d);
        }
        /**
         * Undumps the <code>Proto</code> array contained inside a
         * <code>Proto</code> object.  These are the <code>Proto</code>
         * objects for all inner functions defined inside an existing
         * function.  Corresponds to the second half of PUC-Rio's
         * <code>LoadConstants</code> function.  See <code>constant</code> for
         * the first half.
         */
        proto(source) {
            var n = this.intLoad();
            var p = new Array(n); //Proto[] 
            for (var i = 0; i < n; ++i) {
                p[i] = this._function(source);
            }
            return p;
        }
        /**
         * Undumps a {@link String} or <code>null</code>.  As per
         * <code>LoadString</code> in
         * PUC-Rio's lundump.c.  Strings are converted from the binary
         * using the UTF-8 encoding, using the {@link
         * java.lang.String#String(byte[], String) String(byte[], String)}
         * constructor.
         */
        string() {
            // :size_t:size we assume that size_t is same size as int.
            var size = this.intLoad();
            if (size == 0) {
                return null;
            }
            //var buf:Array = new Array(size - 1); //byte[]
            var buf = new ByteArray_1.ByteArray();
            this.block(buf);
            // Discard trailing NUL byte
            if (this._in.read() == -1)
                throw new EOFException_1.EOFException();
            return buf.readUTFBytes(size - 1); //(new String(buf, "UTF-8")).intern();
        }
        /**
         * CLDC 1.1 does not provide <code>java.util.Arrays</code> so we make
         * do with this.
         */
        static arrayEquals(x, y) {
            if (x.length != y.length) {
                return false;
            }
            for (var i = 0; i < x.length; ++i) {
                if (x[i] != y[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.Loader = Loader;
    Loader.HEADERSIZE = 12;
    /** A chunk header that is correct.  Except for the endian byte, at
     * index 6, which is always overwritten with the one from the file,
     * before comparison.  We cope with either endianness.
     * Default access so that {@link Lua#load} can read the first entry.
     * On no account should anyone except {@link #header} modify
     * this array.
     */
    Loader.HEADER = [
        parseInt("033", 8), ('L'.charCodeAt(0)), ('u'.charCodeAt(0)), ('a'.charCodeAt(0)),
        0x51, 0, 99, 4,
        4, 4, 8, 0
    ];
});

},{"../java/ByteArray":2,"../java/EOFException":7,"../java/IOException":11,"../java/NullPointerException":16,"./LocVar":44,"./Lua":45,"./Proto":56,"./Slot":57}],44:[function(require,module,exports){
/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LocVar.java#1 $
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
    exports.LocVar = void 0;
    //see jillcode(Java Implementation of Lua Language, Jill):
    //	http://code.google.com/p/jillcode/
    //这里的代码移植自jillcode(Lua的Java实现，Jill):
    //	http://code.google.com/p/jillcode/	
    class LocVar {
        constructor() {
            this._varname = null;
            this._startpc = 0;
            this._endpc = 0;
        }
        init(varname, startpc, endpc) {
            this._varname = varname;
            this._startpc = startpc;
            this._endpc = endpc;
        }
        //新增
        get varname() {
            return this._varname;
        }
        //新增
        set varname(varname) {
            this._varname = varname;
        }
        //新增
        get startpc() {
            return this._startpc;
        }
        //新增
        set startpc(startpc) {
            this._startpc = startpc;
        }
        //新增
        get endpc() {
            return this._endpc;
        }
        //新增
        set endpc(endpc) {
            this._endpc = endpc;
        }
    }
    exports.LocVar = LocVar;
});

},{}],45:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/DataOutputStream", "../java/IOException", "../java/IllegalArgumentException", "../java/NullPointerException", "../java/NumberFormatException", "../java/OutOfMemoryError", "../java/Runtime", "../java/RuntimeException", "../java/Stack", "../java/StringBuffer", "../java/SystemUtil", "./Slot", "./LuaTable", "./CallInfo", "./LuaFunction", "./LuaJavaCallback", "./LuaUserdata", "./LuaError", "./Debug", "./StringReader", "./LuaInternal", "./UpVal", "./FormatItem", "./DumpState"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Lua = void 0;
    const DataOutputStream_1 = require("../java/DataOutputStream");
    const IOException_1 = require("../java/IOException");
    const IllegalArgumentException_1 = require("../java/IllegalArgumentException");
    const NullPointerException_1 = require("../java/NullPointerException");
    const NumberFormatException_1 = require("../java/NumberFormatException");
    const OutOfMemoryError_1 = require("../java/OutOfMemoryError");
    const Runtime_1 = require("../java/Runtime");
    const RuntimeException_1 = require("../java/RuntimeException");
    const Stack_1 = require("../java/Stack");
    const StringBuffer_1 = require("../java/StringBuffer");
    const SystemUtil_1 = require("../java/SystemUtil");
    const Slot_1 = require("./Slot");
    const LuaTable_1 = require("./LuaTable");
    const CallInfo_1 = require("./CallInfo");
    const LuaFunction_1 = require("./LuaFunction");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    const LuaUserdata_1 = require("./LuaUserdata");
    const LuaError_1 = require("./LuaError");
    const Debug_1 = require("./Debug");
    const StringReader_1 = require("./StringReader");
    const LuaInternal_1 = require("./LuaInternal");
    const UpVal_1 = require("./UpVal");
    const FormatItem_1 = require("./FormatItem");
    const DumpState_1 = require("./DumpState");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Lua.java#3 $
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
     * <p>
     * Encapsulates a Lua execution environment.  A lot of Jill's public API
     * manifests as public methods in this class.  A key part of the API is
     * the ability to call Lua functions from Java (ultimately, all Lua code
     * is executed in this manner).
     * </p>
     *
     * <p>
     * The Stack
     * </p>
     *
     * <p>
     * All arguments to Lua functions and all results returned by Lua
     * functions are placed onto a stack.  The stack can be indexed by an
     * integer in the same way as the PUC-Rio implementation.  A positive
     * index is an absolute index and ranges from 1 (the bottom-most
     * element) through to <var>n</var> (the top-most element),
     * where <var>n</var> is the number of elements on the stack.  Negative
     * indexes are relative indexes, -1 is the top-most element, -2 is the
     * element underneath that, and so on.  0 is not used.
     * </p>
     *
     * <p>
     * Note that in Jill the stack is used only for passing arguments and
     * returning results, unlike PUC-Rio.
     * </p>
     *
     * <p>
     * The protocol for calling a function is described in the {@link #call}
     * method.  In brief: push the function onto the stack, then push the
     * arguments to the call.
     * </p>
     *
     * <p>
     * The methods {@link #push}, {@link #pop}, {@link #value},
     * {@link #getTop}, {@link #setTop} are used to manipulate the stack.
     * </p>
     */
    class Lua {
        /**
         * Used to construct a Lua thread that shares its global state with
         * another Lua state.
         */
        constructor(L) {
            /** VM data stack.
            */
            this._stack = new Array(); //TODO:=0? Slot[] 
            /**
            * One more than the highest stack slot that has been written to
            * (ever).
            * Used by {@link #stacksetsize} to determine which stack slots
            * need nilling when growing the stack.
            */
            this._stackhighwater = 0; // = 0;
            /**
            * Number of active elemements in the VM stack.  Should always be
            * <code><= stack.length</code>.
            */
            this._stackSize = 0; // = 0;
            /**
            * The base stack element for this stack frame.  If in a Lua function
            * then this is the element indexed by operand field 0; if in a Java
            * functipn then this is the element indexed by Lua.value(1).
            */
            this._base = 0; // = 0;
            //TODO:public
            this._nCcalls = 0; // = 0;
            /** Instruction to resume execution at.  Index into code array. */
            this._savedpc = 0; // = 0;
            /**
            * Vector of CallInfo records.  Actually it's a Stack which is a
            * subclass of Vector, but it mostly the Vector methods that are used.
            */
            this._civ = new Stack_1.Stack();
            /** Open Upvalues.  All UpVal objects that reference the VM stack.
            * openupval is a java.util.Vector of UpVal stored in order of stack
            * slot index: higher stack indexes are stored at higher Vector
            * positions.
            */
            this._openupval = new Array(); //Vector = new Vector();
            this._hookcount = 0;
            this._basehookcount = 0;
            this._allowhook = true;
            this._hook = null;
            this._hookmask = 0;
            /**
            * The current error handler (set by {@link #pcall}).  A Lua
            * function to call.
            */
            this._errfunc = null;
            /**
            * thread activation status.
            */
            this._status = 0;
            if (L == null) {
                //Creates a fresh Lua state.
                this._global = new LuaTable_1.LuaTable();
                this._registry = new LuaTable_1.LuaTable();
                this._metatable = new Array(Lua.NUM_TAGS); //LuaTable[]
                this._main = this;
            }
            else {
                // Copy the global state, that's shared across all threads that
                // share the same main thread, into the new Lua thread.
                // Any more than this and the global state should be shunted to a
                // separate object (as it is in PUC-Rio).
                this._global = L._global;
                this._registry = L._registry;
                this._metatable = L._metatable;
                this._main = (L == null ? L : this);
            }
            //TODO:附加操作，初始化CallInfo堆栈
            this.initCiv();
        }
        //TODO:
        initCiv() {
            this._civ.addElement(new CallInfo_1.CallInfo());
        }
        /** CallInfo record for currently active function. */
        __ci() {
            return this._civ.lastElement();
        }
        /**
         * Calls a Lua value.  Normally this is called on functions, but the
         * semantics of Lua permit calls on any value as long as its metatable
         * permits it.
         *
         * In order to call a function, the function must be
         * pushed onto the stack, then its arguments must be
         * {@link #push pushed} onto the stack; the first argument is pushed
         * directly after the function,
         * then the following arguments are pushed in order (direct
         * order).  The parameter <var>nargs</var> specifies the number of
         * arguments (which may be 0).
         *
         * When the function returns the function value on the stack and all
         * the arguments are removed from the stack and replaced with the
         * results of the function, adjusted to the number specified by
         * <var>nresults</var>.  So the first result from the function call will
         * be at the same index where the function was immediately prior to
         * calling this method.
         *
         * @param nargs     The number of arguments in this function call.
         * @param nresults  The number of results required.
         */
        call(nargs, nresults) {
            this.apiChecknelems(nargs + 1);
            var func = this._stackSize - (nargs + 1);
            this.vmCall(func, nresults);
        }
        /**
         * Closes a Lua state.  In this implementation, this method does
         * nothing.
         */
        close() {
        }
        /**
         * Concatenate values (usually strings) on the stack.
         * <var>n</var> values from the top of the stack are concatenated, as
         * strings, and replaced with the resulting string.
         * @param n  the number of values to concatenate.
         */
        concat(n) {
            this.apiChecknelems(n);
            if (n >= 2) {
                this.vmConcat(n, (this._stackSize - this._base) - 1);
                this.pop(n - 1);
            }
            else if (n == 0) // push empty string
             {
                this.pushString("");
            } // else n == 1; nothing to do
        }
        /**
        * Creates a new empty table and returns it.
        * @param narr  number of array elements to pre-allocate.
        * @param nrec  number of non-array elements to pre-allocate.
        * @return a fresh table.
        * @see #newTable
        */
        createTable(narr, nrec) {
            var t = new LuaTable_1.LuaTable();
            t.init(narr, nrec);
            return t;
        }
        /**
         * Dumps a function as a binary chunk.
         * @param function  the Lua function to dump.
         * @param writer    the stream that receives the dumped binary.
         * @throws IOException when writer does.
         */
        static dump(_function, writer) {
            if (!(_function instanceof LuaFunction_1.LuaFunction)) {
                throw new IOException_1.IOException("Cannot dump " + this.typeName(this.____type(_function)));
            }
            var f = _function;
            this.uDump(f.proto, writer, false);
        }
        /**
         * Tests for equality according to the semantics of Lua's
         * <code>==</code> operator (so may call metamethods).
         * @param o1  a Lua value.
         * @param o2  another Lua value.
         * @return true when equal.
         */
        equal(o1, o2) {
            if (o1 instanceof Number || typeof (o1) == 'number') {
                return o1 === (o2);
            }
            return this.vmEqualRef(o1, o2);
        }
        /**
         * Generates a Lua error using the error message.
         * @param message  the error message.
         * @return never.
         */
        error(message) {
            return this.gErrormsg(message);
        }
        /**
        * Control garbage collector.  Note that in Jill most of the options
        * to this function make no sense and they will not do anything.
        * @param what  specifies what GC action to take.
        * @param data  data that may be used by the action.
        * @return varies.
        */
        gc(what, data) {
            var rt;
            switch (what) {
                case Lua.GCSTOP:
                    return 0;
                case Lua.GCRESTART:
                case Lua.GCCOLLECT:
                case Lua.GCSTEP:
                    SystemUtil_1.SystemUtil.gc();
                    return 0;
                case Lua.GCCOUNT:
                    rt = Runtime_1.Runtime.getRuntime();
                    return ((rt.totalMemory() - rt.freeMemory()) / 1024);
                case Lua.GCCOUNTB:
                    rt = Runtime_1.Runtime.getRuntime();
                    return ((rt.totalMemory() - rt.freeMemory()) % 1024);
                case Lua.GCSETPAUSE:
                case Lua.GCSETSTEPMUL:
                    return 0;
            }
            return 0;
        }
        /**
        * Returns the environment table of the Lua value.
        * @param o  the Lua value.
        * @return its environment table.
        */
        getFenv(o) {
            if (o instanceof LuaFunction_1.LuaFunction) {
                var f1 = o;
                return f1.env;
            }
            if (o instanceof LuaJavaCallback_1.LuaJavaCallback) {
                var f2 = o;
                // :todo: implement this case.
                return null;
            }
            if (o instanceof LuaUserdata_1.LuaUserdata) {
                var u = o;
                return u.env;
            }
            if (o instanceof Lua) {
                var l = o;
                return l.global;
            }
            return null;
        }
        /**
         * Get a field from a table (or other object).
         * @param t      The object whose field to retrieve.
         * @param field  The name of the field.
         * @return  the Lua value
         */
        getField(t, field) {
            return this.getTable(t, field);
        }
        /**
         * Get a global variable.
         * @param name  The name of the global variable.
         * @return  The value of the global variable.
         */
        getGlobal(name) {
            return this.getField(this._global, name);
        }
        /**
         * Gets the global environment.  The global environment, where global
         * variables live, is returned as a <code>LuaTable</code>.  Note that
         * modifying this table has exactly the same effect as creating or
         * changing global variables from within Lua.
         * @return  The global environment as a table.
         */
        getGlobals() {
            return this._global;
        }
        /** Get metatable.
         * @param o  the Lua value whose metatable to retrieve.
         * @return The metatable, or null if there is no metatable.
         */
        getMetatable(o) {
            var mt;
            if (o instanceof LuaTable_1.LuaTable) {
                var t = o;
                mt = t.metatable;
            }
            else if (o instanceof LuaUserdata_1.LuaUserdata) {
                var u = o;
                mt = u.metatable;
            }
            else {
                mt = this._metatable[Lua.____type(o)];
            }
            return mt;
        }
        /**
         * Gets the registry table.
         */
        getRegistry() {
            return this._registry;
        }
        /**
         * Indexes into a table and returns the value.
         * @param t  the Lua value to index.
         * @param k  the key whose value to return.
         * @return the value t[k].
         */
        getTable(t, k) {
            var s = new Slot_1.Slot();
            s.init2(k);
            var v = new Slot_1.Slot();
            this.vmGettable(t, s, v);
            return v.asObject();
        }
        /**
         * Gets the number of elements in the stack.  If the stack is not
         * empty then this is the index of the top-most element.
         * @return number of stack elements.
        */
        getTop() {
            return this._stackSize - this._base;
        }
        /**
         * Insert Lua value into stack immediately at specified index.  Values
         * in stack at that index and higher get pushed up.
         * @param o    the Lua value to insert into the stack.
         * @param idx  the stack index at which to insert.
         */
        insert(o, idx) {
            idx = this.absIndexUnclamped(idx);
            this.stackInsertAt(o, idx);
        }
        /**
         * Tests that an object is a Lua boolean.
         * @param o  the Object to test.
         * @return true if and only if the object is a Lua boolean.
         */
        static isBoolean(o) {
            return o instanceof Boolean || typeof (o) == 'boolean';
        }
        /**
         * Tests that an object is a Lua function implementated in Java (a Lua
         * Java Function).
         * @param o  the Object to test.
         * @return true if and only if the object is a Lua Java Function.
         */
        static isJavaFunction(o) {
            return o instanceof LuaJavaCallback_1.LuaJavaCallback;
        }
        /**
         * Tests that an object is a Lua function (implemented in Lua or
         * Java).
         * @param o  the Object to test.
         * @return true if and only if the object is a function.
         */
        static isFunction(o) {
            return o instanceof LuaFunction_1.LuaFunction ||
                o instanceof LuaJavaCallback_1.LuaJavaCallback;
        }
        /**
         * Tests that a Lua thread is the main thread.
         * @return true if and only if is the main thread.
         */
        isMain() {
            return this == this._main;
        }
        /**
         * Tests that an object is Lua <code>nil</code>.
         * @param o  the Object to test.
         * @return true if and only if the object is Lua <code>nil</code>.
         */
        static isNil(o) {
            return Lua.NIL == o;
        }
        /**
         * Tests that an object is a Lua number or a string convertible to a
         * number.
         * @param o  the Object to test.
         * @return true if and only if the object is a number or a convertible string.
         */
        static isNumber(o) {
            Lua.SPARE_SLOT.setObject(o);
            return Lua.tonumber(Lua.SPARE_SLOT, Lua.NUMOP);
        }
        /**
         * Tests that an object is a Lua string or a number (which is always
         * convertible to a string).
         * @param o  the Object to test.
         * @return true if and only if object is a string or number.
         */
        static isString(o) {
            return o instanceof String || o instanceof Number || typeof (o) == 'string' || typeof (o) == 'number';
        }
        /**
         * Tests that an object is a Lua table.
         * @param o  the Object to test.
         * @return <code>true</code> if and only if the object is a Lua table.
         */
        static isTable(o) {
            return o instanceof LuaTable_1.LuaTable;
        }
        /**
         * Tests that an object is a Lua thread.
         * @param o  the Object to test.
         * @return <code>true</code> if and only if the object is a Lua thread.
         */
        static isThread(o) {
            return o instanceof Lua;
        }
        /**
         * Tests that an object is a Lua userdata.
         * @param o  the Object to test.
         * @return true if and only if the object is a Lua userdata.
         */
        static isUserdata(o) {
            return o instanceof LuaUserdata_1.LuaUserdata;
        }
        /**
         * <p>
         * Tests that an object is a Lua value.  Returns <code>true</code> for
         * an argument that is a Jill representation of a Lua value,
         * <code>false</code> for Java references that are not Lua values.
         * For example <code>isValue(new LuaTable())</code> is
         * <code>true</code>, but <code>isValue(new Object[] { })</code> is
         * <code>false</code> because Java arrays are not a representation of
         * any Lua value.
         * </p>
         * <p>
         * PUC-Rio Lua provides no
         * counterpart for this method because in their implementation it is
         * impossible to get non Lua values on the stack, whereas in Jill it
         * is common to mix Lua values with ordinary, non Lua, Java objects.
         * </p>
         * @param o  the Object to test.
         * @return true if and if it represents a Lua value.
         */
        static isValue(o) {
            return o == Lua.NIL ||
                o instanceof Boolean || typeof (o) == 'boolean';
            o instanceof String || typeof (o) == 'string';
            o instanceof Number || typeof (o) == 'number';
            o instanceof LuaFunction_1.LuaFunction ||
                o instanceof LuaJavaCallback_1.LuaJavaCallback ||
                o instanceof LuaTable_1.LuaTable ||
                o instanceof LuaUserdata_1.LuaUserdata;
        }
        /**
         * Compares two Lua values according to the semantics of Lua's
         * <code>&lt;</code> operator, so may call metamethods.
         * @param o1  the left-hand operand.
         * @param o2  the right-hand operand.
         * @return true when <code>o1 < o2</code>.
         */
        lessThan(o1, o2) {
            var a = new Slot_1.Slot();
            a.init2(o1);
            var b = new Slot_1.Slot();
            b.init2(o2);
            return this.vmLessthan(a, b);
        }
        /**
         * <p>
         * Loads a Lua chunk in binary or source form.
         * Comparable to C's lua_load.  If the chunk is determined to be
         * binary then it is loaded directly.  Otherwise the chunk is assumed
         * to be a Lua source chunk and compilation is required first; the
         * <code>InputStream</code> is used to create a <code>Reader</code>
         * using the UTF-8 encoding
         * (using a second argument of <code>"UTF-8"</code> to the
         * {@link java.io.InputStreamReader#InputStreamReader(java.io.InputStream,
         * java.lang.String)}
         * constructor) and the Lua source is compiled.
         * </p>
         * <p>
         * If successful, The compiled chunk, a Lua function, is pushed onto
         * the stack and a zero status code is returned.  Otherwise a non-zero
         * status code is returned to indicate an error and the error message
         * is pushed onto the stack.
         * </p>
         * @param in         The binary chunk as an InputStream, for example from
         *                   {@link Class#getResourceAsStream}.
         * @param chunkname  The name of the chunk.
         * @return           A status code.
         */
        load(_in, chunkname) {
            var li = new LuaInternal_1.LuaInternal();
            li.init1(_in, chunkname);
            this.pushObject(li);
            return this.pcall(0, 1, null);
        }
        /**
         * Loads a Lua chunk in source form.
         * Comparable to C's lua_load.  This method takes a {@link
         * java.io.Reader} parameter,
         * and is normally used to load Lua chunks in source form.
         * However, it if the input looks like it is the output from Lua's
         * <code>string.dump</code> function then it will be processed as a
         * binary chunk.
         * In every other respect this method is just like {@link
         * #load(InputStream, String)}.
         * 废弃，合并入load
         * @param in         The source chunk as a Reader, for example from
         *                   <code>java.io.InputStreamReader(Class.getResourceAsStream())</code>.
         * @param chunkname  The name of the chunk.
         * @return           A status code.
         * @see java.io.InputStreamReader
         */
        __load(_in, chunkname) {
            var li = new LuaInternal_1.LuaInternal();
            li.init2(_in, chunkname);
            this.pushObject(li);
            return this.pcall(0, 1, null);
        }
        /**
         * Slowly get the next key from a table.  Unlike most other functions
         * in the API this one uses the stack.  The top-of-stack is popped and
         * used to find the next key in the table at the position specified by
         * index.  If there is a next key then the key and its value are
         * pushed onto the stack and <code>true</code> is returned.
         * Otherwise (the end of the table has been reached)
         * <code>false</code> is returned.
         * @param idx  stack index of table.
         * @return  true if and only if there are more keys in the table.
         * @deprecated Use {@link #tableKeys} enumeration protocol instead.
         */
        next(idx) {
            var o = this.value(idx);
            // :todo: api check
            var t = o;
            var key = this.value(-1);
            this.pop(1);
            var e = t.keys();
            if (key == Lua.NIL) {
                if (e.hasMoreElements()) {
                    key = e.nextElement();
                    this.pushObject(key);
                    this.pushObject(t.getlua(key));
                    return true;
                }
                return false;
            }
            while (e.hasMoreElements()) {
                var k = e.nextElement();
                if (k === (key)) {
                    if (e.hasMoreElements()) {
                        key = e.nextElement();
                        this.pushObject(key);
                        this.pushObject(t.getlua(key));
                        return true;
                    }
                    return false;
                }
            }
            // protocol error which we could potentially diagnose.
            return false;
        }
        /**
         * Creates a new empty table and returns it.
         * @return a fresh table.
         * @see #createTable
         */
        newTable() {
            return new LuaTable_1.LuaTable();
        }
        /**
         * Creates a new Lua thread and returns it.
         * @return a new Lua thread.
         */
        newThread() {
            return new Lua(this);
        }
        /**
         * Wraps an arbitrary Java reference in a Lua userdata and returns it.
         * @param ref  the Java reference to wrap.
         * @return the new LuaUserdata.
         */
        newUserdata(ref) {
            return new LuaUserdata_1.LuaUserdata(ref);
        }
        /**
         * Return the <em>length</em> of a Lua value.  For strings this is
         * the string length; for tables, this is result of the <code>#</code>
         * operator; for other values it is 0.
         * @param o  a Lua value.
         * @return its length.
         */
        static objLen(o) {
            if (o instanceof String || typeof (o) == 'string') {
                var s = o;
                return s.length;
            }
            if (o instanceof LuaTable_1.LuaTable) {
                var t = o;
                return t.getn();
            }
            if (o instanceof Number || typeof (o) == 'number') {
                return this.vmTostring(o).length;
            }
            return 0;
        }
        /**
         * <p>
         * Protected {@link #call}.  <var>nargs</var> and
         * <var>nresults</var> have the same meaning as in {@link #call}.
         * If there are no errors during the call, this method behaves as
         * {@link #call}.  Any errors are caught, the error object (usually
         * a message) is pushed onto the stack, and a non-zero error code is
         * returned.
         * </p>
         * <p>
         * If <var>er</var> is <code>null</code> then the error object that is
         * on the stack is the original error object.  Otherwise
         * <var>ef</var> specifies an <em>error handling function</em> which
         * is called when the original error is generated; its return value
         * becomes the error object left on the stack by <code>pcall</code>.
         * </p>
         * @param nargs     number of arguments.
         * @param nresults  number of result required.
         * @param ef        error function to call in case of error.
         * @return 0 if successful, else a non-zero error code.
         */
        pcall(nargs, nresults, ef) {
            this.apiChecknelems(nargs + 1);
            var restoreStack = this._stackSize - (nargs + 1);
            // Most of this code comes from luaD_pcall
            var restoreCi = this._civ.size;
            var oldnCcalls = this._nCcalls;
            var old_errfunc = this._errfunc;
            this._errfunc = ef;
            var old_allowhook = this._allowhook;
            var errorStatus = 0;
            try {
                this.call(nargs, nresults);
            }
            catch (e) {
                if (e instanceof LuaError_1.LuaError) {
                    console.log(e.stack);
                    this.fClose(restoreStack); // close eventual pending closures
                    this.dSeterrorobj(e.errorStatus, restoreStack);
                    this._nCcalls = oldnCcalls;
                    this._civ.size = restoreCi;
                    var ci = this.__ci();
                    this._base = ci.base;
                    this._savedpc = ci.savedpc;
                    this._allowhook = old_allowhook;
                    errorStatus = e.errorStatus;
                }
                else if (e instanceof OutOfMemoryError_1.OutOfMemoryError) {
                    console.log(e.stack);
                    this.fClose(restoreStack); // close eventual pending closures
                    this.dSeterrorobj(Lua.ERRMEM, restoreStack);
                    this._nCcalls = oldnCcalls;
                    this._civ.size = restoreCi;
                    var ci2 = this.__ci();
                    this._base = ci2.base;
                    this._savedpc = ci2.savedpc;
                    this._allowhook = old_allowhook;
                    errorStatus = Lua.ERRMEM;
                }
            }
            /**/
            this._errfunc = old_errfunc;
            return errorStatus;
        }
        /**
         * Removes (and discards) the top-most <var>n</var> elements from the stack.
         * @param n  the number of elements to remove.
         */
        pop(n) {
            if (n < 0) {
                throw new IllegalArgumentException_1.IllegalArgumentException();
            }
            this.stacksetsize(this._stackSize - n);
        }
        /**
         * Pushes a value onto the stack in preparation for calling a
         * function (or returning from one).  See {@link #call} for
         * the protocol to be used for calling functions.  See {@link
         * #pushNumber} for pushing numbers, and {@link #pushValue} for
         * pushing a value that is already on the stack.
         * @param o  the Lua value to push.
         */
        pushObject(o) {
            // see also a private overloaded version of this for Slot.
            this.stackAdd(o);
        }
        /**
         * Push boolean onto the stack.
         * @param b  the boolean to push.
         */
        pushBoolean(b) {
            this.pushObject(Lua.valueOfBoolean(b));
        }
        /**
         * Push literal string onto the stack.
         * @param s  the string to push.
         */
        pushLiteral(s) {
            this.pushObject(s);
        }
        /** Push nil onto the stack. */
        pushNil() {
            this.pushObject(Lua.NIL);
        }
        /**
        * Pushes a number onto the stack.  See also {@link #push}.
        * @param d  the number to push.
        */
        pushNumber(d) {
            // :todo: optimise to avoid creating Double instance
            this.pushObject(new Number(d));
        }
        /**
         * Push string onto the stack.
         * @param s  the string to push.
         */
        pushString(s) {
            this.pushObject(s);
        }
        /**
         * Copies a stack element onto the top of the stack.
         * Equivalent to <code>L.push(L.value(idx))</code>.
         * @param idx  stack index of value to push.
         */
        pushValue(idx) {
            // :todo: optimised to avoid creating Double instance
            this.pushObject(this.value(idx));
        }
        /**
         * Implements equality without metamethods.
         * @param o1  the first Lua value to compare.
         * @param o2  the other Lua value.
         * @return  true if and only if they compare equal.
         */
        static rawEqual(o1, o2) {
            return Lua.oRawequal(o1, o2);
        }
        /**
         * Gets an element from a table, without using metamethods.
         * @param t  The table to access.
         * @param k  The index (key) into the table.
         * @return The value at the specified index.
         */
        static rawGet(t, k) {
            var table = t;
            return table.getlua(k);
        }
        /**
        * Gets an element from an array, without using metamethods.
        * @param t  the array (table).
        * @param i  the index of the element to retrieve.
        * @return  the value at the specified index.
        */
        static rawGetI(t, i) {
            var table = t;
            return table.getnum(i);
        }
        /**
         * Sets an element in a table, without using metamethods.
         * @param t  The table to modify.
         * @param k  The index into the table.
         * @param v  The new value to be stored at index <var>k</var>.
         */
        rawSet(t, k, v) {
            var table = t;
            table.putluaObj(this, k, v);
        }
        /**
        * Sets an element in an array, without using metamethods.
        * @param t  the array (table).
        * @param i  the index of the element to set.
        * @param v  the new value to be stored at index <var>i</var>.
        */
        rawSetI(t, i, v) {
            this.apiCheck(t instanceof LuaTable_1.LuaTable);
            var h = t;
            h.putnum(i, v);
        }
        /**
         * Register a {@link LuaJavaCallback} as the new value of the global
         * <var>name</var>.
         * @param name  the name of the global.
         * @param f     the LuaJavaCallback to register.
         */
        register(name, f) {
            this.setGlobal(name, f);
        }
        /**
         * Starts and resumes a Lua thread.  Threads can be created using
         * {@link #newThread}.  Once a thread has begun executing it will
         * run until it either completes (with error or normally) or has been
         * suspended by invoking {@link #yield}.
         * @param narg  Number of values to pass to thread.
         * @return Lua.YIELD, 0, or an error code.
         */
        resume(narg) {
            if (this.status != Lua.YIELD) {
                if (this.status != 0)
                    return this.resume_error("cannot resume dead coroutine");
                else if (this._civ.size != 1)
                    return this.resume_error("cannot resume non-suspended coroutine");
            }
            // assert errfunc == 0 && nCcalls == 0;
            var errorStatus = 0;
            protect: try {
                // This block is equivalent to resume from ldo.c
                var firstArg = this._stackSize - narg;
                if (this.status == 0) // start coroutine?
                 {
                    // assert civ.size() == 1 && firstArg > base);
                    if (this.vmPrecall(firstArg - 1, Lua.MULTRET) != Lua.PCRLUA)
                        break protect;
                }
                else // resuming from previous yield
                 {
                    // assert status == YIELD;
                    this.status = 0;
                    if (!this.isLua(this.__ci())) // 'common' yield
                     {
                        // finish interrupted execution of 'OP_CALL'
                        // assert ...
                        if (this.vmPoscall(firstArg)) // complete it...
                            this.stacksetsize(this.__ci().top); // and correct top
                    }
                    else // yielded inside a hook: just continue its execution
                        this._base = this.__ci().base;
                }
                this.vmExecute(this._civ.size - 1);
            }
            catch (e) {
                if (e instanceof LuaError_1.LuaError) {
                    console.log(e.stack);
                    this.status = e.errorStatus; // mark thread as 'dead'
                    this.dSeterrorobj(e.errorStatus, this._stackSize);
                    this.__ci().top = this._stackSize;
                }
            }
            return this.status;
        }
        /**
        * Set the environment for a function, thread, or userdata.
        * @param o      Object whose environment will be set.
        * @param table  Environment table to use.
        * @return true if the object had its environment set, false otherwise.
        */
        setFenv(o, table) {
            // :todo: consider implementing common env interface for
            // LuaFunction, LuaJavaCallback, LuaUserdata, Lua.  One cast to an
            // interface and an interface method call may be shorter
            // than this mess.
            var t = table;
            if (o instanceof LuaFunction_1.LuaFunction) {
                var f1 = o;
                f1.env = t;
                return true;
            }
            if (o instanceof LuaJavaCallback_1.LuaJavaCallback) {
                var f2 = o;
                // :todo: implement this case.
                return false;
            }
            if (o instanceof LuaUserdata_1.LuaUserdata) {
                var u = o;
                u.env = t;
                return true;
            }
            if (o instanceof Lua) {
                var l = o;
                l.global = t;
                return true;
            }
            return false;
        }
        /**
         * Set a field in a Lua value.
         * @param t     Lua value of which to set a field.
         * @param name  Name of field to set.
         * @param v     new Lua value for field.
         */
        setField(t, name, v) {
            var s = new Slot_1.Slot();
            s.init2(name);
            this.vmSettable(t, s, v);
        }
        /**
        * Sets the metatable for a Lua value.
        * @param o   Lua value of which to set metatable.
        * @param mt  The new metatable.
        */
        setMetatable(o, mt) {
            if (Lua.isNil(mt)) {
                mt = null;
            }
            else {
                this.apiCheck(mt instanceof LuaTable_1.LuaTable);
            }
            var mtt = mt;
            if (o instanceof LuaTable_1.LuaTable) {
                var t = o;
                t.setMetatable(mtt);
            }
            else if (o instanceof LuaUserdata_1.LuaUserdata) {
                var u = o;
                u.metatable = mtt;
            }
            else {
                this._metatable[Lua.____type(o)] = mtt;
            }
        }
        /**
         * Set a global variable.
         * @param name   name of the global variable to set.
         * @param value  desired new value for the variable.
         */
        setGlobal(name, value) {
            var s = new Slot_1.Slot();
            s.init2(name);
            this.vmSettable(this._global, s, value);
        }
        /**
         * Does the equivalent of <code>t[k] = v</code>.
         * @param t  the table to modify.
         * @param k  the index to modify.
         * @param v  the new value at index <var>k</var>.
         */
        setTable(t, k, v) {
            var s = new Slot_1.Slot();
            s.init2(k);
            this.vmSettable(t, s, v);
        }
        /**
        * Set the stack top.
        * @param n  the desired size of the stack (in elements).
        */
        setTop(n) {
            if (n < 0) {
                throw new IllegalArgumentException_1.IllegalArgumentException();
            }
            this.stacksetsize(this._base + n);
        }
        /**
         * Status of a Lua thread.
         * @return 0, an error code, or Lua.YIELD.
         */
        get status() {
            return this._status;
        }
        set status(status) {
            this._status = status;
        }
        /**
         * Returns an {@link java.util.Enumeration} for the keys of a table.
         * @param t  a Lua table.
         * @return an Enumeration object.
         */
        tableKeys(t) {
            if (!(t instanceof LuaTable_1.LuaTable)) {
                this.error("table required");
                // NOTREACHED
            }
            return t.keys();
        }
        /**
         * Convert to boolean.
         * @param o  Lua value to convert.
         * @return  the resulting primitive boolean.
         */
        toBoolean(o) {
            return !(o == Lua.NIL || o == false);
        }
        /**
         * Convert to integer and return it.  Returns 0 if cannot be
         * converted.
         * @param o  Lua value to convert.
         * @return  the resulting int.
         */
        toInteger(o) {
            return this.toNumber(o);
        }
        /**
         * Convert to number and return it.  Returns 0 if cannot be
         * converted.
         * @param o  Lua value to convert.
         * @return  The resulting number.
         */
        toNumber(o) {
            Lua.SPARE_SLOT.setObject(o);
            if (Lua.tonumber(Lua.SPARE_SLOT, Lua.NUMOP)) {
                return Lua.NUMOP[0];
            }
            return 0;
        }
        /**
         * Convert to string and return it.  If value cannot be converted then
         * <code>null</code> is returned.  Note that unlike
         * <code>lua_tostring</code> this
         * does not modify the Lua value.
         * @param o  Lua value to convert.
         * @return  The resulting string.
         */
        toString_(o) {
            return Lua.vmTostring(o);
        }
        /**
         * Convert to Lua thread and return it or <code>null</code>.
         * @param o  Lua value to convert.
         * @return  The resulting Lua instance.
         */
        toThread(o) {
            if (!(o instanceof Lua)) {
                return null;
            }
            return o;
        }
        /**
         * Convert to userdata or <code>null</code>.  If value is a {@link
         * LuaUserdata} then it is returned, otherwise, <code>null</code> is
         * returned.
         * @param o  Lua value.
         * @return  value as userdata or <code>null</code>.
         */
        toUserdata(o) {
            if (o instanceof LuaUserdata_1.LuaUserdata) {
                return o;
            }
            return null;
        }
        /**
         * Type of the Lua value at the specified stack index.
         * @param idx  stack index to type.
         * @return  the type, or {@link #TNONE} if there is no value at <var>idx</var>
         */
        type(idx) {
            idx = this.absIndex(idx);
            if (idx < 0) {
                return Lua.TNONE;
            }
            return this.___type(this._stack[idx]);
        }
        /**
         * 废弃，并入type
         * @param	s
         * @return
         */
        ___type(s) {
            if (s.r == Lua.NUMBER) {
                return Lua.TNUMBER;
            }
            return Lua.____type(s.r);
        }
        /**
         * Type of a Lua value.
         * 废弃，并入type
         * @param o  the Lua value whose type to return.
         * @return  the Lua type from an enumeration.
         */
        static ____type(o) {
            if (o == Lua.NIL) {
                return Lua.TNIL;
            }
            else if (o instanceof Number || (typeof (o) == 'string')) {
                return Lua.TNUMBER;
            }
            else if (o instanceof Boolean || (typeof (o) == 'boolean')) {
                return Lua.TBOOLEAN;
            }
            else if (o instanceof String) {
                return Lua.TSTRING;
            }
            else if (o instanceof LuaTable_1.LuaTable) {
                return Lua.TTABLE;
            }
            else if (o instanceof LuaFunction_1.LuaFunction || o instanceof LuaJavaCallback_1.LuaJavaCallback) {
                return Lua.TFUNCTION;
            }
            else if (o instanceof LuaUserdata_1.LuaUserdata) {
                return Lua.TUSERDATA;
            }
            else if (o instanceof Lua) {
                return Lua.TTHREAD;
            }
            return Lua.TNONE;
        }
        /**
         * Name of type.
         * @param type  a Lua type from, for example, {@link #type}.
         * @return  the type's name.
         */
        static typeName(type) {
            if (Lua.TNONE == type) {
                return "no value";
            }
            return Lua.TYPENAME[type];
        }
        /**
         * Gets a value from the stack.
         * If <var>idx</var> is positive and exceeds
         * the size of the stack, {@link #NIL} is returned.
         * @param idx  the stack index of the value to retrieve.
         * @return  the Lua value from the stack.
         */
        value(idx) {
            idx = this.absIndex(idx);
            if (idx < 0) {
                return Lua.NIL;
            }
            return this._stack[idx].asObject();
        }
        /**
        * Converts primitive boolean into a Lua value.
        * @param b  the boolean to convert.
        * @return  the resulting Lua value.
        */
        static valueOfBoolean(b) {
            // If CLDC 1.1 had
            // <code>java.lang.Boolean.valueOf(boolean);</code> then I probably
            // wouldn't have written this.  This does have a small advantage:
            // code that uses this method does not need to assume that Lua booleans in
            // Jill are represented using Java.lang.Boolean.
            if (b) {
                return true;
            }
            else {
                return false;
            }
        }
        /**
         * Converts primitive number into a Lua value.
         * @param d  the number to convert.
         * @return  the resulting Lua value.
         */
        static valueOfNumber(d) {
            // :todo: consider interning "common" numbers, like 0, 1, -1, etc.
            return new Number(d);
        }
        /**
        * Exchange values between different threads.
        * @param to  destination Lua thread.
        * @param n   numbers of stack items to move.
        */
        xmove(to, n) {
            if (this == to) {
                return;
            }
            this.apiChecknelems(n);
            // L.apiCheck(from.G() == to.G());
            for (var i = 0; i < n; ++i) {
                to.pushObject(this.value(-n + i));
            }
            this.pop(n);
        }
        /**
         * Yields a thread.  Should only be called as the return expression
         * of a Lua Java function: <code>return L.yield(nresults);</code>.
         * A {@link RuntimeException} can also be thrown to yield.  If the
         * Java code that is executing throws an instance of {@link
         * RuntimeException} (direct or indirect) then this causes the Lua
         * thread to be suspended, as if <code>L.yield(0);</code> had been
         * executed, and the exception is re-thrown to the code that invoked
         * {@link #resume}.
         * @param nresults  Number of results to return to {@link #resume}.
         * @return  a secret value.
         */
        yield(nresults) {
            if (this._nCcalls > 0)
                this.gRunerror("attempt to yield across metamethod/Java-call boundary");
            this._base = this._stackSize - nresults; // protect stack slots below
            this.status = Lua.YIELD;
            return -1;
        }
        // Miscellaneous private functions.
        /** Convert from Java API stack index to absolute index.
         * @return an index into <code>this.stack</code> or -1 if out of range.
         */
        absIndex(idx) {
            var s = this._stackSize;
            if (idx == 0) {
                return -1;
            }
            if (idx > 0) {
                if (idx + this._base > s) {
                    return -1;
                }
                return this._base + idx - 1;
            }
            // idx < 0
            if (s + idx < this._base) {
                return -1;
            }
            return s + idx;
        }
        /**
        * As {@link #absIndex} but does not return -1 for out of range
        * indexes.  Essential for {@link #insert} because an index equal
        * to the size of the stack is valid for that call.
        */
        absIndexUnclamped(idx) {
            if (idx == 0) {
                return -1;
            }
            if (idx > 0) {
                return this._base + idx - 1;
            }
            // idx < 0
            return this._stackSize + idx;
        }
        //////////////////////////////////////////////////////////////////////
        // Auxiliary API
        // :todo: consider placing in separate class (or macroised) so that we
        // can change its definition (to remove the check for example).
        apiCheck(cond) {
            if (!cond) {
                throw new IllegalArgumentException_1.IllegalArgumentException();
            }
        }
        apiChecknelems(n) {
            this.apiCheck(n <= this._stackSize - this._base);
        }
        /**
         * Checks a general condition and raises error if false.
         * @param cond      the (evaluated) condition to check.
         * @param numarg    argument index.
         * @param extramsg  extra error message to append.
         */
        argCheck(cond, numarg, extramsg) {
            if (cond) {
                return;
            }
            this.argError(numarg, extramsg);
        }
        /**
         * Raise a general error for an argument.
         * @param narg      argument index.
         * @param extramsg  extra message string to append.
         * @return never (used idiomatically in <code>return argError(...)</code>)
         */
        argError(narg, extramsg) {
            // :todo: use debug API as per PUC-Rio
            if (true) {
                return this.error("bad argument " + narg + " (" + extramsg + ")");
            }
            return 0;
        }
        /**
         * Calls a metamethod.  Pushes 1 result onto stack if method called.
         * @param obj    stack index of object whose metamethod to call
         * @param event  metamethod (event) name.
         * @return  true if and only if metamethod was found and called.
         */
        callMeta(obj, event) {
            var o = this.value(obj);
            var ev = this.getMetafield(o, event);
            if (ev == Lua.NIL) {
                return false;
            }
            this.pushObject(ev);
            this.pushObject(o);
            this.call(1, 1);
            return true;
        }
        /**
         * Checks that an argument is present (can be anything).
         * Raises error if not.
         * @param narg  argument index.
         */
        checkAny(narg) {
            if (this.type(narg) == Lua.TNONE) {
                this.argError(narg, "value expected");
            }
        }
        /**
         * Checks is a number and returns it as an integer.  Raises error if
         * not a number.
         * @param narg  argument index.
         * @return  the argument as an int.
         */
        checkInt(narg) {
            return this.checkNumber(narg);
        }
        /**
         * Checks is a number.  Raises error if not a number.
         * @param narg  argument index.
         * @return  the argument as a double.
         */
        checkNumber(narg) {
            var o = this.value(narg);
            var d = this.toNumber(o);
            if (d == 0 && !Lua.isNumber(o)) {
                this.tagError(narg, Lua.TNUMBER);
            }
            return d;
        }
        /**
         * Checks that an optional string argument is an element from a set of
         * strings.  Raises error if not.
         * @param narg  argument index.
         * @param def   default string to use if argument not present.
         * @param lst   the set of strings to match against.
         * @return an index into <var>lst</var> specifying the matching string.
         */
        checkOption(narg, def, lst /*String[] */) {
            var name;
            if (def == null) {
                name = this.checkString(narg);
            }
            else {
                name = this.optString(narg, def);
            }
            for (var i = 0; i < lst.length; ++i) {
                if (lst[i] === (name)) {
                    return i;
                }
            }
            return this.argError(narg, "invalid option '" + name + "'");
        }
        /**
         * Checks argument is a string and returns it.  Raises error if not a
         * string.
         * @param narg  argument index.
         * @return  the argument as a string.
         */
        checkString(narg) {
            var s = this.toString_(this.value(narg));
            if (s == null) {
                this.tagError(narg, Lua.TSTRING);
            }
            return s;
        }
        /**
         * Checks the type of an argument, raises error if not matching.
         * @param narg  argument index.
         * @param t     typecode (from {@link #type} for example).
         */
        checkType(narg, t) {
            if (this.type(narg) != t) {
                this.tagError(narg, t);
            }
        }
        /**
         * Loads and runs the given string.
         * @param s  the string to run.
         * @return  a status code, as per {@link #load}.
         */
        doString(s) {
            var status = this.__load(Lua.stringReader(s), s);
            if (status == 0) {
                status = this.pcall(0, Lua.MULTRET, null);
            }
            return status;
        }
        errfile(what, fname, e) {
            this.pushString("cannot " + what + " " + fname + ": " + e.toString());
            return Lua.ERRFILE;
        }
        /**
         * Equivalent to luaL_findtable.  Instead of the table being passed on
         * the stack, it is passed as the argument <var>t</var>.
         * Likes its PUC-Rio equivalent however, this method leaves a table on
         * the Lua stack.
         */
        findTable(t, fname, szhint) {
            var e = 0;
            var i = 0;
            do {
                e = fname.indexOf('.', i);
                var part;
                if (e < 0) {
                    part = fname.substring(i);
                }
                else {
                    part = fname.substring(i, e);
                }
                var v = Lua.rawGet(t, part);
                if (Lua.isNil(v)) // no such field?
                 {
                    v = this.createTable(0, (e >= 0) ? 1 : szhint); // new table for field
                    this.setTable(t, part, v);
                }
                else if (!Lua.isTable(v)) // field has a non-table value?
                 {
                    return part;
                }
                t = v;
                i = e + 1;
            } while (e >= 0);
            this.pushObject(t);
            return null;
        }
        /**
         * Get a field (event) from an Lua value's metatable.  Returns Lua
         * <code>nil</code> if there is either no metatable or no field.
         * @param o           Lua value to get metafield for.
         * @param event       name of metafield (event).
         * @return            the field from the metatable, or nil.
         */
        getMetafield(o, event) {
            var mt = this.getMetatable(o);
            if (mt == null) {
                return Lua.NIL;
            }
            return mt.getlua(event);
        }
        isNoneOrNil(narg) {
            return this.type(narg) <= Lua.TNIL;
        }
        /**
         * Loads a Lua chunk from a file.  The <var>filename</var> argument is
         * used in a call to {@link Class#getResourceAsStream} where
         * <code>this</code> is the {@link Lua} instance, thus relative
         * pathnames will be relative to the location of the
         * <code>Lua.class</code> file.  Pushes compiled chunk, or error
         * message, onto stack.
         * @param filename  location of file.
         * @return status code, as per {@link #load}.
         */
        loadFile(filename) {
            if (filename == null) {
                throw new NullPointerException_1.NullPointerException();
            }
            var _in = SystemUtil_1.SystemUtil.getResourceAsStream(filename); //TODO:
            if (_in == null) {
                return this.errfile("open", filename, new IOException_1.IOException());
            }
            var status = 0;
            try {
                _in.mark(1);
                var c = _in.read();
                if (c == '#'.charCodeAt(0)) // Unix exec. file?
                 {
                    // :todo: handle this case
                }
                _in.reset();
                status = this.load(_in, "@" + filename);
            }
            catch (e) {
                if (e instanceof IOException_1.IOException) {
                    console.log(e.stack);
                    return this.errfile("read", filename, e);
                }
            }
            return status;
        }
        /**
         * Loads a Lua chunk from a string.  Pushes compiled chunk, or error
         * message, onto stack.
         * @param s           the string to load.
         * @param chunkname   the name of the chunk.
         * @return status code, as per {@link #load}.
         */
        loadString(s, chunkname) {
            return this.__load(Lua.stringReader(s), chunkname);
        }
        /**
         * Get optional integer argument.  Raises error if non-number
         * supplied.
         * @param narg  argument index.
         * @param def   default value for integer.
         * @return an int.
         */
        optInt(narg, def) {
            if (this.isNoneOrNil(narg)) {
                return def;
            }
            return this.checkInt(narg);
        }
        /**
         * Get optional number argument.  Raises error if non-number supplied.
         * @param narg  argument index.
         * @param def   default value for number.
         * @return a double.
         */
        optNumber(narg, def) {
            if (this.isNoneOrNil(narg)) {
                return def;
            }
            return this.checkNumber(narg);
        }
        /**
         * Get optional string argument.  Raises error if non-string supplied.
         * @param narg  argument index.
         * @param def   default value for string.
         * @return a string.
         */
        optString(narg, def) {
            if (this.isNoneOrNil(narg)) {
                return def;
            }
            return this.checkString(narg);
        }
        /**
         * Creates a table in the global namespace and registers it as a loaded
         * module.
         * @return the new table
         */
        __register(name) {
            this.findTable(this._registry, Lua.LOADED, 1);
            var loaded = this.value(-1);
            this.pop(1);
            var t = this.getField(loaded, name);
            if (!Lua.isTable(t)) // not found?
             {
                // try global variable (and create one if it does not exist)
                if (this.findTable(this.getGlobals(), name, 0) != null) {
                    this.error("name conflict for module '" + name + "'");
                }
                t = this.value(-1);
                this.pop(1);
                this.setField(loaded, name, t); // _LOADED[name] = new table
            }
            return t;
        }
        tagError(narg, tag) {
            this.typerror(narg, Lua.typeName(tag));
        }
        /**
         * Name of type of value at <var>idx</var>.
         * @param idx  stack index.
         * @return  the name of the value's type.
         */
        typeNameOfIndex(idx) {
            return Lua.TYPENAME[this.type(idx)];
        }
        /**
         * Declare type error in argument.
         * @param narg   Index of argument.
         * @param tname  Name of type expected.
         */
        typerror(narg, tname) {
            this.argError(narg, tname + " expected, got " + this.typeNameOfIndex(narg));
        }
        /**
         * Return string identifying current position of the control at level
         * <var>level</var>.
         * @param level  specifies the call-stack level.
         * @return a description for that level.
         */
        where(level) {
            var ar = this.getStack(level); // check function at level
            if (ar != null) {
                this.getInfo("Sl", ar); // get info about it
                if (ar.currentline > 0) // is there info?
                 {
                    return ar.shortsrc + ":" + ar.currentline + ": ";
                }
            }
            return ""; // else, no information available...
        }
        /**
         * Provide {@link java.io.Reader} interface over a <code>String</code>.
         * Equivalent of {@link java.io.StringReader#StringReader} from J2SE.
         * The ability to convert a <code>String</code> to a
         * <code>Reader</code> is required internally,
         * to provide the Lua function <code>loadstring</code>; exposed
         * externally as a convenience.
         * @param s  the string from which to read.
         * @return a {@link java.io.Reader} that reads successive chars from <var>s</var>.
         */
        static stringReader(s) {
            return new StringReader_1.StringReader(s);
        }
        //////////////////////////////////////////////////////////////////////
        // Debug
        // Methods equivalent to debug API.  In PUC-Rio most of these are in
        // ldebug.c
        getInfo(what, ar) {
            var f = null;
            var callinfo = null;
            // :todo: complete me
            if (ar.ici > 0) // no tail call?
             {
                callinfo = this._civ.elementAt(ar.ici);
                f = this._stack[callinfo.func].r;
                //# assert isFunction(f)
            }
            var status = this.auxgetinfo(what, ar, f, callinfo);
            if (what.indexOf('f') >= 0) {
                if (f == null) {
                    this.pushObject(Lua.NIL);
                }
                else {
                    this.pushObject(f);
                }
            }
            return status;
        }
        /**
         * Locates function activation at specified call level and returns a
         * {@link Debug}
         * record for it, or <code>null</code> if level is too high.
         * May become public.
         * @param level  the call level.
         * @return a {@link Debug} instance describing the activation record.
         */
        getStack(level) {
            var ici; // Index of CallInfo
            for (ici = this._civ.size - 1; level > 0 && ici > 0; --ici) {
                var ci = this._civ.elementAt(ici);
                --level;
                if (this.isLua(ci)) // Lua function?
                 {
                    level -= ci.tailcalls; // skip lost tail calls
                }
            }
            if (level == 0 && ici > 0) // level found?
             {
                return new Debug_1.Debug(ici);
            }
            else if (level < 0) // level is of a lost tail call?
             {
                return new Debug_1.Debug(0);
            }
            return null;
        }
        /**
         * Sets the debug hook.
         */
        setHook(func, mask, count) {
            if (func == null || mask == 0) // turn off hooks?
             {
                mask = 0;
                func = null;
            }
            this._hook = func;
            this._basehookcount = count;
            this.resethookcount();
            this._hookmask = mask;
        }
        /**
         * @return true is okay, false otherwise (for example, error).
         */
        auxgetinfo(what, ar, f, ci) {
            var status = true;
            if (f == null) {
                // :todo: implement me
                return status;
            }
            for (var i = 0; i < what.length; ++i) {
                switch (what.charAt(i)) {
                    case 'S':
                        this.funcinfo(ar, f);
                        break;
                    case 'l':
                        ar.currentline = (ci != null) ? this.currentline(ci) : -1;
                        break;
                    case 'f': // handled by getInfo
                        break;
                    // :todo: more cases.
                    default:
                        status = false;
                }
            }
            return status;
        }
        currentline(ci) {
            var pc = this.currentpc(ci);
            if (pc < 0) {
                return -1; // only active Lua functions have current-line info
            }
            else {
                var faso = this._stack[ci.func].r;
                var f = faso;
                return f.proto.getline(pc);
            }
        }
        currentpc(ci) {
            if (!this.isLua(ci)) // function is not a Lua function?
             {
                return -1;
            }
            if (ci == this.__ci()) {
                ci.savedpc = this._savedpc;
            }
            return Lua.pcRel(ci.savedpc);
        }
        funcinfo(ar, cl) {
            if (cl instanceof LuaJavaCallback_1.LuaJavaCallback) {
                ar.source = "=[Java]";
                ar.linedefined = -1;
                ar.lastlinedefined = -1;
                ar.what = "Java";
            }
            else {
                var p = cl.proto;
                ar.source = p.source;
                ar.linedefined = p.linedefined;
                ar.lastlinedefined = p.lastlinedefined;
                ar.what = ar.linedefined == 0 ? "main" : "Lua";
            }
        }
        /** Equivalent to macro isLua _and_ f_isLua from lstate.h. */
        isLua(callinfo) {
            var f = this._stack[callinfo.func].r;
            return f instanceof LuaFunction_1.LuaFunction;
        }
        static pcRel(pc) {
            return pc - 1;
        }
        //////////////////////////////////////////////////////////////////////
        // Do
        // Methods equivalent to the file ldo.c.  Prefixed with d.
        // Some of these are in vm* instead.
        /**
        * Equivalent to luaD_callhook.
        */
        dCallhook(event, line) {
            var hook = this._hook;
            if (hook != null && this._allowhook) {
                var top = this._stackSize;
                var ci_top = this.__ci().top;
                var ici = this._civ.size - 1;
                if (event == Lua.HOOKTAILRET) // not supported yet
                 {
                    ici = 0;
                }
                var ar = new Debug_1.Debug(ici);
                ar.event = event;
                ar.currentline = line;
                this.__ci().top = this._stackSize;
                this._allowhook = false; // cannot call hooks inside a hook
                hook.luaHook(this, ar);
                //# assert !allowhook
                this._allowhook = true;
                this.__ci().top = ci_top;
                this.stacksetsize(top);
            }
        }
        /** Equivalent to luaD_seterrorobj.  It is valid for oldtop to be
        * equal to the current stack size (<code>stackSize</code>).
        * {@link #resume} uses this value for oldtop.
        */
        dSeterrorobj(errcode, oldtop) {
            var msg = this.objectAt(this._stackSize - 1);
            if (this._stackSize == oldtop) {
                this.stacksetsize(oldtop + 1);
            }
            switch (errcode) {
                case Lua.ERRMEM:
                    this._stack[oldtop].r = Lua.MEMERRMSG;
                    break;
                case Lua.ERRERR:
                    this._stack[oldtop].r = "error in error handling";
                    break;
                case Lua.ERRFILE:
                case Lua.ERRRUN:
                case Lua.ERRSYNTAX:
                    this.setObjectAt(msg, oldtop);
                    break;
            }
            this.stacksetsize(oldtop + 1);
        }
        dThrow(status) {
            throw new LuaError_1.LuaError(status);
        }
        //////////////////////////////////////////////////////////////////////
        // Func
        // Methods equivalent to the file lfunc.c.  Prefixed with f.
        /** Equivalent of luaF_close.  All open upvalues referencing stack
         * slots level or higher are closed.
         * @param level  Absolute stack index.
         */
        fClose(level) {
            var i = this._openupval.length;
            while (--i >= 0) {
                var uv = this._openupval[i]; //FIXME:var uv:UpVal = this._openupval.elementAt(i) as UpVal;
                if (uv.offset < level) {
                    break;
                }
                uv.close();
            }
            this._openupval.length = i + 1;
            //openupval.setSize(i+1);
            return;
        }
        fFindupval(idx) {
            /*
                * We search from the end of the Vector towards the beginning,
                * looking for an UpVal for the required stack-slot.
                */
            var i = this._openupval.length; //FIXME:.size();
            while (--i >= 0) {
                var uv2 = this._openupval[i]; //FIXME:var uv2:UpVal = this._openupval.elementAt(i) as UpVal;
                if (uv2.offset == idx) {
                    return uv2;
                }
                if (uv2.offset < idx) {
                    break;
                }
            }
            // i points to be position _after_ which we want to insert a new
            // UpVal (it's -1 when we want to insert at the beginning).
            var uv = new UpVal_1.UpVal(idx, this._stack[idx]);
            this._openupval.splice(i + 1, 0, uv); //FIXME:this._openupval.insertElementAt(uv, i+1);
            return uv;
        }
        //////////////////////////////////////////////////////////////////////
        // Debug
        // Methods equivalent to the file ldebug.c.  Prefixed with g.
        /** <var>p1</var> and <var>p2</var> are operands to a numeric opcode.
         * Corrupts <code>NUMOP[0]</code>.
         * There is the possibility of using <var>p1</var> and <var>p2</var> to
         * identify (for example) for local variable being used in the
         * computation (consider the error message for code like <code>local
         * y='a'; return y+1</code> for example).  Currently the debug info is
         * not used, and this opportunity is wasted (it would require changing
         * or overloading gTypeerror).
         */
        gAritherror(p1, p2) {
            if (!Lua.tonumber(p1, Lua.NUMOP)) {
                p2 = p1; // first operand is wrong
            }
            this.gTypeerror(p2, "perform arithmetic on");
        }
        /** <var>p1</var> and <var>p2</var> are absolute stack indexes. */
        gConcaterror(p1, p2) {
            if (this._stack[p1].r instanceof String || typeof (this._stack[p1].r) == 'string') {
                p1 = p2;
            }
            // assert !(p1 instanceof String);
            this.gTypeerror(this._stack[p1], "concatenate");
        }
        gCheckcode(p) {
            // :todo: implement me.
            return true;
        }
        gErrormsg(message) {
            this.pushObject(message);
            if (this._errfunc != null) // is there an error handling function
             {
                if (!Lua.isFunction(this._errfunc)) {
                    this.dThrow(Lua.ERRERR);
                }
                this.insert(this._errfunc, this.getTop()); // push function (under error arg)
                this.vmCall(this._stackSize - 2, 1); // call it
            }
            this.dThrow(Lua.ERRRUN);
            // NOTREACHED
            return 0;
        }
        gOrdererror(p1, p2) {
            var t1 = Lua.typeName(this.___type(p1));
            var t2 = Lua.typeName(this.___type(p2));
            if (t1.charAt(2) == t2.charAt(2)) {
                this.gRunerror("attempt to compare two " + t1 + "values");
            }
            else {
                this.gRunerror("attempt to compare " + t1 + " with " + t2);
            }
            // NOTREACHED
            return false;
        }
        gRunerror(s) {
            this.gErrormsg(s);
        }
        gTypeerror(o, op) {
            var t = Lua.typeName(Lua.____type(o));
            this.gRunerror("attempt to " + op + " a " + t + " value");
        }
        __gTypeerror(p, op) {
            // :todo: PUC-Rio searches the stack to see if the value (which may
            // be a reference to stack cell) is a local variable.
            // For now we cop out and just call gTypeerror(Object, String)
            this.gTypeerror(p.asObject(), op);
        }
        /**
         * @return a string no longer than IDSIZE.
         */
        static oChunkid(source) {
            var len = Lua.IDSIZE;
            if (source.charAt(0) == "=") {
                if (source.length < Lua.IDSIZE + 1) {
                    return source.substring(1);
                }
                else {
                    return source.substring(1, 1 + len);
                }
            }
            // else  "source" or "...source"
            if (source.charAt(0) == "@") {
                source = source.substring(1);
                len -= " '...' ".length;
                var l2 = source.length;
                if (l2 > len) {
                    return "..." + // get last part of file name
                        source.substring(source.length - len, source.length);
                }
                return source;
            }
            // else  [string "string"]
            var l = source.indexOf('\n');
            if (l == -1) {
                l = source.length;
            }
            len -= " [string \"...\"] ".length;
            if (l > len) {
                l = len;
            }
            var buf = new StringBuffer_1.StringBuffer();
            buf.appendString("[string \"");
            buf.appendString(source.substring(0, l));
            if (source.length > l) // must truncate
             {
                buf.appendString("...");
            }
            buf.appendString("\"]");
            return buf.toString();
        }
        /**
         * Equivalent to luaO_fb2int.
         * @see Syntax#oInt2fb
         */
        static oFb2int(x) {
            var e = (x >>> 3) & 31;
            if (e == 0) {
                return x;
            }
            return ((x & 7) + 8) << (e - 1);
        }
        /** Equivalent to luaO_rawequalObj. */
        static oRawequal(a, b) {
            // see also vmEqual
            if (Lua.NIL == a) {
                return Lua.NIL == b;
            }
            // Now a is not null, so a.equals() is a valid call.
            // Numbers (Doubles), Booleans, Strings all get compared by value,
            // as they should; tables, functions, get compared by identity as
            // they should.
            return a === (b);
        }
        /** Equivalent to luaO_str2d. */
        static oStr2d(s, out /*double[] */) {
            // :todo: using try/catch may be too slow.  In which case we'll have
            // to recognise the valid formats first.
            try {
                out[0] = Number(s);
                return true;
            }
            catch (e0_) {
                if (e0_ instanceof NumberFormatException_1.NumberFormatException) {
                    console.log(e0_.stack);
                }
                try {
                    // Attempt hexadecimal conversion.
                    // :todo: using String.trim is not strictly accurate, because it
                    // trims other ASCII control characters as well as whitespace.
                    s = s.replace(/ /g, "").toUpperCase(); //TODO:
                    if (s.substr(0, 2) == "0X") {
                        s = s.substring(2);
                    }
                    else if (s.substr(0, 3) == ("-0X")) {
                        s = "-" + s.substring(3);
                    }
                    else {
                        return false;
                    }
                    out[0] = parseInt(s); // TODO:16进制 16);
                    return true;
                }
                catch (e1_) {
                    if (e1_ instanceof NumberFormatException_1.NumberFormatException) {
                        console.log(e1_.stack);
                        return false;
                    }
                }
            }
            //unreachable
            return false;
        }
        // Hardwired values for speed.
        /** Equivalent of macro GET_OPCODE */
        static OPCODE(instruction) {
            // POS_OP == 0 (shift amount)
            // SIZE_OP == 6 (opcode width)
            return instruction & 0x3f;
        }
        /** Equivalent of macro GET_OPCODE */
        static SET_OPCODE(i, op) {
            // POS_OP == 0 (shift amount)
            // SIZE_OP == 6 (opcode width)
            return (i & ~0x3F) | (op & 0x3F);
        }
        /** Equivalent of macro GETARG_A */
        static ARGA(instruction) {
            // POS_A == POS_OP + SIZE_OP == 6 (shift amount)
            // SIZE_A == 8 (operand width)
            return (instruction >>> 6) & 0xff;
        }
        static SETARG_A(i, u) {
            return (i & ~(0xff << 6)) | ((u & 0xff) << 6);
        }
        /** Equivalent of macro GETARG_B */
        static ARGB(instruction) {
            // POS_B == POS_OP + SIZE_OP + SIZE_A + SIZE_C == 23 (shift amount)
            // SIZE_B == 9 (operand width)
            /* No mask required as field occupies the most significant bits of a
                * 32-bit int. */
            return (instruction >>> 23);
        }
        static SETARG_B(i, b) {
            return (i & ~(0x1ff << 23)) | ((b & 0x1ff) << 23);
        }
        /** Equivalent of macro GETARG_C */
        static ARGC(instruction) {
            // POS_C == POS_OP + SIZE_OP + SIZE_A == 14 (shift amount)
            // SIZE_C == 9 (operand width)
            return (instruction >>> 14) & 0x1ff;
        }
        static SETARG_C(i, c) {
            return (i & ~(0x1ff << 14)) | ((c & 0x1ff) << 14);
        }
        /** Equivalent of macro GETARG_Bx */
        static ARGBx(instruction) {
            // POS_Bx = POS_C == 14
            // SIZE_Bx == SIZE_C + SIZE_B == 18
            /* No mask required as field occupies the most significant bits of a
                * 32 bit int. */
            return (instruction >>> 14);
        }
        static SETARG_Bx(i, bx) {
            return (i & 0x3fff) | (bx << 14);
        }
        /** Equivalent of macro GETARG_sBx */
        static ARGsBx(instruction) {
            // As ARGBx but with (2**17-1) subtracted.
            return (instruction >>> 14) - Lua.MAXARG_sBx;
        }
        static SETARG_sBx(i, bx) {
            return (i & 0x3fff) | ((bx + Lua.MAXARG_sBx) << 14); // CHECK THIS IS RIGHT
        }
        static ISK(field) {
            // The "is constant" bit position depends on the size of the B and C
            // fields (required to be the same width).
            // SIZE_B == 9
            return field >= 0x100;
        }
        /**
        * Near equivalent of macros RKB and RKC.  Note: non-static as it
        * requires stack and base instance members.  Stands for "Register or
        * Konstant" by the way, it gets value from either the register file
        * (stack) or the constant array (k).
        */
        RK(k /*Slot[] */, field) {
            if (Lua.ISK(field)) {
                return k[field & 0xff];
            }
            return this._stack[this._base + field];
        }
        /**
        * Slower version of RK that does not receive the constant array.  Not
        * recommend for routine use, but is used by some error handling code
        * to avoid having a constant array passed around too much.
        */
        __RK(field) {
            var _function = this._stack[this.__ci().func].r;
            var k = _function.proto.constant; //Slot[]
            return this.RK(k, field);
        }
        // CREATE functions are required by FuncState, so default access.
        static CREATE_ABC(o, a, b, c) {
            // POS_OP == 0
            // POS_A == 6
            // POS_B == 23
            // POS_C == 14
            return o | (a << 6) | (b << 23) | (c << 14);
        }
        static CREATE_ABx(o, a, bc) {
            // POS_OP == 0
            // POS_A == 6
            // POS_Bx == POS_C == 14
            return o | (a << 6) | (bc << 14);
        }
        /**
         * Equivalent of luaD_call.
         * @param func  absolute stack index of function to call.
         * @param r     number of required results.
         */
        vmCall(func, r) {
            ++this._nCcalls;
            if (this.vmPrecall(func, r) == Lua.PCRLUA) {
                this.vmExecute(1);
            }
            --this._nCcalls;
        }
        /** Equivalent of luaV_concat. */
        vmConcat(total, last) {
            do {
                var top = this._base + last + 1;
                var n = 2; // number of elements handled in this pass (at least 2)
                if (!this.tostring(top - 2) || !this.tostring(top - 1)) {
                    if (!this.call_binTM(this._stack[top - 2], this._stack[top - 1], this._stack[top - 2], "__concat")) {
                        this.gConcaterror(top - 2, top - 1);
                    }
                }
                else if (this._stack[top - 1].r.length > 0) {
                    var tl = this._stack[top - 1].r.length;
                    for (n = 1; n < total && this.tostring(top - n - 1); ++n) {
                        tl += this._stack[top - n - 1].r.length;
                        if (tl < 0) {
                            this.gRunerror("string length overflow");
                        }
                    }
                    var buffer = new StringBuffer_1.StringBuffer();
                    buffer.init(tl);
                    for (var i = n; i > 0; i--) // concat all strings
                     {
                        buffer.appendString(this._stack[top - i].r);
                    }
                    this._stack[top - n].r = buffer.toString();
                }
                total -= n - 1; // got n strings to create 1 new
                last -= n - 1;
            } while (total > 1); // repeat until only 1 result left
        }
        /**
         * Primitive for testing Lua equality of two values.  Equivalent of
         * PUC-Rio's <code>equalobj</code> macro.
         * In the loosest sense, this is the equivalent of
         * <code>luaV_equalval</code>.
         */
        vmEqual(a, b) {
            // Deal with number case first
            if (Lua.NUMBER == a.r) {
                if (Lua.NUMBER != b.r) {
                    return false;
                }
                return a.d == b.d;
            }
            // Now we're only concerned with the .r field.
            return this.vmEqualRef(a.r, b.r);
        }
        /**
         * Part of {@link #vmEqual}.  Compares the reference part of two
         * Slot instances.  That is, compares two Lua values, as long as
         * neither is a number.
         */
        vmEqualRef(a, b) {
            if (a === (b)) {
                return true;
            }
            //TODO:
            //if (a.getClass != b.getClass())
            if (typeof (a) != typeof (b)) {
                return false;
            }
            // Same class, but different objects.
            if (a instanceof LuaJavaCallback_1.LuaJavaCallback ||
                a instanceof LuaTable_1.LuaTable) {
                // Resort to metamethods.
                var tm = this.get_compTM(this.getMetatable(a), this.getMetatable(b), "__eq");
                if (Lua.NIL == tm) // no TM?
                 {
                    return false;
                }
                var s = new Slot_1.Slot();
                this.__callTMres(s, tm, a, b); // call TM   //TODO:
                return !this.isFalse(s.r);
            }
            return false;
        }
        static getOpcodeName(code) {
            var name = "";
            switch (code) {
                case Lua.OP_MOVE:
                    name = "OP_MOVE";
                    break;
                case Lua.OP_LOADK:
                    name = "OP_LOADK";
                    break;
                case Lua.OP_LOADBOOL:
                    name = "OP_LOADBOOL";
                    break;
                case Lua.OP_LOADNIL:
                    name = "OP_LOADNIL";
                    break;
                case Lua.OP_GETUPVAL:
                    name = "OP_GETUPVAL";
                    break;
                case Lua.OP_GETGLOBAL:
                    name = "OP_GETGLOBAL";
                    break;
                case Lua.OP_GETTABLE:
                    name = "OP_GETTABLE";
                    break;
                case Lua.OP_SETGLOBAL:
                    name = "OP_SETGLOBAL";
                    break;
                case Lua.OP_SETUPVAL:
                    name = "OP_SETUPVAL";
                    break;
                case Lua.OP_SETTABLE:
                    name = "OP_SETTABLE";
                    break;
                case Lua.OP_NEWTABLE:
                    name = "OP_NEWTABLE";
                    break;
                case Lua.OP_SELF:
                    name = "OP_SELF";
                    break;
                case Lua.OP_ADD:
                    name = "OP_ADD";
                    break;
                case Lua.OP_SUB:
                    name = "OP_SUB";
                    break;
                case Lua.OP_MUL:
                    name = "OP_MUL";
                    break;
                case Lua.OP_DIV:
                    name = "OP_DIV";
                    break;
                case Lua.OP_MOD:
                    name = "OP_MOD";
                    break;
                case Lua.OP_POW:
                    name = "OP_POW";
                    break;
                case Lua.OP_UNM:
                    name = "OP_UNM";
                    break;
                case Lua.OP_NOT:
                    name = "OP_NOT";
                    break;
                case Lua.OP_LEN:
                    name = "OP_LEN";
                    break;
                case Lua.OP_CONCAT:
                    name = "OP_CONCAT";
                    break;
                case Lua.OP_JMP:
                    name = "OP_JMP";
                    break;
                case Lua.OP_EQ:
                    name = "OP_EQ";
                    break;
                case Lua.OP_LT:
                    name = "OP_LT";
                    break;
                case Lua.OP_LE:
                    name = "OP_LE";
                    break;
                case Lua.OP_TEST:
                    name = "OP_TEST";
                    break;
                case Lua.OP_TESTSET:
                    name = "OP_TESTSET";
                    break;
                case Lua.OP_CALL:
                    name = "OP_CALL";
                    break;
                case Lua.OP_TAILCALL:
                    name = "OP_TAILCALL";
                    break;
                case Lua.OP_RETURN:
                    name = "OP_RETURN";
                    break;
                case Lua.OP_FORLOOP:
                    name = "OP_FORLOOP";
                    break;
                case Lua.OP_FORPREP:
                    name = "OP_FORPREP";
                    break;
                case Lua.OP_TFORLOOP:
                    name = "OP_TFORLOOP";
                    break;
                case Lua.OP_SETLIST:
                    name = "OP_SETLIST";
                    break;
                case Lua.OP_CLOSE:
                    name = "OP_CLOSE";
                    break;
                case Lua.OP_CLOSURE:
                    name = "OP_CLOSURE";
                    break;
                case Lua.OP_VARARG:
                    name = "OP_VARARG";
                    break;
            }
            return name;
        }
        /** The core VM execution engine. */
        vmExecute(nexeccalls) {
            // This labelled while loop is used to simulate the effect of C's
            // goto.  The end of the while loop is never reached.  The beginning
            // of the while loop is branched to using a "continue reentry;"
            // statement (when a Lua function is called or returns).
            reentry: while (true) {
                // assert stack[ci.function()].r instanceof LuaFunction;
                var _function = this._stack[this.__ci().func].r;
                var proto = _function.proto;
                var code = proto.code; //int[]
                var k = proto.constant; //Slot[] 
                var pc = this._savedpc;
                //20170402:added
                if (Lua.D) {
                    //usage:luac -p -l cf.lua
                    for (var i_test = 0; i_test < code.length; i_test++) {
                        var name1 = Lua.getOpcodeName(Lua.OPCODE(code[i_test]));
                        console.log(">>>OPCODE(code(" + (i_test + 1) + ")) == " + name1);
                    }
                }
                while (true) // main loop of interpreter
                 {
                    // Where the PUC-Rio code used the Protect macro, this has been
                    // replaced with "savedpc = pc" and a "// Protect" comment.
                    // Where the PUC-Rio code used the dojump macro, this has been
                    // replaced with the equivalent increment of the pc and a
                    // "//dojump" comment.
                    var i = code[pc++]; // VM instruction.
                    // :todo: line hook
                    if ((this._hookmask & Lua.MASKCOUNT) != 0 && --this._hookcount == 0) {
                        this.traceexec(pc);
                        if (this.status == Lua.YIELD) // did hook yield?
                         {
                            this._savedpc = pc - 1;
                            return;
                        }
                        // base = this.base
                    }
                    var a = Lua.ARGA(i); // its A field.
                    var rb;
                    var rc;
                    //20170402:added
                    if (Lua.D) {
                        var name2 = Lua.getOpcodeName(Lua.OPCODE(i));
                        console.log(">>>pc == " + pc + ", name == " + name2);
                    }
                    switch (Lua.OPCODE(i)) {
                        case Lua.OP_MOVE:
                            this._stack[this._base + a].r = this._stack[this._base + Lua.ARGB(i)].r;
                            this._stack[this._base + a].d = this._stack[this._base + Lua.ARGB(i)].d;
                            continue;
                        case Lua.OP_LOADK:
                            this._stack[this._base + a].r = k[Lua.ARGBx(i)].r;
                            this._stack[this._base + a].d = k[Lua.ARGBx(i)].d;
                            if (Lua.D) {
                                console.log("OP_LOADK:stack[" + (this._base + a) +
                                    "]=k[" + Lua.ARGBx(i) + "]=" + k[Lua.ARGBx(i)].d);
                            }
                            continue;
                        case Lua.OP_LOADBOOL:
                            this._stack[this._base + a].r = Lua.valueOfBoolean(Lua.ARGB(i) != 0);
                            if (Lua.ARGC(i) != 0) {
                                ++pc;
                            }
                            continue;
                        case Lua.OP_LOADNIL:
                            {
                                var b = this._base + Lua.ARGB(i);
                                do {
                                    this._stack[b--].r = Lua.NIL;
                                } while (b >= this._base + a);
                                continue;
                            }
                        case Lua.OP_GETUPVAL:
                            {
                                var b2 = Lua.ARGB(i);
                                // :todo: optimise path
                                this.setObjectAt(_function.upVal(b2).value, this._base + a);
                                continue;
                            }
                        case Lua.OP_GETGLOBAL:
                            rb = k[Lua.ARGBx(i)];
                            // assert rb instance of String;
                            this._savedpc = pc; // Protect
                            this.vmGettable(_function.env, rb, this._stack[this._base + a]);
                            continue;
                        case Lua.OP_GETTABLE:
                            {
                                this._savedpc = pc; // Protect
                                var h = this._stack[this._base + Lua.ARGB(i)].asObject();
                                if (Lua.D) {
                                    console.log("OP_GETTABLE index = " + (this._base + Lua.ARGB(i)) +
                                        ", size = " + this._stack.length +
                                        ", h = " + h);
                                }
                                this.vmGettable(h, this.RK(k, Lua.ARGC(i)), this._stack[this._base + a]);
                                continue;
                            }
                        case Lua.OP_SETUPVAL:
                            {
                                var uv = _function.upVal(Lua.ARGB(i));
                                uv.value = this.objectAt(this._base + a);
                                continue;
                            }
                        case Lua.OP_SETGLOBAL:
                            this._savedpc = pc; // Protect
                            // :todo: consider inlining objectAt
                            this.vmSettable(_function.env, k[Lua.ARGBx(i)], this.objectAt(this._base + a));
                            continue;
                        case Lua.OP_SETTABLE:
                            {
                                this._savedpc = pc; // Protect
                                var t = this._stack[this._base + a].asObject();
                                this.vmSettable(t, this.RK(k, Lua.ARGB(i)), this.RK(k, Lua.ARGC(i)).asObject());
                                continue;
                            }
                        case Lua.OP_NEWTABLE:
                            {
                                var b3 = Lua.ARGB(i);
                                var c = Lua.ARGC(i);
                                this._stack[this._base + a].r = new LuaTable_1.LuaTable();
                                this._stack[this._base + a].r.init(Lua.oFb2int(b3), Lua.oFb2int(c));
                                continue;
                            }
                        case Lua.OP_SELF:
                            {
                                var b4 = Lua.ARGB(i);
                                rb = this._stack[this._base + b4];
                                this._stack[this._base + a + 1].r = rb.r;
                                this._stack[this._base + a + 1].d = rb.d;
                                this._savedpc = pc; // Protect
                                this.vmGettable(rb.asObject(), this.RK(k, Lua.ARGC(i)), this._stack[this._base + a]);
                                continue;
                            }
                        case Lua.OP_ADD:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER) {
                                var sum = rb.d + rc.d;
                                this._stack[this._base + a].d = sum;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (Lua.toNumberPair(rb, rc, Lua.NUMOP)) {
                                var sum2 = Lua.NUMOP[0] + Lua.NUMOP[1];
                                this._stack[this._base + a].d = sum2;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (!this.call_binTM(rb, rc, this._stack[this._base + a], "__add")) {
                                this.gAritherror(rb, rc);
                            }
                            continue;
                        case Lua.OP_SUB:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER) {
                                var difference = rb.d - rc.d;
                                this._stack[this._base + a].d = difference;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (Lua.toNumberPair(rb, rc, Lua.NUMOP)) {
                                var difference2 = Lua.NUMOP[0] - Lua.NUMOP[1];
                                this._stack[this._base + a].d = difference2;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (!this.call_binTM(rb, rc, this._stack[this._base + a], "__sub")) {
                                this.gAritherror(rb, rc);
                            }
                            continue;
                        case Lua.OP_MUL:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER) {
                                var product = rb.d * rc.d;
                                this._stack[this._base + a].d = product;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (Lua.toNumberPair(rb, rc, Lua.NUMOP)) {
                                var product2 = Lua.NUMOP[0] * Lua.NUMOP[1];
                                this._stack[this._base + a].d = product2;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (!this.call_binTM(rb, rc, this._stack[this._base + a], "__mul")) {
                                this.gAritherror(rb, rc);
                            }
                            continue;
                        case Lua.OP_DIV:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER) {
                                var quotient = rb.d / rc.d;
                                this._stack[this._base + a].d = quotient;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (Lua.toNumberPair(rb, rc, Lua.NUMOP)) {
                                var quotient2 = Lua.NUMOP[0] / Lua.NUMOP[1];
                                this._stack[this._base + a].d = quotient2;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (!this.call_binTM(rb, rc, this._stack[this._base + a], "__div")) {
                                this.gAritherror(rb, rc);
                            }
                            continue;
                        case Lua.OP_MOD:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER) {
                                var modulus = Lua.__modulus(rb.d, rc.d);
                                this._stack[this._base + a].d = modulus;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (Lua.toNumberPair(rb, rc, Lua.NUMOP)) {
                                var modulus2 = Lua.__modulus(Lua.NUMOP[0], Lua.NUMOP[1]);
                                this._stack[this._base + a].d = modulus2;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (!this.call_binTM(rb, rc, this._stack[this._base + a], "__mod")) {
                                this.gAritherror(rb, rc);
                            }
                            continue;
                        case Lua.OP_POW:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            if (rb.r == Lua.NUMBER && rc.r == Lua.NUMBER) {
                                var result = Lua.iNumpow(rb.d, rc.d);
                                this._stack[this._base + a].d = result;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (Lua.toNumberPair(rb, rc, Lua.NUMOP)) {
                                var result2 = Lua.iNumpow(Lua.NUMOP[0], Lua.NUMOP[1]);
                                this._stack[this._base + a].d = result2;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (!this.call_binTM(rb, rc, this._stack[this._base + a], "__pow")) {
                                this.gAritherror(rb, rc);
                            }
                            continue;
                        case Lua.OP_UNM:
                            rb = this._stack[this._base + Lua.ARGB(i)];
                            if (rb.r == Lua.NUMBER) {
                                this._stack[this._base + a].d = -rb.d;
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (Lua.tonumber(rb, Lua.NUMOP)) {
                                this._stack[this._base + a].d = -Lua.NUMOP[0];
                                this._stack[this._base + a].r = Lua.NUMBER;
                            }
                            else if (!this.call_binTM(rb, rb, this._stack[this._base + a], "__unm")) {
                                this.gAritherror(rb, rb);
                            }
                            continue;
                        case Lua.OP_NOT:
                            {
                                // All numbers are treated as true, so no need to examine
                                // the .d field.
                                var ra = this._stack[this._base + Lua.ARGB(i)].r;
                                this._stack[this._base + a].r = Lua.valueOfBoolean(this.isFalse(ra));
                                continue;
                            }
                        case Lua.OP_LEN:
                            rb = this._stack[this._base + Lua.ARGB(i)];
                            if (rb.r instanceof LuaTable_1.LuaTable) {
                                var t2 = rb.r;
                                this._stack[this._base + a].d = t2.getn();
                                this._stack[this._base + a].r = Lua.NUMBER;
                                continue;
                            }
                            else if (rb.r instanceof String || typeof (rb.r) == 'string') {
                                var s = rb.r;
                                this._stack[this._base + a].d = s.length;
                                this._stack[this._base + a].r = Lua.NUMBER;
                                continue;
                            }
                            this._savedpc = pc; // Protect
                            if (!this.call_binTM(rb, rb, this._stack[this._base + a], "__len")) {
                                this.gTypeerror(rb, "get length of");
                            }
                            continue;
                        case Lua.OP_CONCAT:
                            {
                                var b_CONCAT = Lua.ARGB(i);
                                var c_CONCAT = Lua.ARGC(i);
                                this._savedpc = pc; // Protect
                                // :todo: The compiler assumes that all
                                // stack locations _above_ b end up with junk in them.  In
                                // which case we can improve the speed of vmConcat (by not
                                // converting each stack slot, but simply using
                                // StringBuffer.append on whatever is there).
                                this.vmConcat(c_CONCAT - b_CONCAT + 1, c_CONCAT);
                                this._stack[this._base + a].r = this._stack[this._base + b_CONCAT].r;
                                this._stack[this._base + a].d = this._stack[this._base + b_CONCAT].d;
                                continue;
                            }
                        case Lua.OP_JMP:
                            // dojump
                            pc += Lua.ARGsBx(i);
                            continue;
                        case Lua.OP_EQ:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            if (this.vmEqual(rb, rc) == (a != 0)) {
                                // dojump
                                pc += Lua.ARGsBx(code[pc]);
                            }
                            ++pc;
                            continue;
                        case Lua.OP_LT:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            this._savedpc = pc; // Protect
                            if (this.vmLessthan(rb, rc) == (a != 0)) {
                                // dojump
                                pc += Lua.ARGsBx(code[pc]);
                            }
                            ++pc;
                            continue;
                        case Lua.OP_LE:
                            rb = this.RK(k, Lua.ARGB(i));
                            rc = this.RK(k, Lua.ARGC(i));
                            this._savedpc = pc; // Protect
                            if (this.vmLessequal(rb, rc) == (a != 0)) {
                                // dojump
                                pc += Lua.ARGsBx(code[pc]);
                            }
                            ++pc;
                            continue;
                        case Lua.OP_TEST:
                            if (this.isFalse(this._stack[this._base + a].r) != (Lua.ARGC(i) != 0)) {
                                // dojump
                                pc += Lua.ARGsBx(code[pc]);
                            }
                            ++pc;
                            continue;
                        case Lua.OP_TESTSET:
                            rb = this._stack[this._base + Lua.ARGB(i)];
                            if (this.isFalse(rb.r) != (Lua.ARGC(i) != 0)) {
                                this._stack[this._base + a].r = rb.r;
                                this._stack[this._base + a].d = rb.d;
                                // dojump
                                pc += Lua.ARGsBx(code[pc]);
                            }
                            ++pc;
                            continue;
                        case Lua.OP_CALL:
                            {
                                var b_CALL = Lua.ARGB(i);
                                var nresults = Lua.ARGC(i) - 1;
                                if (b_CALL != 0) //FIXME:bug: b->b_CALL
                                 {
                                    this.stacksetsize(this._base + a + b_CALL);
                                }
                                this._savedpc = pc;
                                switch (this.vmPrecall(this._base + a, nresults)) {
                                    case Lua.PCRLUA:
                                        nexeccalls++;
                                        continue reentry;
                                    case Lua.PCRJ:
                                        // Was Java function called by precall, adjust result
                                        if (nresults >= 0) {
                                            this.stacksetsize(this.__ci().top);
                                        }
                                        continue;
                                    default:
                                        return; // yield
                                }
                            }
                        case Lua.OP_TAILCALL:
                            {
                                var b_TAILCALL = Lua.ARGB(i);
                                if (b_TAILCALL != 0) {
                                    this.stacksetsize(this._base + a + b_TAILCALL);
                                }
                                this._savedpc = pc;
                                // assert ARGC(i) - 1 == MULTRET
                                switch (this.vmPrecall(this._base + a, Lua.MULTRET)) {
                                    case Lua.PCRLUA:
                                        {
                                            // tail call: put new frame in place of previous one.
                                            var ci = this._civ.elementAt(this._civ.size - 2);
                                            var func = ci.func;
                                            var fci = this.__ci(); // Fresh CallInfo
                                            var pfunc = fci.func;
                                            this.fClose(ci.base);
                                            this._base = func + (fci.base - pfunc);
                                            var aux; // loop index is used after loop ends
                                            for (aux = 0; pfunc + aux < this._stackSize; ++aux) {
                                                // move frame down
                                                this._stack[func + aux].r = this._stack[pfunc + aux].r;
                                                this._stack[func + aux].d = this._stack[pfunc + aux].d;
                                            }
                                            this.stacksetsize(func + aux); // correct top
                                            // assert stackSize == base + ((LuaFunction)stack[func]).proto().maxstacksize();
                                            ci.tailcall(this._base, this._stackSize);
                                            this.dec_ci(); // remove new frame.
                                            continue reentry;
                                        }
                                    case Lua.PCRJ: // It was a Java function
                                        {
                                            continue;
                                        }
                                    default:
                                        {
                                            return; // yield
                                        }
                                }
                            }
                        case Lua.OP_RETURN:
                            {
                                this.fClose(this._base);
                                var b_RETURN = Lua.ARGB(i);
                                if (b_RETURN != 0) {
                                    var top = a + b_RETURN - 1;
                                    this.stacksetsize(this._base + top);
                                }
                                this._savedpc = pc;
                                // 'adjust' replaces aliased 'b' in PUC-Rio code.
                                var adjust = this.vmPoscall(this._base + a);
                                if (--nexeccalls == 0) {
                                    return;
                                }
                                if (adjust) {
                                    this.stacksetsize(this.__ci().top);
                                }
                                continue reentry;
                            }
                        case Lua.OP_FORLOOP:
                            {
                                var step = this._stack[this._base + a + 2].d;
                                var idx = this._stack[this._base + a].d + step;
                                var limit = this._stack[this._base + a + 1].d;
                                if ((0 < step && idx <= limit) ||
                                    (step <= 0 && limit <= idx)) {
                                    // dojump
                                    pc += Lua.ARGsBx(i);
                                    this._stack[this._base + a].d = idx; // internal index
                                    this._stack[this._base + a].r = Lua.NUMBER;
                                    this._stack[this._base + a + 3].d = idx; // external index
                                    this._stack[this._base + a + 3].r = Lua.NUMBER;
                                }
                                continue;
                            }
                        case Lua.OP_FORPREP:
                            {
                                var init = this._base + a;
                                var plimit = this._base + a + 1;
                                var pstep = this._base + a + 2;
                                this._savedpc = pc; // next steps may throw errors
                                if (!this.tonumber(init)) {
                                    this.gRunerror("'for' initial value must be a number");
                                }
                                else if (!this.tonumber(plimit)) {
                                    this.gRunerror("'for' limit must be a number");
                                }
                                else if (!this.tonumber(pstep)) {
                                    this.gRunerror("'for' step must be a number");
                                }
                                var step_FORPREP = this._stack[pstep].d;
                                var idx_FORPREP = this._stack[init].d - step_FORPREP;
                                this._stack[init].d = idx_FORPREP;
                                this._stack[init].r = Lua.NUMBER;
                                // dojump
                                pc += Lua.ARGsBx(i);
                                continue;
                            }
                        case Lua.OP_TFORLOOP:
                            {
                                var cb = this._base + a + 3; // call base
                                this._stack[cb + 2].r = this._stack[this._base + a + 2].r;
                                this._stack[cb + 2].d = this._stack[this._base + a + 2].d;
                                this._stack[cb + 1].r = this._stack[this._base + a + 1].r;
                                this._stack[cb + 1].d = this._stack[this._base + a + 1].d;
                                this._stack[cb].r = this._stack[this._base + a].r;
                                this._stack[cb].d = this._stack[this._base + a].d;
                                this.stacksetsize(cb + 3);
                                this._savedpc = pc; // Protect
                                this.vmCall(cb, Lua.ARGC(i));
                                this.stacksetsize(this.__ci().top);
                                if (Lua.NIL != this._stack[cb].r) // continue loop
                                 {
                                    this._stack[cb - 1].r = this._stack[cb].r;
                                    this._stack[cb - 1].d = this._stack[cb].d;
                                    // dojump
                                    pc += Lua.ARGsBx(code[pc]);
                                }
                                ++pc;
                                continue;
                            }
                        case Lua.OP_SETLIST:
                            {
                                var n = Lua.ARGB(i);
                                var c_SETLIST = Lua.ARGC(i);
                                var setstack = false;
                                if (0 == n) {
                                    n = (this._stackSize - (this._base + a)) - 1;
                                    setstack = true;
                                }
                                if (0 == c_SETLIST) {
                                    c_SETLIST = code[pc++];
                                }
                                var t3 = this._stack[this._base + a].r;
                                var last = ((c_SETLIST - 1) * Lua.LFIELDS_PER_FLUSH) + n;
                                // :todo: consider expanding space in table
                                for (; n > 0; n--) {
                                    var val = this.objectAt(this._base + a + n);
                                    t3.putnum(last--, val);
                                }
                                if (setstack) {
                                    this.stacksetsize(this.__ci().top);
                                }
                                continue;
                            }
                        case Lua.OP_CLOSE:
                            this.fClose(this._base + a);
                            continue;
                        case Lua.OP_CLOSURE:
                            {
                                var p = _function.proto.proto[Lua.ARGBx(i)];
                                var nup = p.nups;
                                var up = new Array(nup); //UpVal[] 
                                for (var j = 0; j < nup; j++, pc++) {
                                    var _in = code[pc];
                                    if (Lua.OPCODE(_in) == Lua.OP_GETUPVAL) {
                                        up[j] = _function.upVal(Lua.ARGB(_in));
                                    }
                                    else {
                                        // assert OPCODE(in) == OP_MOVE;
                                        up[j] = this.fFindupval(this._base + Lua.ARGB(_in));
                                    }
                                }
                                var nf = new LuaFunction_1.LuaFunction(p, up, _function.env);
                                //up = null;
                                this._stack[this._base + a].r = nf;
                                continue;
                            }
                        case Lua.OP_VARARG:
                            {
                                var b_VARARG = Lua.ARGB(i) - 1;
                                var n_VARARG = (this._base - this.__ci().func) -
                                    _function.proto.numparams - 1;
                                if (b_VARARG == Lua.MULTRET) {
                                    // :todo: Protect
                                    // :todo: check stack
                                    b_VARARG = n_VARARG;
                                    this.stacksetsize(this._base + a + n_VARARG);
                                }
                                for (var j_VARARG = 0; j_VARARG < b_VARARG; ++j_VARARG) {
                                    if (j_VARARG < n_VARARG) {
                                        var src = this._stack[this._base - n_VARARG + j_VARARG];
                                        this._stack[this._base + a + j_VARARG].r = src.r;
                                        this._stack[this._base + a + j_VARARG].d = src.d;
                                    }
                                    else {
                                        this._stack[this._base + a + j_VARARG].r = Lua.NIL;
                                    }
                                }
                                continue;
                            }
                    } /* switch */
                } /* while */
            } /* reentry: while */
        }
        static iNumpow(a, b) {
            // :todo: this needs proper checking for boundary cases
            // EG, is currently wrong for (-0)^2.
            var invert = b < 0.0;
            if (invert)
                b = -b;
            if (a == 0.0)
                return invert ? NaN : a;
            var result = 1.0;
            var ipow = b;
            b -= ipow;
            var t = a;
            while (ipow > 0) {
                if ((ipow & 1) != 0)
                    result *= t;
                ipow >>= 1;
                t = t * t;
            }
            if (b != 0.0) // integer only case, save doing unnecessary work
             {
                if (a < 0.0) // doesn't work if a negative (complex result!)
                    return NaN;
                t = Math.sqrt(a);
                var half = 0.5;
                while (b > 0.0) {
                    if (b >= half) {
                        result = result * t;
                        b -= half;
                    }
                    b = b + b;
                    t = Math.sqrt(t);
                    if (t == 1.0)
                        break;
                }
            }
            return invert ? 1.0 / result : result;
        }
        /** Equivalent of luaV_gettable. */
        vmGettable(t, key, val) {
            var tm;
            for (var loop = 0; loop < Lua.MAXTAGLOOP; ++loop) {
                if (t instanceof LuaTable_1.LuaTable) // 't' is a table?
                 {
                    var h = t;
                    h.__getlua(key, Lua.SPARE_SLOT);
                    if (Lua.SPARE_SLOT.r != Lua.NIL) {
                        val.r = Lua.SPARE_SLOT.r;
                        val.d = Lua.SPARE_SLOT.d;
                        return;
                    }
                    tm = this.tagmethod(h, "__index");
                    if (tm == Lua.NIL) {
                        val.r = Lua.NIL;
                        return;
                    }
                    // else will try the tag method
                }
                else {
                    tm = this.tagmethod(t, "__index");
                    if (tm == Lua.NIL)
                        this.gTypeerror(t, "index");
                }
                if (Lua.isFunction(tm)) {
                    Lua.SPARE_SLOT.setObject(t);
                    this.callTMres(val, tm, Lua.SPARE_SLOT, key);
                    return;
                }
                t = tm; // else repeat with 'tm'
            }
            this.gRunerror("loop in gettable");
        }
        /** Equivalent of luaV_lessthan. */
        vmLessthan(l, r) {
            //TODO:
            //if (l.r.getClass() != r.r.getClass())
            if (typeof (l.r) != typeof (r.r)) {
                this.gOrdererror(l, r);
            }
            else if (l.r == Lua.NUMBER) {
                return l.d < r.d;
            }
            else if (l.r instanceof String || (typeof (l.r) == 'string')) {
                // :todo: PUC-Rio use strcoll, maybe we should use something
                // equivalent.
                return l.r < r.r; //TODO:compareTo
            }
            var res = this.call_orderTM(l, r, "__lt");
            if (res >= 0) {
                return res != 0;
            }
            return this.gOrdererror(l, r);
        }
        /** Equivalent of luaV_lessequal. */
        vmLessequal(l, r) {
            //TODO:
            //if (l.r.getClass() != r.r.getClass())
            if (typeof (l.r) != typeof (r.r)) {
                this.gOrdererror(l, r);
            }
            else if (l.r == Lua.NUMBER) {
                return l.d <= r.d;
            }
            else if (l.r instanceof String || typeof (l.r) == 'string') {
                return l.r <= r.r; //TODO: CompareTo
            }
            var res = this.call_orderTM(l, r, "__le"); // first try 'le'
            if (res >= 0) {
                return res != 0;
            }
            res = this.call_orderTM(r, l, "__lt"); // else try 'lt'
            if (res >= 0) {
                return res == 0;
            }
            return this.gOrdererror(l, r);
        }
        /**
         * Equivalent of luaD_poscall.
         * @param firstResult  stack index (absolute) of the first result
         */
        vmPoscall(firstResult) {
            // :todo: call hook
            var lci; // local copy, for faster access
            lci = this.dec_ci();
            // Now (as a result of the dec_ci call), lci is the CallInfo record
            // for the current function (the function executing an OP_RETURN
            // instruction), and this.ci is the CallInfo record for the function
            // we are returning to.
            var res = lci.res();
            var wanted = lci.nresults; // Caution: wanted could be == MULTRET
            var cci = this.__ci(); // Continuation CallInfo
            this._base = cci.base;
            this._savedpc = cci.savedpc;
            // Move results (and pad with nils to required number if necessary)
            var i = wanted;
            var top = this._stackSize;
            // The movement is always downwards, so copying from the top-most
            // result first is always correct.
            while (i != 0 && firstResult < top) {
                this._stack[res].r = this._stack[firstResult].r;
                this._stack[res].d = this._stack[firstResult].d;
                ++res;
                ++firstResult;
                i--;
            }
            if (i > 0) {
                this.stacksetsize(res + i);
            }
            // :todo: consider using two stacksetsize calls to nil out
            // remaining required results.
            while (i-- > 0) {
                this._stack[res++].r = Lua.NIL;
            }
            this.stacksetsize(res);
            return wanted != Lua.MULTRET;
        }
        /**
        * Equivalent of LuaD_precall.  This method expects that the arguments
        * to the function are placed above the function on the stack.
        * @param func  absolute stack index of the function to call.
        * @param r     number of results expected.
        */
        vmPrecall(func, r) {
            var faso; // Function AS Object
            faso = this._stack[func].r;
            if (!Lua.isFunction(faso)) {
                faso = this.tryfuncTM(func);
            }
            this.__ci().savedpc = this._savedpc;
            if (faso instanceof LuaFunction_1.LuaFunction) {
                var f = faso;
                var p = f.proto;
                // :todo: ensure enough stack
                if (!p.isVararg) {
                    this._base = func + 1;
                    if (this._stackSize > this._base + p.numparams) {
                        // trim stack to the argument list
                        this.stacksetsize(this._base + p.numparams);
                    }
                }
                else {
                    var nargs = (this._stackSize - func) - 1;
                    this._base = this.adjust_varargs(p, nargs);
                }
                var top = this._base + p.maxstacksize;
                this.inc_ci(func, this._base, top, r);
                this._savedpc = 0;
                // expand stack to the function's max stack size.
                this.stacksetsize(top);
                // :todo: implement call hook.
                return Lua.PCRLUA;
            }
            else if (faso instanceof LuaJavaCallback_1.LuaJavaCallback) {
                var fj = faso;
                // :todo: checkstack (not sure it's necessary)
                this._base = func + 1;
                this.inc_ci(func, this._base, this._stackSize + Lua.MINSTACK, r);
                // :todo: call hook
                var n = 99;
                try {
                    n = fj.luaFunction(this);
                }
                catch (e1) {
                    if (e1 instanceof LuaError_1.LuaError) {
                        console.log(e1.stack);
                        throw e1;
                    }
                    else if (e1 instanceof RuntimeException_1.RuntimeException) {
                        console.log(e1.stack);
                        this.yield(0);
                        throw e1;
                    }
                }
                if (n < 0) // yielding?
                 {
                    return Lua.PCRYIELD;
                }
                else {
                    this.vmPoscall(this._stackSize - n);
                    return Lua.PCRJ;
                }
            }
            throw new IllegalArgumentException_1.IllegalArgumentException();
        }
        /** Equivalent of luaV_settable. */
        vmSettable(t, key, val) {
            for (var loop = 0; loop < Lua.MAXTAGLOOP; ++loop) {
                var tm;
                if (t instanceof LuaTable_1.LuaTable) // 't' is a table
                 {
                    var h = t;
                    h.__getlua(key, Lua.SPARE_SLOT);
                    if (Lua.SPARE_SLOT.r != Lua.NIL) // result is not nil?
                     {
                        h.putluaSlot(this, key, val);
                        return;
                    }
                    tm = this.tagmethod(h, "__newindex");
                    if (tm == Lua.NIL) // or no TM?
                     {
                        h.putluaSlot(this, key, val);
                        return;
                    }
                    // else will try the tag method
                }
                else {
                    tm = this.tagmethod(t, "__newindex");
                    if (tm == Lua.NIL)
                        this.gTypeerror(t, "index");
                }
                if (Lua.isFunction(tm)) {
                    this.callTM(tm, t, key, val);
                    return;
                }
                t = tm; // else repeat with 'tm'
            }
            this.gRunerror("loop in settable");
        }
        static vmTostring(o) {
            if (o instanceof String || typeof (o) == 'string') {
                return o;
            }
            if (!(o instanceof Number) || typeof (o) == 'number') {
                return null;
            }
            // Convert number to string.  PUC-Rio abstracts this operation into
            // a macro, lua_number2str.  The macro is only invoked from their
            // equivalent of this code.
            // Formerly this code used Double.toString (and remove any trailing
            // ".0") but this does not give an accurate emulation of the PUC-Rio
            // behaviour which Intuwave require.  So now we use "%.14g" like
            // PUC-Rio.
            // :todo: consider optimisation of making FormatItem an immutable
            // class and keeping a static reference to the required instance
            // (which never changes).  A possible half-way house would be to
            // create a copied instance from an already create prototype
            // instance which would be faster than parsing the format string
            // each time.
            var f = new FormatItem_1.FormatItem(null, Lua.NUMBER_FMT);
            var b = new StringBuffer_1.StringBuffer();
            var d = o;
            f.formatFloat(b, d);
            return b.toString();
        }
        /** Equivalent of adjust_varargs in "ldo.c". */
        adjust_varargs(p, actual) {
            var nfixargs = p.numparams;
            for (; actual < nfixargs; ++actual) {
                this.stackAdd(Lua.NIL);
            }
            // PUC-Rio's LUA_COMPAT_VARARG is not supported here.
            // Move fixed parameters to final position
            var fixed = this._stackSize - actual; // first fixed argument
            var newbase = this._stackSize; // final position of first argument
            for (var i = 0; i < nfixargs; ++i) {
                // :todo: arraycopy?
                this.pushSlot(this._stack[fixed + i]);
                this._stack[fixed + i].r = Lua.NIL;
            }
            return newbase;
        }
        /**
         * Does not modify contents of p1 or p2.  Modifies contents of res.
         * @param p1  left hand operand.
         * @param p2  right hand operand.
         * @param res absolute stack index of result.
         * @return false if no tagmethod, true otherwise
         */
        call_binTM(p1, p2, res, event) {
            var tm = this.tagmethod(p1.asObject(), event); // try first operand
            if (Lua.isNil(tm)) {
                tm = this.tagmethod(p2.asObject(), event); // try second operand
            }
            if (!Lua.isFunction(tm)) {
                return false;
            }
            this.callTMres(res, tm, p1, p2);
            return true;
        }
        /**
        * @return -1 if no tagmethod, 0 false, 1 true
        */
        call_orderTM(p1, p2, event) {
            var tm1 = this.tagmethod(p1.asObject(), event);
            if (tm1 == Lua.NIL) // not metamethod
             {
                return -1;
            }
            var tm2 = this.tagmethod(p2.asObject(), event);
            if (!Lua.oRawequal(tm1, tm2)) // different metamethods?
             {
                return -1;
            }
            var s = new Slot_1.Slot();
            this.callTMres(s, tm1, p1, p2);
            return this.isFalse(s.r) ? 0 : 1;
        }
        callTM(f, p1, p2, p3) {
            this.pushObject(f);
            this.pushObject(p1);
            this.pushSlot(p2);
            this.pushObject(p3);
            this.vmCall(this._stackSize - 4, 0);
        }
        callTMres(res, f, p1, p2) {
            this.pushObject(f);
            this.pushSlot(p1);
            this.pushSlot(p2);
            this.vmCall(this._stackSize - 3, 1);
            res.r = this._stack[this._stackSize - 1].r;
            res.d = this._stack[this._stackSize - 1].d;
            this.pop(1);
        }
        /**
         * Overloaded version of callTMres used by {@link #vmEqualRef}.
         * Textuall identical, but a different (overloaded) push method is
         * invoked.
         */
        __callTMres(res, f, p1, p2) {
            this.pushObject(f);
            this.pushObject(p1);
            this.pushObject(p2);
            this.vmCall(this._stackSize - 3, 1);
            res.r = this._stack[this._stackSize - 1].r;
            res.d = this._stack[this._stackSize - 1].d;
            this.pop(1);
        }
        get_compTM(mt1, mt2, event) {
            if (mt1 == null) {
                return Lua.NIL;
            }
            var tm1 = mt1.getlua(event);
            if (Lua.isNil(tm1)) {
                return Lua.NIL; // no metamethod
            }
            if (mt1 == mt2) {
                return tm1; // same metatables => same metamethods
            }
            if (mt2 == null) {
                return Lua.NIL;
            }
            var tm2 = mt2.getlua(event);
            if (Lua.isNil(tm2)) {
                return Lua.NIL; // no metamethod
            }
            if (Lua.oRawequal(tm1, tm2)) // same metamethods?
             {
                return tm1;
            }
            return Lua.NIL;
        }
        /**
        * Gets tagmethod for object.
        * @return method or nil.
        */
        tagmethod(o, event) {
            return this.getMetafield(o, event);
        }
        /** @deprecated DO NOT CALL */
        __tagmethod(o, event) {
            throw new IllegalArgumentException_1.IllegalArgumentException("tagmethod called");
        }
        /**
        * Computes the result of Lua's modules operator (%).  Note that this
        * modulus operator does not match Java's %.
        */
        static __modulus(x, y) {
            return x - Math.floor(x / y) * y;
        }
        /**
        * Changes the stack size, padding with NIL where necessary, and
        * allocate a new stack array if necessary.
        */
        stacksetsize(n) {
            if (n == 3) {
                if (Lua.D) {
                    console.log("stacksetsize:" + n);
                }
            }
            //20170402:added
            if (n == 7) {
                if (Lua.D) {
                    console.log(">>>stacksetsize:" + n);
                }
            }
            // It is absolutely critical that when the stack changes sizes those
            // elements that are common to both old and new stack are unchanged.
            // First implementation of this simply ensures that the stack array
            // has at least the required size number of elements.
            // :todo: consider policies where the stack may also shrink.
            var old = this._stackSize;
            if (n > this._stack.length) {
                //以2倍速度增加堆栈的深度
                var newLength = Math.max(n, 2 * this._stack.length);
                var newStack = new Array(newLength); //Slot[] 
                // Currently the stack only ever grows, so the number of items to
                // copy is the length of the old stack.
                var toCopy = this._stack.length;
                SystemUtil_1.SystemUtil.arraycopy(this._stack, 0, newStack, 0, toCopy);
                //trace(newStack[0]);
                this._stack = newStack;
            }
            this._stackSize = n;
            // Nilling out.  The VM requires that fresh stack slots allocated
            // for a new function activation are initialised to nil (which is
            // Lua.NIL, which is not Java null).
            // There are basically two approaches: nil out when the stack grows,
            // or nil out when it shrinks.  Nilling out when the stack grows is
            // slightly simpler, but nilling out when the stack shrinks means
            // that semantic garbage is not retained by the GC.
            // We nil out slots when the stack shrinks, but we also need to make
            // sure they are nil initially.
            // In order to avoid nilling the entire array when we allocate one
            // we maintain a stackhighwater which is 1 more than that largest
            // stack slot that has been nilled.  We use this to nil out stacks
            // slow when we grow.
            if (n <= old) {
                // when shrinking
                for (var i = n; i < old; ++i) {
                    this._stack[i].r = Lua.NIL;
                }
            }
            if (n > this._stackhighwater) {
                // when growing above stackhighwater for the first time
                for (i = this._stackhighwater; i < n; ++i) {
                    this._stack[i] = new Slot_1.Slot();
                    this._stack[i].r = Lua.NIL;
                }
                this._stackhighwater = n;
            }
        }
        /**
         * Pushes a Lua value onto the stack.
         * 压入一个Lua值进堆栈
         */
        stackAdd(o) {
            var i = this._stackSize;
            this.stacksetsize(i + 1);
            this._stack[i].setObject(o);
        }
        /**
         * Copies a slot into a new space in the stack.
         */
        pushSlot(p) {
            var i = this._stackSize;
            this.stacksetsize(i + 1);
            this._stack[i].r = p.r;
            this._stack[i].d = p.d;
        }
        stackInsertAt(o, i) {
            var n = this._stackSize - i;
            this.stacksetsize(this._stackSize + 1);
            // Copy each slot N into its neighbour N+1.  Loop proceeds from high
            // index slots to lower index slots.
            // A loop from n to 1 copies n slots.
            for (var j = n; j >= 1; --j) {
                this._stack[i + j].r = this._stack[i + j - 1].r;
                this._stack[i + j].d = this._stack[i + j - 1].d;
            }
            this._stack[i].setObject(o);
        }
        /**
        * Equivalent of macro in ldebug.h.
        */
        resethookcount() {
            this._hookcount = this._basehookcount;
        }
        /**
         * Equivalent of traceexec in lvm.c.
         */
        traceexec(pc) {
            var mask = this._hookmask;
            var oldpc = this._savedpc;
            this._savedpc = pc;
            if (mask > Lua.MASKLINE) // instruction-hook set?
             {
                if (this._hookcount == 0) {
                    this.resethookcount();
                    this.dCallhook(Lua.HOOKCOUNT, -1);
                }
            }
            // :todo: line hook.
        }
        /**
        * Convert to number.  Returns true if the argument <var>o</var> was
        * converted to a number.  Converted number is placed in <var>out[0]</var>.
        * Returns
        * false if the argument <var>o</var> could not be converted to a number.
        * Overloaded.
        */
        static tonumber(o, out /*double[] */) {
            if (o.r == Lua.NUMBER) {
                out[0] = o.d;
                return true;
            }
            if (!(o.r instanceof String || typeof (o.r) == 'string')) {
                return false;
            }
            if (Lua.oStr2d(o.r, out)) {
                return true;
            }
            return false;
        }
        /**
         * Converts a stack slot to number.  Returns true if the element at
         * the specified stack slot was converted to a number.  False
         * otherwise.  Note that this actually modifies the element stored at
         * <var>idx</var> in the stack (in faithful emulation of the PUC-Rio
         * code).  Corrupts <code>NUMOP[0]</code>.  Overloaded.
         * @param idx  absolute stack slot.
         */
        tonumber(idx) {
            if (Lua.tonumber(this._stack[idx], Lua.NUMOP)) {
                this._stack[idx].d = Lua.NUMOP[0];
                this._stack[idx].r = Lua.NUMBER;
                return true;
            }
            return false;
        }
        /**
         * Convert a pair of operands for an arithmetic opcode.  Stores
         * converted results in <code>out[0]</code> and <code>out[1]</code>.
         * @return true if and only if both values converted to number.
         */
        static toNumberPair(x, y, out /*double[] */) {
            if (this.tonumber(y, out)) {
                out[1] = out[0];
                if (this.tonumber(x, out)) {
                    return true;
                }
            }
            return false;
        }
        /**
         * Convert to string.  Returns true if element was number or string
         * (the number will have been converted to a string), false otherwise.
         * Note this actually modifies the element stored at <var>idx</var> in
         * the stack (in faithful emulation of the PUC-Rio code), and when it
         * returns <code>true</code>, <code>stack[idx].r instanceof String</code>
         * is true.
         */
        tostring(idx) {
            // :todo: optimise
            var o = this.objectAt(idx);
            var s = Lua.vmTostring(o);
            if (s == null) {
                return false;
            }
            this._stack[idx].r = s;
            return true;
        }
        /**
         * Equivalent to tryfuncTM from ldo.c.
         * @param func  absolute stack index of the function object.
         */
        tryfuncTM(func) {
            var tm = this.tagmethod(this._stack[func].asObject(), "__call");
            if (!Lua.isFunction(tm)) {
                this.gTypeerror(this._stack[func], "call");
            }
            this.stackInsertAt(tm, func);
            return tm;
        }
        /** Lua's is False predicate. */
        isFalse(o) {
            return o == Lua.NIL || o == false;
        }
        /** @deprecated DO NOT CALL. */
        __isFalse(o) {
            throw new IllegalArgumentException_1.IllegalArgumentException("isFalse called");
        }
        /** Make new CallInfo record. */
        inc_ci(func, baseArg, top, nresults) {
            var ci = new CallInfo_1.CallInfo();
            ci.init(func, baseArg, top, nresults);
            this._civ.addElement(ci);
            return ci;
        }
        /** Pop topmost CallInfo record and return it. */
        dec_ci() {
            var ci = this._civ.pop();
            return ci;
        }
        /** Equivalent to resume_error from ldo.c */
        resume_error(msg) {
            this.stacksetsize(this.__ci().base);
            this.stackAdd(msg);
            return Lua.ERRRUN;
        }
        /**
         * Return the stack element as an Object.  Converts double values into
         * Double objects.
         * @param idx  absolute index into stack (0 <= idx < stackSize).
         */
        objectAt(idx) {
            var r = this._stack[idx].r;
            if (r != Lua.NUMBER) {
                return r;
            }
            return new Number(this._stack[idx].d);
        }
        /**
         * Sets the stack element.  Double instances are converted to double.
         * @param o  Object to store.
         * @param idx  absolute index into stack (0 <= idx < stackSize).
         */
        setObjectAt(o, idx) {
            if (o instanceof Number) {
                this._stack[idx].r = Lua.NUMBER;
                this._stack[idx].d = o;
                return;
            }
            if (Lua.D) {
                console.log("setObjectAt(o, " + idx + ") from " + this._stack);
            }
            this._stack[idx].r = o;
        }
        /**
         * Corresponds to ldump's luaU_dump method, but with data gone and writer
         * replaced by OutputStream.
         */
        static uDump(f, writer, strip) {
            var d = new DumpState_1.DumpState(new DataOutputStream_1.DataOutputStream(writer), strip);
            d.DumpHeader();
            d.DumpFunction(f, null);
            d.writer.flush();
            return 0; // Any errors result in thrown exceptions.
        }
        get global() {
            return this._global;
        }
        set global(global) {
            this._global = global;
        }
        //新增
        set nCcalls(nCcalls) {
            this._nCcalls = nCcalls;
        }
        //新增
        get nCcalls() {
            return this._nCcalls;
        }
    }
    exports.Lua = Lua;
    Lua.D = false;
    /** Version string. */
    Lua.VERSION = "Lua 5.1 (Jill 1.0.1)";
    Lua.RELEASE = "Lua 5.1.4 (Jill 1.0.1)";
    Lua.VERSION_NUM = 501;
    Lua.COPYRIGHT = "Copyright (C) 1994-2008 Lua.org, PUC-Rio (Copyright (C) 2006 Nokia Corporation and/or its subsidiary(-ies))";
    /** http://www.ravenbrook.com */
    Lua.AUTHORS = "R. Ierusalimschy, L. H. de Figueiredo & W. Celes (Ravenbrook Limited)";
    /** Number of list items to accumulate before a SETLIST instruction. */
    Lua.LFIELDS_PER_FLUSH = 50;
    /** Limit for table tag-method chains (to avoid loops) */
    Lua.MAXTAGLOOP = 100;
    /** Nonce object used by pcall and friends (to detect when an
    * exception is a Lua error). */
    Lua.LUA_ERROR = "";
    /**
     * Maximum number of local variables per function.  As per
     * LUAI_MAXVARS from "luaconf.h".  Default access so that {@link
     * FuncState} can see it.
     */
    Lua.MAXVARS = 200;
    Lua.MAXSTACK = 250;
    Lua.MAXUPVALUES = 60;
    /**
     * Stored in Slot.r to denote a numeric value (which is stored at
     * Slot.d).
     */
    Lua.NUMBER = new Object();
    /**
     * Spare Slot used for a temporary.
     */
    Lua.SPARE_SLOT = new Slot_1.Slot();
    /**
    * Registry key for loaded modules.
    */
    Lua.LOADED = "_LOADED";
    //////////////////////////////////////////////////////////////////////
    // Public API
    /**
     * Creates a fresh Lua state.
     */
    /*
    public function Lua()
    {
        this._global = new LuaTable();
        this._registry = new LuaTable();
        this._metatable = new Array(NUM_TAGS); //LuaTable[]
        this._main = this;
    }
    */
    /**
    * Equivalent of LUA_MULTRET.
    */
    // Required, by vmPoscall, to be negative.
    Lua.MULTRET = -1;
    /**
    * The Lua <code>nil</code> value.
    */
    Lua.NIL = new Object();
    // Lua type tags, from lua.h
    /** Lua type tag, representing no stack value. */
    Lua.TNONE = -1;
    /** Lua type tag, representing <code>nil</code>. */
    Lua.TNIL = 0;
    /** Lua type tag, representing boolean. */
    Lua.TBOOLEAN = 1;
    // TLIGHTUSERDATA not available.  :todo: make available?
    /** Lua type tag, representing numbers. */
    Lua.TNUMBER = 3;
    /** Lua type tag, representing strings. */
    Lua.TSTRING = 4;
    /** Lua type tag, representing tables. */
    Lua.TTABLE = 5;
    /** Lua type tag, representing functions. */
    Lua.TFUNCTION = 6;
    /** Lua type tag, representing userdata. */
    Lua.TUSERDATA = 7;
    /** Lua type tag, representing threads. */
    Lua.TTHREAD = 8;
    /**
     * Number of type tags.  Should be one more than the
     * last entry in the list of tags.
     * 类型标签个数
     */
    Lua.NUM_TAGS = 9;
    /** Names for above type tags, starting from {@link #TNIL}.
    * Equivalent to luaT_typenames.
    */
    Lua.TYPENAME = [
        "nil", "boolean", "userdata", "number",
        "string", "table", "function", "userdata", "thread"
    ];
    /**
    * Minimum stack size that Lua Java functions gets.  May turn out to
    * be silly / redundant.
    */
    Lua.MINSTACK = 20;
    /** Status code, returned from pcall and friends, that indicates the
    * thread has yielded.
    */
    Lua.YIELD = 1;
    /** Status code, returned from pcall and friends, that indicates
    * a runtime error.
    */
    Lua.ERRRUN = 2;
    /** Status code, returned from pcall and friends, that indicates
    * a syntax error.
    */
    Lua.ERRSYNTAX = 3;
    /** Status code, returned from pcall and friends, that indicates
    * a memory allocation error.
    */
    Lua.ERRMEM = 4;
    /** Status code, returned from pcall and friends, that indicates
    * an error whilst running the error handler function.
    */
    Lua.ERRERR = 5;
    /** Status code, returned from loadFile and friends, that indicates
    * an IO error.
    */
    Lua.ERRFILE = 6;
    // Enums for gc().
    /** Action, passed to {@link #gc}, that requests the GC to stop. */
    Lua.GCSTOP = 0;
    /** Action, passed to {@link #gc}, that requests the GC to restart. */
    Lua.GCRESTART = 1;
    /** Action, passed to {@link #gc}, that requests a full collection. */
    Lua.GCCOLLECT = 2;
    /** Action, passed to {@link #gc}, that returns amount of memory
     * (in Kibibytes) in use (by the entire Java runtime).
     */
    Lua.GCCOUNT = 3;
    /** Action, passed to {@link #gc}, that returns the remainder of
     * dividing the amount of memory in use by 1024.
     */
    Lua.GCCOUNTB = 4;
    /** Action, passed to {@link #gc}, that requests an incremental
     * garbage collection be performed.
     */
    Lua.GCSTEP = 5;
    /** Action, passed to {@link #gc}, that sets a new value for the
     * <var>pause</var> of the collector.
     */
    Lua.GCSETPAUSE = 6;
    /** Action, passed to {@link #gc}, that sets a new values for the
     * <var>step multiplier</var> of the collector.
     */
    Lua.GCSETSTEPMUL = 7;
    // Some of the hooks, etc, aren't implemented, so remain private.
    Lua.HOOKCALL = 0;
    Lua.HOOKRET = 1;
    Lua.HOOKLINE = 2;
    /**
     * When {@link Hook} callback is called as a line hook, its
     * <var>ar.event</var> field is <code>HOOKCOUNT</code>.
     */
    Lua.HOOKCOUNT = 3;
    Lua.HOOKTAILRET = 4;
    Lua.MASKCALL = 1 << Lua.HOOKCALL;
    Lua.MASKRET = 1 << Lua.HOOKRET;
    Lua.MASKLINE = 1 << Lua.HOOKLINE;
    /**
    * Bitmask that specifies count hook in call to {@link #setHook}.
    */
    Lua.MASKCOUNT = 1 << Lua.HOOKCOUNT;
    Lua.MEMERRMSG = "not enough memory";
    //////////////////////////////////////////////////////////////////////
    // Object
    // Methods equivalent to the file lobject.c.  Prefixed with o.
    Lua.IDSIZE = 60;
    ////////////////////////////////////////////////////////////////////////
    // VM
    // Most of the methods in this section are equivalent to the files
    // lvm.c and ldo.c from PUC-Rio.  They're mostly prefixed with vm as
    // well.
    Lua.PCRLUA = 0;
    Lua.PCRJ = 1;
    Lua.PCRYIELD = 2;
    // Instruction decomposition.
    // There follows a series of methods that extract the various fields
    // from a VM instruction.  See lopcodes.h from PUC-Rio.
    // :todo: Consider replacing with m4 macros (or similar).
    // A brief overview of the instruction format:
    // Logically an instruction has an opcode (6 bits), op, and up to
    // three fields using one of three formats:
    // A B C  (8 bits, 9 bits, 9 bits)
    // A Bx   (8 bits, 18 bits)
    // A sBx  (8 bits, 18 bits signed - excess K)
    // Some instructions do not use all the fields (EG OP_UNM only uses A
    // and B).
    // When packed into a word (an int in Jill) the following layouts are
    // used:
    //  31 (MSB)    23 22          14 13         6 5      0 (LSB)
    // +--------------+--------------+------------+--------+
    // | B            | C            | A          | OPCODE |
    // +--------------+--------------+------------+--------+
    //
    // +--------------+--------------+------------+--------+
    // | Bx                          | A          | OPCODE |
    // +--------------+--------------+------------+--------+
    //
    // +--------------+--------------+------------+--------+
    // | sBx                         | A          | OPCODE |
    // +--------------+--------------+------------+--------+
    Lua.NO_REG = 0xff; // SIZE_A == 8, (1 << 8)-1
    // opcode enumeration.
    // Generated by a script:
    // awk -f opcode.awk < lopcodes.h
    // and then pasted into here.
    // Made default access so that code generation, in FuncState, can see
    // the enumeration as well.
    Lua.OP_MOVE = 0;
    Lua.OP_LOADK = 1;
    Lua.OP_LOADBOOL = 2;
    Lua.OP_LOADNIL = 3;
    Lua.OP_GETUPVAL = 4;
    Lua.OP_GETGLOBAL = 5;
    Lua.OP_GETTABLE = 6;
    Lua.OP_SETGLOBAL = 7;
    Lua.OP_SETUPVAL = 8;
    Lua.OP_SETTABLE = 9;
    Lua.OP_NEWTABLE = 10;
    Lua.OP_SELF = 11;
    Lua.OP_ADD = 12;
    Lua.OP_SUB = 13;
    Lua.OP_MUL = 14;
    Lua.OP_DIV = 15;
    Lua.OP_MOD = 16;
    Lua.OP_POW = 17;
    Lua.OP_UNM = 18;
    Lua.OP_NOT = 19;
    Lua.OP_LEN = 20;
    Lua.OP_CONCAT = 21;
    Lua.OP_JMP = 22;
    Lua.OP_EQ = 23;
    Lua.OP_LT = 24;
    Lua.OP_LE = 25;
    Lua.OP_TEST = 26;
    Lua.OP_TESTSET = 27;
    Lua.OP_CALL = 28;
    Lua.OP_TAILCALL = 29;
    Lua.OP_RETURN = 30;
    Lua.OP_FORLOOP = 31;
    Lua.OP_FORPREP = 32;
    Lua.OP_TFORLOOP = 33;
    Lua.OP_SETLIST = 34;
    Lua.OP_CLOSE = 35;
    Lua.OP_CLOSURE = 36;
    Lua.OP_VARARG = 37;
    // end of instruction decomposition
    Lua.SIZE_C = 9;
    Lua.SIZE_B = 9;
    Lua.SIZE_Bx = Lua.SIZE_C + Lua.SIZE_B;
    Lua.SIZE_A = 8;
    Lua.SIZE_OP = 6;
    Lua.POS_OP = 0;
    Lua.POS_A = Lua.POS_OP + Lua.SIZE_OP;
    Lua.POS_C = Lua.POS_A + Lua.SIZE_A;
    Lua.POS_B = Lua.POS_C + Lua.SIZE_C;
    Lua.POS_Bx = Lua.POS_C;
    Lua.MAXARG_Bx = (1 << Lua.SIZE_Bx) - 1;
    Lua.MAXARG_sBx = Lua.MAXARG_Bx >> 1; // `sBx' is signed
    Lua.MAXARG_A = (1 << Lua.SIZE_A) - 1;
    Lua.MAXARG_B = (1 << Lua.SIZE_B) - 1;
    Lua.MAXARG_C = (1 << Lua.SIZE_C) - 1;
    /* this bit 1 means constant (0 means register) */
    Lua.BITRK = 1 << (Lua.SIZE_B - 1);
    Lua.MAXINDEXRK = Lua.BITRK - 1;
    /**
     * Array of numeric operands.  Used when converting strings to numbers
     * by an arithmetic opcode (ADD, SUB, MUL, DIV, MOD, POW, UNM).
     */
    Lua.NUMOP = new Array(2); //double[]
    /**
    * Printf format item used to convert numbers to strings (in {@link
    * #vmTostring}).  The initial '%' should be not specified.
    */
    Lua.NUMBER_FMT = ".14g";
});

},{"../java/DataOutputStream":6,"../java/IOException":11,"../java/IllegalArgumentException":12,"../java/NullPointerException":16,"../java/NumberFormatException":17,"../java/OutOfMemoryError":18,"../java/Runtime":23,"../java/RuntimeException":24,"../java/Stack":25,"../java/StringBuffer":26,"../java/SystemUtil":27,"./CallInfo":32,"./Debug":34,"./DumpState":35,"./FormatItem":39,"./LuaError":46,"./LuaFunction":47,"./LuaInternal":48,"./LuaJavaCallback":49,"./LuaTable":50,"./LuaUserdata":51,"./Slot":57,"./StringReader":59,"./UpVal":62}],46:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/RuntimeException"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LuaError = void 0;
    const RuntimeException_1 = require("../java/RuntimeException");
    /*  $Header$
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
     * Represent a Lua error
     */
    class LuaError extends RuntimeException_1.RuntimeException {
        constructor(errorStatus) {
            super();
            this.message = "Lua error"; //super("Lua error");
            this._errorStatus = errorStatus;
        }
        get errorStatus() {
            return this._errorStatus;
        }
    }
    exports.LuaError = LuaError;
});

},{"../java/RuntimeException":24}],47:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/NullPointerException", "../java/IllegalArgumentException"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LuaFunction = void 0;
    const NullPointerException_1 = require("../java/NullPointerException");
    const IllegalArgumentException_1 = require("../java/IllegalArgumentException");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaFunction.java#1 $
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
     * Models a Lua function.
     * Note that whilst the class is public, its constructors are not.
     * Functions are created by loading Lua chunks (in source or binary
     * form) or executing Lua code which defines functions (and, for
     * example, places them in the global table).  {@link
     * Lua#load(InputStream, String) Lua.load} is used
     * to load a Lua chunk (it returns a <code>LuaFunction</code>),
     * and {@link Lua#call Lua.call} is used to call a function.
     */
    class LuaFunction {
        /**
         * Constructs an instance from a triple of {Proto, upvalues,
         * environment}.  Deliberately not public, See {@link
         * Lua#load(InputStream, String) Lua.load} for
         * public construction.  All arguments are referenced from the
         * instance.  The <code>upval</code> array must have exactly the same
         * number of elements as the number of upvalues in <code>proto</code>
         * (the value of the <code>nups</code> parameter in the
         * <code>Proto</code> constructor).
         *
         * @param proto  A Proto object.
         * @param upval  Array of upvalues.
         * @param env    The function's environment.
         * @throws NullPointerException if any arguments are null.
         * @throws IllegalArgumentsException if upval.length is wrong.
         */
        constructor(proto, upval /*UpVal[]*/, env) {
            if (null == proto || null == upval || null == env) {
                throw new NullPointerException_1.NullPointerException();
            }
            if (upval.length != proto.nups) {
                throw new IllegalArgumentException_1.IllegalArgumentException();
            }
            this._p = proto;
            this._upval = upval;
            //FIXME:调试用
            //if (this._upval != null && 
            //	this._upval.length == 2)
            //{
            //	(this._upval[0] as UpVal)._s.tagUpVal = true;
            //	(this._upval[1] as UpVal)._s.tagUpVal = true;
            //	trace("this._upval.length == 2");
            //}
            this._env = env;
        }
        /** Get nth UpVal. */
        upVal(n) {
            return this._upval[n];
        }
        /** Get the Proto object. */
        get proto() {
            return this._p;
        }
        /** Getter for environment. */
        get env() {
            return this._env;
        }
        /** Setter for environment. */
        set env(env) {
            if (null == env) {
                throw new NullPointerException_1.NullPointerException();
            }
            this._env = env;
        }
    }
    exports.LuaFunction = LuaFunction;
});

},{"../java/IllegalArgumentException":12,"../java/NullPointerException":16}],48:[function(require,module,exports){
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

},{"../java/InputStreamReader":14,"./FromReader":40,"./Loader":43,"./Lua":45,"./LuaFunction":47,"./LuaJavaCallback":49,"./Syntax":60}],49:[function(require,module,exports){
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
    exports.LuaJavaCallback = void 0;
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaJavaCallback.java#1 $
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
     * Common superclass for all Lua Java Functions.  A Lua function that
     * is implemented in Java is called a Lua Java Function.  Each such
     * function corresponds to an indirect instance of this class.  If you
     * wish to implement your own Lua Java Function then you'll need to
     * subclass this class and have one instance for each function that you
     * need.  It is recommended that you extend the class with at least one
     * member so that you can distinguish the different instances.  Whilst
     * it is possible to implement each different Lua Java Function by
     * having a new subclass for each one, this is not recommended as it
     * will increase the size of the resulting <code>.jar</code> file by a
     * large amount.
     */
    class LuaJavaCallback {
        luaFunction(L) {
            throw new Error("abstract class error");
        }
    }
    exports.LuaJavaCallback = LuaJavaCallback;
});

},{}],50:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Hashtable", "../java/SystemUtil", "../java/IllegalArgumentException", "./Lua", "./Enum"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LuaTable = void 0;
    const Hashtable_1 = require("../java/Hashtable");
    const SystemUtil_1 = require("../java/SystemUtil");
    const IllegalArgumentException_1 = require("../java/IllegalArgumentException");
    const Lua_1 = require("./Lua");
    const Enum_1 = require("./Enum");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaTable.java#1 $
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
     * Class that models Lua's tables.  Each Lua table is an instance of
     * this class.  Whilst you can clearly see that this class extends
     * {@link java.util.Hashtable} you should in no way rely upon that.
     * Calling any methods that are not defined in this class (but are
     * defined in a super class) is extremely deprecated.
     */
    class LuaTable extends Hashtable_1.Hashtable {
        constructor() {
            //TODO:暂时屏蔽
            super(1);
            this._metatable = null; // = null;
            /**
             * Array used so that tables accessed like arrays are more efficient.
             * All elements stored at an integer index, <var>i</var>, in the
             * range [1,sizeArray] are stored at <code>array[i-1]</code>.
             * This speed and space usage for array-like access.
             * When the table is rehashed the array's size is chosen to be the
             * largest power of 2 such that at least half the entries are
             * occupied.  Default access granted for {@link Enum} class, do not
             * abuse.
             */
            this._array = LuaTable.ZERO; //Object[]
            /**
             * Equal to <code>array.length</code>.  Default access granted for
             * {@link Enum} class, do not abuse.
             */
            this._sizeArray = 0; // = 0;
            /**
             * <code>true</code> whenever we are in the {@link #rehash}
             * method.  Avoids infinite rehash loops.
             */
            this._inrehash = false; // = false;
        }
        /**
         * Fresh LuaTable with hints for preallocating to size.
         * @param narray  number of array slots to preallocate.
         * @param nhash   number of hash slots to preallocate.
         */
        init(narray, nhash) {
            // :todo: super(nhash) isn't clearly correct as adding nhash hash
            // table entries will causes a rehash with the usual implementation
            // (which rehashes when ratio of entries to capacity exceeds the
            // load factor of 0.75).  Perhaps ideally we would size the hash
            // tables such that adding nhash entries will not cause a rehash.
            //TODO:
            //super(nhash); 
            this._array = new Array(narray);
            for (var i = 0; i < narray; ++i) {
                this._array[i] = Lua_1.Lua.NIL;
            }
            this._sizeArray = narray;
        }
        /**
         * Implements discriminating equality.  <code>o1.equals(o2) == (o1 ==
         * o2) </code>.  This method is not necessary in CLDC, it's only
         * necessary in J2SE because java.util.Hashtable overrides equals.
         * @param o  the reference to compare with.
         * @return true when equal.
         */
        equals(o) {
            return this == o;
        }
        /**
         * Provided to avoid Checkstyle warning.  This method is not necessary
         * for correctness (in neither JME nor JSE), it's only provided to
         * remove a Checkstyle warning.
         * Since {@link #equals} implements the most discriminating
         * equality possible, this method can have any implementation.
         * @return an int.
        */
        hashCode() {
            return SystemUtil_1.SystemUtil.identityHashCode(this);
        }
        static arrayindex(key) {
            if (typeof (key) == "number") {
                var d = key;
                var k = d;
                if (k == d) {
                    return k;
                }
            }
            return -1; // 'key' did not match some condition
        }
        static computesizes(nums /*int[] */, narray /*int[] */) {
            var t = narray[0];
            var a = 0; // number of elements smaller than 2^i
            var na = 0; // number of elements to go to array part
            var n = 0; // optimal size for array part
            var twotoi = 1; // 2^i
            for (var i = 0; twotoi / 2 < t; ++i) {
                if (nums[i] > 0) {
                    a += nums[i];
                    if (a > twotoi / 2) // more than half elements present?
                     {
                        n = twotoi; // optimal size (till now)
                        na = a; // all elements smaller than n will go to array part
                    }
                }
                if (a == t) // all elements already counted
                 {
                    break;
                }
                twotoi *= 2;
            }
            narray[0] = n;
            //# assert narray[0]/2 <= na && na <= narray[0]
            return na;
        }
        countint(key, nums /*int[] */) {
            var k = LuaTable.arrayindex(key);
            if (0 < k && k <= LuaTable.MAXASIZE) // is 'key' an appropriate array index?
             {
                ++nums[LuaTable.ceillog2(k)]; // count as such
                return 1;
            }
            return 0;
        }
        numusearray(nums /*int[] */) {
            var ause = 0; // summation of 'nums'
            var i = 1; // count to traverse all array keys
            var ttlg = 1; // 2^lg
            for (var lg = 0; lg <= LuaTable.MAXBITS; ++lg) // for each slice
             {
                var lc = 0; // counter
                var lim = ttlg;
                if (lim > this._sizeArray) {
                    lim = this._sizeArray; // adjust upper limit
                    if (i > lim) {
                        break; // no more elements to count
                    }
                }
                // count elements in range (2^(lg-1), 2^lg]
                for (; i <= lim; ++i) {
                    if (this._array[i - 1] != Lua_1.Lua.NIL) {
                        ++lc;
                    }
                }
                nums[lg] += lc;
                ause += lc;
                ttlg *= 2;
            }
            return ause;
        }
        numusehash(nums /*int[] */, pnasize /*int[] */) {
            var totaluse = 0; // total number of elements
            var ause = 0; // summation of nums
            var e;
            e = super.keys();
            while (e.hasMoreElements()) {
                var o = e.nextElement();
                ause += this.countint(o, nums);
                ++totaluse;
            }
            pnasize[0] += ause;
            return totaluse;
        }
        /**
         * @param nasize  (new) size of array part
         */
        resize(nasize) {
            if (nasize == this._sizeArray) {
                return;
            }
            var newarray = new Array(nasize); //Object[] 
            if (nasize > this._sizeArray) // array part must grow?
             {
                // The new array slots, from sizeArray to nasize-1, must
                // be filled with their values from the hash part.
                // There are two strategies:
                // Iterate over the new array slots, and look up each index in the
                // hash part to see if it has a value; or,
                // Iterate over the hash part and see if each key belongs in the
                // array part.
                // For now we choose the first algorithm.
                // :todo: consider using second algorithm, possibly dynamically.
                SystemUtil_1.SystemUtil.arraycopy(this._array, 0, newarray, 0, this._array.length);
                for (var i = this._array.length; i < nasize; ++i) {
                    var key = new Number(i + 1);
                    var v = super.remove(key);
                    if (v == null) {
                        v = Lua_1.Lua.NIL;
                    }
                    newarray[i] = v;
                }
            }
            if (nasize < this._sizeArray) // array part must shrink?
             {
                // move elements from array slots nasize to sizeArray-1 to the
                // hash part.
                for (i = nasize; i < this._sizeArray; ++i) {
                    if (this._array[i] != Lua_1.Lua.NIL) {
                        key = new Number(i + 1);
                        super.put(key, this._array[i]); //TODO:
                    }
                }
                SystemUtil_1.SystemUtil.arraycopy(this._array, 0, newarray, 0, newarray.length);
            }
            this._array = newarray;
            this._sizeArray = this._array.length;
        }
        rehash() {
            var oldinrehash = this._inrehash;
            this._inrehash = true;
            if (!oldinrehash) {
                var nasize = new Array(1); //int[] 
                var nums = new Array(LuaTable.MAXBITS + 1); //int[] 
                nasize[0] = this.numusearray(nums); // count keys in array part
                var totaluse = nasize[0];
                totaluse += this.numusehash(nums, nasize);
                var na = LuaTable.computesizes(nums, nasize);
                this.resize(nasize[0]);
            }
            super.rehash();
            this._inrehash = oldinrehash;
        }
        /**
         * Getter for metatable member.
         * @return  The metatable.
         */
        get metatable() {
            return this._metatable;
        }
        /**
         * Setter for metatable member.
         * @param metatable  The metatable.
         */
        // :todo: Support metatable's __gc and __mode keys appropriately.
        //        This involves detecting when those keys are present in the
        //        metatable, and changing all the entries in the Hashtable
        //        to be instance of java.lang.Ref as appropriate.
        setMetatable(metatable) {
            this._metatable = metatable;
            return;
        }
        /**
         * Supports Lua's length (#) operator.  More or less equivalent to
         * luaH_getn and unbound_search in ltable.c.
         */
        getn() {
            var j = this._sizeArray;
            if (j > 0 && this._array[j - 1] == Lua_1.Lua.NIL) {
                // there is a boundary in the array part: (binary) search for it
                var i2 = 0;
                while (j - i2 > 1) {
                    var m = (i2 + j) / 2;
                    if (this._array[m - 1] == Lua_1.Lua.NIL) {
                        j = m;
                    }
                    else {
                        i2 = m;
                    }
                }
                return i2;
            }
            // unbound_search
            var i = 0;
            j = 1;
            // Find 'i' and 'j' such that i is present and j is not.
            while (this.getnum(j) != Lua_1.Lua.NIL) {
                i = j;
                j *= 2;
                if (j < 0) // overflow
                 {
                    // Pathological case.  Linear search.
                    i = 1;
                    while (this.getnum(i) != Lua_1.Lua.NIL) {
                        ++i;
                    }
                    return i - 1;
                }
            }
            // binary search between i and j
            while (j - i > 1) {
                var m2 = (i + j) / 2;
                if (this.getnum(m2) == Lua_1.Lua.NIL) {
                    j = m2;
                }
                else {
                    i = m2;
                }
            }
            return i;
        }
        /**
         * Like {@link java.util.Hashtable#get}.  Ensures that indexes
         * with no value return {@link Lua#NIL}.  In order to get the correct
         * behaviour for <code>t[nil]</code>, this code assumes that Lua.NIL
         * is non-<code>null</code>.
         */
        getlua(key) {
            if (typeof (key) == "number") {
                var d = key;
                if (d <= this._sizeArray && d >= 1) {
                    var i = d;
                    if (i == d) {
                        return this._array[i - 1];
                    }
                }
            }
            var r = super._get(key); //TODO:get
            if (r == null) {
                r = Lua_1.Lua.NIL;
            }
            return r;
        }
        /**
         * Like {@link #getlua(Object)} but the result is written into
         * the <var>value</var> {@link Slot}.
         */
        __getlua(key, value) {
            if (key.r == Lua_1.Lua.NUMBER) {
                var d = key.d;
                if (d <= this._sizeArray && d >= 1) {
                    var i = d;
                    if (i == d) {
                        value.setObject(this._array[i - 1]);
                        return;
                    }
                }
            }
            var r = super._get(key.asObject()); //TODO:
            if (r == null) {
                r = Lua_1.Lua.NIL;
            }
            value.setObject(r);
        }
        /** Like get for numeric (integer) keys. */
        getnum(k) {
            if (k <= this._sizeArray && k >= 1) {
                return this._array[k - 1];
            }
            var r = super._get(new Number(k)); //TODO:get
            if (r == null) {
                return Lua_1.Lua.NIL;
            }
            return r;
        }
        /**
         * Like {@link java.util.Hashtable#put} but enables Lua's semantics
         * for <code>nil</code>;
         * In particular that <code>x = nil</nil>
         * deletes <code>x</code>.
         * And also that <code>t[nil]</code> raises an error.
         * Generally, users of Jill should be using
         * {@link Lua#setTable} instead of this.
         * @param key key.
         * @param value value.
         */
        putluaObj(L, key, value) {
            var d = 0.0;
            var i = Number.MAX_SAFE_INTEGER; //TODO:
            if (key == Lua_1.Lua.NIL) {
                L.gRunerror("table index is nil");
            }
            if (typeof (key) == "number") {
                d = key;
                var j = d;
                if (j == d && j >= 1) {
                    i = j; // will cause additional check for array part later if
                    // the array part check fails now.
                    if (i <= this._sizeArray) {
                        this._array[i - 1] = value;
                        return;
                    }
                }
                if (isNaN(d)) {
                    L.gRunerror("table index is NaN");
                }
            }
            // :todo: Consider checking key for NaN (PUC-Rio does)
            if (value == Lua_1.Lua.NIL) {
                this.remove(key);
                return;
            }
            super.put(key, value); //TODO:
            // This check is necessary because sometimes the call to super.put
            // can rehash and the new (k,v) pair should be in the array part
            // after the rehash, but is still in the hash part.
            if (i <= this._sizeArray) {
                this.remove(key);
                this._array[i - 1] = value;
            }
        }
        putluaSlot(L, key, value) {
            var i = Number.MAX_SAFE_INTEGER; //TODO:
            if (key.r == Lua_1.Lua.NUMBER) {
                var j = key.d;
                if (j == key.d && j >= 1) {
                    i = j;
                    if (i <= this._sizeArray) {
                        this._array[i - 1] = value;
                        return;
                    }
                }
                if (isNaN(key.d)) {
                    L.gRunerror("table index is NaN");
                }
            }
            var k = key.asObject();
            // :todo: consider some sort of tail merge with the other putlua
            if (value == Lua_1.Lua.NIL) {
                this.remove(k);
                return;
            }
            super.put(k, value); //TODO:
            if (i <= this._sizeArray) {
                this.remove(k);
                this._array[i - 1] = value;
            }
        }
        /**
         * Like put for numeric (integer) keys.
         */
        putnum(k, v) {
            if (k <= this._sizeArray && k >= 1) {
                this._array[k - 1] = v;
                return;
            }
            // The key can never be NIL so putlua will never notice that its L
            // argument is null.
            // :todo: optimisation to avoid putlua checking for array part again
            this.putluaObj(null, new Number(k), v);
        }
        /**
         * Do not use, implementation exists only to generate deprecated
         * warning.
         * @deprecated Use getlua instead.
         */
        _get(key) {
            throw new IllegalArgumentException_1.IllegalArgumentException();
        }
        keys() {
            return new Enum_1.Enum(this, super.keys());
        }
        /**
         * Do not use, implementation exists only to generate deprecated
         * warning.
         * @deprecated Use putlua instead.
         */
        put(key, value) {
            throw new IllegalArgumentException_1.IllegalArgumentException();
        }
        /**
         * Equivalent to luaO_log2.
         */
        static oLog2(x) {
            //# assert x >= 0
            var l = -1;
            while (x >= 256) {
                l += 8;
                x >>>= 8;
            }
            return l + LuaTable.LOG2[x];
        }
        static ceillog2(x) {
            return LuaTable.oLog2(x - 1) + 1;
        }
        //新增
        get array() {
            return this._array;
        }
        //新增
        get sizeArray() {
            return this._sizeArray;
        }
    }
    exports.LuaTable = LuaTable;
    LuaTable.MAXBITS = 26;
    LuaTable.MAXASIZE = 1 << LuaTable.MAXBITS;
    LuaTable.ZERO = new Array(0); //final Object[]
    /**
     * Used by oLog2.  DO NOT MODIFY.
     */
    LuaTable.LOG2 = [
        0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8
    ];
});

},{"../java/Hashtable":9,"../java/IllegalArgumentException":12,"../java/SystemUtil":27,"./Enum":37,"./Lua":45}],51:[function(require,module,exports){
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
    exports.LuaUserdata = void 0;
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/LuaUserdata.java#1 $
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
     * Models an arbitrary Java reference as a Lua value.
     * This class provides a facility that is equivalent to the userdata
     * facility provided by the PUC-Rio implementation.  It has two primary
     * uses: the first is when you wish to store an arbitrary Java reference
     * in a Lua table; the second is when you wish to create a new Lua type
     * by defining an opaque object with metamethods.  The former is
     * possible because a <code>LuaUserdata</code> can be stored in tables,
     * and passed to functions, just like any other Lua value.  The latter
     * is possible because each <code>LuaUserdata</code> supports a
     * metatable.
     */
    class LuaUserdata {
        /**
         * Wraps an arbitrary Java reference.  To retrieve the reference that
         * was wrapped, use {@link Lua#toUserdata}.
         * @param  o The Java reference to wrap.
         */
        constructor(o) {
            this._metatable = null;
            this._env = null;
            this._userdata = o;
        }
        /**
         * Getter for userdata.
         * @return the userdata that was passed to the constructor of this
         * instance.
         */
        get userdata() {
            return this._userdata;
        }
        /**
         * Getter for metatable.
         * @return the metatable.
         */
        get metatable() {
            return this._metatable;
        }
        /**
         * Setter for metatable.
         * @param metatable The metatable.
         */
        set metatable(metatable) {
            this._metatable = metatable;
        }
        /**
         * Getter for environment.
         * @return The environment.
         */
        get env() {
            return this._env;
        }
        /**
         * Setter for environment.
         * @param env  The environment.
         */
        set env(env) {
            this._env = env;
        }
    }
    exports.LuaUserdata = LuaUserdata;
});

},{}],52:[function(require,module,exports){
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

},{"../java/Character":5,"./Lua":45,"./Syntax":60}],53:[function(require,module,exports){
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

},{"../java/MathUtil":15,"../java/Random":21,"./Lua":45,"./LuaJavaCallback":49}],54:[function(require,module,exports){
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

},{"../java/Calendar":4,"../java/StringBuffer":26,"../java/SystemUtil":27,"../java/TimeZone":28,"./Lua":45,"./LuaJavaCallback":49}],55:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/StringBuffer", "../java/IOException", "../java/SystemUtil", "./LuaJavaCallback", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PackageLib = void 0;
    const StringBuffer_1 = require("../java/StringBuffer");
    const IOException_1 = require("../java/IOException");
    const SystemUtil_1 = require("../java/SystemUtil");
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/PackageLib.java#1 $
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
     * Contains Lua's package library.
     * The library
     * can be opened using the {@link #open} method.
     */
    class PackageLib extends LuaJavaCallback_1.LuaJavaCallback {
        constructor(which, me) {
            super();
            this._which = which;
            this._me = ((me !== undefined) ? me : null);
        }
        //private function __init(which:int, me:LuaTable):void
        //{
        //	this._which = which;
        //	this.me = me;
        //}
        /**
        * Implements all of the functions in the Lua package library.  Do not
        * call directly.
        * @param L  the Lua state in which to execute.
        * @return number of returned parameters, as per convention.
        */
        luaFunction(L) {
            switch (this._which) {
                case PackageLib.MODULE:
                    return this.module(L);
                case PackageLib.REQUIRE:
                    return this.require(L);
                case PackageLib.SEEALL:
                    return PackageLib.seeall(L);
                case PackageLib.LOADER_LUA:
                    return this.loaderLua(L);
                case PackageLib.LOADER_PRELOAD:
                    return this.loaderPreload(L);
            }
            return 0;
        }
        /**
         * Opens the library into the given Lua state.  This registers
         * the symbols of the library in the global table.
         * @param L  The Lua state into which to open.
         */
        static open(L) {
            var t = L.__register("package");
            PackageLib.g(L, t, "module", PackageLib.MODULE);
            PackageLib.g(L, t, "require", PackageLib.REQUIRE);
            PackageLib.r(L, "seeall", PackageLib.SEEALL);
            L.setField(t, "loaders", L.newTable());
            PackageLib.p(L, t, PackageLib.LOADER_PRELOAD);
            PackageLib.p(L, t, PackageLib.LOADER_LUA);
            PackageLib.setpath(L, t, "path", PackageLib.PATH_DEFAULT); // set field 'path'
            // set field 'loaded'
            L.findTable(L.getRegistry(), Lua_1.Lua.LOADED, 1);
            L.setField(t, "loaded", L.value(-1));
            L.pop(1);
            L.setField(t, "preload", L.newTable());
        }
        /** Register a function. */
        static r(L, name, which) {
            var f = new PackageLib(which);
            L.setField(L.getGlobal("package"), name, f);
        }
        /** Register a function in the global table. */
        static g(L, t, name, which) {
            var f = new PackageLib(which, t);
            L.setGlobal(name, f);
        }
        /** Register a loader in package.loaders. */
        static p(L, t, which) {
            var f = new PackageLib(which, t);
            var loaders = L.getField(t, "loaders");
            L.rawSetI(loaders, Lua_1.Lua.objLen(loaders) + 1, f);
        }
        /**
        * Implements the preload loader.  This is conventionally stored
        * first in the package.loaders table.
        */
        loaderPreload(L) {
            var name = L.checkString(1);
            var preload = L.getField(this._me, "preload");
            if (!Lua_1.Lua.isTable(preload))
                L.error("'package.preload' must be a table");
            var loader = L.getField(preload, name);
            if (Lua_1.Lua.isNil(loader)) // not found?
                L.pushString("\n\tno field package.preload['" + name + "']");
            L.pushObject(loader);
            return 1;
        }
        /**
         * Implements the lua loader.  This is conventionally stored second in
         * the package.loaders table.
         */
        loaderLua(L) {
            var name = L.checkString(1);
            var filename = this.findfile(L, name, "path");
            if (filename == null)
                return 1; // library not found in this path
            if (L.loadFile(filename) != 0)
                PackageLib.loaderror(L, filename);
            return 1; // library loaded successfully
        }
        /** Implements module. */
        module(L) {
            var modname = L.checkString(1);
            var loaded = L.getField(this._me, "loaded");
            var module = L.getField(loaded, modname);
            if (!Lua_1.Lua.isTable(module)) // not found?
             {
                // try global variable (and create one if it does not exist)
                if (L.findTable(L.getGlobals(), modname, 1) != null)
                    return L.error("name conflict for module '" + modname + "'");
                module = L.value(-1);
                L.pop(1);
                // package.loaded = new table
                L.setField(loaded, modname, module);
            }
            // check whether table already has a _NAME field
            if (Lua_1.Lua.isNil(L.getField(module, "_NAME"))) {
                PackageLib.modinit(L, module, modname);
            }
            PackageLib.setfenv(L, module);
            PackageLib.dooptions(L, module, L.getTop());
            return 0;
        }
        /** Implements require. */
        require(L) {
            var name = L.checkString(1);
            L.setTop(1);
            // PUC-Rio's use of lua_getfield(L, LUA_REGISTRYINDEX, "_LOADED");
            // (package.loaded is kept in the registry in PUC-Rio) is translated
            // into this:
            var loaded = L.getField(this._me, "loaded");
            var module = L.getField(loaded, name);
            if (L.toBoolean(module)) // is it there?
             {
                if (module == PackageLib.SENTINEL) // check loops
                    L.error("loop or previous error loading module '" + name + "'");
                L.pushObject(module);
                return 1;
            }
            // else must load it; iterate over available loaders.
            var loaders = L.getField(this._me, "loaders");
            if (!Lua_1.Lua.isTable(loaders))
                L.error("'package.loaders' must be a table");
            L.pushString(""); // error message accumulator
            for (var i = 1;; ++i) {
                var loader = Lua_1.Lua.rawGetI(loaders, i); // get a loader
                if (Lua_1.Lua.isNil(loader))
                    L.error("module '" + name + "' not found:" +
                        L.toString_(L.value(-1)));
                L.pushObject(loader);
                L.pushString(name);
                L.call(1, 1); // call it
                if (Lua_1.Lua.isFunction(L.value(-1))) // did it find module?
                    break; // module loaded successfully
                else if (Lua_1.Lua.isString(L.value(-1))) // loader returned error message?
                    L.concat(2); // accumulate it
                else
                    L.pop(1);
            }
            L.setField(loaded, name, PackageLib.SENTINEL); // package.loaded[name] = sentinel
            L.pushString(name); // pass name as argument to module
            L.call(1, 1); // run loaded module
            if (!Lua_1.Lua.isNil(L.value(-1))) // non-nil return?
             {
                // package.loaded[name] = returned value
                L.setField(loaded, name, L.value(-1));
            }
            module = L.getField(loaded, name);
            if (module == PackageLib.SENTINEL) // module did not set a value?
             {
                module = Lua_1.Lua.valueOfBoolean(true); // use true as result
                L.setField(loaded, name, module); // package.loaded[name] = true
            }
            L.pushObject(module);
            return 1;
        }
        /** Implements package.seeall. */
        static seeall(L) {
            L.checkType(1, Lua_1.Lua.TTABLE);
            var mt = L.getMetatable(L.value(1));
            if (mt == null) {
                mt = L.createTable(0, 1);
                L.setMetatable(L.value(1), mt);
            }
            L.setField(mt, "__index", L.getGlobals());
            return 0;
        }
        /**
        * Helper for module.  <var>module</var> parameter replaces PUC-Rio
        * use of passing it on the stack.
        */
        static setfenv(L, module) {
            var ar = L.getStack(1);
            L.getInfo("f", ar);
            L.setFenv(L.value(-1), module);
            L.pop(1);
        }
        /**
         * Helper for module.  <var>module</var> parameter replaces PUC-Rio
         * use of passing it on the stack.
         */
        static dooptions(L, module, n) {
            for (var i = 2; i <= n; ++i) {
                L.pushValue(i); // get option (a function)
                L.pushObject(module);
                L.call(1, 0);
            }
        }
        /**
        * Helper for module.  <var>module</var> parameter replaces PUC-Rio
        * use of passing it on the stack.
        */
        static modinit(L, module, modname) {
            L.setField(module, "_M", module); // module._M = module
            L.setField(module, "_NAME", modname);
            var dot = modname.lastIndexOf('.'); // look for last dot in module name
            // Surprisingly, ++dot works when '.' was found and when it wasn't.
            ++dot;
            // set _PACKAGE as package name (full module name minus last part)
            L.setField(module, "_PACKAGE", modname.substring(0, dot));
        }
        static loaderror(L, filename) {
            L.error("error loading module '" + L.toString_(L.value(1)) +
                "' from file '" + filename + "':\n\t" +
                L.toString_(L.value(-1)));
        }
        static readable(filename) {
            var f = SystemUtil_1.SystemUtil.getResourceAsStream(filename);
            if (f == null)
                return false;
            try {
                f.close();
            }
            catch (e_) {
                if (e_ instanceof IOException_1.IOException) {
                    console.log(e_.getStackTrace());
                }
            }
            return true;
        }
        static pushnexttemplate(L, path) {
            var i = 0;
            // skip seperators
            while (i < path.length && path.substr(i, 1) == PackageLib.PATHSEP) //TODO:
                ++i;
            if (i == path.length)
                return null; // no more templates
            var l = path.indexOf(PackageLib.PATHSEP, i);
            if (l < 0)
                l = path.length;
            L.pushString(path.substring(i, l)); // template
            return path.substring(l);
        }
        findfile(L, name, pname) {
            name = PackageLib.gsub(name, ".", PackageLib.DIRSEP);
            var path = L.toString_(L.getField(this._me, pname));
            if (path == null)
                L.error("'package." + pname + "' must be a string");
            L.pushString(""); // error accumulator
            while (true) {
                path = PackageLib.pushnexttemplate(L, path);
                if (path == null)
                    break;
                var filename = PackageLib.gsub(L.toString_(L.value(-1)), PackageLib.PATH_MARK, name);
                if (PackageLib.readable(filename)) // does file exist and is readable?
                    return filename; // return that file name
                L.pop(1); // remove path template
                L.pushString("\n\tno file '" + filename + "'");
                L.concat(2);
            }
            return null; // not found
        }
        /** Almost equivalent to luaL_gsub. */
        static gsub(s, p, r) {
            var b = new StringBuffer_1.StringBuffer();
            // instead of incrementing the char *s, we use the index i
            var i = 0;
            var l = p.length;
            while (true) {
                var wild = s.indexOf(p, i);
                if (wild < 0)
                    break;
                b.appendString(s.substring(i, wild)); // add prefix
                b.appendString(r); // add replacement in place of pattern
                i = wild + l; // continue after 'p'
            }
            b.appendString(s.substring(i));
            return b.toString();
        }
        static setpath(L, t, fieldname, def) {
            // :todo: consider implementing a user-specified path via
            // javax.microedition.midlet.MIDlet.getAppProperty or similar.
            // Currently we just use a default path defined by Jill.
            L.setField(t, fieldname, def);
        }
    }
    exports.PackageLib = PackageLib;
    // Each function in the library corresponds to an instance of
    // this class which is associated (the 'which' member) with an integer
    // which is unique within this class.  They are taken from the following
    // set.
    PackageLib.MODULE = 1;
    PackageLib.REQUIRE = 2;
    PackageLib.SEEALL = 3;
    PackageLib.LOADER_PRELOAD = 4;
    PackageLib.LOADER_LUA = 5;
    PackageLib.DIRSEP = "/";
    PackageLib.PATHSEP = ';'; //TODO:
    PackageLib.PATH_MARK = "?";
    PackageLib.PATH_DEFAULT = "?.lua;?/init.lua";
    PackageLib.SENTINEL = new Object();
});

},{"../java/IOException":11,"../java/StringBuffer":26,"../java/SystemUtil":27,"./Lua":45,"./LuaJavaCallback":49}],56:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/IllegalArgumentException", "../java/NullPointerException", "../java/SystemUtil", "./LocVar", "./Lua", "./Slot"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Proto = void 0;
    const IllegalArgumentException_1 = require("../java/IllegalArgumentException");
    const NullPointerException_1 = require("../java/NullPointerException");
    const SystemUtil_1 = require("../java/SystemUtil");
    const LocVar_1 = require("./LocVar");
    const Lua_1 = require("./Lua");
    const Slot_1 = require("./Slot");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Proto.java#1 $
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
     * Models a function prototype.  This class is internal to Jill and
     * should not be used by clients.  This is the analogue of the PUC-Rio
     * type <code>Proto</code>, hence the name.
     * A function prototype represents the constant part of a function, that
     * is, a function without closures (upvalues) and without an
     * environment.  It's a handle for a block of VM instructions and
     * ancillary constants.
     *
     * For convenience some private arrays are exposed.  Modifying these
     * arrays is punishable by death. (Java has no convenient constant
     * array datatype)
     */
    class Proto {
        //TODO:
        constructor() {
            // Generally the fields are named following the PUC-Rio implementation
            // and so are unusually terse.
            /** Array of constants. */
            this._k = null; //Slot[] 
            this._sizek = 0;
            /** Array of VM instructions. */
            this._code = null; //int[] 
            this._sizecode = 0;
            /** Array of Proto objects. */
            this._p = null; //Proto[] 
            this._sizep = 0;
            /**
             * Number of upvalues used by this prototype (and so by all the
             * functions created from this Proto).
             */
            this._nups = 0;
            /**
             * Number of formal parameters used by this prototype, and so the
             * number of argument received by a function created from this Proto.
             * In a function defined to be variadic then this is the number of
             * fixed parameters, the number appearing before '...' in the parameter
             * list.
             */
            this._numparams = 0;
            /**
             * <code>true</code> if and only if the function is variadic, that is,
             * defined with '...' in its parameter list.
             */
            this._isVararg = false;
            this._maxstacksize = 0;
            // Debug info
            /** Map from PC to line number. */
            this._lineinfo = null; //int[]
            this._sizelineinfo = 0;
            this._locvars = null; //LocVar[] 
            this._sizelocvars = 0;
            this._upvalues = null; //String[] 
            this._sizeupvalues = 0;
            this._source = null;
            this._linedefined = 0;
            this._lastlinedefined = 0;
        }
        /**
         * Proto synthesized by {@link Loader}.
         * All the arrays that are passed to the constructor are
         * referenced by the instance.  Avoid unintentional sharing.  All
         * arrays must be non-null and all int parameters must not be
         * negative.  Generally, this constructor is used by {@link Loader}
         * since that has all the relevant arrays already constructed (as
         * opposed to the compiler).
         * @param constant   array of constants.
         * @param code       array of VM instructions.
         * @param nups       number of upvalues (used by this function).
         * @param numparams  number of fixed formal parameters.
         * @param isVararg   whether '...' is used.
         * @param maxstacksize  number of stack slots required when invoking.
         * @throws NullPointerException if any array arguments are null.
         * @throws IllegalArgumentException if nups or numparams is negative.
         */
        init1(constant, //Slot[] 
        code, //int[] 
        proto, //Proto[] 
        nups, numparams, isVararg, maxstacksize) {
            if (null == constant || null == code || null == proto) {
                throw new NullPointerException_1.NullPointerException();
            }
            if (nups < 0 || numparams < 0 || maxstacksize < 0) {
                throw new IllegalArgumentException_1.IllegalArgumentException();
            }
            this._k = constant;
            this._sizek = this._k.length;
            this._code = code;
            this._sizecode = this._code.length;
            this._p = proto;
            this._sizep = proto.length;
            this._nups = nups;
            this._numparams = numparams;
            this.isVararg = isVararg;
            this._maxstacksize = maxstacksize;
        }
        /**
         * Blank Proto in preparation for compilation.
         * 废弃？
         */
        init2(source, maxstacksize) {
            this._maxstacksize = maxstacksize;
            // maxstacksize = 2;   // register 0/1 are always valid.
            // :todo: Consider removing size* members
            this._source = source;
            this._k = Proto.ZERO_CONSTANT_ARRAY;
            this._sizek = 0;
            this._code = Proto.ZERO_INT_ARRAY;
            this._sizecode = 0;
            this._p = Proto.ZERO_PROTO_ARRAY;
            this._sizep = 0;
            this._lineinfo = Proto.ZERO_INT_ARRAY;
            this._sizelineinfo = 0;
            this._locvars = Proto.ZERO_LOCVAR_ARRAY;
            this._sizelocvars = 0;
            this._upvalues = Proto.ZERO_STRING_ARRAY;
            this._sizeupvalues = 0;
        }
        /**
         * Augment with debug info.  All the arguments are referenced by the
         * instance after the method has returned, so try not to share them.
         */
        debug(lineinfoArg, //int[] 
        locvarsArg, //LocVar[] 
        upvaluesArg) {
            this._lineinfo = lineinfoArg;
            this._sizelineinfo = this._lineinfo.length;
            this._locvars = locvarsArg;
            this._sizelocvars = this._locvars.length;
            this._upvalues = upvaluesArg;
            this._sizeupvalues = this._upvalues.length;
        }
        /** Gets source. */
        get source() {
            return this._source;
        }
        /** Setter for source. */
        set source(source) {
            this._source = source;
        }
        get linedefined() {
            return this._linedefined;
        }
        set linedefined(linedefined) {
            this._linedefined = linedefined;
        }
        get lastlinedefined() {
            return this._lastlinedefined;
        }
        set lastlinedefined(lastlinedefined) {
            this._lastlinedefined = lastlinedefined;
        }
        /** Gets Number of Upvalues */
        get nups() {
            return this._nups;
        }
        set nups(nups) {
            this._nups = nups;
        }
        /** Number of Parameters. */
        get numparams() {
            return this._numparams;
        }
        set numparams(numparams) {
            this._numparams = numparams;
        }
        /** Maximum Stack Size. */
        get maxstacksize() {
            return this._maxstacksize;
        }
        /** Setter for maximum stack size. */
        set maxstacksize(m) {
            this._maxstacksize = m;
        }
        /** Instruction block (do not modify). */
        get code() {
            return this._code;
        }
        /** Append instruction. */
        codeAppend(L, pc, instruction, line) {
            if (Proto.D) {
                console.log("pc:" + pc +
                    ", instruction:" + instruction +
                    ", line:" + line +
                    ", lineinfo.length:" + this.lineinfo.length);
            }
            this.ensureCode(L, pc);
            this._code[pc] = instruction;
            if (pc >= this._lineinfo.length) {
                var newLineinfo = new Array(this._lineinfo.length * 2 + 1); //int[]
                SystemUtil_1.SystemUtil.arraycopy(this._lineinfo, 0, newLineinfo, 0, this._lineinfo.length);
                this._lineinfo = newLineinfo;
            }
            this._lineinfo[pc] = line;
        }
        ensureLocvars(L, atleast, limit) {
            if (atleast + 1 > this._sizelocvars) {
                var newsize = atleast * 2 + 1;
                if (newsize > limit)
                    newsize = limit;
                if (atleast + 1 > newsize)
                    L.gRunerror("too many local variables");
                var newlocvars = new Array(newsize); //LocVar []
                SystemUtil_1.SystemUtil.arraycopy(this.locvars, 0, newlocvars, 0, this._sizelocvars);
                for (var i = this._sizelocvars; i < newsize; i++)
                    newlocvars[i] = new LocVar_1.LocVar();
                this._locvars = newlocvars;
                this._sizelocvars = newsize;
            }
        }
        ensureProtos(L, atleast) {
            if (atleast + 1 > this._sizep) {
                var newsize = atleast * 2 + 1;
                if (newsize > Lua_1.Lua.MAXARG_Bx)
                    newsize = Lua_1.Lua.MAXARG_Bx;
                if (atleast + 1 > newsize)
                    L.gRunerror("constant table overflow");
                var newprotos = new Array(newsize); //Proto [] 
                SystemUtil_1.SystemUtil.arraycopy(this._p, 0, newprotos, 0, this._sizep);
                this._p = newprotos;
                this._sizep = newsize;
            }
        }
        ensureUpvals(L, atleast) {
            if (atleast + 1 > this._sizeupvalues) {
                var newsize = atleast * 2 + 1;
                if (atleast + 1 > newsize)
                    L.gRunerror("upvalues overflow");
                var newupvalues = new Array(newsize); //String []
                SystemUtil_1.SystemUtil.arraycopy(this._upvalues, 0, newupvalues, 0, this._sizeupvalues);
                this._upvalues = newupvalues;
                this._sizeupvalues = newsize;
            }
        }
        ensureCode(L, atleast) {
            if (atleast + 1 > this._sizecode) {
                var newsize = atleast * 2 + 1;
                if (atleast + 1 > newsize)
                    L.gRunerror("code overflow");
                var newcode = new Array(newsize); //int [] 
                SystemUtil_1.SystemUtil.arraycopy(this._code, 0, newcode, 0, this._sizecode);
                this._code = newcode;
                this._sizecode = newsize;
            }
        }
        /** Set lineinfo record. */
        setLineinfo(pc, line) {
            this._lineinfo[pc] = line;
        }
        /** Get linenumber corresponding to pc, or 0 if no info. */
        getline(pc) {
            if (this._lineinfo.length == 0) {
                return 0;
            }
            return this._lineinfo[pc];
        }
        /** Array of inner protos (do not modify). */
        get proto() {
            return this._p;
        }
        /** Constant array (do not modify). */
        get constant() {
            return this._k;
        }
        /** Append constant. */
        constantAppend(idx, o) {
            if (idx >= this._k.length) {
                var newK = new Array(this._k.length * 2 + 1); //Slot[]
                SystemUtil_1.SystemUtil.arraycopy(this._k, 0, newK, 0, this._k.length);
                this._k = newK;
            }
            this._k[idx] = new Slot_1.Slot();
            this._k[idx].init2(o);
        }
        /** Predicate for whether function uses ... in its parameter list. */
        get isVararg() {
            return this._isVararg;
        }
        /** "Setter" for isVararg.  Sets it to true. */
        set isVararg(isVararg) {
            this._isVararg = true;
        }
        /** LocVar array (do not modify). */
        get locvars() {
            return this._locvars;
        }
        // All the trim functions, below, check for the redundant case of
        // trimming to the length that they already are.  Because they are
        // initially allocated as interned zero-length arrays this also means
        // that no unnecesary zero-length array objects are allocated.
        /**
         * Trim an int array to specified size.
         * @return the trimmed array.
         */
        trimInt(old /*int[] */, n) {
            if (n == old.length) {
                return old;
            }
            var newArray = new Array(n); //int[] 
            SystemUtil_1.SystemUtil.arraycopy(old, 0, newArray, 0, n);
            return newArray;
        }
        /** Trim code array to specified size. */
        closeCode(n) {
            this._code = this.trimInt(this._code, n);
            this._sizecode = this._code.length;
        }
        /** Trim lineinfo array to specified size. */
        closeLineinfo(n) {
            this._lineinfo = this.trimInt(this._lineinfo, n);
            this._sizelineinfo = n;
        }
        /** Trim k (constant) array to specified size. */
        closeK(n) {
            if (this._k.length > n) {
                var newArray = new Array(n); //Slot[] 
                SystemUtil_1.SystemUtil.arraycopy(this._k, 0, newArray, 0, n);
                this._k = newArray;
            }
            this._sizek = n;
            return;
        }
        /** Trim p (proto) array to specified size. */
        closeP(n) {
            if (n == this._p.length) {
                return;
            }
            var newArray = new Array(n); //Proto[] 
            SystemUtil_1.SystemUtil.arraycopy(this._p, 0, newArray, 0, n);
            this._p = newArray;
            this._sizep = n;
        }
        /** Trim locvar array to specified size. */
        closeLocvars(n) {
            if (n == this.locvars.length) {
                return;
            }
            var newArray = new Array(n); //LocVar[] 
            SystemUtil_1.SystemUtil.arraycopy(this.locvars, 0, newArray, 0, n);
            this._locvars = newArray;
            this._sizelocvars = n;
        }
        /** Trim upvalues array to size <var>nups</var>. */
        closeUpvalues() {
            if (this.nups == this._upvalues.length) {
                return;
            }
            var newArray = new Array(this.nups); //String[] 
            SystemUtil_1.SystemUtil.arraycopy(this._upvalues, 0, newArray, 0, this.nups);
            this._upvalues = newArray;
            this._sizeupvalues = this.nups;
        }
        //新增
        get k() {
            return this._k;
        }
        //新增
        get sizek() {
            return this._sizek;
        }
        //新增
        get sizecode() {
            return this._sizecode;
        }
        //新增
        get p() {
            return this._p;
        }
        //新增
        get sizep() {
            return this._sizep;
        }
        //新增
        get lineinfo() {
            return this._lineinfo;
        }
        //新增
        get sizelineinfo() {
            return this._sizelineinfo;
        }
        //新增
        get sizelocvars() {
            return this._sizelocvars;
        }
        //新增
        get upvalues() {
            return this._upvalues;
        }
        //新增
        get sizeupvalues() {
            return this._sizeupvalues;
        }
    }
    exports.Proto = Proto;
    Proto.D = false;
    /** Interned 0-element array. */
    Proto.ZERO_INT_ARRAY = new Array(); /*int[] = new int[0]*/
    Proto.ZERO_LOCVAR_ARRAY = new Array(); /*LocVar[]  = new LocVar[0]*/
    Proto.ZERO_CONSTANT_ARRAY = new Array(); //final Slot[] ZERO_CONSTANT_ARRAY = new Slot[0];
    Proto.ZERO_PROTO_ARRAY = new Array(); //final Proto[] ZERO_PROTO_ARRAY = new Proto[0];
    Proto.ZERO_STRING_ARRAY = new Array(); //final String[] ZERO_STRING_ARRAY = new String[0];
});

},{"../java/IllegalArgumentException":12,"../java/NullPointerException":16,"../java/SystemUtil":27,"./LocVar":44,"./Lua":45,"./Slot":57}],57:[function(require,module,exports){
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
    exports.Slot = void 0;
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/BlockCnt.java#1 $
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
    class Slot {
        //private var _tag:Boolean = false;
        //public var tagUpVal:Boolean = false;
        constructor() {
            this._r = null;
            this._d = 0;
        }
        init1(s) {
            this._r = s._r;
            this._d = s._d;
            //testD();
        }
        //TODO:
        init2(o) {
            this.setObject(o);
        }
        asObject() {
            if (this._r == Lua_1.Lua.NUMBER) {
                return new Number(this._d);
            }
            return this._r;
        }
        setObject(o) {
            //_tag = true;
            //if (!Lua.D)
            //{
            //	if (o == null)
            //	{
            //		trace("setObject:", o.toString());
            //	}
            //}
            this._r = o;
            if (typeof (o) == 'number') {
                this._r = Lua_1.Lua.NUMBER;
                this._d = o;
                //testD();
            }
            //if (_d == 150048)
            //{
            //	trace("setObject 150048:", o.toString());
            //}
        }
        //新增
        set r(r) {
            this._r = r;
            //if (r == null)
            //{
            //	if (Lua.D)
            //	{
            //		//FIXME:如果为空值的话报错，可以用于发现问题(index no value错误）
            //		trace("Slot set r : ", r.toString());
            //	}
            //}	
        }
        //新增
        get r() {
            return this._r;
        }
        //新增
        set d(d) {
            //if (this.tagUpVal == true)
            //{
            //	trace("======this.tagUpVal == true, set d from " + this._d + "=>" + d);
            //}
            this._d = d;
            //testD();
        }
        //新增
        get d() {
            return this._d;
        }
        //调试用
        testD__() {
            /*
            if (this._d == 150048)
            {
                trace("setObject 150048:xxx r==" + this._r);
            }
            */
            //if (isNaN(this._d))
            //{
            //	trace("setObject 150048:xxxxx");
            //}
            //if (this.tagUpVal == true)
            //{
            //	trace("==============");
            //}
            //if (this.tagUpVal == true)
            //{
            //	trace("======this.tagUpVal == true, =>" + this._d);
            //}
        }
    }
    exports.Slot = Slot;
});

},{"./Lua":45}],58:[function(require,module,exports){
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

},{"../java/ByteArrayOutputStream":3,"../java/StringBuffer":26,"./FormatItem":39,"./Lua":45,"./LuaJavaCallback":49,"./LuaTable":50,"./MatchState":52}],59:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../java/Reader"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringReader = void 0;
    const Reader_1 = require("../java/Reader");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/StringReader.java#1 $
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
    /** Ersatz replacement for {@link java.io.StringReader} from JSE. */
    class StringReader extends Reader_1.Reader {
        constructor(s) {
            super();
            /** Index of the current read position.  -1 if closed. */
            this._current = 0; // = 0
            /**
             * Index of the current mark (set with {@link #mark}).
             */
            this._mark = 0; // = 0;
            this._s = s;
        }
        close() {
            this._current = -1;
        }
        mark(limit) {
            this._mark = this._current;
        }
        markSupported() {
            return true;
        }
        read() {
            if (this._current < 0) {
                throw new Error("StringReader read error");
            }
            if (this._current >= this._s.length) {
                return -1;
            }
            return this._s.charCodeAt(this._current++);
        }
        readMultiBytes(cbuf, off, len) {
            if (this._current < 0 || len < 0) {
                throw new Error();
            }
            if (this._current >= this._s.length) {
                return 0;
            }
            if (this._current + len > this._s.length) {
                len = this._s.length - this._current;
            }
            for (var i = 0; i < len; ++i) {
                cbuf[off + i] = this._s.charCodeAt(this._current + i);
            }
            this._current += len;
            return len;
        }
        reset() {
            this._current = this._mark;
        }
    }
    exports.StringReader = StringReader;
});

},{"../java/Reader":22}],60:[function(require,module,exports){
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
                                return t;
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

},{"../java/Character":5,"../java/Hashtable":9,"../java/NumberFormatException":17,"../java/StringBuffer":26,"./BlockCnt":31,"./ConsControl":33,"./Expdesc":38,"./FuncState":41,"./LHSAssign":42,"./Lua":45,"./Proto":56}],61:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./LuaJavaCallback", "../java/StringBuffer", "./Lua"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TableLib = void 0;
    const LuaJavaCallback_1 = require("./LuaJavaCallback");
    const StringBuffer_1 = require("../java/StringBuffer");
    const Lua_1 = require("./Lua");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/TableLib.java#1 $
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
     * Contains Lua's table library.
     * The library can be opened using the {@link #open} method.
     */
    class TableLib extends LuaJavaCallback_1.LuaJavaCallback {
        /** Constructs instance, filling in the 'which' member. */
        constructor(which) {
            super();
            this._which = which;
        }
        /**
         * Implements all of the functions in the Lua table library.  Do not
         * call directly.
         * @param L  the Lua state in which to execute.
         * @return number of returned parameters, as per convention.
         */
        luaFunction(L) {
            switch (this._which) {
                case TableLib.CONCAT:
                    return TableLib.concat(L);
                case TableLib.INSERT:
                    return TableLib.insert(L);
                case TableLib.MAXN:
                    return TableLib.maxn(L);
                case TableLib.REMOVE:
                    return TableLib.remove(L);
                case TableLib.SORT:
                    return TableLib.sort(L);
                //FIXME: added
                case TableLib.GETN:
                    return TableLib.getn(L);
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
            L.__register("table");
            TableLib.r(L, "concat", TableLib.CONCAT);
            TableLib.r(L, "insert", TableLib.INSERT);
            TableLib.r(L, "getn", TableLib.GETN); //FIXME: added
            TableLib.r(L, "maxn", TableLib.MAXN);
            TableLib.r(L, "remove", TableLib.REMOVE);
            TableLib.r(L, "sort", TableLib.SORT);
        }
        /** Register a function. */
        static r(L, name, which) {
            var f = new TableLib(which);
            var lib = L.getGlobal("table");
            L.setField(lib, name, f);
        }
        /** Implements table.concat. */
        static concat(L) {
            var sep = L.optString(2, "");
            L.checkType(1, Lua_1.Lua.TTABLE);
            var i = L.optInt(3, 1);
            var last = L.optInt(4, Lua_1.Lua.objLen(L.value(1)));
            var b = new StringBuffer_1.StringBuffer();
            var t = L.value(1);
            for (; i <= last; ++i) {
                var v = Lua_1.Lua.rawGetI(t, i);
                L.argCheck(Lua_1.Lua.isString(v), 1, "table contains non-strings");
                b.appendString(L.toString_(v));
                if (i != last)
                    b.appendString(L.toString_(sep));
            }
            L.pushString(b.toString());
            return 1;
        }
        /** Implements table.insert. */
        static insert(L) {
            var e = TableLib.aux_getn(L, 1) + 1; // first empty element
            var pos; // where to insert new element
            var t = L.value(1);
            switch (L.getTop()) {
                case 2: // called with only 2 arguments
                    pos = e; // insert new element at the end
                    break;
                case 3:
                    {
                        var i;
                        pos = L.checkInt(2); // 2nd argument is the position
                        if (pos > e)
                            e = pos; // grow array if necessary
                        for (i = e; i > pos; --i) // move up elements
                         {
                            // t[i] = t[i-1]
                            L.rawSetI(t, i, Lua_1.Lua.rawGetI(t, i - 1));
                        }
                    }
                    break;
                default:
                    return L.error("wrong number of arguments to 'insert'");
            }
            L.rawSetI(t, pos, L.value(-1)); // t[pos] = v
            return 0;
        }
        /** Implements table.maxn. */
        static maxn(L) {
            var max = 0;
            L.checkType(1, Lua_1.Lua.TTABLE);
            var t = L.value(1);
            var e = t.keys();
            while (e.hasMoreElements()) {
                var o = e.nextElement();
                if (Lua_1.Lua.____type(o) == Lua_1.Lua.TNUMBER) {
                    var v = L.toNumber(o);
                    if (v > max)
                        max = v;
                }
            }
            L.pushNumber(max);
            return 1;
        }
        /** Implements table.remove. */
        static remove(L) {
            var e = TableLib.aux_getn(L, 1);
            var pos = L.optInt(2, e);
            if (e == 0)
                return 0; // table is 'empty'
            var t = L.value(1);
            var o = Lua_1.Lua.rawGetI(t, pos); // result = t[pos]
            for (; pos < e; ++pos) {
                L.rawSetI(t, pos, Lua_1.Lua.rawGetI(t, pos + 1)); // t[pos] = t[pos+1]
            }
            L.rawSetI(t, e, Lua_1.Lua.NIL); // t[e] = nil
            L.pushObject(o);
            return 1;
        }
        /** Implements table.sort. */
        static sort(L) {
            var n = TableLib.aux_getn(L, 1);
            if (!L.isNoneOrNil(2)) // is there a 2nd argument?
                L.checkType(2, Lua_1.Lua.TFUNCTION);
            L.setTop(2); // make sure there is two arguments
            TableLib.auxsort(L, 1, n);
            return 0;
        }
        static auxsort(L, l, u) {
            var t = L.value(1);
            while (l < u) // for tail recursion
             {
                var i;
                var j;
                // sort elements a[l], a[l+u/2], and a[u]
                var o1 = Lua_1.Lua.rawGetI(t, l);
                var o2 = Lua_1.Lua.rawGetI(t, u);
                if (TableLib.sort_comp(L, o2, o1)) // a[u] < a[l]?
                 {
                    L.rawSetI(t, l, o2);
                    L.rawSetI(t, u, o1);
                }
                if (u - l == 1)
                    break; // only 2 elements
                i = (l + u) / 2;
                o1 = Lua_1.Lua.rawGetI(t, i);
                o2 = Lua_1.Lua.rawGetI(t, l);
                if (TableLib.sort_comp(L, o1, o2)) // a[i]<a[l]?
                 {
                    L.rawSetI(t, i, o2);
                    L.rawSetI(t, l, o1);
                }
                else {
                    o2 = Lua_1.Lua.rawGetI(t, u);
                    if (TableLib.sort_comp(L, o2, o1)) // a[u]<a[i]?
                     {
                        L.rawSetI(t, i, o2);
                        L.rawSetI(t, u, o1);
                    }
                }
                if (u - l == 2)
                    break; // only 3 elements
                var p = Lua_1.Lua.rawGetI(t, i); // Pivot
                o2 = Lua_1.Lua.rawGetI(t, u - 1);
                L.rawSetI(t, i, o2);
                L.rawSetI(t, u - 1, p);
                // a[l] <= P == a[u-1] <= a[u], only need to sort from l+1 to u-2
                i = l;
                j = u - 1;
                // NB: Pivot P is in p
                while (true) // invariant: a[l..i] <= P <= a[j..u]
                 {
                    // repeat ++i until a[i] >= P
                    while (true) {
                        o1 = Lua_1.Lua.rawGetI(t, ++i);
                        if (!TableLib.sort_comp(L, o1, p))
                            break;
                        if (i > u)
                            L.error("invalid order function for sorting");
                    }
                    // repreat --j until a[j] <= P
                    while (true) {
                        o2 = Lua_1.Lua.rawGetI(t, --j);
                        if (!TableLib.sort_comp(L, p, o2))
                            break;
                        if (j < l)
                            L.error("invalid order function for sorting");
                    }
                    if (j < i)
                        break;
                    L.rawSetI(t, i, o2);
                    L.rawSetI(t, j, o1);
                }
                o1 = Lua_1.Lua.rawGetI(t, u - 1);
                o2 = Lua_1.Lua.rawGetI(t, i);
                L.rawSetI(t, u - 1, o2);
                L.rawSetI(t, i, o1); // swap pivot (a[u-1]) with a[i]
                // a[l..i-1 <= a[i] == P <= a[i+1..u]
                // adjust so that smaller half is in [j..i] and larger one in [l..u]
                if (i - l < u - i) {
                    j = l;
                    i = i - 1;
                    l = i + 2;
                }
                else {
                    j = i + 1;
                    i = u;
                    u = j - 2;
                }
                TableLib.auxsort(L, j, i); // call recursively the smaller one
            } // repeat the routine for the larger one
        }
        static sort_comp(L, a, b) {
            if (!Lua_1.Lua.isNil(L.value(2))) // function?
             {
                L.pushValue(2);
                L.pushObject(a);
                L.pushObject(b);
                L.call(2, 1);
                var res = L.toBoolean(L.value(-1));
                L.pop(1);
                return res;
            }
            else // a < b?
             {
                return L.lessThan(a, b);
            }
        }
        static aux_getn(L, n) {
            L.checkType(n, Lua_1.Lua.TTABLE);
            var t = L.value(n);
            return t.getn();
        }
        //FIXME: added
        static getn(L) {
            L.pushNumber(TableLib.aux_getn(L, 1));
            return 1;
        }
    }
    exports.TableLib = TableLib;
    // Each function in the table library corresponds to an instance of
    // this class which is associated (the 'which' member) with an integer
    // which is unique within this class.  They are taken from the following
    // set.  
    TableLib.CONCAT = 1;
    TableLib.INSERT = 2;
    TableLib.MAXN = 3;
    TableLib.REMOVE = 4;
    TableLib.SORT = 5;
    TableLib.GETN = 6;
});

},{"../java/StringBuffer":26,"./Lua":45,"./LuaJavaCallback":49}],62:[function(require,module,exports){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Slot"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UpVal = void 0;
    const Slot_1 = require("./Slot");
    /*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/UpVal.java#1 $
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
     * Models an upvalue.  This class is internal to Jill and should not be
     * used by clients.
     * This is the analogue of the UpVal type in PUC-Rio's Lua
     * implementation, hence the name.
     * An UpVal instance is a reference to a variable.
     * When initially created generally the variable is kept on the VM
     * stack.  When the function that defines that variable returns, the
     * corresponding stack slots are destroyed.  In order that the UpVal
     * continues to reference the variable, it is closed (using the
     * <code>close</code> method).  Lua functions that reference, via an
     * upvalue, the same instance of the same variable, will share an
     * <code>UpVal</code> (somewhere in their <code>upval</code> array
     * member); hence they share updates to the variable.
     */
    class UpVal {
        /**
         * A fresh upvalue from an offset, and a slot.
         * Conceptually <var>offset</var> and <var>slot</var> convey the same
         * information, only one is necessary since the offset implies the
         * slot and vice-versa.  <var>slot</var> is used to directly reference
         * the value (this avoids an indirection to the VM stack). <var>offset</var>
         * is used when searching for UpVals in the openupval list; this
         * happens when closing UpVals (function return) or creating them
         * (execution of functon declaration).
         * @param offset  index into Lua thread's VM stack, must be a valid index.
         * @param s  Slot corresponding to offset.
         * @throws NullPointerException if L is null.
         */
        constructor(offset, s) {
            /**
             * The offset field.  Stored here, but not actually used directly by
             * this class.
             * Used (by {@link Lua}) when searching for {@link UpVal} instances.
             * An open UpVal has a valid offset field.  Its slot is shared
             * with a slot of the VM stack.
             * A closed UpVal has offset == -1.  It's slot will be a fresh copy
             * and not shared with any other.
             */
            this._offset = 0;
            this._offset = offset;
            this._s = s;
        }
        /**
         * Getter for underlying value.
         */
        get value() {
            return this._s.asObject();
        }
        /**
         * Setter for underlying value.
         */
        set value(o) {
            this._s.setObject(o);
        }
        /**
         * The offset.
         */
        get offset() {
            return this._offset;
        }
        /**
         * Closes an UpVal.  This ensures that the storage operated on by
         * {@link #getValue() getValue} and {@link #setValue(Object) setValue}
         * is not shared by any other object.
         * This is typically used when a function returns (executes
         * the <code>OP_RET</code> VM instruction).  Effectively this
         * transfers a variable binding from the stack to the heap.
         */
        close() {
            var _s2 = this._s;
            this._s = new Slot_1.Slot();
            this._s.init1(_s2);
            this._offset = -1;
        }
    }
    exports.UpVal = UpVal;
});

},{"./Slot":57}]},{},[1])