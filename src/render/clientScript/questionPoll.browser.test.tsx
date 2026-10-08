import { type Browser, chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { QuestionPoll } from "../../templates/QuestionPoll/QuestionPoll";
import { render } from "../render";

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser.close();
});

describe("poll attachments in the browser", () => {
  it.each([16, 600 * 1024])("renders filenames as text (%i bytes)", async (size) => {
    const page = await browser.newPage();
    try {
      await page.route("https://**", (route) => route.abort());
      const html = render(
        <QuestionPoll
          title="Review"
          questions={[
            {
              id: "storage",
              text: "Choose storage",
              options: [{ id: "disk", label: "Disk" }],
            },
          ]}
        />,
        { pollable: true, interactive: true },
      );
      await page.setContent(html);
      const fileName = '<img src=x onerror="document.body.dataset.injected=1">.png';
      await page.locator("[data-dropzone]").evaluate(
        (zone, upload) => {
          const transfer = new DataTransfer();
          const bytes = new Uint8Array(upload.size);
          const file = new File([bytes], upload.fileName, { type: "image/png" });
          transfer.items.add(file);
          const drop = new DragEvent("drop", { dataTransfer: transfer, bubbles: true });
          zone.dispatchEvent(drop);
        },
        { size, fileName },
      );
      await page.waitForFunction(() =>
        document.querySelector("[data-dropzone]")?.textContent?.includes(".png"),
      );
      const injected = await page.locator("body").getAttribute("data-injected");
      const attachmentText = await page.locator("[data-dropzone]").textContent();
      expect(injected).toBeNull();
      expect(attachmentText).toContain(fileName);
    } finally {
      await page.close();
    }
  });
});
