import { describe, expect, it } from "vitest";
import {
  ControlFrameDecoder,
  ControlFrameError,
  encodeControlFrame,
  maximumControlFrameBytes,
} from "../src/index.js";

describe("control frame codec", () => {
  it("reassembles a fragmented JSON frame", () => {
    const frame = encodeControlFrame({ kind: "status", sequence: 1 });
    const decoder = new ControlFrameDecoder();
    expect(decoder.push(frame.slice(0, 3))).toEqual([]);
    expect(decoder.bufferedBytes).toBe(3);
    expect(decoder.push(frame.slice(3))).toEqual([
      { kind: "status", sequence: 1 },
    ]);
    expect(decoder.bufferedBytes).toBe(0);
  });

  it("returns concatenated frames in order", () => {
    const decoder = new ControlFrameDecoder();
    const first = encodeControlFrame({ id: "one" });
    const second = encodeControlFrame({ id: "two" });
    const combined = new Uint8Array(first.length + second.length);
    combined.set(first);
    combined.set(second, first.length);
    expect(decoder.push(combined)).toEqual([{ id: "one" }, { id: "two" }]);
  });

  it("rejects oversized and malformed payloads", () => {
    expect(() =>
      encodeControlFrame({ value: "x".repeat(maximumControlFrameBytes) }),
    ).toThrow(ControlFrameError);
    const decoder = new ControlFrameDecoder();
    expect(() => decoder.push(new Uint8Array([1, 0, 0, 0, 255]))).toThrow(
      ControlFrameError,
    );
  });
});
