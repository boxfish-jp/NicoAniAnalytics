import { db } from "./firebase";

const getDbSeason = async () => {
  const dbConfig = db.collection("dbConfig");
  const dbSeason = (await dbConfig.doc("nowSeason").get()).data();
  if (dbSeason != undefined) {
    return dbSeason.data;
  } else {
    throw new Error("can't get dbSeason");
  }
};

export default getDbSeason;
