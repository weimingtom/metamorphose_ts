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
//# sourceMappingURL=Reader.js.map