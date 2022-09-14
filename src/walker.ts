import {readdirSync} from 'node:fs'
import type {ObjectEncodingOptions, Dirent as NodeDirent} from 'node:fs'
import {join, normalize} from 'node:path'
import {fileURLToPath} from 'node:url'

/**
 * This is additional metadata about a dirent.
 */
export type DirentMetaData = {
	/** The depth of the directory being traversed. */
	readonly depth: number;
	/** The path of the dirent. */
	readonly path: string;
}

/**
 * These are options for constructing a WalkError.
 */
export type WalkErrorOptions = {
	/** Wrapped error */
	readonly error: unknown;
} & DirentMetaData

/**
 * If an error is thrown while traversing a directory, it is wrapped in a WalkError.
 * A WalkError contains the original error of an `unknown` type and the metadata defined in the type `DirentMetaData`.
 */
export class WalkError extends Error implements DirentMetaData {
	override name = 'WalkError'
	depth: number
	path: string
	/** The original error */
	error: unknown
	constructor({depth, error, path}: WalkErrorOptions) {
		super(`Failed to walk path "${path}"`)
		this.error = error
		this.path = path
		this.depth = depth
	}
}

/**
 * These are options for constructing a Dirent.
 */
export type DirentOptions = {
	/** Wrapped dirent */
	readonly dirent: NodeDirent;
} & DirentMetaData

/**
 * This is a small wrapper around node's `Dirent` to provide it's absolute path.
 */
export class Dirent implements NodeDirent, DirentMetaData {
	depth: number
	name: string
	/** Internal dirent */
	#dirent: NodeDirent
	path: string

	constructor({depth, dirent, path}: DirentOptions) {
		this.path = path
		this.#dirent = dirent
		this.name = dirent.name
		this.depth = depth
	}

	isFile(): boolean {
		return this.#dirent.isFile()
	}

	isDirectory(): boolean {
		return this.#dirent.isDirectory()
	}

	isBlockDevice(): boolean {
		return this.#dirent.isBlockDevice()
	}

	isCharacterDevice(): boolean {
		return this.#dirent.isCharacterDevice()
	}

	isSymbolicLink(): boolean {
		return this.#dirent.isSymbolicLink()
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	isFIFO(): boolean {
		return this.#dirent.isFIFO()
	}

	isSocket(): boolean {
		return this.#dirent.isSocket()
	}
}

/**
 * These are options for the walk function.
 */
export type WalkOptions = {
	/** The path to the directory start traversing from. */
	rootPath: string | URL;
	/** The maximum depth to traverse. Providing a 0 means that it will only walk the given directory. */
	depth?: number;
} & ObjectEncodingOptions

/**
 * Recursively traverse a directory and yield all it's dirents (files and directories) and errors.
 *
 * @param options Options for the walk function.
 */
export function * walk(
	options: WalkOptions,
): IterableIterator<Dirent | WalkError> {
	yield * walkInternal(options, 0)
}

/**
 * This is the internal part of the walker function.
 * It is hidden to provide a good api for the user.
 *
 * @param options Options for the walk function.
 * @param currentDepth used for stopping the recursion.
 * @throws {TypeError} if `options.path` is not a string nor a URL.
 */
function * walkInternal(
	options: WalkOptions,
	currentDepth: number,
): IterableIterator<Dirent | WalkError> {
	// This can throw an error if the path is not a string nor a URL.
	const currentPath = options.rootPath instanceof URL
		? fileURLToPath(options.rootPath)
		: normalize(options.rootPath) // On Windows: C:/Users/jan/Projekte to C:\Users\jan\Projekte

	// Read files and directories
	let currentDirents: NodeDirent[] = []
	try {
		currentDirents = readdirSync(currentPath, {
			...options,
			withFileTypes: true,
		})
	} catch (error: unknown) {
		yield new WalkError({
			path: currentPath,
			error,
			depth: currentDepth,
		})
	}

	// Loop through all files and directories in the current directory
	for (const dirent of currentDirents) {
		// Yield dirent... can be file or directory
		const path = join(currentPath, dirent.name)
		yield new Dirent({
			path,
			dirent,
			depth: currentDepth,
		})
		// Recursively traverse the directory until the desired depth is reached
		if (dirent.isDirectory() && (options.depth === undefined || currentDepth < options.depth)) {
			// The constant `path` is now the path to the next directory
			// Start recursion. Read the next directories and yield all following dirents
			// No need to wrap this call in a try-catch-block, since any error that can occur would already have been yielded by the first try-catch-block
			yield * walkInternal({
				...options,
				rootPath: path,
			}, currentDepth + 1)
		}
	}
}
