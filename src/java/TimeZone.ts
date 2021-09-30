export class TimeZone 
{
    private static tz = new TimeZone();
    private static tzGMT = new TimeZone();
    
    private _id:string | null = null;

    public constructor() 
    {
        this._id = null;
    }

    //Flash自动调整夏令时
    public useDaylightTime():boolean 
    {
        return true;
    }

    //获取本地时间
    public static getDefault():TimeZone 
    {
        if (TimeZone.tz._id == null)
            TimeZone.tz._id = "default";
        return TimeZone.tz;
    }

    //获取GMT时间
    public static getTimeZone(ID:string):TimeZone 
    {
        if (ID != "GMT") 
        {
            console.log("TimeZone.getTimeZone(): not support name");
            throw new Error("TimeZone.getTimeZone(): not support name");
            //return TimeZone.tz; //FIXME:
        }
        if (TimeZone.tzGMT._id == null)
            TimeZone.tzGMT._id = "GMT";
        return TimeZone.tzGMT;
    }

    //时区字符串
    public getID():string | null 
    {
        return this._id;
    }
}
