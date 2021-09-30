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
    exports.EOFException = void 0;
    class EOFException extends Error {
        constructor(str) {
            super();
            if (str === undefined) {
                str = "";
            }
            this.message = str;
            this._stackTrace = new Error(this.message).stack;
        }
        //FIXME: not used
        getStackTrace() {
            //this._stackTrace = new Error(this.message).stack;
            return this._stackTrace;
        }
    }
    exports.EOFException = EOFException;
});
//# sourceMappingURL=EOFException.js.map