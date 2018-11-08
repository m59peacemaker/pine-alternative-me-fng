#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules "$0" "$@"

import fngData from 'data-alternative-me-fng'
import ScriptTemplate from './script-template'

const script = ScriptTemplate({ fngData })
process.stdout.write(script)
