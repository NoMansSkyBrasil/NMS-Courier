import { operationStateSchema } from "./wire.js";

export type OperationState = typeof operationStateSchema._output;

const transitions: Readonly<Record<OperationState, readonly OperationState[]>> =
  {
    validating: ["queued", "rejected", "cancelled"],
    queued: ["executing", "rejected", "cancelled"],
    executing: ["awaiting_interaction", "succeeded", "partial", "unknown"],
    awaiting_interaction: ["succeeded", "partial", "unknown"],
    succeeded: [],
    partial: [],
    rejected: [],
    cancelled: [],
    unknown: [],
  };

export function canTransitionOperation(
  from: OperationState,
  to: OperationState,
): boolean {
  return transitions[from].includes(to);
}

export function nextStateAfterDispatchFailure(
  dispatchStarted: boolean,
): OperationState {
  return dispatchStarted ? "unknown" : "rejected";
}

export function isTerminalOperationState(state: OperationState): boolean {
  return transitions[state].length === 0;
}
