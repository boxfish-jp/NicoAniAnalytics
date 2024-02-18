import getDbSeason from "../src/db/getDbSeason";

describe("getDbSeason", () => {
  test("シーズンの取得", async () => {
    const dbSeason = await getDbSeason();
    expect(dbSeason == undefined).toBeFalsy;
    if (dbSeason != undefined) {
      expect(Number(String(dbSeason).split("-")[0])).toBeGreaterThanOrEqual(
        2023
      );
      expect(
        ["summer", "spring", "winter", "autumn"].includes(
          String(dbSeason).split("-")[1]
        )
      ).toBeTruthy;
    }
  });
});
