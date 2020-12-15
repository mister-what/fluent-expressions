/**
 * opaque type
 */
type SolidNode<T> = T;
type RootNode<T> = {
  prefix?: string;
  suffix?: string;
  node: any;
  flags?: string;
};
/**
 * @template T
 * @typedef {T} SolidNode opaque type
 * @typedef {{prefix?: string, suffix?: string, node: SolidNode, flags?: string }} RootNode
 */
/**
 * @class SolidExpression
 * @namespace SolidExpression
 */
interface SolidExpression {
  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertStartOfLine(enable?: boolean): SolidExpression;
  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertEndOfLine(enable?: boolean): SolidExpression;
  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|SolidExpression)} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  then(value: string | RegExp | number | SolidExpression): SolidExpression;
  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|SolidExpression)} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  maybe(value: string | RegExp | number | SolidExpression): SolidExpression;
  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|SolidExpression)} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  or(value: string | RegExp | number | SolidExpression): SolidExpression;
  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  anything(lazy?: boolean): SolidExpression;
  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  anythingBut(
    value: string | number | string[] | number[],
    lazy?: boolean
  ): SolidExpression;
  /**
   * @description Any character(s) at least once
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  something(): SolidExpression;
  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  somethingBut(value: string | number | string[] | number[]): SolidExpression;
  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  anyOf(value: string | number | string[] | number[]): SolidExpression;
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  someOf(value: string | number | string[] | number[]): SolidExpression;
  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  oneOf(value: string | number | string[] | number[]): SolidExpression;
  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  any(value: string | number): SolidExpression;
  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|SolidExpression} value
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertNotFollowedBy(
    value: string | number | RegExp | SolidExpression
  ): SolidExpression;
  notFollowedBy(
    value: string | number | RegExp | SolidExpression
  ): SolidExpression;
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|SolidExpression} value
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertFollowedBy(
    value: string | number | RegExp | SolidExpression
  ): SolidExpression;
  followedBy(
    value: string | number | RegExp | SolidExpression
  ): SolidExpression;
  /**
   * @description Match any character in these ranges
   * @example SolidExpression.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  charOfRanges(...characterRanges: [string, string][]): SolidExpression;
  /**
   * @description Match any character that is not in these ranges
   * @example SolidExpression.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  charNotOfRanges(...characterRanges: [string, string][]): SolidExpression;
  /**
   * @description Match a Line break
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  lineBreak(): SolidExpression;
  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  br(): SolidExpression;
  /**
   * @description Match a tab character
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  tab(): SolidExpression;
  /**
   * @description Match any alphanumeric sequence
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  word(): SolidExpression;
  /**
   * @description Match a single digit
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  digit(): SolidExpression;
  /**
   * @description Match a single whitespace
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  whitespace(): SolidExpression;
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  addFlag(flag?: string): SolidExpression;
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  removeFlag(flag: string): SolidExpression;
  /**
   * @description Adds an "i" regex flag - default flags are: "gi"
   * @param {boolean=true} enable
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  withAnyCase(enable?: boolean): SolidExpression;
  /**
   * @description Removes a "g" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  stopAtFirst(enable?: boolean): SolidExpression;
  /**
   * @description Removes any set "m" regex flag - default flags are: "gi"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  searchOneLine(enable?: boolean): SolidExpression;
  /**
   * @description match the expression <min> to <max> times
   * @example ```js
   * Sx("abc").whitespace().repeat(2, 4).compile().toString() === /(?:abc\w){2,4}/gm.toString()
   * ```
   * @param {number} min
   * @param {number} max
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  repeat(min: number, max: number): SolidExpression;
  /**
   * @description match the expression exactly <n> times
   * @example ```js
   * Sx("abc").whitespace().repeatExactly(5).compile().toString() === /(?:abc\w){5}/gm.toString()
   * ```
   * @param {number} n must be > 0
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  repeatExactly(n: number): SolidExpression;
  /**
   * @description the expression should match at least once
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  oneOrMore(): SolidExpression;
  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  zeroOrMore(lazy?: boolean): SolidExpression;
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  capture(name?: string): SolidExpression;
  group(name?: string): SolidExpression;
  /**
   * @description compile the Solid to a RegExp
   * @returns {RegExp}
   * @memberOf SolidExpression#
   */
  compile(): RegExp;
}
type SolidPrimitive = SolidExpression;

interface SolidExpressionConstructor {
  new (value: string | number | RegExp | SolidExpression): SolidExpression;
  /**
   *
   * @param {string|number|RegExp|SolidExpression} [value]
   * @returns {SolidExpression}
   */
  (value: string | number | RegExp | SolidExpression): SolidExpression;
  prototype: SolidExpression;

  /**
   * @description creates Solids from a variety of source formats
   * @param {String|Number|RegExp|SolidExpression} x
   * @returns {SolidExpression}
   * @memberOf SolidExpression
   */
  of(x: string | number | RegExp | SolidExpression): SolidExpression;
  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|SolidExpression)} xs
   * @returns {SolidExpression}
   * @memberOf SolidExpression
   */
  or(...xs: (string | number | RegExp | SolidExpression)[]): SolidExpression;
  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|SolidExpression)} xs
   * @returns {SolidExpression}
   * @memberOf SolidExpression
   */
  seq(...xs: (string | number | RegExp | SolidExpression)[]): SolidExpression;
  /**
   * @description a Solid that matches a whitespace
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  whitespace: SolidPrimitive;
  /**
   * @description an empty Solid
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  empty: SolidPrimitive;
  /**
   * @description match one digit
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  digit: SolidPrimitive;
  /**
   * @description match a tab-character
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  tab: SolidPrimitive;
  /**
   * @description matches a whole word
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  word: SolidPrimitive;
  /**
   * @description match any kind of line break or new-lines
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  linebreak: SolidPrimitive;
  any: SolidPrimitive;
}
declare var Sx: SolidExpressionConstructor;

export default Sx;
