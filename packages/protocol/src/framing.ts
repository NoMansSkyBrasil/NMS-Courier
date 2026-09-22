export const maximumControlFrameBytes = 256 * 1024;

export class ControlFrameError extends Error {
  constructor(
    readonly code: "FRAME_TOO_LARGE" | "MALFORMED_FRAME",
    message: string,
  ) {
    super(message);
    this.name = "ControlFrameError";
  }
}

function concatenate(
  left: Uint8Array<ArrayBufferLike>,
  right: Uint8Array<ArrayBufferLike>,
): Uint8Array<ArrayBufferLike> {
  const combined = new Uint8Array(left.length + right.length);
  combined.set(left);
  combined.set(right, left.length);
  return combined;
}

export function encodeControlFrame(message: unknown): Uint8Array {
  let encoded: Uint8Array;
  try {
    const json = JSON.stringify(message);
    if (json === undefined)
      throw new Error("Message cannot be represented as JSON.");
    encoded = new TextEncoder().encode(json);
  } catch {
    throw new ControlFrameError(
      "MALFORMED_FRAME",
      "Control message is not valid JSON.",
    );
  }
  if (encoded.length > maximumControlFrameBytes) {
    throw new ControlFrameError(
      "FRAME_TOO_LARGE",
      "Control message exceeds the frame limit.",
    );
  }
  const frame = new Uint8Array(4 + encoded.length);
  new DataView(frame.buffer).setUint32(0, encoded.length, true);
  frame.set(encoded, 4);
  return frame;
}

export class ControlFrameDecoder {
  private buffered: Uint8Array<ArrayBufferLike> = new Uint8Array();

  push(chunk: Uint8Array): unknown[] {
    this.buffered = concatenate(this.buffered, chunk);
    const messages: unknown[] = [];
    let cursor = 0;
    while (this.buffered.length - cursor >= 4) {
      const length = new DataView(
        this.buffered.buffer,
        this.buffered.byteOffset + cursor,
        4,
      ).getUint32(0, true);
      if (length > maximumControlFrameBytes) {
        this.buffered = new Uint8Array();
        throw new ControlFrameError(
          "FRAME_TOO_LARGE",
          "Received control frame exceeds the frame limit.",
        );
      }
      if (this.buffered.length - cursor - 4 < length) break;
      const payload = this.buffered.slice(cursor + 4, cursor + 4 + length);
      try {
        messages.push(
          JSON.parse(
            new TextDecoder("utf-8", { fatal: true }).decode(payload),
          ) as unknown,
        );
      } catch {
        this.buffered = new Uint8Array();
        throw new ControlFrameError(
          "MALFORMED_FRAME",
          "Received control frame is not valid UTF-8 JSON.",
        );
      }
      cursor += 4 + length;
    }
    this.buffered = this.buffered.slice(cursor);
    return messages;
  }

  get bufferedBytes(): number {
    return this.buffered.length;
  }
}
