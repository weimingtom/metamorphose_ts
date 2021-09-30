import { ByteArray } from "../java/ByteArray";

/**
 *	用于读取字符流的抽象类。
 *	子类必须实现的方法只有 read(char[], int, int) 和 close()。
 *	但是，多数子类将重写此处定义的一些方法，
 *	以提供更高的效率和/或其他功能。
 */
export class Reader 
{
    public close():void
	{
        this.throwError("Reader.close() not implement");
    }

    public mark(readahead:number):void
	{
        this.throwError("Reader.mark() not implement");
    }

    public markSupported():boolean
	{
        this.throwError("Reader.markSupported() not implement");
        return false;
    }

    public read():number 
    {
        this.throwError("Reader.read() not implement");
        return 0;
    }

    //FIXME: not used //FIXME:number[]
    public readBytes(cbuf:ByteArray) 
    {
        this.throwError("Reader.readBytes() not implement");
        return 0;
    }

    public readMultiBytes(cbuf:number[], off:number, len:number):number
	{
        this.throwError("Reader.readMultiBytes() not implement");
        return 0;
    }

    //FIXME: not used
    public ready():boolean 
    {
        this.throwError("Reader.ready() not implement");
        return false;
    }

    public reset():void 
    {
        this.throwError("Reader.reset() not implement");	
    }

    //FIXME:not used
    public skip(n:number):number
    {
        this.throwError("Reader.skip() not implement");
        return 0;
    }

    // 新增
    private throwError(str:string):void 
    {
        console.log(str);
        throw new Error(str);
    }
}
