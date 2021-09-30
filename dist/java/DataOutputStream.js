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
//# sourceMappingURL=DataOutputStream.js.map