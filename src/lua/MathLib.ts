import { Random } from "../java/Random";
import { MathUtil } from "../java/MathUtil";
import { LuaJavaCallback } from "./LuaJavaCallback";
import { Lua } from "./Lua";
import { LuaTable } from "./LuaTable";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/MathLib.java#1 $
 * Copyright (c) 2006 Nokia Corporation and/or its subsidiary(-ies).
 * All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//see jillcode(Java Implementation of Lua Language, Jill):
//	http://code.google.com/p/jillcode/
//这里的代码移植自jillcode(Lua的Java实现，Jill):
//	http://code.google.com/p/jillcode/	

/**
 * Contains Lua's math library.
 * The library can be opened using the {@link #open} method.
 * Because this library is implemented on top of CLDC 1.1 it is not as
 * complete as the PUC-Rio math library.  Trigononmetric inverses
 * (EG <code>acos</code>) and hyperbolic trigonometric functions (EG
 * <code>cosh</code>) are not provided.
 */
export class MathLib extends LuaJavaCallback
{
	// Each function in the library corresponds to an instance of
	// this class which is associated (the 'which' member) with an integer
	// which is unique within this class.  They are taken from the following
	// set.
	
	private static ABS:number = 1;
	//private static const acos:int = 2;
	//private static const asin:int = 3;
	//private static const atan2:int = 4;
	//private static const atan:int = 5;
	private static CEIL:number = 6;
	//private static const cosh:int = 7;
	private static COS:number = 8;
	private static DEG:number = 9;
	private static EXP:number = 10;
	private static FLOOR:number = 11;
	private static FMOD:number = 12;
	//private static const frexp:int = 13;
	//private static const ldexp:int = 14;
	//private static const log:int = 15;
	private static MAX:number = 16;
	private static MIN:number = 17;
	private static MODF:number = 18;
	private static POW:number = 19;
	private static RAD:number = 20;
	private static RANDOM:number = 21;
	private static RANDOMSEED:number = 22;
	//private static const sinh:int = 23;
	private static SIN:number = 24;
	private static SQRT:number = 25;
	//private static const tanh:int = 26;
	private static TAN:number = 27;

	private static _rng:Random = new Random();

	/**
	* Which library function this object represents.  This value should
	* be one of the "enums" defined in the class.
	*/
	private _which:number;

	/** Constructs instance, filling in the 'which' member. */
	public constructor(which:number) 
	{
		super();
		this._which = which;
	}
	
	/**
	 * Implements all of the functions in the Lua math library.  Do not
	 * call directly.
	 * @param L  the Lua state in which to execute.
	 * @return number of returned parameters, as per convention.
	 */
	override luaFunction(L:Lua):number
	{
		switch (this._which)
		{
			case MathLib.ABS:
				return MathLib.abs(L);
	
			case MathLib.CEIL:
				return MathLib.ceil(L);
	
			case MathLib.COS:
				return MathLib.cos(L);
	
			case MathLib.DEG:
				return MathLib.deg(L);
	
			case MathLib.EXP:
				return MathLib.exp(L);
	
			case MathLib.FLOOR:
				return MathLib.floor(L);
	
			case MathLib.FMOD:
				return MathLib.fmod(L);
	
			case MathLib.MAX:
				return MathLib.max(L);
	
			case MathLib.MIN:
				return MathLib.min(L);
	
			case MathLib.MODF:
				return MathLib.modf(L);
	
			case MathLib.POW:
				return MathLib.pow(L);
	
			case MathLib.RAD:
				return MathLib.rad(L);
	
			case MathLib.RANDOM:
				return MathLib.random(L);
	
			case MathLib.RANDOMSEED:
				return MathLib.randomseed(L);
	
			case MathLib.SIN:
				return MathLib.sin(L);
	
			case MathLib.SQRT:
				return MathLib.sqrt(L);
			
			case MathLib.TAN:
				return MathLib.tan(L);
		}
		return 0;
	}

	/**
	 * Opens the library into the given Lua state.  This registers
	 * the symbols of the library in the global table.
	 * @param L  The Lua state into which to open.
	 */
	public static open(L:Lua):void
	{
		var t:LuaTable = L.__register("math");

		MathLib.r(L, "abs", MathLib.ABS);
		MathLib.r(L, "ceil", MathLib.CEIL);
		MathLib.r(L, "cos", MathLib.COS);
		MathLib.r(L, "deg", MathLib.DEG);
		MathLib.r(L, "exp", MathLib.EXP);
		MathLib.r(L, "floor", MathLib.FLOOR);
		MathLib.r(L, "fmod", MathLib.FMOD);
		MathLib.r(L, "max", MathLib.MAX);
		MathLib.r(L, "min", MathLib.MIN);
		MathLib.r(L, "modf", MathLib.MODF);
		MathLib.r(L, "pow", MathLib.POW);
		MathLib.r(L, "rad", MathLib.RAD);
		MathLib.r(L, "random", MathLib.RANDOM);
		MathLib.r(L, "randomseed", MathLib.RANDOMSEED);
		MathLib.r(L, "sin", MathLib.SIN);
		MathLib.r(L, "sqrt", MathLib.SQRT);
		MathLib.r(L, "tan", MathLib.TAN);
		
		L.setField(t, "pi", Lua.valueOfNumber(Math.PI));
		L.setField(t, "huge", Lua.valueOfNumber(Number.POSITIVE_INFINITY));
	}
	
	/** Register a function. */
	private static r(L:Lua, name:string, which:number):void
	{
		var f:MathLib = new MathLib(which);
		L.setField(L.getGlobal("math"), name, f);
	}

	private static abs(L:Lua):number
	{
		L.pushNumber(Math.abs(L.checkNumber(1)));
		return 1;
	}

	private static ceil(L:Lua):number
	{
		L.pushNumber(Math.ceil(L.checkNumber(1)));
		return 1;
	}

	private static cos(L:Lua):number
	{
		L.pushNumber(Math.cos(L.checkNumber(1)));
		return 1;
	}

	private static deg(L:Lua):number
	{
		L.pushNumber(MathUtil.toDegrees(L.checkNumber(1)));
		return 1;
	}

	private static exp(L:Lua):number 
	{
		// CLDC 1.1 has Math.E but no exp, pow, or log.  Bizarre.
		L.pushNumber(Lua.iNumpow(Math.E, L.checkNumber(1)));
		return 1;
	}

	private static floor(L:Lua):number
	{
		L.pushNumber(Math.floor(L.checkNumber(1)));
		return 1;
	}

	private static fmod(L:Lua):number 
	{
		L.pushNumber(L.checkNumber(1) % L.checkNumber(2));
		return 1;
	}

	private static max(L:Lua):number
	{
		var n:number = L.getTop(); // number of arguments
		var dmax:number = L.checkNumber(1);
		for (var i:number = 2; i <= n; ++i)
		{
			var d:number = L.checkNumber(i);
			dmax = Math.max(dmax, d);
		}
		L.pushNumber(dmax);
		return 1;
	}

	private static min(L:Lua):number
	{
		var n:number = L.getTop(); // number of arguments
		var dmin:number = L.checkNumber(1);
		for (var i:number=2; i<=n; ++i)
		{
			var d:number = L.checkNumber(i);
			dmin = Math.min(dmin, d);
		}
		L.pushNumber(dmin);
		return 1;
	}

	private static modf(L:Lua):number
	{
		var x:number = L.checkNumber(1);
		var fp:number = x % 1;
		var ip:number = x - fp;
		L.pushNumber(ip);
		L.pushNumber(fp);
		return 2;
	}

	private static pow(L:Lua):number
	{
		L.pushNumber(Lua.iNumpow(L.checkNumber(1), L.checkNumber(2)));
		return 1;
	}
	
	private static rad(L:Lua):number
	{
		L.pushNumber(MathUtil.toRadians(L.checkNumber(1)));
		return 1;
	}

	private static random(L:Lua):number
	{
		// It would seem better style to associate the java.util.Random
		// instance with the Lua instance (by implementing and using a
		// registry for example).  However, PUC-rio uses the ISO C library
		// and so will share the same random number generator across all Lua
		// states.  So we do too.
		switch (L.getTop()) // check number of arguments
		{
			case 0:   // no arguments
				L.pushNumber(MathLib._rng.nextDouble());
				break;
		
			case 1:   // only upper limit
				{
					var u:number = L.checkInt(1);
					L.argCheck(1 <= u, 1, "interval is empty");
					L.pushNumber(MathLib._rng.nextInt(u) + 1);
				}
				break;

			case 2:   // lower and upper limits
				{
					var l:number = L.checkInt(1);
					var u2:number = L.checkInt(2);
					L.argCheck(l <= u2, 2, "interval is empty");
					L.pushNumber(MathLib._rng.nextInt(u2) + l);
				}
				break;

			default:
				return L.error("wrong number of arguments");
		}
		return 1;
	}

	private static randomseed(L:Lua):number
	{
		MathLib._rng.setSeed(L.checkNumber(1) as number);
		return 0;
	}

	private static sin(L:Lua):number
	{
		L.pushNumber(Math.sin(L.checkNumber(1)));
		return 1;
	}
	
	private static sqrt(L:Lua):number
	{
		L.pushNumber(Math.sqrt(L.checkNumber(1)));
		return 1;
	}

	private static tan(L:Lua):number
	{
		L.pushNumber(Math.tan(L.checkNumber(1)));
		return 1;
	}	
}
