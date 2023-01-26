import getAppDataPath from "appdata-path";
import puppeteer, * as p from "puppeteer";

export class Browser {
  browser: p.Browser | undefined;

  /**
   * Starts the browser
   */
  public async start() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--user-data-dir=" + getAppDataPath("ettie"),
      ],
      executablePath: "/usr/bin/google-chrome",
    });

    console.info("Browser has been started");

    return this.browser;
  }
}
