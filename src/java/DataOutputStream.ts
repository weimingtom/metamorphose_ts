import { ByteArray } from "./ByteArray";
import { OutputStream } from "./OutputStream";

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
export class DataOutputStream 
{
    private written:number = 0;
    private _writer?:OutputStream | null;
    
    public constructor(writer?:OutputStream | null) 
    {
        this.written = 0;
        this._writer = writer;
    }

    public flush():void 
    {
        this._writer!.flush();
    }

    //FIXME: not used
    public size():number 
    {
        return this.written;
    }

    //FIXME:number[]
    public write(b:ByteArray, off?:number, len?:number):void 
    {
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
        this._writer!.writeBytes(b, off, len);
        this.written += len;
    }

    //public write(b:int):void
    //{
    //	
    //}

    public writeBoolean(v:boolean):void 
    {
        this.throwError("DataOutputStream.writeBoolean() not implement");
        // var bytes = new ByteArray();
        // bytes.writeBoolean(v);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    public writeByte(v:number):void 
    {
        this.throwError("DataOutputStream.writeByte() not implement");
        // //???
        // //this._writer.writeChar(v);
        // var bytes = new ByteArray();
        // bytes.writeByte(v);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    public writeBytes(s:number[]):void
    {
        this.throwError("DataOutputStream.writeBytes() not implement");
        // var bytes = new ByteArray();
        // bytes.writeMultiByte(s, "");
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    //TODO: 这个方法有待修改
    public writeChar(v:number):void 
    {
        this.throwError("DataOutputStream.writeChar() not implement");
        // var bytes = new ByteArray();
        // bytes.writeMultiByte(String.fromCharCode(v), "");
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    //TODO: 这个方法有待修改
    public writeChars(s:string):void 
    {
        this.throwError("DataOutputStream.writeChars() not implement");
        // var bytes = new ByteArray();
        // bytes.writeMultiByte(s, "");
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    public writeDouble(v:number):void 
    {
        this.throwError("DataOutputStream.writeDouble() not implement");
        // var bytes = new ByteArray();
        // bytes.writeDouble(v);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    public writeFloat(v:number):void 
    {
        this.throwError("DataOutputStream.writeFloat() not implement");
        // var bytes = new ByteArray();
        // bytes.writeFloat(v);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    public writeInt(v:number):void 
    {
        this.throwError("DataOutputStream.writeInt() not implement");
        // var bytes = new ByteArray();
        // bytes.writeInt(v);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    //这里可能有问题
    public writeLong(v:number):void
    {
        this.throwError("DataOutputStream.writeLong() not implement");
        // var bytes = new ByteArray();
        // bytes.writeInt(v);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    public writeShort(v:number):void 
    {
        this.throwError("DataOutputStream.writeShort() not implement");
        // var bytes = new ByteArray();
        // bytes.writeShort(v);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }

    public writeUTF(str:string):void 
    {
        this.throwError("DataOutputStream.writeUTF() not implement");
        // var bytes = new ByteArray();
        // bytes.writeUTFBytes(str);
        // this._writer.write(bytes);
        // this.written += bytes.length;
    }


    private throwError(str:string) 
    {
        console.log(str);
        throw new Error(str);
    }
}
