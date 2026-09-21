import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import { findOversizedAssets } from "../scripts/validate-asset-sizes.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "asset-validation-"));
  temporaryDirectories.push(directory);
  await mkdir(join(directory, "nested"));
  return directory;
}

async function createAsset(path, size) {
  await writeFile(path, "");
  await truncate(path, size);
}

test("accepts assets at or below the limit", async () => {
  const directory = await createFixture();
  await createAsset(join(directory, "at-limit.pdf"), 100);
  await createAsset(join(directory, "nested", "below-limit.jpg"), 99);

  assert.deepEqual(await findOversizedAssets(directory, 100), []);
});

test("reports oversized assets recursively in descending size order", async () => {
  const directory = await createFixture();
  await createAsset(join(directory, "large.pdf"), 101);
  await createAsset(join(directory, "nested", "larger.mp4"), 120);

  assert.deepEqual(await findOversizedAssets(directory, 100), [
    { path: "nested/larger.mp4", size: 120 },
    { path: "large.pdf", size: 101 },
  ]);
});