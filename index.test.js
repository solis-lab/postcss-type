/* globals expect, it */
import postcss from 'postcss'
import plugin from './'

const ERROR_MISSING = 'Missing typography declarations for @type.'
const ROOT_SIZE_UNIT = 'rootSize option for postcss-type must be in pixel unit.'

const expectEqual = (input, output, opts) => {
  expect.assertions(2)
  return postcss([ plugin(opts) ]).process(input, { from: undefined })
    .then(result => {
      expect(result.css).toEqual(output)
      expect(result.warnings().length).toBe(0)
    })
}

const expectThrow = (input, reason, opts) => {
  expect.assertions(1)
  return postcss([ plugin(opts) ]).process(input)
    .catch(err => {
      expect(err.reason).toEqual(reason)
    })
}

it('throws error when rootSize is not a pixel value', () => {
  return expectThrow('@type 16px', ROOT_SIZE_UNIT, {rootSize: '16'})
})

it('throws error when no params are declared', () => {
  return expectThrow('@type', ERROR_MISSING)
})

it('throws error when only media query is declared', () => {
  return expectThrow('@type --s', ERROR_MISSING)
})

it('supports declaring only font-size', () => {
  const expected = [
    '@media (--s) {',
    '    font-size: 15px',
    '}'
  ].join('\n')

  return expectEqual(
    '@type --s 15px;',
    expected
  )
})

it('supports declaring font-size and line-height', () => {
  const expected = [
    '@media (--s) {',
    '    font-size: 10px;',
    '    line-height: 1.5',
    '}'
  ].join('\n')

  return expectEqual(
    '@type --s 10px 15px;',
    expected
  )
})

it('supports rem for font-size when rootSize is defined', () => {
  const expected = [
    '@media (--s) {',
    '    font-size: 0.625rem;',
    '    line-height: 1.5;',
    '    letter-spacing: 0.1em',
    '}'
  ].join('\n')

  return expectEqual(
    '@type --s 10px 15px 1px;',
    expected,
    {
      rootSize: '16px'
    }
  )
})

it('supports declaring font-size, line-height and letter-spacing', () => {
  const expected = [
    '@media (--s) {',
    '    font-size: 10px;',
    '    line-height: 1.5;',
    '    letter-spacing: 0.1em',
    '}'
  ].join('\n')

  return expectEqual(
    '@type --s 10px 15px 1px;',
    expected
  )
})

it('supports skipping font-size parameter', () => {
  const expected = [
    '@media (--s) {',
    '    line-height: 15px;',
    '    letter-spacing: 1px',
    '}'
  ].join('\n')

  return expectEqual(
    '@type --s / 15px 1px;',
    expected
  )
})

it('supports skipping font-size and line-height parameter', () => {
  const expected = [
    '@media (--s) {',
    '    letter-spacing: 1px',
    '}'
  ].join('\n')

  return expectEqual(
    '@type --s / / 1px;',
    expected
  )
})

it ('supports multiple spaces between parameters', () => {
  const expected = [
    '@media (--s) {',
    '    letter-spacing: 1px',
    '}'
  ].join('\n')

  return expectEqual(
    '@type --s    /    / 1px;',
    expected
  )
})

it('supports font-size while omitting media query', () => {
  expectEqual('@type 15px;', 'font-size: 15px;')
})

it('supports font-size and line-height while omitting media query', () => {
  const expected = ['font-size: 10px;', 'line-height: 1.5;'].join('\n')
  expectEqual(
    '@type 10px 15px;',
    expected
  )
})

it('supports font-size, line-height, letter-spacing while omitting media query', () => {
  const expected = [
    'font-size: 10px;',
    'line-height: 1.5;',
    'letter-spacing: 0.1em;'
  ].join('\n')

  expectEqual(
    '@type 10px 15px 1px;',
    expected
  )
})
