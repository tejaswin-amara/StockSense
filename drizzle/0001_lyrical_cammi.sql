CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`warehouseId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_warehouse_name` UNIQUE(`warehouseId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `operationLines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `operationLines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`type` enum('RECEIPT','DELIVERY','INTERNAL','ADJUSTMENT') NOT NULL,
	`status` enum('DRAFT','WAITING','READY','DONE','CANCELED') NOT NULL DEFAULT 'DRAFT',
	`contact` varchar(160) NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`deliveryAddress` text,
	`responsibleId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operations_id` PRIMARY KEY(`id`),
	CONSTRAINT `operations_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`sku` varchar(40) NOT NULL,
	`category` varchar(80) NOT NULL,
	`uom` varchar(24) NOT NULL,
	`perUnitCost` decimal(12,2) NOT NULL,
	`lowStockAlert` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `stockLevels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`locationId` int NOT NULL,
	`onHand` int NOT NULL DEFAULT 0,
	`reserved` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stockLevels_id` PRIMARY KEY(`id`),
	CONSTRAINT `stock_product_location` UNIQUE(`productId`,`locationId`)
);
--> statement-breakpoint
CREATE TABLE `stockMoves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`direction` enum('IN','OUT','INTERNAL') NOT NULL,
	`operationId` int,
	`productId` int NOT NULL,
	`fromLocationId` int,
	`toLocationId` int,
	`quantity` int NOT NULL,
	`contact` varchar(160) NOT NULL,
	CONSTRAINT `stockMoves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`code` varchar(12) NOT NULL,
	`address` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouses_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE INDEX `operations_schedule` ON `operations` (`type`,`status`,`scheduledDate`);--> statement-breakpoint
CREATE INDEX `moves_product_date` ON `stockMoves` (`productId`,`date`);