import puppeteer from 'puppeteer'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

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
	await page.evaluate((selector, value) => document.querySelector(selector).value = value, selector, value)
	await page.type(selector, ' ') // trigger update
	const elementHandle = await page.$(selector)
	await elementHandle.press('Backspace') // remove added space
}

const origin = 'https://www.tradingview.com'
const openEditorButtonSelector = '[data-name="scripteditor"]'
const editorTextareaSelector = '#editor .ace_text-input'

const publish = async ({ credentials, script, headless = true }) => {
	const browser = await puppeteer.launch({
		headless,
		defaultViewport: { height: 800, width: 1200 }
	})
	const page = await browser.newPage()
	await page.goto(`${origin}/#signin`)
	await page.type('#signin-form input[name="username"]', credentials.username)
	await page.type('#signin-form input[name="password"]', credentials.password)
	const rememberMeCheckbox = await page.$('#signin-form input[name="remember"]')
	const rememberMeCheckboxChecked = (await rememberMeCheckbox.getProperty('checked')).jsonValue()
	await rememberMeCheckboxChecked ? rememberMeCheckbox.click() : true
	await Promise.all([
		page.waitForResponse(response =>
			response.url() === `${origin}/accounts/signin/`
				&& response.status() === 200
		),
		page.click('#signin-form button[type="submit"]')
	])
	await page.goto(`${origin}/chart/?symbol=BITMEX:XBTUSD`)
	await page.waitForSelector(openEditorButtonSelector)
	await page.click(openEditorButtonSelector)
	await wait(100) // without this, the editor window won't be visible for some reason
	await page.waitForSelector(editorTextareaSelector)
	await clear(page, editorTextareaSelector)
	await forcefullyInputValue(page, editorTextareaSelector, script)
	await page.click('.tv-script-controls .tv-script-add-button')
	await page.click('.tv-script-controls .tv-script-publishform-button')
	await wait(30000)
	await browser.close()
}

export default publish
