export const THREAT_SCHEMA_VERSION = 2 as const;

export type ExclusiveQualifier = "solo" | "lacaio" | "especial";
export type InclusiveQualifier = "bando" | "enxame" | "chefe-de-fase";
export type AttackCategory = "corpo-a-corpo" | "a-distancia";
export type MovementKind = "padrao" | "escalada" | "escavacao" | "natacao" | "voo";
export type AttributeValue = number | null;

export interface DamageRoll {
  dice: string;
  modifier: number;
  type: string;
}

export interface Attack {
  id: string;
  category: AttackCategory;
  name: string;
  quantity: number;
  attackBonus: number;
  damage: DamageRoll;
  criticalMargin: number;
  criticalMultiplier: number;
  extraDamages: DamageRoll[];
  triggeredAbility?: string;
  range?: string;
  effect: string;
}

export interface SubAbility {
  id: string;
  name: string;
  action: string;
  manaCost: string;
  effect: string;
  magical: boolean;
}

export interface Ability {
  id: string;
  name: string;
  action: string;
  manaCost: string;
  effect: string;
  magical: boolean;
  subAbilities: SubAbility[];
}

export interface Skill {
  id: string;
  name: string;
  bonus: number;
  note: string;
}

export interface CustomMovement {
  id: string;
  name: string;
  meters: number;
}

export interface ThreatSheet {
  schemaVersion: typeof THREAT_SCHEMA_VERSION;
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  challengeLevel: string;
  type: string;
  subtype: string;
  size: string;
  exclusiveQualifier: ExclusiveQualifier;
  inclusiveQualifiers: InclusiveQualifier[];
  initiative: number;
  perception: number;
  sensoryAbilities: string;
  defense: number;
  fortitude: number;
  reflexes: number;
  will: number;
  defensiveAbilities: string;
  hitPoints: number;
  manaPoints: number | null;
  movements: Partial<Record<MovementKind, number>>;
  customMovements: CustomMovement[];
  attacks: Attack[];
  abilities: Ability[];
  attributes: {
    strength: AttributeValue;
    dexterity: AttributeValue;
    constitution: AttributeValue;
    intelligence: AttributeValue;
    wisdom: AttributeValue;
    charisma: AttributeValue;
  };
  skills: Skill[];
  equipment: string;
  treasure: string;
}

interface LegacyAttack extends Partial<Omit<Attack, "damage" | "extraDamages">> {
  damage?: Partial<DamageRoll>;
  extraDamage?: Partial<DamageRoll>;
  extraDamages?: Partial<DamageRoll>[];
}

interface LegacySubAbility extends Partial<Omit<SubAbility, "manaCost">> {
  manaCost?: number | string | null;
}

interface LegacyAbility extends Partial<Omit<Ability, "manaCost" | "subAbilities">> {
  manaCost?: number | string | null;
  subAbilities?: LegacySubAbility[];
}

interface LegacySkill extends Partial<Skill> {}

interface LegacyThreat extends Partial<Omit<ThreatSheet, "schemaVersion" | "attacks" | "abilities" | "skills">> {
  schemaVersion?: number;
  attacks?: LegacyAttack[];
  abilities?: LegacyAbility[];
  skills?: LegacySkill[];
}

const movementKinds: MovementKind[] = ["padrao", "escalada", "escavacao", "natacao", "voo"];
const exclusiveQualifiers: ExclusiveQualifier[] = ["solo", "lacaio", "especial"];
const inclusiveQualifiers: InclusiveQualifier[] = ["bando", "enxame", "chefe-de-fase"];

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyDamage(): DamageRoll {
  return { dice: "1d6", modifier: 0, type: "" };
}

export function createEmptyAttack(category: AttackCategory = "corpo-a-corpo"): Attack {
  return {
    id: createId(),
    category,
    name: "",
    quantity: 1,
    attackBonus: 0,
    damage: createEmptyDamage(),
    criticalMargin: 20,
    criticalMultiplier: 2,
    extraDamages: [],
    effect: "",
  };
}

export function createEmptyAbility(): Ability {
  return {
    id: createId(),
    name: "",
    action: "",
    manaCost: "",
    effect: "",
    magical: false,
    subAbilities: [],
  };
}

export function createEmptySubAbility(): SubAbility {
  return {
    id: createId(),
    name: "",
    action: "",
    manaCost: "",
    effect: "",
    magical: false,
  };
}

export function createEmptyCustomMovement(): CustomMovement {
  return {
    id: createId(),
    name: "",
    meters: 1.5,
  };
}

export function createEmptyThreat(): ThreatSheet {
  const now = new Date().toISOString();
  return {
    schemaVersion: THREAT_SCHEMA_VERSION,
    id: createId(),
    createdAt: now,
    updatedAt: now,
    name: "Nova Ameaça",
    description: "",
    challengeLevel: "1",
    type: "Humanoide",
    subtype: "",
    size: "Médio",
    exclusiveQualifier: "solo",
    inclusiveQualifiers: [],
    initiative: 0,
    perception: 0,
    sensoryAbilities: "",
    defense: 10,
    fortitude: 0,
    reflexes: 0,
    will: 0,
    defensiveAbilities: "",
    hitPoints: 1,
    manaPoints: null,
    movements: { padrao: 9 },
    customMovements: [],
    attacks: [],
    abilities: [],
    attributes: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    skills: [],
    equipment: "",
    treasure: "",
  };
}

export function createExampleThreat(): ThreatSheet {
  const threat = createEmptyThreat();
  return {
    ...threat,
    id: "00000000-0000-4000-8000-000000000001",
    name: "Meio-Orc Bandoleiro",
    description:
      "Um salteador endurecido pelas estradas, acostumado a emboscar viajantes e desaparecer antes da chegada de reforços.",
    challengeLevel: "1",
    type: "Humanoide",
    subtype: "meio-orc",
    size: "Médio",
    exclusiveQualifier: "lacaio",
    initiative: 5,
    perception: 1,
    sensoryAbilities: "+3 em subterrâneo, visão no escuro",
    defense: 15,
    fortitude: 10,
    reflexes: 5,
    will: 1,
    hitPoints: 15,
    movements: { padrao: 9 },
    attacks: [
      {
        ...createEmptyAttack("corpo-a-corpo"),
        name: "Espada curta",
        attackBonus: 11,
        damage: { dice: "1d6", modifier: 13, type: "" },
        criticalMargin: 19,
      },
      {
        ...createEmptyAttack("a-distancia"),
        name: "Adaga",
        attackBonus: 9,
        damage: { dice: "1d4", modifier: 7, type: "" },
        criticalMargin: 19,
      },
    ],
    abilities: [
      {
        ...createEmptyAbility(),
        name: "Ataque Furtivo",
        effect: "+2d6.",
      },
    ],
    attributes: {
      strength: 3,
      dexterity: 2,
      constitution: 2,
      intelligence: 0,
      wisdom: -1,
      charisma: -1,
    },
    equipment: "Adaga x2, armadura de couro, espada curta.",
    treasure: "Metade.",
  };
}

export function cloneThreat(source: ThreatSheet): ThreatSheet {
  const now = new Date().toISOString();
  return {
    ...structuredClone(source),
    id: createId(),
    name: `${source.name} — cópia`,
    createdAt: now,
    updatedAt: now,
    customMovements: source.customMovements.map((movement) => ({ ...structuredClone(movement), id: createId() })),
    attacks: source.attacks.map((attack) => ({ ...structuredClone(attack), id: createId() })),
    abilities: source.abilities.map((ability) => ({
      ...structuredClone(ability),
      id: createId(),
      subAbilities: ability.subAbilities.map((subAbility) => ({
        ...structuredClone(subAbility),
        id: createId(),
      })),
    })),
    skills: source.skills.map((skill) => ({ ...structuredClone(skill), id: createId() })),
  };
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeManaCost(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return textValue(value);
}

function normalizeAttribute(value: unknown, fallback: AttributeValue): AttributeValue {
  if (value === null || value === "–" || value === "—" || value === "-") return null;
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeDamage(value: unknown, fallback: DamageRoll = createEmptyDamage()): DamageRoll {
  const damage = value && typeof value === "object" ? value as Partial<DamageRoll> : {};
  return {
    dice: textValue(damage.dice, fallback.dice),
    modifier: finiteNumber(damage.modifier, fallback.modifier),
    type: textValue(damage.type, fallback.type),
  };
}

function normalizeAttack(value: unknown): Attack {
  const attack = value && typeof value === "object" ? value as LegacyAttack : {};
  const category: AttackCategory = attack.category === "a-distancia" ? "a-distancia" : "corpo-a-corpo";
  const base = createEmptyAttack(category);
  const extraDamages = Array.isArray(attack.extraDamages)
    ? attack.extraDamages.map((damage) => normalizeDamage(damage))
    : attack.extraDamage
      ? [normalizeDamage(attack.extraDamage)]
      : [];

  return {
    ...base,
    id: textValue(attack.id, base.id),
    category,
    name: textValue(attack.name),
    quantity: finiteNumber(attack.quantity, 1),
    attackBonus: finiteNumber(attack.attackBonus, 0),
    damage: normalizeDamage(attack.damage),
    criticalMargin: finiteNumber(attack.criticalMargin, 20),
    criticalMultiplier: finiteNumber(attack.criticalMultiplier, 2),
    extraDamages,
    triggeredAbility: typeof attack.triggeredAbility === "string" ? attack.triggeredAbility : undefined,
    range: typeof attack.range === "string" ? attack.range : undefined,
    effect: textValue(attack.effect),
  };
}

function normalizeSubAbility(value: unknown): SubAbility {
  const subAbility = value && typeof value === "object" ? value as LegacySubAbility : {};
  const base = createEmptySubAbility();
  return {
    ...base,
    id: textValue(subAbility.id, base.id),
    name: textValue(subAbility.name),
    action: textValue(subAbility.action),
    manaCost: normalizeManaCost(subAbility.manaCost),
    effect: textValue(subAbility.effect),
    magical: subAbility.magical === true,
  };
}

function normalizeAbility(value: unknown): Ability {
  const ability = value && typeof value === "object" ? value as LegacyAbility : {};
  const base = createEmptyAbility();
  return {
    ...base,
    id: textValue(ability.id, base.id),
    name: textValue(ability.name),
    action: textValue(ability.action),
    manaCost: normalizeManaCost(ability.manaCost),
    effect: textValue(ability.effect),
    magical: ability.magical === true,
    subAbilities: Array.isArray(ability.subAbilities) ? ability.subAbilities.map(normalizeSubAbility) : [],
  };
}

function normalizeSkill(value: unknown): Skill {
  const skill = value && typeof value === "object" ? value as LegacySkill : {};
  return {
    id: textValue(skill.id, createId()),
    name: textValue(skill.name),
    bonus: finiteNumber(skill.bonus, 0),
    note: textValue(skill.note),
  };
}

export function normalizeThreat(source: unknown): ThreatSheet {
  const threat = source && typeof source === "object" ? source as LegacyThreat : {};
  const base = createEmptyThreat();
  const sourceMovements = threat.movements && typeof threat.movements === "object"
    ? threat.movements
    : base.movements;
  const movements: Partial<Record<MovementKind, number>> = {};
  for (const kind of movementKinds) {
    const value = sourceMovements[kind];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) movements[kind] = value;
  }

  const sourceAttributes = threat.attributes && typeof threat.attributes === "object"
    ? threat.attributes
    : base.attributes;
  const selectedExclusive = exclusiveQualifiers.includes(threat.exclusiveQualifier as ExclusiveQualifier)
    ? threat.exclusiveQualifier as ExclusiveQualifier
    : base.exclusiveQualifier;
  const selectedInclusive = Array.isArray(threat.inclusiveQualifiers)
    ? threat.inclusiveQualifiers.filter((qualifier): qualifier is InclusiveQualifier => (
      inclusiveQualifiers.includes(qualifier as InclusiveQualifier)
    ))
    : [];

  return {
    schemaVersion: THREAT_SCHEMA_VERSION,
    id: textValue(threat.id, base.id),
    createdAt: textValue(threat.createdAt, base.createdAt),
    updatedAt: textValue(threat.updatedAt, base.updatedAt),
    name: textValue(threat.name, base.name),
    description: textValue(threat.description),
    challengeLevel: textValue(threat.challengeLevel, base.challengeLevel),
    type: textValue(threat.type, base.type),
    subtype: textValue(threat.subtype),
    size: textValue(threat.size, base.size),
    exclusiveQualifier: selectedExclusive,
    inclusiveQualifiers: selectedInclusive,
    initiative: finiteNumber(threat.initiative, 0),
    perception: finiteNumber(threat.perception, 0),
    sensoryAbilities: textValue(threat.sensoryAbilities),
    defense: finiteNumber(threat.defense, base.defense),
    fortitude: finiteNumber(threat.fortitude, 0),
    reflexes: finiteNumber(threat.reflexes, 0),
    will: finiteNumber(threat.will, 0),
    defensiveAbilities: textValue(threat.defensiveAbilities),
    hitPoints: finiteNumber(threat.hitPoints, base.hitPoints),
    manaPoints: typeof threat.manaPoints === "number" && Number.isFinite(threat.manaPoints) && threat.manaPoints > 0
      ? threat.manaPoints
      : null,
    movements,
    customMovements: Array.isArray(threat.customMovements)
      ? threat.customMovements.map((movement) => ({
        id: textValue(movement?.id, createId()),
        name: textValue(movement?.name),
        meters: finiteNumber(movement?.meters, 0),
      }))
      : [],
    attacks: Array.isArray(threat.attacks) ? threat.attacks.map(normalizeAttack) : [],
    abilities: Array.isArray(threat.abilities) ? threat.abilities.map(normalizeAbility) : [],
    attributes: {
      strength: normalizeAttribute(sourceAttributes.strength, base.attributes.strength),
      dexterity: normalizeAttribute(sourceAttributes.dexterity, base.attributes.dexterity),
      constitution: normalizeAttribute(sourceAttributes.constitution, base.attributes.constitution),
      intelligence: normalizeAttribute(sourceAttributes.intelligence, base.attributes.intelligence),
      wisdom: normalizeAttribute(sourceAttributes.wisdom, base.attributes.wisdom),
      charisma: normalizeAttribute(sourceAttributes.charisma, base.attributes.charisma),
    },
    skills: Array.isArray(threat.skills) ? threat.skills.map(normalizeSkill) : [],
    equipment: textValue(threat.equipment),
    treasure: textValue(threat.treasure),
  };
}
