import type { Transaction, TxCategory } from "@/lib/types";
import { SEED_BALANCE } from "@/lib/mock/user";
import { seedTransactions } from "@/lib/mock/transactions";
import { type Slice, nowIso, uid } from "../types";

export type WalletState = { balance: number; transactions: Transaction[]; hidden: boolean };
export type TxInput = { label: string; category: TxCategory };
export type DebitResult = { ok: true; tx: Transaction } | { ok: false; error: string; missing: number };
export const INSUFFICIENT_FUNDS = "Solde insuffisant";

export type WalletSlice = {
  wallet: WalletState;
  /** Never goes negative: returns { ok:false, error:"Solde insuffisant" } and changes nothing. */
  debit: (amount: number, tx: TxInput) => DebitResult;
  credit: (amount: number, tx: TxInput) => Transaction;
  canAfford: (amount: number) => boolean;
  toggleBalanceHidden: () => void;
};

export const initialWallet = (): WalletState => ({ balance: SEED_BALANCE, transactions: seedTransactions(), hidden: false });

export const createWalletSlice: Slice<WalletSlice> = (set, get) => {
  const record = (signed: number, { label, category }: TxInput): Transaction => {
    const balanceAfter = get().wallet.balance + signed;
    const tx: Transaction = { id: uid("tx"), label, category, amount: signed, date: nowIso(), balanceAfter };
    set((s) => ({ wallet: { ...s.wallet, balance: balanceAfter, transactions: [tx, ...s.wallet.transactions] } }));
    return tx;
  };
  return {
    wallet: initialWallet(),
    debit: (amount, tx) => {
      const { balance } = get().wallet;
      if (amount > balance) return { ok: false, error: INSUFFICIENT_FUNDS, missing: amount - balance };
      return { ok: true, tx: record(-Math.abs(amount), tx) };
    },
    credit: (amount, tx) => record(Math.abs(amount), tx),
    canAfford: (amount) => amount <= get().wallet.balance,
    toggleBalanceHidden: () => set((s) => ({ wallet: { ...s.wallet, hidden: !s.wallet.hidden } })),
  };
};
