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
    expect(
      ["ダンジョン飯", "ダンジョン飯 ～Delicious in Dungeon～"].includes(
        annictData.title
      )
    ).toBeTruthy();
  });
  test("officialSiteUrl", () => {
    expect(
      [
        "https://delicious-in-dungeon.com/",
        "https://delicious-in-dungeon.com/theater.html",
      ].includes(annictData.siteUrl)
    ).toBeTruthy();
  });
  test("twitter", () => {
    expect(annictData.twitter).toBe("dun_meshi_anime");
  });
});
