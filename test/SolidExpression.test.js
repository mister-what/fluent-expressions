import Fx from "../src";

test("should build a uuid regexp via SolidExpressions", () => {
  const hexBlock = Fx().charOfRanges(["0", "9"], ["a", "f"]);
  const fx = hexBlock
    .repeatExactly(8)
    .then("-")
    .then(hexBlock.repeatExactly(4).then("-").repeatExactly(3))
    .then(hexBlock.repeatExactly(12))
    .withAnyCase()
    .searchOneLine();
  const regex = fx.compile();
  expect(`/${regex.source}/${regex.flags}`).toMatchInlineSnapshot(
    `"/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/gi"`
  );
});
test("should build regexp via SolidExpressions", () => {
  const fx = Fx(/^test_expr$/)
    .maybe(Fx.whitespace)
    .then(Fx("hello").repeat(1, 3).capture("hellos"))
    .repeat(1, 4)
    .then(Fx.whitespace.oneOrMore())
    .maybe(Fx("world").or("World").group("worldGroup"))
    .followedBy("!")
    .then(/./);

  const regex = fx.compile();
  expect(regex.source).toMatchInlineSnapshot(
    `"^(?:test_expr(?:\\\\s)?(?<hellos>(?:hello){1,3})){1,4}(?:\\\\s)+(?<worldGroup>world|World)?(?=!)."`
  );
  expect("test_expr hello World!".replace(regex, "")).toEqual("");
  expect("test_expr hello     World!".replace(regex, "")).toEqual("");
  expect("test_exprhello     world!".replace(regex, "")).toEqual("");
  expect("test_expr hello World!".match(regex).groups.worldGroup).toEqual(
    "World"
  );
  expect("test_expr hello world!".match(regex).groups.worldGroup).toEqual(
    "world"
  );
  expect("test_expr hello World!".match(regex).groups.hellos).toEqual("hello");
  expect(
    "test_expr hellotest_expr hellohello World!".match(regex).groups.hellos
  ).toEqual("hellohello");
  expect("test_expr hello World?").not.toMatch(regex);
  //
});
/*test("should build regexp", () => {
  expect(mySource).toMatchInlineSnapshot(
    `"Hello(?:\\\\s(?:\\\\r\\\\n|\\\\r|\\\\n))?(?:World|world)[!?.]"`
  );
  //
});*/
