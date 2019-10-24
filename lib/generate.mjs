#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules "$0" "$@"

import axios from 'axios'
import ScriptTemplate from './script-template.mjs'

;(async () => {
	const { data } = await axios.get(`https://api.alternative.me/fng/?limit=0`)
	const script = ScriptTemplate({ fngData: data.data })
	process.stdout.write(script)
})()
