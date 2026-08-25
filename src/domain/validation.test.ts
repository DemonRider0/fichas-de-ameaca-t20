import { describe, expect, it } from "vitest";
import { createEmptyAbility, createEmptyAttack, createEmptyThreat, normalizeThreat, THREAT_SCHEMA_VERSION } from "./threat";
import { isMovementValid, validateThreat } from "./validation";

describe("deslocamento", () => {
  it("aceita somente múltiplos de 1,5", () => {
    expect(isMovementValid(0)).toBe(true);
    expect(isMovementValid(1.5)).toBe(true);
    expect(isMovementValid(9)).toBe(true);
    expect(isMovementValid(5)).toBe(false);
  });

  it("normaliza valores opcionais zerados", () => {
    const normalized = normalizeThreat({
      ...createEmptyThreat(),
      manaPoints: 0,
      movements: { padrao: 9, escalada: 0, natacao: 6 },
    });

    expect(normalized.manaPoints).toBeNull();
    expect(normalized.movements).toEqual({ padrao: 9, natacao: 6 });
  });

  it("permite remover o terrestre e usar deslocamentos personalizados", () => {
    const threat = {
      ...createEmptyThreat(),
      movements: { voo: 12 },
      customMovements: [{ id: "teleporte", name: "Teleporte", meters: 30 }],
    };
    expect(validateThreat(threat).filter((issue) => issue.path.startsWith("movements"))).toEqual([]);
    expect(validateThreat(threat).filter((issue) => issue.path.startsWith("customMovements"))).toEqual([]);
  });
});

describe("validação da ficha", () => {
  it("aceita NDs fracionários e limita o campo a três caracteres", () => {
    expect(validateThreat({ ...createEmptyThreat(), challengeLevel: "1/4" }).some((issue) => issue.path === "challengeLevel")).toBe(false);
    const threat = { ...createEmptyThreat(), challengeLevel: "S+++" };
    expect(validateThreat(threat).some((issue) => issue.path === "challengeLevel")).toBe(true);
  });

  it("valida margem e multiplicador de crítico", () => {
    const attack = { ...createEmptyAttack(), name: "Garra", criticalMargin: 21, criticalMultiplier: 1 };
    const threat = { ...createEmptyThreat(), attacks: [attack] };
    const paths = validateThreat(threat).map((issue) => issue.path);
    expect(paths).toContain("attacks.0.criticalMargin");
    expect(paths).toContain("attacks.0.criticalMultiplier");
  });
});

describe("migração da versão 1", () => {
  it("converte custos, dano extra e novos campos sem duplicar a ficha", () => {
    const currentAttack = createEmptyAttack();
    const { extraDamages: _extraDamages, effect: _effect, ...legacyAttack } = currentAttack;
    const currentAbility = createEmptyAbility();
    const legacy = {
      ...createEmptyThreat(),
      schemaVersion: 1,
      customMovements: undefined,
      attacks: [{
        ...legacyAttack,
        name: "Garra",
        extraDamage: { dice: "1d6", modifier: 2, type: "fogo" },
      }],
      abilities: [{ ...currentAbility, manaCost: 4, subAbilities: [] }],
      attributes: { ...createEmptyThreat().attributes, intelligence: "—" },
      skills: [{ id: "furtividade", name: "Furtividade", bonus: 10 }],
    };

    const migrated = normalizeThreat(legacy);
    expect(migrated.schemaVersion).toBe(THREAT_SCHEMA_VERSION);
    expect(migrated.id).toBe(legacy.id);
    expect(migrated.attacks[0].extraDamages).toEqual([{ dice: "1d6", modifier: 2, type: "fogo" }]);
    expect(migrated.attacks[0].effect).toBe("");
    expect(migrated.abilities[0].manaCost).toBe("4");
    expect(migrated.attributes.intelligence).toBeNull();
    expect(migrated.skills[0].note).toBe("");
    expect(migrated.customMovements).toEqual([]);
  });
});
