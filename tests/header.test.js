const pupppeteer = require('puppeteer')
let browser, page;
beforeEach(async () => {
    browser = await pupppeteer.launch({headless: false})
    page = await browser.newPage()
    await page.goto('localhost:3000')
})

afterEach(async () => {
    browser.close()
})
test('we can launch a browser', async () => {
    const text = await page.$eval(('a.brand-logo', el => el.innerHTML))
    expect(text).toEqual('Blogster')
})