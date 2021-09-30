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
    exports.RuntimeException = void 0;
    class RuntimeException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(str).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.RuntimeException = RuntimeException;
});
//# sourceMappingURL=RuntimeException.js.map