import dbFetcher from "./dbFetcher";
import { dbEndpoint } from "./dbEndpoint";

const getDbChlistFromTag = async (tag: string) => {
  const url = dbEndpoint + "/chlist?ch_NaniTag=" + tag;
  console.log(url);
  const res = await dbFetcher(url);
  const data = (await res.json()) as {
    result: {
      chlist_id: number;
      caddtime: string;
      ch_id: number;
      ch_NaniTag: string;
      ch_title: string;
      ch_url: string;
      ch_detail: string;
      ch_LtstFree: number;
      ch_PrmFree: number;
      syear: number;
      sseason: number;
      ch_twt: string;
      ch_site: string;
      ch_thumb: string;
    }[];
  };
  if (data.result.length > 1) {
    throw new Error("nAniTag is not unique");
  }
  return data.result;
};

const createChlist = async (
  ch_id: number,
  ch_NaniTag: string,
  ch_title: string,
  ch_url: string,
  ch_detail: string,
  ch_LtstFree: number,
  ch_PrmFree: number,
  syear: number,
  sseason: number,
  ch_twt: string,
  ch_site: string,
  ch_thumb: string
) => {
  const url =
    dbEndpoint +
    "/chlist/create?ch_id=" +
    ch_id +
    "&ch_NaniTag=" +
    ch_NaniTag +
    "&ch_title=" +
    encodeURIComponent(ch_title) +
    "&ch_url=" +
    ch_url +
    "&ch_detail=" +
    encodeURIComponent(ch_detail) +
    "&ch_LtstFree=" +
    ch_LtstFree +
    "&ch_PrmFree=" +
    ch_PrmFree +
    "&syear=" +
    syear +
    "&sseason=" +
    sseason +
    "&ch_twt=" +
    ch_twt +
    "&ch_site=" +
    ch_site +
    "&ch_thumb=" +
    ch_thumb +
    "&encode=true";
  console.log(url);
  const res = await dbFetcher(url);
  if (res.status != 200) {
    throw new Error("create season failed");
  }
};

export { getDbChlistFromTag, createChlist };
