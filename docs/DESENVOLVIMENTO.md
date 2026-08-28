# Desenvolvimento e manutenção

Este documento reúne as informações necessárias para manter, testar e publicar a extensão **Fichas de Ameaça T20**. A especificação funcional da ficha está em [FICHA_DE_AMEACA.md](./FICHA_DE_AMEACA.md).

## Requisitos

- Node.js 24, correspondente ao ambiente de integração contínua.
- pnpm 11.19.0, conforme o campo `packageManager` de `package.json`.

## Execução local

Instale as dependências e inicie o servidor de desenvolvimento:

```powershell
pnpm install
pnpm dev
```

No Owlbear Rodeo, carregue o manifesto local:

`http://localhost:5173/fichas-de-ameaca-t20/manifest.local.json`

O manifesto público fica em `public/manifest.json`; o manifesto local, em `public/manifest.local.json`.

## Testes e compilação

```powershell
pnpm test
pnpm build
```

Para inspecionar localmente a compilação gerada em `dist/`, use `pnpm preview`. O diretório `dist/` é transitório e não deve ser versionado.

O histórico de qualidade da versão 1.0.0 está arquivado em:

- [Plano de testes](./qualidade/1.0.0/PLANO-DE-TESTES-1.0.0.md)
- [Resultados da homologação](./qualidade/1.0.0/RESULTADOS-DE-TESTES-1.0.0.md)

## Supabase e autenticação

A sincronização usa a URL do projeto e a chave pública do Supabase. Duplique `.env.example` como `.env.local` e preencha somente:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Nunca exponha `service_role`, senha SMTP ou outra credencial administrativa ao navegador. A senha do provedor de e-mail permanece apenas nas configurações protegidas do Supabase.

Para preparar um projeto novo, execute `supabase/schema.sql` no editor SQL. As políticas de Row Level Security isolam as fichas e os marcadores de exclusão por usuário. Os modelos **Confirm sign up** e **Magic link or OTP** devem usar `{{ .Token }}` e não devem redirecionar a autenticação para outra página.

## Migrações

Em instalações que já possuíam a tabela de fichas, execute também `supabase/migrations/20260827_threat_deletions.sql`. Essa migração cria os marcadores usados para propagar exclusões entre dispositivos.

O formato interno das fichas é migrado automaticamente pelo aplicativo. As decisões de modelo e apresentação estão registradas em [FICHA_DE_AMEACA.md](./FICHA_DE_AMEACA.md).

## Publicação no GitHub Pages

A branch `main` aciona `.github/workflows/deploy-pages.yml`. O fluxo instala as dependências com o arquivo de trava, executa os testes, compila a extensão, publica `dist/` e chama `scripts/verify-deployment.mjs`.

As variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` devem estar configuradas como variáveis do repositório no GitHub. Nenhum segredo do banco deve ser incluído no fluxo.

Antes de publicar uma versão:

1. Atualize a versão em `package.json`, `public/manifest.json` e `public/manifest.local.json`.
2. Atualize os parâmetros de versão dos endereços no manifesto público e no local.
3. Execute `pnpm test` e `pnpm build`.
4. Confira o manifesto, o ícone, a interface e `privacidade.html` na compilação.
5. Envie a alteração para `main` e acompanhe a execução do GitHub Pages.

Depois da publicação, o verificador também pode ser executado manualmente com:

```powershell
node scripts/verify-deployment.mjs
```

## Arquivos locais e credenciais

Dependências, compilações, cobertura, caches, arquivos `.env` reais e diretórios temporários são ignorados pelo Git. O arquivo `.env.example` contém somente valores demonstrativos e deve permanecer versionado.

## Recursos editoriais

As fontes e os símbolos incorporados são necessários à diagramação da extensão e foram fornecidos pelo proprietário do projeto. A permissão de redistribuição pública desses recursos deve ser confirmada pelo proprietário; não há licença adicional presumida ou criada por este repositório.
