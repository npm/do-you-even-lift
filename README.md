# do-you-even-lift [![npm version](https://img.shields.io/npm/v/do-you-even-lift.svg)](https://npm.im/do-you-even-lift) [![license](https://img.shields.io/npm/l/do-you-even-lift.svg)](https://npm.im/do-you-even-lift) [![Travis](https://img.shields.io/travis/npm/do-you-even-lift.svg)](https://travis-ci.org/npm/do-you-even-lift) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/npm/do-you-even-lift?svg=true)](https://ci.appveyor.com/project/npm/do-you-even-lift) [![Coverage Status](https://coveralls.io/repos/github/npm/do-you-even-lift/badge.svg?branch=latest)](https://coveralls.io/github/npm/do-you-even-lift?branch=latest)

[`do-you-even-lift`](https://github.com/npm/do-you-even-lift) is a Node.js
library for calculating how big a specific package might be once bundled and
compressed. It's built on top of [`pacote`](https://npm.im/pacote) and so will
accept any valid package specifier for extraction.

## Install

`$ npm install do-you-even-lift`

### Example

```javascript
const liftMeBro = require('do-you-even-lift')

liftMeBro('react').then(console.log)
// =>
{
  unpackedSize: 119169,
  bundleSize: 55615,
  minifiedBundleSize: 19747,
  gzippedBundleSize: 15783,
  gzippedMinifiedBundleSize: 7090,
  bundleTime: 1242
}
```
