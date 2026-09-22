import { describe, expect, it } from "vitest";

import {
  controlEnvelopeSchema,
  handshakeRequestSchema,
  handshakeResponseSchema,
  protocolErrorSchema,
} from "../src/index.js";

const nonce = "a".repeat(32);

describe("protocol wire schemas", () => {
  it("accepts a versioned handshake pair with a game identity", () => {
    const request = handshakeRequestSchema.parse({
      kind: "handshake.request",
      protocol: 1,
      requestId: "request-1",
      applicationVersion: "0.1.0",
      nonce,
    });

    const response = handshakeResponseSchema.parse({
      kind: "handshake.response",
      protocol: 1,
      requestId: request.requestId,
      sessionId: "session-1",
      runtime: { version: "0.1.0", adapterId: "nms-courier.runtime" },
      game: {
        processId: 1234,
        startedAt: "2026-09-22T00:00:00.000Z",
        buildFingerprint: "sha256:example",
      },
      capabilities: [],
      sequence: 0,
    });

    expect(response.sessionId).toBe("session-1");
  });

  it("rejects an unknown protocol version and unbounded handshake input", () => {
    expect(
      handshakeRequestSchema.safeParse({
        kind: "handshake.request",
        protocol: 2,
        requestId: "request-1",
        applicationVersion: "0.1.0",
        nonce,
      }).success,
    ).toBe(false);

    expect(
      handshakeRequestSchema.safeParse({
        kind: "handshake.request",
        protocol: 1,
        requestId: "request-1",
        applicationVersion: "0.1.0",
        nonce: "short",
      }).success,
    ).toBe(false);
  });

  it("accepts a bounded local item-delivery intent without claiming an outcome", () => {
    expect(
      controlEnvelopeSchema.safeParse({
        protocol: 1,
        id: "operation-1",
        sessionId: "session-1",
        deadlineAt: "2026-09-22T00:00:30.000Z",
        command: { action: "status.snapshot", payload: {} },
      }).success,
    ).toBe(true);

    expect(
      controlEnvelopeSchema.safeParse({
        protocol: 1,
        id: "operation-1",
        sessionId: "session-1",
        deadlineAt: "2026-09-22T00:00:30.000Z",
        command: {
          action: "delivery.item",
          target: { kind: "local_player" },
          payload: {
            domain: "substance",
            gameId: "FUEL1",
            quantity: 500,
            notificationPreference: "default",
          },
        },
      }).success,
    ).toBe(true);

    expect(
      controlEnvelopeSchema.safeParse({
        protocol: 1,
        id: "operation-1",
        sessionId: "session-1",
        deadlineAt: "2026-09-22T00:00:30.000Z",
        command: {
          action: "delivery.item",
          target: { kind: "network_player", identity: "not-supported" },
          payload: {
            domain: "substance",
            gameId: "FUEL1",
            quantity: 0,
            notificationPreference: "default",
          },
        },
      }).success,
    ).toBe(false);
  });

  it("keeps error diagnostics structured and without native addresses", () => {
    expect(
      protocolErrorSchema.safeParse({
        code: "PROTOCOL_MISMATCH",
        recovery: "none",
        details: { expected: "1", received: "2" },
      }).success,
    ).toBe(true);

    expect(
      protocolErrorSchema.safeParse({
        code: "PROTOCOL_MISMATCH",
        recovery: "none",
        details: { nativeAddress: "0x1234" },
      }).success,
    ).toBe(false);
  });
});
