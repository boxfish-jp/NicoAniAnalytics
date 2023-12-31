import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc } from "firebase/firestore"; // Import the 'doc' function from the correct package

const Home = async () => {
  await datafetch();
  return <h1>Hello World</h1>;
};

const datafetch = async () => {
  const dataRef = db.collection("dbConfig").doc("checkChannelId");
  const snapshot = await dataRef.get();
  console.log(snapshot.data());
  //onst snapshot = await getDoc(dataRef);
  //const data = snapshot.data();
  //console.log(data);
};

export default Home;
