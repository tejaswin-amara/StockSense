import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  ChevronDown,
  ClipboardCheck,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  PackageSearch,
  RefreshCw,
  Search,
  Settings2,
  Truck,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Snapshot = {
  products: Array<{ id: number; name: string; sku: string; category: string; uom: string; perUnitCost: string; lowStockAlert: number; onHand: number; reserved: number; freeToUse: number; location: string; warehouse: string }>;
  operations: Array<{ id: number; reference: string; type: string; status: string; contact: string; scheduledDate: string; totalItems: number }>;
  moves: Array<{ id: number; reference: string; date: string; direction: string; product: string; quantity: number; from: string; to: string; contact: string }>;
  warehouses: Array<{ id: number; name: string; code: string; address: string; locations: string[] }>;
  kpis: { totalUnits: number; lowStock: number; pendingReceipts: number; pendingDeliveries: number; scheduledTransfers: number; late: number; waiting: number };
};

type Tab = "dashboard" | "stock" | "operations" | "history" | "settings";
const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "stock", label: "Products / Stock", icon: Boxes },
  { id: "operations", label: "Operations", icon: ClipboardCheck },
  { id: "history", label: "Move History", icon: ArrowLeftRight },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const typeLabel: Record<string, string> = { RECEIPT: "Receipt", DELIVERY: "Delivery", INTERNAL: "Internal", ADJUSTMENT: "Adjustment" };
const statusTone: Record<string, string> = {
  DRAFT: "status-muted",
  WAITING: "status-warn",
  READY: "status-info",
  DONE: "status-success",
  CANCELED: "status-danger",
};

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [query, setQuery] = useState("");
  const { user, logout } = useAuth();
  const snapshotQuery = trpc.inventory.snapshot.useQuery(undefined, { staleTime: 10_000 });
  const snapshot = snapshotQuery.data;
  const validateOperation = trpc.inventory.validateOperation.useMutation({
    onSuccess: () => {
      toast.success("Operation validated and added to the move history");
      snapshotQuery.refetch();
    },
    onError: error => toast.error(error.message || "Sign in to validate operations"),
  });

  const filteredProducts = useMemo(() => snapshot?.products.filter(product => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase())) ?? [], [snapshot?.products, query]);
  const filteredOperations = useMemo(() => snapshot?.operations.filter(operation => `${operation.reference} ${operation.contact}`.toLowerCase().includes(query.toLowerCase())) ?? [], [snapshot?.operations, query]);
  const activeTab = tabs.find(item => item.id === tab) ?? tabs[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Boxes size={18} /></div>
          <div><div className="brand-name">StockSense</div><div className="brand-subtitle">Inventory control</div></div>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="nav-list" aria-label="Primary navigation">
          {tabs.map(item => <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}><item.icon size={17} /><span>{item.label}</span>{item.id === "operations" && snapshot?.kpis.pendingReceipts ? <span className="nav-count">{snapshot.kpis.pendingReceipts + snapshot.kpis.pendingDeliveries}</span> : null}</button>)}
        </nav>
        <div className="sidebar-foot">
          <div className="warehouse-pill"><Warehouse size={15} /><span>Central Warehouse</span><ChevronDown size={14} /></div>
          <div className="profile-row">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase() ?? "G"}</div>
            <div className="profile-copy"><strong>{user?.name ?? "Guest preview"}</strong><span>{user?.email ?? "Read-only mode"}</span></div>
            {user ? <button className="icon-button" onClick={logout} aria-label="Log out">↪</button> : <button className="icon-button" onClick={() => startLogin()} aria-label="Sign in"><LogIn size={16} /></button>}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><Menu size={18} /><span>StockSense</span></div>
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activeTab.label}</strong></div>
          <div className="topbar-actions"><button className="icon-button" onClick={() => snapshotQuery.refetch()} aria-label="Refresh"><RefreshCw size={16} className={snapshotQuery.isFetching ? "spin" : ""} /></button><div className="live-dot"><span /> Live inventory</div></div>
        </header>

        <div className="page-wrap">
          <section className="page-heading">
            <div><p className="eyebrow">Saturday, September 26, 2026</p><h1>{activeTab.label}</h1><p className="page-description">{tab === "dashboard" ? "The operational pulse of your warehouses." : tab === "stock" ? "Every item, location, and threshold in one view." : tab === "operations" ? "Receive, move, and deliver with confidence." : tab === "history" ? "An immutable trail of every stock movement." : "Warehouses, locations, and operating rules."}</p></div>
            <div className="heading-actions">{!user && <button className="button primary" onClick={() => startLogin()}><LogIn size={16} /> Sign in to edit</button>}</div>
          </section>

          {snapshotQuery.isLoading ? <LoadingState /> : snapshotQuery.error ? <ErrorState onRetry={() => snapshotQuery.refetch()} /> : snapshot ? <>
            {tab === "dashboard" && <Dashboard snapshot={snapshot} onNavigate={setTab} />}
            {tab === "stock" && <StockView products={filteredProducts} query={query} setQuery={setQuery} />}
            {tab === "operations" && <OperationsView operations={filteredOperations} query={query} setQuery={setQuery} canMutate={Boolean(user)} onValidate={id => validateOperation.mutate({ id })} isValidating={validateOperation.isPending} />}
            {tab === "history" && <HistoryView moves={snapshot.moves} />}
            {tab === "settings" && <SettingsView warehouses={snapshot.warehouses} />}
          </> : null}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ snapshot, onNavigate }: { snapshot: Snapshot; onNavigate: (tab: Tab) => void }) {
  const { kpis, operations, products, moves } = snapshot;
  return <>
    <div className="kpi-grid">
      <KpiCard label="Total units in stock" value={kpis.totalUnits.toLocaleString()} detail="Across all locations" icon={<Boxes />} accent="teal" />
      <KpiCard label="Low / out of stock" value={kpis.lowStock.toString().padStart(2, "0")} detail="Needs attention" icon={<PackageSearch />} accent="amber" />
      <KpiCard label="Pending receipts" value={kpis.pendingReceipts.toString().padStart(2, "0")} detail="Inbound operations" icon={<ArrowDownToLine />} accent="blue" />
      <KpiCard label="Pending deliveries" value={kpis.pendingDeliveries.toString().padStart(2, "0")} detail={`${kpis.waiting} waiting for stock`} icon={<ArrowUpFromLine />} accent="coral" />
    </div>
    <div className="dashboard-grid">
      <section className="panel panel-wide"><PanelHeader title="Operational queue" action="View operations" onClick={() => onNavigate("operations")} /><div className="queue-list">{operations.slice(0, 4).map(operation => <div className="queue-row" key={operation.id}><div className={`queue-icon ${operation.type.toLowerCase()}`}><OperationIcon type={operation.type} /></div><div className="queue-copy"><strong>{operation.reference}</strong><span>{typeLabel[operation.type]} · {operation.contact}</span></div><div className="queue-date"><span className={statusTone[operation.status]}>{operation.status}</span><small>{operation.scheduledDate}</small></div></div>)}</div></section>
      <section className="panel"><PanelHeader title="Stock health" action="View stock" onClick={() => onNavigate("stock")} /><div className="health-list">{products.slice(0, 4).map(product => <div className="health-row" key={product.id}><div><strong>{product.name}</strong><span>{product.sku} · {product.location}</span></div><div className="health-value"><strong>{product.freeToUse}</strong><span>{product.uom} free</span></div><div className={`health-bar ${product.freeToUse < product.lowStockAlert ? "warn" : ""}`}><i style={{ width: `${Math.min(100, product.freeToUse / Math.max(product.lowStockAlert, 1) * 100)}%` }} /></div></div>)}</div></section>
    </div>
    <div className="dashboard-grid lower-grid"><section className="panel"><PanelHeader title="Move history" action="Open ledger" onClick={() => onNavigate("history")} /><div className="mini-moves">{moves.slice(0, 4).map(move => <div className="mini-move" key={move.id}><span className={`direction ${move.direction.toLowerCase()}`}>{move.direction === "IN" ? "+" : move.direction === "OUT" ? "−" : "↔"}</span><div><strong>{move.product}</strong><span>{move.reference} · {move.date}</span></div><b>{move.direction === "OUT" ? "−" : "+"}{move.quantity}</b></div>)}</div></section><section className="panel callout"><div className="callout-icon"><Truck size={20} /></div><div><p className="eyebrow">Warehouse focus</p><h3>{kpis.scheduledTransfers} internal transfers scheduled</h3><p>Keep location balances aligned while preserving your total inventory.</p><button className="text-button" onClick={() => onNavigate("operations")}>Review transfer queue →</button></div></section></div>
  </>;
}

function StockView({ products, query, setQuery }: { products: Snapshot["products"]; query: string; setQuery: (value: string) => void }) {
  return <section className="panel table-panel"><div className="table-toolbar"><div><p className="eyebrow">Catalog availability</p><h2>Stock levels</h2></div><div className="search-box"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search SKU or product" /></div></div><div className="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Location</th><th>Per unit</th><th>On hand</th><th>Free to use</th><th>Health</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><strong>{product.name}</strong><span>{product.sku}</span></td><td>{product.category}</td><td><span className="location-cell"><MapPin size={13} />{product.location}</span></td><td>${product.perUnitCost}</td><td>{product.onHand} {product.uom}</td><td><strong>{product.freeToUse}</strong> {product.uom}</td><td><span className={product.freeToUse < product.lowStockAlert ? "status-warn" : "status-success"}>{product.freeToUse < product.lowStockAlert ? "Low stock" : "Healthy"}</span></td></tr>)}</tbody></table></div></section>;
}

function OperationsView({ operations, query, setQuery, canMutate, onValidate, isValidating }: { operations: Snapshot["operations"]; query: string; setQuery: (value: string) => void; canMutate: boolean; onValidate: (id: number) => void; isValidating: boolean }) {
  return <section className="panel table-panel"><div className="table-toolbar"><div><p className="eyebrow">Inbound · outbound · internal</p><h2>Operations queue</h2></div><div className="search-box"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search reference or contact" /></div></div><div className="table-scroll"><table><thead><tr><th>Reference</th><th>Type</th><th>Contact</th><th>Scheduled</th><th>Items</th><th>Status</th><th /></tr></thead><tbody>{operations.map(operation => <tr key={operation.id}><td><strong>{operation.reference}</strong></td><td><span className="type-chip">{typeLabel[operation.type]}</span></td><td>{operation.contact}</td><td>{operation.scheduledDate}</td><td>{operation.totalItems}</td><td><span className={statusTone[operation.status]}>{operation.status}</span></td><td>{operation.status !== "DONE" && operation.status !== "CANCELED" ? <button className="small-button" disabled={!canMutate || isValidating} onClick={() => onValidate(operation.id)}>{canMutate ? "Validate" : "Sign in to edit"}</button> : null}</td></tr>)}</tbody></table></div></section>;
}

function HistoryView({ moves }: { moves: Snapshot["moves"] }) {
  return <section className="panel table-panel"><div className="table-toolbar"><div><p className="eyebrow">Immutable transaction log</p><h2>Move history</h2></div><span className="ledger-badge">All movements tracked</span></div><div className="table-scroll"><table><thead><tr><th>Reference</th><th>Date</th><th>Product</th><th>From</th><th>To</th><th>Quantity</th><th>Contact</th></tr></thead><tbody>{moves.map(move => <tr key={move.id}><td><strong>{move.reference}</strong></td><td>{move.date}</td><td>{move.product}</td><td>{move.from}</td><td>{move.to}</td><td><span className={`direction ${move.direction.toLowerCase()}`}>{move.direction === "OUT" ? "−" : "+"}{move.quantity}</span></td><td>{move.contact}</td></tr>)}</tbody></table></div></section>;
}

function SettingsView({ warehouses }: { warehouses: Snapshot["warehouses"] }) {
  return <div className="settings-grid">{warehouses.map(warehouse => <section className="panel facility-card" key={warehouse.id}><div className="facility-header"><div className="facility-icon"><Warehouse size={20} /></div><div><p className="eyebrow">{warehouse.code}</p><h2>{warehouse.name}</h2></div><button className="icon-button"><Settings2 size={16} /></button></div><p className="facility-address"><MapPin size={14} />{warehouse.address}</p><div className="location-list"><p className="eyebrow">Locations / racks</p>{warehouse.locations.map(location => <div className="location-row" key={location}><span className="location-dot" />{location}<span className="location-arrow">→</span></div>)}</div></section>)}</div>;
}

function KpiCard({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: React.ReactNode; accent: string }) { return <div className="kpi-card"><div className={`kpi-icon ${accent}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></div>; }
function PanelHeader({ title, action, onClick }: { title: string; action: string; onClick: () => void }) { return <div className="panel-header"><h2>{title}</h2><button className="text-button" onClick={onClick}>{action} →</button></div>; }
function OperationIcon({ type }: { type: string }) { return type === "RECEIPT" ? <ArrowDownToLine size={16} /> : type === "DELIVERY" ? <ArrowUpFromLine size={16} /> : <ArrowLeftRight size={16} />; }
function LoadingState() { return <div className="empty-state"><RefreshCw className="spin" /><p>Loading live inventory…</p></div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="empty-state"><PackageSearch /><p>Inventory could not be loaded.</p><button className="button secondary" onClick={onRetry}>Try again</button></div>; }
