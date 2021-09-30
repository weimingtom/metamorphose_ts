//FIXME:not used

TODO: add override

--------------
if (typeof(o) == 'number')

TODO 检查所有
(typeof(o) == 'Number')
instanceof Number


		if (o instanceof String || typeof(o) == 'string')
		{
			return o as string;
			->
			return o.toString() as string;
		}

		if (typeof(o) == 'number' || o instanceof Number)
		{
			this._r = Lua.NUMBER;
			this._d = o as number;
			->
			this._d = parseFloat(o.toString()) as number;
			//testD();
		}



//TODO:?????
	public equal(o1:Object, o2:Object):boolean
	{
		if (o1 instanceof Number || typeof(o1) == 'number')
		{
			return (o1 as Number)===(o2);
		}
		return this.vmEqualRef(o1, o2);
	}



as String->!.toString()
else if (((this._stack[top - 1] as Slot).r as String).length > 0)
->
else if (((this._stack[top - 1] as Slot).r!.toString()).length > 0)




		switch (s.charAt(i))
		{
			case 'c':
			case 'd': case 'i':
			case 'o': case 'u': case 'x': case 'X':
			case 'e': case 'E': case 'f': case 'g': case 'G':
			case 'q':
			case 's':
				this._type = s.charCodeAt(i);
				length
				->
				this.length = i + 1;
				return;
		}



------------

export class Lua
{		
	public static D:boolean = false; 

Lua.D == true



	public pushNumber(d:number):void
	{
		// :todo: optimise to avoid creating Double instance
		this.pushObject(/*new Number(d)*/d);
	}
-----------------

//return t as number;
return parseFloat(t.toString());


----------------------



for (var i:number = 0; i < len; ++i)
{
	cbuf[off + i] = this._s!.charCodeAt(this._current + i);
}

--------------------
ts-node src/hello.ts


String -> String

Object???any???

trace->Console.log


-----------
old bug: h->h2

					case 'p':
						{
							var h2:number = c._get(Calendar.HOUR);
							b.appendString(h2 < 12 ? "am" : "pm");
						}

u->u2
					case 'X':
						{
							var u2:String = c.getTime().toString();
							b.appendString(u2.substring(11, u2.length - 5));
						}
						break;

charCodeAt()
->
charCodeAt(0)


console.log((e_ as IOException).getStackTrace());
getStackTrace???
-> .stack

				this._width = int(s.substring(widths, i)); //TODO:
        ->
        this._width = parseInt(s.substring(widths, i)); //TODO:




bug:
	private static arrayindex(key:Object):number
	{
		if (typeof(key) == "number")
		{
			var d:number = key as number;
			var k:number = d as number;
			if (k == d)
			{
				return k;
			}
		}
		return -1;  // 'key' did not match some condition
	}


:int = d as int
				var i:number = d as number;
				if (i == d)
				{
					value.setObject(this._array[i-1]);
					return;
				}

Array.get()->elementAt()


var m:Boolean = si < this._end && MatchState.singlematch(this._src.charCodeAt(si), p, pi, ep);
->
var m:Boolean = si < this._end && MatchState.singlematch(this._src.charCodeAt(si), p, pi, ep2);








		this._capture.setSize(this._level + 1);
		this._capture.setElementAt([si, what], this._level);
->
		var temp:Array<number[]> = new Array(this._level + 1);
		for (var kk = 0; kk < temp.length; ++kk) {
			temp[kk] = this._capture[kk];
		}
		this._capture = temp;
		this._capture[this._level] = [si, what];





new int()->new Number()


as uint->as number

				var ci2:CallInfo = this.__ci();
				this._base = ci.base;
				->
				var ci2:CallInfo = this.__ci();
				this._base = ci2.base;


							for (var j_VARARG:number = 0; j_VARARG < b; ++j_VARARG)
							->
							for (var j_VARARG:number = 0; j_VARARG < b_VARARG; ++j_VARARG)

			this.callTMres(s, tm, a as Slot, b as Slot);   // call TM   //TODO:
			->
			this.__callTMres(s, tm, a, b);   // call TM   //TODO:

------------------

Microsoft Windows [版本 10.0.19042.1165]
(c) Microsoft Corporation。保留所有权利。

C:\Users\a>npm -g install typescript
C:\Users\a\AppData\Roaming\npm\tsc -> C:\Users\a\AppData\Roaming\npm\node_modules\typescript\bin\tsc
C:\Users\a\AppData\Roaming\npm\tsserver -> C:\Users\a\AppData\Roaming\npm\node_modules\typescript\bin\tsserver
+ typescript@4.4.2
added 1 package from 1 contributor in 74.857s

C:\Users\a>tsc --version
Version 4.4.2

C:\Users\a>ts --version
'ts' 不是内部或外部命令，也不是可运行的程序
或批处理文件。

C:\Users\a>npm -g install ts-node
C:\Users\a\AppData\Roaming\npm\ts-node -> C:\Users\a\AppData\Roaming\npm\node_modules\ts-node\dist\bin.js
C:\Users\a\AppData\Roaming\npm\ts-node-script -> C:\Users\a\AppData\Roaming\npm\node_modules\ts-node\dist\bin-script.js
C:\Users\a\AppData\Roaming\npm\ts-script -> C:\Users\a\AppData\Roaming\npm\node_modules\ts-node\dist\bin-script-deprecated.js
C:\Users\a\AppData\Roaming\npm\ts-node-cwd -> C:\Users\a\AppData\Roaming\npm\node_modules\ts-node\dist\bin-cwd.js
C:\Users\a\AppData\Roaming\npm\ts-node-transpile-only -> C:\Users\a\AppData\Roaming\npm\node_modules\ts-node\dist\bin-transpile.js
npm WARN ts-node@10.2.1 requires a peer of @types/node@* but none is installed. You must install peer dependencies yourself.
npm WARN ts-node@10.2.1 requires a peer of typescript@>=2.7 but none is installed. You must install peer dependencies yourself.

+ ts-node@10.2.1
added 14 packages from 45 contributors in 10.765s

C:\Users\a>

https://www.tslang.cn/docs/handbook/tsconfig-json.html
https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

https://www.cnblogs.com/JasonLong/p/14075724.html
{
    "compilerOptions": {
      "target": "ES6",
      "module": "ESNext",
      "sourceMap": false,
      "declaration": false,
      "outDir": "./dist",
      "moduleResolution": "Node",
      "esModuleInterop": true,
      "resolveJsonModule": true,
      "removeComments": false,
      "importHelpers": true,
      "strict": true,
      "lib": ["ES6", "DOM"]
    },
    "include": ["src"]
  }
  https://www.typescriptlang.org/tsconfig#module
      "module": "None",



https://www.typescriptlang.org/docs/handbook/modules.html



