import getDetail from "../src/getDetail";

let detail: Awaited<ReturnType<typeof getDetail>>;
const date = new Date();
const time = date.getTime();
beforeAll(async () => {
  detail = await getDetail("https://anime.nicovideo.jp/detail/ao-ex", time);
}, 10000);

describe("アニメの詳細情報の取得", () => {
  test("実行時に5秒待てるか", async () => {
    expect(detail.fetchData).toBeGreaterThanOrEqual(time + 5000);
  }, 10000);
  test("chUrlが取得できるか", async () => {
    expect(detail.chUrl).toBe("https://ch.nicovideo.jp/ao-ex-shimane");
  }, 10000);
});
