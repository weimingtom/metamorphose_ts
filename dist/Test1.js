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
    exports.Test1 = void 0;
    class Test1 {
        constructor() {
            this.hello = '';
            this.hello2 = 10;
        }
    }
    exports.Test1 = Test1;
});
//# sourceMappingURL=Test1.js.map