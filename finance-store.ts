import { useCallback, useEffect, useState } from "react";

export type Account = { id: string; name: string; balance: number };
export type Credit = { id: string; name: string; note?: string; amount: number; dueDate?: string };
export type Debt = { id: string; name: string; amount: number; dueDate?: string };
export type Transaction = {
  id: string;
  type: "expense" | "income";
  category: string;
  amount: number; // always positive; sign derived from type
  accountId?: string;
  date: string; // ISO
};

const KEYS = {
  accounts: "gd.accounts",
  credits: "gd.credits",
  debts: "gd.debts",
  transactions: "gd.transactions",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function useFinance() {
  const [hydrated, setHydrated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Hydrate after mount to avoid SSR mismatch.
  useEffect(() => {
    setAccounts(read<Account>(KEYS.accounts));
    setCredits(read<Credit>(KEYS.credits));
    setDebts(read<Debt>(KEYS.debts));
    setTransactions(read<Transaction>(KEYS.transactions));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    write(KEYS.accounts, accounts);
    write(KEYS.credits, credits);
    write(KEYS.debts, debts);
    write(KEYS.transactions, transactions);
  }, [hydrated, accounts, credits, debts, transactions]);

  const addAccount = useCallback((name: string, balance: number) => {
    setAccounts((prev) => [...prev, { id: uid(), name, balance }]);
  }, []);

  const addCredit = useCallback((c: Omit<Credit, "id">) => {
    setCredits((prev) => [...prev, { ...c, id: uid() }]);
  }, []);

  const addDebt = useCallback((d: Omit<Debt, "id">) => {
    setDebts((prev) => [...prev, { ...d, id: uid() }]);
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id" | "date"> & { date?: string }) => {
    const tx: Transaction = { ...t, id: uid(), date: t.date ?? new Date().toISOString() };
    setTransactions((prev) => [tx, ...prev]);
    if (tx.accountId) {
      const delta = tx.type === "income" ? tx.amount : -tx.amount;
      setAccounts((prev) =>
        prev.map((a) => (a.id === tx.accountId ? { ...a, balance: a.balance + delta } : a)),
      );
    }
  }, []);

  const removeAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);
  const removeCredit = useCallback((id: string) => {
    setCredits((prev) => prev.filter((c) => c.id !== id));
  }, []);
  const removeDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const totalCredits = credits.reduce((s, c) => s + Number(c.amount || 0), 0);
  const totalDebts = debts.reduce((s, d) => s + Number(d.amount || 0), 0);

  const now = new Date();
  const inCurrentMonth = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };
  const monthTransactions = transactions.filter((t) => inCurrentMonth(t.date));
  const monthlyExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  // Дневная кумулятивная кривая расходов текущего месяца
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthlyChartData: number[] = monthTransactions.length
    ? Array.from({ length: daysInMonth }, (_, i) =>
        monthTransactions
          .filter((t) => t.type === "expense" && new Date(t.date).getDate() === i + 1)
          .reduce((s, t) => s + Number(t.amount || 0), 0),
      )
    : [];

  const daysUntil = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const t = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    return Math.round((t.getTime() - today.getTime()) / 86400000);
  };

  return {
    hydrated,
    accounts,
    credits,
    debts,
    transactions,
    addAccount,
    addCredit,
    addDebt,
    addTransaction,
    removeAccount,
    removeCredit,
    removeDebt,
    totalBalance,
    totalCredits,
    totalDebts,
    monthlyExpenses,
    monthlyChartData,
    daysUntil,
  };
}

export const fmt = (n: number) =>
  `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₼`;