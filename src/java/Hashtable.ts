import { Enumeration } from "./Enumeration";
import { HashtableEnum } from "./HashtableEnum";

export class Hashtable 
{
    private _dic:Map<any, any>;

    public constructor(initialCapacity?:number) 
    {
        if (initialCapacity === undefined) 
        {
            initialCapacity = 11;
        }
        //Dictionary支持用Object作为键，而Array会对键进行toString的转换
        this._dic = new Map();
    }
    
    public rehash():void 
    {

    }

    public keys():Enumeration 
    {
        var enum_:HashtableEnum = new HashtableEnum();
        var arr = new Array();
        for (var key in this._dic) {
            arr.push(key);
        }
        enum_.setArr(arr);
        return enum_;
    }

    public _get(key:any):any 
    {
        //    if (typeof this._dic === 'undefined') {
        //        console.log('here');
        //    }
        return this._dic.get(key);
    }

    public put(key:any, value:any) 
    {
        //    if (typeof this._dic === 'undefined') {
        //        console.log('here');
        //    }
        var pre:any = this._dic.get(key);
        this._dic.set(key, value);
        return pre;
    }

    public remove(key:any):any 
    {
        var pre:any = null;
        if (this._dic.get(key)) {
            pre = this._dic.get(key);
            this._dic.set(key, null);
            // delete this._dic[key];
            this._dic.delete(key);
        }
        return pre;
    }
}
