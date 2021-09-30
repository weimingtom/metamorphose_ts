(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./HashtableEnum"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Hashtable = void 0;
    const HashtableEnum_1 = require("./HashtableEnum");
    class Hashtable {
        constructor(initialCapacity) {
            if (initialCapacity === undefined) {
                initialCapacity = 11;
            }
            //Dictionary支持用Object作为键，而Array会对键进行toString的转换
            this._dic = new Map();
        }
        rehash() {
        }
        keys() {
            var enum_ = new HashtableEnum_1.HashtableEnum();
            var arr = new Array();
            for (var key in this._dic) {
                arr.push(key);
            }
            enum_.setArr(arr);
            return enum_;
        }
        _get(key) {
            //    if (typeof this._dic === 'undefined') {
            //        console.log('here');
            //    }
            return this._dic.get(key);
        }
        put(key, value) {
            //    if (typeof this._dic === 'undefined') {
            //        console.log('here');
            //    }
            var pre = this._dic.get(key);
            this._dic.set(key, value);
            return pre;
        }
        remove(key) {
            var pre = null;
            if (this._dic.get(key)) {
                pre = this._dic.get(key);
                this._dic.set(key, null);
                // delete this._dic[key];
                this._dic.delete(key);
            }
            return pre;
        }
    }
    exports.Hashtable = Hashtable;
});
//# sourceMappingURL=Hashtable.js.map