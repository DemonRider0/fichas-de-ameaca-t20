# Fichas de Ameaça T20

Extensão para Owlbear Rodeo 2 destinada à criação, organização e visualização de fichas de ameaça com diagramação inspirada no padrão editorial de Tormenta20.

## Estado atual

- Editor completo da Ficha de Ameaça.
- Pré-visualização diagramada em largura fixa de 78 mm.
- Fontes Tormenta20, Source Sans Pro, Iowan Old Style e Spirals incorporadas como WOFF2.
- Qualificadores oficiais em SVG.
- Validação de ND, deslocamentos, dados e críticos.
- ND fracionário, atributos nulos e números no padrão brasileiro.
- Deslocamento terrestre removível e deslocamentos personalizados.
- Vários danos extras e efeito livre ao acertar em cada ataque.
- Custos variáveis de PM e observações em perícias.
- Habilidades, sub-habilidades e marcador de magia.
- Formatação controlada com `*itálico*`, `**negrito**` e `__sublinhado__`.
- Biblioteca local com salvamento automático, importação e exportação JSON.
- Cache local separado por conta e sincronização de exclusões entre dispositivos.
- Ficha-exemplo restrita ao modo local; contas novas começam com a biblioteca vazia.
- Interface adaptada para computador e celular.
- Sincronização Supabase ativa, com login por código de e-mail e menu de conta separado da biblioteca.
- Migração automática de fichas antigas para o formato de dados atual.
- Publicação automática no GitHub Pages com verificação dos endereços públicos após cada atualização.

## Instalar a versão publicada

No Owlbear Rodeo, adicione a extensão usando:

`https://demonrider0.github.io/fichas-de-ameaca-t20/manifest.json`

## Executar localmente

```powershell
pnpm install
pnpm dev
```

O manifesto de desenvolvimento fica em `public/manifest.local.json`. No Owlbear Rodeo, use:

`http://localhost:5173/fichas-de-ameaca-t20/manifest.local.json`

O manifesto `public/manifest.json` é reservado à versão publicada.

## Verificações

O roteiro manual completo para a estabilização anterior à versão 1.0.0 está em [`PLANO-DE-TESTES-1.0.0.md`](PLANO-DE-TESTES-1.0.0.md).

```powershell
pnpm test
pnpm build
```

## Sincronização segura

A interface usa login sem senha por código numérico enviado ao e-mail. O código é confirmado dentro da própria janela da extensão, mantendo a sessão no contexto correto do Owlbear. Para ativá-la:

1. Criar um projeto Supabase em uma conta controlada pelo proprietário da extensão.
2. Executar `supabase/schema.sql` no editor SQL do projeto.
3. Copiar `.env.example` para `.env.local`.
4. Preencher a URL do projeto e a chave pública/publishable.
5. Configurar um provedor SMTP.
6. Configurar os modelos **Confirm sign up** e **Magic link or OTP** com a variável `{{ .Token }}`, sem `{{ .ConfirmationURL }}`.

Em um projeto que já possua o banco da extensão, execute também a migração mais recente da pasta `supabase/migrations/`. Ela adiciona os marcadores que impedem uma cópia antiga de recriar, em outro dispositivo, uma ficha já excluída.

Na publicação atual, o Supabase envia os códigos de acesso pelo SMTP transacional do Brevo. A chave SMTP fica armazenada apenas nas configurações protegidas do Supabase e nunca é incluída no código da extensão.

O navegador nunca deve receber uma chave secreta ou `service_role`. As políticas de Row Level Security fazem cada conta acessar somente as próprias fichas.

## Dados pessoais

Quando a sincronização é usada, o serviço armazena o endereço de e-mail usado no acesso e o conteúdo das fichas. A política publicada em `public/privacidade.html` informa finalidade, provedor, retenção, exclusão e canal de contato. A própria extensão permite exportar a biblioteca e excluir voluntariamente a conta e todos os dados na nuvem, preservando as cópias locais.

## Arquivos editoriais

Os arquivos de fonte e os símbolos incorporados foram fornecidos pelo proprietário do projeto. Antes de uma distribuição pública, confirme que as permissões também cobrem redistribuição para terceiros.
