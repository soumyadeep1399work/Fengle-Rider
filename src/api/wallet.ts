import { apiFetch } from './client';
import { WalletLedgerEntry } from '../types';

export function fetchBalance() {
  return apiFetch<{ balance: string | number }>('/wallet/balance');
}

function mapEntry(e: any): WalletLedgerEntry {
  return {
    id: Number(e.id),
    entryType: e.entry_type,
    amount: Number(e.amount ?? 0),
    reason: e.reason,
    notes: e.notes ?? null,
    createdAt: String(e.created_at),
  };
}

export async function fetchLedger(limit = 50): Promise<WalletLedgerEntry[]> {
  const { ledger } = await apiFetch<{ ledger: any[] }>('/wallet/ledger', { query: { limit } });
  return ledger.map(mapEntry);
}
