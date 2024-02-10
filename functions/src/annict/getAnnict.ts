import fetchApi from "./fetchApi";

type castType = {
  character: {
    name: string;
  };
  name: string;
  person: {
    name: string;
    wikipediaUrl: string;
  };
};

type staffType = {
  name: string;
  roleOther: string;
  roleText: string;
};

const getAnnict = async (title: string) => {
  const query = `query {
    searchWorks(
            titles: "${title}",
        ) {
            edges {
                node {
                    casts (
                      orderBy : { field: SORT_NUMBER, direction: ASC }
                    ) {
                      nodes {
                        character {
                          name
                        }
                        name
                        person {
                          name
                          wikipediaUrl
                        }
                      }
                    }
                    staffs (
                        orderBy : { field: SORT_NUMBER, direction: ASC }
                        ) {
                        nodes {
                            name
                            roleOther
                            roleText  
                            }
                        }
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
    const casts = work.casts;
    const staffs = work.staffs;
    const chastList: {
      character: string;
      characterImg: string;
      actor: string;
      actorImg: string;
      actorWiki: string;
    }[] = [];
    if (casts.length != 0) {
      if (casts.nodes.length != 0) {
        casts.nodes.forEach((cast: castType) => {
          if (cast != null) {
            chastList.push({
              character: cast.character.name,
              characterImg: "",
              actor: cast.person.name,
              actorImg: "",
              actorWiki: cast.person.wikipediaUrl,
            });
          }
        });
      }
    }
    const staffList: { name: string; role: string }[] = [];
    if (staffs.length != 0) {
      if (staffs.nodes.length != 0) {
        staffs.nodes.forEach((staff: staffType) => {
          if (staff != null) {
            if (staff.roleOther != "") {
              const role = staff.roleOther;
              staffList.push({
                name: staff.name,
                role: role,
              });
            } else {
              const role = staff.roleText;
              staffList.push({
                name: staff.name,
                role: role,
              });
            }
          }
        });
      }
    }
    return {
      title: title,
      siteUrl: siteUrl,
      twitter: twitter,
      casts: chastList,
      staffs: staffList,
    };
  }
  return {
    title: "",
    siteUrl: "",
    twitter: "",
    casts: [],
    staffs: [],
  };
};

export default getAnnict;
