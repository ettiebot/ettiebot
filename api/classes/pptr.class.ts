import puppeteer from "puppeteer";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export class Puppeteer {
  async get(uri: string) {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto(uri, {
      waitUntil: "networkidle0",
    });

    const noJs = await page.$(".no-js");

    (async () => {
      if (noJs) {
        console.info("no-js detected");
        await delay(1000);

        try {
          await page.waitForSelector(".big-button.pow-button", {
            timeout: 5000,
          });
          const verifyBtn = await page.$(".big-button.pow-button");
          if (verifyBtn) {
            await delay(1000);
            await verifyBtn.click();
            console.info("verifyBtn clicked");
          }
        } catch (_) {}

        try {
          await page.waitForSelector("iframe", { timeout: 5000 });
          const iframe = await page.$("iframe");
          if (iframe) {
            console.info("iframe detected");
            await delay(2000);
            const frame = page
              .frames()
              .find((frame) => frame.url().indexOf("challenges") !== -1);
            console.log(frame);
            await frame.click("input[type='checkbox']");
          }
        } catch (_) {}
      }
    })();

    await page.waitForSelector("pre", { timeout: 15000 });
    await page.waitForFunction(
      'document.querySelector("pre").textContent.indexOf("event: done") !== -1'
    );

    const content = await (
      await page.$("pre")
    ).evaluate((el) => el.textContent);
    console.log(content);

    await browser.close();

    return content;
  }
}
