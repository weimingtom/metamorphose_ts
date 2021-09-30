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
//# sourceMappingURL=InputStream.js.map