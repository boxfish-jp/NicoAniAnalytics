import dbFetcher from "./dbFetcher";
import { dbEndpoint } from "./dbEndpoint";

const rankingParse = async (res: Response) => {
  return (await res.json()) as {
    result: {
      ranking_id: number;
      ch_id: number;
      raddtime: string;
      r_current_seq: number;
      r_total_view: number;
      r_total_comment: number;
      r_total_mylist: number;
      r_avg_view: number;
      r_avg_comment: number;
      r_avg_mylist: number;
      r_ave_view_rank: number;
      r_ave_comment_rank: number;
      r_ave_mylist_rank: number;
      r_diff_view: number;
      r_diff_comment: number;
      r_diff_mylist: number;
    }[];
  };
};

const getRanking = async (ch_id: number, date: Date) => {
  const url = dbEndpoint + "/ranking?ch_id=" + ch_id + "&date=" + date;
  const res = await dbFetcher(url);
  if (res.status !== 200) {
    console.log(await res.json());
    throw new Error("Failed to get ranking");
  }
  const data = await rankingParse(res);
  return data.result;
};

const getDbRankingFromSeason = async (
  syear: number,
  sseason: number,
  date: Date
) => {
  const url =
    dbEndpoint +
    "/ranking?syear=" +
    syear +
    "&sseason=" +
    sseason +
    "&date=" +
    date;
  const res = await dbFetcher(url);
  if (res.status !== 200) {
    console.log(await res.json());
    throw new Error("Failed to get ranking");
  }
  const data = await rankingParse(res);
  return data.result;
};

const createRanking = async (
  ch_id: number,
  r_current_seq: number,
  r_total_view: number,
  r_total_comment: number,
  r_total_mylist: number,
  r_avg_view: number,
  r_avg_comment: number,
  r_avg_mylist: number,
  r_ave_view_rank: number,
  r_ave_comment_rank: number,
  r_ave_mylist_rank: number,
  r_diff_view: number,
  r_diff_comment: number,
  r_diff_mylist: number
) => {
  const url =
    dbEndpoint +
    "/ranking/create?ch_id=" +
    ch_id +
    "&r_current_seq=" +
    r_current_seq +
    "&r_total_view=" +
    r_total_view +
    "&r_total_comment=" +
    r_total_comment +
    "&r_total_mylist=" +
    r_total_mylist +
    "&r_avg_view=" +
    r_avg_view +
    "&r_avg_comment=" +
    r_avg_comment +
    "&r_avg_mylist=" +
    r_avg_mylist +
    "&r_ave_view_rank=" +
    r_ave_view_rank +
    "&r_ave_comment_rank=" +
    r_ave_comment_rank +
    "&r_ave_mylist_rank=" +
    r_ave_mylist_rank +
    "&r_diff_view=" +
    r_diff_view +
    "&r_diff_comment=" +
    r_diff_comment +
    "&r_diff_mylist=" +
    r_diff_mylist;
  const res = await dbFetcher(url);
  if (res.status !== 200) {
    console.log(await res.json());
    throw new Error("Failed to create ranking");
  }
};

export { getRanking, getDbRankingFromSeason, createRanking };
