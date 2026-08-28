import type { ThreatSheet } from "./threat";

export interface ThreatDeletion {
  id: string;
  deletedAt: string;
}

export interface ReconciledLibrary {
  threats: ThreatSheet[];
  deletions: ThreatDeletion[];
}

function newestById<T extends { id: string }>(values: T[], timestamp: (value: T) => string): Map<string, T> {
  const newest = new Map<string, T>();
  for (const value of values) {
    const current = newest.get(value.id);
    if (!current || timestamp(value) > timestamp(current)) newest.set(value.id, value);
  }
  return newest;
}

export function reconcileLibrary(
  localThreats: ThreatSheet[],
  cloudThreats: ThreatSheet[],
  localDeletions: ThreatDeletion[],
  cloudDeletions: ThreatDeletion[],
): ReconciledLibrary {
  const threatsById = newestById([...localThreats, ...cloudThreats], (threat) => threat.updatedAt);
  const deletionsById = newestById([...localDeletions, ...cloudDeletions], (deletion) => deletion.deletedAt);
  const ids = new Set([...threatsById.keys(), ...deletionsById.keys()]);
  const threats: ThreatSheet[] = [];
  const deletions: ThreatDeletion[] = [];

  for (const id of ids) {
    const threat = threatsById.get(id);
    const deletion = deletionsById.get(id);
    if (deletion && (!threat || deletion.deletedAt >= threat.updatedAt)) {
      deletions.push(deletion);
    } else if (threat) {
      threats.push(threat);
    }
  }

  threats.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  deletions.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  return { threats, deletions };
}
