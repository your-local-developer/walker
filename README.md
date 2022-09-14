# 🚶🌳📁

A small and simple library for traversing nested directories.

## Usage

A very simple example:

```js
import {walk, WalkError} from '@bode.fun/walker'

for (const dirent of walk({rootPath: './node_modules'})) {
    if (dirent instanceof WalkError) {
        console.error(dirent.path)
    } else {
        // This will be a lot 🥲
        console.log(dirent.path)
    }
}

```

## 📝 License

This library is licensed under [the MIT License](https://mit-license.org/) - see the [LICENSE](LICENSE) file for details.
