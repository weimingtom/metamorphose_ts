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
    exports.Calendar = void 0;
    class Calendar {
        constructor() {
            this._date = null;
        }
        _get(field) {
            switch (field) {
                case Calendar.SECOND:
                    return this._date.getSeconds();
                case Calendar.MINUTE:
                    return this._date.getMinutes();
                case Calendar.HOUR:
                    return this._date.getHours();
                case Calendar.MONTH:
                    return this._date.getMonth();
                case Calendar.YEAR:
                    return this._date.getFullYear();
                case Calendar.DAY_OF_WEEK:
                    console.log("DAY_OF_WEEK not implement");
                    return 0;
                case Calendar.DAY_OF_MONTH:
                    return this._date.getDay();
            }
            console.log("Calendar._get(): field not implement");
            return 0;
        }
        _set(field, value) {
            var _a, _b, _c, _d, _e;
            switch (field) {
                case Calendar.SECOND:
                    (_a = this._date) === null || _a === void 0 ? void 0 : _a.setSeconds(value);
                    return;
                case Calendar.MINUTE:
                    (_b = this._date) === null || _b === void 0 ? void 0 : _b.setMinutes(value);
                    return;
                case Calendar.HOUR:
                    (_c = this._date) === null || _c === void 0 ? void 0 : _c.setHours(value);
                    return;
                case Calendar.MONTH:
                    (_d = this._date) === null || _d === void 0 ? void 0 : _d.setMonth(value);
                    return;
                case Calendar.YEAR:
                    (_e = this._date) === null || _e === void 0 ? void 0 : _e.setFullYear(value);
                    return;
            }
            console.log("Calendar._set(): field not implement");
        }
        static getInstance(tz) {
            return Calendar._instance;
        }
        setTime(d) {
            this._date = d;
        }
        getTime() {
            return this._date;
        }
    }
    exports.Calendar = Calendar;
    Calendar.SECOND = 1;
    Calendar.MINUTE = 2;
    Calendar.HOUR = 3;
    Calendar.DAY_OF_MONTH = 4;
    Calendar.MONTH = 5;
    Calendar.YEAR = 6;
    Calendar.DAY_OF_WEEK = 7;
    Calendar.SUNDAY = 8;
    Calendar.MONDAY = 9;
    Calendar.TUESDAY = 10;
    Calendar.WEDNESDAY = 11;
    Calendar.THURSDAY = 12;
    Calendar.FRIDAY = 13;
    Calendar.SATURDAY = 14;
    Calendar.JANUARY = 15;
    Calendar.FEBRUARY = 16;
    Calendar.MARCH = 17;
    Calendar.APRIL = 18;
    Calendar.MAY = 19;
    Calendar.JUNE = 20;
    Calendar.JULY = 21;
    Calendar.AUGUST = 22;
    Calendar.SEPTEMBER = 23;
    Calendar.OCTOBER = 24;
    Calendar.NOVEMBER = 25;
    Calendar.DECEMBER = 26;
    Calendar._instance = new Calendar();
});
//# sourceMappingURL=Calendar.js.map