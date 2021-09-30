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
    exports.StringBuffer = void 0;
    class StringBuffer {
        constructor(str) {
            if (str === undefined) {
                str = "";
            }
            this._str = str;
        }
        //并不创建任何字符，只是预留空间
        init(i) {
        }
        //主要用于清空长度，一般为0
        setLength(i) {
            if (i == 0) {
                this._str = "";
            }
            else if (i > 0) {
                this._str = this._str.substr(0, i);
            }
            else {
                throw new Error("StringBuffer.setLength() error: i < 0");
            }
        }
        toString() {
            return this._str;
        }
        append(ch) {
            this._str = this._str.concat(String.fromCharCode(ch));
        }
        appendStringBuffer(buf) {
            this._str = this._str.concat(buf._str);
        }
        appendString(str) {
            this._str = this._str.concat(str);
        }
        /**
         * 移除此序列的子字符串中的字符。该子字符串从指定的 start 处开始，
         * 一直到索引 end - 1 处的字符，如果不存在这种字符，则一直到序列尾部。
         * 如果 start 等于 end，则不发生任何更改。
         *
         * delete在Java中不是关键字，但在AS3中是关键字
         */
        _delete(start, end) {
            //console.log("StringBuffer._delete(" + start + "," + end + ")");
            if (end > this._str.length) {
                end = this._str.length; //end可能是个过大的数
            }
            if (0 <= start && start < end && end <= this._str.length) {
                this._str = this._str.substring(0, start) +
                    this._str.substring(end);
                return this;
            }
            else {
                throw new Error("StringBuffer.delete() error");
            }
        }
        insert(at, ch) {
            this._str = this._str.substring(0, at) +
                String(ch) +
                this._str.substring(at);
        }
        insertStringBuffer(at, buf) {
            this._str = this._str.substring(0, at) +
                buf._str +
                this._str.substring(at);
        }
        length() {
            return this._str.length;
        }
        charAt(index) {
            return this._str.charCodeAt(index);
        }
        deleteCharAt(index) {
            return this._delete(index, index + 1);
        }
    }
    exports.StringBuffer = StringBuffer;
});
//# sourceMappingURL=StringBuffer.js.map