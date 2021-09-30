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
    exports.MathUtil = void 0;
    //see http://codesnipp.it/code/939
    class MathUtil {
        // 弧度转换为角度
        // convert radians to degrees  
        static toDegrees(rad) {
            return (rad / 180 * Math.PI);
        }
        // convert degrees to radians  
        // 角度转换为弧度
        static toRadians(deg) {
            return (deg * Math.PI / 180);
        }
    }
    exports.MathUtil = MathUtil;
});
//# sourceMappingURL=MathUtil.js.map