#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules "$0" "$@"

import getFngData from './get-fng-data'
import ScriptTemplate from './script-template'

getFngData()
	.then(fngData => {
		const script = ScriptTemplate({ fngData })
		process.stdout.write(script)
	})
