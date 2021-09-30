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
    exports.TimeZone = void 0;
    class TimeZone {
        constructor() {
            this._id = null;
            this._id = null;
        }
        //Flash自动调整夏令时
        useDaylightTime() {
            return true;
        }
        //获取本地时间
        static getDefault() {
            if (TimeZone.tz._id == null)
                TimeZone.tz._id = "default";
            return TimeZone.tz;
        }
        //获取GMT时间
        static getTimeZone(ID) {
            if (ID != "GMT") {
                console.log("TimeZone.getTimeZone(): not support name");
                throw new Error("TimeZone.getTimeZone(): not support name");
                //return TimeZone.tz; //FIXME:
            }
            if (TimeZone.tzGMT._id == null)
                TimeZone.tzGMT._id = "GMT";
            return TimeZone.tzGMT;
        }
        //时区字符串
        getID() {
            return this._id;
        }
    }
    exports.TimeZone = TimeZone;
    TimeZone.tz = new TimeZone();
    TimeZone.tzGMT = new TimeZone();
});
//# sourceMappingURL=TimeZone.js.map