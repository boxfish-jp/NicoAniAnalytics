import getChannels from "../src/getChannels";

let getData: Awaited<ReturnType<typeof getChannels>>;

const NanimeUrl = "https://anime.nicovideo.jp/period/2024-winter.html";

beforeAll(async () => {
  getData = await getChannels(NanimeUrl);
});

describe("getChannels", () => {
  test("fetchTime", () => {
    expect(getData.fetchTime).toBeGreaterThan(
      new Date(new Date().getTime() - 15 * 1000).getTime()
    );
  });

  test("season", () => {
    expect(getData.channelDic.season.syear).toBe(2024);
    expect(getData.channelDic.season.sseason).toBe(1);
  });

  test("channels length", () => {
    expect(getData.channelDic.channels.length).toBe(60);
  });

  test("channel Data", () => {
    const channel = getData.channelDic.channels.find(
      (item) => item.NaniTag == "delicious-in-dungeon"
    );
    expect(channel?.title).toBe("ダンジョン飯");
    expect(channel?.premium).toBe(true);
    expect(channel?.latestFree).toBe(true);
    expect(channel?.NanimeDetail).toBe(
      "https://anime.nicovideo.jp/detail/delicious-in-dungeon/index.html"
    );
    expect(channel?.thumb).toBe(
      "https://anime.nicovideo.jp/assets/images/detail/delicious-in-dungeon_L.jpg"
    );
  });
});
