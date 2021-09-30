export class Random 
{
    public nextDouble():number 
    {
        return Math.random();
    }

    public nextInt(i:number):number 
    {
        return Math.floor(Math.random() * i);
    }

    public setSeed(seed:number):void
    {
        
    }
}
