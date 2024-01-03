import {getFirestore} from "firebase-admin/firestore";

const fetcher = async (url: string) => {
  console.log("fetcher:" + url);
  const db = getFirestore();
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
    const curl = await fetch(url);
    const page = await curl.text();
    console.log("fetch success");
    return page;
  } catch (error) {
    console.log("error:" + url + " :" + error);
    return "error";
  }
};

export default fetcher;
