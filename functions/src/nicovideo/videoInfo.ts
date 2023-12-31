import {XMLParser} from "fast-xml-parser";

type videoinfoType = {
  xml: string;
  nicovideo_thumb_response: {
    thumb: {
      video_id: string;
      title: string;
      description: string;
      thumbnail_url: string;
      first_retrieve: Date;
      length: string;
      movie_type: string;
      size_high: number;
      size_low: number;
      view_counter: number;
      comment_num: number;
      mylist_counter: number;
      last_res_body: string;
      watch_url: string;
      thumb_type: string;
      embeddable: number;
      no_live_play: number;
      tags: [{ tag: string }];
      genre: string;
      user_id: number;
      user_nickname: string;
      user_icon_url: string;
    };
  };
};

const videoInfo = async (videoId: string, db: FirebaseFirestore.Firestore) => {
  const dbConfig = db.collection("dbConfig");
  const getDbDate = (await dbConfig.doc("LastFetch").get()).data();
  const LastFetch = getDbDate != undefined ? getDbDate.data : undefined;

  const getDate = new Date();
  const now = getDate.getTime();

  if (LastFetch != undefined) {
    while (new Date().getTime() - Number(LastFetch) < 1000 * 5) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  const document = {
    data: now,
  };
  await dbConfig.doc("LastFetch").set(document);
  try {
    const data = await fetch(
      "https://ext.nicovideo.jp/api/getthumbinfo/" + videoId
    );
    const text = await data.text();
    const perser = new XMLParser({});
    const object: videoinfoType = perser.parse(text);

    const title = object.nicovideo_thumb_response.thumb.title;
    const description = object.nicovideo_thumb_response.thumb.description;

    const viewer = object.nicovideo_thumb_response.thumb.view_counter;

    const thumb = object.nicovideo_thumb_response.thumb.thumbnail_url;

    const postDate = object.nicovideo_thumb_response.thumb.first_retrieve;

    if (title == undefined) {
      return {
        title: "delete",
        description: "",
        viewer: 0,
        thumb: "",
        postDate: new Date(),
      };
    }

    return {title, description, viewer, thumb, postDate};
  } catch (e) {
    return {
      title: "delete",
      description: "",
      viewer: 0,
      thumb: "",
      postDate: new Date(),
    };
  }
};

export default videoInfo;
