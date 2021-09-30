(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Enumeration"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashtableEnum = void 0;
    const Enumeration_1 = require("./Enumeration");
    // 注意：这个类不应该由Hashtable以外的类创建
    class HashtableEnum extends Enumeration_1.Enumeration {
        constructor() {
            super();
            this._arr = null;
            this._idx = 0;
            this._len = 0;
            this._arr = null;
            this._idx = 0;
            this._len = 0;
        }
        hasMoreElements() {
            return this._idx < this._len;
        }
        nextElement() {
            return this._arr[this._idx++];
        }
        //注意：仅暴露给Hashtable使用的方法
        setArr(arr) {
            if (arr != null) {
                this._arr = arr;
                this._idx = 0;
                this._len = this._arr.length;
            }
        }
    }
    exports.HashtableEnum = HashtableEnum;
});
//# sourceMappingURL=HashtableEnum.js.map