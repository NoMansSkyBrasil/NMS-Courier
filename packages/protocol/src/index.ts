export {
  canTransitionOperation,
  isTerminalOperationState,
  nextStateAfterDispatchFailure,
} from "./operation-state.js";

export type { OperationState } from "./operation-state.js";

export {
  capabilitySchema,
  controlCommandSchema,
  controlEnvelopeSchema,
  errorCodeSchema,
  handshakeRequestSchema,
  handshakeResponseSchema,
  itemDeliveryPayloadSchema,
  itemDeliveryTargetSchema,
  itemDomainSchema,
  operationStateSchema,
  protocolVersion,
  protocolErrorSchema,
} from "./wire.js";

export type {
  Capability,
  ControlCommand,
  ControlEnvelope,
  HandshakeRequest,
  ItemDeliveryPayload,
  ItemDeliveryTarget,
  HandshakeResponse,
  ProtocolError,
} from "./wire.js";
