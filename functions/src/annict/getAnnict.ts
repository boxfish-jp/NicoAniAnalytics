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
    const siteUrl = work.officialSiteUrl;
    const twitter = work.twitterUsername;
    return {
      title: title,
      siteUrl: siteUrl,
      twitter: twitter,
    };
  }
  return {
    title: "",
    siteUrl: "",
    twitter: "",
  };
};

export default getAnnict;
