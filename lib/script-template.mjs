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


`)}


//----- INPUTS


//----- HELPERS


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
