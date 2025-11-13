# node-json-error

Utility helpers to serialize/deserialize regular `Error` and `nested-error-stacks` instances into JSON-safe payloads.  
It preserves useful diagnostics (message, stack, nested chain) while letting you sanitize sensitive fields before logging or sending over the wire.

## Install

```bash
npm install node-json-error nested-error-stacks
```

`nested-error-stacks` is marked as a peer dependency to avoid bundling multiple copies in larger applications.

## Usage

```js
const { serializeError, errorText } = require('node-json-error');

try {
  // some code that might throw
} catch (err) {
  const payload = serializeError(err, true);
  console.log(JSON.stringify(payload));
  console.log(errorText(err));
}
```

### API

| Function | Description |
| -------- | ----------- |
| `serializeError(err, sanitize?, properties?)` | Returns a JSON friendly object with optional sanitization of `address`, `path` fields. |
| `deserializeError(json)` | Hydrates the JSON payload back into an `Error`/`NestedError`/plain object. |
| `serializedErrorText(json, level?)` | Builds a readable multi-line string from JSON payloads. |
| `errorText(err)` | Shortcut for `serializedErrorText(serializeError(err))`. |
| `debugSerializedError(json)` / `debugError(err)` | Dump every captured property recursively for troubleshooting. |

## License

MIT © Nicola Carpanese
