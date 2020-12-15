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
 * @typedef {T} FluentNode opaque type
 * @typedef {{prefix?: string, suffix?: string, node: FluentNode, flags?: string }} RootNode
 */
/**
 * @class FluentExpression
 * @namespace FluentExpression
 */
class FluentExpression {
  #rootNode;
  /**
   * @description Creates an instance of FluentExpression.
   * @constructor
   * @memberOf FluentExpression
   *
   * @param {{
   *   source?:string,
   *   node?: FluentNode<never>,
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
      throw new Error(`${x} is not an instance of FluentExpression`);
    function _getNode() {
      // noinspection JSPotentiallyInvalidUsageOfClassThis
      return this.#rootNode;
    }
    return _getNode.call(x);
  };

  /**
   * @description creates a Fx from a rootNode type
   * @param {RootNode} node
   * @returns {FluentExpression}
   * @memberOf FluentExpression
   */
  static from(node) {
    return new this(node);
  }

  /**
   * @description creates Fxs from a variety of source formats
   * @param {String|Number|RegExp|FluentExpression} x
   * @returns {FluentExpression}
   * @memberOf FluentExpression
   */
  static of(x) {
    if (x instanceof FluentExpression) return x;
    const params = this.#preSanitize(x);
    return new this(params);
  }

  /**
   * @description disjunction (one must match) between the argument expressions
   * @param {...(String|Number|RegExp|FluentExpression)} xs
   * @returns {FluentExpression}
   * @memberOf FluentExpression
   */
  static or(...xs) {
    const verbals = xs.map((x) => {
      if (x instanceof FluentExpression) return x;
      return FluentExpression.of(x);
    });

    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: alt(nodes) });
  }

  /**
   * @description conjunction (all must match) of the argument expressions
   * @param {...(String|Number|RegExp|FluentExpression)} xs
   * @returns {FluentExpression}
   * @memberOf FluentExpression
   */
  static seq(...xs) {
    const verbals = xs.map((x) => FluentExpression.of(x));
    const nodes = verbals.map((x) => this.#getRootNode(x).node);
    return this.from({ node: seq(nodes) });
  }

  /**
   * @description Alias for a class of primitive FluentExpressions (usually used as building blocks for more complex Fxs)
   * @typedef {FluentExpression} FluentPrimitive
   */
  /**
   * @description a Fx that matches a whitespace
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  static whitespace = new FluentExpression({ node: whitespace });
  /**
   * @description an empty Fx
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  static empty = new FluentExpression({ node: empty });
  /**
   * @description match one digit
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  static digit = new FluentExpression({ node: digit });
  /**
   * @description match a tab-character
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  static tab = new FluentExpression({ node: tab });
  /**
   * @description matches a whole word
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  static word = new FluentExpression({ node: word });
  /**
   * @description match any kind of line break or new-lines
   * @type {FluentPrimitive}
   * @memberOf FluentExpression
   */
  static linebreak = new FluentExpression({ node: linebreak });
  static any = new FluentExpression({ node: something(empty) });

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
    const newInstance = new FluentExpression(null, false);
    newInstance.#rootNode = setPrefix(this.#rootNode, prefix);
    return newInstance;
  };
  #setSuffix = (suffix) => {
    const newInstance = new FluentExpression(null, false);
    newInstance.#rootNode = setSuffix(this.#rootNode, suffix);
    return newInstance;
  };

  // Rules //

  /**
   * @description Control start-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertStartOfLine(enable = true) {
    return this.#setPrefix(enable ? "^" : "");
  }

  /**
   * @description Control end-of-line matching
   * @param {boolean} [enable=true] whether to enable this behaviour
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertEndOfLine(enable = true) {
    return this.#setSuffix(enable ? "$" : "");
  }

  /**
   * @description Look for the value passed
   * @param {(string|RegExp|number|FluentExpression)} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  then(value) {
    return FluentExpression.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        then_(getNode(this.#rootNode), FluentExpression.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add an optional branch for matching
   * @param {(string|RegExp|number|FluentExpression)} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  maybe(value) {
    return FluentExpression.from(
      setNode(
        setSuffix(this.#rootNode, ""),
        maybe(getNode(this.#rootNode), FluentExpression.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Add alternative expressions
   * @param {(string|RegExp|number|FluentExpression)} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  or(value) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        or_(getNode(this.#rootNode), FluentExpression.of(value).#rootNode.node)
      )
    );
  }

  /**
   * @description Any character any number of times
   * @param {boolean} [lazy] match least number of characters
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  anything(lazy = false) {
    return FluentExpression.from(
      setNode(this.#rootNode, anything(getNode(this.#rootNode), lazy))
    );
  }

  /**
   * @description Anything but these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @param {boolean} [lazy] match least number of characters
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  anythingBut(value, lazy = false) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        anythingBut(getNode(this.#rootNode), [value].flat().join(""), lazy)
      )
    );
  }

  /**
   * @description Any character(s) at least once
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  something() {
    return FluentExpression.from(
      setNode(this.#rootNode, something(getNode(this.#rootNode)))
    );
  }

  /**
   * @description Any character at least one time except for these characters
   * @param {(string|number|string[]|number[])} value characters to not match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  somethingBut(value) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        somethingBut(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match any of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  anyOf(value) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        anyOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }
  /**
   * @description Match some of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  someOf(value) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        someOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Match one chartacter of the given characters
   * @param {(string|number|string[]|number[])} value characters to match
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  oneOf(value) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        oneOf(getNode(this.#rootNode), [value].flat().join(""))
      )
    );
  }

  /**
   * @description Shorthand for anyOf(value)
   * @param {string|number} value value to find
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  any(value) {
    return this.anyOf(value);
  }

  /**
   * @description Ensure that the parameter does not follow (negative lookahead)
   * @param {string|number|RegExp|FluentExpression} value
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertNotFollowedBy(value) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        notFollowedBy(
          getNode(this.#rootNode),
          FluentExpression.of(value).#rootNode.node
        )
      )
    );
  }
  /**
   * @description Ensure that the parameter does follow (positive lookahead)
   * @param {string|number|RegExp|FluentExpression} value
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  assertFollowedBy(value) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        followedBy(
          getNode(this.#rootNode),
          FluentExpression.of(value).#rootNode.node
        )
      )
    );
  }

  /**
   * @description Match any character in these ranges
   * @example FluentExpression.empty.charOfRanges(["a","z"], ["0", "9"]) // [a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  charOfRanges(...characterRanges) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), false)
      )
    );
  }
  /**
   * @description Match any character that is not in these ranges
   * @example FluentExpression.empty.charNotOfRanges(["a","z"], ["0", "9"]) // [^a-z0-9]
   * @param {...([string, string])} characterRanges total number of elements must be event
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  charNotOfRanges(...characterRanges) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        ranges(getNode(this.#rootNode), makeRanges(characterRanges), true)
      )
    );
  }

  // Special characters //

  /**
   * @description Match a Line break
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  lineBreak() {
    return this.then(FluentExpression.linebreak);
  }

  /**
   * @description A shorthand for lineBreak() for html-minded users
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  br() {
    return this.lineBreak();
  }

  /**
   * @description Match a tab character
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  tab() {
    return this.then(FluentExpression.tab);
  }

  /**
   * @description Match any alphanumeric sequence
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  word() {
    return this.then(FluentExpression.word);
  }

  /**
   * @description Match a single digit
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  digit() {
    return this.then(FluentExpression.digit);
  }

  /**
   * @description Match a single whitespace
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  whitespace() {
    return this.then(FluentExpression.whitespace);
  }

  // Modifiers //
  /**
   * @description Add a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  addFlag(flag = "") {
    return FluentExpression.from(addFlags(this.#rootNode, flag));
  }
  /**
   * @description Remove a regex flag - default flags are: "gi"
   * @param {string} flag
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  removeFlag(flag) {
    return FluentExpression.from(removeFlags(this.#rootNode, flag));
  }

  /**
   * @description Adds an "i" regex flag - default flags are: "gm"
   * @param {boolean=true} enable
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  withAnyCase(enable = true) {
    return enable ? this.addFlag("i") : this.removeFlag("i");
  }
  /**
   * @description Removes a "g" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means no "g" flag
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
   */
  stopAtFirst(enable = true) {
    return enable ? this.addFlag("g") : this.removeFlag("g");
  }
  /**
   * @description Removes any set "m" regex flag - default flags are: "gm"
   * @param {boolean=true} enable `true` means "m" flag will be removed
   * @returns {FluentExpression} new FluentExpression
   * @memberOf FluentExpression#
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
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  repeat(min, max) {
    return FluentExpression.from(
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
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  repeatExactly(n) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        repeatExact(getNode(this.#rootNode), n != null ? n | 0 : void 0)
      )
    );
  }

  /**
   * @description the expression should match at least once
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  oneOrMore() {
    return FluentExpression.from(
      setNode(this.#rootNode, oneOrMore(getNode(this.#rootNode)))
    );
  }

  /**
   * @description the expression should match zero or more times
   * @param {boolean} [lazy] enable lazy (non greedy) matching
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  zeroOrMore(lazy) {
    return FluentExpression.from(
      setNode(this.#rootNode, zeroOrMore(getNode(this.#rootNode)), lazy)
    );
  }

  // Capture groups //
  /**
   *
   * @param {string} [name] optionally name your capturing group
   * @returns {FluentExpression}
   * @memberOf FluentExpression#
   */
  capture(name) {
    return FluentExpression.from(
      setNode(
        this.#rootNode,
        group(getNode(this.#rootNode), name?.toString?.() ?? void 0)
      )
    );
  }

  // Miscellaneous //
  /**
   * @description compile the Fx to a RegExp
   * @returns {RegExp}
   * @memberOf FluentExpression#
   */
  compile() {
    const { source, flags } = stringify(this.#rootNode);
    return new RegExp(source, flags);
  }
}

FluentExpression.prototype.group = FluentExpression.prototype.capture;
FluentExpression.prototype.followedBy =
  FluentExpression.prototype.assertFollowedBy;
FluentExpression.prototype.notFollowedBy =
  FluentExpression.prototype.assertNotFollowedBy;

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
  "Argument type is not supported. Returning empty Fx."
);
/**
 *
 * @param {string|number|RegExp|FluentExpression} [value]
 * @returns {FluentExpression}
 */
export default function Sx(value) {
  const valueType = typeof value;
  if (
    value != null &&
    (valueType === "string" ||
      valueType === "number" ||
      value instanceof RegExp ||
      value instanceof FluentExpression)
  ) {
    return FluentExpression.of(value);
  }
  if (value != null && process.env.NODE_ENV !== "production") {
    warnArgType();
  }
  return FluentExpression.empty;
}

Sx.or = FluentExpression.or.bind(FluentExpression);
Sx.seq = FluentExpression.seq.bind(FluentExpression);
Sx.of = FluentExpression.of.bind(FluentExpression);
Sx.digit = FluentExpression.digit;
Sx.word = FluentExpression.word;
Sx.empty = FluentExpression.empty;
Sx.linebreak = FluentExpression.linebreak;
Sx.tab = FluentExpression.tab;
Sx.whitespace = FluentExpression.whitespace;
Sx.any = FluentExpression.any;
