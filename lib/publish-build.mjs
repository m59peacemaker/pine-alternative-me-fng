#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules "$0" "$@"

import fs from 'fs'
import path from 'path'
import publish from './publish'
const { TRADING_VIEW_USERNAME, TRADING_VIEW_PASSWORD } = process.env

const credentials = {
	username: TRADING_VIEW_USERNAME,
	password: TRADING_VIEW_PASSWORD
}

const __dirname = path.dirname(new URL(import.meta.url).pathname)

fs.promises.readFile(path.join(__dirname, '../dist/alternative-me-fng.pine'), 'utf8')
	.then(script => publish({ script, credentials, headless: false }))
