import { Enumeration } from "./Enumeration";

// 注意：这个类不应该由Hashtable以外的类创建
export class HashtableEnum extends Enumeration
{
    private _arr:Array<any> | null = null;
    private _idx:number = 0;
    private _len:number = 0;

    public constructor() 
    {
        super();
        this._arr = null;
        this._idx = 0;
        this._len = 0;
    }

    override hasMoreElements():boolean 
    {
        return this._idx < this._len;
    }
    
    override nextElement():void 
    {
        return this._arr![this._idx++];
    }
    
    //注意：仅暴露给Hashtable使用的方法
    public setArr(arr:Array<any> | null):void
    {
        if (arr != null) 
        {
            this._arr = arr;
            this._idx = 0;
            this._len = this._arr.length;
        }
    }
    
}
