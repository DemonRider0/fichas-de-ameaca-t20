import { useEffect, useRef, useState, type ReactNode } from "react";

type AccountMenuProps = {
  configured: boolean;
  email?: string;
  loginForm: ReactNode;
  message: string;
  statusText: string;
  onSynchronize: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
};

export function AccountMenu({
  configured,
  email,
  loginForm,
  message,
  statusText,
  onSynchronize,
  onSignOut,
  onDeleteAccount,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const connected = Boolean(email);
  const avatarLetter = email?.trim().charAt(0).toLocaleUpperCase("pt-BR") || "•";

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target && !menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="account-menu-trigger"
        aria-label={open ? "Fechar opções da conta" : "Abrir opções da conta"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="account-options"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={`account-trigger-avatar ${connected ? "connected" : ""}`} aria-hidden="true">
          {connected ? avatarLetter : (
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
            </svg>
          )}
        </span>
        <span className="account-trigger-label">Conta</span>
        <span className="account-trigger-chevron" aria-hidden="true">⌄</span>
      </button>

      {open && (
        <section id="account-options" className="account-popover" role="dialog" aria-label="Conta e sincronização">
          <header className="account-popover-header">
            <div className={`account-avatar ${connected ? "connected" : ""}`} aria-hidden="true">
              {connected ? avatarLetter : (
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
                </svg>
              )}
            </div>
            <div className="account-identity">
              <p>{connected ? "Conta conectada" : "Conta e sincronização"}</p>
              {connected ? <strong title={email}>{email}</strong> : <strong>Biblioteca deste dispositivo</strong>}
            </div>
            <button type="button" className="account-menu-close" aria-label="Fechar menu da conta" onClick={() => setOpen(false)}>×</button>
          </header>

          {!configured ? (
            <div className="account-popover-section">
              <p>A sincronização ainda não foi configurada. Suas fichas continuam salvas neste dispositivo.</p>
            </div>
          ) : connected ? (
            <>
              <div className="account-sync-status">
                <span className="account-sync-dot" aria-hidden="true" />
                <span>{message || statusText}</span>
              </div>
              <div className="account-popover-actions">
                <button type="button" className="account-action-primary" onClick={() => void onSynchronize()}>
                  <span aria-hidden="true">↻</span> Sincronizar agora
                </button>
                <a href={`${import.meta.env.BASE_URL}privacidade.html`} target="_blank" rel="noreferrer">
                  <span aria-hidden="true">▤</span> Política de privacidade
                </a>
                <button type="button" onClick={() => { setOpen(false); void onSignOut(); }}>
                  <span aria-hidden="true">↪</span> Sair da conta
                </button>
              </div>
              <div className="account-danger-zone">
                <p>Dados na nuvem</p>
                <button type="button" onClick={() => void onDeleteAccount()}>Excluir conta e dados</button>
              </div>
            </>
          ) : (
            <div className="account-popover-section account-popover-login">
              <p>Entre para acessar as mesmas fichas nos seus outros dispositivos.</p>
              {loginForm}
              {message && <p className="account-message" role="status">{message}</p>}
              <a className="account-privacy-link" href={`${import.meta.env.BASE_URL}privacidade.html`} target="_blank" rel="noreferrer">Política de privacidade</a>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
