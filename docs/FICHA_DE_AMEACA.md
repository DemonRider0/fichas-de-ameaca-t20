# Especificação funcional — Ficha de Ameaça

## Decisões principais

- Plataforma: Owlbear Rodeo 2.
- Largura editorial: 78 mm.
- Altura: dinâmica, sem limite máximo.
- Cor editorial: `#b62a2a`.
- Cor de texto: `#000000`.
- Persistência local: IndexedDB.
- Persistência remota: banco privado por usuário, protegido por autenticação e RLS.
- ND: texto livre, máximo de três caracteres, com suporte explícito a frações como `1/4` e `1/2`.
- Deslocamento: múltiplos de 1,5 m; valores inválidos impedem salvamento.
- Deslocamento terrestre: 9 m por padrão em fichas novas, mas pode ser removido.
- Deslocamentos especiais: tipos oficiais ou tipos personalizados, exibidos em ordem alfabética.
- Crítico: margem inteira de 1 a 20 e multiplicador mínimo x2.
- Ataques repetidos: a quantidade aparece como `x2`, `x3` etc. depois do nome do ataque.
- Crítico padrão 20/x2: omitido; apenas margens ou multiplicadores diferentes do padrão são exibidos.
- Dano extra: vários blocos por ataque.
- Efeito ao acertar: texto livre opcional após os dados mecânicos do ataque.
- Habilidade acionada: no máximo uma por ataque.
- Custos de habilidade: texto livre, para aceitar valores fixos e fórmulas variáveis.
- Atributos nulos: representados por `–`.
- Perícias: aceitam observações opcionais, como especializações e condições.
- Números: formatados em português brasileiro na visualização.

## Versão e migração dos dados

O formato atual das fichas é a versão 2. Fichas da versão 1 são convertidas automaticamente ao serem carregadas ou importadas, mantendo o mesmo identificador e sem criar uma cópia de segurança. Entre as conversões estão o dano extra singular para lista, custos numéricos para texto e a inclusão dos novos campos opcionais.

## Qualificadores

Obrigatórios e excludentes:

1. Solo
2. Lacaio
3. Especial

Opcionais e combináveis, nesta ordem:

1. Bando
2. Enxame
3. Chefe-de-fase

O qualificador excludente sempre aparece antes dos opcionais.

## Tipografia

- Nome narrativo: Tormenta20, 21 pt/16 pt, tracking -0,025 em, espaço entre palavras reduzido em 0,3 em.
- Descrição: Iowan Old Style Roman, 9,5 pt/12 pt, justificada, primeira linha 6 mm, hifenização em português.
- Nome técnico: Tormenta20, 16 pt/12 pt, tracking -0,025 em, espaço entre palavras reduzido em 0,3 em.
- Corpo: Source Sans Pro, 9 pt/12 pt.
- Rótulos: Source Sans Pro Bold com versaletes OpenType reais.
- Marcador mágico: glifo `e` da fonte Spirals, após o efeito completo.

O navegador não oferece o kerning óptico do InDesign. O renderizador usa kerning métrico e o tracking especificado.

## Forma do ND

- Largura: 15,8 mm.
- Altura: 6,577 mm.
- Texto: Tormenta20, 14,5 pt/12 pt.
- Separação entre `ND` e o valor: 6 pt.

## Qualificadores — dimensões

| Qualificador | Largura | Altura |
| --- | ---: | ---: |
| Especial | 2,999 mm | 2,927 mm |
| Chefe-de-fase | 3,087 mm | 2,69 mm |
| Solo | 3,001 mm | 2,806 mm |
| Enxame | 3,398 mm | 2,999 mm |
| Lacaio | 2,533 mm | 3 mm |
| Bando | 3,901 mm | 3,001 mm |

## Linhas editoriais

Os valores de 2 mm abaixo do título e 1 mm nas demais divisões foram preservados como afastamentos. A espessura visual do traço é 0,25 mm, porque aplicar 2 mm/1 mm como espessura produziu linhas incompatíveis com os prints fornecidos. Este valor deve passar por aprovação visual do proprietário.

## Formatação de texto

- `*texto*` ou `_texto_`: itálico.
- `**texto**`: negrito.
- `__texto__`: sublinhado.
- `***texto***`: negrito e itálico.

O texto é interpretado em componentes seguros; HTML digitado pelo usuário não é executado.

## Segurança e conta

O identificador do jogador no Owlbear serve apenas para integração contextual. Ele não é utilizado como credencial de banco. A sincronização usa conta própria por link de e-mail e políticas de banco que comparam o proprietário da ficha com o usuário autenticado.
