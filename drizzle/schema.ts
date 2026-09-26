import {
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const warehouses = mysqlTable("warehouses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 12 }).notNull().unique(),
  address: text("address").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const locations = mysqlTable(
  "locations",
  {
    id: int("id").autoincrement().primaryKey(),
    warehouseId: int("warehouseId").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ warehouseName: uniqueIndex("locations_warehouse_name").on(table.warehouseId, table.name) }),
);

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  sku: varchar("sku", { length: 40 }).notNull().unique(),
  category: varchar("category", { length: 80 }).notNull(),
  uom: varchar("uom", { length: 24 }).notNull(),
  perUnitCost: decimal("perUnitCost", { precision: 12, scale: 2 }).notNull(),
  lowStockAlert: int("lowStockAlert").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const stockLevels = mysqlTable(
  "stockLevels",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    locationId: int("locationId").notNull(),
    onHand: int("onHand").default(0).notNull(),
    reserved: int("reserved").default(0).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ productLocation: uniqueIndex("stock_product_location").on(table.productId, table.locationId) }),
);

export const operations = mysqlTable(
  "operations",
  {
    id: int("id").autoincrement().primaryKey(),
    reference: varchar("reference", { length: 32 }).notNull().unique(),
    type: mysqlEnum("type", ["RECEIPT", "DELIVERY", "INTERNAL", "ADJUSTMENT"]).notNull(),
    status: mysqlEnum("status", ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"]).default("DRAFT").notNull(),
    contact: varchar("contact", { length: 160 }).notNull(),
    scheduledDate: timestamp("scheduledDate").notNull(),
    deliveryAddress: text("deliveryAddress"),
    responsibleId: int("responsibleId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({ schedule: index("operations_schedule").on(table.type, table.status, table.scheduledDate) }),
);

export const operationLines = mysqlTable("operationLines", {
  id: int("id").autoincrement().primaryKey(),
  operationId: int("operationId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
});

export const stockMoves = mysqlTable(
  "stockMoves",
  {
    id: int("id").autoincrement().primaryKey(),
    reference: varchar("reference", { length: 32 }).notNull(),
    date: timestamp("date").defaultNow().notNull(),
    direction: mysqlEnum("direction", ["IN", "OUT", "INTERNAL"]).notNull(),
    operationId: int("operationId"),
    productId: int("productId").notNull(),
    fromLocationId: int("fromLocationId"),
    toLocationId: int("toLocationId"),
    quantity: int("quantity").notNull(),
    contact: varchar("contact", { length: 160 }).notNull(),
  },
  table => ({ productDate: index("moves_product_date").on(table.productId, table.date) }),
);
