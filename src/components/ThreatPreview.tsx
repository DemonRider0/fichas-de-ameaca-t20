import { InlineMarkup } from "./InlineMarkup";
import {
  formatAttack,
  formatAttribute,
  formatClassification,
  formatManaCost,
  formatMovement,
  formatNumber,
  formatSigned,
  formatSkillNote,
  sortedMovements,
  sortedSkills,
} from "../domain/formatters";
import type { Ability, ExclusiveQualifier, InclusiveQualifier, ThreatSheet } from "../domain/threat";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const qualifierAssets: Record<ExclusiveQualifier | InclusiveQualifier, { src: string; label: string }> = {
  solo: { src: assetUrl("assets/icons/qualifier-solo.svg"), label: "Solo" },
  lacaio: { src: assetUrl("assets/icons/qualifier-lacaio.svg"), label: "Lacaio" },
  especial: { src: assetUrl("assets/icons/qualifier-especial.svg"), label: "Especial" },
  bando: { src: assetUrl("assets/icons/qualifier-bando.svg"), label: "Bando" },
  enxame: { src: assetUrl("assets/icons/qualifier-enxame.svg"), label: "Enxame" },
  "chefe-de-fase": { src: assetUrl("assets/icons/qualifier-chefe-de-fase.svg"), label: "Chefe de fase" },
};

const qualifierOrder: InclusiveQualifier[] = ["bando", "enxame", "chefe-de-fase"];

function MagicMarker() {
  return <span className="magic-marker" aria-label="Habilidade mágica">e</span>;
}

function MagicalSuffix() {
  return <span className="magic-marker-suffix"><MagicMarker /></span>;
}

function AbilityHeading({ ability }: { ability: Pick<Ability, "name" | "action" | "manaCost"> }) {
  const details = [ability.action.trim(), formatManaCost(ability.manaCost)].filter(Boolean);
  return (
    <span className="stat-label">
      {ability.name.trim()}
      {details.length > 0 ? ` (${details.join(", ")})` : ""}
    </span>
  );
}

export function ThreatPreview({ threat }: { threat: ThreatSheet }) {
  const descriptionParagraphs = threat.description
    .split(/\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const qualifiers = [
    threat.exclusiveQualifier,
    ...qualifierOrder.filter((qualifier) => threat.inclusiveQualifiers.includes(qualifier)),
  ];
  const movements = sortedMovements(threat);
  const meleeAttacks = threat.attacks.filter((attack) => attack.category === "corpo-a-corpo");
  const rangedAttacks = threat.attacks.filter((attack) => attack.category === "a-distancia");
  const skills = sortedSkills(threat);

  return (
    <article className="threat-sheet" lang="pt-BR" aria-label={`Ficha de ${threat.name}`}>
      <header className="adventure-header">
        <h1>{threat.name || "Nome da Ameaça"}</h1>
        {descriptionParagraphs.map((paragraph, index) => (
          <p className="threat-description" key={`${index}-${paragraph.slice(0, 16)}`}><InlineMarkup text={paragraph} /></p>
        ))}
      </header>

      <section className="technical-sheet">
        <div className="technical-title-row">
          <h2>{threat.name || "Nome da Ameaça"}</h2>
          <div className="nd-badge" aria-label={`Nível de desafio ${threat.challengeLevel}`}>
            <img src={assetUrl("assets/icons/nd-shape.svg")} alt="" />
            <span className="nd-badge-text"><span>ND</span><span className={Array.from(threat.challengeLevel).length >= 3 ? "nd-value-long" : undefined}>{threat.challengeLevel || "—"}</span></span>
          </div>
        </div>

        <p className="classification-row">
          <span>{formatClassification(threat)}</span>{" "}
          <span className="qualifiers" aria-label={qualifiers.map((qualifier) => qualifierAssets[qualifier].label).join(", ")}>
            {qualifiers.map((qualifier) => (
              <img key={qualifier} className={`qualifier qualifier-${qualifier}`} src={qualifierAssets[qualifier].src} alt={qualifierAssets[qualifier].label} />
            ))}
          </span>
        </p>

        <p className="stat-row">
          <span className="stat-label">Iniciativa</span> {formatSigned(threat.initiative)},{" "}
          <span className="stat-label">Percepção</span> {formatSigned(threat.perception)}
          {threat.sensoryAbilities.trim() && <>, <InlineMarkup text={threat.sensoryAbilities} /></>}
        </p>
        <p className="stat-row">
          <span className="stat-label">Defesa</span> {formatNumber(threat.defense)},{" "}
          <span className="stat-label">Fort</span> {formatSigned(threat.fortitude)},{" "}
          <span className="stat-label">Ref</span> {formatSigned(threat.reflexes)},{" "}
          <span className="stat-label">Von</span> {formatSigned(threat.will)}
          {threat.defensiveAbilities.trim() && <>, <InlineMarkup text={threat.defensiveAbilities} /></>}
        </p>
        <p className="stat-row"><span className="stat-label">Pontos de Vida</span> {formatNumber(threat.hitPoints)}</p>
        {movements.length > 0 && <p className="stat-row movement-row">
          <span className="stat-label">Deslocamento</span>{" "}
          {movements.map((movement, index) => (
            <span key={movement.key}>{index > 0 ? ", " : ""}{formatMovement(movement.label, movement.meters)}</span>
          ))}
        </p>}
        {threat.manaPoints !== null && threat.manaPoints > 0 && (
          <p className="stat-row"><span className="stat-label">Pontos de Mana</span> {formatNumber(threat.manaPoints)}</p>
        )}

        {meleeAttacks.length > 0 && (
          <p className="stat-row"><span className="stat-label">Corpo a Corpo</span>{" "}{meleeAttacks.map(formatAttack).join(" e ")}</p>
        )}
        {rangedAttacks.length > 0 && (
          <p className="stat-row"><span className="stat-label">À Distância</span>{" "}{rangedAttacks.map(formatAttack).join(" e ")}</p>
        )}

        {threat.abilities.map((ability) => (
          <div className="ability-block" key={ability.id}>
            <p className="stat-row ability-row">
              <AbilityHeading ability={ability} />{" "}<InlineMarkup text={ability.effect} />
              {ability.magical && <MagicalSuffix />}
            </p>
            {ability.subAbilities.map((subAbility) => {
              const details = [subAbility.action.trim(), formatManaCost(subAbility.manaCost)].filter(Boolean);
              return (
                <p className="sub-ability-row" key={subAbility.id}>
                  <span className="sub-ability-bullet" aria-hidden="true">•</span>{" "}
                  <em>{subAbility.name.trim()}{details.length > 0 ? ` (${details.join(", ")})` : ""}</em>{" "}
                  <InlineMarkup text={subAbility.effect} />
                  {subAbility.magical && <MagicalSuffix />}
                </p>
              );
            })}
          </div>
        ))}

        <p className="attributes-row">
          <span>For {formatAttribute(threat.attributes.strength)}</span>, <span>Des {formatAttribute(threat.attributes.dexterity)}</span>,{" "}
          <span>Con {formatAttribute(threat.attributes.constitution)}</span>, <span>Int {formatAttribute(threat.attributes.intelligence)}</span>,{" "}
          <span>Sab {formatAttribute(threat.attributes.wisdom)}</span>, <span>Car {formatAttribute(threat.attributes.charisma)}</span>
        </p>

        {skills.length > 0 && (
          <p className="stat-row"><span className="stat-label">Perícias</span>{" "}
            {skills.map((skill, index) => (
              <span key={skill.id}>{index > 0 ? ", " : ""}{skill.name.trim()} {formatSigned(skill.bonus)}{skill.note.trim() ? ` ${formatSkillNote(skill.note)}` : ""}</span>
            ))}
          </p>
        )}

        {(threat.equipment.trim() || threat.treasure.trim()) && (
          <p className="stat-row closing-row">
            {threat.equipment.trim() && <><span className="stat-label">Equipamento</span>{" "}<InlineMarkup text={threat.equipment} /></>}
            {threat.equipment.trim() && threat.treasure.trim() && <span aria-hidden="true"> </span>}
            {threat.treasure.trim() && <><span className="stat-label treasure-label">Tesouro</span>{" "}<InlineMarkup text={threat.treasure} /></>}
          </p>
        )}
      </section>
    </article>
  );
}
