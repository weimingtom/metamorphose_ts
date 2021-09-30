import { ByteArray } from "./ByteArray";
import { InputStream } from "./InputStream";
import { Reader } from "./Reader";

/**
 *	用于读取字符流的抽象类。
 *	子类必须实现的方法只有 read(char[], int, int) 和 close()。
 *	但是，多数子类将重写此处定义的一些方法，
 *	以提供更高的效率和/或其他功能。
 */
/**
 *  InputStreamReader 是字节流通向字符流的桥梁：
 * 	它使用指定的 charset 读取字节并将其解码为字符。
 * 	它使用的字符集可以由名称指定或显式给定，
 * 	否则可能接受平台默认的字符集。
 * 	每次调用 InputStreamReader 中的一个 read() 方法都会导致从基础输入流读取一个或多个字节。
 * 	要启用从字节到字符的有效转换，可以提前从基础流读取更多的字节，
 * 	使其超过满足当前读取操作所需的字节。
 * 	为了达到最高效率，可要考虑在 BufferedReader 内包装 InputStreamReader。
 */
//见LuaInternal，创建一个带字符集（UTF8）的读出器
//i可能是DumpedInput
//charsetName可能是"UTF8"
export class InputStreamReader extends Reader 
{
    private _i:InputStream;
    private _charsetName:string;

    public constructor(i:InputStream, charsetName:string) 
    {
        super();
        this._i = i;
        this._charsetName = charsetName;
    }

    override close():void
    {
        this._i.close();		
    }

    override mark(readAheadLimit:number):void {
        this._i.mark(readAheadLimit);		
    }

    override markSupported():boolean 
    {
        return this._i.markSupported();
    }

    override read():number 
    {
        return this._i.read();
    }

    override readBytes(cbuf:ByteArray):number
    {
        return this._i.readBytes(cbuf);
    }

    //本工程未使用
    override readMultiBytes(cbuf:number[], off:number, len:number):number 
    {
        return this._i.readMultiBytes(cbuf, off, len);
    }

    //TODO:?
    override ready():boolean 
    {
        return true;
    }

    override reset():void
    {
        this._i.reset();		
    }

    // 本工程未使用
    override skip(n:number):number 
    {
        return this._i.skip(n);
    }
}
