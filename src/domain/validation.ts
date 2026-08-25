import type { Attack, ThreatSheet } from "./threat";

export interface ValidationIssue {
  path: string;
  message: string;
}

const DICE_PATTERN = /^\d+d\d+$/i;

export function isMovementValid(value: number | undefined): boolean {
  if (value === undefined) return true;
  if (!Number.isFinite(value) || value < 0) return false;
  return Math.abs(value / 1.5 - Math.round(value / 1.5)) < 1e-9;
}

function validateAttack(attack: Attack, index: number): ValidationIssue[] {
  const prefix = `attacks.${index}`;
  const issues: ValidationIssue[] = [];
  if (!attack.name.trim()) issues.push({ path: `${prefix}.name`, message: "Informe o nome do ataque." });
  if (!Number.isInteger(attack.quantity) || attack.quantity < 1) {
    issues.push({ path: `${prefix}.quantity`, message: "A quantidade deve ser pelo menos 1." });
  }
  if (!DICE_PATTERN.test(attack.damage.dice.trim())) {
    issues.push({ path: `${prefix}.damage.dice`, message: "Use dados no formato 1d6." });
  }
  if (!Number.isInteger(attack.criticalMargin) || attack.criticalMargin < 1 || attack.criticalMargin > 20) {
    issues.push({ path: `${prefix}.criticalMargin`, message: "A margem deve estar entre 1 e 20." });
  }
  if (!Number.isInteger(attack.criticalMultiplier) || attack.criticalMultiplier < 2) {
    issues.push({ path: `${prefix}.criticalMultiplier`, message: "O multiplicador mínimo é 2." });
  }
  attack.extraDamages.forEach((extraDamage, extraIndex) => {
    if (!DICE_PATTERN.test(extraDamage.dice.trim())) {
      issues.push({ path: `${prefix}.extraDamages.${extraIndex}.dice`, message: "Use dados extras no formato 1d6." });
    }
    if (!extraDamage.type.trim()) {
      issues.push({ path: `${prefix}.extraDamages.${extraIndex}.type`, message: "O tipo do dano extra é obrigatório." });
    }
  });
  return issues;
}

export function validateThreat(threat: ThreatSheet): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!threat.name.trim()) issues.push({ path: "name", message: "Informe o nome da ameaça." });
  if (!threat.challengeLevel.trim()) issues.push({ path: "challengeLevel", message: "Informe o ND." });
  if (Array.from(threat.challengeLevel).length > 3) {
    issues.push({ path: "challengeLevel", message: "O ND pode ter no máximo três caracteres." });
  }
  if (!threat.type.trim()) issues.push({ path: "type", message: "Informe o tipo." });
  if (!threat.size.trim()) issues.push({ path: "size", message: "Informe o tamanho." });
  if (!threat.exclusiveQualifier) {
    issues.push({ path: "exclusiveQualifier", message: "Escolha Solo, Lacaio ou Especial." });
  }
  for (const [kind, value] of Object.entries(threat.movements)) {
    if (!isMovementValid(value)) {
      issues.push({ path: `movements.${kind}`, message: "Use um múltiplo de 1,5 m." });
    }
  }
  threat.customMovements.forEach((movement, index) => {
    if (!movement.name.trim()) {
      issues.push({ path: `customMovements.${index}.name`, message: "Informe o nome do deslocamento." });
    }
    if (!isMovementValid(movement.meters) || movement.meters <= 0) {
      issues.push({ path: `customMovements.${index}.meters`, message: "Use um múltiplo de 1,5 m maior que zero." });
    }
  });
  threat.attacks.forEach((attack, index) => issues.push(...validateAttack(attack, index)));
  threat.abilities.forEach((ability, index) => {
    if (!ability.name.trim()) issues.push({ path: `abilities.${index}.name`, message: "Informe o nome da habilidade." });
    if (!ability.effect.trim()) issues.push({ path: `abilities.${index}.effect`, message: "Informe o efeito da habilidade." });
    ability.subAbilities.forEach((subAbility, subIndex) => {
      if (!subAbility.name.trim()) {
        issues.push({ path: `abilities.${index}.subAbilities.${subIndex}.name`, message: "Informe o nome da sub-habilidade." });
      }
      if (!subAbility.effect.trim()) {
        issues.push({ path: `abilities.${index}.subAbilities.${subIndex}.effect`, message: "Informe o efeito da sub-habilidade." });
      }
    });
  });
  threat.skills.forEach((skill, index) => {
    if (!skill.name.trim()) issues.push({ path: `skills.${index}.name`, message: "Informe o nome da perícia." });
  });
  return issues;
}

export function issuesForPath(issues: ValidationIssue[], path: string): string[] {
  return issues.filter((issue) => issue.path === path).map((issue) => issue.message);
}
