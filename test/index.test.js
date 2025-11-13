"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const NestedError = require("nested-error-stacks");

const jsonError = require("..");

test("serialize/deserialize NestedError chain", () => {
  const inner = new Error("boom");
  inner.code = "EFAIL";
  const err = new NestedError("outer", inner);

  const serialized = jsonError.serializeError(err);
  assert.equal(serialized.type, "NestedError");
  assert.equal(serialized.message, "outer");
  assert.equal(serialized.nested.message, "boom");
  assert.equal(serialized.nested.code, "EFAIL");

  const hydrated = jsonError.deserializeError(serialized);
  assert.equal(hydrated.message, "outer");
  assert(hydrated instanceof NestedError);
  assert.equal(hydrated.nested.message, "boom");
});

test("sanitization removes address/path fields", () => {
  const err = new Error("sensitive");
  err.address = "127.0.0.1";
  err.path = "/tmp/file";

  const serialized = jsonError.serializeError(err, true);
  assert.equal(serialized.address, undefined);
  assert.equal(serialized.path, undefined);
});

test("text helpers never throw", () => {
  const err = new Error("sample");
  const text = jsonError.errorText(err);
  assert.ok(text.includes("sample"));

  const serialized = jsonError.serializeError(err);
  const debugText = jsonError.debugSerializedError(serialized);
  assert.ok(debugText.includes("message: sample"));
});
