import { Lua } from "./lua/Lua";
import { PackageLib } from "./lua/PackageLib";
import { MathLib } from "./lua/MathLib";
import { BaseLib } from "./lua/BaseLib";
import { OSLib } from "./lua/OSLib";
import { TableLib } from "./lua/TableLib";
import { StringLib } from "./lua/StringLib";

function trace(s:string) {
    if (typeof document !== 'undefined' && document) {
        document.write(s.replace(/\n/g, '<br>'));
        document.write('<br>');
    }
    console.log(s);
}

var test001 = "n = 99 + (1 * 10) / 2 - 0.5;\n" +
    "if n > 10 then return 'Oh, 真的比10还大哦:'..n end\n" +
    "return n\n";
var test002 = "return _VERSION";
var test003 = "return nil";

var isLoadLib = true;
//try {
    trace("Start test...");
    var L = new Lua();
    if (isLoadLib) {
        BaseLib.open(L);
        PackageLib.open(L);
        MathLib.open(L);
        OSLib.open(L);
        StringLib.open(L);
        TableLib.open(L);
		isLoadLib = false;
    }
	L.setTop(0);
    var status = L.doString(test001);
    if (status != 0) {
        var errObj = L.value(1);
        var tostring = L.getGlobal("tostring");
        L.pushObject(tostring);
        L.pushObject(errObj);
        L.call(1, 1);
        var errObjStr = L.toString_(L.value(-1));
        throw new Error("Error compiling : " + L.value(1));
    } else {
        var result = L.value(1);
        var tostring_ = L.getGlobal("tostring");
        L.pushObject(tostring_);
        L.pushObject(result);
        L.call(1, 1); // call BaseLib.tostring = function() {...}
        var resultStr = L.toString_(L.value(-1));
        trace("Result >>> " + resultStr);
    }
//} catch (e) {
//    //trace(e.getStackTrace()); //FIXME:
//    trace(e.stack);
//}

