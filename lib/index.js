"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortcut = exports.ShortcutBus = void 0;
// Convert the js event.key control key names to more accessable names
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
    /**
     * Attach the key listening event to the window
     */
    ShortcutBus.prototype.attach = function () {
        if (typeof window !== 'undefined') {
            this.detach();
            window.addEventListener("keyup", this.onKeyUp);
            window.addEventListener("keydown", this.onKeyDown);
        }
    };
    /**
     * Detach key event listening event to the window
     */
    ShortcutBus.prototype.detach = function () {
        if (typeof window !== 'undefined') {
            window.removeEventListener("keyup", this.onKeyUp);
            window.removeEventListener("keydown", this.onKeyDown);
        }
    };
    /**
     * Add a callback that executes when the given shortcut is pressed
     * @param characters The characters that define the shortcut
     * @param callback The calback to be executed when the shortcut is pressed
     * @param options
     */
    ShortcutBus.prototype.on = function (characters, callback, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        // Check if a shortcut is provided
        if (characters.length === 0)
            throw new Error("No shortcut provided");
        options = Object.assign({
            preventDefault: false,
            stopProppagation: false,
            stopImmediatePropagation: false
        }, options);
        // Loop over all the individual characters of the shortcut and add them to the keyListeners
        characters.forEach(function (char) {
            // Checking if a keyListener object for this char already exists and if not create one
            var keyListener = _this.keyListeners.find(function (l) { return l.key === char; });
            if (keyListener === undefined) {
                var index = _this.keyListeners.push({
                    key: char,
                    callbacks: []
                });
                keyListener = _this.keyListeners[index - 1];
            }
            // Add a keyListener callback that provides the callback wrapped in a HOF that checks if the callback should be executed
            // Also adds an id which is equal to the stringified callback which in javascript can be used as an unique identifier
            keyListener.callbacks.push({
                callback: function (event) {
                    return _this.checkActiveShortcut(event, callback, options, characters);
                },
                id: callback.toString()
            });
        });
    };
    /**
     * Remove a callback linked to the given shortcut
     * @param characters The characters that define the shortcut
     * @param callback The calback to be executed when the shortcut is pressed
     */
    ShortcutBus.prototype.off = function (characters, callback) {
        var _this = this;
        characters.forEach(function (char) {
            var keyListener = _this.keyListeners.find(function (l) { return l.key === char; });
            if (keyListener === undefined)
                return;
            // If a keyListener for the current shortcut character is found remove the callback specified in the arguments
            keyListener.callbacks = keyListener.callbacks.filter(function (c) {
                if (c.id === callback.toString()) {
                    return false;
                }
                return true;
            });
        });
    };
    /**
     * Remove all callbacks from this event bus
     */
    ShortcutBus.prototype.offAll = function () {
        this.keyListeners = [];
        this.activeKeys = [];
    };
    /**
     * Wrapper function that executes the callback when all the keys linked to the shortcut are pressed and returns false otherwise
     * @param event
     * @param callback
     * @param options
     * @param characters
     * @returns Whether the callback was executed
     */
    ShortcutBus.prototype.checkActiveShortcut = function (event, callback, options, characters) {
        var _this = this;
        // Check if the number of keys pressed is equal to the shorcut length
        if (this.activeKeys.length !== characters.length)
            return false;
        // Check if all the keys that are pressed are also the characters of the shortcut
        if (!characters.every(function (key) { return _this.activeKeys.includes(key); }))
            return false;
        // Apply all options
        if (options.preventDefault)
            event.preventDefault();
        if (options.stopProppagation)
            event.stopPropagation();
        if (options.stopImmediatePropagation)
            event.stopImmediatePropagation();
        // Then execute the callback and inject the key event
        callback(event);
        return true;
    };
    /**
     * Private onKeyDown eventListener
     * @param event
     */
    ShortcutBus.prototype._onKeyDown = function (event) {
        // Map event.key to "ShortcutKeys"
        var key = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            key = shortcutMap[key];
        }
        // Create a keyListener if it doesn't exist already
        var listener = this.keyListeners.find(function (l) { return l.key === key; });
        if (listener === undefined)
            return;
        if (!this.activeKeys.includes(key))
            this.activeKeys.push(key);
        var executed = false;
        listener.callbacks.forEach(function (c) {
            // Execute the keyListener callback which returns true if the callback was executed and false if not
            var r = c.callback(event);
            if (r === true)
                executed = true;
        });
        // If the callback was executed we mark the last pressed key to "not pressed"
        // I choose to do this so the callback isn't executed when a key is held down (this only applies to control keys)
        if (executed)
            this.activeKeys = this.activeKeys.filter(function (k) { return k != key; });
    };
    /**
     * Private onKeyUp eventListener
     * @param event
     */
    ShortcutBus.prototype._onKeyUp = function (event) {
        // Find the key in the activeKeys list and mark them as "not pressed"
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
var bus = new ShortcutBus();
/**
 * Add a callback that executes when the given shortcut is pressed
 * @param characters The characters that define the shortcut
 * @param callback The calback to be executed when the shortcut is pressed
 * @param options
 * @returns The off listener function
 */
function shortcut(characters, callback, options) {
    if (options === void 0) { options = {}; }
    bus.on(characters, callback, options);
    return function () {
        bus.off(characters, callback);
    };
}
exports.shortcut = shortcut;
exports.default = bus;
