# 🚶🌳📁

A small and simple library for traversing nested directories.

## Usage

A very simple example:

```js
import {walk, WalkError} from '@bode.fun/walker'

for (const dirent of walk({rootPath: new URL('./node_modules', import.meta.url)})) {
    if (dirent instanceof WalkError) {
        console.error(dirent.path)
    } else {
        // This will be a lot 🥲
        console.log(dirent.path)
    }
}
```

Limiting the depth to only one subdirectory:

```js
import {walk, WalkError} from '@bode.fun/walker'

for (const dirent of walk({rootPath: new URL('./node_modules', import.meta.url), depth: 1})) {
    if (dirent instanceof WalkError) {
        console.error(dirent.path)
    } else {
        // This will not be as much 🥳
        console.log(dirent.path)
    }
}
```

## 📝 License

This library is licensed under [the MIT License](https://mit-license.org/) - see the [LICENSE](LICENSE) file for details.
