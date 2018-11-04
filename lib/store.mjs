import fs from 'fs'
import path from 'path'
import jsYaml from 'js-yaml'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const storeFile = path.join(__dirname, '../fng.yaml')
const { safeDump: jsonToYaml, safeLoad: yamlToJson } = jsYaml

const store = {
	get: () => fs.promises.readFile(storeFile).then(yaml => yamlToJson(yaml)),
	append: entry => fs.promises.appendFile(storeFile, jsonToYaml([ entry ]))
}

export default store
