import { describe, expect, it } from "vitest";
import { getInventorySnapshot, validateDemoOperation } from "./inventory";

describe("inventory validation", () => {
  it("marks an operation done and appends one ledger movement", async () => {
    const before = await getInventorySnapshot();
    const operation = before.operations.find(item => item.status !== "DONE" && item.status !== "CANCELED");
    expect(operation).toBeDefined();
    const after = await validateDemoOperation(operation!.id);
    expect(after.operations.find(item => item.id === operation!.id)?.status).toBe("DONE");
    expect(after.moves.length).toBe(before.moves.length + 1);
  });
});
