import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createEmptyAbility, createEmptyThreat } from "../domain/threat";
import { ThreatPreview } from "./ThreatPreview";

describe("ThreatPreview", () => {
  it("renderiza cada linha narrativa como parágrafo recuado", () => {
    const threat = { ...createEmptyThreat(), description: "Primeiro parágrafo.\nSegundo parágrafo." };
    const html = renderToStaticMarkup(<ThreatPreview threat={threat} />);

    expect(html.match(/class="threat-description"/g)).toHaveLength(2);
    expect(html).toContain("Primeiro parágrafo.");
    expect(html).toContain("Segundo parágrafo.");
  });

  it("omite PM e deslocamentos especiais zerados", () => {
    const threat = {
      ...createEmptyThreat(),
      manaPoints: 0,
      movements: { padrao: 9, escalada: 0, voo: 0 },
    };
    const html = renderToStaticMarkup(<ThreatPreview threat={threat} />);

    expect(html).not.toContain("Pontos de Mana");
    expect(html).not.toContain("escalada 0m");
    expect(html).not.toContain("voo 0m");
    expect(html).toContain("9m (6q)");
  });

  it("permite omitir o terrestre e ordena deslocamentos personalizados", () => {
    const threat = {
      ...createEmptyThreat(),
      movements: { voo: 12, escalada: 6 },
      customMovements: [{ id: "teleporte", name: "Teleporte", meters: 30 }],
    };
    const html = renderToStaticMarkup(<ThreatPreview threat={threat} />);

    expect(html).not.toContain(">9m (6q)<");
    expect(html.indexOf("escalada 6m")).toBeLessThan(html.indexOf("teleporte 30m"));
    expect(html.indexOf("teleporte 30m")).toBeLessThan(html.indexOf("voo 12m"));
  });

  it("exibe atributos nulos, custo adicional, observação de perícia e milhares", () => {
    const ability = { ...createEmptyAbility(), name: "Magia Acelerada", action: "Livre", manaCost: "+4", effect: "Acelera uma magia." };
    const threat = {
      ...createEmptyThreat(),
      challengeLevel: "1/4",
      hitPoints: 2418,
      attributes: { ...createEmptyThreat().attributes, intelligence: null },
      skills: [{ id: "furtividade", name: "Furtividade", bonus: 5, note: "+10 em florestas" }],
      abilities: [ability],
    };
    const html = renderToStaticMarkup(<ThreatPreview threat={threat} />);

    expect(html).toContain("Pontos de Vida</span> 2.418");
    expect(html).toContain("Int –");
    expect(html).toContain("Magia Acelerada (Livre, +4 PM)");
    expect(html).toContain("Furtividade +5 (+10 em florestas)");
    expect(html).toContain("nd-value-long");
  });

  it("coloca o marcador mágico depois do efeito", () => {
    const ability = { ...createEmptyAbility(), name: "Arcana", effect: "Efeito mágico.", magical: true };
    const threat = { ...createEmptyThreat(), abilities: [ability] };
    const html = renderToStaticMarkup(<ThreatPreview threat={threat} />);

    expect(html).toMatch(/Efeito mágico\.<span class="magic-marker-suffix">/);
    expect(html).toContain("class=\"magic-marker\"");
  });
});
