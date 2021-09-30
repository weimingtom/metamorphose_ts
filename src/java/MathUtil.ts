//see http://codesnipp.it/code/939
export class MathUtil 
{
    // 弧度转换为角度
    // convert radians to degrees  
    public static toDegrees(rad:number):number 
    {
        return (rad / 180 * Math.PI);
    }

    // convert degrees to radians  
    // 角度转换为弧度
    public static toRadians(deg:number):number 
    {
        return (deg * Math.PI / 180);  
    }
}
