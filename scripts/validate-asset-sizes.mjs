import { opendir, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const MAX_ASSET_SIZE = 25 * 1024 * 1024;

async function collectOversizedAssets(directory, maxSize, root, oversized) {
  for await (const entry of await opendir(directory)) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      await collectOversizedAssets(entryPath, maxSize, root, oversized);
    } else if (entry.isFile()) {
      const { size } = await stat(entryPath);
      if (size > maxSize) {
        oversized.push({ path: relative(root, entryPath).replaceAll("\\", "/"), size });
      }
    }
  }
}

export async function findOversizedAssets(directory, maxSize = MAX_ASSET_SIZE) {
  const root = resolve(directory);
  const oversized = [];
  await collectOversizedAssets(root, maxSize, root, oversized);
  return oversized.sort((left, right) => right.size - left.size);
}

function formatMiB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

async function main() {
  const directory = process.argv[2] || "_site";
  const oversized = await findOversizedAssets(directory);

  if (oversized.length === 0) {
    console.log(`Asset validation passed: no file exceeds ${formatMiB(MAX_ASSET_SIZE)} MiB.`);
    return;
  }

  for (const asset of oversized) {
    console.error(
      `::error file=${asset.path},title=Cloudflare asset too large::` +
        `${asset.path} is ${formatMiB(asset.size)} MiB; the limit is ${formatMiB(MAX_ASSET_SIZE)} MiB.`
    );
  }

  console.error(`Asset validation failed: ${oversized.length} file(s) exceed Cloudflare's limit.`);
  process.exitCode = 1;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch((error) => {
    const scriptPath = fileURLToPath(import.meta.url);
    console.error(`Asset validation failed in ${scriptPath}: ${error.message}`);
    process.exitCode = 1;
  });
}