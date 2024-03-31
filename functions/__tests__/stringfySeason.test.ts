import stringfySeason from "../src/stringfySeason";

test("stringfySeason", () => {
  const season = stringfySeason(2024, 2);
  expect(season).toBe("2024-spring");
});
