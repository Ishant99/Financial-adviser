import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCountUp } from "@/lib/useCountUp";

describe("useCountUp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at 0", () => {
    const { result } = renderHook(() => useCountUp(1000, 900));
    // Before any animation frames run, value is 0
    expect(result.current).toBe(0);
  });

  it("eventually reaches the target", async () => {
    const { result } = renderHook(() => useCountUp(500, 100));
    // Run enough time for animation to complete
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBeCloseTo(500, 0);
  });

  it("returns target immediately when duration is 0 or very short", async () => {
    const { result } = renderHook(() => useCountUp(1234, 1));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBeCloseTo(1234, 0);
  });

  it("value is always between 0 and target during animation", async () => {
    const { result } = renderHook(() => useCountUp(1000, 300));
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBeGreaterThanOrEqual(0);
    expect(result.current).toBeLessThanOrEqual(1000);
  });
});
