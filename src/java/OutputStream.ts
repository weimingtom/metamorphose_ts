import { ByteArray } from "./ByteArray";

/**
 * 此抽象类是表示输出字节流的所有类的超类。
 * 输出流接受输出字节并将这些字节发送到某个接收器。
 * 需要定义 OutputStream 子类的应用程序必须始终提供
 * 至少一种可写入一个输出字节的方法。
 * 
 * 这个类不应该实例化
 * 略加修改，让所有写方法都可以返回写入字节数
 */ 
export class OutputStream 
{
    public constructor() 
    {

    }

    //FIXME: not used
    public close():void 
    {
        this.throwError("OutputStream.close() not implement");
    }
    
    //FIXME: not used
    public flush():void
    {
        this.throwError("OutputStream.flush() not implement");			
    }
    
    //FIXME: not used //FIXME:
    public write(b:ByteArray):void 
    {
        this.throwError("OutputStream.write() not implement");
    }
    
    //FIXME: not used //number[]
    public writeBytes(b:ByteArray, off:number, len:number):void 
    {
        this.throwError("OutputStream.writeBytes() not implement");
    }
    
    //FIXME: not used
    public writeChar(b:number):void 
    {
        this.throwError("OutputStream.writeChar() not implement");				
    }
    
    //FIXME: not used
    private throwError(str:string):void
    {
        console.log(str);
        throw new Error(str);
    }
}
