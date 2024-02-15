import chVideos from "../src/chVideos";

const date = new Date();
const time = date.getTime();
let getVideos: Awaited<ReturnType<typeof chVideos>>;
beforeAll(async () => {
  getVideos = await chVideos("ao-ex-shimane", time);
}, 10000);

describe("chVideos", () => {
  test("5秒まつ", async () => {
    expect(getVideos.fetchTime).toBeGreaterThanOrEqual(time + 5000);
  });
  test("動画idの取得", async () => {
    expect(getVideos.videos[getVideos.videos.length - 1].id).toBe("so43198594");
  });
  test("動画タイトルの取得", async () => {
    expect(getVideos.videos[getVideos.videos.length - 1].doc.title).toBe(
      "青の祓魔師 島根啓明結社篇 第1話「ざわめく世界」"
    );
  });
  test("動画URLの取得", async () => {
    expect(getVideos.videos[getVideos.videos.length - 1].doc.url).toBe(
      "https://www.nicovideo.jp/watch/so43198594"
    );
  });
  test("動画サムネイルの取得", async () => {
    expect(getVideos.videos[getVideos.videos.length - 1].doc.thumb).toBe(
      "https://nicovideo.cdn.nimg.jp/thumbnails/43198594/43198594.35776712"
    );
  });
  test("動画投稿日の取得", async () => {
    expect(getVideos.videos[getVideos.videos.length - 1].doc.postDate).toEqual(
      new Date("2024-01-09 12:00")
    );
  });
});
