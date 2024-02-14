import getCh from "../src/GetCh";
const url = "https://anime.nicovideo.jp/period/now.html";
type getChType = {
  channelDic: {
    season: string;
    channels: {
      title: string;
      thumb: string;
      NanimeDetail: string;
      detail: string;
      latestFree: boolean;
      premium: boolean;
    }[];
  };
  fetchDate: number;
};
let res: getChType;
beforeAll(async () => {
  res = await getCh(url);
});

describe("アニメリストの取得", () => {
  test("seasonの取得", async () => {
    expect(res.channelDic.season).toBe("2024-winter");
  });
  test("リストの長さ", async () => {
    expect(res.channelDic.channels.length).toBeGreaterThan(49);
  });
  test("タイトルの取得", async () => {
    expect(res.channelDic.channels[0].title).toBe("青の祓魔師 島根啓明結社篇");
  });
  test("プレ限か", async () => {
    expect(res.channelDic.channels[0].premium).toBe(true);
  });
  test("最新話無料か", async () => {
    expect(res.channelDic.channels[0].latestFree).toBe(true);
  });
  test("NanimeDetailの取得", async () => {
    expect(res.channelDic.channels[0].NanimeDetail).toBe(
      "https://anime.nicovideo.jp/detail/ao-ex/index.html"
    );
  });
  test("thumbの取得", async () => {
    expect(res.channelDic.channels[0].thumb).toBe(
      "https://anime.nicovideo.jp/assets/images/detail/ao-ex_L.jpg"
    );
  });
});
