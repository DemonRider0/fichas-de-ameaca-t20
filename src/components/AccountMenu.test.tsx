import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountMenu } from "./AccountMenu";

const mounted: Array<{ container: HTMLDivElement; unmount: () => void }> = [];

afterEach(() => {
  for (const item of mounted.splice(0)) {
    act(() => item.unmount());
    item.container.remove();
  }
});

function renderMenu() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <AccountMenu
        configured
        email="aventureiro@example.com"
        loginForm={<form />}
        message="Biblioteca sincronizada."
        statusText="Sincronizado"
        onSynchronize={vi.fn(async () => undefined)}
        onSignOut={vi.fn(async () => undefined)}
        onDeleteAccount={vi.fn(async () => undefined)}
      />,
    );
  });
  mounted.push({ container, unmount: () => root.unmount() });
  return container;
}

describe("AccountMenu", () => {
  it("abre como bandeja independente e fecha com Escape", () => {
    const container = renderMenu();
    const trigger = container.querySelector<HTMLButtonElement>('[aria-label="Abrir opções da conta"]');

    act(() => trigger?.click());
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain("Sincronizar agora");
    expect(container.textContent).toContain("Política de privacidade");

    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("fecha ao clicar fora da bandeja", () => {
    const container = renderMenu();
    const trigger = container.querySelector<HTMLButtonElement>('[aria-label="Abrir opções da conta"]');

    act(() => trigger?.click());
    act(() => document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true })));

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
