(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PrintStream = void 0;
    class PrintStream {
        constructor() {
            PrintStream.init();
        }
        static init() {
            PrintStream.OutputArr = new Array();
            PrintStream.OutputArr.push("");
        }
        //TODO:
        print(str) {
            PrintStream.OutputArr[PrintStream.OutputArr.length - 1] += str;
            console.log(str);
        }
        //TODO:
        println() {
            PrintStream.OutputArr.push("");
            console.log("\n");
        }
    }
    exports.PrintStream = PrintStream;
    PrintStream.OutputArr = null;
});
//# sourceMappingURL=PrintStream.js.map