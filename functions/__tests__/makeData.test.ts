import chVideos from "../src/chVideos";
import makeDBData from "../src/makeData";

const channel = {
  title: "ダンジョン飯",
  thumb: "ダンジョン飯のサムネイル",
  NanimeDetail: "https://anime.nicovideo.jp/detail/delicious-in-dungeon",
  detail: "ダンジョン飯の詳細",
  latestFree: true,
  premium: true,
};

const chUrl = "https://ch.nicovideo.jp/delicious-in-dungeon";
const chId = chUrl.split("https://ch.nicovideo.jp/")[1];

let getVideoArr: Awaited<ReturnType<typeof chVideos>>;
let createdData: Awaited<ReturnType<typeof makeDBData>>;
beforeAll(async () => {
  getVideoArr = await chVideos(chId, 0);
  createdData = await makeDBData(channel, chUrl, getVideoArr.videos);
});

describe("makeData", () => {
  test("chDocId", () => {
    expect(createdData?.chDocId).toBe("delicious-in-dungeon");
  });
  test("chDoc.chUrl", () => {
    expect(createdData?.chDoc.chUrl).toBe(chUrl);
  });
  test("detail", () => {
    expect(createdData?.chDoc.detail).toBe(channel.detail);
  });
  test("thumb", () => {
    expect(createdData?.chDoc.thumb).toBe(channel.thumb);
  });
  test("title", () => {
    expect(createdData?.chDoc.title).toBe(channel.title);
  });
  test("latestFree", () => {
    expect(createdData?.chDoc.latestFree).toBe(channel.latestFree);
  });
  test("premium", () => {
    expect(createdData?.chDoc.premium).toBe(channel.premium);
  });
  test("twitter", () => {
    expect(createdData?.chDoc.twitter).toBe("dun_meshi_anime");
  });
  test("site", () => {
    expect(
      [
        "https://delicious-in-dungeon.com/",
        "https://delicious-in-dungeon.com/theater.html",
      ].includes(createdData?.chDoc.site)
    ).toBeTruthy();
  });
});
