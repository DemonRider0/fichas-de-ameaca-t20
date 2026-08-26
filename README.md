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
- Interface adaptada para computador e celular.
- Camada de sincronização Supabase preparada, mas ainda sem projeto externo configurado.
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

```powershell
pnpm test
pnpm build
```

## Sincronização segura

A interface usa login sem senha por link enviado ao e-mail. Para ativá-la:

1. Criar um projeto Supabase em uma conta controlada pelo proprietário da extensão.
2. Executar `supabase/schema.sql` no editor SQL do projeto.
3. Copiar `.env.example` para `.env.local`.
4. Preencher a URL do projeto e a chave pública/publishable.
5. Configurar os endereços permitidos para retorno dos links de acesso.

O navegador nunca deve receber uma chave secreta ou `service_role`. As políticas de Row Level Security fazem cada conta acessar somente as próprias fichas.

## Dados pessoais

Quando a sincronização for ativada, o serviço armazenará o endereço de e-mail usado no acesso e o conteúdo das fichas. Antes de convidar outras pessoas ou publicar a extensão, deve existir uma política de privacidade simples informando finalidade, provedor, retenção, exclusão e canal de contato. A conta do serviço externo e a aceitação de seus termos precisam ser feitas pelo proprietário da extensão.

## Arquivos editoriais

Os arquivos de fonte e os símbolos incorporados foram fornecidos pelo proprietário do projeto. Antes de uma distribuição pública, confirme que as permissões também cobrem redistribuição para terceiros.
