export class Runtime 
{
    private static _instance = new Runtime();

    public static getRuntime():Runtime 
    {
        return Runtime._instance;
    }

    public totalMemory():number 
    {
        return 0; //FIXME:
    }

    public freeMemory():number 
    {
        console.log("Runtime.freeMemory() not implement");
        return 0;
    }
}
