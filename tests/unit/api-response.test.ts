import { describe, expect, it } from "vitest";
import { fail, success } from "@/lib/api/api-response";

describe("api response helpers", () => {
  it("성공 응답 형식을 만든다", async () => {
    const response = success({ id: 1 }, "created", 201);

    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "created",
      data: { id: 1 },
    });
    expect(response.status).toBe(201);
  });

  it("실패 응답 형식을 만든다", async () => {
    const response = fail("bad request", 422);

    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "bad request",
      data: null,
    });
    expect(response.status).toBe(422);
  });
});
