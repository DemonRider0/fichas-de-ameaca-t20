import { normalizeThreat, THREAT_SCHEMA_VERSION, type ThreatSheet } from "../domain/threat";

const DATABASE_NAME = "fichas-ameaca-t20";
const DATABASE_VERSION = 1;
const STORE_NAME = "threats";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir a biblioteca local."));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao acessar a biblioteca local."));
  });
}

export async function listLocalThreats(): Promise<ThreatSheet[]> {
  const database = await openDatabase();
  let storedThreats: unknown[] = [];
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    storedThreats = await requestToPromise(transaction.objectStore(STORE_NAME).getAll() as IDBRequest<unknown[]>);
  } finally {
    database.close();
  }

  const normalized = storedThreats.map(normalizeThreat);
  const migrated = normalized.filter((_, index) => {
    const stored = storedThreats[index];
    return !stored || typeof stored !== "object" || (stored as { schemaVersion?: number }).schemaVersion !== THREAT_SCHEMA_VERSION;
  });
  await Promise.all(migrated.map(saveLocalThreat));
  return normalized.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveLocalThreat(threat: ThreatSheet): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(STORE_NAME).put(structuredClone(threat)));
  } finally {
    database.close();
  }
}

export async function deleteLocalThreat(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(STORE_NAME).delete(id));
  } finally {
    database.close();
  }
}

export function serializeThreats(threats: ThreatSheet[]): string {
  return JSON.stringify(
    {
      format: "fichas-ameaca-t20",
      schemaVersion: THREAT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      threats,
    },
    null,
    2,
  );
}

function isImportableThreat(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const candidate = value as {
    schemaVersion?: number;
    id?: unknown;
    name?: unknown;
    attacks?: unknown;
    abilities?: unknown;
    skills?: unknown;
  };
  return (
    (candidate.schemaVersion === 1 || candidate.schemaVersion === THREAT_SCHEMA_VERSION) &&
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.attacks) &&
    Array.isArray(candidate.abilities) &&
    Array.isArray(candidate.skills)
  );
}

export function parseThreatImport(raw: string): ThreatSheet[] {
  const parsed: unknown = JSON.parse(raw);
  const possibleThreats = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && "threats" in parsed
      ? (parsed as { threats: unknown }).threats
      : [parsed];

  if (!Array.isArray(possibleThreats) || !possibleThreats.every(isImportableThreat)) {
    throw new Error("O arquivo não contém fichas compatíveis com esta versão.");
  }
  return possibleThreats.map((threat) => normalizeThreat(structuredClone(threat)));
}
