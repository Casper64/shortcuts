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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBUUEsc0VBQXNFO0FBQ3RFLElBQU0sV0FBVyxHQUFHO0lBQ2hCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLEtBQUssRUFBRSxLQUFLO0lBQ1osT0FBTyxFQUFFLE9BQU87SUFDaEIsS0FBSyxFQUFFLEtBQUs7Q0FDZixDQUFBO0FBcUJEO0lBT0k7UUFOUSxpQkFBWSxHQUFrQixFQUFFLENBQUM7UUFDakMsZUFBVSxHQUF3QixFQUFFLENBQUM7UUFFckMsWUFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLGNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUczQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksNEJBQU0sR0FBYjtRQUNJLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO1lBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzlDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQ3JEO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksNEJBQU0sR0FBYjtRQUNJLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2pELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQ3hEO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksd0JBQUUsR0FBVCxVQUFVLFVBQStCLEVBQUUsUUFBMEIsRUFBRSxPQUE2QjtRQUFwRyxpQkE4QkM7UUE5QnNFLHdCQUFBLEVBQUEsWUFBNkI7UUFDaEcsa0NBQWtDO1FBQ2xDLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO1FBRXBFLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3BCLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGdCQUFnQixFQUFFLEtBQUs7WUFDdkIsd0JBQXdCLEVBQUUsS0FBSztTQUNmLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFL0IsMkZBQTJGO1FBQzNGLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1lBQ25CLHNGQUFzRjtZQUN0RixJQUFJLFdBQVcsR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFkLENBQWMsQ0FBQyxDQUFBO1lBQzdELElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDM0IsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7b0JBQ2pDLEdBQUcsRUFBRSxJQUFJO29CQUNULFNBQVMsRUFBRSxFQUFFO2lCQUNoQixDQUFDLENBQUM7Z0JBQ0gsV0FBVyxHQUFHLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFBO2FBQzNDO1lBQ0Qsd0hBQXdIO1lBQ3hILHFIQUFxSDtZQUNySCxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDdkIsUUFBUSxFQUFFLFVBQUMsS0FBb0I7b0JBQzNCLE9BQU8sS0FBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFBO2dCQUN6RSxDQUFDO2dCQUNELEVBQUUsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFO2FBQzFCLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVEOzs7O09BSUc7SUFDSSx5QkFBRyxHQUFWLFVBQVcsVUFBK0IsRUFBRSxRQUEwQjtRQUF0RSxpQkFhQztRQVpHLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1lBQ25CLElBQUksV0FBVyxHQUFHLEtBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLEVBQWQsQ0FBYyxDQUFDLENBQUE7WUFDN0QsSUFBSSxXQUFXLEtBQUssU0FBUztnQkFBRSxPQUFNO1lBRXJDLDhHQUE4RztZQUM5RyxXQUFXLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDOUIsT0FBTyxLQUFLLENBQUE7aUJBQ2Y7Z0JBQ0QsT0FBTyxJQUFJLENBQUE7WUFDZixDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVEOztPQUVHO0lBQ0ksNEJBQU0sR0FBYjtRQUNJLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0sseUNBQW1CLEdBQTNCLFVBQTRCLEtBQW9CLEVBQUUsUUFBMEIsRUFBRSxPQUF3QixFQUFFLFVBQStCO1FBQXZJLGlCQWNDO1FBYkcscUVBQXFFO1FBQ3JFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU07WUFBRSxPQUFPLEtBQUssQ0FBQTtRQUM5RCxpRkFBaUY7UUFDakYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFBO1FBRXpFLG9CQUFvQjtRQUNwQixJQUFJLE9BQU8sQ0FBQyxjQUFjO1lBQUUsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25ELElBQUksT0FBTyxDQUFDLGdCQUFnQjtZQUFFLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN0RCxJQUFJLE9BQU8sQ0FBQyx3QkFBd0I7WUFBRSxLQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUV2RSxxREFBcUQ7UUFDckQsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7O09BR0c7SUFDSyxnQ0FBVSxHQUFsQixVQUFtQixLQUFvQjtRQUNuQyxrQ0FBa0M7UUFDbEMsSUFBSSxHQUFHLEdBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN6QixJQUFJLEdBQUcsSUFBSSxXQUFXLEVBQUU7WUFDcEIsWUFBWTtZQUNaLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUI7UUFDRCxtREFBbUQ7UUFDbkQsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBYixDQUFhLENBQUMsQ0FBQztRQUM1RCxJQUFJLFFBQVEsS0FBSyxTQUFTO1lBQUUsT0FBTTtRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1lBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFN0QsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztZQUN4QixvR0FBb0c7WUFDcEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN6QixJQUFJLENBQUMsS0FBSyxJQUFJO2dCQUFFLFFBQVEsR0FBRyxJQUFJLENBQUE7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDSCw2RUFBNkU7UUFDN0UsaUhBQWlIO1FBQ2pILElBQUksUUFBUTtZQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksR0FBRyxFQUFSLENBQVEsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7O09BR0c7SUFDSyw4QkFBUSxHQUFoQixVQUFpQixLQUFvQjtRQUNqQyxxRUFBcUU7UUFDckUsSUFBSSxHQUFHLEdBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUN6QixJQUFJLEdBQUcsSUFBSSxXQUFXLEVBQUU7WUFDcEIsWUFBWTtZQUNaLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUE7U0FDdkU7YUFDSTtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksR0FBRyxFQUFSLENBQVEsQ0FBQyxDQUFBO1NBQzFEO0lBQ0wsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FBQyxBQXBLRCxJQW9LQztBQXBLWSxrQ0FBVztBQXNLeEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUU5Qjs7Ozs7O0dBTUc7QUFDSCxTQUFnQixRQUFRLENBQUMsVUFBK0IsRUFBRSxRQUEwQixFQUFFLE9BQTZCO0lBQTdCLHdCQUFBLEVBQUEsWUFBNkI7SUFDL0csR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXRDLE9BQU87UUFDSCxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNqQyxDQUFDLENBQUE7QUFDTCxDQUFDO0FBTkQsNEJBTUM7QUFFRCxrQkFBZSxHQUFHLENBQUEifQ==