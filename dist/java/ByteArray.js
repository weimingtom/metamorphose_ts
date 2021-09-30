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
//# sourceMappingURL=ByteArray.js.map