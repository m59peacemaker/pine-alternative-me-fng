#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules --abort-on-uncaught-exception "$0" "$@"

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import publish from './publish.mjs'
const { TRADINGVIEW_USERNAME, TRADINGVIEW_PASSWORD, CI } = process.env

const credentials = {
	username: TRADINGVIEW_USERNAME,
	password: TRADINGVIEW_PASSWORD
}

const __dirname = path.dirname(new URL(import.meta.url).pathname)

;(async () => {
	const script = await fs.promises.readFile(path.join(__dirname, '../dist/alternative-me-fng.pine'), 'utf8')
	const { data } = await axios.get(`https://api.alternative.me/fng`)
	const fngLatestRecord = data.data[0]
	await publish({
		script,
		description: `Latest Value: ${fngLatestRecord.value}`,
		credentials,
		interactive: CI !== "true"
	})
})()
