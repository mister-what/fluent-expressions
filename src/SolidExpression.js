import {
  createRoot,
  then_,
  or_,
  maybe,
  anyOf,
  anything,
  anythingBut,
  something,
  somethingBut,
  someOf,
  ranges,
  zeroOrMore,
  getNode,
  repeatExact,
  repeat,
  setNode,
  setPrefix,
  setSuffix,
  addFlags,
  removeFlags,
  alt,
  seq,
  whitespace,
  linebreak,
  digit,
  empty,
  tab,
  word,
  followedBy,
  notFollowedBy,
  oneOrMore,
  oneOf,
  group,
} from "./RegexAst.bs";
import { stringify } from "./StringifyAst.bs";
import { AssertionError, ok as assert } from "assert";

const makeRanges = (ranges) => {
  const flatRanges = ranges.flat(Infinity);
  assert(
    flatRanges.length % 2 === 0,
    new AssertionError({
      message: "Expected even number of elements",
      actual: "uneven",
      expected: "even",
    })
  );
  const rangePairs = [];
  for (let i = 0; i < flatRanges.length; i += 2) {
    rangePairs.push([
      flatRanges[i]?.toString?.(),
      flatRanges[i + 1]?.toString?.(),
    ]);
  }
  return rangePairs;
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
class SolidExpression {
  #rootNode;
  /**
   * @description Creates an instance of SolidExpression.
   * @constructor
   * @memberOf SolidExpression
   *
   * @param {{
   *   source?:string,
   *   node?: SolidNode<never>,
   *   flags?:string,
   *   prefix?: string,
   *   suffix?: string,
   *   sanitize?: boolean
   * }} [arg]
   * @param {boolean} [init]
   */
  constructor(arg, init = true) {
    if (init) {
      const { source, node, flags, prefix, suffix, sanitize } = arg ?? {};
      this.#rootNode = createRoot({
        prefix,
        suffix,
        flags,
        source,
        node,
        sanitize,
      });
    }
  }

  static #getRootNode = (x) => {
    if (!(x instanceof this))
      throw new Error(`${x} is not an instance of SolidVerbs`);
    function _getNode() {
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      return this.#rootNode;
    }
    return _getNode.call(x);
  };

  /**
   * @description creates a Solid from a rootNode type
   * @param {RootNode} node
   * @returns {SolidExpression}
   * @memberOf SolidExpression
   */
  static from(node) {
    return new this(node);
  }

  /**
   * @description creates Solids from a variety of source formats
   * @param {String|Number|RegExp|SolidExpression} x
   * @returns {SolidExpression}
   * @memberOf SolidExpression
   */
  static of(x) {
    if (x instanceof SolidExpression) return x;
    const params = this.#preSanitize(x);
    return new this(params);
  }

  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|SolidExpression)} xs
   * @returns {SolidExpression}
   * @memberOf SolidExpression
   */
  static or(...xs) {
    const verbals = xs.map((x) => {
      if (x instanceof SolidExpression) return x;
      return SolidExpression.of(x);
    });

    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: alt(nodes) });
  }

  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|SolidExpression)} xs
   * @returns {SolidExpression}
   * @memberOf SolidExpression
   */
  static seq(...xs) {
    const verbals = xs.map((x) => SolidExpression.of(x));
    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: seq(nodes) });
  }

  /**
   * @description Alias for a class of primitive SolidExpressions (usually used as building blocks for more complex Solids)
   * @typedef {SolidExpression} SolidPrimitive
   */
  /**
   * @description a Solid that matches a whitespace
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  static whitespace = new SolidExpression({ node: whitespace });
  /**
   * @description an empty Solid
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  static empty = new SolidExpression({ node: empty });
  /**
   * @description match one digit
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  static digit = new SolidExpression({ node: digit });
  /**
   * @description match a tab-character
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  static tab = new SolidExpression({ node: tab });
  /**
   * @description matches a whole word
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  static word = new SolidExpression({ node: word });
  /**
   * @description match any kind of line break or new-lines
   * @type {SolidPrimitive}
   * @memberOf SolidExpression
   */
  static linebreak = new SolidExpression({ node: linebreak });
  static any = new SolidExpression({ node: something(empty) });

  // Utility //

  static #preSanitize = (value) => {
    if (value instanceof RegExp) {
      const source = value.source === "(?:)" ? "" : value.source;
      const prefix = source.startsWith("^") ? "^" : "";
      const suffix = source.endsWith("$") ? "$" : "";
      return {
        source: source.replace(/^\^/, "").replace(/\$$/, ""),
        flags: value.flags,
        sanitize: false,
        prefix,
        suffix,
      };
    }

    if (typeof value === "number") {
      return { source: value.toString(), sanitize: false };
    }

    if (typeof value !== "string") {
      return { source: "", sanitize: false };
    }

    return {
      source: value,
      sanitize: true,
    };
  };

  #setPrefix = (prefix) => {
    const newInstance = new SolidExpression(null, false);
    newInstance.#rootNode = setPrefix(this.#rootNode, prefix);
    return newInstance;
  };
  #setSuffix = (suffix) => {
    const newInstance = new SolidExpression(null, false);
    newInstance.#rootNode = setSuffix(this.#rootNode, suffix);
    return newInstance;
  };

  // Rules //

  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertStartOfLine(enable = true) {
    return this.#setPrefix(enable ? "^" : "");
  }

  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertEndOfLine(enable = true) {
    return this.#setSuffix(enable ? "$" : "");
  }

  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|SolidExpression)} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  then(value) {
    return SolidExpression.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        then_(getNode(this.#rootNode), SolidExpression.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|SolidExpression)} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  maybe(value) {
    return SolidExpression.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        maybe(getNode(this.#rootNode), SolidExpression.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|SolidExpression)} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  or(value) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        or_(getNode(this.#rootNode), SolidExpression.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  anything(lazy = false) {
    return SolidExpression.from(
      setNode(this.#rootNode, anything(getNode(this.#rootNode), lazy))
    );
  }

  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  anythingBut(value, lazy = false) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        anythingBut(getNode(this.#rootNode), [value].flat().join(""), lazy)
      )
    );
  }

  /**
   * @description Any character(s) at least once
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  something() {
    return SolidExpression.from(
      setNode(this.#rootNode, something(getNode(this.#rootNode)))
    );
  }

  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  somethingBut(value) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        somethingBut(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  anyOf(value) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        anyOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  someOf(value) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        someOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  oneOf(value) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        oneOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  any(value) {
    return this.anyOf(value);
  }

  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|SolidExpression} value
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertNotFollowedBy(value) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        notFollowedBy(
          getNode(this.#rootNode),
          SolidExpression.of(value).#rootNode.node
        )
      )
    );
  }
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|SolidExpression} value
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  assertFollowedBy(value) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        followedBy(
          getNode(this.#rootNode),
          SolidExpression.of(value).#rootNode.node
        )
      )
    );
  }

  /**
   * @description Match any character in these ranges
   * @example SolidExpression.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  charOfRanges(...characterRanges) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), false)
      )
    );
  }
  /**
   * @description Match any character that is not in these ranges
   * @example SolidExpression.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  charNotOfRanges(...characterRanges) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), true)
      )
    );
  }

  // Special characters //

  /**
   * @description Match a Line break
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  lineBreak() {
    return this.then(SolidExpression.linebreak);
  }

  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  br() {
    return this.lineBreak();
  }

  /**
   * @description Match a tab character
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  tab() {
    return this.then(SolidExpression.tab);
  }

  /**
   * @description Match any alphanumeric sequence
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  word() {
    return this.then(SolidExpression.word);
  }

  /**
   * @description Match a single digit
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  digit() {
    return this.then(SolidExpression.digit);
  }

  /**
   * @description Match a single whitespace
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  whitespace() {
    return this.then(SolidExpression.whitespace);
  }

  // Modifiers //
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  addFlag(flag = "") {
    return SolidExpression.from(addFlags(this.#rootNode, flag));
  }
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  removeFlag(flag) {
    return SolidExpression.from(removeFlags(this.#rootNode, flag));
  }

  /**
   * @description Adds an "i" regex flag - default flags are: "gm"
   * @param {boolean=true} enable
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  withAnyCase(enable = true) {
    return enable ? this.addFlag("i") : this.removeFlag("i");
  }
  /**
   * @description Removes a "g" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  stopAtFirst(enable = true) {
    return enable ? this.addFlag("g") : this.removeFlag("g");
  }
  /**
   * @description Removes any set "m" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {SolidExpression} new SolidExpression
   * @memberOf SolidExpression#
   */
  searchOneLine(enable = true) {
    return enable ? this.removeFlag("m") : this.addFlag("m");
  }

  // Loops //
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
  repeat(min, max) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        repeat(
          getNode(this.#rootNode),
          min != null ? min | 0 : void 0,
          max != null ? max | 0 : void 0
        )
      )
    );
  }
  /**
   * @description match the expression exactly <n> times
   * @example ```js
   * Sx("abc").whitespace().repeatExactly(5).compile().toString() === /(?:abc\w){5}/gm.toString()
   * ```
   * @param {number} n must be > 0
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  repeatExactly(n) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        repeatExact(getNode(this.#rootNode), n != null ? n | 0 : void 0)
      )
    );
  }

  /**
   * @description the expression should match at least once
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  oneOrMore() {
    return SolidExpression.from(
      setNode(this.#rootNode, oneOrMore(getNode(this.#rootNode)))
    );
  }

  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  zeroOrMore(lazy) {
    return SolidExpression.from(
      setNode(this.#rootNode, zeroOrMore(getNode(this.#rootNode)), lazy)
    );
  }

  // Capture groups //
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {SolidExpression}
   * @memberOf SolidExpression#
   */
  capture(name) {
    return SolidExpression.from(
      setNode(
        this.#rootNode,
        group(getNode(this.#rootNode), name?.toString?.() ?? void 0)
      )
    );
  }

  // Miscellaneous //
  /**
   * @description compile the Solid to a RegExp
   * @returns {RegExp}
   * @memberOf SolidExpression#
   */
  compile() {
    const { source, flags } = stringify(this.#rootNode);
    return new RegExp(source, flags);
  }
}

SolidExpression.prototype.group = SolidExpression.prototype.capture;
SolidExpression.prototype.followedBy =
  SolidExpression.prototype.assertFollowedBy;
SolidExpression.prototype.notFollowedBy =
  SolidExpression.prototype.assertNotFollowedBy;

const makeValueDescriptor = (value) => ({
  value,
  writeable: false,
  enumerable: true,
  configurable: true,
});

class Warning extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Warning";
  }
}
const writeWarning = (text, logType = "error") => {
  return warn;
  function warn() {
    if (!warn.warned) {
      warn.warned = true;
      (typeof console[logType] === "function"
        ? console[logType]
        : console.error)(new Warning(text));
    }
  }
};

const warnArgType = writeWarning(
  "Argument type is not supported. Returning empty Solid."
);
/**
 *
 * @param {string|number|RegExp|SolidExpression} [value]
 * @returns {SolidExpression}
 */
export default function Sx(value) {
  const valueType = typeof value;
  if (
    value != null &&
    (valueType === "string" ||
      valueType === "number" ||
      value instanceof RegExp ||
      value instanceof SolidExpression)
  ) {
    return SolidExpression.of(value);
  }
  if (value != null && process.env.NODE_ENV !== "production") {
    warnArgType();
  }
  return SolidExpression.empty;
}

Sx.or = SolidExpression.or.bind(SolidExpression);
Sx.seq = SolidExpression.seq.bind(SolidExpression);
Sx.of = SolidExpression.of.bind(SolidExpression);
Sx.digit = SolidExpression.digit;
Sx.word = SolidExpression.word;
Sx.empty = SolidExpression.empty;
Sx.linebreak = SolidExpression.linebreak;
Sx.tab = SolidExpression.tab;
Sx.whitespace = SolidExpression.whitespace;
Sx.any = SolidExpression.any;
