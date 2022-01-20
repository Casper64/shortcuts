
export type ShortcutCharacter = 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|
                         'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|
                         'u'|'v'|'w'|'x'|'y'|'z'|
                         'ctrl'|'shift'|'alt'|'tab'

const shortcutMap = {
    "Control": "ctrl",
    "Alt": "alt",
    "Shift": "shift",
    "Tab": "tab"
}  


export interface ShortcutCallback {
    (event: KeyboardEvent): void
}
interface ShortcutCallbackPrivate {
    (event: KeyboardEvent): boolean
}

export interface ShortcutOptions {
    callback: ShortcutCallback
    stopProppagation?: boolean
    preventDefault?: boolean
}

export interface KeyListener {
    key: string
    callbacks: ShortcutCallbackPrivate[]
}

export class ShortcutBus {
    private keyListeners: KeyListener[] = []
    private activeKeys: ShortcutCharacter[] = []

    private onKeyUp = this._onKeyUp.bind(this);
    private onKeyDown = this._onKeyDown.bind(this);

    constructor () {
        if (typeof window !== 'undefined') {
            window.addEventListener("keyup", this.onKeyUp)
            window.addEventListener("keydown", this.onKeyDown)
        }
    }

    public attach() {
        if (typeof window !== 'undefined') {
            window.addEventListener("keyup", this.onKeyUp)
            window.addEventListener("keydown", this.onKeyDown)
        }
    }

    public detach() {
        if (typeof window !== 'undefined') {
            window.removeEventListener("keyup", this.onKeyUp)
            window.removeEventListener("keydown", this.onKeyDown)
        }
    }

    public on(options: ShortcutOptions, ...characters: ShortcutCharacter[]) {
        if (characters.length === 0) throw new Error("No shortcut provided")
        options = { preventDefault: true, stopProppagation: true, ...options }
        
        characters.forEach(char => {
            let keyListener = this.keyListeners.find(l => l.key === char)
            if (keyListener === undefined) {
                const index = this.keyListeners.push({
                    key: char,
                    callbacks: []
                });
                keyListener = this.keyListeners[index-1]
            }
            keyListener.callbacks.push((event: KeyboardEvent) => {
                return this.checkActiveShortcut(event, options, characters)
            })
        })
    }

    public off(callback: ShortcutCallback, ...characters: ShortcutCharacter[]) {
        characters.forEach(char => {
            let keyListener = this.keyListeners.find(l => l.key === char)
            if (keyListener === undefined) return

            keyListener.callbacks = keyListener.callbacks.filter(c => {
                if (c.toString() === callback.toString()) {
                    return false
                }
                return true
            })
        })
    }

    public offAll() {
        this.keyListeners = [];
        this.activeKeys = [];
    }

    private checkActiveShortcut(event: KeyboardEvent, options: ShortcutOptions, characters: ShortcutCharacter[]) {
        if (this.activeKeys.length !== characters.length) return false
        if (!characters.every(key => this.activeKeys.includes(key))) return false

        if (options.preventDefault) event.preventDefault();
        if (options.stopProppagation) event.stopPropagation();

        options.callback(event);
        return true;
    }

    private _onKeyDown(event: KeyboardEvent) {
        let key: any = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            key = shortcutMap[key];
        }
        
        const listener = this.keyListeners.find(l => l.key === key);
        if (listener === undefined) return
        if (!this.activeKeys.includes(key)) this.activeKeys.push(key)

        let executed = false;
        listener.callbacks.forEach(c => {
            let r = c(event)
            if (r === true) executed = true
        });
        if (executed) this.activeKeys = [];
    }

    private _onKeyUp(event: KeyboardEvent) {
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

export class Shortcut {
    private activeKeys: ShortcutCharacter[] = []
    private options: ShortcutOptions
    private characters: ShortcutCharacter[]

    private onKeyUp = this._onKeyUp.bind(this);
    private onKeyDown = this._onKeyDown.bind(this);

    constructor(options: ShortcutOptions, ...characters: ShortcutCharacter[]) {
        this.options = { preventDefault: true, stopProppagation: true, ...options }
        this.characters = characters
        window.addEventListener('keydown', this.onKeyDown)
        window.addEventListener('keyup', this.onKeyUp)
    }

    public detach() {
        window.removeEventListener('keydown', this.onKeyDown)
        window.removeEventListener('keyup', this.onKeyUp)
    }

    private _onKeyDown(event: KeyboardEvent) {
        let key: any = event.key;
        if (key in shortcutMap) {
            //@ts-ignore
            if (!this.activeKeys.includes(shortcutMap[key])) this.activeKeys.push(shortcutMap[key])
        }
        else if (!this.activeKeys.includes(key)) {
            this.activeKeys.push(key)
        }
        if (this.activeKeys.length !== this.characters.length)  return

        if (!this.characters.every(k => this.activeKeys.includes(k))) return

        if (this.options.preventDefault) event.preventDefault();
        if (this.options.stopProppagation) event.stopPropagation();

        this.options.callback(event);
        this.activeKeys = [];
    }

    private _onKeyUp(event: KeyboardEvent) {
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

export default bus