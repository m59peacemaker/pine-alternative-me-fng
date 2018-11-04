#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules "$0" "$@"

import fs from 'fs'
import path from 'path'
import R from 'ramda'
import ScriptTemplate from './script-template'
import scrapeFngValue from './scrape-fng-value'
import store from './store'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const timestampOfLast = R.compose(R.prop('timestamp'), R.last)

Promise.all([
	store.get(),
	scrapeFngValue()
])
	.then(([ storedRecords, newRecord ]) => {
		const storeIsStale = timestampOfLast(storedRecords) !== R.prop('timestamp', newRecord)
		return storeIsStale
			? store.append(newRecord).then(() => R.append(newRecord, storedRecords))
			: storedRecords
	})
	.then(fngData => {
		const script = ScriptTemplate({ fngData })
		process.stdout.write(script)
	})
	.catch(console.log)
