declare type OtherString = string & {};
export declare type ShortcutCharacter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'ctrl' | 'shift' | 'alt' | 'tab' | OtherString;
export interface ShortcutCallback {
    (event: KeyboardEvent): void;
}
export interface ShortcutOptions {
    callback: ShortcutCallback;
    stopProppagation?: boolean;
    preventDefault?: boolean;
}
export declare class ShortcutBus {
    private keyListeners;
    private activeKeys;
    private onKeyUp;
    private onKeyDown;
    constructor();
    attach(): void;
    detach(): void;
    on(options: ShortcutOptions, ...characters: ShortcutCharacter[]): void;
    off(callback: ShortcutCallback, ...characters: ShortcutCharacter[]): void;
    offAll(): void;
    private checkActiveShortcut;
    private _onKeyDown;
    private _onKeyUp;
}
export declare class Shortcut {
    private activeKeys;
    private options;
    private characters;
    private onKeyUp;
    private onKeyDown;
    constructor(options: ShortcutOptions, ...characters: ShortcutCharacter[]);
    attach(): void;
    detach(): void;
    private _onKeyDown;
    private _onKeyUp;
}
declare const bus: ShortcutBus;
export default bus;
