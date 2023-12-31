const indexMaker = (className: string, tag: string) => {
  if (className === "") {
    return tag;
  } else if (tag === "") {
    return "." + className;
  } else {
    return tag + "." + className;
  }
};

export default indexMaker;
