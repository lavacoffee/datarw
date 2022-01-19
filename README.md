# @lavacoffee/datarw
> A binary data reader/writer aim to work with lavaplayer MessageIO

[![NPM Version](https://img.shields.io/npm/v/@lavacoffee/datarw.svg?maxAge=3600)](https://www.npmjs.com/package/@lavacoffee/datarw)
[![NPM Downloads](https://img.shields.io/npm/dt/@lavacoffee/datarw.svg?maxAge=3600)](https://www.npmjs.com/package/@lavacoffee/datarw)

## Documentation
https://lavacoffee.github.io/datarw

## Writer
```js
import { DataWriter } from "@lavacoffee/datarw"

const writer = new DataWriter()

// ... (more on docs)

const dataBytes = writer.finish()
```

## Reader
```js
import { DataReader } from "@lavacoffee/datarw"

const reader = new DataReader(dataBytes)

// ... (more on docs)
```
