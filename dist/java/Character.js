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
    exports.Character = void 0;
    // 注意：Character.toString用String.fromCharCode()代替
    class Character {
        static isUpperCase(ch) {
            return ch >= 'A'.charCodeAt(0) && ch <= 'Z'.charCodeAt(0);
        }
        static isLowerCase(ch) {
            return ch >= 'a'.charCodeAt(0) && ch <= 'z'.charCodeAt(0);
        }
        static isDigit(ch) {
            return ch >= '0'.charCodeAt(0) && ch <= '9'.charCodeAt(0);
        }
        static toLowerCase(ch) {
            return String.fromCharCode(ch).toLowerCase();
        }
    }
    exports.Character = Character;
});
//# sourceMappingURL=Character.js.map