import { Character } from "../java/Character";
import { Hashtable } from "../java/Hashtable";
import { NumberFormatException } from "../java/NumberFormatException";
import { Reader } from "../java/Reader";
import { StringBuffer } from "../java/StringBuffer";
import { BlockCnt } from "./BlockCnt";
import { ConsControl } from "./ConsControl";
import { Expdesc } from "./Expdesc";
import { FuncState } from "./FuncState";
import { LHSAssign } from "./LHSAssign";
import { LocVar } from "./LocVar";
import { Lua } from "./Lua";
import { Proto } from "./Proto";

/*  $Header: //info.ravenbrook.com/project/jili/version/1.1/code/mnj/lua/Syntax.java#1 $
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
 * Syntax analyser.  Lexing, parsing, code generation.
 */
export class Syntax
{
	/** End of File, must be -1 as that is what read() returns. */
	private static EOZ:number = -1;

	private static FIRST_RESERVED:number = 257;

	// WARNING: if you change the order of this enumeration,
	// grep "ORDER RESERVED"
	private static TK_AND:number       = Syntax.FIRST_RESERVED + 0;
	private static TK_BREAK:number     = Syntax.FIRST_RESERVED + 1;
	private static TK_DO:number        = Syntax.FIRST_RESERVED + 2;
	private static TK_ELSE:number      = Syntax.FIRST_RESERVED + 3;
	private static TK_ELSEIF:number    = Syntax.FIRST_RESERVED + 4;
	private static TK_END:number       = Syntax.FIRST_RESERVED + 5;
	private static TK_FALSE:number     = Syntax.FIRST_RESERVED + 6;
	private static TK_FOR:number       = Syntax.FIRST_RESERVED + 7;
	private static TK_FUNCTION:number  = Syntax.FIRST_RESERVED + 8;
	private static TK_IF:number        = Syntax.FIRST_RESERVED + 9;
	private static TK_IN:number        = Syntax.FIRST_RESERVED + 10;
	private static TK_LOCAL:number     = Syntax.FIRST_RESERVED + 11;
	private static TK_NIL:number       = Syntax.FIRST_RESERVED + 12;
	private static TK_NOT:number       = Syntax.FIRST_RESERVED + 13;
	private static TK_OR:number        = Syntax.FIRST_RESERVED + 14;
	private static TK_REPEAT:number    = Syntax.FIRST_RESERVED + 15;
	private static TK_RETURN:number    = Syntax.FIRST_RESERVED + 16;
	private static TK_THEN:number      = Syntax.FIRST_RESERVED + 17;
	private static TK_TRUE:number      = Syntax.FIRST_RESERVED + 18;
	private static TK_UNTIL:number     = Syntax.FIRST_RESERVED + 19;
	private static TK_WHILE:number     = Syntax.FIRST_RESERVED + 20;
	private static TK_CONCAT:number    = Syntax.FIRST_RESERVED + 21;
	private static TK_DOTS:number      = Syntax.FIRST_RESERVED + 22;
	private static TK_EQ:number        = Syntax.FIRST_RESERVED + 23;
	private static TK_GE:number        = Syntax.FIRST_RESERVED + 24;
	private static TK_LE:number        = Syntax.FIRST_RESERVED + 25;
	private static TK_NE:number        = Syntax.FIRST_RESERVED + 26;
	private static TK_NUMBER:number    = Syntax.FIRST_RESERVED + 27;
	private static TK_NAME:number      = Syntax.FIRST_RESERVED + 28;
	private static TK_STRING:number    = Syntax.FIRST_RESERVED + 29;
	private static TK_EOS:number       = Syntax.FIRST_RESERVED + 30;

	private static NUM_RESERVED:number = Syntax.TK_WHILE - Syntax.FIRST_RESERVED + 1;

	/** Equivalent to luaX_tokens.  ORDER RESERVED */
	private static _tokens:string[] = //new String[]
	[
		"and", "break", "do", "else", "elseif",
		"end", "false", "for", "function", "if",
		"in", "local", "nil", "not", "or", "repeat",
		"return", "then", "true", "until", "while",
		"..", "...", "==", ">=", "<=", "~=",
		"<number>", "<name>", "<string>", "<eof>"
	];

	private static _reserved:Hashtable;
	
	//TODO:实现静态初始化
	public static init():void
	{
		if(Syntax._reserved == null)
		{
			Syntax._reserved = new Hashtable();
			
			for (var i:number = 0; i < Syntax.NUM_RESERVED; ++i)
			{
				//TODO:
				Syntax._reserved.put(Syntax._tokens[i], new Number(Syntax.FIRST_RESERVED+i));
			}
		}
	}

	// From struct LexState

	/** current character */
	private _current:number = 0;
	/** input line counter */
	private _linenumber:number = 1;
	/** line of last token 'consumed' */
	private _lastline:number = 1;
	/**
	* The token value.  For "punctuation" tokens this is the ASCII value
	* for the character for the token; for other tokens a member of the
	* enum (all of which are > 255).
	*/
	private _token:number = 0;
	/** Semantic info for token; a number. */
	private _tokenR:number = 0;
	/** Semantic info for token; a string. */
	private _tokenS:string | null = null;

	/** Lookahead token value. */
	private _lookahead:number = Syntax.TK_EOS;
	/** Semantic info for lookahead; a number. */
	private _lookaheadR:number = 0;
	/** Semantic info for lookahead; a string. */
	private _lookaheadS:string | null = null;

	/** Semantic info for return value from {@link #llex}; a number. */
	private _semR:number = 0;
	/** As {@link #semR}, for string. */
	private _semS:string | null = null;

	/** FuncState for current (innermost) function being parsed. */
	private _fs:FuncState | null = null;
	private _L:Lua;

	/** input stream */
	private _z:Reader | null;

	/** Buffer for tokens. */
	private _buff:StringBuffer = new StringBuffer();

	/** current source name */
	public _source:string | null;

	/** locale decimal point. */
	//TODO:这个变量貌似没有使用
	private _decpoint:number = '.'.charCodeAt(0);
	
	public constructor(L:Lua, z:Reader | null, source:string | null) 
	{
		Syntax.init();
		this._L = L;
		this._z = z;
		this._source = source;
		this.next();	
	}
	
	public get lastline():number
	{
		return this._lastline;
	}
	
	// From <ctype.h>

	// Implementations of functions from <ctype.h> are only correct copies
	// to the extent that Lua requires them.
	// Generally they have default access so that StringLib can see them.
	// Unlike C's these version are not locale dependent, they use the
	// ISO-Latin-1 definitions from CLDC 1.1 Character class.

	public static isalnum(c:number):boolean
	{
		var ch:number = c as number;
		return Character.isUpperCase(ch) ||
			Character.isLowerCase(ch) ||
			Character.isDigit(ch);
	}

	public static isalpha(c:number):boolean
	{
		var ch:number = c as number;
		return Character.isUpperCase(ch) ||
			Character.isLowerCase(ch);
	}

	/** True if and only if the char (when converted from the int) is a
	 * control character.
	 */
	public static iscntrl(c:number):boolean
	{
		return (c as number) < 0x20 || (c as number) == 0x7f;
	}

	public static isdigit(c:number):boolean
	{
		return Character.isDigit(c as number);
	}

	public static islower(c:number):boolean
	{
		return Character.isLowerCase(c as number);
	}

	/**
	 * A character is punctuation if not cntrl, not alnum, and not space.
	 */
	public static ispunct(c:number):boolean
	{
		return !Syntax.isalnum(c) && !Syntax.iscntrl(c) && !Syntax.isspace(c);
	}

	public static isspace(c:number):boolean
	{
		return c == ' '.charCodeAt(0) ||
				c == '\f'.charCodeAt(0) ||
				c == '\n'.charCodeAt(0) ||
				c == '\r'.charCodeAt(0) ||
				c == '\t'.charCodeAt(0);
	}

	public static isupper(c:number):boolean
	{
		return Character.isUpperCase(c as number);
	}

	public static isxdigit(c:number):boolean 
	{
		return Character.isDigit(c as number) ||
			('a'.charCodeAt(0) <= c && c <= 'f'.charCodeAt(0)) ||
			('A'.charCodeAt(0) <= c && c <= 'F'.charCodeAt(0));
	}

	// From llex.c
	
	private check_next(_set:string):boolean // throws IOException
	{
		if (_set.indexOf(String.fromCharCode(this._current)) < 0)
		{
			return false;
		}
		this.save_and_next();
		return true;
	}

	private currIsNewline():boolean 
	{
		return this._current == '\n'.charCodeAt(0) || 
			this._current == '\r'.charCodeAt(0);
	}

	private inclinenumber():void // throws IOException
	{
		var old:number = this._current;
		//# assert currIsNewline()
		this.next();     // skip '\n' or '\r'
		if (this.currIsNewline() && this._current != old)
		{
			this.next();   // skip '\n\r' or '\r\n'
		}
		if (++this._linenumber < 0)       // overflow
		{
			this.xSyntaxerror("chunk has too many lines");
		}
	}

	private skip_sep():number // throws IOException
	{
		var count:number = 0;
		var s:number = this._current;
		//# assert s == '[' || s == ']'
		this.save_and_next();
		while (this._current == '='.charCodeAt(0))
		{
			this.save_and_next();
			count++;
		}
		return (this._current == s) ? count : (-count) - 1;
	}

	private read_long_string(isString:boolean, sep:number):void // throws IOException
	{
		var cont:number = 0;
		this.save_and_next();  /* skip 2nd `[' */
		if (this.currIsNewline())  /* string starts with a newline? */
		this.inclinenumber();  /* skip it */
	loop:
		while (true)
		{
			switch (String.fromCharCode(this._current))
			{
				case String.fromCharCode(Syntax.EOZ): //TODO:
					this.xLexerror(isString ? "unfinished long string" :
						"unfinished long comment",
						Syntax.TK_EOS);
					break;  /* to avoid warnings */
		
				case ']':
					if (this.skip_sep() == sep)
					{
						this.save_and_next();  /* skip 2nd `]' */
						break loop;
					}
					break;
					
				case '\n':
				case '\r':
					this.__save('\n'.charCodeAt(0));
					this.inclinenumber();
					if (!isString)
						this._buff.setLength(0) ; /* avoid wasting space */
					break;

				default:
					if (isString) 
						this.save_and_next();
					else 
						this.next();
			}
		} /* loop */
		if (isString)
		{
			var rawtoken:string = this._buff.toString();
			var trim_by:number = 2 + sep ;
			this._semS = rawtoken.substring(trim_by, rawtoken.length - trim_by);
		}
	}

	/** Lex a token and return it.  The semantic info for the token is
	 * stored in <code>this.semR</code> or <code>this.semS</code> as
	 * appropriate.
	 */
	private llex():number // throws IOException
	{
		if (Lua.D)
		{
			console.log("llex() enter, current:" + this._current);
		}
		this._buff.setLength(0);
		while (true)
		{
			switch (String.fromCharCode(this._current))
			{
				case '\n':
				case '\r':
					if (Lua.D)
					{
						console.log("case \\n\\r");
					}
					this.inclinenumber();
					continue;
			
				case '-':
					if (Lua.D)
					{
						console.log("case -");
					}
					this.next();
					if (this._current != '-'.charCodeAt(0))
						return '-'.charCodeAt(0);
					/* else is a comment */
					this.next();
					if (this._current == '['.charCodeAt(0))
					{
						var sep2:number = this.skip_sep();
						this._buff.setLength(0) ; /* `skip_sep' may dirty the buffer */
						if (sep2 >= 0)
						{
							this.read_long_string(false, sep2);  /* long comment */
							this._buff.setLength(0) ;
							continue;
						}
					}
					/* else short comment */
					while (!this.currIsNewline() && this._current != Syntax.EOZ)
						this.next();
					continue;

				case '[':
					if (Lua.D)
					{
						console.log("case [");
					}
					var sep:number = this.skip_sep();
					if (sep >= 0)
					{
						this.read_long_string(true, sep);
						return Syntax.TK_STRING;
					}
					else if (sep == -1)
						return '['.charCodeAt(0);
					else
						this.xLexerror("invalid long string delimiter", Syntax.TK_STRING);
					continue;     // avoids Checkstyle warning.
			
				case '=':
					if (Lua.D)
					{
						console.log("case =");
					}
					this.next() ;
					if (this._current != '='.charCodeAt(0))
					{ 
						return '='.charCodeAt(0); 
					}
					else
					{
						this.next() ;
						return Syntax.TK_EQ ;
					}
				
				case '<':
					if (Lua.D)
					{
						console.log("case <");
					}
					this.next();
					if (this._current != '='.charCodeAt(0))
					{ 
						return '<'.charCodeAt(0); 
					}
					else
					{
						this.next() ;
						return Syntax.TK_LE ;
					}
				
				case '>':
					if (Lua.D)
					{
						console.log("case >");
					}
					this.next() ;
					if (this._current != '='.charCodeAt(0))
					{ 
						return '>'.charCodeAt(0); 
					}
					else
					{
						this.next() ;
						return Syntax.TK_GE ;
					}
				
				case '~':
					if (Lua.D)
					{
						console.log("case ~");
					}
					this.next();
					if (this._current != '='.charCodeAt(0))
					{ 
						return '~'.charCodeAt(0); 
					}
					else
					{
						this.next();
						return Syntax.TK_NE;
					}
				
				case '"':
				case '\'':
					if (Lua.D)
					{
						console.log("case \"'");
					}
					this.read_string(this._current);
					return Syntax.TK_STRING;
			
				case '.':
					if (Lua.D)
					{
						console.log("case .");
					}
					this.save_and_next();
					if (this.check_next("."))
					{
						if (this.check_next("."))
						{
							return Syntax.TK_DOTS;
						}
						else
						{
							return Syntax.TK_CONCAT ;
						}
					}
					else if (!Syntax.isdigit(this._current))
					{
						return '.'.charCodeAt(0);
					}
					else
					{
						this.read_numeral();
						return Syntax.TK_NUMBER;
					}
				
				case String.fromCharCode(Syntax.EOZ): //TODO:
					if (Lua.D)
					{
						console.log("case EOZ");
					}
					return Syntax.TK_EOS;
				
				default:
					if (Syntax.isspace(this._current))
					{
						if (Lua.D)
						{
							console.log("isspace");
						}
						// assert !currIsNewline();
						this.next();
						continue;
					}
					else if (Syntax.isdigit(this._current))
					{
						if (Lua.D)
						{
							console.log("isdigit");
						}
						this.read_numeral();
						return Syntax.TK_NUMBER;
					}
					else if (Syntax.isalpha(this._current) || this._current == '_'.charCodeAt(0))
					{
						if (Lua.D)
						{
							console.log("isalpha or _");
						}
						// identifier or reserved word
						do
						{
							this.save_and_next();
						} while (Syntax.isalnum(this._current) || this._current == '_'.charCodeAt(0));
						var s:string = this._buff.toString();
						var t:Object = Syntax._reserved._get(s); //TODO:
						if (t == null)
						{
							this._semS = s;
							return Syntax.TK_NAME;
						}
						else
						{
							//return t as number;
							return parseFloat(t.toString());
						}
					}
					else
					{
						var c:number = this._current;
						this.next();
						return c; // single-char tokens
					}
			}
		}
		//unreachable
		return 0;
	}

	private next():void //throws IOException
	{
		this._current = this._z!.read();
		if (Lua.D) 
		{
			console.log("Syntax.next(), current:" + this._current + "(" + String.fromCharCode(this._current) +")");
		}
	}

	/** Reads number.  Writes to semR. */
	private read_numeral():void // throws IOException
	{
		// assert isdigit(current);
		do
		{
			this.save_and_next();
		} while (Syntax.isdigit(this._current) || this._current == '.'.charCodeAt(0));
		if (this.check_next("Ee"))       // 'E' ?
		{
			this.check_next("+-"); // optional exponent sign
		}
		while (Syntax.isalnum(this._current) || this._current == '_'.charCodeAt(0))
		{
			this.save_and_next();
		}
		// :todo: consider doing PUC-Rio's decimal point tricks.
		try
		{
			this._semR = Number(this._buff.toString());
			return;
		}
		catch (e)
		{
			if (e instanceof NumberFormatException) {
				console.log((e as NumberFormatException).stack);
			}
			this.xLexerror("malformed number", Syntax.TK_NUMBER);
		}
	}

	/** Reads string.  Writes to semS. */
	private read_string(del:number):void // throws IOException
	{
		this.save_and_next();
		while (this._current != del)
		{
			switch (String.fromCharCode(this._current))
			{
				case String.fromCharCode(Syntax.EOZ): //TODO:
					this.xLexerror("unfinished string", Syntax.TK_EOS);
					continue;     // avoid compiler warning
					
				case '\n':
				case '\r':
					this.xLexerror("unfinished string", Syntax.TK_STRING);
					continue;     // avoid compiler warning
				
				case '\\':
					{
						var c:number;
						this.next();       // do not save the '\'
						switch (String.fromCharCode(this._current))
						{
							case 'a': 
								c = 7; 
								break;     // no '\a' in Java.
					
							case 'b': 
								c = '\b'.charCodeAt(0); 
								break;
					
							case 'f': 
								c = '\f'.charCodeAt(0); 
								break;
					
							case 'n': 
								c = '\n'.charCodeAt(0); 
								break;
					
							case 'r': 
								c = '\r'.charCodeAt(0); 
								break;
					
							case 't': 
								c = '\t'.charCodeAt(0); 
								break;
					
							case 'v': 
								c = 11; 
								break;    // no '\v' in Java.
					
							case '\n': case '\r':
								this.__save('\n'.charCodeAt(0));
								this.inclinenumber();
								continue;
					
							case String.fromCharCode(Syntax.EOZ):
								continue; // will raise an error next loop
					
							default:
								if (!Syntax.isdigit(this._current))
								{
									this.save_and_next();        // handles \\, \", \', \?
								}
								else    // \xxx
								{
									var i:number = 0;
									c = 0;
									do
									{
										c = 10*c + (this._current - '0'.charCodeAt(0));
										this.next();
									} while (++i<3 && Syntax.isdigit(this._current));
									// In unicode, there are no bounds on a 3-digit decimal.
									this.__save(c);
								}
								continue;
						}
						this.__save(c);
						this.next();
						continue;
					}
				
				default:
					this.save_and_next();
			}
		}
		this.save_and_next();    // skip delimiter
		var rawtoken:string = this._buff.toString() ;
		this._semS = rawtoken.substring(1, rawtoken.length - 1) ;
	}

	private save():void
	{
		this._buff.append(this._current as number);
	}

	private __save(c:number):void
	{
		this._buff.append(c as number);
	}

	private save_and_next():void  // throws IOException
	{
		this.save();
		this.next();
	}

	/** Getter for source. */
	public get source():string | null
	{
		return this._source;
	}

	private txtToken(tok:number):string
	{
		switch (tok)
		{
			case Syntax.TK_NAME:
			case Syntax.TK_STRING:
			case Syntax.TK_NUMBER:
				return this._buff.toString();
			
			default:
				return Syntax.xToken2str(tok);
		}
	}

	/** Equivalent to <code>luaX_lexerror</code>. */
	private xLexerror(msg:string, tok:number):void
	{
		msg = this.source + ":" + this._linenumber + ": " + msg;
		if (tok != 0)
		{
			msg = msg + " near '" + this.txtToken(tok) + "'";
		}
		this._L.pushString(msg);
		this._L.dThrow(Lua.ERRSYNTAX);
	}

	/** Equivalent to <code>luaX_next</code>. */
	private xNext():void // throws IOException
	{
		this._lastline = this._linenumber;
		if (this._lookahead != Syntax.TK_EOS)      // is there a look-ahead token?
		{
			this._token = this._lookahead;        // Use this one,
			this._tokenR = this._lookaheadR;
			this._tokenS = this._lookaheadS;
			this._lookahead = Syntax.TK_EOS;       // and discharge it.
		}
		else
		{
			this._token = this.llex();
			this._tokenR = this._semR;
			this._tokenS = this._semS;
		}
	}

	/** Equivalent to <code>luaX_syntaxerror</code>. */
	public xSyntaxerror(msg:string):void
	{
		this.xLexerror(msg, this._token);
	}

	private static xToken2str(token:number):string
	{
		if (token < Syntax.FIRST_RESERVED)
		{
			// assert token == (char)token;
			if (Syntax.iscntrl(token))
			{
				return "char(" + token + ")";
			}
			return String.fromCharCode(token as number);
		}
		return Syntax._tokens[token - Syntax.FIRST_RESERVED];
	}

	// From lparser.c

	private static block_follow(token:number):boolean
	{
		switch (token)
		{
			case Syntax.TK_ELSE: case Syntax.TK_ELSEIF: case Syntax.TK_END:
			case Syntax.TK_UNTIL: case Syntax.TK_EOS:
				return true;
			
			default:
				return false;
		}
	}

	private check(c:number):void
	{
		if (this._token != c)
		{
			this.error_expected(c);
		}
	}

	/**
	 * @param what   the token that is intended to end the match.
	 * @param who    the token that begins the match.
	 * @param where  the line number of <var>what</var>.
	 */
	private check_match(what:number, who:number, where:number):void
		//throws IOException
	{
		if (!this.testnext(what))
		{
			if (where == this._linenumber)
			{
				this.error_expected(what);
			}
			else
			{
				this.xSyntaxerror("'" + Syntax.xToken2str(what) + "' expected (to close '" +
					Syntax.xToken2str(who) + "' at line " + where + ")");
			}
		}
	}

	private close_func():void
	{
		this.removevars(0);
		this._fs!.kRet(0, 0);  // final return;
		this._fs!.close();
		// :todo: check this is a valid assertion to make
		//# assert fs != fs.prev
		this._fs = this._fs!.prev;
	}
	
	public static opcode_name(op:number):string
	{
		switch (op)
		{
			case Lua.OP_MOVE: 
				return "MOVE";
		
			case Lua.OP_LOADK: 
				return "LOADK";
		
			case Lua.OP_LOADBOOL: 
				return "LOADBOOL";
		
			case Lua.OP_LOADNIL: 
				return "LOADNIL";
		
			case Lua.OP_GETUPVAL: 
				return "GETUPVAL";
		
			case Lua.OP_GETGLOBAL: 
				return "GETGLOBAL";
		
			case Lua.OP_GETTABLE: 
				return "GETTABLE";
		
			case Lua.OP_SETGLOBAL: 
				return "SETGLOBAL";
		
			case Lua.OP_SETUPVAL: 
				return "SETUPVAL";
		
			case Lua.OP_SETTABLE: 
				return "SETTABLE";
		
			case Lua.OP_NEWTABLE: 
				return "NEWTABLE";
		
			case Lua.OP_SELF: 
				return "SELF";
		
			case Lua.OP_ADD: 
				return "ADD";
		
			case Lua.OP_SUB: 
				return "SUB";
		
			case Lua.OP_MUL: 
				return "MUL";
		
			case Lua.OP_DIV: 
				return "DIV";
		
			case Lua.OP_MOD: 
				return "MOD";
		
			case Lua.OP_POW: 
				return "POW";
		
			case Lua.OP_UNM: 
				return "UNM";
		
			case Lua.OP_NOT: 
				return "NOT";
		
			case Lua.OP_LEN: 
				return "LEN";
		
			case Lua.OP_CONCAT: 
				return "CONCAT";
		
			case Lua.OP_JMP: 
				return "JMP";
		
			case Lua.OP_EQ: 
				return "EQ";
		
			case Lua.OP_LT: 
				return "LT";
		
			case Lua.OP_LE: 
				return "LE";
		
			case Lua.OP_TEST: 
				return "TEST";
		
			case Lua.OP_TESTSET: 
				return "TESTSET";
		
			case Lua.OP_CALL: 
				return "CALL";
		
			case Lua.OP_TAILCALL: 
				return "TAILCALL";
		
			case Lua.OP_RETURN: 
				return "RETURN";
		
			case Lua.OP_FORLOOP: 
				return "FORLOOP";
		
			case Lua.OP_FORPREP: 
				return "FORPREP";
		
			case Lua.OP_TFORLOOP: 
				return "TFORLOOP";
		
			case Lua.OP_SETLIST: 
				return "SETLIST";
		
			case Lua.OP_CLOSE: 
				return "CLOSE";
		
			case Lua.OP_CLOSURE: 
				return "CLOSURE";
		
			case Lua.OP_VARARG: 
				return "VARARG";
		
			default: 
				return "??"+op;
		}
	}

	private codestring(e:Expdesc, s:string | null):void
	{
		e.init(Expdesc.VK, this._fs!.kStringK(s));
	}

	private checkname(e:Expdesc):void // throws IOException
	{
		this.codestring(e, this.str_checkname());
	}

	private enterlevel():void
	{
		this._L.nCcalls++;
	}

	private error_expected(tok:number):void
	{
		this.xSyntaxerror("'" + Syntax.xToken2str(tok) + "' expected");
	}

	private leavelevel():void
	{
		this._L.nCcalls--;
	}


	/** Equivalent to luaY_parser. */
	public static parser(L:Lua, _in:Reader | null, name:string | null):Proto
		//throws IOException
	{
		var ls:Syntax = new Syntax(L, _in, name);
		var fs:FuncState = new FuncState(ls);
		ls.open_func(fs);
		fs.f.isVararg = true;
		ls.xNext();
		ls.chunk();
		ls.check(Syntax.TK_EOS);
		ls.close_func();
		//# assert fs.prev == null
		//# assert fs.f.nups == 0
		//# assert ls.fs == null
		return fs.f;
	}

	private removevars(tolevel:number):void
	{
		// :todo: consider making a method in FuncState.
		while (this._fs!.nactvar > tolevel)
		{
			this._fs!.getlocvar(--this._fs!.nactvar).endpc = this._fs!.pc;
		}
	}

	private singlevar(_var:Expdesc):void // throws IOException
	{
		var varname:string | null = this.str_checkname();
		if (this.singlevaraux(this._fs, varname, _var, true) == Expdesc.VGLOBAL)
		{
			_var.info = this._fs!.kStringK(varname);
		}
	}

	private singlevaraux(f:FuncState | null,
		n:string | null,
		_var:Expdesc,
		base:boolean):number
	{
		if (f == null)      // no more levels?
		{
			_var.init(Expdesc.VGLOBAL, Lua.NO_REG);    // default is global variable
			return Expdesc.VGLOBAL;
		}
		else
		{
			var v:number = f.searchvar(n);
			if (v >= 0)
			{
				_var.init(Expdesc.VLOCAL, v);
				if (!base)
				{
					f.markupval(v);       // local will be used as an upval
				}
				return Expdesc.VLOCAL;
			}
			else    // not found at current level; try upper one
			{
				if (this.singlevaraux(f.prev, n, _var, false) == Expdesc.VGLOBAL)
				{
					return Expdesc.VGLOBAL;
				}
				_var.upval(this.indexupvalue(f, n, _var));     // else was LOCAL or UPVAL
				return Expdesc.VUPVAL;
			}
		}
	}

	private str_checkname():string | null // throws IOException
	{
		this.check(Syntax.TK_NAME);
		var s:string | null = this._tokenS;
		this.xNext();
		return s;
	}

	private testnext(c:number):boolean // throws IOException
	{
		if (this._token == c)
		{
			this.xNext();
			return true;
		}
		return false;
	}


	// GRAMMAR RULES

	private chunk():void // throws IOException
	{
		// chunk -> { stat [';'] }
		var islast:boolean = false;
		this.enterlevel();
		while (!islast && !Syntax.block_follow(this._token))
		{
			islast = this.statement();
			this.testnext(';'.charCodeAt(0));
			//# assert fs.f.maxstacksize >= fs.freereg && fs.freereg >= fs.nactvar
			this._fs!.freereg = this._fs!.nactvar;
		}
		this.leavelevel();
	}

	private constructor_(t:Expdesc):void // throws IOException
	{
		// constructor -> ??
		var line:number = this._linenumber;
		var pc:number = this._fs!.kCodeABC(Lua.OP_NEWTABLE, 0, 0, 0);
		var cc:ConsControl = new ConsControl(t) ;
		t.init(Expdesc.VRELOCABLE, pc);
		cc.v.init(Expdesc.VVOID, 0);        /* no value (yet) */
		this._fs!.kExp2nextreg(t);  /* fix it at stack top (for gc) */
		this.checknext('{'.charCodeAt(0));
		do
		{
			//# assert cc.v.k == Expdesc.VVOID || cc.tostore > 0
			if (this._token == '}'.charCodeAt(0))
				break;
			this.closelistfield(cc);
			switch(String.fromCharCode(this._token))
			{
				case String.fromCharCode(Syntax.TK_NAME):  /* may be listfields or recfields */
					this.xLookahead();
					if (this._lookahead != '='.charCodeAt(0))  /* expression? */
						this.listfield(cc);
					else
						this.recfield(cc);
					break;

				case '[':  /* constructor_item -> recfield */
					this.recfield(cc);
					break;

				default:  /* constructor_part -> listfield */
					this.listfield(cc);
					break;
			}
		} while (this.testnext(','.charCodeAt(0)) || this.testnext(';'.charCodeAt(0)));
		this.check_match('}'.charCodeAt(0), '{'.charCodeAt(0), line);
		this.lastlistfield(cc);
		var code:number[] | null = this._fs!.f.code; //int [] 
		code![pc] = Lua.SETARG_B(code![pc], Syntax.oInt2fb(cc.na)); /* set initial array size */
		code![pc] = Lua.SETARG_C(code![pc], Syntax.oInt2fb(cc.nh)); /* set initial table size */
	}

	private static oInt2fb(x:number):number
	{
		var e:number = 0;  /* exponent */
		while (x < 0 || x >= 16)
		{
			x = (x+1) >>> 1;
			e++;
		}
		return (x < 8) ? x : (((e+1) << 3) | (x - 8));
	}

	private recfield(cc:ConsControl):void  //throws IOException
	{
		/* recfield -> (NAME | `['exp1`]') = exp1 */
		var reg:number = this._fs!.freereg;
		var key:Expdesc = new Expdesc();
		var val:Expdesc = new Expdesc();
		if (this._token == Syntax.TK_NAME)
		{
			// yChecklimit(fs, cc.nh, MAX_INT, "items in a constructor");
			this.checkname(key);
		}
		else  /* token == '[' */
			this.yindex(key);
		cc.nh++;
		this.checknext('='.charCodeAt(0));
		this._fs!.kExp2RK(key);
		this.expr(val);
		this._fs!.kCodeABC(Lua.OP_SETTABLE, cc.t.info, this._fs!.kExp2RK(key), this._fs!.kExp2RK(val));
		this._fs!.freereg = reg;  /* free registers */
	}

	private lastlistfield(cc:ConsControl):void
	{
		if (cc.tostore == 0)
			return;
		if (Syntax.hasmultret(cc.v.k))
		{
			this._fs!.kSetmultret(cc.v);
			this._fs!.kSetlist(cc.t.info, cc.na, Lua.MULTRET);
			cc.na--;  /* do not count last expression (unknown number of elements) */
		}
		else
		{
			if (cc.v.k != Expdesc.VVOID)
				this._fs!.kExp2nextreg(cc.v);
			this._fs!.kSetlist(cc.t.info, cc.na, cc.tostore);
		}
	}

	private closelistfield(cc:ConsControl):void
	{
		if (cc.v.k == Expdesc.VVOID)
			return;  /* there is no list item */
		this._fs!.kExp2nextreg(cc.v);
		cc.v.k = Expdesc.VVOID;
		if (cc.tostore == Lua.LFIELDS_PER_FLUSH)
		{
			this._fs!.kSetlist(cc.t.info, cc.na, cc.tostore);  /* flush */
			cc.tostore = 0;  /* no more items pending */
		}
	}

	private expr(v:Expdesc):void // throws IOException
	{
		this.subexpr(v, 0);
	}

	/** @return number of expressions in expression list. */
	private explist1(v:Expdesc):number // throws IOException
	{
		// explist1 -> expr { ',' expr }
		var n:number = 1;  // at least one expression
		this.expr(v);
		while (this.testnext(','.charCodeAt(0)))
		{
			this._fs!.kExp2nextreg(v);
			this.expr(v);
			++n;
		}
		return n;
	}

	private exprstat():void // throws IOException
	{
		// stat -> func | assignment
		var v:LHSAssign = new LHSAssign() ;
		this.primaryexp(v.v);
		if (v.v.k == Expdesc.VCALL)      // stat -> func
		{
			this._fs!.setargc(v.v, 1); // call statement uses no results
		}
		else      // stat -> assignment
		{
			v.prev = null;
			this.assignment(v, 1);
		}
	}

	/*
	** check whether, in an assignment to a local variable, the local variable
	** is needed in a previous assignment (to a table). If so, save original
	** local value in a safe place and use this safe copy in the previous
	** assignment.
	*/
	private check_conflict(lh:LHSAssign | null, v:Expdesc):void
	{
		var extra:number = this._fs!.freereg;  /* eventual position to save local variable */
		var conflict:boolean = false ;
		for (; lh != null; lh = lh.prev)
		{
			if (lh.v.k == Expdesc.VINDEXED)
			{
				if (lh.v.info == v.info)    /* conflict? */
				{
					conflict = true;
					lh.v.info = extra;  /* previous assignment will use safe copy */
				}
				if (lh.v.aux == v.info)    /* conflict? */
				{
					conflict = true;
					lh.v.aux = extra;  /* previous assignment will use safe copy */
				}
			}
		}
		if (conflict)
		{
			this._fs!.kCodeABC(Lua.OP_MOVE, this._fs!.freereg, v.info, 0);  /* make copy */
			this._fs!.kReserveregs(1);
		}
	}

	private assignment(lh:LHSAssign, nvars:number):void // throws IOException
	{
		var e:Expdesc = new Expdesc() ;
		var kind:number = lh.v.k ;
		if (!(Expdesc.VLOCAL <= kind && kind <= Expdesc.VINDEXED))
			this.xSyntaxerror("syntax error");
		if (this.testnext(','.charCodeAt(0)))    /* assignment -> `,' primaryexp assignment */
		{
			var nv:LHSAssign = new LHSAssign();
			nv.init(lh); //TODO:
			this.primaryexp(nv.v);
			if (nv.v.k == Expdesc.VLOCAL)
				this.check_conflict(lh, nv.v);
			this.assignment(nv, nvars+1);
		}
		else    /* assignment -> `=' explist1 */
		{
			var nexps:number;
			this.checknext('='.charCodeAt(0));
			nexps = this.explist1(e);
			if (nexps != nvars)
			{
				this.adjust_assign(nvars, nexps, e);
				if (nexps > nvars)
					this._fs!.freereg -= nexps - nvars;  /* remove extra values */
			}
			else
			{
				this._fs!.kSetoneret(e);  /* close last expression */
				this._fs!.kStorevar(lh.v, e);
				return;  /* avoid default */
			}
		}
		e.init(Expdesc.VNONRELOC, this._fs!.freereg - 1);    /* default assignment */
		this._fs!.kStorevar(lh.v, e);
	}


	private funcargs(f:Expdesc):void // throws IOException
	{
		var args:Expdesc = new Expdesc();
		var line:number = this._linenumber;
		switch (String.fromCharCode(this._token))
		{
			case '(':         // funcargs -> '(' [ explist1 ] ')'
				if (line != this.lastline)
				{
					this.xSyntaxerror("ambiguous syntax (function call x new statement)");
				}
				this.xNext();
				if (this._token == ')'.charCodeAt(0))       // arg list is empty?
				{
					args.kind = Expdesc.VVOID;
				}
				else
				{
					this.explist1(args);
					this._fs!.kSetmultret(args);
				}
				this.check_match(')'.charCodeAt(0), '('.charCodeAt(0), line);
				break;

			case '{':         // funcargs -> constructor
				this.constructor_(args);
				break;

			case String.fromCharCode(Syntax.TK_STRING):   // funcargs -> STRING
				this.codestring(args, this._tokenS);
				this.xNext();        // must use tokenS before 'next'
				break;

			default:
				this.xSyntaxerror("function arguments expected");
				return;
		}
		// assert (f.kind() == VNONRELOC);
		var nparams:number;
		var base:number = f.info;        // base register for call
		if (args.hasmultret())
		{
			nparams = Lua.MULTRET;     // open call
		}
		else
		{
			if (args.kind != Expdesc.VVOID)
			{
				this._fs!.kExp2nextreg(args);  // close last argument
			}
			nparams = this._fs!.freereg - (base+1);
		}
		f.init(Expdesc.VCALL, this._fs!.kCodeABC(Lua.OP_CALL, base, nparams+1, 2));
		this._fs!.kFixline(line);
		this._fs!.freereg = base+1;        // call removes functions and arguments
					// and leaves (unless changed) one result.
	}

	private prefixexp(v:Expdesc):void // throws IOException
	{
		// prefixexp -> NAME | '(' expr ')'
		switch (String.fromCharCode(this._token))
		{
			case '(':
				{
					var line:number = this._linenumber;
					this.xNext();
					this.expr(v);
					this.check_match(')'.charCodeAt(0), '('.charCodeAt(0), line);
					this._fs!.kDischargevars(v);
					return;
				}
			
			case String.fromCharCode(Syntax.TK_NAME):
				this.singlevar(v);
				return;
			
			default:
				this.xSyntaxerror("unexpected symbol");
				return;
		}
	}

	private primaryexp(v:Expdesc):void // throws IOException
	{
		// primaryexp ->
		//    prefixexp { '.' NAME | '[' exp ']' | ':' NAME funcargs | funcargs }
		this.prefixexp(v);
		while (true)
		{
			switch (String.fromCharCode(this._token))
			{
				case '.':  /* field */
					this.field(v);
					break;

				case '[':  /* `[' exp1 `]' */
					{
						var key:Expdesc = new Expdesc();
						this._fs!.kExp2anyreg(v);
						this.yindex(key);
						this._fs!.kIndexed(v, key);
					}
					break;

				case ':':  /* `:' NAME funcargs */
					{
						var key2:Expdesc = new Expdesc() ;
						this.xNext();
						this.checkname(key2);
						this._fs!.kSelf(v, key2);
						this.funcargs(v);
					}
					break;

				case '(':
				case String.fromCharCode(Syntax.TK_STRING):
				case '{':     // funcargs
					this._fs!.kExp2nextreg(v);
					this.funcargs(v);
					break;

				default:
					return;
			}
		}
	}

	private retstat():void // throws IOException
	{
		// stat -> RETURN explist
		this.xNext();    // skip RETURN
		// registers with returned values (first, nret)
		var first:number = 0;
		var nret:number;
		if (Syntax.block_follow(this._token) || this._token == ';'.charCodeAt(0))
		{
			// return no values
			first = 0;
			nret = 0;
		}
		else
		{
			var e:Expdesc = new Expdesc();
			nret = this.explist1(e);
			if (Syntax.hasmultret(e.k))
			{
				this._fs!.kSetmultret(e);
				if (e.k == Expdesc.VCALL && nret == 1)    /* tail call? */
				{
					this._fs!.setcode(e, Lua.SET_OPCODE(this._fs!.getcode(e), Lua.OP_TAILCALL));
					//# assert Lua.ARGA(fs.getcode(e)) == fs.nactvar
				}
				first = this._fs!.nactvar;
				nret = Lua.MULTRET;  /* return all values */
			}
			else
			{
				if (nret == 1)          // only one single value?
				{
					first = this._fs!.kExp2anyreg(e);
				}
				else
				{
					this._fs!.kExp2nextreg(e);  /* values must go to the `stack' */
					first = this._fs!.nactvar;  /* return all `active' values */
					//# assert nret == fs.freereg - first
				}
			}
		}
		this._fs!.kRet(first, nret);
	}

	private simpleexp(v:Expdesc):void // throws IOException
	{
		// simpleexp -> NUMBER | STRING | NIL | true | false | ... |
		//              constructor | FUNCTION body | primaryexp
		switch (this._token)
		{
			case Syntax.TK_NUMBER:
				v.init(Expdesc.VKNUM, 0);
				v.nval = this._tokenR;
				break;

			case Syntax.TK_STRING:
				this.codestring(v, this._tokenS);
				break;

			case Syntax.TK_NIL:
				v.init(Expdesc.VNIL, 0);
				break;

			case Syntax.TK_TRUE:
				v.init(Expdesc.VTRUE, 0);
				break;

			case Syntax.TK_FALSE:
				v.init(Expdesc.VFALSE, 0);
				break;

			case Syntax.TK_DOTS:  /* vararg */
				if (!this._fs!.f.isVararg)
					this.xSyntaxerror("cannot use \"...\" outside a vararg function");
				v.init(Expdesc.VVARARG, this._fs!.kCodeABC(Lua.OP_VARARG, 0, 1, 0));
				break;

			case '{'.charCodeAt(0):   /* constructor */
				this.constructor_(v);
				return;

			case Syntax.TK_FUNCTION:
				this.xNext();
				this.body(v, false, this._linenumber);
				return;

			default:
				this.primaryexp(v);
				return;
		}
		this.xNext();
	}

	private statement():boolean //throws IOException
	{
		var line:number = this._linenumber;
		switch (this._token)
		{
			case Syntax.TK_IF:   // stat -> ifstat
				this.ifstat(line);
				return false;

			case Syntax.TK_WHILE:  // stat -> whilestat
				this.whilestat(line);
				return false;

			case Syntax.TK_DO:       // stat -> DO block END
				this.xNext();         // skip DO
				this.block();
				this.check_match(Syntax.TK_END, Syntax.TK_DO, line);
				return false;

			case Syntax.TK_FOR:      // stat -> forstat
				this.forstat(line);
				return false;

			case Syntax.TK_REPEAT:   // stat -> repeatstat
				this.repeatstat(line);
				return false;

			case Syntax.TK_FUNCTION:
				this.funcstat(line); // stat -> funcstat
				return false;

			case Syntax.TK_LOCAL:    // stat -> localstat
				this.xNext();         // skip LOCAL
				if (this.testnext(Syntax.TK_FUNCTION))  // local function?
					this.localfunc();
				else
					this.localstat();
				return false;

			case Syntax.TK_RETURN:
				this.retstat();
				return true;  // must be last statement

			case Syntax.TK_BREAK:  // stat -> breakstat
				this.xNext();       // skip BREAK
				this.breakstat();
				return true;  // must be last statement
			
			default:
				this.exprstat();
				return false;
		}
	}

	// grep "ORDER OPR" if you change these enums.
	// default access so that FuncState can access them.
	public static OPR_ADD:number = 0;
	public static OPR_SUB:number = 1;
	public static OPR_MUL:number = 2;
	public static OPR_DIV:number = 3;
	public static OPR_MOD:number = 4;
	public static OPR_POW:number = 5;
	public static OPR_CONCAT:number = 6;
	public static OPR_NE:number = 7;
	public static OPR_EQ:number = 8;
	public static OPR_LT:number = 9;
	public static OPR_LE:number = 10;
	public static OPR_GT:number = 11;
	public static OPR_GE:number = 12;
	public static OPR_AND:number = 13;
	public static OPR_OR:number = 14;
	public static OPR_NOBINOPR:number = 15;

	public static OPR_MINUS:number = 0;
	public static OPR_NOT:number = 1;
	public static OPR_LEN:number = 2;
	public static OPR_NOUNOPR:number = 3;

	/** Converts token into binary operator.  */
	private static getbinopr(op:number):number
	{
		switch (String.fromCharCode(op))
		{
			case '+': 
				return Syntax.OPR_ADD;
			
			case '-': 
				return Syntax.OPR_SUB;
			
			case '*': 
				return Syntax.OPR_MUL;
			
			case '/': 
				return Syntax.OPR_DIV;
			
			case '%': 
				return Syntax.OPR_MOD;
			
			case '^': 
				return Syntax.OPR_POW;
			
			case String.fromCharCode(Syntax.TK_CONCAT): 
				return Syntax.OPR_CONCAT;
			
			case String.fromCharCode(Syntax.TK_NE): 
				return Syntax.OPR_NE;
			
			case String.fromCharCode(Syntax.TK_EQ): 
				return Syntax.OPR_EQ;
			
			case '<': 
				return Syntax.OPR_LT;
			
			case String.fromCharCode(Syntax.TK_LE): 
				return Syntax.OPR_LE;
			
			case '>': 
				return Syntax.OPR_GT;
			
			case String.fromCharCode(Syntax.TK_GE): 
				return Syntax.OPR_GE;
			
			case String.fromCharCode(Syntax.TK_AND): 
				return Syntax.OPR_AND;
			
			case String.fromCharCode(Syntax.TK_OR): 
				return Syntax.OPR_OR;
			
			default: 
				return Syntax.OPR_NOBINOPR;
		}
	}

	private static getunopr(op:number):number
	{
		switch (String.fromCharCode(op))
		{
			case String.fromCharCode(Syntax.TK_NOT): 
				return Syntax.OPR_NOT;
			
			case '-': 
				return Syntax.OPR_MINUS;
			
			case '#': 
				return Syntax.OPR_LEN;
			
			default: 
				return Syntax.OPR_NOUNOPR;
		}
	}


	// ORDER OPR
	/**
	* Priority table.  left-priority of an operator is
	* <code>priority[op][0]</code>, its right priority is
	* <code>priority[op][1]</code>.  Please do not modify this table.
	*/
	private static PRIORITY:number[][] = //new int[][]
	[
		[6, 6], [6, 6], [7, 7], [7, 7], [7, 7],     // + - * / %
		[10, 9], [5, 4],                // power and concat (right associative)
		[3, 3], [3, 3],                 // equality and inequality
		[3, 3], [3, 3], [3, 3], [3, 3], // order
		[2, 2], [1, 1]                  // logical (and/or)
	];

	/** Priority for unary operators. */
	private static UNARY_PRIORITY:number = 8;

	/**
	 * Operator precedence parser.
	 * <code>subexpr -> (simpleexp) | unop subexpr) { binop subexpr }</code>
	 * where <var>binop</var> is any binary operator with a priority
	 * higher than <var>limit</var>.
	 */
	private subexpr(v:Expdesc, limit:number):number // throws IOException
	{
		this.enterlevel();
		var uop:number = Syntax.getunopr(this._token);
		if (uop != Syntax.OPR_NOUNOPR)
		{
			this.xNext();
			this.subexpr(v, Syntax.UNARY_PRIORITY);
			this._fs!.kPrefix(uop, v);
		}
		else
		{
			this.simpleexp(v);
		}
		// expand while operators have priorities higher than 'limit'
		var op:number = Syntax.getbinopr(this._token);
		while (op != Syntax.OPR_NOBINOPR && Syntax.PRIORITY[op][0] > limit)
		{
			var v2:Expdesc = new Expdesc();
			this.xNext();
			this._fs!.kInfix(op, v);
			// read sub-expression with higher priority
			var nextop:number = this.subexpr(v2, Syntax.PRIORITY[op][1]);
			this._fs!.kPosfix(op, v, v2);
			op = nextop;
		}
		this.leavelevel();
		return op;
	}

	private enterblock(f:FuncState | null, bl:BlockCnt, isbreakable:boolean):void
	{
		bl.breaklist = FuncState.NO_JUMP;
		bl.isbreakable = isbreakable;
		bl.nactvar = f!.nactvar;
		bl.upval = false;
		bl.previous = f!.bl;
		f!.bl = bl;
		//# assert f.freereg == f.nactvar
	}

	private leaveblock(f:FuncState | null):void
	{
		var bl:BlockCnt | null = f!.bl;
		f!.bl = bl!.previous;
		this.removevars(bl!.nactvar);
		if (bl!.upval)
			f!.kCodeABC(Lua.OP_CLOSE, bl!.nactvar, 0, 0);
		/* loops have no body */
		//# assert (!bl.isbreakable) || (!bl.upval)
		//# assert bl.nactvar == f.nactvar
		f!.freereg = f!.nactvar;  /* free registers */
		f!.kPatchtohere(bl!.breaklist);
	}


	/*
	** {======================================================================
	** Rules for Statements
	** =======================================================================
	*/


	private block():void // throws IOException
	{
		/* block -> chunk */
		var bl:BlockCnt = new BlockCnt() ;
		this.enterblock(this._fs, bl, false);
		this.chunk();
		//# assert bl.breaklist == FuncState.NO_JUMP
		this.leaveblock(this._fs);
	}

	private breakstat():void
	{
		var bl:BlockCnt | null = this._fs!.bl;
		var upval:boolean = false;
		while (bl != null && !bl.isbreakable)
		{
			//TODO:||=
			upval ||= bl.upval;
			bl = bl.previous;
		}
		if (bl == null)
			this.xSyntaxerror("no loop to break");
		if (upval)
			this._fs!.kCodeABC(Lua.OP_CLOSE, bl!.nactvar, 0, 0);
		bl!.breaklist = this._fs!.kConcat(bl!.breaklist, this._fs!.kJump());
	}

	private funcstat(line:number):void //throws IOException
	{
		/* funcstat -> FUNCTION funcname body */
		var b:Expdesc = new Expdesc() ;
		var v:Expdesc = new Expdesc() ;
		this.xNext();  /* skip FUNCTION */
		var needself:boolean = this.funcname(v);
		this.body(b, needself, line);
		this._fs!.kStorevar(v, b);
		this._fs!.kFixline(line);  /* definition `happens' in the first line */
	}

	private checknext(c:number):void // throws IOException
	{
		this.check(c);
		this.xNext();
	}

	private parlist():void // throws IOException
	{
		/* parlist -> [ param { `,' param } ] */
		var f:Proto = this._fs!.f;
		var nparams:number = 0;
		if (this._token != ')'.charCodeAt(0))    /* is `parlist' not empty? */
		{
			do
			{
				switch (this._token)
				{
					case Syntax.TK_NAME:    /* param -> NAME */
						{
							this.new_localvar(this.str_checkname(), nparams++);
							break;
						}
					
					case Syntax.TK_DOTS:    /* param -> `...' */
						{
							this.xNext();
							f.isVararg = true;
							break;
						}
						
					default: 
					this.xSyntaxerror("<name> or '...' expected");
				}
			} while ((!f.isVararg) && this.testnext(','.charCodeAt(0)));
		}
		this.adjustlocalvars(nparams);
		f.numparams = this._fs!.nactvar ; /* VARARG_HASARG not now used */
		this._fs!.kReserveregs(this._fs!.nactvar);  /* reserve register for parameters */
	}


	private getlocvar(i:number):LocVar
	{
		var fstate:FuncState | null = this._fs;
		return fstate!.f.locvars![fstate!.actvar[i]] ;
	}

	private adjustlocalvars(nvars:number):void
	{
		this._fs!.nactvar += nvars;
		for (; nvars != 0; nvars--)
		{
			this.getlocvar(this._fs!.nactvar - nvars).startpc = this._fs!.pc;
		}
	}

	private new_localvarliteral(v:string, n:number):void
	{
		this.new_localvar(v, n) ;
	}

	private errorlimit(limit:number, what:string):void
	{
		var msg:string = this._fs!.f.linedefined == 0 ?
			"main function has more than " + limit + " " + what :
			"function at line " + this._fs!.f.linedefined + " has more than " + limit + " " + what;
		this.xLexerror(msg, 0);
	}


	private yChecklimit(v:number, l:number, m:string):void
	{
		if (v > l)
			this.errorlimit(l,m);
	}

	private new_localvar(name:string | null, n:number):void
	{
		this.yChecklimit(this._fs!.nactvar + n + 1, Lua.MAXVARS, "local variables");
		this._fs!.actvar[this._fs!.nactvar + n] = this.registerlocalvar(name) as number;
	}

	private registerlocalvar(varname:string | null):number
	{
		var f:Proto = this._fs!.f;
		f.ensureLocvars(this._L, this._fs!.nlocvars, /*Short*/Number.MAX_SAFE_INTEGER) ; //TODO:
		(f.locvars![this._fs!.nlocvars] as LocVar).varname = varname;
		return this._fs!.nlocvars++;
	}


	private body(e:Expdesc, needself:boolean, line:number):void // throws IOException
	{
		/* body ->  `(' parlist `)' chunk END */
		var new_fs:FuncState = new FuncState(this);
		this.open_func(new_fs);
		new_fs.f.linedefined = line;
		this.checknext('('.charCodeAt(0));
		if (needself)
		{
			this.new_localvarliteral("self", 0);
			this.adjustlocalvars(1);
		}
		this.parlist();
		this.checknext(')'.charCodeAt(0));
		this.chunk();
		new_fs.f.lastlinedefined = this._linenumber;
		this.check_match(Syntax.TK_END, Syntax.TK_FUNCTION, line);
		this.close_func();
		this.pushclosure(new_fs, e);
	}

	private UPVAL_K(upvaldesc:number):number
	{
		return (upvaldesc >>> 8) & 0xFF ;
	}
	
	private UPVAL_INFO(upvaldesc:number):number
	{
		return upvaldesc & 0xFF ;
	}
	
	private UPVAL_ENCODE(k:number, info:number):number
	{
		//# assert (k & 0xFF) == k && (info & 0xFF) == info
		return ((k & 0xFF) << 8) | (info & 0xFF) ;
	}


	private pushclosure(func:FuncState, v:Expdesc):void
	{
		var f:Proto = this._fs!.f;
		f.ensureProtos(this._L, this._fs!.np) ;
		var ff:Proto = func.f ;
		f.p![this._fs!.np++] = ff;
		v.init(Expdesc.VRELOCABLE, this._fs!.kCodeABx(Lua.OP_CLOSURE, 0, this._fs!.np - 1));
		for (var i:number = 0; i < ff.nups; i++)
		{
			var upvalue:number = func.upvalues[i] ;
			var o:number = (this.UPVAL_K(upvalue) == Expdesc.VLOCAL) ? Lua.OP_MOVE :
															Lua.OP_GETUPVAL;
			this._fs!.kCodeABC(o, 0, this.UPVAL_INFO(upvalue), 0);
		}
	}

	private funcname(v:Expdesc):boolean // throws IOException
	{
		/* funcname -> NAME {field} [`:' NAME] */
		var needself:boolean = false;
		this.singlevar(v);
		while (this._token == '.'.charCodeAt(0))
			this.field(v);
		if (this._token == ':'.charCodeAt(0))
		{
			needself = true;
			this.field(v);
		}
		return needself;
	}

	private field(v:Expdesc):void //throws IOException
	{
		/* field -> ['.' | ':'] NAME */
		var key:Expdesc = new Expdesc() ;
		this._fs!.kExp2anyreg(v);
		this.xNext();  /* skip the dot or colon */
		this.checkname(key);
		this._fs!.kIndexed(v, key);
	}

	private repeatstat(line:number):void //throws IOException
	{
		/* repeatstat -> REPEAT block UNTIL cond */
		var repeat_init:number = this._fs!.kGetlabel();
		var bl1:BlockCnt = new BlockCnt();
		var bl2:BlockCnt = new BlockCnt();
		this.enterblock(this._fs!, bl1, true);  /* loop block */
		this.enterblock(this._fs!, bl2, false);  /* scope block */
		this.xNext();  /* skip REPEAT */
		this.chunk();
		this.check_match(Syntax.TK_UNTIL, Syntax.TK_REPEAT, line);
		var condexit:number = this.cond();  /* read condition (inside scope block) */
		if (!bl2.upval)    /* no upvalues? */
		{
			this.leaveblock(this._fs);  /* finish scope */
			this._fs!.kPatchlist(condexit, repeat_init);  /* close the loop */
		}
		else    /* complete semantics when there are upvalues */
		{
			this.breakstat();  /* if condition then break */
			this._fs!.kPatchtohere(condexit);  /* else... */
			this.leaveblock(this._fs);  /* finish scope... */
			this._fs!.kPatchlist(this._fs!.kJump(), repeat_init);  /* and repeat */
		}
		this.leaveblock(this._fs);  /* finish loop */
	}

	private cond():number // throws IOException
	{
		/* cond -> exp */
		var v:Expdesc = new Expdesc() ;
		this.expr(v);  /* read condition */
		if (v.k == Expdesc.VNIL)
			v.k = Expdesc.VFALSE;  /* `falses' are all equal here */
		this._fs!.kGoiftrue(v);
		return v.f;
	}

	private open_func(funcstate:FuncState):void
	{
		var f:Proto = new Proto();  /* registers 0/1 are always valid */
		f.init2(this.source, 2);
		funcstate.f = f;
		funcstate.ls = this;
		funcstate.L = this._L;

		funcstate.prev = this._fs;   /* linked list of funcstates */
		this._fs = funcstate;
	}

	private localstat():void  // throws IOException
	{
		/* stat -> LOCAL NAME {`,' NAME} [`=' explist1] */
		var nvars:number = 0;
		var nexps:number;
		var e:Expdesc = new Expdesc();
		do
		{
			this.new_localvar(this.str_checkname(), nvars++);
		} while (this.testnext(','.charCodeAt(0)));
		if (this.testnext('='.charCodeAt(0)))
		{
			nexps = this.explist1(e);
		}
		else
		{
			e.k = Expdesc.VVOID;
			nexps = 0;
		}
		this.adjust_assign(nvars, nexps, e);
		this.adjustlocalvars(nvars);
	}

	private forstat(line:number):void // throws IOException
	{
		/* forstat -> FOR (fornum | forlist) END */
		var bl:BlockCnt = new BlockCnt() ;
		this.enterblock(this._fs, bl, true);  /* scope for loop and control variables */
		this.xNext();  /* skip `for' */
		var varname:string | null = this.str_checkname();  /* first variable name */
		switch (String.fromCharCode(this._token))
		{
			case '=':
				this.fornum(varname, line);
				break;
			
			case ',':
			case String.fromCharCode(Syntax.TK_IN):
				this.forlist(varname);
				break;
			
			default:
				this.xSyntaxerror("\"=\" or \"in\" expected");
		}
		this.check_match(Syntax.TK_END, Syntax.TK_FOR, line);
		this.leaveblock(this._fs);  /* loop scope (`break' jumps to this point) */
	}

	private fornum(varname:string | null, line:number):void // throws IOException
	{
		/* fornum -> NAME = exp1,exp1[,exp1] forbody */
		var base:number = this._fs!.freereg;
		this.new_localvarliteral("(for index)", 0);
		this.new_localvarliteral("(for limit)", 1);
		this.new_localvarliteral("(for step)", 2);
		this.new_localvar(varname, 3);
		this.checknext('='.charCodeAt(0));
		this.exp1();  /* initial value */
		this.checknext(','.charCodeAt(0));
		this.exp1();  /* limit */
		if (this.testnext(','.charCodeAt(0)))
			this.exp1();  /* optional step */
		else    /* default step = 1 */
		{
			this._fs!.kCodeABx(Lua.OP_LOADK, this._fs!.freereg, this._fs!.kNumberK(1));
			this._fs!.kReserveregs(1);
		}
		this.forbody(base, line, 1, true);
	}

	private exp1():number // throws IOException
	{
		var e:Expdesc = new Expdesc();
		this.expr(e);
		var k:number = e.k;
		this._fs!.kExp2nextreg(e);
		return k;
	}

	private forlist(indexname:string | null):void // throws IOException
	{
		/* forlist -> NAME {,NAME} IN explist1 forbody */
		var e:Expdesc = new Expdesc() ;
		var nvars:number = 0;
		var base:number = this._fs!.freereg;
		/* create control variables */
		this.new_localvarliteral("(for generator)", nvars++);
		this.new_localvarliteral("(for state)", nvars++);
		this.new_localvarliteral("(for control)", nvars++);
		/* create declared variables */
		this.new_localvar(indexname, nvars++);
		while (this.testnext(','.charCodeAt(0)))
			this.new_localvar(this.str_checkname(), nvars++);
			this.checknext(Syntax.TK_IN);
		var line:number = this._linenumber;
		this.adjust_assign(3, this.explist1(e), e);
		this._fs!.kCheckstack(3);  /* extra space to call generator */
		this.forbody(base, line, nvars - 3, false);
	}

	private forbody(base:number, line:number, nvars:number, isnum:boolean):void
		//throws IOException
	{
		/* forbody -> DO block */
		var bl:BlockCnt = new BlockCnt() ;
		this.adjustlocalvars(3);  /* control variables */
		this.checknext(Syntax.TK_DO);
		var prep:number = isnum ? this._fs!.kCodeAsBx(Lua.OP_FORPREP, base, FuncState.NO_JUMP) : this._fs!.kJump();
		this.enterblock(this._fs, bl, false);  /* scope for declared variables */
		this.adjustlocalvars(nvars);
		this._fs!.kReserveregs(nvars);
		this.block();
		this.leaveblock(this._fs);  /* end of scope for declared variables */
		this._fs!.kPatchtohere(prep);
		var endfor:number = isnum ?
			this._fs!.kCodeAsBx(Lua.OP_FORLOOP, base, FuncState.NO_JUMP) :
			this._fs!.kCodeABC(Lua.OP_TFORLOOP, base, 0, nvars);
		this._fs!.kFixline(line);  /* pretend that `OP_FOR' starts the loop */
		this._fs!.kPatchlist((isnum ? endfor : this._fs!.kJump()), prep + 1);
	}

	private ifstat(line:number):void // throws IOException
	{
		/* ifstat -> IF cond THEN block {ELSEIF cond THEN block} [ELSE block] END */
		var escapelist:number = FuncState.NO_JUMP;
		var flist:number = this.test_then_block();  /* IF cond THEN block */
		while (this._token == Syntax.TK_ELSEIF)
		{
			escapelist = this._fs!.kConcat(escapelist, this._fs!.kJump());
			this._fs!.kPatchtohere(flist);
			flist = this.test_then_block();  /* ELSEIF cond THEN block */
		}
		if (this._token == Syntax.TK_ELSE)
		{
			escapelist = this._fs!.kConcat(escapelist, this._fs!.kJump());
			this._fs!.kPatchtohere(flist);
			this.xNext();  /* skip ELSE (after patch, for correct line info) */
			this.block();  /* `else' part */
		}
		else
			escapelist = this._fs!.kConcat(escapelist, flist);
		
		this._fs!.kPatchtohere(escapelist);
		this.check_match(Syntax.TK_END, Syntax.TK_IF, line);
	}

	private test_then_block():number // throws IOException
	{
		/* test_then_block -> [IF | ELSEIF] cond THEN block */
		this.xNext();  /* skip IF or ELSEIF */
		var condexit:number = this.cond();
		this.checknext(Syntax.TK_THEN);
		this.block();  /* `then' part */
		return condexit;
	}

	private whilestat(line:number):void // throws IOException
	{
		/* whilestat -> WHILE cond DO block END */
		var bl:BlockCnt = new BlockCnt() ;
		this.xNext();  /* skip WHILE */
		var whileinit:number = this._fs!.kGetlabel();
		var condexit:number = this.cond();
		this.enterblock(this._fs, bl, true);
		this.checknext(Syntax.TK_DO);
		this.block();
		this._fs!.kPatchlist(this._fs!.kJump(), whileinit);
		this.check_match(Syntax.TK_END, Syntax.TK_WHILE, line);
		this.leaveblock(this._fs);
		this._fs!.kPatchtohere(condexit);  /* false conditions finish the loop */
	}

	private static hasmultret(k:number):boolean
	{
		return k == Expdesc.VCALL || k == Expdesc.VVARARG ;
	}

	private adjust_assign(nvars:number, nexps:number, e:Expdesc):void
	{
		var extra:number = nvars - nexps;
		if (Syntax.hasmultret(e.k))
		{
			extra++;  /* includes call itself */
			if (extra < 0)
				extra = 0;
			this._fs!.kSetreturns(e, extra);  /* last exp. provides the difference */
			if (extra > 1)
				this._fs!.kReserveregs(extra-1);
		}
		else
		{
			if (e.k != Expdesc.VVOID)
				this._fs!.kExp2nextreg(e);  /* close last expression */
			if (extra > 0)
			{
				var reg:number = this._fs!.freereg;
				this._fs!.kReserveregs(extra);
				this._fs!.kNil(reg, extra);
			}
		}
	}

	private localfunc():void // throws IOException
	{
		var b:Expdesc = new Expdesc();
		this.new_localvar(this.str_checkname(), 0);
		var v:Expdesc = new Expdesc();
		v.init(Expdesc.VLOCAL, this._fs!.freereg);
		this._fs!.kReserveregs(1);
		this.adjustlocalvars(1);
		this.body(b, false, this._linenumber);
		this._fs!.kStorevar(v, b);
		/* debug information will only see the variable after this point! */
		this._fs!.getlocvar(this._fs!.nactvar - 1).startpc = this._fs!.pc;
	}

	private yindex(v:Expdesc):void  // throws IOException
	{
		/* index -> '[' expr ']' */
		this.xNext();  /* skip the '[' */
		this.expr(v);
		this._fs!.kExp2val(v);
		this.checknext(']'.charCodeAt(0));
	}

	public xLookahead():void  // throws IOException
	{
		//# assert lookahead == TK_EOS
		this._lookahead = this.llex();
		this._lookaheadR = this._semR ;
		this._lookaheadS = this._semS ;
	}

	private listfield(cc:ConsControl):void // throws IOException
	{
		this.expr(cc.v);
		this.yChecklimit(cc.na, Lua.MAXARG_Bx, "items in a constructor");
		cc.na++;
		cc.tostore++;
	}

	private indexupvalue(funcstate:FuncState, name:string | null, v:Expdesc):number
	{
		var f:Proto = funcstate.f;
		var oldsize:number = f.sizeupvalues;
		for (var i:number = 0; i < f.nups; i++)
		{
			var entry:number = funcstate.upvalues[i];
			if (this.UPVAL_K(entry) == v.k && this.UPVAL_INFO(entry) == v.info)
			{
				//# assert name.equals(f.upvalues[i])
				return i;
			}
		}
		/* new one */
		this.yChecklimit(f.nups + 1, Lua.MAXUPVALUES, "upvalues");
		f.ensureUpvals(this._L, f.nups) ;
		f.upvalues![f.nups] = name;
		//# assert v.k == Expdesc.VLOCAL || v.k == Expdesc.VUPVAL
		funcstate.upvalues[f.nups] = this.UPVAL_ENCODE(v.k, v.info) ;
		return f.nups++;
	}
	
	//新增
	public get L():Lua
	{
		return this._L;
	}
}
