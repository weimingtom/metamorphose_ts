(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./lua/Lua", "./lua/PackageLib", "./lua/MathLib", "./lua/BaseLib", "./lua/OSLib", "./lua/TableLib", "./lua/StringLib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Lua_1 = require("./lua/Lua");
    const PackageLib_1 = require("./lua/PackageLib");
    const MathLib_1 = require("./lua/MathLib");
    const BaseLib_1 = require("./lua/BaseLib");
    const OSLib_1 = require("./lua/OSLib");
    const TableLib_1 = require("./lua/TableLib");
    const StringLib_1 = require("./lua/StringLib");
    function trace(s) {
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
    var L = new Lua_1.Lua();
    if (isLoadLib) {
        BaseLib_1.BaseLib.open(L);
        PackageLib_1.PackageLib.open(L);
        MathLib_1.MathLib.open(L);
        OSLib_1.OSLib.open(L);
        StringLib_1.StringLib.open(L);
        TableLib_1.TableLib.open(L);
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
    }
    else {
        var result = L.value(1);
        var tostring_ = L.getGlobal("tostring");
        L.pushObject(tostring_);
        L.pushObject(result);
        L.call(1, 1); // call BaseLib.tostring = function() {...}
        var resultStr = L.toString_(L.value(-1));
        trace("Result >>> " + resultStr);
    }
});
//} catch (e) {
//    //trace(e.getStackTrace()); //FIXME:
//    trace(e.stack);
//}
//# sourceMappingURL=index.js.map