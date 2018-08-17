'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _postcss = require('postcss');

var postcss = _interopRequireWildcard(_postcss);

var _lodash = require('lodash.curry');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * PostCSS AtRule
 * @see {@link http://api.postcss.org/AtRule.html|postcss API > AtRule}
 * @typedef {Object} postcss.AtRule
 */
/**
 * PostCSS Declaration
 * @see {@link http://api.postcss.org/Declaration.html|postcss API > Declaration}
 * @typedef {Object} postcss.Declaration
 */
/**
 * PostCSS Node
 * @see {@link http://api.postcss.org/Node.html|postcss API > Node}
 * @typedef {Object} postcss.Node
 */

/**
 * Create an @media rule for a custom media query
 * @param {string} media
 * @return {postcss.AtRule}
 */
var createMediaRule = function createMediaRule(media) {
  return postcss.atRule({ name: 'media', params: '(' + media + ')' });
};

/**
 * Create a declaration for a pair of key and value. Doesn't do anything if
 * the value is empty or '/'
 *
 * @param {string} key
 * @param {string} value
 * @param {Node} source
 * @return {postcss.Declaration | undefined}
 */
var createDecl = function createDecl(key, value, source) {
  if (typeof value === 'undefined' || value === '/') {
    return undefined;
  } else {
    value = String(value);
    var decl = postcss.decl({ prop: key, value: value });
    decl.source = source.source;
    return decl;
  }
};

/**
 * Append declaration to an AtRule if declaration is defined.
 * This function is curried.
 *
 * @param {postcss.AtRule} atRule
 * @param {postcss.Declaration | undefined} decl
 * @return {postcss.AtRule}
 */
var appendDecl = (0, _lodash2.default)(function (atRule, decl) {
  return decl ? atRule.append(decl) : atRule;
});

/**
 * Insert declaration into a parent rule before a certain position.
 * This function is curried.
 *
 * @param {postcss.Node} parent
 * @param {postcss.Node} position
 * @param {postcss.Declaration} decl
 * @return {postcss.Node}
 */
var insertDeclBefore = (0, _lodash2.default)(function (parent, position, decl) {
  return decl ? parent.insertBefore(position, decl) : parent;
});

/**
 * Return true if the value's unit is px
 *
 * @param {string} val
 * @return {boolean}
 */
var isPx = function isPx(val) {
  return (/\dpx/.test(val)
  );
};

/**
 * Return true if the string is a custom media query
 *
 * @param {string} val
 * @return {boolean}
 */
var isCustomMedia = function isCustomMedia(val) {
  return (/^--/.test(val)
  );
};

/**
 * Format and round up a float number to a specific number of decimal places
 *
 * @param {number} num
 * @param {number} dec
 * @return {number}
 */
var toDecimalPlaces = function toDecimalPlaces(num, dec) {
  var multiplier = Math.pow(10, dec);
  return Math.round(num * multiplier) / multiplier;
};

/**
 * Convert a pixel value to a ratio
 *
 * @param {string} val
 * @param {number} ref
 * @return {number}
 */
var pxToRatio = function pxToRatio(val, ref) {
  return toDecimalPlaces(parseFloat(val) / parseFloat(ref), 5);
};

/**
 * Convert a pixel value to an em value
 *
 * @param {string} val
 * @param {string} ref
 * @return {string}
 */
var pxToEm = function pxToEm(val, ref) {
  return pxToRatio(val, ref) + 'em';
};

/**
 * Convert a pixel value to a rem value
 *
 * @param {string} val
 * @param {string} ref
 * @return {string}
 */
var pxToRem = function pxToRem(val, ref) {
  return pxToRatio(val, ref) + 'rem';
};

/**
 * PostCSS plugin to allow using `@type <media> <font-size> <line-height> <letter-spacing>` syntax
 */
exports.default = postcss.plugin('postcss-type', function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function (root) {
    if (options.rootSize && !isPx(options.rootSize)) {
      throw root.error('rootSize option for postcss-type must be in pixel unit.');
    }

    var createFromValue = function createFromValue(value, rule) {
      var frags = value.split(/\s+/);
      var media = frags.length && isCustomMedia(frags[0]) ? frags.shift() : undefined;

      var _frags = _slicedToArray(frags, 3),
          fontSize = _frags[0],
          lineHeight = _frags[1],
          letterSpacing = _frags[2];

      if (!fontSize) {
        throw rule.error('Missing typography declarations for @type.');
      }

      if (fontSize && fontSize !== '/') {
        if (typeof lineHeight !== 'undefined' && isPx(lineHeight)) {
          lineHeight = pxToRatio(lineHeight, fontSize);
        }

        if (typeof letterSpacing !== 'undefined' && isPx(letterSpacing)) {
          letterSpacing = pxToEm(letterSpacing, fontSize);
        }
      }

      if (options.rootSize && isPx(options.rootSize)) {
        fontSize = pxToRem(fontSize, options.rootSize);
      }

      var mediaRule = media ? createMediaRule(media) : undefined;

      var insertTypeDecls = media ? appendDecl(mediaRule) : insertDeclBefore(rule.parent, rule);

      insertTypeDecls(createDecl('font-size', fontSize, rule));
      insertTypeDecls(createDecl('line-height', lineHeight, rule));
      insertTypeDecls(createDecl('letter-spacing', letterSpacing, rule));

      if (mediaRule) {
        rule.replaceWith(mediaRule);
      } else {
        rule.remove();
      }
    };

    root.walk(function (rule) {
      if (rule.type === 'atrule' && rule.name === 'type') {
        createFromValue(rule.params, rule);
      }

      if (rule.type === 'decl' && rule.prop === 'type') {
        createFromValue(rule.value, rule);
      }
    });
  };
});


module.exports = exports['default'];
