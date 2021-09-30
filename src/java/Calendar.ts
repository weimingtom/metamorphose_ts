import { TimeZone } from "./TimeZone";

export class Calendar 
{
    public static SECOND:number = 1;
    public static MINUTE:number = 2;
    public static HOUR:number = 3;
    public static DAY_OF_MONTH:number = 4;
    public static MONTH:number = 5;
    public static YEAR:number = 6;
    public static DAY_OF_WEEK:number = 7;
    
    public static SUNDAY:number = 8;
    public static MONDAY:number = 9;
    public static TUESDAY:number = 10;
    public static WEDNESDAY:number = 11;
    public static THURSDAY:number = 12;
    public static FRIDAY:number = 13;
    public static SATURDAY:number = 14;
    
    public static JANUARY:number = 15;
    public static FEBRUARY:number = 16;
    public static MARCH:number = 17;
    public static APRIL:number = 18;
    public static MAY:number = 19;
    public static JUNE:number = 20;
    public static JULY:number = 21;
    public static AUGUST:number = 22;
    public static SEPTEMBER:number = 23;
    public static OCTOBER:number = 24;
    public static NOVEMBER:number = 25;
    public static DECEMBER:number = 26;
    
    private static _instance:Calendar = new Calendar();

    private _date:Date | null;

    public constructor() {
        this._date = null;
    }
    
    public _get(field:number):number 
    {
        switch(field) 
        {
        case Calendar.SECOND:
            return this._date!.getSeconds();
    
        case Calendar.MINUTE:
            return this._date!.getMinutes();
    
        case Calendar.HOUR:
            return this._date!.getHours();
    
        case Calendar.MONTH:
            return this._date!.getMonth();
    
        case Calendar.YEAR:
            return this._date!.getFullYear();
    
        case Calendar.DAY_OF_WEEK:
            console.log("DAY_OF_WEEK not implement");
            return 0;
    
        case Calendar.DAY_OF_MONTH:
            return this._date!.getDay();
        }
        console.log("Calendar._get(): field not implement");
        return 0;
    }

    public _set(field:number, value:number):void
    {
        switch (field) {
        case Calendar.SECOND:
            this._date?.setSeconds(value);
            return;
    
        case Calendar.MINUTE:
            this._date?.setMinutes(value);
            return;
    
        case Calendar.HOUR:
            this._date?.setHours(value);
            return;
    
        case Calendar.MONTH:
            this._date?.setMonth(value);
            return;
    
        case Calendar.YEAR:
            this._date?.setFullYear(value);
            return;
        }
        console.log("Calendar._set(): field not implement");
    }

    public static getInstance(tz?:TimeZone):Calendar 
    {
        return Calendar._instance;
    }

    public setTime(d:Date | null) 
    {
        this._date = d;
    }

    public getTime():Date | null
    {
        return this._date;
    }
}
