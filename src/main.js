import * as postcss from 'postcss'
import curry from 'lodash.curry'

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
const createMediaRule = media => postcss.atRule({ name: `media (${media})` })

/**
 * Create a declaration for a pair of key and value. Doesn't do anything if
 * the value is empty or '/'
 *
 * @param {string} key
 * @param {string} value
 * @param {Node} source
 * @return {postcss.Declaration | undefined}
 */
const createDecl = (key, value, source) => {
  if (!value || value === '/') {
    return undefined
  } else {
    const decl = postcss.decl({ prop: key, value: value })
    decl.source = source.source
    return decl
  }
}

/**
 * Append declaration to an AtRule if declaration is defined.
 * This function is curried.
 *
 * @param {postcss.AtRule} atRule
 * @param {postcss.Declaration | undefined} decl
 * @return {postcss.AtRule}
 */
const appendDecl = curry((atRule, decl) => decl ? atRule.append(decl) : atRule)

/**
 * Insert declaration into a parent rule before a certain position.
 * This function is curried.
 *
 * @param {postcss.Node} parent
 * @param {postcss.Node} position
 * @param {postcss.Declaration} decl
 * @return {postcss.Node}
 */
const insertDeclBefore = curry((parent, position, decl) => decl ? parent.insertBefore(position, decl) : parent)

/**
 * Return true if the value's unit is px
 *
 * @param {string} val
 * @return {boolean}
 */
const isPx = val => /\dpx/.test(val)

/**
 * Return true if the string is a custom media query
 *
 * @param {string} val
 * @return {boolean}
 */
const isCustomMedia = val => /^--/.test(val)

/**
 * Format and round up a float number to a specific number of decimal places
 *
 * @param {number} num
 * @param {number} dec
 * @return {number}
 */
const toDecimalPlaces = (num, dec) => {
  const multiplier = Math.pow(10, dec)
  return Math.round(num * multiplier) / multiplier
}

/**
 * Convert a pixel value to a ratio
 *
 * @param {string} val
 * @param {number} ref
 * @return {number}
 */
const pxToRatio = (val, ref) => toDecimalPlaces(parseFloat(val) / parseFloat(ref), 5)

/**
 * Convert a pixel value to an em value
 *
 * @param {string} val
 * @param {string} ref
 * @return {string}
 */
const pxToEm = (val, ref) => pxToRatio(val, ref) + 'em'

/**
 * Convert a pixel value to a rem value
 *
 * @param {string} val
 * @param {string} ref
 * @return {string}
 */
const pxToRem = (val, ref) => pxToRatio(val, ref) + 'rem'

/**
 * PostCSS plugin to allow using `@type <media> <font-size> <line-height> <letter-spacing>` syntax
 */
export default postcss.plugin('postcss-typography', (options = {}) => {
  return root => {
    if (options.rootSize && !isPx(options.rootSize)) {
      throw root.error('rootSize option for postcss-typography must be in pixel unit.')
    }

    root.walkAtRules('type', atRule => {
      let frags = atRule.params.split(/\s+/)

      const media = (frags.length && isCustomMedia(frags[0])) ? frags.shift() : undefined

      let [fontSize, lineHeight, letterSpacing] = frags

      if (!fontSize) {
        throw atRule.error('Missing typography declarations for @type.')
      }

      if (fontSize && fontSize !== '/') {
        if (lineHeight && isPx(lineHeight)) {
          lineHeight = pxToRatio(lineHeight, fontSize)
        }

        if (letterSpacing && isPx(letterSpacing)) {
          letterSpacing = pxToEm(letterSpacing, fontSize)
        }
      }

      if (options.rootSize && isPx(options.rootSize)) {
        fontSize = pxToRem(fontSize, options.rootSize)
      }

      const mediaRule = media
        ? createMediaRule(media)
        : undefined

      const insertTypeDecls = media
        ? appendDecl(mediaRule)
        : insertDeclBefore(atRule.parent, atRule)

      insertTypeDecls(createDecl('font-size', fontSize, atRule))
      insertTypeDecls(createDecl('line-height', lineHeight, atRule))
      insertTypeDecls(createDecl('letter-spacing', letterSpacing, atRule))

      if (mediaRule) {
        atRule.replaceWith(mediaRule)
      } else {
        atRule.remove()
      }
    })
  }
})

module.exports = exports['default']
