# Plano de testes — Fichas de Ameaça T20

Este roteiro cobre a estabilização da extensão antes da versão 1.0.0. Execute os testes na ordem indicada e registre cada resultado como **PASSOU**, **FALHOU**, **ATENÇÃO** ou **NÃO TESTADO**.

## Regras do teste

- Use o manifesto publicado: `https://demonrider0.github.io/fichas-de-ameaca-t20/manifest.json`.
- Recarregue a página do Owlbear antes de começar.
- Exporte uma cópia da biblioteca real antes de qualquer teste.
- Use contas descartáveis nos testes de exclusão e de isolamento. Não exclua a conta principal.
- Para testar duas contas com uma única caixa de entrada Gmail, podem ser usados endereços como `nome+qa-a@gmail.com` e `nome+qa-b@gmail.com`.
- Em falhas visuais, anexe uma captura de tela. Em falhas de dados, informe os passos exatos e os nomes das fichas envolvidas.
- **P0** bloqueia a versão 1.0.0. **P1** deve ser corrigido ou aceito conscientemente antes da publicação.

## Ambientes necessários

1. **Dispositivo A:** navegador principal no computador, com Owlbear.
2. **Dispositivo B:** outro navegador, perfil separado ou outro dispositivo.
3. **Conta QA-A:** usada nos testes de sincronização.
4. **Conta QA-B:** usada apenas para testar isolamento.
5. **Celular:** aparelho real, se disponível. A simulação de tela estreita não substitui completamente esse teste.

## Dados de referência

Use estes valores quando um teste pedir a **Sentinela de QA**:

| Campo | Valor |
|---|---|
| Nome | Sentinela de QA |
| Descrição | Primeiro parágrafo de teste.\nSegundo parágrafo de teste. |
| ND | 5 |
| Tipo | Monstro |
| Subtipo | construto |
| Tamanho | Médio |
| Qualificador obrigatório | Solo |
| Iniciativa | -2 |
| Percepção | +5 |
| Habilidades sensoriais | visão no escuro |
| Defesa | 23 |
| Fortitude | +8 |
| Reflexos | -1 |
| Vontade | +6 |
| Habilidades defensivas | redução de dano 5 |
| Pontos de Vida | 100 |
| Pontos de Mana | vazio |
| Deslocamento padrão | 9m |
| Atributos | For 4, Des -1, Con 3, Int 0, Sab 2, Car -2 |

---

# 1. Instalação, atualização e estrutura

## T01 — Carregamento do manifesto publicado — P0

1. Abra o endereço do manifesto no navegador.
2. Confirme que ele apresenta JSON, sem erro 404.
3. No Owlbear, abra a extensão instalada por esse manifesto.

**Resultado esperado:** a extensão abre sem `Failed to Fetch`, tela branca ou mensagem de recurso ausente.

## T02 — Atualização e cache — P0

1. Recarregue completamente a página do Owlbear.
2. Feche e reabra a extensão.
3. Confirme que o botão de conta aparece no cabeçalho e que o cartão antigo não aparece no fim da biblioteca.

**Resultado esperado:** a interface atual é carregada; nenhum componente de versão anterior permanece por cache.

## T03 — Tamanho normal do painel — P1

1. Abra a extensão no Owlbear em um computador.
2. Observe biblioteca, editor e visualização.
3. Compare a largura com outras extensões comuns do Owlbear.

**Resultado esperado:** painel compacto, sem ocupar largura excessiva e sem rolagem horizontal da interface.

## T04 — Menu de conta — P0

1. Na biblioteca, abra o botão de conta.
2. Feche pelo `×`.
3. Abra novamente e pressione `Esc`.
4. Abra novamente e clique fora da bandeja.
5. Repita na tela de edição e na visualização de uma ficha.

**Resultado esperado:** a bandeja abre sobre o conteúdo, está disponível nas três telas e fecha pelos três métodos sem deslocar a biblioteca.

---

# 2. Login, sessão e conta

## T05 — Login válido por código — P0

1. Saia da conta ou use um navegador sem sessão.
2. Informe o e-mail da Conta QA-A e clique em **Enviar código**.
3. Copie o código recebido, incluindo todos os oito dígitos quando houver oito.
4. Digite o código na própria janela da extensão no Owlbear.
5. Clique em **Entrar**.

**Resultado esperado:** a biblioteca abre conectada e o menu de conta mostra o e-mail correto.

## T06 — Código inválido — P0

1. Solicite um novo código.
2. Digite um código numérico incorreto com o mesmo tamanho.
3. Tente entrar.

**Resultado esperado:** o acesso é recusado, aparece mensagem compreensível e a interface permite tentar novamente.

## T07 — Reenviar código e trocar e-mail — P1

1. Solicite um código.
2. Clique em **Reenviar código** e aguarde o novo e-mail.
3. Clique em **Usar outro e-mail**.
4. Confirme que o formulário volta ao campo de e-mail.

**Resultado esperado:** o fluxo não trava. Se o provedor limitar reenvios muito rápidos, a extensão deve informar que não conseguiu enviar, sem quebrar a tela.

## T08 — Persistência depois de fechar — P0

1. Entre na Conta QA-A.
2. Feche a extensão.
3. Reabra-a.
4. Feche o navegador por completo, abra novamente o Owlbear e reabra a extensão.

**Resultado esperado:** a conta continua conectada e a extensão abre diretamente na biblioteca.

## T09 — Independência de sala — P0

1. Com a Conta QA-A conectada, abra outra sala do Owlbear no mesmo navegador.
2. Abra a extensão nessa sala.

**Resultado esperado:** a mesma conta e biblioteca aparecem; a sessão não depende da sala.

## T10 — Sair e entrar novamente — P0

1. Abra o menu de conta.
2. Clique em **Sair da conta**.
3. Confirme que a tela de login aparece.
4. Entre novamente com um novo código.

**Resultado esperado:** a sessão termina sem apagar fichas e o novo login recupera a biblioteca.

## T11 — Uso somente local — P1

1. Saia da conta.
2. Na tela inicial, escolha **Continuar somente neste dispositivo**.
3. Crie ou edite uma ficha.
4. Abra o menu de conta e inicie o login por ele.

**Resultado esperado:** a biblioteca funciona sem conta e o login posterior pode ser iniciado pela bandeja.

## T12 — Conteúdo do menu conectado — P1

1. Entre na Conta QA-A.
2. Abra o menu de conta.
3. Verifique e-mail, estado da sincronização, sincronização manual, privacidade, saída e exclusão.

**Resultado esperado:** textos não ficam cortados, ações comuns ficam separadas da exclusão e a bandeja cabe na altura da janela.

---

# 3. Biblioteca e persistência local

## T13 — Criar uma ficha — P0

1. Na biblioteca, clique em **+ Nova ficha**.
2. Preencha os dados da Sentinela de QA.
3. Volte à biblioteca.

**Resultado esperado:** a ficha aparece como cartão e mantém nome, ND e classificação.

## T14 — Salvamento automático — P0

1. Abra a Sentinela de QA para edição.
2. Altere o nome para `Sentinela de QA Salva`.
3. Aguarde o indicador terminar de salvar.
4. Recarregue o Owlbear e reabra a ficha.

**Resultado esperado:** o novo nome permanece sem clicar em um botão Salvar.

## T15 — Sair durante uma alteração — P0

1. Altere um campo.
2. Imediatamente clique em **Biblioteca** ou **Ver ficha**.
3. Volte ao editor.

**Resultado esperado:** a alteração é salva antes da troca de tela e não se perde.

## T16 — Busca — P1

1. Tenha pelo menos duas fichas com nomes diferentes.
2. Pesquise uma parte do nome usando letras maiúsculas diferentes do original.
3. Apague a busca.

**Resultado esperado:** somente fichas correspondentes aparecem; a busca ignora diferença entre maiúsculas e minúsculas.

## T17 — Duplicar — P0

1. Na Sentinela de QA, clique em **Duplicar**.
2. Volte à biblioteca.
3. Compare original e cópia.

**Resultado esperado:** surge uma ficha independente com `— cópia` no nome e todos os dados internos preservados.

## T18 — Exportar uma ficha — P0

1. Clique em **Exportar** no cartão da Sentinela de QA.
2. Confirme que um arquivo JSON é baixado.
3. Abra o arquivo apenas para conferir que contém o nome da ficha.

**Resultado esperado:** download válido, sem página de erro e sem exportar fichas diferentes.

## T19 — Exportar e importar a biblioteca — P0

1. Clique em **Exportar biblioteca**.
2. Guarde o JSON baixado.
3. Em um navegador ou perfil de teste vazio, clique em **Importar** e selecione o arquivo.

**Resultado esperado:** todas as fichas compatíveis aparecem com seus dados, ataques, habilidades e perícias.

## T20 — Importação inválida — P0

1. Crie um arquivo de texto simples ou escolha um JSON que não pertença à extensão.
2. Tente importá-lo.

**Resultado esperado:** aparece mensagem de arquivo incompatível e nenhuma ficha existente é alterada.

## T21 — Exclusão local — P0

1. Clique em **Excluir** em uma cópia descartável.
2. Cancele a confirmação e verifique que ela permanece.
3. Repita e confirme.
4. Recarregue o Owlbear.

**Resultado esperado:** cancelar preserva; confirmar remove; a ficha removida não reaparece no mesmo dispositivo.

## T22 — Biblioteca vazia — P1

1. Use uma conta/perfil descartável.
2. Remova todas as fichas.

**Resultado esperado:** aparece um estado vazio com opção de criar a primeira ficha, sem cartão quebrado ou espaço reservado para conta.

---

# 4. Identificação, validação e diagramação básica

## T23 — Campos obrigatórios — P0

1. Em uma ficha descartável, apague nome, ND, tipo e tamanho.
2. Observe os campos e o contador de ajustes.
3. Preencha novamente um campo por vez.

**Resultado esperado:** cada ausência gera mensagem própria; o contador diminui quando o problema é corrigido.

## T24 — Formatos de ND — P0

1. Teste sucessivamente `1/4`, `1/2`, `5`, `S` e `S+` pelo seletor e por digitação.
2. Tente digitar quatro caracteres.
3. Abra a visualização a cada caso.

**Resultado esperado:** formatos válidos aparecem corretamente na forma vermelha; o campo aceita no máximo três caracteres.

## T25 — Nome e descrição em vários parágrafos — P0

1. Use a descrição de dois parágrafos da Sentinela de QA.
2. Adicione um terceiro parágrafo.
3. Abra a visualização.

**Resultado esperado:** todos os parágrafos têm recuo na primeira linha e espaço vertical consistente; nenhum parágrafo se funde com o próximo.

## T26 — Tipo, subtipo e tamanho — P0

1. Preencha Tipo `Monstro`, Subtipo `construto` e Tamanho `Médio`.
2. Visualize.
3. Apague apenas o subtipo e visualize novamente.

**Resultado esperado:** com subtipo aparece `Monstro (construto), Médio`; sem subtipo aparece `Monstro, Médio`, em itálico.

## T27 — Qualificador obrigatório — P0

1. Selecione Solo, depois Lacaio e depois Especial.
2. Observe que somente um fica marcado.
3. Visualize cada opção.

**Resultado esperado:** os três são excludentes e o símbolo escolhido aparece primeiro na linha.

## T28 — Qualificadores opcionais e ordem — P0

1. Marque Chefe de fase, Enxame e Bando, nessa ordem inversa.
2. Visualize.

**Resultado esperado:** todos aparecem depois do qualificador obrigatório, sempre na ordem Bando, Enxame, Chefe de fase.

## T29 — Fontes, cores e símbolos — P1

1. Observe nome narrativo, nome técnico, texto narrativo, estatísticas e marcador mágico.
2. Amplie o navegador temporariamente para conferir contornos.

**Resultado esperado:** Tormenta20, Iowan Old Style, Source Sans Pro e Spirals carregam sem fonte substituta; vermelho é consistente; SVGs não aparecem quebrados.

## T30 — Altura livre e fundo da ficha — P1

1. Visualize uma ficha curta e uma muito longa.
2. Role até o final das duas.

**Resultado esperado:** a ficha cresce verticalmente, não vira coluna dupla e não fica dentro de um retângulo com fundo diferente da própria janela.

---

# 5. Estatísticas e deslocamento

## T31 — Valores positivos e negativos — P0

1. Digite `-2` diretamente em Iniciativa quando o campo estiver em zero.
2. Use Percepção `5`, Fortitude `8`, Reflexos `-1` e Vontade `0`.
3. Visualize.

**Resultado esperado:** é possível começar pelo sinal negativo; visualização mostra `-2`, `+5`, `+8`, `-1` e `+0` adequadamente.

## T32 — Habilidades sensoriais e defensivas — P0

1. Preencha Sensoriais com `visão no escuro`.
2. Preencha Defensivas com `redução de dano 5`.
3. Visualize e depois apague ambas.

**Resultado esperado:** cada texto surge no grupo correto, precedido por vírgula; ao apagar não sobra vírgula vazia.

## T33 — Pontos de Vida e Mana — P0

1. Use PV `100` e deixe PM vazio.
2. Visualize.
3. Use PM `0`, visualize; depois use PM `20` e visualize.

**Resultado esperado:** PV sempre aparece; PM vazio ou zero não gera linha; PM 20 gera `Pontos de Mana 20`.

## T34 — Deslocamento terrestre padrão — P0

1. Crie uma nova ficha.
2. Confira que começa com 9m.
3. Visualize.

**Resultado esperado:** aparece `9m (6q)`.

## T35 — Remover deslocamento terrestre — P0

1. Apague o deslocamento padrão.
2. Deixe todos os outros vazios.
3. Visualize.

**Resultado esperado:** a linha Deslocamento desaparece completamente.

## T36 — Deslocamentos especiais zerados — P0

1. Preencha Escalada, Escavação, Natação e Voo com zero ou deixe vazios.
2. Mantenha apenas o terrestre em 9m.
3. Visualize.

**Resultado esperado:** nenhum deslocamento especial `0m (0q)` aparece.

## T37 — Múltiplos de 1,5 — P0

1. Digite `10` em Voo.
2. Observe o campo e o contador de ajustes.
3. Corrija para `10,5` ou `12`.

**Resultado esperado:** 10 gera erro de múltiplo de 1,5 e não é tratado como ficha válida; o valor corrigido remove o erro e calcula os quadrados corretamente.

## T38 — Ordem de deslocamentos — P0

1. Use terrestre 9m, Voo 12m e Escalada 6m.
2. Adicione deslocamentos personalizados `Teleporte 30m` e `Deslizar 4,5m`, nessa ordem.
3. Visualize.

**Resultado esperado:** terrestre aparece primeiro; os demais ficam em ordem alfabética: Deslizar, Escalada, Teleporte, Voo.

## T39 — Deslocamento personalizado inválido — P1

1. Adicione um deslocamento sem nome.
2. Use zero e depois 2m.
3. Corrija para nome `Salto` e 3m.

**Resultado esperado:** nome vazio, zero e valor não múltiplo geram mensagens; `Salto 3m (2q)` é aceito.

---

# 6. Ataques

## T40 — Ataque corpo a corpo simples — P0

1. Adicione Corpo a Corpo.
2. Use Nome `Garra`, Quantidade 1, Bônus +10, Dano `1d6`, Modificador +5, Tipo `corte`, Margem 20 e Multiplicador 2.
3. Visualize.

**Resultado esperado:** `Garra +10 (1d6+5 corte)`; quantidade 1 e crítico padrão não acrescentam texto desnecessário.

## T41 — Quantidade e bônus negativo — P0

1. Altere Quantidade para 2 e Bônus para -3.
2. Visualize.

**Resultado esperado:** aparece `Garra x2 -3`, sem exigir digitar outro número antes do sinal negativo.

## T42 — Quatro combinações de crítico — P0

Teste separadamente:

1. Margem 20, multiplicador 2.
2. Margem 19, multiplicador 2.
3. Margem 20, multiplicador 3.
4. Margem 19, multiplicador 3.

**Resultado esperado:** respectivamente sem indicação extra, `19`, `x3` e `19/x3`.

## T43 — Vários ataques da mesma categoria — P0

1. Crie `Garra` e `chifres` como Corpo a Corpo.
2. Visualize.

**Resultado esperado:** ambos ficam na mesma linha e são unidos por ` e ` depois do primeiro parêntese.

## T44 — Danos extras — P0

1. Em um ataque, adicione dois danos extras.
2. Use `1d6`, bônus +2, fogo; e `1d4`, bônus 0, frio.
3. Visualize.

**Resultado esperado:** ambos aparecem dentro dos parênteses, na ordem cadastrada, iniciados por `mais` e com tipo obrigatório.

## T45 — Habilidade acionada — P0

1. Marque **Habilidade acionada**.
2. Use o nome `Veneno`.
3. Visualize.

**Resultado esperado:** aparece `mais Veneno` dentro dos parênteses, depois dos danos extras.

## T46 — Ataque à distância e alcance — P0

1. Adicione À Distância.
2. Preencha ataque, dano, dano extra, habilidade acionada e Alcance `médio`.
3. Visualize.

**Resultado esperado:** o alcance aparece por último dentro dos parênteses.

## T47 — Efeito ao acertar — P1

1. Preencha `O alvo fica caído.` no campo Efeito ao acertar.
2. Visualize.

**Resultado esperado:** o efeito aparece depois do fechamento dos parênteses, sem receber `mais` automaticamente.

## T48 — Validações de ataque — P0

1. Deixe nome vazio, quantidade 0 e dados `dano`.
2. Teste margem 0 e 21.
3. Teste multiplicador 1.
4. Adicione dano extra sem tipo.

**Resultado esperado:** cada erro recebe mensagem específica; margem aceita apenas 1 a 20, multiplicador começa em 2 e dados exigem formato como `1d6`.

---

# 7. Habilidades, sub-habilidades e formatação

## T49 — Habilidade básica — P0

1. Adicione uma habilidade chamada `Aura de Medo`.
2. Use Ação `Padrão`, Custo `2` e um efeito curto.
3. Visualize.

**Resultado esperado:** nome, ação e custo aparecem em vermelho; cabeçalho fica `Aura de Medo (Padrão, 2 PM)` e o efeito permanece preto.

## T50 — Campos opcionais da habilidade — P0

1. Visualize apenas com Ação preenchida.
2. Visualize apenas com Custo preenchido.
3. Visualize com ambos vazios.

**Resultado esperado:** parênteses e vírgulas só aparecem quando necessários.

## T51 — Custo textual de PM — P1

1. Use `+4` e visualize.
2. Use `6 PM e penalidade de –1 PM` e visualize.

**Resultado esperado:** `+4` recebe `PM`; o texto complexo é preservado sem duplicar `PM`.

## T52 — Sub-habilidades — P0

1. Adicione duas sub-habilidades à mesma habilidade.
2. Preencha nome, ação, custo e efeito.
3. Visualize.

**Resultado esperado:** cada uma aparece em linha abaixo, com marcador `•`, nome/detalhes em itálico e efeito regular.

## T53 — Marcador mágico — P0

1. Marque **Mágica?** na habilidade e em uma sub-habilidade.
2. Use efeitos que quebrem em duas ou mais linhas.
3. Visualize em diferentes larguras.

**Resultado esperado:** o símbolo Spirals fica depois do último caractere do efeito, sem cobrir texto e sem distância exagerada.

## T54 — Formatação em linha — P0

1. Em um efeito, escreva `*itálico*`, `_itálico_`, `**negrito**`, `__sublinhado__` e `***negrito itálico***`.
2. Repita parte da formatação na descrição, equipamentos e tesouro.
3. Visualize.

**Resultado esperado:** cada marcação recebe o estilo correto e os asteriscos/sublinhados delimitadores não aparecem.

## T55 — Marcação incompleta — P1

1. Escreva um asterisco ou sublinhado sem fechamento.
2. Visualize.

**Resultado esperado:** o texto continua legível, a página não quebra e a marca incompleta é tratada como texto comum.

---

# 8. Atributos, perícias e recompensas

## T56 — Atributos negativos e nulos — P0

1. Preencha os seis atributos, incluindo positivos, zero e negativos.
2. Marque Inteligência como **Nulo (–)**.
3. Visualize.

**Resultado esperado:** ordem For, Des, Con, Int, Sab, Car; negativos são preservados; atributo nulo aparece como `–`.

## T57 — Perícias, ordem e observação — P0

1. Cadastre Furtividade +5, Atletismo -2 e Percepção +8, nessa ordem.
2. Em Furtividade, use observação `+10 em florestas`.
3. Visualize.

**Resultado esperado:** ordem alfabética Atletismo, Furtividade, Percepção; observação aparece entre parênteses.

## T58 — Perícias vazias — P0

1. Remova todas as perícias.
2. Visualize.

**Resultado esperado:** a linha Perícias não existe.

## T59 — Equipamento e tesouro — P0

1. Teste somente Equipamentos.
2. Teste somente Tesouro.
3. Teste ambos.
4. Teste ambos vazios.

**Resultado esperado:** somente os rótulos necessários aparecem; com ambos há separação adequada; com ambos vazios a linha some.

## T60 — Números grandes — P1

1. Use PV `2418` e um valor de atributo ou bônus grande.
2. Visualize.

**Resultado esperado:** números inteiros grandes usam separador brasileiro, como `2.418`.

---

# 9. Sincronização, conflitos e isolamento

## T61 — Primeira sincronização da conta — P0

1. No Dispositivo A, crie uma ficha local chamada `Sincronização Inicial` sem estar conectado.
2. Entre na Conta QA-A.
3. Aguarde o estado sincronizado.
4. Entre na mesma conta no Dispositivo B e sincronize.

**Resultado esperado:** a ficha local é enviada e aparece no Dispositivo B.

## T62 — Criação e edição entre dispositivos — P0

1. No Dispositivo A, crie `Criada no A` e aguarde sincronizar.
2. No Dispositivo B, clique em **Sincronizar agora**.
3. Edite essa ficha no B, aguarde salvar.
4. No A, sincronize novamente.

**Resultado esperado:** criação e alteração circulam nos dois sentidos sem duplicar a ficha.

## T63 — Conflito de edição — P0

1. Deixe a mesma ficha aberta nos dois dispositivos.
2. No A, altere o Tesouro e aguarde salvar.
3. Sem sincronizar B antes, aguarde alguns segundos e altere o Equipamento no B.
4. Sincronize B e depois A.

**Resultado esperado:** a versão modificada por último vence de forma consistente. Registre exatamente qual conteúdo permaneceu; não podem surgir duas cópias com o mesmo nome/identificador.

## T64 — Propagação de exclusão — P0

1. Tenha a mesma ficha sincronizada em A e B.
2. Exclua-a no A e aguarde.
3. No B, sincronize.
4. No A, sincronize novamente.

**Resultado esperado:** a ficha permanece excluída e não é recriada pelo dispositivo que ainda possuía uma cópia local.

## T65 — Importação sincronizada — P1

1. Importe uma ficha no A enquanto conectado.
2. Aguarde salvar.
3. Sincronize B.

**Resultado esperado:** a ficha importada aparece no B com todos os dados.

## T66 — Isolamento entre contas — P0

1. Use a Conta QA-A no Dispositivo A e crie `Segredo da Conta A`.
2. Use a Conta QA-B em um navegador/perfil separado e sincronize.

**Resultado esperado:** QA-B nunca recebe a ficha de QA-A.

## T67 — Troca de conta no mesmo dispositivo — P0

1. Em um perfil descartável, entre na QA-A e sincronize uma ficha exclusiva.
2. Saia da QA-A.
3. Entre na QA-B no mesmo perfil, sem importar nada.

**Resultado esperado:** registre se a ficha local da QA-A aparece ou é enviada à QA-B. Para aprovação pública, dados de uma conta não devem ser transferidos silenciosamente para outra.

## T68 — Falha de internet e recuperação — P0

1. Abra a extensão conectada e depois desconecte a internet.
2. Edite uma ficha e aguarde.
3. Feche e reabra a ficha sem fechar a página do Owlbear.
4. Reconecte a internet e clique em **Sincronizar agora**.

**Resultado esperado:** a edição local não é perdida; a interface sinaliza falha de nuvem; depois da reconexão a sincronização conclui.

## T69 — Exclusão da conta — P0

> Execute somente com conta descartável e depois de exportar a biblioteca.

1. Entre em uma conta descartável com uma ficha de teste.
2. No menu, clique em **Excluir conta e dados**.
3. Cancele a primeira confirmação.
4. Repita e confirme.
5. Escolha continuar somente no dispositivo.

**Resultado esperado:** cancelar não altera nada; confirmar encerra a conta e remove dados da nuvem; as cópias locais permanecem conforme a política de privacidade.

---

# 10. Compatibilidade, estresse e atualização

## T70 — Navegadores de computador — P1

1. Execute T01, T05, T13, T14, T18 e T30 em pelo menos dois navegadores compatíveis com Owlbear.

**Resultado esperado:** comportamento equivalente, sem controles ausentes ou downloads bloqueados sem explicação.

## T71 — Celular real — P0

1. Abra o Owlbear no celular.
2. Entre na conta.
3. Navegue pela biblioteca, menu de conta, editor e visualização.
4. Edite um campo e confirme a sincronização em outro dispositivo.

**Resultado esperado:** não há rolagem horizontal da interface, botões continuam tocáveis, teclado não cobre permanentemente o campo e a edição sincroniza.

## T72 — Ficha longa — P0

1. Crie uma ficha com pelo menos 10 habilidades, 5 sub-habilidades, 6 ataques e descrição longa.
2. Edite campos no começo e no fim.
3. Visualize e role toda a ficha.

**Resultado esperado:** altura permanece livre, nenhuma seção desaparece, a página não trava e não surge coluna dupla.

## T73 — Textos e nomes muito longos — P1

1. Use nome de ameaça, ataque, habilidade, perícia e equipamento excepcionalmente longos.
2. Visualize em computador e celular.

**Resultado esperado:** textos quebram linha sem ultrapassar a ficha, encobrir o ND ou criar rolagem horizontal.

## T74 — Fontes e recursos após recarregar — P0

1. Recarregue o Owlbear com cache normal.
2. Faça uma recarga completa do navegador.
3. Abra uma ficha com todos os qualificadores e marcador mágico.

**Resultado esperado:** fontes, forma de ND, ícones e marcador continuam carregando; não há 404 visível.

## T75 — Preservação após atualização — P0

1. Antes de uma próxima atualização, crie e exporte uma ficha de controle.
2. Atualize/recarregue a extensão.
3. Compare a ficha local e sincronizada com o JSON anterior.

**Resultado esperado:** atualização não apaga nem redefine campos; migrações preservam o conteúdo existente.

---

# Critérios para liberar a versão 1.0.0

- Todos os testes **P0** passaram ou possuem decisão explícita de adiamento documentada.
- Nenhuma falha causa perda, mistura ou exposição de fichas entre contas.
- Login, sessão persistente, sincronização, exportação e importação funcionam em pelo menos dois ambientes.
- Ficha longa funciona sem coluna dupla e sem limite artificial de altura.
- Não há problema visual que impeça leitura ou edição em 420 × 680 e em celular real.
- Uma biblioteca exportada pode ser importada novamente antes da publicação final.

# Modelo para enviar os resultados

Copie este formato e envie os testes em blocos. Não é necessário repetir os passos.

```text
Versão testada: 0.4.0
Ambiente: Windows 11 + Chrome + Owlbear / Android + Chrome
Conta usada: QA-A (não informe o endereço completo)

T01 — PASSOU
T02 — PASSOU
T03 — ATENÇÃO: painel ficou largo ao abrir o editor
T04 — FALHOU: Esc não fechou; captura anexada
T05 — NÃO TESTADO
```

Para cada falha, acrescente:

```text
Esperado:
O que aconteceu:
Consegue repetir sempre? sim/não
Dispositivo e navegador:
Captura ou vídeo, se houver:
```
