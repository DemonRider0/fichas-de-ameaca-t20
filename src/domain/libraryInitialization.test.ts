import { describe, expect, it } from "vitest";
import { createEmptyThreat, createExampleThreat } from "./threat";
import { excludeAutomaticExample, shouldCreateExampleThreat } from "./libraryInitialization";

describe("shouldCreateExampleThreat", () => {
  it("cria o exemplo somente no primeiro uso de uma biblioteca vazia", () => {
    expect(shouldCreateExampleThreat(false, 0)).toBe(true);
  });

  it("não recria o exemplo depois que a biblioteca foi esvaziada", () => {
    expect(shouldCreateExampleThreat(true, 0)).toBe(false);
  });

  it("não adiciona o exemplo a uma biblioteca que já possui fichas", () => {
    expect(shouldCreateExampleThreat(false, 1)).toBe(false);
  });

  it("não transfere o exemplo automático para uma conta nova", () => {
    const realThreat = { ...createEmptyThreat(), name: "Ficha do usuário" };
    expect(excludeAutomaticExample([createExampleThreat(), realThreat])).toEqual([realThreat]);
  });
});
