import Cheerio from "cheerio";
import indexMaker from "./indexMaker";

const getAttrArray = (
  className: string,
  tag: string,
  attribute: string,
  starts: string,
  dom: string
) => {
  const index = indexMaker(className, tag);
  const resultArray: string[] = [];
  const $ = Cheerio.load(dom);
  let counter = 0;

  $(index).each((i, elem) => {
    const target = $(elem).attr(attribute);
    if (target !== undefined) {
      if (starts === "") {
        resultArray[counter] = target;
        counter++;
      } else {
        if (target.startsWith(starts)) {
          resultArray[counter] = target;
          counter++;
        }
      }
    }
  });
  return resultArray;
};

const getTagArray = (
  className: string,
  tag: string,
  starts: string,
  dom: string
) => {
  const index = indexMaker(className, tag);
  const resultArray: string[] = [];
  const $ = Cheerio.load(dom);
  let counter = 0;

  $(index).each((i, elem) => {
    const target = $(elem).text();
    if (target !== undefined) {
      if (starts === "") {
        resultArray[counter] = target;
        counter++;
      } else {
        if (target.startsWith(starts)) {
          resultArray[counter] = target;
          counter++;
        }
      }
    }
  });
  return resultArray;
};

export {getAttrArray, getTagArray};
