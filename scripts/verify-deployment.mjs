import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const baseUrl = new URL(process.env.DEPLOYMENT_URL ?? "https://demonrider0.github.io/fichas-de-ameaca-t20/");
const publicBaseUrl = new URL(process.env.PUBLIC_BASE_URL ?? baseUrl);
const resourceCheckBaseUrl = process.env.RESOURCE_CHECK_BASE_URL
  ? new URL(process.env.RESOURCE_CHECK_BASE_URL)
  : null;
const cacheKey = process.env.DEPLOYMENT_CACHE_KEY ?? Date.now().toString();

async function fetchWithRetry(url, attempts = 10) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw lastError;
}

function withCacheKey(url) {
  const checkedUrl = new URL(url);
  checkedUrl.searchParams.set("deployment", cacheKey);
  return checkedUrl;
}

const manifestUrl = withCacheKey(new URL("manifest.json", baseUrl));
const manifest = await (await fetchWithRetry(manifestUrl)).json();

if (manifest.version !== packageJson.version) {
  throw new Error(`Versão publicada ${manifest.version ?? "ausente"}; esperada ${packageJson.version}.`);
}

const publicResources = [
  ["interface", manifest.action?.popover],
  ["ícone principal", manifest.icon],
  ["ícone da ação", manifest.action?.icon],
];

for (const [label, resource] of publicResources) {
  if (typeof resource !== "string" || !resource.trim()) {
    throw new Error(`O manifesto não definiu ${label}.`);
  }
  const resourceUrl = new URL(resource, manifestUrl);
  if (!resourceUrl.href.startsWith(publicBaseUrl.href)) {
    throw new Error(`${label} aponta para fora da publicação: ${resourceUrl.href}`);
  }
  const checkedResourceUrl = resourceCheckBaseUrl
    ? new URL(resourceUrl.href.slice(publicBaseUrl.href.length), resourceCheckBaseUrl)
    : resourceUrl;
  await fetchWithRetry(withCacheKey(checkedResourceUrl));
}

console.log(`Publicação ${manifest.version} verificada em ${baseUrl.href}`);
