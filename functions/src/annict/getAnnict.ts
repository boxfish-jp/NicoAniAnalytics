import fetchApi from "./fetchApi";

const getAnnict = async (title: string) => {
  const query = `query {
    searchWorks(
            titles: "${title}",
        ) {
            edges {
                node {
                    officialSiteUrl
                    twitterUsername
                    title
                }
            }
        }
    }`;
  const fetchData = await fetchApi(title, query);
  const works = fetchData.data.searchWorks.edges;
  if (works.length != 0) {
    const work = works[0].node;
    const title = work.title;
    let siteUrl = work.officialSiteUrl;
    let twitter = work.twitterUsername;
    if (siteUrl == undefined || siteUrl == "") {
      siteUrl = "undefined";
    }
    if (twitter == undefined || twitter == "") {
      twitter = "undefined";
    }
    return {
      title: title,
      siteUrl: siteUrl,
      twitter: twitter,
    };
  }
  return {
    title: "undefined",
    siteUrl: "undefined",
    twitter: "undefined",
  };
};

export default getAnnict;
