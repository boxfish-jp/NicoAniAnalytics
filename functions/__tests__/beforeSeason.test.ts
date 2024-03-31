import beforeSeason from "../src/beforeSeason";

test("beforeSeason", () => {
  const season1 = beforeSeason(2024, 2);
  expect(season1).toStrictEqual({ syear: 2024, sseason: 1 });
  const season2 = beforeSeason(2024, 1);
  expect(season2).toStrictEqual({ syear: 2023, sseason: 4 });
});
