import { normalizeThreat, THREAT_SCHEMA_VERSION, type ThreatSheet } from "../domain/threat";
import type { ThreatDeletion } from "../domain/synchronization";
export type { ThreatDeletion } from "../domain/synchronization";

const DATABASE_NAME = "fichas-ameaca-t20";
const DATABASE_VERSION = 2;
const LEGACY_STORE_NAME = "threats";
const THREAT_STORE_NAME = "scoped-threats";
const DELETION_STORE_NAME = "scoped-deletions";
const SETTINGS_STORE_NAME = "settings";

export const LOCAL_LIBRARY_SCOPE = "local";

interface StoredThreat extends ThreatSheet {
  scope: string;
}

interface StoredDeletion extends ThreatDeletion {
  scope: string;
}

interface StoredSetting {
  key: string;
  value: boolean;
}

export function userLibraryScope(userId: string): string {
  return `user:${userId}`;
}

function initializedKey(scope: string): string {
  return `scope-initialized:${scope}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = (event) => {
      const database = request.result;
      const transaction = request.transaction;
      if (!transaction) return;
      const upgradingLegacyDatabase = event.oldVersion >= 1 && database.objectStoreNames.contains(LEGACY_STORE_NAME);

      if (!database.objectStoreNames.contains(THREAT_STORE_NAME)) {
        const store = database.createObjectStore(THREAT_STORE_NAME, { keyPath: ["scope", "id"] });
        store.createIndex("scope", "scope");
        store.createIndex("scope-updatedAt", ["scope", "updatedAt"]);
      }
      if (!database.objectStoreNames.contains(DELETION_STORE_NAME)) {
        const store = database.createObjectStore(DELETION_STORE_NAME, { keyPath: ["scope", "id"] });
        store.createIndex("scope", "scope");
      }
      if (!database.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        database.createObjectStore(SETTINGS_STORE_NAME, { keyPath: "key" });
      }

      if (upgradingLegacyDatabase) {
        const legacy = transaction.objectStore(LEGACY_STORE_NAME);
        const scoped = transaction.objectStore(THREAT_STORE_NAME);
        legacy.openCursor().onsuccess = (cursorEvent) => {
          const cursor = (cursorEvent.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (!cursor) return;
          scoped.put({ ...(cursor.value as ThreatSheet), scope: LOCAL_LIBRARY_SCOPE } satisfies StoredThreat);
          cursor.continue();
        };
        transaction.objectStore(SETTINGS_STORE_NAME).put({
          key: initializedKey(LOCAL_LIBRARY_SCOPE),
          value: true,
        } satisfies StoredSetting);
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

export async function listLocalThreats(scope: string): Promise<ThreatSheet[]> {
  const database = await openDatabase();
  let storedThreats: StoredThreat[] = [];
  try {
    const transaction = database.transaction(THREAT_STORE_NAME, "readonly");
    storedThreats = await requestToPromise(
      transaction.objectStore(THREAT_STORE_NAME).index("scope").getAll(IDBKeyRange.only(scope)) as IDBRequest<StoredThreat[]>,
    );
  } finally {
    database.close();
  }

  const normalized = storedThreats.map(normalizeThreat);
  const migrated = normalized.filter((_, index) => {
    const stored = storedThreats[index];
    return !stored || typeof stored !== "object" || (stored as { schemaVersion?: number }).schemaVersion !== THREAT_SCHEMA_VERSION;
  });
  await Promise.all(migrated.map((threat) => saveLocalThreat(scope, threat)));
  return normalized.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveLocalThreat(scope: string, threat: ThreatSheet): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(THREAT_STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(THREAT_STORE_NAME).put({
      ...structuredClone(threat),
      scope,
    } satisfies StoredThreat));
  } finally {
    database.close();
  }
}

export async function deleteLocalThreat(scope: string, id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(THREAT_STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(THREAT_STORE_NAME).delete([scope, id]));
  } finally {
    database.close();
  }
}

export async function listLocalDeletions(scope: string): Promise<ThreatDeletion[]> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(DELETION_STORE_NAME, "readonly");
    const stored = await requestToPromise(
      transaction.objectStore(DELETION_STORE_NAME).index("scope").getAll(IDBKeyRange.only(scope)) as IDBRequest<StoredDeletion[]>,
    );
    return stored.map(({ id, deletedAt }) => ({ id, deletedAt }));
  } finally {
    database.close();
  }
}

export async function saveLocalDeletion(scope: string, deletion: ThreatDeletion): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(DELETION_STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(DELETION_STORE_NAME).put({
      ...structuredClone(deletion),
      scope,
    } satisfies StoredDeletion));
  } finally {
    database.close();
  }
}

export async function deleteLocalDeletion(scope: string, id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(DELETION_STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(DELETION_STORE_NAME).delete([scope, id]));
  } finally {
    database.close();
  }
}

function clearStoreScope(database: IDBDatabase, storeName: string, scope: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.index("scope").openKeyCursor(IDBKeyRange.only(scope));

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      store.delete(cursor.primaryKey);
      cursor.continue();
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error(`Não foi possível limpar ${storeName}.`));
    transaction.onabort = () => reject(transaction.error ?? request.error ?? new Error(`Não foi possível limpar ${storeName}.`));
  });
}

export async function clearLocalScope(scope: string): Promise<void> {
  const database = await openDatabase();
  try {
    await clearStoreScope(database, THREAT_STORE_NAME, scope);
    await clearStoreScope(database, DELETION_STORE_NAME, scope);
  } finally {
    database.close();
  }
}

export async function isLocalScopeInitialized(scope: string): Promise<boolean> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(SETTINGS_STORE_NAME, "readonly");
    const setting = await requestToPromise(
      transaction.objectStore(SETTINGS_STORE_NAME).get(initializedKey(scope)) as IDBRequest<StoredSetting | undefined>,
    );
    return setting?.value === true;
  } finally {
    database.close();
  }
}

export async function markLocalScopeInitialized(scope: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(SETTINGS_STORE_NAME, "readwrite");
    await requestToPromise(transaction.objectStore(SETTINGS_STORE_NAME).put({
      key: initializedKey(scope),
      value: true,
    } satisfies StoredSetting));
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
