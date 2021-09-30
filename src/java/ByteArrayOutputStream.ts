import { ByteArray } from "./ByteArray";
import { OutputStream } from "./OutputStream";

export class ByteArrayOutputStream extends OutputStream 
{
    private _bytes:ByteArray = new ByteArray();

    public constructor() 
    {
        super();
    }

    public toByteArray():ByteArray 
    {
        return this._bytes;
    }

    override close() 
    {
        this._bytes.clear();
    }
    
    override flush() 
    {
    
    }
    
    //FIXME:number[]
    override write(b:ByteArray) 
    {
        this._bytes.writeBytes(b);
    }
    
    //FIXME:number[]
    override writeBytes(b:ByteArray, off:number, len:number):void 
    {
        this._bytes.writeBytes(b, off, len);
    }

    //TODO: 这个方法有待修改
    //Writes a char to the underlying output stream as a 2-byte value, high byte first
    override writeChar(b:number):void
    {
        // var bytes:ByteArray = new ByteArray();
        // bytes.writeMultiByte(String.fromCharCode(b), "");
        // this._bytes.writeBytes(bytes);
        this._bytes.writeByte(b);
    }
}
