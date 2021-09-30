// 注意：Character.toString用String.fromCharCode()代替
export class Character 
{
    public static isUpperCase(ch:number):boolean 
    {
        return ch >= 'A'.charCodeAt(0) && ch <= 'Z'.charCodeAt(0);
    }

    public static isLowerCase(ch:number):boolean 
    {
        return ch >= 'a'.charCodeAt(0) && ch <= 'z'.charCodeAt(0);
    }

    public static isDigit(ch:number):boolean 
    {
        return ch >= '0'.charCodeAt(0) && ch <= '9'.charCodeAt(0);
    }

    public static toLowerCase(ch:number):string 
    {
        return String.fromCharCode(ch).toLowerCase();
    }
}
