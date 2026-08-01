import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings, User, CreditCard, TrendingDown, TrendingUp,
  History, Menu as MenuIcon, Wallet, Plus, Inbox,
} from "lucide-react";
import { useFinance, fmt, type Account, type Transaction } from "@/lib/finance-store";
import { NeonModal, NeonField, neonInputClass, neonSubmitClass } from "@/components/gdigital/NeonModal";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Счета — G-Digital" },
      { name: "description", content: "Обзор счетов, кредитов, долгов и расходов в G-Digital." },
      { property: "og:title", content: "Счета — G-Digital" },
      { property: "og:description", content: "Личные финансы: счета, кредиты, долги и расходы." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountsPage,
});

type ModalKind = null | "account" | "transaction" | "credit" | "debt";

function AccountsPage() {
  const f = useFinance();
  const [modal, setModal] = useState<ModalKind>(null);
  const close = () => setModal(null);

  return (
    <main className="gd-cosmos relative min-h-screen overflow-hidden font-sans text-white">
      <div className="gd-stars" aria-hidden />
      <div className="relative z-10 mx-auto max-w-[430px] px-5 pb-28 pt-5">
        <Header />
        <Summary balance={f.totalBalance} credits={f.totalCredits} debts={f.totalDebts} />
        <BalanceBlock accounts={f.accounts} total={f.totalBalance} onAdd={() => setModal("account")} />
        <div className="mt-5 grid grid-cols-2 gap-4">
          <ListBlock
            title="Кредиты"
            tone="red"
            items={f.credits.map((c) => ({ id: c.id, main: c.name, sub: c.note, amount: c.amount, dueDate: c.dueDate }))}
            total={f.totalCredits}
            empty="Нет кредитов"
            daysUntil={f.daysUntil}
            onAdd={() => setModal("credit")}
          />
          <ListBlock
            title="Долги"
            tone="amber"
            items={f.debts.map((d) => ({ id: d.id, main: d.name, amount: d.amount, dueDate: d.dueDate }))}
            total={f.totalDebts}
            empty="Нет долгов"
            daysUntil={f.daysUntil}
            onAdd={() => setModal("debt")}
          />
        </div>
        <ExpenseChart data={f.monthlyChartData} total={f.monthlyExpenses} />
        <RecentOps
          transactions={f.transactions}
          accounts={f.accounts}
          onAdd={() => setModal("transaction")}
        />
      </div>

      <button
        type="button"
        onClick={() => setModal("transaction")}
        aria-label="Добавить операцию"
        className="neon-violet gd-press fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/85"
      >
        <Plus size={24} />
      </button>

      <BottomNav />

      <AccountModal open={modal === "account"} onClose={close} onSubmit={f.addAccount} />
      <TransactionModal open={modal === "transaction"} onClose={close} accounts={f.accounts} onSubmit={f.addTransaction} />
      <ObligationModal
        open={modal === "credit"}
        title="Новый кредит"
        nameLabel="НАЗВАНИЕ"
        onClose={close}
        onSubmit={(v) => f.addCredit({ name: v.name, note: v.note, amount: v.amount, dueDate: v.dueDate })}
        withNote
      />
      <ObligationModal
        open={modal === "debt"}
        title="Новый долг"
        nameLabel="ИМЯ"
        onClose={close}
        onSubmit={(v) => f.addDebt({ name: v.name, amount: v.amount, dueDate: v.dueDate })}
      />
    </main>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <button className="neu-surface gd-press flex items-center gap-2 rounded-2xl px-3 py-2 text-xs text-white/85">
        <Settings size={16} className="text-violet-300" />
        Настройки
      </button>
      <h1 className="text-lg font-semibold tracking-wide [text-shadow:0_0_16px_rgba(139,92,246,0.55)]">Счета</h1>
      <button className="neu-surface gd-press flex h-10 w-10 items-center justify-center rounded-2xl">
        <User size={18} className="text-violet-300" />
      </button>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />;
}

function Summary({ balance, credits, debts }: { balance: number; credits: number; debts: number }) {
  return (
    <div className="neu-surface mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-[13px]">
      <div className="flex items-center gap-2"><Dot color="#3B82F6" /><span className="text-white/70">Баланс</span><span className="font-semibold">{fmt(balance)}</span></div>
      <div className="flex items-center gap-2"><Dot color="#EF4444" /><span className="text-white/70">Кредиты</span><span className="font-semibold">{fmt(credits)}</span></div>
      <div className="flex items-center gap-2"><Dot color="#F59E0B" /><span className="text-white/70">Долги</span><span className="font-semibold">{fmt(debts)}</span></div>
    </div>
  );
}

function BalanceBlock({ accounts, total, onAdd }: { accounts: Account[]; total: number; onAdd: () => void }) {
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] tracking-[0.24em] text-white/50">ТЕКУЩИЙ БАЛАНС</p>
        <button onClick={onAdd} className="gd-press flex items-center gap-1 text-[11px] text-violet-300">
          <Plus size={13} /> Счет
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="neu-surface flex flex-col items-center gap-3 rounded-2xl px-4 py-7 text-center">
          <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-2xl text-violet-300">
            <CreditCard size={20} />
          </div>
          <p className="text-sm text-white/70">Нет добавленных счетов</p>
          <button onClick={onAdd} className="neon-violet gd-press rounded-2xl bg-violet-600/80 px-4 py-2 text-xs font-semibold">
            Добавить счет
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {accounts.map((a, i) => (
            <PaymentCard key={a.id} tint={i % 2 === 0 ? "blue" : "pink"} name={a.name} amount={fmt(a.balance)} />
          ))}
        </div>
      )}

      <button className="neu-surface gd-press mt-3 flex w-full items-center justify-between rounded-2xl px-4 py-3">
        <span className="text-[11px] tracking-[0.24em] text-white/60">ИТОГО</span>
        <span className="text-2xl font-bold [text-shadow:0_0_18px_rgba(59,130,246,0.7)]">{fmt(total)}</span>
      </button>
    </section>
  );
}

function PaymentCard({ tint, name, amount }: { tint: "blue" | "pink"; name: string; amount: string }) {
  const grad = tint === "blue"
    ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 55%, #60a5fa 100%)"
    : "linear-gradient(135deg, #831843 0%, #ec4899 55%, #f9a8d4 100%)";
  const glow = tint === "blue" ? "0 0 26px rgba(59,130,246,0.55)" : "0 0 26px rgba(236,72,153,0.55)";
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 gd-press"
      style={{ background: grad, boxShadow: `${glow}, inset 0 1px 0 rgba(255,255,255,0.25)` }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
      <CreditCard size={22} className="text-white/90" />
      <p className="mt-6 truncate text-[11px] uppercase tracking-widest text-white/70">{name}</p>
      <p className="mt-1 text-xl font-bold text-white">{amount}</p>
    </div>
  );
}

function DangerBadge({ days }: { days: number }) {
  const label = days <= 0 ? "СЕГОДНЯ" : days === 1 ? "ЗАВТРА" : `${days} ДН.`;
  const breathe = days <= 1;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-red-300 ring-1 ring-red-500/40 ${breathe ? "gd-breathe" : ""}`}>
      🚨 {label}
    </span>
  );
}

type ListItem = { id: string; main: string; sub?: string; amount: number; dueDate?: string };

function ListBlock({
  title, tone, items, total, empty, daysUntil, onAdd,
}: {
  title: string;
  tone: "red" | "amber";
  items: ListItem[];
  total: number;
  empty: string;
  daysUntil: (d?: string) => number | null;
  onAdd: () => void;
}) {
  const color = tone === "red" ? "text-red-300" : "text-amber-300";
  const soonest = items
    .map((i) => daysUntil(i.dueDate))
    .filter((d): d is number => d !== null && d <= 3)
    .sort((a, b) => a - b)[0];

  return (
    <div className={`neu-surface rounded-2xl p-3 ${soonest !== undefined && soonest <= 1 ? "gd-breathe" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {soonest !== undefined ? (
          <DangerBadge days={soonest} />
        ) : (
          <button onClick={onAdd} aria-label={`Добавить: ${title}`} className="gd-press text-violet-300">
            <Plus size={15} />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <button onClick={onAdd} className="gd-press mt-3 w-full rounded-xl bg-white/[0.03] px-2 py-4 text-[11px] text-white/50">
          {empty}
          <span className="mt-1 block text-violet-300">+ Добавить</span>
        </button>
      ) : (
        <ul className="mt-2 space-y-2 text-[12px]">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-2 py-1.5">
              <div className="min-w-0">
                <p className="truncate font-medium">{i.main}</p>
                {i.sub ? <p className="truncate text-[10px] text-white/50">{i.sub}</p> : null}
              </div>
              <span className={`${color} font-semibold`}>{fmt(i.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-[11px]">
        <span className="text-white/60">Итого:</span>
        <span className={`font-semibold ${color}`}>{fmt(total)}</span>
      </div>
    </div>
  );
}

function ExpenseChart({ data, total }: { data: number[]; total: number }) {
  const w = 320, h = 90;
  const hasData = data.length > 0 && data.some((v) => v > 0);
  const max = hasData ? Math.max(...data) * 1.15 : 1;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const d = hasData
    ? data.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / max) * h}`).join(" ")
    : `M 0 ${h} L ${w} ${h}`;
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] tracking-[0.24em] text-white/50">РАСХОДЫ ЗА МЕСЯЦ</p>
        <span className="text-xs font-semibold text-fuchsia-300">{total > 0 ? `−${fmt(total)}` : fmt(0)}</span>
      </div>
      <div className="neu-surface rounded-2xl p-3">
        {hasData ? (
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
            <defs>
              <linearGradient id="gd-line" x1="0" x2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="60%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient id="gd-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#gd-area)" />
            <path d={d} fill="none" stroke="url(#gd-line)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.8))" }} />
          </svg>
        ) : (
          <p className="py-6 text-center text-[11px] text-white/40">Нет расходов в этом месяце</p>
        )}
      </div>
    </section>
  );
}

function RecentOps({
  transactions, accounts, onAdd,
}: { transactions: Transaction[]; accounts: Account[]; onAdd: () => void }) {
  const list = transactions.slice(0, 10);
  const accName = (id?: string) => accounts.find((a) => a.id === id)?.name;

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] tracking-[0.24em] text-white/50">ПОСЛЕДНИЕ ОПЕРАЦИИ</p>
        <button onClick={onAdd} className="gd-press flex items-center gap-1 text-[11px] text-violet-300">
          <Plus size={13} /> Операция
        </button>
      </div>
      {list.length === 0 ? (
        <div className="neu-surface flex flex-col items-center gap-3 rounded-2xl px-4 py-7 text-center">
          <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-2xl text-violet-300">
            <Inbox size={20} />
          </div>
          <p className="text-sm text-white/70">История операций пуста</p>
          <button onClick={onAdd} className="neon-violet gd-press rounded-2xl bg-violet-600/80 px-4 py-2 text-xs font-semibold">
            Добавить операцию
          </button>
        </div>
      ) : (
        <div className="neu-surface divide-y divide-white/5 rounded-2xl">
          {list.map((op) => {
            const positive = op.type === "income";
            const Icon = positive ? TrendingUp : TrendingDown;
            return (
              <div key={op.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="neu-inset flex h-9 w-9 items-center justify-center rounded-xl text-violet-300">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{op.category}</p>
                  <p className="truncate text-[10px] text-white/45">
                    {new Date(op.date).toLocaleDateString("ru-RU")}
                    {accName(op.accountId) ? ` · ${accName(op.accountId)}` : ""}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${positive ? "text-emerald-400 [text-shadow:0_0_10px_rgba(52,211,153,0.7)]" : "text-red-400 [text-shadow:0_0_10px_rgba(239,68,68,0.6)]"}`}>
                  {positive ? "+" : "−"}{fmt(op.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------------- Modals ---------------- */

function AccountModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string, balance: number) => void }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  return (
    <NeonModal open={open} title="Новый счет" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onSubmit(name.trim(), Number(balance) || 0);
          setName(""); setBalance(""); onClose();
        }}
      >
        <NeonField label="НАЗВАНИЕ">
          <input className={neonInputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, основная карта" />
        </NeonField>
        <NeonField label="НАЧАЛЬНЫЙ БАЛАНС">
          <input className={neonInputClass} type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" />
        </NeonField>
        <button type="submit" className={neonSubmitClass}>Сохранить</button>
      </form>
    </NeonModal>
  );
}

function TransactionModal({
  open, onClose, accounts, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onSubmit: (t: { type: "expense" | "income"; category: string; amount: number; accountId?: string }) => void;
}) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");

  return (
    <NeonModal open={open} title="Новая операция" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const value = Number(amount);
          if (!category.trim() || !value) return;
          onSubmit({ type, category: category.trim(), amount: Math.abs(value), accountId: accountId || undefined });
          setCategory(""); setAmount(""); onClose();
        }}
      >
        <div className="neu-inset grid grid-cols-2 gap-1 rounded-xl p-1">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`gd-press rounded-lg py-2 text-xs font-semibold ${type === t ? (t === "expense" ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300") : "text-white/50"}`}
            >
              {t === "expense" ? "Расход" : "Доход"}
            </button>
          ))}
        </div>
        <NeonField label="КАТЕГОРИЯ">
          <input className={neonInputClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Продукты, зарплата…" />
        </NeonField>
        <NeonField label="СУММА">
          <input className={neonInputClass} type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </NeonField>
        <NeonField label="СЧЕТ">
          <select className={neonInputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="" className="bg-[#140a33]">Без счета</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#140a33]">{a.name}</option>
            ))}
          </select>
        </NeonField>
        <button type="submit" className={neonSubmitClass}>Сохранить</button>
      </form>
    </NeonModal>
  );
}

function ObligationModal({
  open, title, nameLabel, withNote, onClose, onSubmit,
}: {
  open: boolean;
  title: string;
  nameLabel: string;
  withNote?: boolean;
  onClose: () => void;
  onSubmit: (v: { name: string; note?: string; amount: number; dueDate?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  return (
    <NeonModal open={open} title={title} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const value = Number(amount);
          if (!name.trim() || !value) return;
          onSubmit({ name: name.trim(), note: note.trim() || undefined, amount: Math.abs(value), dueDate: dueDate || undefined });
          setName(""); setNote(""); setAmount(""); setDueDate(""); onClose();
        }}
      >
        <NeonField label={nameLabel}>
          <input className={neonInputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </NeonField>
        {withNote ? (
          <NeonField label="ОПИСАНИЕ">
            <input className={neonInputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Необязательно" />
          </NeonField>
        ) : null}
        <NeonField label="СУММА">
          <input className={neonInputClass} type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </NeonField>
        <NeonField label="СРОК ОПЛАТЫ">
          <input className={neonInputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </NeonField>
        <button type="submit" className={neonSubmitClass}>Сохранить</button>
      </form>
    </NeonModal>
  );
}

const NAV = [
  { icon: TrendingDown, label: "Расходы" },
  { icon: TrendingUp, label: "Доходы" },
  { icon: Wallet, label: "Счета", active: true },
  { icon: History, label: "История" },
  { icon: MenuIcon, label: "Меню" },
] as const;

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-3 z-20 mx-auto max-w-[430px] px-5">
      <div className="neu-surface flex items-center justify-around rounded-2xl px-2 py-2">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = "active" in n && n.active;
          return (
            <button
              key={n.label}
              className={`gd-press flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 ${active ? "neon-violet bg-white/5" : ""}`}
            >
              <Icon size={18} className={active ? "text-fuchsia-300 [filter:drop-shadow(0_0_8px_rgba(217,70,239,0.9))]" : "text-white/70"} />
              <span className={`text-[10px] ${active ? "text-fuchsia-200" : "text-white/60"}`}>{n.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
