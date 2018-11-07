import pkg from '../package.json'
import * as pine from './pine'

const ScriptTemplate = ({ fngData }) => {
	const fngYearsMap = fngData
	.map(({ value, timestamp }) => {
		const date = new Date(timestamp)
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate()
		return { year, month, day, value }
	})
	.reduce((yearsMap, { year, month, day, value }) => {
		yearsMap[year] = yearsMap[year] || {}
		yearsMap[year][month] = yearsMap[year][month] || {}
		yearsMap[year][month][day] = { value }
		return yearsMap
	}, {})

const monthMapToCondition = monthMap => Object.entries(monthMap).reverse()
  .map(([ day, { value }]) => `dayofmonth == ${day} ? ${value}`)
	.concat('na')
	.join(`\n${' '.repeat(9)}: `)

const yearMapToCondition = yearMap => Object.entries(yearMap).reverse()
  .map(([ month, monthMap ]) => `month == ${month} ?\n${' '.repeat(9)}(${monthMapToCondition(monthMap)})`)
	.concat('na')
	.join(`\n${' '.repeat(6)}: `)

const yearsMapToCondition = yearsMap => Object.entries(yearsMap).reverse()
	.map(([ year, yearMap ]) => `year == ${year} ?\n${' '.repeat(6)}(${yearMapToCondition(yearMap)})`)
	.concat('na')
	.join('\n   : ')

const fngValueCondition = yearsMapToCondition(fngYearsMap)

return `
//@version=3
study("alternative.me Crypto Fear & Greed Index [m59]", shorttitle="AltMe FnG", precision=0)

${pine.comment(
`
This script was generated from ${pkg.repository.url}

Issues? ${pkg.bugs}


----- DESCRIPTION

Crypto Fear & Greed Index is produced by [alternative.me](https://alternative.me/crypto/fear-and-greed-index/).
This script is authored by [@m59](https://www.tradingview.com/u/m59/),
inpsired by [@bigurb](https://www.tradingview.com/u/bigurb/),
and maintained and updated by me with permission.

alternative.me description:
-------------------
The crypto market behaviour is very emotional. People tend to get greedy when the market is rising which results in FOMO (Fear of missing out). Also, people often sell their coins in irrational reaction of seeing red numbers. With our Fear and Greed Index, we try to save you from your own emotional overreations. There are two simple assumptions:

Extreme fear can be a sign that investors are too worried. That could be a buying opportunity.
When Investors are getting too greedy, that means the market is due for a correction.
Therefore, we analyze the current sentiment of the Bitcoin market and crunch the numbers into a simple meter from 0 to 100. Zero means "Extreme Fear", while 100 means "Extreme Greed".

See [alternative.me](https://alternative.me/crypto/fear-and-greed-index/) for further information.
`)}


//----- VALUES

fngValue = ${fngValueCondition}


//----- RENDER

color_neutral = #222222
color_veryExtremeGreed = #6AFF00
color_extremeGreed = #63A924
color_extremeFear = #D35400
color_veryExtremeFear = #FE4E00

fngColor = fngValue >= 90 ? color_veryExtremeGreed
   : fngValue >= 75 ? color_extremeGreed
   : fngValue <= 10 ? color_veryExtremeFear
   : fngValue <= 25 ? color_extremeFear
   : color_neutral

hline(90, title="Very Extreme Greed", color=color_veryExtremeGreed, linewidth=1, linestyle=dotted)
hline(75, title="Extreme Greed",      color=color_extremeGreed, linewidth=1, linestyle=dotted)
hline(25, title="Extreme Fear",       color=color_extremeFear, linewidth=1, linestyle=dotted)
hline(10, title="Very Extreme Fear",  color=color_veryExtremeFear, linewidth=1, linestyle=dotted)

plot(fngValue, linewidth=3, color=fngColor)
`
}

export default ScriptTemplate
