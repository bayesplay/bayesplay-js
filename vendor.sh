#!/bin/bash
rm -rf vendor/bayesplay-wasm
mkdir -p vendor/bayesplay-wasm
cp -R ../bayesplay-wasm/dist vendor/bayesplay-wasm/
cp ../bayesplay-wasm/package.json vendor/bayesplay-wasm/
bun install
