const parseSeason = (seasonData: string) => {
  const syear = seasonData.split("-")[0];
  const sseason = seasonData.split("-")[1];
  if (syear == undefined || sseason == undefined) {
    return "error";
  }
  switch (sseason) {
    case "winter":
      return { syear: Number(syear), sseason: 1 };
    case "spring":
      return { syear: Number(syear), sseason: 2 };
    case "summer":
      return { syear: Number(syear), sseason: 3 };
    case "autumn":
      return { syear: Number(syear), sseason: 4 };
    default:
      throw new Error("sseason is not correct");
  }
};

export default parseSeason;
