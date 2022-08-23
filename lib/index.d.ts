declare type OtherString = string & {};
export declare type ShortcutCharacter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'ctrl' | 'shift' | 'alt' | 'tab' | OtherString;
export interface ShortcutCallback {
    (event: KeyboardEvent): void;
}
export interface ShortcutOptions {
    stopProppagation?: boolean;
    preventDefault?: boolean;
    stopImmediatePropagation?: boolean;
}
export declare class ShortcutBus {
    private keyListeners;
    private activeKeys;
    private onKeyUp;
    private onKeyDown;
    constructor();
    /**
     * Attach the key listening event to the window
     */
    attach(): void;
    /**
     * Detach key event listening event to the window
     */
    detach(): void;
    /**
     * Add a callback that executes when the given shortcut is pressed
     * @param characters The characters that define the shortcut
     * @param callback The calback to be executed when the shortcut is pressed
     * @param options
     */
    on(characters: ShortcutCharacter[], callback: ShortcutCallback, options?: ShortcutOptions): void;
    /**
     * Remove a callback linked to the given shortcut
     * @param characters The characters that define the shortcut
     * @param callback The calback to be executed when the shortcut is pressed
     */
    off(characters: ShortcutCharacter[], callback: ShortcutCallback): void;
    /**
     * Remove all callbacks from this event bus
     */
    offAll(): void;
    /**
     * Wrapper function that executes the callback when all the keys linked to the shortcut are pressed and returns false otherwise
     * @param event
     * @param callback
     * @param options
     * @param characters
     * @returns Whether the callback was executed
     */
    private checkActiveShortcut;
    /**
     * Private onKeyDown eventListener
     * @param event
     */
    private _onKeyDown;
    /**
     * Private onKeyUp eventListener
     * @param event
     */
    private _onKeyUp;
}
declare const bus: ShortcutBus;
/**
 * Add a callback that executes when the given shortcut is pressed
 * @param characters The characters that define the shortcut
 * @param callback The calback to be executed when the shortcut is pressed
 * @param options
 * @returns The off listener function
 */
export declare function shortcut(characters: ShortcutCharacter[], callback: ShortcutCallback, options?: ShortcutOptions): () => void;
export default bus;
