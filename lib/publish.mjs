import puppeteer from 'puppeteer'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const clear = async (page, selector) => {
	const elementHandle = await page.$(selector)
	await elementHandle.click()
	await elementHandle.focus()
	await elementHandle.click({clickCount: 3}) // click three times to select all
	await elementHandle.press('Backspace')
}

const origin = 'https://www.tradingview.com'
const openEditorButtonSelector = '[data-name="scripteditor"]'
const editorContentSelector = '#editor .ace_text-input'

const publish = async ({ credentials, script, headless = true }) => {
	const browser = await puppeteer.launch({ headless })
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
	await page.waitForSelector(editorContentSelector)
	await clear(page, editorContentSelector)
	await page.type(editorContentSelector, script)
	await wait(5000)
	await browser.close()
}

export default publish
