import getAnnict from "../src/annict/getAnnict";
type annictDataType = Awaited<ReturnType<typeof getAnnict>>;

let annictData: annictDataType;
beforeAll(async () => {
  annictData = await getAnnict("ダンジョン飯");
  //console.log(annictData.casts);
  //console.log(annictData.staffs);
});

describe("getAnnict", () => {
  test("title", () => {
    expect(annictData.title).toBe("ダンジョン飯 ～Delicious in Dungeon～");
  });
  test("officialSiteUrl", () => {
    expect(annictData.siteUrl).toBe(
      "https://delicious-in-dungeon.com/theater.html"
    );
  });
  test("twitter", () => {
    expect(annictData.twitter).toBe("dun_meshi_anime");
  });
});
