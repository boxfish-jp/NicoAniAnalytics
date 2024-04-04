import { getDbChlistFromSeason } from "../../src/db/chlist";

let dataFromSeason: Awaited<ReturnType<typeof getDbChlistFromSeason>>;

beforeAll(async () => {
  dataFromSeason = await getDbChlistFromSeason(2024, 1);
});

describe("getDbChlistFromSeason", () => {
  test("chlist length", () => {
    expect(dataFromSeason.length).toBe(51);
  });

  test("chlist data", () => {
    const channel = dataFromSeason.find((channel) => channel.ch_id == 2649230);
    expect(channel?.ch_NaniTag).toBe("delicious-in-dungeon");
    expect(channel?.ch_title).toBe("ダンジョン飯");
    expect(channel?.ch_url).toBe(
      "https://ch.nicovideo.jp/delicious-in-dungeon"
    );
    expect(channel?.ch_LtstFree).toBe(1);
    expect(channel?.ch_PrmFree).toBe(1);
    expect(channel?.ch_twt).toBe("dun_meshi_anime");
    expect(channel?.ch_site).toBe("https://delicious-in-dungeon.com/");
    expect(channel?.ch_thumb).toBe(
      "https://anime.nicovideo.jp/assets/images/detail/delicious-in-dungeon_L.jpg"
    );
  });
});
