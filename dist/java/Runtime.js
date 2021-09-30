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
    exports.Runtime = void 0;
    class Runtime {
        static getRuntime() {
            return Runtime._instance;
        }
        totalMemory() {
            return 0; //FIXME:
        }
        freeMemory() {
            console.log("Runtime.freeMemory() not implement");
            return 0;
        }
    }
    exports.Runtime = Runtime;
    Runtime._instance = new Runtime();
});
//# sourceMappingURL=Runtime.js.map