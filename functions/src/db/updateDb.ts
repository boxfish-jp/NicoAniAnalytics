import { db } from "./firebase";

const updateDb = async (
  collectionName: string,
  aniId: string,
  data: object
) => {
  const res = await db.collection(collectionName).doc(aniId).update(data);
  return res;
};

export default updateDb;
