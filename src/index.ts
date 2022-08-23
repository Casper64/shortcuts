// Union with interface {} so all meta options are removed and we get intellisense for all the custom strings specified
// Otherstring basically stands for 'any other character key'
type OtherString = string & {}
export type ShortcutCharacter = 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|
                         'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|
                         'u'|'v'|'w'|'x'|'y'|'z'|
                         'ctrl'|'shift'|'alt'|'tab' | OtherString

// Convert the js event.key control key names to more accessable names
const shortcutMap = {
    "Control": "ctrl",
    "Alt": "alt",
    "Shift": "shift",
    "Tab": "tab"
}  

export interface ShortcutCallback {
    (event: KeyboardEvent): void;
}
interface ShortcutCallbackPrivate {
    callback: (event: KeyboardEvent) => boolean;
    id: string;
}

export interface ShortcutOptions {
    stopProppagation?: boolean;
    preventDefault?: boolean;
    stopImmediatePropagation?: boolean;
}

interface KeyListener {
    key: string;
    callbacks: ShortcutCallbackPrivate[];
}

export class ShortcutBus {
    private keyListeners: KeyListener[] = [];
    private activeKeys: ShortcutCharacter[] = [];

    private onKeyUp = this._onKeyUp.bind(this);
    private onKeyDown = this._onKeyDown.bind(this);

    constructor () {
        this.attach();
    }

    /**
     * Attach the key listening event to the window
     */
    public attach() {
        if (typeof window !== 'undefined') {
            this.detach();
            window.addEventListener("keyup", this.onKeyUp)
            window.addEventListener("keydown", this.onKeyDown)
        }
    }

    /**
     * Detach key event listening event to the window
     */
    public detach() {
        if (typeof window !== 'undefined') {
            window.removeEventListener("keyup", this.onKeyUp)
            window.removeEventListener("keydown", this.onKeyDown)
        }
    }

    /**
     * Add a callback that executes when the given shortcut is pressed
     * @param characters The characters that define the shortcut
     * @param callback The calback to be executed when the shortcut is pressed
     * @param options 
     */
    public on(characters: ShortcutCharacter[], callback: ShortcutCallback, options: ShortcutOptions = {}) {
        // Check if a shortcut is provided
        if (characters.length === 0) throw new Error("No shortcut provided")

        options = Object.assign({ 
            preventDefault: false, 
            stopProppagation: false,
            stopImmediatePropagation: false
        } as ShortcutOptions, options);
        
        // Loop over all the individual characters of the shortcut and add them to the keyListeners
        characters.forEach(char => {
            // Checking if a keyListener object for this char already exists and if not create one
            let keyListener = this.keyListeners.find(l => l.key === char)
            if (keyListener === undefined) {
                const index = this.keyListeners.push({
                    key: char,
                    callbacks: []
                });
                keyListener = this.keyListeners[index-1]
            }
            // Add a keyListener callback that provides the callback wrapped in a HOF that checks if the callback should be executed
            // Also adds an id which is equal to the stringified callback which in javascript can be used as an unique identifier
            keyListener.callbacks.push({
                callback: (event: KeyboardEvent) => {
                    return this.checkActiveShortcut(event, callback, options, characters)
                },
                id: callback.toString()
            })
        })
    }

    /**
     * Remove a callback linked to the given shortcut
     * @param characters The characters that define the shortcut
     * @param callback The calback to be executed when the shortcut is pressed
     */
    public off(characters: ShortcutCharacter[], callback: ShortcutCallback) {
        characters.forEach(char => {
            let keyListener = this.keyListeners.find(l => l.key === char)
            if (keyListener === undefined) return

            // If a keyListener for the current shortcut character is found remove the callback specified in the arguments
            keyListener.callbacks = keyListener.callbacks.filter(c => {
                if (c.id === callback.toString()) {
                    return false
                }
                return true
            })
        })
    }

    /**
     * Remove all callbacks from this event bus
     */
    public offAll() {
        this.keyListeners = [];
        this.activeKeys = [];
    }

    /**
     * Wrapper function that executes the callback when all the keys linked to the shortcut are pressed and returns false otherwise
     * @param event 
     * @param callback 
     * @param options 
     * @param characters 
     * @returns Whether the callback was executed
     */
    private checkActiveShortcut(event: KeyboardEvent, callback: ShortcutCallback, options: ShortcutOptions, characters: ShortcutCharacter[]) {
        // Check if the number of keys pressed is equal to the shorcut length
        if (this.activeKeys.length !== characters.length) return false
        // Check if all the keys that are pressed are also the characters of the shortcut
        if (!characters.every(key => this.activeKeys.includes(key))) return false

        // Apply all options
        if (options.preventDefault) event.preventDefault();
        if (options.stopProppagation) event.stopPropagation();
        if (options.stopImmediatePropagation) event.stopImmediatePropagation();

        // Then execute the callback and inject the key event
        callback(event);
        return true;
    }

    /**
     * Private onKeyDown eventListener
     * @param event 
     */
    private _onKeyDown(event: KeyboardEvent) {
        // Map event.key to "ShortcutKeys"
        let key: any = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            key = shortcutMap[key];
        }
        // Create a keyListener if it doesn't exist already
        const listener = this.keyListeners.find(l => l.key === key);
        if (listener === undefined) return
        if (!this.activeKeys.includes(key)) this.activeKeys.push(key)

        let executed = false;
        listener.callbacks.forEach(c => {
            // Execute the keyListener callback which returns true if the callback was executed and false if not
            let r = c.callback(event)
            if (r === true) executed = true
        });
        // If the callback was executed we mark the last pressed key to "not pressed"
        // I choose to do this so the callback isn't executed when a key is held down (this only applies to control keys)
        if (executed) this.activeKeys = this.activeKeys.filter(k => k != key);
    }

    /**
     * Private onKeyUp eventListener
     * @param event 
     */
    private _onKeyUp(event: KeyboardEvent) {
        // Find the key in the activeKeys list and mark them as "not pressed"
        let key: any = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            this.activeKeys = this.activeKeys.filter(k => k != shortcutMap[key])
        }
        else {
            this.activeKeys = this.activeKeys.filter(k => k != key)
        }
    }
}

const bus = new ShortcutBus();

/**
 * Add a callback that executes when the given shortcut is pressed
 * @param characters The characters that define the shortcut
 * @param callback The calback to be executed when the shortcut is pressed
 * @param options 
 * @returns The off listener function
 */
export function shortcut(characters: ShortcutCharacter[], callback: ShortcutCallback, options: ShortcutOptions = {}) {
    bus.on(characters, callback, options);

    return () => {
        bus.off(characters, callback)
    }
}

export default bus