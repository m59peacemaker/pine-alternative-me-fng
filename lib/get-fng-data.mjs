import R from 'ramda'
import store from './store'
import scrapeFngValue from './scrape-fng-value'

const timestampOfLast = R.compose(R.prop('timestamp'), R.last)

const getFngData = () => Promise.all([
	store.get(),
	scrapeFngValue()
])
	.then(([ storedRecords, newRecord ]) => {
		const storeIsStale = timestampOfLast(storedRecords) !== R.prop('timestamp', newRecord)
		return storeIsStale
			? store.append(newRecord).then(() => R.append(newRecord, storedRecords))
			: storedRecords
	})

export default getFngData
