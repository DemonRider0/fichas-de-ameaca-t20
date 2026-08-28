import { describe, expect, it } from "vitest";
import { createEmptyThreat } from "./threat";
import { reconcileLibrary } from "./synchronization";

function threat(id: string, updatedAt: string) {
  return { ...createEmptyThreat(), id, updatedAt };
}

describe("reconcileLibrary", () => {
  it("mantém a versão mais recente de uma ficha", () => {
    const older = threat("a", "2026-01-01T00:00:00.000Z");
    const newer = { ...threat("a", "2026-01-02T00:00:00.000Z"), name: "Nova" };
    expect(reconcileLibrary([older], [newer], [], []).threats).toEqual([newer]);
  });

  it("impede que uma cópia antiga recrie uma ficha excluída", () => {
    const stale = threat("a", "2026-01-01T00:00:00.000Z");
    const deletion = { id: "a", deletedAt: "2026-01-02T00:00:00.000Z" };
    const result = reconcileLibrary([stale], [], [], [deletion]);
    expect(result.threats).toEqual([]);
    expect(result.deletions).toEqual([deletion]);
  });

  it("permite recriação deliberada depois de uma exclusão", () => {
    const deletion = { id: "a", deletedAt: "2026-01-02T00:00:00.000Z" };
    const recreated = threat("a", "2026-01-03T00:00:00.000Z");
    const result = reconcileLibrary([recreated], [], [deletion], []);
    expect(result.threats).toEqual([recreated]);
    expect(result.deletions).toEqual([]);
  });
});
