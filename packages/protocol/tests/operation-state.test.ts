import { describe, expect, it } from "vitest";
import {
  canTransitionOperation,
  isTerminalOperationState,
  nextStateAfterDispatchFailure,
} from "../src/index.js";

describe("delivery operation state machine", () => {
  it("allows cancellation only before native execution begins", () => {
    expect(canTransitionOperation("validating", "cancelled")).toBe(true);
    expect(canTransitionOperation("queued", "cancelled")).toBe(true);
    expect(canTransitionOperation("executing", "cancelled")).toBe(false);
  });

  it("never allows a terminal operation to be retried in place", () => {
    for (const state of [
      "succeeded",
      "partial",
      "rejected",
      "cancelled",
      "unknown",
    ] as const) {
      expect(isTerminalOperationState(state)).toBe(true);
      expect(canTransitionOperation(state, "queued")).toBe(false);
    }
  });

  it("preserves uncertainty when a failure follows dispatch", () => {
    expect(nextStateAfterDispatchFailure(false)).toBe("rejected");
    expect(nextStateAfterDispatchFailure(true)).toBe("unknown");
  });
});
