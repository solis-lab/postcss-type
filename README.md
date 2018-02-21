# PostCSS Typography [![Build Status][ci-img]][ci]

[PostCSS] plugin to support responsive typography shorthands..

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/solis-lab/postcss-type.svg
[ci]:      https://travis-ci.org/solis-lab/postcss-type

Input: 

```css
@custom-media --mobile-m (min-width: 420px);
@custom-media --mobile-l (min-width: 600px);
@custom-media --tablet (min-width: 768px);
@custom-media --tablet-l (min-width: 1024px);
@custom-media --desktop (min-width: 1280px);
@custom-media --desktop-l (min-width: 1440px);

.foo {
  /*
   * You can omit media query parameter.
   *
   * Line-height pixel values will be converted into unit-less ratio
   * relative to font-size.
   *
   * Letter-spacing pixel values will be converted into `em`.
   * 
   * If you specify a rootSize option in pixel unit, font-size will
   * be converted into `rem`.
   */
  @type 10px 15px 1px;
  
  /* You can omit font-size or line-height by using `/`. */ 
  @type --mobile-m 12px / 0;
  
  /*
   * When you omit font-size, it is on you to provide your preferred unit
   * for line-height and letter-spacing.
   */
  @type --desktop / 1.875 0.01em;
}
```

Output:

```css

@custom-media --mobile-m (min-width: 420px);
@custom-media --mobile-l (min-width: 600px);
@custom-media --tablet (min-width: 768px);
@custom-media --tablet-l (min-width: 1024px);
@custom-media --desktop (min-width: 1280px);
@custom-media --desktop-l (min-width: 1440px);

.foo {
  /* `@type 10px 15px 1px;` */
  font-size: 10px 1.5 0.1em;
  
  /* or in case `@type 10px 15px 1px;` with rootSize: 16px */
  font-size: 0.615rem 1.5 0.1em;
  
  /* `@type --mobile-m 12px / 0;` */
  @media (--mobile-m) {
    font-size: 12px;
    letter-spacing: 0;
  }

  /* @type --desktop / 1.875 0.01em; */
  @media (--desktop) {
    line-height: 1.875;
    letter-spacing: 0.01em; 
  }
}
```

## Usage

Because this plugin relies on [custom media queries](http://cssnext.io/features/#custom-media-queries), you are recommended to run it before `postcss-cssnext` or `postcss-custom-media`

```js
postcss([ require('postcss-type')({rootSize: '16px'}), require('postcss-custom-media') ])
```

See [PostCSS] docs for examples for your environment.
