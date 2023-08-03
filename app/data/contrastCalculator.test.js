import calc from "./contrastCalculator";

test("Gives correct contrast ratios with two hex colors", () => {
  const test0 = calc("#000000", "#ffffff");
  const test1 = calc("#6e6e6e", "#ffffff");
  const test2 = calc("1a53ff", "b5b5b5");
  const test3 = calc("004080", "eeeeee");
  const test4 = calc("808080", "999999");
  const test5 = calc("555555", "a1a1a1");
  const test6 = calc("007acc", "f0f0f0");

  expect(test0).toBe(21);
  expect(test1).toBe(5.09);
  expect(test2).toBe(2.74);
  expect(test3).toBe(8.85);
  expect(test4).toBe(1.38);
  expect(test5).toBe(2.88);
  expect(test6).toBe(3.95);
});
