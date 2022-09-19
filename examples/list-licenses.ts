import {readFile} from 'node:fs/promises'
import {walk, WalkError} from '../dist/walker.js'

const packagesPerLicense = new Map<string, number>()
const nodeModulesFolder = new URL('../node_modules', import.meta.url)
const unlicensedPackages = new Map<string, string>()

for (const entry of walk({rootPath: nodeModulesFolder, depth: 2})) {
	if (entry instanceof WalkError) {
		if (entry.error instanceof Error) {
			console.error(`🥲 Error: ${entry.error.message}`)
		}
	} else if (!entry.isDirectory() && entry.name === 'package.json') {
		try {
			// eslint-disable-next-line no-await-in-loop
			const packageJsonBuffer = await readFile(entry.path)
			const packageJson = packageJsonBuffer.toString()
			const {name, license} = JSON.parse(packageJson) as {name: string | undefined; license: string | undefined}

			if (typeof license === 'string') {
				packagesPerLicense.set(license, (packagesPerLicense.get(license) ?? 0) + 1)
			} else if (typeof name === 'string') {
				unlicensedPackages.set(name, entry.path)
			}
		} catch {
			console.error(`🥲 Error: Not able to parse ${entry.path}`)
		}
	}
}

console.log(`💡 Your projects uses ${packagesPerLicense.size} different licenses.`)
let amountOfLicensedPackages = 0
for (const [license, numberOfPackages] of packagesPerLicense) {
	console.log(`📝 ${license}: ${numberOfPackages} packages`)
	amountOfLicensedPackages += numberOfPackages
}

console.log(`💡 ${amountOfLicensedPackages} packages are licensed via a SPDX expression.\n`)

console.log(`⚠️ No license field for ${unlicensedPackages.size} packages`)
for (const [unlicensedPackage, path] of unlicensedPackages) {
	console.log(`📦 ${unlicensedPackage} at ${path}`)
}
