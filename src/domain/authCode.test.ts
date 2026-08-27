import { describe, expect, it } from "vitest";
import { isValidEmailCode, normalizeEmailCode } from "./authCode";

describe("código de acesso por e-mail", () => {
  it("aceita códigos numéricos de seis, sete ou oito dígitos", () => {
    expect(isValidEmailCode("123456")).toBe(true);
    expect(isValidEmailCode("1234567")).toBe(true);
    expect(isValidEmailCode("12345678")).toBe(true);
  });

  it("rejeita códigos curtos, longos ou com outros caracteres", () => {
    expect(isValidEmailCode("12345")).toBe(false);
    expect(isValidEmailCode("123456789")).toBe(false);
    expect(isValidEmailCode("1234ABCD")).toBe(false);
  });

  it("mantém somente os oito primeiros dígitos digitados", () => {
    expect(normalizeEmailCode("12 34-56 789")).toBe("12345678");
  });
});
