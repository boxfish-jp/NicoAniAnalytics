import { dbEndpoint } from "./dbEndpoint";
import dbFetcher from "./dbFetcher";

const viewDataParse = async (res: Response) => {
  return (await res.json()) as {
    result: {
      viewdata_id: number;
      ch_id: number;
      ch_seq: number;
      dadddate: string;
      ch_seq_id: number;
      view_amount: number;
      comment_amount: number;
      mylist_amount: number;
      diff_view: number;
      diff_comment: number;
      diff_mylist: number;
    }[];
  };
};

const getViewDatafromTime = async (ch_seq_id: number, time: Date) => {
  const url = dbEndpoint + "/viewData?ch_seq_id=" + ch_seq_id + "&time=" + time;
  const res = await dbFetcher(url);
  if (res.status !== 200) {
    console.log(await res.json());
    throw new Error("Failed to get viewData");
  }
  const data = await viewDataParse(res);
  return data.result;
};

const getViewDatafromSeason = async (
  syear: number,
  sseason: number,
  Date: Date
) => {
  /*
  const url =
    dbEndpoint +
    "/viewData?syear=" +
    syear +
    "&sseason=" +
    sseason +
    "&daddtime=" +
    Date;
    */
  const url = new URL(dbEndpoint + "/viewData");
  const params = new URLSearchParams([
    ["syear", syear.toString()],
    ["sseason", sseason.toString()],
    ["daddtime", Date.toISOString()],
  ]);
  url.search = params.toString();
  console.log(url.href);
  const res = await dbFetcher(url.href);
  if (res.status !== 200) {
    console.log(await res.json());
    throw new Error("Failed to get viewData");
  }
  const data = await viewDataParse(res);
  return data.result;
};

const createViewData = async (
  ch_id: number,
  ch_seq: number,
  ch_seq_id: number,
  view_amount: number,
  comment_amount: number,
  mylist_amount: number,
  diff_view: number,
  diff_comment: number,
  diff_mylist: number
) => {
  /*
  const url =
    dbEndpoint +
    "/viewData/create?ch_id=" +
    ch_id +
    "&ch_seq=" +
    ch_seq +
    "&ch_seq_id=" +
    ch_seq_id +
    "&view_amount=" +
    view_amount +
    "&comment_amount=" +
    comment_amount +
    "&mylist_amount=" +
    mylist_amount +
    "&encode=true" +
    "&diff_view=" +
    diff_view +
    "&diff_comment=" +
    diff_comment +
    "&diff_mylist=" +
    diff_mylist;
    */
  const url = new URL(dbEndpoint + "/viewData/create");
  const params = new URLSearchParams([
    ["ch_id", ch_id.toString()],
    ["ch_seq", ch_seq.toString()],
    ["ch_seq_id", ch_seq_id.toString()],
    ["view_amount", view_amount.toString()],
    ["comment_amount", comment_amount.toString()],
    ["mylist_amount", mylist_amount.toString()],
    ["diff_view", diff_view.toString()],
    ["diff_comment", diff_comment.toString()],
    ["diff_mylist", diff_mylist.toString()],
  ]);
  url.search = params.toString();
  console.log(url.href);
  const res = await dbFetcher(url.href);
  if (res.status !== 200) {
    console.log(await res.json());
    throw new Error("Failed to create viewData");
  }
};

export { getViewDatafromTime, getViewDatafromSeason, createViewData };
