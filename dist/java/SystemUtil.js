(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./PrintStream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SystemUtil = void 0;
    const PrintStream_1 = require("./PrintStream");
    class SystemUtil {
        static arraycopy(src, srcPos, dest, destPos, length) {
            if (src != null && dest != null && src instanceof Array && dest instanceof Array) {
                for (var i = destPos; i < destPos + length; i++) {
                    dest[i] = src[i];
                    //console.log("arraycopy:", i, (src as Array)[i]); 
                }
            }
        }
        static gc() {
        }
        static identityHashCode(obj) {
            return 0;
        }
        static getResourceAsStream(s) {
            return null;
        }
        static currentTimeMillis() {
            return 0;
        }
    }
    exports.SystemUtil = SystemUtil;
    SystemUtil.out = new PrintStream_1.PrintStream();
});
//# sourceMappingURL=SystemUtil.js.map