import { z } from "zod";

export const protocolVersion = 1 as const;

const opaqueIdSchema = z.string().trim().min(1).max(128);
const isoTimestampSchema = z.iso.datetime({ offset: true });
const semanticVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/);

const runtimeIdentitySchema = z
  .object({
    version: semanticVersionSchema,
    adapterId: z.string().trim().min(1).max(128),
  })
  .strict();

const gameIdentitySchema = z
  .object({
    processId: z.int().positive(),
    startedAt: isoTimestampSchema,
    buildFingerprint: z.string().trim().min(1).max(512),
  })
  .strict();

export const capabilitySchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    implementationLevel: z.enum([
      "not_implemented",
      "unknown",
      "experimental",
      "verified",
    ]),
    available: z.boolean(),
    reasonCode: z.string().trim().min(1).max(128).optional(),
    evidenceReference: z.string().trim().min(1).max(512).optional(),
  })
  .strict();

export const handshakeRequestSchema = z
  .object({
    kind: z.literal("handshake.request"),
    protocol: z.literal(protocolVersion),
    requestId: opaqueIdSchema,
    applicationVersion: semanticVersionSchema,
    nonce: z.string().regex(/^[A-Za-z0-9_-]{32,256}$/),
  })
  .strict();

export const handshakeResponseSchema = z
  .object({
    kind: z.literal("handshake.response"),
    protocol: z.literal(protocolVersion),
    requestId: opaqueIdSchema,
    sessionId: opaqueIdSchema,
    runtime: runtimeIdentitySchema,
    game: gameIdentitySchema,
    capabilities: z.array(capabilitySchema).max(256),
    sequence: z.int().nonnegative(),
  })
  .strict();

export const operationStateSchema = z.enum([
  "validating",
  "queued",
  "executing",
  "awaiting_interaction",
  "succeeded",
  "partial",
  "rejected",
  "cancelled",
  "unknown",
]);

export const itemDomainSchema = z.enum(["substance", "product", "technology"]);

export const itemDeliveryTargetSchema = z
  .object({
    kind: z.literal("local_player"),
  })
  .strict();

export const itemDeliveryPayloadSchema = z
  .object({
    domain: itemDomainSchema,
    gameId: z.string().trim().min(1).max(128),
    quantity: z.int().positive().max(2_147_483_647),
    notificationPreference: z.enum(["default", "suppress"]),
  })
  .strict();

export const controlCommandSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("status.snapshot"),
      payload: z.object({}).strict(),
    })
    .strict(),
  z
    .object({
      action: z.literal("capabilities.query"),
      payload: z.object({}).strict(),
    })
    .strict(),
  z
    .object({
      action: z.literal("operation.status"),
      payload: z.object({ operationId: opaqueIdSchema }).strict(),
    })
    .strict(),
  z
    .object({
      action: z.literal("operation.cancel"),
      payload: z.object({ operationId: opaqueIdSchema }).strict(),
    })
    .strict(),
  z
    .object({
      action: z.literal("delivery.item"),
      target: itemDeliveryTargetSchema,
      payload: itemDeliveryPayloadSchema,
    })
    .strict(),
]);

export const controlEnvelopeSchema = z
  .object({
    protocol: z.literal(protocolVersion),
    id: opaqueIdSchema,
    sessionId: opaqueIdSchema,
    deadlineAt: isoTimestampSchema,
    command: controlCommandSchema,
  })
  .strict();

export const errorCodeSchema = z.enum([
  "GAME_NOT_RUNNING",
  "BRIDGE_NOT_CONNECTED",
  "UNSUPPORTED_GAME_VERSION",
  "PLAYER_NOT_READY",
  "INVALID_ITEM",
  "INVALID_QUANTITY",
  "INVENTORY_FULL",
  "TARGET_NOT_FOUND",
  "TARGET_NOT_SUPPORTED",
  "ACTION_NOT_IMPLEMENTED",
  "RUNTIME_CALL_FAILED",
  "SIGNATURE_NOT_FOUND",
  "PROTOCOL_MISMATCH",
  "SESSION_CHANGED",
  "QUEUE_FULL",
  "REQUEST_EXPIRED",
  "DUPLICATE_REQUEST_CONFLICT",
  "INVENTORY_UNAVAILABLE",
  "RESULT_UNKNOWN",
  "RUNTIME_BUNDLE_INVALID",
]);

export const protocolErrorSchema = z
  .object({
    code: errorCodeSchema,
    operationId: opaqueIdSchema.optional(),
    recovery: z.enum(["retry_new_request", "wait", "correct_input", "none"]),
    details: z
      .partialRecord(
        z.enum(["expected", "received", "capability", "reason", "stage"]),
        z.string().max(256),
      )
      .optional(),
  })
  .strict();

export type Capability = z.infer<typeof capabilitySchema>;
export type HandshakeRequest = z.infer<typeof handshakeRequestSchema>;
export type HandshakeResponse = z.infer<typeof handshakeResponseSchema>;
export type ControlCommand = z.infer<typeof controlCommandSchema>;
export type ControlEnvelope = z.infer<typeof controlEnvelopeSchema>;
export type ItemDeliveryPayload = z.infer<typeof itemDeliveryPayloadSchema>;
export type ItemDeliveryTarget = z.infer<typeof itemDeliveryTargetSchema>;
export type ProtocolError = z.infer<typeof protocolErrorSchema>;
