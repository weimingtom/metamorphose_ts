import { ByteArray } from "./ByteArray";

/**
 * 
 * 此抽象类是表示字节输入流的所有类的超类。
 * 需要定义 InputStream 的子类的应用程序
 * 必须始终提供返回下一个输入字节的方法。
 * 
 */
export class InputStream 
{
    //FIXME: number[]->ByteArray
    public readBytes(b:ByteArray):number 
    {
        this.throwError("InputStream.readBytes() not implement");	
        return 0;
    }

    // 从输入流读取下一个数据字节。
    public read():number
	{
        this.throwError("InputStream.readChar() not implement");	
        return 0;
    }

    public reset():void
	{
        this.throwError("InputStream.reset() not implement");
    }

    public mark(readahead:number):void
	{
        this.throwError("InputStream.mark() not implement");	
    }

    public markSupported():boolean
	{
        this.throwError("InputStream.markSupported() not implement");	
		return false;
	}

    public close():void
	{
        this.throwError("InputStream.close() not implement");		
    }

    public available():number
	{
        this.throwError("InputStream.available() not implement");
        return 0;
    }

    public skip(n:number):number
	{
        this.throwError("InputStream.skip() not implement");
        return 0;
    }

    public readMultiBytes(bytes:number[], off:number, len:number):number 
    {
        this.throwError("InputStream.readBytes() not implement");	
        return 0;
    }

    private throwError(str:string) 
    {
        console.log(str);
        throw new Error(str);
    }
}
