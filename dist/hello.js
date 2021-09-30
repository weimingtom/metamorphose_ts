(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Test1"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Test1_1 = require("./Test1");
    class Hook2 {
        luaHook(L, ar) {
            throw new Error('Method not implemented.');
        }
    }
    console.log("hello, world!");
    console.log(new Test1_1.Test1().hello);
});
//# sourceMappingURL=hello.js.map