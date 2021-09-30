import { InputStream } from "./InputStream";
import { PrintStream } from "./PrintStream";

export class SystemUtil 
{
    public static out:PrintStream = new PrintStream();

    public static arraycopy(src:any, srcPos:number, dest:any, destPos:number, length:number):void
    {
        if (src != null && dest != null && src instanceof Array && dest instanceof Array) 
        {
            for (var i = destPos; i < destPos + length; i++) 
            {　
                dest[i] = src[i]; 
                //console.log("arraycopy:", i, (src as Array)[i]); 
            }
        }
    }

    public static gc():void
    {
        
    }

    public static identityHashCode(obj:Object):number 
    {
        return 0;
    }

    public static getResourceAsStream(s:string):InputStream | null 
    {
        return null;
    }

    public static currentTimeMillis():number 
    {
        return 0;
    }
}
