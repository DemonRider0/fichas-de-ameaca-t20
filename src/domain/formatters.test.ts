import { describe, expect, it } from "vitest";
import {
  formatAttack,
  formatAttribute,
  formatCritical,
  formatManaCost,
  formatMovement,
  formatNumber,
  formatSigned,
  formatSkillNote,
  sortedMovements,
} from "./formatters";
import { createEmptyAttack, createEmptyThreat } from "./threat";

describe("formatCritical", () => {
  it("aplica as quatro regras de exibição", () => {
    expect(formatCritical(20, 2)).toBe("");
    expect(formatCritical(19, 2)).toBe("19");
    expect(formatCritical(20, 3)).toBe("x3");
    expect(formatCritical(19, 3)).toBe("19/x3");
  });
});

describe("formatAttack", () => {
  it("omite a quantidade quando existe apenas um ataque", () => {
    const attack = { ...createEmptyAttack(), name: "Garra", attackBonus: 10 };
    expect(formatAttack(attack)).toBe("Garra +10 (1d6)");
  });

  it("ordena dano extra, habilidade e alcance", () => {
    const attack = {
      ...createEmptyAttack("a-distancia"),
      name: "Arco",
      quantity: 2,
      attackBonus: 12,
      damage: { dice: "1d8", modifier: 4, type: "perfuração" },
      extraDamages: [
        { dice: "1d6", modifier: 2, type: "fogo" },
        { dice: "1d4", modifier: 0, type: "luz" },
      ],
      triggeredAbility: "Veneno",
      range: "médio",
      effect: "O alvo fica caído.",
    };
    expect(formatAttack(attack)).toBe(
      "Arco x2 +12 (1d8+4 perfuração, mais 1d6+2 pontos de dano de fogo, mais 1d4 pontos de dano de luz, mais Veneno, médio) O alvo fica caído.",
    );
  });

  it("mantém o crítico quando a margem ou o multiplicador não são padrão", () => {
    const attack = {
      ...createEmptyAttack(),
      name: "Espada",
      criticalMargin: 19,
      criticalMultiplier: 3,
    };
    expect(formatAttack(attack)).toBe("Espada +0 (1d6, 19/x3)");
  });
});

describe("formatadores básicos", () => {
  it("inclui o sinal dos modificadores", () => {
    expect(formatSigned(4)).toBe("+4");
    expect(formatSigned(-2)).toBe("-2");
  });

  it("converte metros em quadrados", () => {
    expect(formatMovement("padrao", 9)).toBe("9m (6q)");
    expect(formatMovement("voo", 12)).toBe("voo 12m (8q)");
    expect(formatMovement("Teleporte", 30)).toBe("teleporte 30m (20q)");
  });

  it("formata valores editoriais especiais", () => {
    expect(formatNumber(2418)).toBe("2.418");
    expect(formatSigned(1200)).toBe("+1.200");
    expect(formatAttribute(null)).toBe("–");
    expect(formatManaCost("4")).toBe("4 PM");
    expect(formatManaCost("+4")).toBe("+4 PM");
    expect(formatManaCost("6 PM e penalidade de –1 PM")).toBe("6 PM e penalidade de –1 PM");
    expect(formatSkillNote("+10 em florestas")).toBe("(+10 em florestas)");
  });

  it("mantém o terrestre primeiro e ordena os deslocamentos especiais", () => {
    const threat = {
      ...createEmptyThreat(),
      movements: { padrao: 9, voo: 12, escalada: 6 },
      customMovements: [{ id: "teleporte", name: "Teleporte", meters: 30 }],
    };
    expect(sortedMovements(threat).map((movement) => movement.label)).toEqual(["", "escalada", "Teleporte", "voo"]);
  });
});
