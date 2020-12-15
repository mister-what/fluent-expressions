/**
 * opaque type
 */
type FluentNode<T> = T;
type RootNode<T> = {
  prefix?: string;
  suffix?: string;
  node: any;
  flags?: string;
};
/**
 * @template T
 * @typedef {T} FluentNode opaque type
 * @typedef {{prefix?: string, suffix?: string, node: FluentNode, flags?: string }} RootNode
 */
/**
 * @class FluentExpression
 * @namespace FluentExpression
 */
interface FluentExpression {
  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertStartOfLine(enable?: boolean): FluentExpression;
  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertEndOfLine(enable?: boolean): FluentExpression;
  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|FluentExpression)} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  then(value: string | RegExp | number | FluentExpression): FluentExpression;
  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|FluentExpression)} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  maybe(value: string | RegExp | number | FluentExpression): FluentExpression;
  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|FluentExpression)} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  or(value: string | RegExp | number | FluentExpression): FluentExpression;
  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  anything(lazy?: boolean): FluentExpression;
  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  anythingBut(
    value: string | number | string[] | number[],
    lazy?: boolean
  ): FluentExpression;
  /**
   * @description Any character(s) at least once
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  something(): FluentExpression;
  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  somethingBut(value: string | number | string[] | number[]): FluentExpression;
  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  anyOf(value: string | number | string[] | number[]): FluentExpression;
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  someOf(value: string | number | string[] | number[]): FluentExpression;
  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  oneOf(value: string | number | string[] | number[]): FluentExpression;
  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  any(value: string | number): FluentExpression;
  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|FluentExpression} value
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertNotFollowedBy(
    value: string | number | RegExp | FluentExpression
  ): FluentExpression;
  notFollowedBy(
    value: string | number | RegExp | FluentExpression
  ): FluentExpression;
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|FluentExpression} value
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertFollowedBy(
    value: string | number | RegExp | FluentExpression
  ): FluentExpression;
  followedBy(
    value: string | number | RegExp | FluentExpression
  ): FluentExpression;
  /**
   * @description Match any character in these ranges
   * @example FluentExpression.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  charOfRanges(...characterRanges: [string, string][]): FluentExpression;
  /**
   * @description Match any character that is not in these ranges
   * @example FluentExpression.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  charNotOfRanges(...characterRanges: [string, string][]): FluentExpression;
  /**
   * @description Match a Line break
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  lineBreak(): FluentExpression;
  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  br(): FluentExpression;
  /**
   * @description Match a tab character
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  tab(): FluentExpression;
  /**
   * @description Match any alphanumeric sequence
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  word(): FluentExpression;
  /**
   * @description Match a single digit
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  digit(): FluentExpression;
  /**
   * @description Match a single whitespace
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  whitespace(): FluentExpression;
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  addFlag(flag?: string): FluentExpression;
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  removeFlag(flag: string): FluentExpression;
  /**
   * @description Adds an "i" regex flag - default flags are: "gi"
   * @param {boolean=true} enable
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  withAnyCase(enable?: boolean): FluentExpression;
  /**
   * @description Removes a "g" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  stopAtFirst(enable?: boolean): FluentExpression;
  /**
   * @description Removes any set "m" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  searchOneLine(enable?: boolean): FluentExpression;
  /**
   * @description match the expression <min> to <max> times
   * @example ```js
   * Sx("abc").whitespace().repeat(2, 4).compile().toString() === /(?:abc\w){2,4}/gm.toString()
   * ```
   * @param {number} min
   * @param {number} max
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  repeat(min: number, max: number): FluentExpression;
  /**
   * @description match the expression exactly <n> times
   * @example ```js
   * Sx("abc").whitespace().repeatExactly(5).compile().toString() === /(?:abc\w){5}/gm.toString()
   * ```
   * @param {number} n must be > 0
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  repeatExactly(n: number): FluentExpression;
  /**
   * @description the expression should match at least once
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  oneOrMore(): FluentExpression;
  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  zeroOrMore(lazy?: boolean): FluentExpression;
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  capture(name?: string): FluentExpression;
  group(name?: string): FluentExpression;
  /**
   * @description compile the Fx to a RegExp
   * @returns {RegExp}
   * @memberOf FluentExpression#
   */
  compile(): RegExp;
}
type FluentPrimitive = FluentExpression;

interface FluentExpressionConstructor {
  new (value: string | number | RegExp | FluentExpression): FluentExpression;
  /**
   *
   * @param {string|number|RegExp|FluentExpression} [value]
   * @returns {FluentExpression}
   */
  (value: string | number | RegExp | FluentExpression): FluentExpression;
  prototype: FluentExpression;

  /**
   * @description creates Fxs from a variety of source formats
   * @param {String|Number|RegExp|FluentExpression} x
   * @returns {FluentExpression}
   * @memberOf FluentExpression
   */
  of(x: string | number | RegExp | FluentExpression): FluentExpression;
  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|FluentExpression)} xs
   * @returns {FluentExpression}
   * @memberOf FluentExpression
   */
  or(...xs: (string | number | RegExp | FluentExpression)[]): FluentExpression;
  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|FluentExpression)} xs
   * @returns {FluentExpression}
   * @memberOf FluentExpression
   */
  seq(...xs: (string | number | RegExp | FluentExpression)[]): FluentExpression;
  /**
   * @description a Fx that matches a whitespace
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  whitespace: FluentPrimitive;
  /**
   * @description an empty Fx
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  empty: FluentPrimitive;
  /**
   * @description match one digit
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  digit: FluentPrimitive;
  /**
   * @description match a tab-character
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  tab: FluentPrimitive;
  /**
   * @description matches a whole word
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  word: FluentPrimitive;
  /**
   * @description match any kind of line break or new-lines
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  linebreak: FluentPrimitive;
  any: FluentPrimitive;
}
declare var Sx: FluentExpressionConstructor;

export default Sx;
