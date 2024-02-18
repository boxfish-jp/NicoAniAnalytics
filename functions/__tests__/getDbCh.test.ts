import getDbCh from "../src/db/getDbCh";

type dbChDataType = Awaited<ReturnType<typeof getDbCh>>;
let dbChDataCollect: dbChDataType;
let dbChDataFalse: dbChDataType;
beforeAll(async () => {
  dbChDataCollect = await getDbCh("2024-winter-ChList", "delicious-in-dungeon");
  dbChDataFalse = await getDbCh("2024-winter-ChList", "2024-winter");
});

describe("getDbCh", () => {
  test("データの正常な取得", async () => {
    expect(dbChDataCollect != undefined).toBe(true);
  });
  test("aveComments", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.aveComments).toBeGreaterThanOrEqual(0);
    }
  });
  test("aveMyLists", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.aveMylists).toBeGreaterThanOrEqual(0);
    }
  });
  test("aveViewers", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.aveViewers).toBeGreaterThanOrEqual(0);
    }
  });
  test("chUrl", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.chUrl).toBe(
        "https://ch.nicovideo.jp/delicious-in-dungeon"
      );
    }
  });
  test("latestFree", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.latestFree).toBe(true);
    }
  });
  test("premium", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.premium).toBe(true);
    }
  });
  test("site", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.site).toBe(
        "https://delicious-in-dungeon.com/theater.html"
      );
    }
  });
  test("thumb", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.thumb).toBe(
        "https://anime.nicovideo.jp/assets/images/detail/delicious-in-dungeon_L.jpg"
      );
    }
  });
  test("title", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.title).toBe("ダンジョン飯");
    }
  });
  test("twitter", () => {
    if (dbChDataCollect != undefined) {
      expect(dbChDataCollect.twitter).toBe("dun_meshi_anime");
    }
  });
  test("不正なデータ", () => {
    if (dbChDataFalse != undefined) {
      expect(dbChDataFalse).toBe(undefined);
    }
  });
});
