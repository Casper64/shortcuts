"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shortcut = exports.ShortcutBus = void 0;
var shortcutMap = {
    "Control": "ctrl",
    "Alt": "alt",
    "Shift": "shift",
    "Tab": "tab"
};
var ShortcutBus = /** @class */ (function () {
    function ShortcutBus() {
        this.keyListeners = [];
        this.activeKeys = [];
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onKeyDown = this._onKeyDown.bind(this);
        this.attach();
    }
    ShortcutBus.prototype.attach = function () {
        if (typeof window !== 'undefined') {
            this.detach();
            window.addEventListener("keyup", this.onKeyUp);
            window.addEventListener("keydown", this.onKeyDown);
        }
    };
    ShortcutBus.prototype.detach = function () {
        if (typeof window !== 'undefined') {
            window.removeEventListener("keyup", this.onKeyUp);
            window.removeEventListener("keydown", this.onKeyDown);
        }
    };
    ShortcutBus.prototype.on = function (options) {
        var _this = this;
        var characters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            characters[_i - 1] = arguments[_i];
        }
        if (characters.length === 0)
            throw new Error("No shortcut provided");
        options = __assign({ preventDefault: true, stopProppagation: true }, options);
        characters.forEach(function (char) {
            var keyListener = _this.keyListeners.find(function (l) { return l.key === char; });
            if (keyListener === undefined) {
                var index = _this.keyListeners.push({
                    key: char,
                    callbacks: []
                });
                keyListener = _this.keyListeners[index - 1];
            }
            keyListener.callbacks.push(function (event) {
                return _this.checkActiveShortcut(event, options, characters);
            });
        });
    };
    ShortcutBus.prototype.off = function (callback) {
        var _this = this;
        var characters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            characters[_i - 1] = arguments[_i];
        }
        characters.forEach(function (char) {
            var keyListener = _this.keyListeners.find(function (l) { return l.key === char; });
            if (keyListener === undefined)
                return;
            keyListener.callbacks = keyListener.callbacks.filter(function (c) {
                if (c.toString() === callback.toString()) {
                    return false;
                }
                return true;
            });
        });
    };
    ShortcutBus.prototype.offAll = function () {
        this.keyListeners = [];
        this.activeKeys = [];
    };
    ShortcutBus.prototype.checkActiveShortcut = function (event, options, characters) {
        var _this = this;
        if (this.activeKeys.length !== characters.length)
            return false;
        if (!characters.every(function (key) { return _this.activeKeys.includes(key); }))
            return false;
        if (options.preventDefault)
            event.preventDefault();
        if (options.stopProppagation)
            event.stopPropagation();
        options.callback(event);
        return true;
    };
    ShortcutBus.prototype._onKeyDown = function (event) {
        var key = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            key = shortcutMap[key];
        }
        var listener = this.keyListeners.find(function (l) { return l.key === key; });
        if (listener === undefined)
            return;
        if (!this.activeKeys.includes(key))
            this.activeKeys.push(key);
        var executed = false;
        listener.callbacks.forEach(function (c) {
            var r = c(event);
            if (r === true)
                executed = true;
        });
        if (executed)
            this.activeKeys = [];
    };
    ShortcutBus.prototype._onKeyUp = function (event) {
        var key = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            this.activeKeys = this.activeKeys.filter(function (k) { return k != shortcutMap[key]; });
        }
        else {
            this.activeKeys = this.activeKeys.filter(function (k) { return k != key; });
        }
    };
    return ShortcutBus;
}());
exports.ShortcutBus = ShortcutBus;
var Shortcut = /** @class */ (function () {
    function Shortcut(options) {
        var characters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            characters[_i - 1] = arguments[_i];
        }
        this.activeKeys = [];
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onKeyDown = this._onKeyDown.bind(this);
        this.options = __assign({ preventDefault: true, stopProppagation: true }, options);
        this.characters = characters;
        this.attach();
    }
    Shortcut.prototype.attach = function () {
        if (typeof window !== 'undefined') {
            this.detach();
            window.addEventListener("keyup", this.onKeyUp);
            window.addEventListener("keydown", this.onKeyDown);
        }
    };
    Shortcut.prototype.detach = function () {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    };
    Shortcut.prototype._onKeyDown = function (event) {
        var _this = this;
        var key = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            if (!this.activeKeys.includes(shortcutMap[key]))
                this.activeKeys.push(shortcutMap[key]);
        }
        else if (!this.activeKeys.includes(key)) {
            this.activeKeys.push(key);
        }
        if (this.activeKeys.length !== this.characters.length)
            return;
        if (!this.characters.every(function (k) { return _this.activeKeys.includes(k); }))
            return;
        if (this.options.preventDefault)
            event.preventDefault();
        if (this.options.stopProppagation)
            event.stopPropagation();
        this.options.callback(event);
        this.activeKeys = [];
    };
    Shortcut.prototype._onKeyUp = function (event) {
        var key = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            this.activeKeys = this.activeKeys.filter(function (k) { return k != shortcutMap[key]; });
        }
        else {
            this.activeKeys = this.activeKeys.filter(function (k) { return k != key; });
        }
    };
    return Shortcut;
}());
exports.Shortcut = Shortcut;
var bus = new ShortcutBus();
exports.default = bus;
