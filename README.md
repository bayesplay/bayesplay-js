# bayesplay-js

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Vendored dependency

`bayesplay-wasm` is vendored in this repository at `vendor/bayesplay-wasm` and consumed via a local `file:` dependency.

To refresh the vendored copy from your sibling checkout:

```bash
\rm -rf vendor/bayesplay-wasm
mkdir -p vendor/bayesplay-wasm
cp -R ../bayesplay-wasm/dist vendor/bayesplay-wasm/
cp ../bayesplay-wasm/package.json vendor/bayesplay-wasm/
bun install
```
