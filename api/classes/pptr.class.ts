import puppeteer, { Browser, Page } from "puppeteer";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export class Puppeteer {
  browser: Browser;
  page: Page;

  constructor() {
    this.start();
  }

  private async start() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    await this.doCaptcha();
  }

  private async doCaptcha() {
    const page = await this.browser.newPage();
    await page.goto("https://you.com/api", {
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

    this.page = page;
  }

  async get(uri: string) {
    console.info("GET", uri);
    const data: any = await this.page.evaluate((uri) => {
      return new Promise((resolve, reject) => {
        let data = "";
        const es = new EventSource(uri);
        const rejectTimer = setTimeout(
          () => reject(new Error("timeout")),
          30000
        );
        es.addEventListener("token", (e) => {
          try {
            console.log(e.data);
            data += JSON.parse(e.data).token;
          } catch (e) {
            reject(e);
          }
        });
        es.addEventListener("done", () => {
          console.info("DONE");
          clearTimeout(rejectTimer);
          es.close();
          resolve(data);
        });
      });
    }, uri);

    console.info("RESOLVED", data);

    return data;
  }
}
