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
//# sourceMappingURL=OutputStream.js.map