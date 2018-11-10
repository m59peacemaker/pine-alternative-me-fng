#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules --abort-on-uncaught-exception "$0" "$@"

import fs from 'fs'
import path from 'path'
import fngData from 'data-alternative-me-fng'
import publish from './publish'
const { TRADINGVIEW_USERNAME, TRADINGVIEW_PASSWORD, CI } = process.env

const fngLatestRecord = fngData.slice(-1)[0]

const credentials = {
	username: TRADINGVIEW_USERNAME,
	password: TRADINGVIEW_PASSWORD
}

const __dirname = path.dirname(new URL(import.meta.url).pathname)

console.log(CI, typeof CI)
fs.promises.readFile(path.join(__dirname, '../dist/alternative-me-fng.pine'), 'utf8')
	.then(script => publish({
		script,
		description: `Latest Value: ${fngLatestRecord.value}`,
		credentials,
		headless: CI === "true"
	}))
	.catch(error => {
		console.log(error)
		process.exit(1)
	})
