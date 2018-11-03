#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node --experimental-modules "$0" "$@"

import path from 'path'
import got from 'got'
import R from 'ramda'
import jsdom from 'jsdom'
import Keyv from 'keyv'
import KeyvFile from 'keyv-file'
import pkg from './package.json'
import * as pine from './pine'
const { JSDOM } = jsdom

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const fngStore = new Keyv({
	store: new KeyvFile({
		filename: path.join(__dirname, '/data/fng'),
		expiredCheckDelay: 0
	})
})

const parseFngFromHtml = html =>  {
	const { window } = new JSDOM(html)
	const recentFng = window.document.querySelector('.fng-secondary')
	return {
		value: recentFng.querySelector('.fng-value .fng-circle').textContent,
		timestamp: new Date(recentFng.querySelector('.fng-footer').textContent.split(': ')[1])
			.toISOString()
	}
}

const timestampOfTail = R.compose(R.prop('timestamp'), R.last)

const Script = ({ fngData }) => `
//@version=3
study("Alternative Me Fear & Greed Index [m59]", shorttitle="FnG", precision=0)

${pine.comment(
`
This script was generated from ${pkg.repository.url}

Issues? ${pkg.bugs}


----- DESCRIPTION



----- PRINTED VALUES


----- OPTIONS


//----- INPUTS


//----- HELPERS
`)}

//----- VALUES

fngValue = ${fngData.map(({ value, timestamp }) => {
	const date = new Date(timestamp)
	return `(year == ${date.getYear()} and month == ${date.getMonth()} and day == ${date.getDay()}) ? ${value}`
})}

//----- RENDER

hline(90, title="Very Extreme Greed", color=maroon, linewidth=1, style=circles, transp=30)
hline(75, title="Extreme Greed", color=red, linewidth=1, style=circles, transp=30)
hline(25, title="Extreme Fear", color=green, linewidth=1, style=circles, transp=30)
hline(10, title="Very Extreme Fear", color=lime, linewidth=1, style=circles, transp=30)

plot(fngValue)
`

got(`https://alternative.me/crypto/fear-and-greed-index/`)
	.then(({ body }) => Promise.all([ parseFngFromHtml(body), fngStore.get('fng') ]))
	.then(([ fngEntry, fngData = [] ]) => {
		const data = timestampOfTail(fngData) === fngEntry.timestamp
			? fngData
			: R.append(fngEntry, fngData)
		return fngStore.set('fng', data).then(() => data)
	})
	.then(fngData => process.stdout.write(Script({ fngData })))
