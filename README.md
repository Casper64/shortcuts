# shortcuts
Simple shortcut library made by Casper Kuethe

## Installation
`npm install @cetfox24/shortcuts`

## Usage
```ts
import Shortcuts from '@cetfox24/shortcuts'

const options = {
  callback () {
    // callback code
  }
}

// Add as many characters ass you want 
Shortcuts.on(options, "ctrl", "s", "a")
// Or
const characters = ["ctrl", "s", "a"]
Shortcuts.on(options, ...characters)
```

## Examples
Add an on save (ctrl+s) shortcut
```ts
import Shortcuts from '@cetfox24/shortcuts'

Shortcuts.on({
    callback () {
        console.log("save")
    }
}, "ctrl", "s")
// ------- or -------
import { Shortcut } from '@cetfox24/shortcuts'

new Shortcut({
    callback () {
        console.log("save")
    }
}, "ctrl", "s")
```

## API Class ShortcutBus
```ts
import { ShortcutBus } from '@cetfox24/shortcuts'

// The callback interface for all listeners
interface ShortcutCallback {
    (event: KeyboardEvent): void
}
// Options interface
interface ShortcutOptions {
    callback: ShortcutCallback
    stopProppagation?: boolean
    preventDefault?: boolean
}
```

Add a callback when the specified characters are all pressed
```ts
ShortcutBus.on(options: ShortcutOptions, ...characters: ShortcutCharacter[])
```
Remove a callback
```ts
ShortcutBus.off(callback: ShortcutCallback, ...characters: ShortcutCharacter[])
```
Remove all callbacks
```ts
ShortcutBus.offAll()
```

The keyup and keydown events are initiated on construction if the window object is defined. Call `ShortcutBus.attach()` to attach all eventListeners to the window object.
And use `ShortcutBus.detach()` to detach the eventListeners from the window object.

## API Class Shortcut
`Shortcut` constructor see `ShortcutBus.on`
```ts
import { Shortcut } from '@cetfox24/shortcuts'

new Shortcut(options: ShortcutOptions, ...characters: ShortcutCharacter[])
```

The keyup and keydown events are initiated on construction if the window object is defined. Call `Shortcut.attach()` to attach all eventListeners to the window object.
And use `Shortcut.detach()` to detach the eventListeners from the window object.
