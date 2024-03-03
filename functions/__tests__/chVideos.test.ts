import chVideos from "../src/chVideos";

const date = new Date();
const time = date.getTime();
let getVideos: Awaited<ReturnType<typeof chVideos>>;
beforeAll(async () => {
  getVideos = await chVideos("https://ch.nicovideo.jp/ao-ex-shimane/", time);
}, 10000);

describe("chVideos", () => {
  test("5秒まつ", async () => {
    expect(getVideos.fetchTime).toBeGreaterThanOrEqual(time + 5000);
  });
  test("チャンネルidの取得", async () => {
    expect(getVideos.videos[0].video.ch_id).toBe(2649264);
  });
  test("動画話数の取得", async () => {
    expect(getVideos.videos[0].video.ch_seq).toBe(1);
  });
  test("動画urlの取得", async () => {
    expect(getVideos.videos[0].video.ch_seq_url).toBe(
      "https://www.nicovideo.jp/watch/so43198594"
    );
  });
  test("動画url_id", async () => {});
  test("動画タイトルの取得", async () => {
    expect(getVideos.videos[0].video.ch_seq_title).toBe(
      "青の祓魔師 島根啓明結社篇 第1話「ざわめく世界」"
    );
  });
  test("動画サムネイルの取得", async () => {
    expect(getVideos.videos[0].video.ch_seq_thumb).toBe(
      "https://nicovideo.cdn.nimg.jp/thumbnails/43198594/43198594.35776712"
    );
  });
  test("動画投稿日の取得", async () => {
    expect(getVideos.videos[0].video.ch_seq_posted).toEqual(
      new Date("2024-01-09 12:00")
    );
  });
});
