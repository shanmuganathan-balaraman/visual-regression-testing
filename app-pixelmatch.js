const puppeteer = require('puppeteer')
const fs = require("mz/fs");
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const {urls, screenshotsFolder} = {
    urls: [
        'http://127.0.0.1:8080/base.html'
    ],
    screenshotsFolder: 'screenshots',
};
const options = {
    output: {
        errorColor: {
            red: 255,
            green: 0,
            blue: 255
        },
        errorType: "movement",
        transparency: 0.5,
        largeImageThreshold: 1200,
        useCrossOrigin: false,
        outputDiff: true
    },
    scaleToSameSize: true,
    ignore: "antialiasing"
};

/**
 * 
 * @param {String} url Url to be captured
 * @param {String} filename Filname in which screenshot to be saved
 */
const captureScreenshot = async (url, filename) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(url)
    await page.screenshot({ path: filename, fullPage: true })
    await page.close()
    await browser.close()
}

(async()=> {
    if (!fs.existsSync(screenshotsFolder)) {
        fs.mkdir(screenshotsFolder, (err) => {
            if (err) throw err
        })
    }
    for (const url of urls) {
        const slug = url.slice(url.lastIndexOf('/') + 1);
        const fileName = `${screenshotsFolder}/${slug}${(process.argv[2] == 'base' ? '_base' : '')}.png`;
        await captureScreenshot(url, fileName);

        if(process.argv[2] !== 'base') {
            const baseImg = PNG.sync.read(fs.readFileSync(`${screenshotsFolder}/${slug}_base.png`));
            const modifiedImg = PNG.sync.read(fs.readFileSync(`${screenshotsFolder}/${slug}.png`));
            const {width, height} = baseImg;
            const diff = new PNG({width, height});
            pixelmatch(baseImg.data, modifiedImg.data, diff.data, width, height, {threshold: 0.1});
            fs.writeFileSync(`${screenshotsFolder}/${slug}_diff.png`, PNG.sync.write(diff));
        }
    }
    
})()
