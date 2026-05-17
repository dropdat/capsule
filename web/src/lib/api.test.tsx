import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useApi, ApiError } from "./api";

// Mock Clerk's useAuth so we don't need a real provider. getToken keeps a
// stable identity across calls — same invariant production relies on.
const getToken = vi.fn(async () => "tok");
vi.mock("@clerk/react", () => ({
  useAuth: () => ({ getToken }),
}));

beforeEach(() => {
  getToken.mockClear();
});

describe("useApi", () => {
  it("returns the same function across re-renders", () => {
    // Regression: useApi() used to return a fresh fn each render. Anything
    // depending on it in useEffect/useCallback re-fired forever, hammering
    // the API and OOMing the browser (ERR_INSUFFICIENT_RESOURCES).
    const { result, rerender } = renderHook(() => useApi());
    const first = result.current;
    rerender();
    rerender();
    rerender();
    expect(result.current).toBe(first);
  });

  it("injects bearer token and parses JSON", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), { status: 200 }),
    );

    const { result } = renderHook(() => useApi());
    const data = await result.current<{ ok: number }>("/api/v1/ping");

    expect(data).toEqual({ ok: 1 });
    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok");
    fetchSpy.mockRestore();
  });

  it("throws ApiError with parsed {error} message on non-2xx", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "nope" }), { status: 402 }),
    );

    const { result } = renderHook(() => useApi());
    const err = await result.current("/api/v1/x").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 402, message: "nope" });
    fetchSpy.mockRestore();
  });
});
