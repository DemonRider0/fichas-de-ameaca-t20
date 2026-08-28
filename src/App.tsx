import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import OBR from "@owlbear-rodeo/sdk";
import { AccountMenu } from "./components/AccountMenu";
import { ThreatEditor } from "./components/ThreatEditor";
import { ThreatPreview } from "./components/ThreatPreview";
import { EMAIL_CODE_MAX_LENGTH, isValidEmailCode, normalizeEmailCode } from "./domain/authCode";
import { excludeAutomaticExample, shouldCreateExampleThreat } from "./domain/libraryInitialization";
import { reconcileLibrary } from "./domain/synchronization";
import { cloneThreat, createEmptyThreat, createExampleThreat, type ThreatSheet } from "./domain/threat";
import { validateThreat } from "./domain/validation";
import {
  deleteCloudAccount,
  deleteCloudDeletion,
  deleteCloudThreat,
  getCloudClient,
  getCloudSession,
  isCloudConfigured,
  listCloudDeletions,
  listCloudThreats,
  saveCloudThreat,
  sendEmailCode,
  signOutCloud,
  verifyEmailCode,
} from "./services/cloudRepository";
import {
  clearLocalScope,
  deleteLocalDeletion,
  deleteLocalThreat,
  isLocalScopeInitialized,
  listLocalDeletions,
  listLocalThreats,
  LOCAL_LIBRARY_SCOPE,
  markLocalScopeInitialized,
  parseThreatImport,
  saveLocalDeletion,
  saveLocalThreat,
  serializeThreats,
  userLibraryScope,
} from "./services/localRepository";

type SaveState = "idle" | "saving" | "saved" | "error";
type AppView = "library" | "editor" | "preview";

function downloadJson(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function mergeThreats(local: ThreatSheet[], cloud: ThreatSheet[]): ThreatSheet[] {
  const merged = new Map<string, ThreatSheet>();
  for (const threat of [...local, ...cloud]) {
    const current = merged.get(threat.id);
    if (!current || threat.updatedAt > current.updatedAt) merged.set(threat.id, threat);
  }
  return [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export default function App() {
  const [threats, setThreats] = useState<ThreatSheet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<AppView>("library");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [usingLocalOnly, setUsingLocalOnly] = useState(false);
  const [activeScope, setActiveScope] = useState(LOCAL_LIBRARY_SCOPE);
  const [accountMessage, setAccountMessage] = useState("");
  const [owlbearReady, setOwlbearReady] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const latestThreatsRef = useRef<ThreatSheet[]>([]);
  const activeScopeRef = useRef(LOCAL_LIBRARY_SCOPE);
  const synchronizedUserRef = useRef<string | null>(null);
  const suppressSessionLibrarySwitchRef = useRef(false);
  latestThreatsRef.current = threats;
  activeScopeRef.current = activeScope;

  const selectedThreat = threats.find((threat) => threat.id === selectedId) ?? null;
  const issues = useMemo(() => selectedThreat ? validateThreat(selectedThreat) : [], [selectedThreat]);
  const selectedIsDirty = selectedThreat ? dirtyIds.has(selectedThreat.id) : false;
  const filteredThreats = useMemo(
    () => threats.filter((threat) => threat.name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))),
    [search, threats],
  );

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const cloudSession = await getCloudSession();
        let initialThreats: ThreatSheet[];
        let initialScope = LOCAL_LIBRARY_SCOPE;
        if (cloudSession) {
          initialScope = userLibraryScope(cloudSession.user.id);
          try {
            initialThreats = await synchronizeUserLibrary(cloudSession.user.id, true);
          } catch (error) {
            console.error(error);
            // Sem rede, abre somente o cache pertencente a esta conta. Nunca
            // mistura a biblioteca anônima nem fabrica uma ficha de exemplo.
            initialThreats = await listLocalThreats(initialScope);
            setSaveState("error");
            setAccountMessage("Sem conexão com a nuvem. Exibindo as fichas salvas desta conta neste dispositivo.");
          }
          synchronizedUserRef.current = cloudSession.user.id;
        } else {
          initialThreats = await loadLocalLibrary();
        }
        if (!active) return;
        setSession(cloudSession);
        setActiveScope(initialScope);
        setThreats(initialThreats);
        setSelectedId(initialThreats[0]?.id ?? null);
      } catch (error) {
        console.error(error);
        if (active) {
          setThreats([]);
          setSelectedId(null);
          setSaveState("error");
          setAccountMessage("Não foi possível abrir a biblioteca deste dispositivo.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialize();

    const cloud = getCloudClient();
    const subscription = cloud?.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)).data.subscription;
    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id ?? null;
    if (!userId) {
      synchronizedUserRef.current = null;
      if (suppressSessionLibrarySwitchRef.current) return;
      if (!loading && activeScope !== LOCAL_LIBRARY_SCOPE) void activateLocalLibrary(false);
      return;
    }
    if (loading || synchronizedUserRef.current === userId) return;
    synchronizedUserRef.current = userId;
    void activateUserLibrary(userId, true);
  }, [activeScope, loading, session?.user.id]);

  useEffect(() => {
    if (window.self === window.top) return;
    OBR.onReady(() => setOwlbearReady(true));
  }, []);

  useEffect(() => {
    if (!selectedThreat || loading || !selectedIsDirty) return;
    const threatToSave = selectedThreat;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        const scope = activeScopeRef.current;
        await deleteLocalDeletion(scope, threatToSave.id);
        await saveLocalThreat(scope, threatToSave);
        if (session && scope === userLibraryScope(session.user.id)) await saveCloudThreat(threatToSave);
        const latest = latestThreatsRef.current.find((threat) => threat.id === threatToSave.id);
        if (latest?.updatedAt === threatToSave.updatedAt) {
          setDirtyIds((current) => {
            const next = new Set(current);
            next.delete(threatToSave.id);
            return next;
          });
          setSaveState("saved");
        }
      } catch (error) {
        console.error(error);
        setSaveState("error");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [activeScope, loading, selectedIsDirty, selectedThreat, session]);

  useEffect(() => {
    const preventAccidentalClose = (event: BeforeUnloadEvent) => {
      if (dirtyIds.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventAccidentalClose);
    return () => window.removeEventListener("beforeunload", preventAccidentalClose);
  }, [dirtyIds]);

  function markSaved(id: string, updatedAt: string) {
    const latest = latestThreatsRef.current.find((threat) => threat.id === id);
    if (latest?.updatedAt !== updatedAt) return;
    setDirtyIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setSaveState("saved");
  }

  async function loadLocalLibrary(): Promise<ThreatSheet[]> {
    let local = await listLocalThreats(LOCAL_LIBRARY_SCOPE);
    const initialized = await isLocalScopeInitialized(LOCAL_LIBRARY_SCOPE);
    if (shouldCreateExampleThreat(initialized, local.length)) {
      const example = createExampleThreat();
      await saveLocalThreat(LOCAL_LIBRARY_SCOPE, example);
      local = [example];
    }
    if (!initialized) {
      await markLocalScopeInitialized(LOCAL_LIBRARY_SCOPE);
    }
    return local;
  }

  async function synchronizeUserLibrary(userId: string, adoptLocal: boolean): Promise<ThreatSheet[]> {
    const scope = userLibraryScope(userId);
    const [accountThreats, accountDeletions, cloudThreats, cloudDeletions, localOnlyThreats] = await Promise.all([
      listLocalThreats(scope),
      listLocalDeletions(scope),
      listCloudThreats(),
      listCloudDeletions(),
      adoptLocal
        ? listLocalThreats(LOCAL_LIBRARY_SCOPE).then(excludeAutomaticExample)
        : Promise.resolve([]),
    ]);
    const localCandidates = mergeThreats(accountThreats, localOnlyThreats);
    const reconciled = reconcileLibrary(localCandidates, cloudThreats, accountDeletions, cloudDeletions);

    await Promise.all(reconciled.deletions.map(async (deletion) => {
      await saveLocalDeletion(scope, deletion);
      await deleteLocalThreat(scope, deletion.id);
      await deleteCloudThreat(deletion.id, deletion.deletedAt);
    }));
    await Promise.all(reconciled.threats.map(async (threat) => {
      await deleteLocalDeletion(scope, threat.id);
      await saveLocalThreat(scope, threat);
      await saveCloudThreat(threat);
    }));
    await markLocalScopeInitialized(scope);

    if (adoptLocal) {
      await clearLocalScope(LOCAL_LIBRARY_SCOPE);
      await markLocalScopeInitialized(LOCAL_LIBRARY_SCOPE);
    }
    return reconciled.threats;
  }

  async function activateUserLibrary(userId: string, afterSignIn: boolean): Promise<void> {
    setSaveState("saving");
    try {
      const scope = userLibraryScope(userId);
      const synchronized = await synchronizeUserLibrary(userId, true);
      setActiveScope(scope);
      setThreats(synchronized);
      setSelectedId(synchronized[0]?.id ?? null);
      setDirtyIds(new Set());
      setUsingLocalOnly(false);
      setView("library");
      setSaveState("saved");
      setAccountMessage(afterSignIn ? "Conta conectada e biblioteca sincronizada." : "Biblioteca sincronizada.");
    } catch (error) {
      console.error(error);
      synchronizedUserRef.current = null;
      setSaveState("error");
      setAccountMessage("Não foi possível sincronizar agora. Suas fichas locais continuam disponíveis.");
    }
  }

  async function activateLocalLibrary(showLibrary: boolean): Promise<void> {
    try {
      const local = await loadLocalLibrary();
      setActiveScope(LOCAL_LIBRARY_SCOPE);
      setThreats(local);
      setSelectedId(local[0]?.id ?? null);
      setDirtyIds(new Set());
      if (showLibrary) {
        setUsingLocalOnly(true);
        setView("library");
        setAccountMessage("");
      }
    } catch (error) {
      console.error(error);
      setSaveState("error");
      setAccountMessage("Não foi possível abrir a biblioteca deste dispositivo.");
    }
  }

  async function saveImmediately(threat: ThreatSheet): Promise<boolean> {
    setSaveState("saving");
    try {
      const scope = activeScopeRef.current;
      await deleteLocalDeletion(scope, threat.id);
      await saveLocalThreat(scope, threat);
      if (session && scope === userLibraryScope(session.user.id)) await saveCloudThreat(threat);
      markSaved(threat.id, threat.updatedAt);
      return true;
    } catch (error) {
      console.error(error);
      setSaveState("error");
      window.alert("Não foi possível salvar as alterações. A tela de edição continuará aberta para evitar perda de dados.");
      return false;
    }
  }

  async function leaveEditor(target: AppView) {
    if (selectedThreat && dirtyIds.has(selectedThreat.id)) {
      const saved = await saveImmediately(selectedThreat);
      if (!saved) return;
    }
    setView(target);
  }

  function updateSelected(next: ThreatSheet) {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setThreats((current) => current.map((threat) => threat.id === updated.id ? updated : threat));
    setDirtyIds((current) => new Set(current).add(updated.id));
  }

  function addThreat() {
    const threat = createEmptyThreat();
    setThreats((current) => [threat, ...current]);
    setSelectedId(threat.id);
    setDirtyIds((current) => new Set(current).add(threat.id));
    setView("editor");
  }

  function openEditor(threat: ThreatSheet) {
    setSelectedId(threat.id);
    setView("editor");
  }

  function openPreview(threat: ThreatSheet) {
    setSelectedId(threat.id);
    setView("preview");
  }

  function duplicateThreat(source: ThreatSheet) {
    const duplicate = cloneThreat(source);
    setThreats((current) => [duplicate, ...current]);
    setSelectedId(duplicate.id);
    setDirtyIds((current) => new Set(current).add(duplicate.id));
    setView("editor");
  }

  async function removeThreat(threat: ThreatSheet) {
    if (!window.confirm(`Excluir “${threat.name}”?`)) return;
    const scope = activeScopeRef.current;
    const deletion = { id: threat.id, deletedAt: new Date().toISOString() };
    await saveLocalDeletion(scope, deletion);
    await deleteLocalThreat(scope, threat.id);
    if (session && scope === userLibraryScope(session.user.id)) {
      try {
        await deleteCloudThreat(threat.id, deletion.deletedAt);
      } catch (error) {
        console.error(error);
        setSaveState("error");
        setAccountMessage("A ficha foi removida deste dispositivo e será excluída da nuvem na próxima sincronização.");
      }
    }
    const remaining = threats.filter((item) => item.id !== threat.id);
    setThreats(remaining);
    setDirtyIds((current) => {
      const next = new Set(current);
      next.delete(threat.id);
      return next;
    });
    if (selectedId === threat.id) setSelectedId(remaining[0]?.id ?? null);
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    try {
      const imported = parseThreatImport(await file.text());
      const scope = activeScopeRef.current;
      await Promise.all(imported.map(async (threat) => {
        await deleteLocalDeletion(scope, threat.id);
        await saveLocalThreat(scope, threat);
        if (session && scope === userLibraryScope(session.user.id)) await saveCloudThreat(threat);
      }));
      const combined = mergeThreats(threats, imported);
      setThreats(combined);
      setSelectedId(imported[0]?.id ?? selectedId);
      setView("library");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível importar o arquivo.");
    } finally {
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  async function handleSendCode() {
    setAccountMessage("");
    setAuthBusy(true);
    try {
      await sendEmailCode(email.trim());
      setCodeSent(true);
      setEmailCode("");
      setAccountMessage("Enviamos um código de acesso para seu e-mail.");
    } catch (error) {
      console.error(error);
      setAccountMessage("Não foi possível enviar o código agora. Tente novamente em instantes.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleVerifyCode() {
    setAccountMessage("");
    setAuthBusy(true);
    try {
      const nextSession = await verifyEmailCode(email.trim(), emailCode.trim());
      setUsingLocalOnly(false);
      setSession(nextSession);
      setCodeSent(false);
      setEmailCode("");
      setAccountMessage("Conta conectada. Sincronizando sua biblioteca…");
    } catch (error) {
      console.error(error);
      setAccountMessage("Código inválido ou expirado. Confira o e-mail ou solicite um novo código.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    setAccountMessage("");
    try {
      await signOutCloud();
      setUsingLocalOnly(false);
      setCodeSent(false);
      setEmailCode("");
    } catch (error) {
      console.error(error);
      setAccountMessage("Não foi possível sair da conta agora.");
    }
  }

  async function synchronizeNow() {
    if (!session) return;
    synchronizedUserRef.current = session.user.id;
    await activateUserLibrary(session.user.id, false);
  }

  async function handleDeleteCloudAccount() {
    if (!session) return;
    const confirmed = window.confirm(
      "Excluir permanentemente sua conta e todas as fichas armazenadas na nuvem? As cópias salvas neste dispositivo serão preservadas.",
    );
    if (!confirmed) return;
    setAccountMessage("Excluindo conta e dados na nuvem…");
    suppressSessionLibrarySwitchRef.current = true;
    try {
      const accountScope = userLibraryScope(session.user.id);
      const accountCopies = [...latestThreatsRef.current];
      await deleteCloudAccount();
      const existingLocal = await listLocalThreats(LOCAL_LIBRARY_SCOPE);
      const preserved = mergeThreats(existingLocal, accountCopies);
      await Promise.all(preserved.map((threat) => saveLocalThreat(LOCAL_LIBRARY_SCOPE, threat)));
      await markLocalScopeInitialized(LOCAL_LIBRARY_SCOPE);
      await clearLocalScope(accountScope);
      synchronizedUserRef.current = null;
      setActiveScope(LOCAL_LIBRARY_SCOPE);
      setThreats(preserved);
      setSelectedId(preserved[0]?.id ?? null);
      setDirtyIds(new Set());
      setSession(null);
      setAccountMessage("Conta e dados na nuvem excluídos. Sua biblioteca deste dispositivo foi preservada.");
    } catch (error) {
      console.error(error);
      setAccountMessage("Não foi possível excluir a conta. Nenhuma ficha local foi removida.");
    } finally {
      suppressSessionLibrarySwitchRef.current = false;
    }
  }

  function renderLoginForm(compact = false) {
    return (
      <form
        className={compact ? "account-login-form" : "login-form"}
        onSubmit={(event) => {
          event.preventDefault();
          void (codeSent ? handleVerifyCode() : handleSendCode());
        }}
      >
        {!codeSent ? (
          <>
            <label htmlFor={compact ? "account-email" : "login-email"}>E-mail</label>
            <input
              id={compact ? "account-email" : "login-email"}
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit" className={compact ? undefined : "primary-button"} disabled={authBusy || !email.trim()}>
              {authBusy ? "Enviando…" : "Enviar código"}
            </button>
          </>
        ) : (
          <>
            <p className="code-destination">Código enviado para <strong>{email.trim()}</strong>.</p>
            <label htmlFor={compact ? "account-code" : "login-code"}>Código recebido por e-mail</label>
            <input
              id={compact ? "account-code" : "login-code"}
              className="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,8}"
              maxLength={EMAIL_CODE_MAX_LENGTH}
              placeholder="00000000"
              value={emailCode}
              onChange={(event) => setEmailCode(normalizeEmailCode(event.target.value))}
              required
              autoFocus
            />
            <button type="submit" className={compact ? undefined : "primary-button"} disabled={authBusy || !isValidEmailCode(emailCode)}>
              {authBusy ? "Entrando…" : "Entrar"}
            </button>
            <button type="button" className="text-button" disabled={authBusy} onClick={() => void handleSendCode()}>Reenviar código</button>
            <button type="button" className="text-button" disabled={authBusy} onClick={() => { setCodeSent(false); setEmailCode(""); setAccountMessage(""); }}>Usar outro e-mail</button>
          </>
        )}
      </form>
    );
  }

  const statusText = saveState === "saving"
    ? "Salvando…"
    : saveState === "error"
      ? "Erro ao salvar"
      : view === "editor" && issues.length > 0
        ? `Rascunho salvo · ${issues.length} ${issues.length === 1 ? "ajuste pendente" : "ajustes pendentes"}`
        : session
          ? "Sincronizado"
          : "Salvo neste dispositivo";

  if (loading) return <main className="loading-screen"><span className="spinner" /> Preparando sua biblioteca…</main>;

  if (isCloudConfigured() && !session && !usingLocalOnly) {
    return (
      <div className="app-shell view-login">
        <header className="app-header">
          <div><p className="eyebrow">Tormenta20</p><h1>Fichas de Ameaça</h1></div>
          <div className="header-status"><span className="status-dot" />{owlbearReady && <span className="owlbear-badge">Owlbear conectado</span>}</div>
        </header>
        <main className="login-screen app-screen">
          <section className="login-card">
            <p className="eyebrow">Sua biblioteca</p>
            <h2>Entrar na extensão</h2>
            <p>Use seu e-mail para acessar as mesmas fichas em qualquer dispositivo. Não é necessário criar uma senha.</p>
            {renderLoginForm()}
            {accountMessage && <p className="login-message" role="status">{accountMessage}</p>}
            <div className="login-separator"><span>ou</span></div>
            <button type="button" className="secondary-button local-only-button" onClick={() => void activateLocalLibrary(true)}>Continuar somente neste dispositivo</button>
            <p className="privacy-note">Seus dados serão tratados conforme a <a href={`${import.meta.env.BASE_URL}privacidade.html`} target="_blank" rel="noreferrer">política de privacidade</a>.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`app-shell view-${view}`}>
      <header className="app-header">
        <div><p className="eyebrow">Tormenta20</p><h1>Fichas de Ameaça</h1></div>
        <div className="header-actions">
          <div className="header-status">
            <span className={`status-dot ${saveState}`} />
            <span>{statusText}</span>
            {owlbearReady && <span className="owlbear-badge">Owlbear conectado</span>}
          </div>
          <AccountMenu
            configured={isCloudConfigured()}
            email={session?.user.email}
            loginForm={renderLoginForm(true)}
            message={accountMessage}
            statusText={statusText}
            onSynchronize={synchronizeNow}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteCloudAccount}
          />
        </div>
      </header>

      {view === "library" && (
        <main className="library-screen app-screen">
          <div className="screen-container">
            <div className="screen-heading">
              <div><p className="eyebrow">Sua coleção</p><h2>Biblioteca de ameaças</h2><p>Abra uma ficha para consultar sua versão diagramada ou use o lápis para editar.</p></div>
              <button type="button" className="primary-button" onClick={addThreat}>+ Nova ficha</button>
            </div>

            <div className="library-toolbar">
              <input className="search-input" type="search" placeholder="Buscar ameaça pelo nome" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button type="button" className="secondary-button" onClick={() => importInputRef.current?.click()}>Importar</button>
              <button type="button" className="secondary-button" disabled={threats.length === 0} onClick={() => downloadJson("biblioteca-ameacas-t20.json", serializeThreats(threats))}>Exportar biblioteca</button>
              <input ref={importInputRef} hidden type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />
            </div>

            <section className="threat-card-grid" aria-label="Fichas salvas">
              {filteredThreats.map((threat) => {
                const threatIssues = validateThreat(threat);
                return (
                  <article className="threat-card" key={threat.id}>
                    <button type="button" className="threat-card-open" onClick={() => openPreview(threat)}>
                      <span className="threat-card-nd">ND {threat.challengeLevel || "—"}</span>
                      <strong>{threat.name || "Ficha sem nome"}</strong>
                      <span>{threat.type || "Tipo não informado"}{threat.subtype.trim() ? ` (${threat.subtype.trim()})` : ""}, {threat.size || "tamanho não informado"}</span>
                      <small>{threatIssues.length === 0 ? "Pronta para visualizar" : `${threatIssues.length} ${threatIssues.length === 1 ? "ajuste pendente" : "ajustes pendentes"}`}</small>
                    </button>
                    <div className="threat-card-actions">
                      <button type="button" onClick={() => openEditor(threat)} aria-label={`Editar ${threat.name}`}><span aria-hidden="true">✎</span> Editar</button>
                      <button type="button" onClick={() => duplicateThreat(threat)}>Duplicar</button>
                      <button type="button" onClick={() => downloadJson(`${threat.name || "ameaca"}.json`, serializeThreats([threat]))}>Exportar</button>
                      <button type="button" onClick={() => void removeThreat(threat)}>Excluir</button>
                    </div>
                  </article>
                );
              })}
              {filteredThreats.length === 0 && (
                <div className="empty-state library-empty">
                  <h3>{threats.length === 0 ? "Sua biblioteca está vazia" : "Nenhuma ficha encontrada"}</h3>
                  <p>{threats.length === 0 ? "Crie sua primeira ameaça para começar." : "Tente buscar por outro nome."}</p>
                  {threats.length === 0 && <button type="button" className="primary-button" onClick={addThreat}>Criar a primeira ficha</button>}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {view === "editor" && (
        <main className="workspace-screen app-screen">
          <div className="workspace-toolbar">
            <button type="button" className="back-button" onClick={() => void leaveEditor("library")}>← Biblioteca</button>
            <div className="workspace-title"><p className="eyebrow">Editando</p><h2>{selectedThreat?.name || "Nova ameaça"}</h2></div>
            <div className="workspace-actions">
              {issues.length > 0 && <span className="issue-badge">{issues.length} {issues.length === 1 ? "ajuste" : "ajustes"}</span>}
              <button type="button" className="primary-button" disabled={!selectedThreat} onClick={() => void leaveEditor("preview")}>Ver ficha</button>
            </div>
          </div>
          <div className="editor-scroll">
            <div className="editor-container">
              <p className="autosave-note">As alterações são salvas automaticamente. Ao sair, qualquer alteração pendente será salva primeiro.</p>
              {selectedThreat ? <ThreatEditor threat={selectedThreat} issues={issues} onChange={updateSelected} /> : <div className="empty-state"><h2>Ficha não encontrada</h2><button className="primary-button" onClick={() => setView("library")}>Voltar à biblioteca</button></div>}
            </div>
          </div>
        </main>
      )}

      {view === "preview" && (
        <main className="workspace-screen app-screen">
          <div className="workspace-toolbar">
            <button type="button" className="back-button" onClick={() => setView("library")}>← Biblioteca</button>
            <div className="workspace-title"><p className="eyebrow">Visualização</p><h2>{selectedThreat?.name || "Ficha diagramada"}</h2></div>
            <div className="workspace-actions">
              {selectedThreat && <button type="button" className="secondary-button" onClick={() => downloadJson(`${selectedThreat.name || "ameaca"}.json`, serializeThreats([selectedThreat]))}>Exportar</button>}
              {selectedThreat && <button type="button" className="primary-button" onClick={() => openEditor(selectedThreat)}><span aria-hidden="true">✎</span> Editar</button>}
            </div>
          </div>
          <div className="viewer-scroll">
            <div className="preview-stage">
              {selectedThreat ? <ThreatPreview threat={selectedThreat} /> : <div className="empty-state"><h2>Ficha não encontrada</h2></div>}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
