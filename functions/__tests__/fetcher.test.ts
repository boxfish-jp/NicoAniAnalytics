import fetcher from "../src/scraping/fetcher";

describe("fetcher", () => {
  test("urlからページを取得する", async () => {
    const url = "https://anime.nicovideo.jp/program";
    const lastFetch = 0;
    const date = new Date();
    const res = await fetcher(url, lastFetch);
    expect(res.dom).toMatch(/^<!doctype html>/);
    expect(res.fetchTime).toBeGreaterThan(date.getTime() - 10);
  });
});
