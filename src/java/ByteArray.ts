export class ByteArray 
{
    public get length():number
    {
        this.throwError("ByteArray.length not implement");
        return 0;
    }

    public constructor() {
        //FIXME:
    }

    public clear() 
    {
        //TODO:
        this.throwError("ByteArray.clear() not implement");
    }

    //b:number[]
    public writeBytes(b:ByteArray, off?:number, len?:number):void
    {
        //TODO:
        this.throwError("ByteArray.writeBytes() not implement");
    }

    public writeByte(x:number):void 
    {
        //TODO:
        this.throwError("ByteArray.writeByte() not implement");
    }








    public setByIndex(index:number, val:any) 
    {
        this.throwError("ByteArray.setByIndex() not implement");
    }

    public writeUTFBytes(x:string):void
    {
        this.throwError("ByteArray.writeUTFBytes() not implement");
    }

    public get(x:number):number 
    {
        this.throwError("ByteArray.get() not implement");
        return 0;
    }

    public readUTFBytes(a:number):string 
    {
        this.throwError("ByteArray.readUTFBytes() not implement");
        return "";
    }

    public readByte():number 
    {
        this.throwError("ByteArray.readByte() not implement");
        return 0;
    }

    private throwError(str:string) 
    {
        console.log(str);
        throw new Error(str);
    }
}
