import puppeteer from 'puppeteer'

const clear = async (page, selector) => {
	await page.focus(selector)
	await page.keyboard.down('Control')
	await page.keyboard.press('KeyA')
	await page.keyboard.up('Control')
	await page.keyboard.press('Backspace')

	/* await page.evaluate(selector => document.querySelector(selector).value = '', selector) */
	/* await page.focus(selector) */
	/* await page.type(selector, ' ') */
	/* const elementHandle = await page.$(selector) */
	/* await elementHandle.press('Backspace') */

	/* await elementHandle.click() */
	/* await elementHandle.focus() */
	/* await elementHandle.click({clickCount: 3}) // click three times to select all */
	/* await elementHandle.press('Backspace') */
}

const forcefullyInputValue = async (page, selector, value) => {
	await page.evaluate(
		(selector, value) => document.querySelector(selector).value = value,
		selector, value
	)
	await page.type(selector, ' ') // trigger update
	const elementHandle = await page.$(selector)
	await elementHandle.press('Backspace') // remove added space
}

const isVisible = (page, selector) => page.evaluate(
	selector => {
		const e = document.querySelector(selector)
		if (!e) {
			return false
		}
		const style = window.getComputedStyle(e)
		return style
			&& style.display !== 'none'
			&& style.visibility !== 'hidden'
			&& style.opacity !== '0'
	},
	selector
)

const waitForSelectorNotFound = (page, selector) => page.waitForFunction(
	selector => document.querySelector(selector) === null,
	{},
	selector
)

const waitForElementAttributeValue = (page, selector, attributeName, value) => page.waitForFunction(
	(selector, attributeName, value) => {
		const element = document.querySelector(selector)
		if (!element) {
			throw new Error(`no elements found matching selector "${selector}"`)
		}
		return element.getAttribute(attributeName) === value
	},
	{},
	toggleEditorButtonSelector, attributeName, value
)

const elementGetAttribute = (page, selector, attributeName) => page.evaluate(
	(selector, attributeName) => {
		const element = document.querySelector(selector)
		if (!element) {
			throw new Error(`no elements found matching selector "${selector}"`)
		}
		return element.getAttribute(attributeName)
	},
	selector, attributeName
)

const origin = 'https://www.tradingview.com'
const rememberMeCheckboxSelector = '#signin-form input[name="remember"]'
const toggleEditorButtonSelector = '[data-name="scripteditor"]'
const editorSelector = '#editor'
const editorTextareaSelector = '#editor .ace_text-input'
const addScriptButtonSelector = '.tv-script-controls .tv-script-add-button'
const publishTitleSelector = '.js-publication-title input'

const publish = async ({ credentials, script, description = "", interactive = false }) => {
	const browser = await puppeteer.launch({
		args: [ '--no-sandbox', '--disable-setuid-sandbox' ], // to make it work on Travis CI
		headless: !interactive,
		defaultViewport: { height: 800, width: 1200 }
	})
	const page = await browser.newPage()

	// LOGIN
	await page.goto(`${origin}/#signin`)
	await page.type('#signin-form input[name="username"]', credentials.username)
	await page.type('#signin-form input[name="password"]', credentials.password)
	;(await elementGetAttribute(page, rememberMeCheckboxSelector, 'checked'))
		|| (await page.click(rememberMeCheckboxSelector))
	await Promise.all([
		page.waitForResponse(response =>
			response.url() === `${origin}/accounts/signin/`
				&& response.status() === 200
		),
		page.click('#signin-form button[type="submit"]')
	])

	// PREPARE CHART
	await page.goto(`${origin}/chart/?symbol=BITMEX:XBTUSD`)
	await page.waitForSelector('.chart-widget', { visible: true })
	await page.evaluate(() => {
		const chart = _exposed_chartWidgetCollection.activeChartWidget.value()
		chart.removeAllStudiesDrawingTools()
		chart.setResolution('D')
		chart.GUIResetScales()
	})
	await waitForSelectorNotFound(page, '.study')

	await page.waitForSelector(toggleEditorButtonSelector, { visible: true })

	// INJECT INDICATOR SCRIPT
	if ((await elementGetAttribute(page, toggleEditorButtonSelector, 'data-active')) === "false") {
		await page.click(toggleEditorButtonSelector)
		await Promise.all([
			page.waitForSelector(editorSelector, { visible: true }),
			waitForElementAttributeValue(page, toggleEditorButtonSelector, 'data-active', 'true')
		])
	}

	await page.waitForSelector(editorTextareaSelector)
	await clear(page, editorTextareaSelector)
	await forcefullyInputValue(page, editorTextareaSelector, script)

	// ADD INDICATOR TO CHART
	await page.click(addScriptButtonSelector)
	await page.waitForSelector('.study', { visible: true })
	await page.waitForFunction(
	  selector => {
			const element = document.querySelector(selector)
			return element && !(element.textContent.includes('compiling'))
		},
		{},
		'.study'
	)

	// PUBLISH
	await page.click('.tv-script-controls .tv-script-publishform-button')

	if (!interactive) {
		// grab indicator title
		await page.waitForSelector(publishTitleSelector, { visible: true })
		const title = await elementGetAttribute(page, publishTitleSelector, 'value')

		// update existing script button
		await page.click('.mainSection-26_mIvUF- .buttonsGroup-1xKa0lUM- button:nth-child(2)')

		// insert description
		await page.type('.textarea-JFbfe1JL-.textarea-1C4tURH4-', description)

		// insert title
		await page.waitFor(1000) // some delay for this laggy input to start working
		await page.type('.textInput-3WRWEmm7-', title)

		// find the matching existing script in the suggestions list and return its selector
		const matchingSuggestionSelector = await page.evaluate(
			(suggestionsSelector, title) => {
				const matchingTitle = [ ...document.querySelector(suggestionsSelector).children ]
					.find(elem => elem.textContent === title)
					// the id contains a ";", which doesn't jive with querySelector - must be escaped
				return matchingTitle ? ('#' + matchingTitle.id).replace(';', '\\;') : null
			},
			'.suggestions-NOVMFmSY-', title
		)

		if (!matchingSuggestionSelector) {
			throw new Error(`"${title}" has not been published before and therefore cannot be updated`)
		}

		await page.click(matchingSuggestionSelector)
		// wait for the script's tags to load
		await page.waitForFunction(
			() => Array.from(document.querySelectorAll('.tagsContainer-zeoKRwOn-')).every(container => container.querySelector('.tag-1XVo8UGU-')),
			{}
		)
		await page.click('.test-publish-button')

		await page.waitForNavigation()
		await browser.close()
	}
}

export default publish
