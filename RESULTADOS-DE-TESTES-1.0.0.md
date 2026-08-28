# Resultados dos testes — versão 1.0.0

Versão inicialmente testada: **0.4.0**

Próxima candidata para reteste: **0.5.0**

Este arquivo acompanha a execução do roteiro em `PLANO-DE-TESTES-1.0.0.md`.

## Resultados informados pelo usuário

| Teste | Resultado | Observação |
|---|---|---|
| T01 | PASSOU | — |
| T02 | PASSOU | — |
| T03 | PASSOU | — |
| T04 | PASSOU | — |
| T05 | CORREÇÃO APLICADA | Os modelos de primeiro cadastro e de acesso recorrente foram alinhados no Supabase e agora enviam somente o código numérico. Aguardando reteste na 0.5.0. |
| T06 | PASSOU | — |
| T07 | PASSOU | — |
| T08 | PASSOU | — |
| T09 | PASSOU | — |
| T10 | PASSOU | — |
| T11 | PASSOU | — |
| T12 | PASSOU | — |
| T13 | PASSOU | — |
| T14 | PASSOU | — |
| T15 | PASSOU | — |
| T16 | PASSOU | — |
| T17 | PASSOU | — |
| T18 | PASSOU | — |

## Execução pelo Codex

Ambiente: versão pública 0.4.0, biblioteca local isolada, janelas de 420 × 680 e 360 × 640.

Além da navegação manual, os 24 testes automatizados passaram e a compilação de produção terminou corretamente.

| Teste | Resultado | Observação |
|---|---|---|
| T19 | PASSOU | Confirmado manualmente pelo usuário. |
| T20 | PASSOU | Confirmado manualmente pelo usuário. |
| T21 | CORREÇÃO IMPLEMENTADA | A biblioteca agora registra que já foi inicializada; o exemplo só pode surgir no primeiro uso. Aguardando reteste na 0.5.0. |
| T22 | PASSOU | Confirmado manualmente pelo usuário. |
| T23 | PASSOU | Quatro campos obrigatórios produziram quatro mensagens próprias e o contador retornou a zero após a correção. |
| T24 | PASSOU | `1/4`, `1/2`, `5`, `S` e `S+` funcionaram; uma entrada com quatro caracteres foi limitada a três. |
| T25 | PASSOU | Três parágrafos receberam recuo de 6 mm e espaço posterior de 1,5 mm. |
| T26 | PASSOU | Classificação correta com e sem subtipo. |
| T27 | PASSOU | Solo, Lacaio e Especial permaneceram excludentes. |
| T28 | PASSOU | Ordem obtida: Especial, Bando, Enxame, Chefe de fase. |
| T29 | PASSOU | Tormenta20, Iowan Old Style, Source Sans Pro e Spirals carregaram; forma de ND e qualificadores não apresentaram imagem quebrada. |
| T30 | PASSOU | Fundo da ficha, palco e área de rolagem têm a mesma cor; ficha longa continuou em uma coluna. |
| T31 | PASSOU | Saída conferida: `-2`, `+5`, `+8`, `-1` e `+0`. |
| T32 | PASSOU | Textos adicionais apareceram no grupo correto e as vírgulas desapareceram junto com os textos. |
| T33 | PASSOU | PM zero foi omitido e PM 20 apareceu corretamente. |
| T34 | PASSOU | Padrão inicial exibido como `9m (6q)`. |
| T35 | PASSOU | Sem nenhum deslocamento, a linha desapareceu. |
| T36 | PASSOU | Deslocamentos especiais zerados não apareceram. |
| T37 | PASSOU | 10m gerou erro; 10,5m foi aceito e exibido como 7q. |
| T38 | PASSOU | Ordem obtida: padrão, Deslizar, Escalada, Teleporte, Voo. |
| T39 | PASSOU | Nome vazio, zero e 2m foram rejeitados; `Salto 3m (2q)` foi aceito. |
| T40 | PASSOU | `Garra +10 (1d6+5 corte)`. |
| T41 | PASSOU | `Garra x2 -3`, incluindo entrada negativa direta. |
| T42 | PASSOU | Crítico padrão omitido; demais saídas: `19`, `x3` e `19/x3`. |
| T43 | PASSOU | Ataques foram unidos por ` e `. |
| T44 | PASSOU | Dois danos extras foram preservados na ordem cadastrada. |
| T45 | PASSOU | `mais Veneno` apareceu dentro dos parênteses. |
| T46 | PASSOU | Alcance apareceu depois do dano extra e da habilidade acionada. |
| T47 | PASSOU | Efeito ao acertar apareceu depois do fechamento dos parênteses. |
| T48 | PASSOU | Nome, quantidade, dados, margem, multiplicador e tipo do dano extra produziram mensagens próprias. |
| T49 | PASSOU | Cabeçalho obtido: `Aura de Medo (Padrão, 2 PM)`. |
| T50 | PASSOU | Ação isolada, custo isolado e ambos vazios não deixaram pontuação sobrando. |
| T51 | PASSOU | `+4 PM` e texto complexo de PM foram formatados sem duplicação. |
| T52 | PASSOU | Duas sub-habilidades apareceram com marcador, detalhes e efeito. |
| T53 | PASSOU | Marcadores Spirals permaneceram depois dos efeitos principal e secundário, inclusive com quebra de linha e em 420 px. |
| T54 | PASSOU | Itálico, negrito, sublinhado e negrito itálico funcionaram em habilidade, descrição, equipamento e tesouro. |
| T55 | PASSOU | Marcação incompleta permaneceu legível como texto comum. |
| T56 | PASSOU | Ordem dos atributos, negativos e Inteligência nula foram preservados. |
| T57 | PASSOU | Ordem obtida: Atletismo, Furtividade, Percepção; observação ficou entre parênteses. |
| T58 | PASSOU | A ficha de referência sem perícias não exibiu a linha. |
| T59 | PASSOU | Somente equipamento, somente tesouro, ambos e ambos vazios produziram as quatro composições esperadas. |
| T60 | PASSOU | PV 2418 foi exibido como `2.418`. |
| T61 | PASSOU | Confirmado manualmente pelo usuário em dois ambientes. |
| T62 | PASSOU | Confirmado manualmente pelo usuário em dois ambientes. |
| T63 | PASSOU | Confirmado manualmente pelo usuário. |
| T64 | CORREÇÃO IMPLEMENTADA | Foram adicionados marcadores de exclusão locais e na nuvem. Aguardando reteste em dois dispositivos na 0.5.0. |
| T65 | PASSOU | Confirmado manualmente pelo usuário. |
| T66 | PASSOU | Isolamento entre duas contas confirmado manualmente. |
| T67 | CORREÇÃO IMPLEMENTADA | O cache IndexedDB passou a ser separado por conta e da biblioteca sem conta. Aguardando reteste na 0.5.0. |
| T68 | PASSOU | Desconexão e recuperação confirmadas manualmente. |
| T69 | PASSOU | A conta foi excluída e as cópias locais foram preservadas, conforme esperado. |
| T70 | PASSOU | Confirmado manualmente em outro navegador. |
| T71 | PASSOU | Confirmado manualmente em celular físico. |
| T72 | PASSOU | 10 habilidades, 5 sub-habilidades, 6 ataques e descrição longa geraram ficha de aproximadamente 1.897 px, sem coluna dupla nem rolagem horizontal. |
| T73 | PASSOU | Em 420 px e 360 px, textos longos não encobriram o ND nem criaram rolagem horizontal da janela. |
| T74 | PASSOU | Após recarregar, quatro fontes e cinco imagens carregaram sem erro de console ou 404. |
| T75 | NÃO TESTADO | Só pode ser concluído durante a próxima atualização publicada. |

## Resumo

- **70 passaram na versão 0.4.0**.
- **4 correções foram preparadas para a candidata 0.5.0**: T05, T21, T64 e T67.
- **1 permanece pendente**: T75, que só pode ser executado após a próxima atualização.

## Correções da candidata 0.5.0

1. **T64 — exclusão entre dispositivos:** cada exclusão passa a gerar um marcador com data; uma cópia anterior não vence esse marcador durante a sincronização.
2. **T67 — troca de conta:** fichas, exclusões pendentes e cache local passam a usar um escopo próprio para cada usuário.
3. **T05 — primeiro e-mail de uma conta nova:** os dois modelos de autenticação usam o mesmo código numérico digitado dentro da extensão.
4. **T21 — biblioteca vazia:** a ficha de exemplo é criada apenas na primeira inicialização da biblioteca sem conta.
