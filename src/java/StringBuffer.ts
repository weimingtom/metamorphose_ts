export class StringBuffer 
{
    private _str:string;

    public constructor(str?:string) 
    {
        if (str === undefined) 
        {
            str = "";
        }
        this._str = str;      
    }

    //并不创建任何字符，只是预留空间
    public init(i:number):void
    {
        
    } 

    //主要用于清空长度，一般为0
    public setLength(i:number):void 
    {
        if (i == 0) 
        {
            this._str = "";
        } 
        else if(i > 0) 
        {
            this._str = this._str.substr(0, i);
        } 
        else 
        {
            throw new Error("StringBuffer.setLength() error: i < 0");
        }       
    }

    public toString():string 
    {
        return this._str;
    }

    public append(ch:number):void
    {
        this._str = this._str.concat(String.fromCharCode(ch));
    }

    public appendStringBuffer(buf:StringBuffer):void 
    {
        this._str = this._str.concat(buf._str);
    }

    public appendString(str:string | null):void
    {
        this._str = this._str.concat(str!);   
    }

    /**
     * 移除此序列的子字符串中的字符。该子字符串从指定的 start 处开始，
     * 一直到索引 end - 1 处的字符，如果不存在这种字符，则一直到序列尾部。
     * 如果 start 等于 end，则不发生任何更改。
     * 
     * delete在Java中不是关键字，但在AS3中是关键字
     */
    public _delete(start:number, end:number):StringBuffer 
    {
        //console.log("StringBuffer._delete(" + start + "," + end + ")");
        if (end > this._str.length) 
        {
            end = this._str.length; //end可能是个过大的数
        }

        if (0 <= start && start < end && end <= this._str.length) 
        {
            this._str = this._str.substring(0, start) + 
                this._str.substring(end);
            return this;
        } 
        else 
        {
            throw new Error("StringBuffer.delete() error");
        }
    }

    public insert(at:number, ch:number):void
    {
        this._str = this._str.substring(0, at) + 
            String(ch) + 
            this._str.substring(at);
    }

    public insertStringBuffer(at:number, buf:StringBuffer):void 
    {
        this._str = this._str.substring(0, at) + 
            buf._str + 
            this._str.substring(at);	
    }

    public length():number 
    {
        return this._str.length;
    }

    public charAt(index:number):number 
    {
        return this._str.charCodeAt(index);
    }

    public deleteCharAt(index:number):StringBuffer 
    {
        return this._delete(index, index + 1);
    }
}
