import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPendingReceiptStatus,
  parseStaffReceiptStatusFilter,
  receiptStatusLabelRu,
} from "./receipts";

describe("staff receipt status filter", () => {
  it("defaults to pending queue", () => {
    assert.equal(parseStaffReceiptStatusFilter(undefined), "pending");
    assert.equal(parseStaffReceiptStatusFilter(null), "pending");
    assert.equal(parseStaffReceiptStatusFilter("hack"), "pending");
  });

  it("accepts known buckets", () => {
    assert.equal(parseStaffReceiptStatusFilter("verified"), "verified");
    assert.equal(parseStaffReceiptStatusFilter("rejected"), "rejected");
    assert.equal(parseStaffReceiptStatusFilter("all"), "all");
  });

  it("labels and pending detection", () => {
    assert.equal(isPendingReceiptStatus("pending_staff"), true);
    assert.equal(isPendingReceiptStatus("verified"), false);
    assert.equal(receiptStatusLabelRu("verified"), "Одобрен");
  });
});
