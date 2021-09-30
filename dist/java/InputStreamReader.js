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
//# sourceMappingURL=InputStreamReader.js.map