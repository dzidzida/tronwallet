/*eslint-disable*/
const puppeteer = require('puppeteer');
const expect = require('chai').expect;
describe('Login', function () {
    let browser;
    let page;
    let test;
    this.timeout(20000);
    before(async function () {
        browser = await puppeteer.launch({ headless: false });
    });

    beforeEach(async function () {
        page = await browser.newPage();
        await page.goto('http://localhost:8000/#/user/login');
        await page.evaluate(() => window.localStorage.setItem('antd-pro-authority', 'guest'))
    });

    afterEach(async function () {
        await page.close();
    })

    after(async function () {
        await browser.close();
    })
    // it('should work', async function () {
    //     console.log(await browser.version());

    //     expect(true).to.be.true;
    // });

    it('should login with failure', async function () {
        await page.type('#username', 'mockuser');
        await page.type('#password', 'wrong_password');
        await page.click('button[type="submit"]');
        const alert = await page.waitForSelector('.ant-alert-error', { timeout: 10000 }); // should display error
        expect(alert).to.not.be.null;
    });

    it('should login succesfully', async function () {
        await page.type('#username', 'diob1');
        await page.type('#password', 'J6t2hybt26!');
        await page.click('button[type="submit"]');
        await page.waitForSelector('h3');
        const confirmText = await page.$eval('h3', h3 => h3.innerHTML)
        expect(confirmText).to.be.equal('Confirm Sign-In');
    })

    it('should complete all the login steps', async function () {
        await page.type('#username', 'diob1');
        await page.type('#password', 'J6t2hybt26!');
        await page.click('button[type="submit"]');
        await page.waitForSelector('h3');
        const confirmText = await page.$eval('h3', h3 => h3.innerHTML)
        expect(confirmText).to.be.equal('Confirm Sign-In');
        await page.click('button[type="submit"]');
        await page.waitForSelector('h1');
        const tronText = await page.$eval('h1', h1 => h1.innerHTML)
        expect(tronText).to.be.equal('Tron Wallet');

    })


})