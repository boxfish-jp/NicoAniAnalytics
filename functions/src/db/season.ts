import dbFetcher from "./dbFetcher";
import { dbEndpoint } from "./dbEndpoint";

const getDbSeason = async (year: number, season: number) => {
  const url = dbEndpoint + "/season?syear=" + year + "&sseason=" + season;
  const res = await dbFetcher(url);
  const data = (await res.json()) as {
    result: {
      season_id: number;
      syear: number;
      sseason: number;
      sdesc: string;
    }[];
  };
  if (data.result.length > 1) {
    throw new Error("season is not unique");
  }
  return data.result;
};

const createSeason = async (year: number, season: number) => {
  let sdesc = "";
  switch (season) {
    case 1:
      sdesc = year + "年" + "冬アニメ";
    case 2:
      sdesc = year + "年" + "春アニメ";
    case 3:
      sdesc = year + "年" + "夏アニメ";
    case 4:
      sdesc = year + "年" + "秋アニメ";
  }
  const url =
    dbEndpoint +
    "/season/create?syear=" +
    year +
    "&sseason=" +
    season +
    "&sdesc=" +
    sdesc;
  const res = await dbFetcher(url);
  if (res.status != 200) {
    throw new Error("create season failed");
  }
};
export { getDbSeason, createSeason };
