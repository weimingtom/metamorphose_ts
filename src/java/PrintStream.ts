export class PrintStream 
{
    public static OutputArr:Array<String> | null = null;

    public constructor() 
    {
        PrintStream.init();
    }

    private static init() 
    {
        PrintStream.OutputArr = new Array();
        PrintStream.OutputArr.push("");
    }

    //TODO:
    public print(str:string | null) 
    {
        PrintStream.OutputArr![PrintStream.OutputArr!.length - 1] += str!;
        console.log(str);
    }

    //TODO:
    public println() 
    {
        PrintStream.OutputArr!.push("");
        console.log("\n");
    }
}
