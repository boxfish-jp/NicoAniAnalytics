import { dbEndpoint } from "./dbEndpoint";
import dbFetcher from "./dbFetcher";

const videosParse = async (res: Response) => {
  return (await res.json()) as {
    result: {
      video_id: number;
      vaddtime: string;
      ch_id: number;
      ch_seq: number;
      ch_seq_id: number;
      ch_seq_url: string;
      ch_seq_title: string;
      ch_seq_thumb: string;
      ch_seq_detail: string;
      ch_seq_posted: string;
    }[];
  };
};

const getDbVideosFromId = async (ch_seq_id: number) => {
  const url = dbEndpoint + "/videos?ch_seq_id=" + ch_seq_id;
  console.log(url);
  const res = await dbFetcher(url);
  const data = await videosParse(res);
  if (data.result.length > 1) {
    throw new Error("ch_seq_url is not unique");
  }
  return data.result;
};

const getDbVideosFromCh = async (ch_id: number) => {
  const url = dbEndpoint + "/videos?ch_id=" + ch_id;
  console.log(url);
  const res = await dbFetcher(url);
  const data = await videosParse(res);
  return data.result;
};

const createVideos = async (
  ch_id: number,
  ch_seq: number,
  ch_seq_url: string,
  ch_seq_id: number,
  ch_seq_title: string,
  ch_seq_thumb: string,
  ch_seq_desc: string,
  ch_seq_posted: Date
) => {
  const url =
    dbEndpoint +
    "/videos/create?ch_id=" +
    ch_id +
    "&ch_seq=" +
    ch_seq +
    "&ch_seq_url=" +
    ch_seq_url +
    "&ch_seq_id=" +
    ch_seq_id +
    "&ch_seq_title=" +
    encodeURIComponent(ch_seq_title) +
    "&ch_seq_thumb=" +
    ch_seq_thumb +
    "&ch_seq_desc=" +
    encodeURIComponent(ch_seq_desc) +
    "&ch_seq_posted=" +
    ch_seq_posted +
    "&encode=true";
  console.log(url);
  const res = await dbFetcher(url);
  if (res.status !== 200) {
    console.log(await res.json());
    throw new Error("Failed to create videos");
  }
};

export { getDbVideosFromId, getDbVideosFromCh, createVideos };