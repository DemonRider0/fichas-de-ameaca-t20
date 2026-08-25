import { useEffect, useState, type ReactNode } from "react";
import {
  createEmptyAbility,
  createEmptyAttack,
  createEmptyCustomMovement,
  createEmptyDamage,
  createEmptySubAbility,
  createId,
  type AttributeValue,
  type Ability,
  type Attack,
  type CustomMovement,
  type DamageRoll,
  type ExclusiveQualifier,
  type InclusiveQualifier,
  type MovementKind,
  type Skill,
  type SubAbility,
  type ThreatSheet,
} from "../domain/threat";
import { issuesForPath, type ValidationIssue } from "../domain/validation";

const challengeLevelOptions = [
  "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "S", "S+",
];

interface ThreatEditorProps {
  threat: ThreatSheet;
  issues: ValidationIssue[];
  onChange: (next: ThreatSheet) => void;
}

function Section({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return <details className="editor-section" open={open}><summary>{title}</summary><div className="section-content">{children}</div></details>;
}

function FieldError({ issues, path }: { issues: ValidationIssue[]; path: string }) {
  const messages = issuesForPath(issues, path);
  if (messages.length === 0) return null;
  return <span className="field-error" role="alert">{messages.join(" ")}</span>;
}

function Field({ label, children, hint, wide = false }: { label: string; children: ReactNode; hint?: string; wide?: boolean }) {
  return <label className={`field ${wide ? "field-wide" : ""}`}><span className="field-label">{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>;
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  path,
  issues,
  allowBlank = false,
}: {
  label: string;
  value: number | undefined | null;
  onChange: (value: number | undefined | null) => void;
  min?: number;
  max?: number;
  step?: number;
  path: string;
  issues: ValidationIssue[];
  allowBlank?: boolean;
}) {
  const acceptsNegative = min === undefined;
  const [draft, setDraft] = useState(value === undefined || value === null ? "" : String(value));

  useEffect(() => {
    setDraft(value === undefined || value === null ? "" : String(value));
  }, [value]);

  return (
    <Field label={label}>
      <input
        type={acceptsNegative ? "text" : "number"}
        inputMode={acceptsNegative ? "decimal" : undefined}
        value={acceptsNegative ? draft : value ?? ""}
        min={min}
        max={max}
        step={step}
        aria-invalid={issuesForPath(issues, path).length > 0}
        onChange={(event) => {
          const raw = event.target.value.replace(",", ".");
          if (acceptsNegative) setDraft(raw);
          if (raw === "-" || raw === "+" || raw === "." || raw === "-.") return;
          if (allowBlank && raw === "") onChange(undefined);
          else onChange(raw === "" ? null : Number(raw));
        }}
        onBlur={() => {
          if (acceptsNegative && ["-", "+", ".", "-."].includes(draft)) {
            setDraft(value === undefined || value === null ? "" : String(value));
          }
        }}
      />
      <FieldError issues={issues} path={path} />
    </Field>
  );
}

function AttributeField({
  label,
  value,
  onChange,
  path,
  issues,
}: {
  label: string;
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  path: string;
  issues: ValidationIssue[];
}) {
  const [draft, setDraft] = useState(value === null ? "" : String(value));

  useEffect(() => {
    setDraft(value === null ? "" : String(value));
  }, [value]);

  return (
    <div className="field attribute-field">
      <span className="field-label">{label}</span>
      <div className="attribute-control">
        <input
          aria-label={`Valor de ${label}`}
          type="text"
          inputMode="decimal"
          disabled={value === null}
          value={draft}
          onChange={(event) => {
            const raw = event.target.value.replace(",", ".");
            setDraft(raw);
            if (["", "-", "+", ".", "-."].includes(raw)) return;
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) onChange(parsed);
          }}
          onBlur={() => {
            if (["", "-", "+", ".", "-."].includes(draft)) {
              setDraft(value === null ? "" : String(value));
            }
          }}
        />
        <label className="check-field attribute-null-toggle">
          <input
            type="checkbox"
            checked={value === null}
            onChange={(event) => onChange(event.target.checked ? null : 0)}
          />
          Nulo (–)
        </label>
      </div>
      <FieldError issues={issues} path={path} />
    </div>
  );
}

function FormattingHint() {
  return <p className="formatting-hint"><strong>Formatação:</strong> *itálico*, **negrito**, __sublinhado__.</p>;
}

function AttackEditor({
  attack,
  index,
  issues,
  onChange,
  onRemove,
}: {
  attack: Attack;
  index: number;
  issues: ValidationIssue[];
  onChange: (attack: Attack) => void;
  onRemove: () => void;
}) {
  const path = `attacks.${index}`;
  const updateDamage = (patch: Partial<DamageRoll>) => onChange({ ...attack, damage: { ...attack.damage, ...patch } });
  const updateExtraDamage = (extraIndex: number, patch: Partial<DamageRoll>) => onChange({
    ...attack,
    extraDamages: attack.extraDamages.map((damage, index) => (
      index === extraIndex ? { ...damage, ...patch } : damage
    )),
  });
  return (
    <div className="repeat-card">
      <div className="repeat-card-header"><strong>{attack.name || "Novo ataque"}</strong><button type="button" className="danger-link" onClick={onRemove}>Remover</button></div>
      <div className="form-grid">
        <Field label="Categoria">
          <select value={attack.category} onChange={(event) => onChange({ ...attack, category: event.target.value as Attack["category"] })}>
            <option value="corpo-a-corpo">Corpo a Corpo</option><option value="a-distancia">À Distância</option>
          </select>
        </Field>
        <Field label="Nome do ataque"><input value={attack.name} onChange={(event) => onChange({ ...attack, name: event.target.value })} /><FieldError issues={issues} path={`${path}.name`} /></Field>
        <NumberField label="Quantidade" value={attack.quantity} min={1} path={`${path}.quantity`} issues={issues} onChange={(value) => onChange({ ...attack, quantity: value ?? 1 })} />
        <NumberField label="Bônus de ataque" value={attack.attackBonus} path={`${path}.attackBonus`} issues={issues} onChange={(value) => onChange({ ...attack, attackBonus: value ?? 0 })} />
        <Field label="Dados de dano"><input value={attack.damage.dice} placeholder="1d6" onChange={(event) => updateDamage({ dice: event.target.value })} /><FieldError issues={issues} path={`${path}.damage.dice`} /></Field>
        <NumberField label="Modificador de dano" value={attack.damage.modifier} path={`${path}.damage.modifier`} issues={issues} onChange={(value) => updateDamage({ modifier: value ?? 0 })} />
        <Field label="Tipo de dano (opcional)"><input value={attack.damage.type} onChange={(event) => updateDamage({ type: event.target.value })} /></Field>
        <NumberField label="Margem de crítico" value={attack.criticalMargin} min={1} max={20} path={`${path}.criticalMargin`} issues={issues} onChange={(value) => onChange({ ...attack, criticalMargin: value ?? 20 })} />
        <NumberField label="Multiplicador de crítico" value={attack.criticalMultiplier} min={2} path={`${path}.criticalMultiplier`} issues={issues} onChange={(value) => onChange({ ...attack, criticalMultiplier: value ?? 2 })} />
        {attack.category === "a-distancia" && <Field label="Alcance (opcional)"><input value={attack.range ?? ""} onChange={(event) => onChange({ ...attack, range: event.target.value })} /></Field>}
        <Field label="Efeito ao acertar (opcional)" wide hint="Aparece depois dos parênteses do ataque."><textarea rows={3} value={attack.effect} onChange={(event) => onChange({ ...attack, effect: event.target.value })} /></Field>
      </div>
      <div className="option-row">
        <button type="button" className="secondary-button" onClick={() => onChange({ ...attack, extraDamages: [...attack.extraDamages, createEmptyDamage()] })}>Adicionar dano extra</button>
        <label><input type="checkbox" checked={attack.triggeredAbility !== undefined} onChange={(event) => onChange({ ...attack, triggeredAbility: event.target.checked ? "" : undefined })} /> Habilidade acionada</label>
      </div>
      {attack.extraDamages.map((extraDamage, extraIndex) => <div className="nested-panel" key={extraIndex}>
        <div className="repeat-card-header"><strong>Dano extra {extraIndex + 1}</strong><button type="button" className="danger-link" onClick={() => onChange({ ...attack, extraDamages: attack.extraDamages.filter((_, index) => index !== extraIndex) })}>Remover</button></div>
        <div className="form-grid">
          <Field label="Dados"><input value={extraDamage.dice} onChange={(event) => updateExtraDamage(extraIndex, { dice: event.target.value })} /><FieldError issues={issues} path={`${path}.extraDamages.${extraIndex}.dice`} /></Field>
          <NumberField label="Bônus" value={extraDamage.modifier} path={`${path}.extraDamages.${extraIndex}.modifier`} issues={issues} onChange={(value) => updateExtraDamage(extraIndex, { modifier: value ?? 0 })} />
          <Field label="Tipo de dano"><input value={extraDamage.type} onChange={(event) => updateExtraDamage(extraIndex, { type: event.target.value })} /><FieldError issues={issues} path={`${path}.extraDamages.${extraIndex}.type`} /></Field>
        </div>
      </div>)}
      {attack.triggeredAbility !== undefined && <div className="nested-panel"><Field label="Nome da habilidade acionada" wide><input value={attack.triggeredAbility} onChange={(event) => onChange({ ...attack, triggeredAbility: event.target.value })} /></Field></div>}
    </div>
  );
}

function SubAbilityEditor({ subAbility, onChange, onRemove, issues, path }: { subAbility: SubAbility; onChange: (value: SubAbility) => void; onRemove: () => void; issues: ValidationIssue[]; path: string }) {
  return <div className="nested-panel">
    <div className="repeat-card-header"><strong>{subAbility.name || "Nova sub-habilidade"}</strong><button type="button" className="danger-link" onClick={onRemove}>Remover</button></div>
    <div className="form-grid">
      <Field label="Nome"><input value={subAbility.name} onChange={(event) => onChange({ ...subAbility, name: event.target.value })} /><FieldError issues={issues} path={`${path}.name`} /></Field>
      <Field label="Ação (opcional)"><input value={subAbility.action} onChange={(event) => onChange({ ...subAbility, action: event.target.value })} /></Field>
      <Field label="Custo em PM (opcional)" hint="Ex.: 4, +4 ou 6 PM e penalidade de –1 PM"><input value={subAbility.manaCost} placeholder="4 PM" onChange={(event) => onChange({ ...subAbility, manaCost: event.target.value })} /></Field>
      <label className="check-field"><input type="checkbox" checked={subAbility.magical} onChange={(event) => onChange({ ...subAbility, magical: event.target.checked })} /> Mágica?</label>
      <Field label="Efeito" wide><textarea rows={3} value={subAbility.effect} onChange={(event) => onChange({ ...subAbility, effect: event.target.value })} /><FieldError issues={issues} path={`${path}.effect`} /></Field>
    </div>
  </div>;
}

function AbilityEditor({ ability, index, onChange, onRemove, issues }: { ability: Ability; index: number; onChange: (value: Ability) => void; onRemove: () => void; issues: ValidationIssue[] }) {
  const path = `abilities.${index}`;
  return <div className="repeat-card">
    <div className="repeat-card-header"><strong>{ability.name || "Nova habilidade"}</strong><button type="button" className="danger-link" onClick={onRemove}>Remover</button></div>
    <div className="form-grid">
      <Field label="Nome"><input value={ability.name} onChange={(event) => onChange({ ...ability, name: event.target.value })} /><FieldError issues={issues} path={`${path}.name`} /></Field>
      <Field label="Ação (opcional)"><input value={ability.action} onChange={(event) => onChange({ ...ability, action: event.target.value })} /></Field>
      <Field label="Custo em PM (opcional)" hint="Ex.: 4, +4 ou 6 PM e penalidade de –1 PM"><input value={ability.manaCost} placeholder="4 PM" onChange={(event) => onChange({ ...ability, manaCost: event.target.value })} /></Field>
      <label className="check-field"><input type="checkbox" checked={ability.magical} onChange={(event) => onChange({ ...ability, magical: event.target.checked })} /> Mágica?</label>
      <Field label="Efeito" wide><textarea rows={4} value={ability.effect} onChange={(event) => onChange({ ...ability, effect: event.target.value })} /><FieldError issues={issues} path={`${path}.effect`} /></Field>
    </div>
    <FormattingHint />
    {ability.subAbilities.map((subAbility, subIndex) => <SubAbilityEditor key={subAbility.id} subAbility={subAbility} issues={issues} path={`${path}.subAbilities.${subIndex}`} onChange={(value) => onChange({ ...ability, subAbilities: ability.subAbilities.map((item) => item.id === value.id ? value : item) })} onRemove={() => onChange({ ...ability, subAbilities: ability.subAbilities.filter((item) => item.id !== subAbility.id) })} />)}
    <button type="button" className="secondary-button" onClick={() => onChange({ ...ability, subAbilities: [...ability.subAbilities, createEmptySubAbility()] })}>Adicionar sub-habilidade</button>
  </div>;
}

export function ThreatEditor({ threat, issues, onChange }: ThreatEditorProps) {
  const update = (patch: Partial<ThreatSheet>) => onChange({ ...threat, ...patch });
  const updateMovement = (kind: MovementKind, value: number | undefined | null) => {
    const movements = { ...threat.movements };
    if (value === undefined || value === null || value <= 0) delete movements[kind];
    else movements[kind] = value;
    update({ movements });
  };
  const updateCustomMovement = (value: CustomMovement) => update({
    customMovements: threat.customMovements.map((movement) => movement.id === value.id ? value : movement),
  });
  const updateAttack = (value: Attack) => update({ attacks: threat.attacks.map((attack) => attack.id === value.id ? value : attack) });
  const updateAbility = (value: Ability) => update({ abilities: threat.abilities.map((ability) => ability.id === value.id ? value : ability) });
  const updateSkill = (value: Skill) => update({ skills: threat.skills.map((skill) => skill.id === value.id ? value : skill) });
  const toggleInclusive = (qualifier: InclusiveQualifier) => update({ inclusiveQualifiers: threat.inclusiveQualifiers.includes(qualifier) ? threat.inclusiveQualifiers.filter((item) => item !== qualifier) : [...threat.inclusiveQualifiers, qualifier] });

  return <form className="threat-editor" onSubmit={(event) => event.preventDefault()}>
    <Section title="Identificação" open>
      <div className="form-grid">
        <Field label="Nome da ameaça" wide><input value={threat.name} onChange={(event) => update({ name: event.target.value })} /><FieldError issues={issues} path="name" /></Field>
        <Field label="Descrição da ameaça" wide><textarea rows={6} value={threat.description} onChange={(event) => update({ description: event.target.value })} /></Field>
        <Field label="Nível de Desafio">
          <div className="challenge-level-control">
            <input maxLength={3} value={threat.challengeLevel} onChange={(event) => update({ challengeLevel: Array.from(event.target.value).slice(0, 3).join("") })} />
            <select aria-label="Escolher um Nível de Desafio" value="" onChange={(event) => {
              if (event.target.value) update({ challengeLevel: event.target.value });
            }}>
              <option value="" disabled>ND</option>
              {challengeLevelOptions.map((value) => <option value={value} key={value}>{value}</option>)}
            </select>
          </div>
          <FieldError issues={issues} path="challengeLevel" />
        </Field>
        <Field label="Tipo"><input value={threat.type} onChange={(event) => update({ type: event.target.value })} /><FieldError issues={issues} path="type" /></Field>
        <Field label="Subtipo (opcional)"><input value={threat.subtype} onChange={(event) => update({ subtype: event.target.value })} /></Field>
        <Field label="Tamanho"><input value={threat.size} onChange={(event) => update({ size: event.target.value })} /><FieldError issues={issues} path="size" /></Field>
      </div>
      <FormattingHint />
      <fieldset className="choice-group"><legend>Qualificador obrigatório</legend>{(["solo", "lacaio", "especial"] as ExclusiveQualifier[]).map((qualifier) => <label key={qualifier}><input type="radio" name="exclusive-qualifier" checked={threat.exclusiveQualifier === qualifier} onChange={() => update({ exclusiveQualifier: qualifier })} /> {qualifier === "lacaio" ? "Lacaio" : qualifier === "especial" ? "Especial" : "Solo"}</label>)}</fieldset>
      <fieldset className="choice-group"><legend>Qualificadores opcionais</legend>{(["bando", "enxame", "chefe-de-fase"] as InclusiveQualifier[]).map((qualifier) => <label key={qualifier}><input type="checkbox" checked={threat.inclusiveQualifiers.includes(qualifier)} onChange={() => toggleInclusive(qualifier)} /> {qualifier === "chefe-de-fase" ? "Chefe de fase" : qualifier[0].toUpperCase() + qualifier.slice(1)}</label>)}</fieldset>
    </Section>

    <Section title="Percepção e defesa" open>
      <div className="form-grid">
        <NumberField label="Iniciativa" value={threat.initiative} path="initiative" issues={issues} onChange={(value) => update({ initiative: value ?? 0 })} />
        <NumberField label="Percepção" value={threat.perception} path="perception" issues={issues} onChange={(value) => update({ perception: value ?? 0 })} />
        <Field label="Habilidades Sensoriais" wide><textarea rows={2} value={threat.sensoryAbilities} onChange={(event) => update({ sensoryAbilities: event.target.value })} /></Field>
        <NumberField label="Defesa" value={threat.defense} min={0} path="defense" issues={issues} onChange={(value) => update({ defense: value ?? 0 })} />
        <NumberField label="Fortitude" value={threat.fortitude} path="fortitude" issues={issues} onChange={(value) => update({ fortitude: value ?? 0 })} />
        <NumberField label="Reflexos" value={threat.reflexes} path="reflexes" issues={issues} onChange={(value) => update({ reflexes: value ?? 0 })} />
        <NumberField label="Vontade" value={threat.will} path="will" issues={issues} onChange={(value) => update({ will: value ?? 0 })} />
        <Field label="Habilidades Especiais Defensivas" wide><textarea rows={2} value={threat.defensiveAbilities} onChange={(event) => update({ defensiveAbilities: event.target.value })} /></Field>
        <NumberField label="Pontos de Vida" value={threat.hitPoints} min={0} path="hitPoints" issues={issues} onChange={(value) => update({ hitPoints: value ?? 0 })} />
        <NumberField label="Pontos de Mana (opcional)" value={threat.manaPoints} min={0} allowBlank path="manaPoints" issues={issues} onChange={(value) => update({ manaPoints: typeof value === "number" && value > 0 ? value : null })} />
      </div>
    </Section>

    <Section title="Deslocamento" open>
      <p className="section-note">Valores em metros. Somente múltiplos de 1,5 são aceitos. O terrestre começa em 9m, mas pode ser apagado.</p>
      <div className="form-grid">
        {([[
          "padrao", "Padrão"
        ], ["escalada", "Escalada"], ["escavacao", "Escavação"], ["natacao", "Natação"], ["voo", "Voo"]] as [MovementKind, string][]).map(([kind, label]) => <NumberField key={kind} label={label} value={threat.movements[kind]} min={0} step={1.5} allowBlank path={`movements.${kind}`} issues={issues} onChange={(value) => updateMovement(kind, value)} />)}
      </div>
      {threat.customMovements.map((movement, index) => <div className="nested-panel" key={movement.id}>
        <div className="repeat-card-header"><strong>Deslocamento adicional {index + 1}</strong><button type="button" className="danger-link" onClick={() => update({ customMovements: threat.customMovements.filter((item) => item.id !== movement.id) })}>Remover</button></div>
        <div className="form-grid">
          <Field label="Nome"><input placeholder="Teleporte" value={movement.name} onChange={(event) => updateCustomMovement({ ...movement, name: event.target.value })} /><FieldError issues={issues} path={`customMovements.${index}.name`} /></Field>
          <NumberField label="Metros" value={movement.meters} min={0} step={1.5} path={`customMovements.${index}.meters`} issues={issues} onChange={(value) => updateCustomMovement({ ...movement, meters: value ?? 0 })} />
        </div>
      </div>)}
      <button type="button" className="secondary-button movement-add-button" onClick={() => update({ customMovements: [...threat.customMovements, createEmptyCustomMovement()] })}>Adicionar outro deslocamento</button>
    </Section>

    <Section title={`Ataques (${threat.attacks.length})`}>
      {threat.attacks.map((attack, index) => <AttackEditor key={attack.id} attack={attack} index={index} issues={issues} onChange={updateAttack} onRemove={() => update({ attacks: threat.attacks.filter((item) => item.id !== attack.id) })} />)}
      <div className="button-row"><button type="button" className="secondary-button" onClick={() => update({ attacks: [...threat.attacks, createEmptyAttack("corpo-a-corpo")] })}>Adicionar Corpo a Corpo</button><button type="button" className="secondary-button" onClick={() => update({ attacks: [...threat.attacks, createEmptyAttack("a-distancia")] })}>Adicionar À Distância</button></div>
    </Section>

    <Section title={`Habilidades (${threat.abilities.length})`}>
      {threat.abilities.map((ability, index) => <AbilityEditor key={ability.id} ability={ability} index={index} issues={issues} onChange={updateAbility} onRemove={() => update({ abilities: threat.abilities.filter((item) => item.id !== ability.id) })} />)}
      <button type="button" className="secondary-button" onClick={() => update({ abilities: [...threat.abilities, createEmptyAbility()] })}>Adicionar habilidade</button>
    </Section>

    <Section title="Atributos, perícias e recompensas">
      <div className="form-grid attributes-editor">
        {([[
          "strength", "Força"
        ], ["dexterity", "Destreza"], ["constitution", "Constituição"], ["intelligence", "Inteligência"], ["wisdom", "Sabedoria"], ["charisma", "Carisma"]] as [keyof ThreatSheet["attributes"], string][]).map(([key, label]) => <AttributeField key={key} label={label} value={threat.attributes[key]} path={`attributes.${key}`} issues={issues} onChange={(value) => update({ attributes: { ...threat.attributes, [key]: value } })} />)}
      </div>
      <h4>Perícias</h4>
      {threat.skills.map((skill, index) => <div className="inline-repeat skill-repeat" key={skill.id}><Field label="Nome"><input value={skill.name} onChange={(event) => updateSkill({ ...skill, name: event.target.value })} /><FieldError issues={issues} path={`skills.${index}.name`} /></Field><NumberField label="Bônus" value={skill.bonus} path={`skills.${index}.bonus`} issues={issues} onChange={(value) => updateSkill({ ...skill, bonus: value ?? 0 })} /><Field label="Observação (opcional)" hint="Ex.: +10 em florestas"><input value={skill.note} onChange={(event) => updateSkill({ ...skill, note: event.target.value })} /></Field><button type="button" className="danger-link" onClick={() => update({ skills: threat.skills.filter((item) => item.id !== skill.id) })}>Remover</button></div>)}
      <button type="button" className="secondary-button" onClick={() => update({ skills: [...threat.skills, { id: createId(), name: "", bonus: 0, note: "" }] })}>Adicionar perícia</button>
      <div className="form-grid closing-fields">
        <Field label="Equipamentos" wide><textarea rows={3} value={threat.equipment} onChange={(event) => update({ equipment: event.target.value })} /></Field>
        <Field label="Tesouro" wide><textarea rows={3} value={threat.treasure} onChange={(event) => update({ treasure: event.target.value })} /></Field>
      </div>
      <FormattingHint />
    </Section>
  </form>;
}
