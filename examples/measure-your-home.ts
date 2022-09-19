import {homedir} from 'node:os'
import {pathToFileURL} from 'node:url'
import {walk, WalkError} from '../dist/walker.js'

console.log(`💡 Measuring ${homedir()}`)
let currentMaxDepth = 0
for (const entry of walk({rootPath: new URL('.', pathToFileURL(homedir()))})) {
	if (entry instanceof WalkError) {
		if (entry.error instanceof Error) {
			console.error(`🥲 Error: ${entry.error.message}`)
		}
	} else if (!entry.isDirectory() && entry.depth > currentMaxDepth) {
		currentMaxDepth = entry.depth
	}
}

console.log(`Your 🏡 is ${currentMaxDepth} levels deep.`)
