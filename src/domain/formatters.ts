import type { Attack, AttributeValue, DamageRoll, MovementKind, ThreatSheet } from "./threat";

export const movementLabels: Record<MovementKind, string> = {
  padrao: "",
  escalada: "escalada",
  escavacao: "escavação",
  natacao: "natação",
  voo: "voo",
};

export const orderedMovementKinds: MovementKind[] = [
  "padrao",
  "escalada",
  "escavacao",
  "natacao",
  "voo",
];

export function formatNumber(value: number): string {
  const normalized = Number.isFinite(value) ? value : 0;
  return normalized.toLocaleString("pt-BR");
}

export function formatSigned(value: number): string {
  const normalized = Number.isFinite(value) ? value : 0;
  return normalized >= 0 ? `+${formatNumber(normalized)}` : formatNumber(normalized);
}

export function formatDamage(damage: DamageRoll): string {
  const modifier = damage.modifier === 0 ? "" : formatSigned(damage.modifier);
  return `${damage.dice}${modifier}${damage.type.trim() ? ` ${damage.type.trim()}` : ""}`;
}

export function formatCritical(margin: number, multiplier: number): string {
  if (margin === 20 && multiplier === 2) return "";
  if (margin !== 20 && multiplier === 2) return `${margin}`;
  if (margin === 20 && multiplier !== 2) return `x${multiplier}`;
  return `${margin}/x${multiplier}`;
}

export function formatAttack(attack: Attack): string {
  const quantity = attack.quantity > 1 ? `x${formatNumber(attack.quantity)} ` : "";
  const critical = formatCritical(attack.criticalMargin, attack.criticalMultiplier);
  const details = [formatDamage(attack.damage)];
  if (critical) details.push(critical);

  for (const extraDamage of attack.extraDamages) {
    const extraModifier = extraDamage.modifier === 0 ? "" : formatSigned(extraDamage.modifier);
    details.push(
      `mais ${extraDamage.dice}${extraModifier} pontos de dano de ${extraDamage.type.trim()}`,
    );
  }
  if (attack.triggeredAbility?.trim()) details.push(`mais ${attack.triggeredAbility.trim()}`);
  if (attack.category === "a-distancia" && attack.range?.trim()) details.push(attack.range.trim());

  const effect = attack.effect.trim() ? ` ${attack.effect.trim()}` : "";
  return `${attack.name.trim()} ${quantity}${formatSigned(attack.attackBonus)} (${details.join(", ")})${effect}`;
}

export function formatMovement(kindOrLabel: MovementKind | string, meters: number): string {
  const label = kindOrLabel in movementLabels
    ? movementLabels[kindOrLabel as MovementKind]
    : kindOrLabel.trim().toLocaleLowerCase("pt-BR");
  const squares = meters / 1.5;
  return `${label ? `${label} ` : ""}${formatNumber(meters)}m (${formatNumber(squares)}q)`;
}

export function sortedMovements(threat: ThreatSheet) {
  const standard = orderedMovementKinds
    .filter((kind) => kind !== "padrao")
    .flatMap((kind) => {
      const meters = threat.movements[kind];
      return typeof meters === "number" && meters > 0
        ? [{ key: kind, label: movementLabels[kind], meters }]
        : [];
    });
  const custom = threat.customMovements
    .filter((movement) => movement.name.trim() && movement.meters > 0)
    .map((movement) => ({ key: movement.id, label: movement.name.trim(), meters: movement.meters }));
  const special = [...standard, ...custom].sort((a, b) => (
    a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
  ));
  const terrestrial = threat.movements.padrao;
  return typeof terrestrial === "number" && terrestrial > 0
    ? [{ key: "padrao", label: "", meters: terrestrial }, ...special]
    : special;
}

export function formatManaCost(value: string): string {
  const cost = value.trim();
  if (!cost) return "";
  return /^[+-]?\d+(?:[,.]\d+)?$/.test(cost) ? `${cost} PM` : cost;
}

export function formatAttribute(value: AttributeValue): string {
  return value === null ? "–" : formatNumber(value);
}

export function formatSkillNote(value: string): string {
  const note = value.trim();
  if (!note) return "";
  return note.startsWith("(") && note.endsWith(")") ? note : `(${note})`;
}

export function formatClassification(threat: ThreatSheet): string {
  const subtype = threat.subtype.trim() ? ` (${threat.subtype.trim()})` : "";
  return `${threat.type.trim()}${subtype}, ${threat.size.trim()}`;
}

export function sortedSkills(threat: ThreatSheet) {
  return [...threat.skills].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}
