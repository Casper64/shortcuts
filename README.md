# shortcuts
Simple shortcut library made by Casper Kuethe

## Installation
```
npm install https://github.com/Casper64/shortcuts
```

## Usage
In this example we register a shortcut that will be executed when the ctrl+s key are pressed and that prevents the default eventHandler to be executed.

```ts
import Shortcuts from '@cetfox24/shortcuts'

function save(event: KeyboardEvent) {
  // Do important stuff...
}

// Register the shortcut
Shortcuts.on(["ctrl", "s"], save, {
  preventDefault: true
})
// Unregister the shortcut
Shortcuts.off(["ctrl", "s"], save);

// Or
import { shortcut } from "@cetfox24/shortcuts";

// Register the shortcut
const off = shortcut(["ctrl", "s"], save, {
  preventDefault: true
});
// Unregister the shortcut
off();

```
You will get autocomplete on some values that are hard-typed, but you can use any value equal to `Event.key`

## API Class ShortcutBus
The export default value has the type `ShortcutBus`
```ts
import { ShortcutBus } from '@cetfox24/shortcuts'
```

Add a callback when the specified characters are all pressed
```ts
ShortcutBus.on(characters: ShortcutCharacter[], callback: ShortcutCallback, options: ShortcutOptions = {}): void
```
Remove a callback
```ts
ShortcutBus.off(characters: ShortcutCharacter[], callback: ShortcutCallback): void
```
Remove all callbacks from the bus
```ts
ShortcutBus.offAll()
```

The keyup and keydown events are initiated on construction if the window object is defined. Call `ShortcutBus.attach()` to attach all eventListeners to the window object.
And use `ShortcutBus.detach()` to detach the eventListeners from the window object.

## API function shortcut
This function registers a shortcut on the default ShortcutBus and returns a function which will remove the shortcut from the bus when executed.
```ts
import { shortcut } from '@cetfox24/shortcuts'

const off = shortcut(characters: ShortcutCharacter[], callback: ShortcutCallback, options: ShortcutOptions = {});
```

The keyup and keydown events are initiated on construction if the window object is defined. Call `Shortcut.attach()` to attach all eventListeners to the window object.
And use `Shortcut.detach()` to detach the eventListeners from the window object.

## Other API

ShortcutCharacter
```ts
// To keep track of metadeta so autocomplete will work
type OtherString = string & {}
type ShortcutCharacter = 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|
                         'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|
                         'u'|'v'|'w'|'x'|'y'|'z'|
                         'ctrl'|'shift'|'alt'|'tab' | OtherString
```          
ShortcutCallback
```ts
interface ShortcutCallback {
  (event: KeyboardEvent): void
}
```              
ShortcutOptions
```ts
interface ShortcutOptions {
  stopProppagation?: boolean;
  preventDefault?: boolean;
  stopImmediatePropagation?: boolean;
}
```
