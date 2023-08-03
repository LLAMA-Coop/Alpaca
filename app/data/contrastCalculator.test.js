import calc from "./contrastCalculator";

test("Gives correct contrast ratios with two hex colors", () => {
  const test0 = calc("#000000", "#ffffff");

  expect(test0).toBe(21);
});
