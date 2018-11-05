#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules "$0" "$@"

import fs from 'fs'
import path from 'path'
import publish from './publish'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const credentials = {
	username: '{TRADING_VIEW_USERNAME}',
	password: '{TRADING_VIEW_PASSWORD}'
}

fs.promises.readFile(path.join(__dirname, '../dist/alternative-me-fng.pine'))
	.then(script => publish({ script, credentials, headless: false }))
