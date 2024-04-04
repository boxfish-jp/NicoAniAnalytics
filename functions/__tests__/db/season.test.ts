import { getDbSeason } from "../../src/db/season";

let getData: Awaited<ReturnType<typeof getDbSeason>>;
beforeAll(async () => {
  getData = await getDbSeason(2024, 1);
});

describe("getDbSeason", () => {
  test("season", () => {
    expect(getData[0].syear).toBe(2024);
    expect(getData[0].sseason).toBe(1);
    expect(getData[0].sdesc).toBe("2024年冬アニメ");
  });
});
