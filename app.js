const puppeteer = require('puppeteer')
const fs = require("mz/fs");
const compareImages = require("resemblejs/compareImages");

const {urls, screenshotsFolder} = {
    urls: [
        'https://en.wikipedia.org/wiki/Visual_comparison'
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
        await captureScreenshot(url, fileName)
        if(process.argv[2] !== 'base') {
            const data = await compareImages(
                await fs.readFile(`${screenshotsFolder}/${slug}_base.png`),
                await fs.readFile(`${screenshotsFolder}/${slug}.png`),
                options
            );
            await fs.writeFile(`${screenshotsFolder}/${slug}_diff.png`, data.getBuffer());
        }
    }
    
})()
