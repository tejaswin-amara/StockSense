import { desc } from "drizzle-orm";
import { getDb } from "./db";
import { locations, operations, products, stockLevels, stockMoves, warehouses } from "../drizzle/schema";

export type OperationStatus = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELED";
export type OperationType = "RECEIPT" | "DELIVERY" | "INTERNAL" | "ADJUSTMENT";
export type Direction = "IN" | "OUT" | "INTERNAL";

export type InventorySnapshot = {
  products: Array<{ id: number; name: string; sku: string; category: string; uom: string; perUnitCost: string; lowStockAlert: number; onHand: number; reserved: number; freeToUse: number; location: string; warehouse: string }>;
  operations: Array<{ id: number; reference: string; type: OperationType; status: OperationStatus; contact: string; scheduledDate: string; totalItems: number }>;
  moves: Array<{ id: number; reference: string; date: string; direction: Direction; product: string; quantity: number; from: string; to: string; contact: string }>;
  warehouses: Array<{ id: number; name: string; code: string; address: string; locations: string[] }>;
  kpis: { totalUnits: number; lowStock: number; pendingReceipts: number; pendingDeliveries: number; scheduledTransfers: number; late: number; waiting: number };
};

type DemoState = {
  products: InventorySnapshot["products"];
  operations: InventorySnapshot["operations"];
  moves: InventorySnapshot["moves"];
  warehouses: InventorySnapshot["warehouses"];
};

const demoState: DemoState = {
  products: [
    { id: 1, name: "Steel Rods", sku: "STEEL001", category: "Raw Materials", uom: "kg", perUnitCost: "12.50", lowStockAlert: 40, onHand: 100, reserved: 20, freeToUse: 80, location: "Main Store", warehouse: "Central Warehouse" },
    { id: 2, name: "Desk Frames", sku: "FRAME001", category: "Finished Goods", uom: "units", perUnitCost: "86.00", lowStockAlert: 20, onHand: 24, reserved: 10, freeToUse: 14, location: "Production Rack", warehouse: "Central Warehouse" },
    { id: 3, name: "Office Chairs", sku: "CHAIR001", category: "Finished Goods", uom: "units", perUnitCost: "124.00", lowStockAlert: 15, onHand: 9, reserved: 0, freeToUse: 9, location: "Rack B", warehouse: "Central Warehouse" },
    { id: 4, name: "Packing Tape", sku: "PACK001", category: "Supplies", uom: "rolls", perUnitCost: "4.20", lowStockAlert: 24, onHand: 18, reserved: 0, freeToUse: 18, location: "Main Store", warehouse: "Central Warehouse" },
  ],
  operations: [
    { id: 1, reference: "WH/IN/0001", type: "RECEIPT", status: "READY", contact: "Metro Steel Supply", scheduledDate: "2026-09-27", totalItems: 50 },
    { id: 2, reference: "WH/OUT/0001", type: "DELIVERY", status: "WAITING", contact: "Northstar Interiors", scheduledDate: "2026-09-26", totalItems: 20 },
    { id: 3, reference: "WH/INT/0001", type: "INTERNAL", status: "READY", contact: "Production Floor", scheduledDate: "2026-09-28", totalItems: 12 },
    { id: 4, reference: "WH/OUT/0002", type: "DELIVERY", status: "READY", contact: "Acme Workspace", scheduledDate: "2026-09-29", totalItems: 10 },
  ],
  moves: [
    { id: 1, reference: "WH/IN/0000", date: "2026-09-25", direction: "IN", product: "Steel Rods", quantity: 100, from: "Supplier", to: "Main Store", contact: "Metro Steel Supply" },
    { id: 2, reference: "WH/INT/0000", date: "2026-09-25", direction: "INTERNAL", product: "Desk Frames", quantity: 12, from: "Main Store", to: "Production Rack", contact: "Production Floor" },
    { id: 3, reference: "WH/OUT/0000", date: "2026-09-24", direction: "OUT", product: "Office Chairs", quantity: 20, from: "Rack B", to: "Customer", contact: "Northstar Interiors" },
  ],
  warehouses: [{ id: 1, name: "Central Warehouse", code: "WH", address: "14 Foundry Lane", locations: ["Main Store", "Production Rack", "Rack B"] }],
};

function computeKpis(state: DemoState): InventorySnapshot["kpis"] {
  const today = "2026-09-26";
  return {
    totalUnits: state.products.reduce((sum, product) => sum + product.onHand, 0),
    lowStock: state.products.filter(product => product.onHand < product.lowStockAlert || product.freeToUse === 0).length,
    pendingReceipts: state.operations.filter(operation => operation.type === "RECEIPT" && operation.status !== "DONE" && operation.status !== "CANCELED").length,
    pendingDeliveries: state.operations.filter(operation => operation.type === "DELIVERY" && operation.status !== "DONE" && operation.status !== "CANCELED").length,
    scheduledTransfers: state.operations.filter(operation => operation.type === "INTERNAL" && operation.status !== "DONE" && operation.status !== "CANCELED").length,
    late: state.operations.filter(operation => operation.scheduledDate < today && operation.status !== "DONE" && operation.status !== "CANCELED").length,
    waiting: state.operations.filter(operation => operation.status === "WAITING").length,
  };
}

async function readDatabase(): Promise<InventorySnapshot | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [dbProducts, dbOperations, dbMoves, dbWarehouses, dbLocations, dbStock] = await Promise.all([
      db.select().from(products),
      db.select().from(operations).orderBy(desc(operations.scheduledDate)),
      db.select().from(stockMoves).orderBy(desc(stockMoves.date)).limit(50),
      db.select().from(warehouses),
      db.select().from(locations),
      db.select().from(stockLevels),
    ]);
    if (!dbProducts.length && !dbOperations.length && !dbWarehouses.length) return null;
    const warehouseById = new Map(dbWarehouses.map(warehouse => [warehouse.id, warehouse]));
    const locationById = new Map(dbLocations.map(location => [location.id, location]));
    const productById = new Map(dbProducts.map(product => [product.id, product]));
    const state: DemoState = {
      products: dbStock.map(level => {
        const product = productById.get(level.productId)!;
        const location = locationById.get(level.locationId)!;
        const warehouse = warehouseById.get(location.warehouseId)!;
        return { id: product.id, name: product.name, sku: product.sku, category: product.category, uom: product.uom, perUnitCost: String(product.perUnitCost), lowStockAlert: product.lowStockAlert, onHand: level.onHand, reserved: level.reserved, freeToUse: level.onHand - level.reserved, location: location.name, warehouse: warehouse.name };
      }),
      operations: dbOperations.map(operation => ({ id: operation.id, reference: operation.reference, type: operation.type, status: operation.status, contact: operation.contact, scheduledDate: operation.scheduledDate.toISOString().slice(0, 10), totalItems: 0 })),
      moves: dbMoves.map(move => ({ id: move.id, reference: move.reference, date: move.date.toISOString().slice(0, 10), direction: move.direction, product: productById.get(move.productId)?.name ?? "Unknown product", quantity: move.quantity, from: move.fromLocationId ? locationById.get(move.fromLocationId)?.name ?? "Unknown" : "Supplier", to: move.toLocationId ? locationById.get(move.toLocationId)?.name ?? "Customer" : "Customer", contact: move.contact })),
      warehouses: dbWarehouses.map(warehouse => ({ id: warehouse.id, name: warehouse.name, code: warehouse.code, address: warehouse.address, locations: dbLocations.filter(location => location.warehouseId === warehouse.id).map(location => location.name) })),
    };
    return { ...state, kpis: computeKpis(state) };
  } catch (error) {
    console.warn("[Inventory] Falling back to demo data:", error);
    return null;
  }
}

export async function getInventorySnapshot(): Promise<InventorySnapshot> {
  const snapshot = (await readDatabase()) ?? { ...demoState, kpis: computeKpis(demoState) };
  return structuredClone(snapshot);
}

export async function validateDemoOperation(id: number): Promise<InventorySnapshot> {
  const operation = demoState.operations.find(item => item.id === id);
  if (!operation || operation.status === "DONE" || operation.status === "CANCELED") return structuredClone({ ...demoState, kpis: computeKpis(demoState) });
  operation.status = "DONE";
  demoState.moves.unshift({ id: Date.now(), reference: operation.reference, date: "2026-09-26", direction: operation.type === "DELIVERY" ? "OUT" : operation.type === "RECEIPT" ? "IN" : "INTERNAL", product: "Demo line item", quantity: operation.totalItems, from: operation.type === "RECEIPT" ? "Supplier" : "Main Store", to: operation.type === "DELIVERY" ? "Customer" : "Production Rack", contact: operation.contact });
  return structuredClone({ ...demoState, kpis: computeKpis(demoState) });
}
