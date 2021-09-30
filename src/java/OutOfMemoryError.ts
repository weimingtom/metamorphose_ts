export class OutOfMemoryError extends Error 
{
    private _stackTrace?:string;

    public constructor(str?:string) 
    {
        super();
        if (str === undefined) 
        {
            str = "";
        }
        this.message = str;
        this._stackTrace = new Error(this.message).stack;
    }

    //FIXME: not used
    public getStackTrace():string | undefined 
    {
        //this._stackTrace = new Error(this.message).stack;
        return this._stackTrace;
    }
}
