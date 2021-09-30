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
//# sourceMappingURL=ByteArrayOutputStream.js.map