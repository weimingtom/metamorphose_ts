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
    exports.Random = void 0;
    class Random {
        nextDouble() {
            return Math.random();
        }
        nextInt(i) {
            return Math.floor(Math.random() * i);
        }
        setSeed(seed) {
        }
    }
    exports.Random = Random;
});
//# sourceMappingURL=Random.js.map