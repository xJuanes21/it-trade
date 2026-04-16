"use client";

import React from "react";
import { Account } from "@/lib/copy-trader-types";
import { AccountCard } from "./AccountCard";
import { Activity } from "lucide-react";

interface AccountsGridProps {
  accounts: Account[];
  isSuperAdmin: boolean;
  isTrader?: boolean;
  canClassify?: boolean;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onPromote: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
  onLink?: (account: Account) => void;
  togglingAccountId: string | null;
}

export function AccountsGrid({
  accounts,
  isSuperAdmin,
  isTrader = false,
  canClassify = false,
  onEdit,
  onDelete,
  onPromote,
  onToggleStatus,
  onLink,
  togglingAccountId,
}: AccountsGridProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card border border-dashed border-white/10 rounded-2xl bg-white/5">
        <Activity size={48} className="text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">No se encontraron cuentas.</p>
      </div>
    );
  }

  if (!canClassify) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.account_id}
            account={account}
            isSuperAdmin={isSuperAdmin}
            isTrader={isTrader}
            onEdit={onEdit}
            onDelete={onDelete}
            onPromote={onPromote}
            onToggleStatus={onToggleStatus}
            onLink={isSuperAdmin ? onLink : undefined}
            isToggling={togglingAccountId === account.account_id}
          />
        ))}
      </div>
    );
  }
  const masterAccounts = accounts.filter((a) => Number(a.type) === 0);
  const slaveAccounts = accounts.filter((a) => Number(a.type) === 1);

  return (
    <div className="space-y-8">
      {/* Master Accounts */}
      <details className="group [&_summary::-webkit-details-marker]:hidden" open>
        <summary className="flex cursor-pointer items-center gap-2 pb-4 pt-2 font-bold text-lg text-primary border-b border-white/10 outline-none">
          <span className="group-open:rotate-90 transition-transform duration-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
          Maestros ({masterAccounts.length})
        </summary>
        <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {masterAccounts.length > 0 ? masterAccounts.map((account) => (
            <AccountCard
              key={account.account_id}
              account={account}
              isSuperAdmin={isSuperAdmin}
              isTrader={isTrader}
              onEdit={onEdit}
              onDelete={onDelete}
              onPromote={onPromote}
              onToggleStatus={onToggleStatus}
              onLink={isSuperAdmin ? onLink : undefined}
              isToggling={togglingAccountId === account.account_id}
            />
          )) : (
            <div className="text-sm text-muted-foreground italic py-4">No hay cuentas Maestras vinculadas.</div>
          )}
        </div>
      </details>

      {/* Slave Accounts */}
      <details className="group [&_summary::-webkit-details-marker]:hidden" open>
        <summary className="flex cursor-pointer items-center gap-2 pb-4 pt-2 font-bold text-lg text-emerald-500 border-b border-white/10 outline-none mt-6">
          <span className="group-open:rotate-90 transition-transform duration-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
          Esclavos ({slaveAccounts.length})
        </summary>
        <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {slaveAccounts.length > 0 ? slaveAccounts.map((account) => (
            <AccountCard
              key={account.account_id}
              account={account}
              isSuperAdmin={isSuperAdmin}
              isTrader={isTrader}
              onEdit={onEdit}
              onDelete={onDelete}
              onPromote={onPromote}
              onToggleStatus={onToggleStatus}
              onLink={isSuperAdmin ? onLink : undefined}
              isToggling={togglingAccountId === account.account_id}
            />
          )) : (
            <div className="text-sm text-muted-foreground italic py-4">No hay cuentas Esclavas vinculadas.</div>
          )}
        </div>
      </details>
    </div>
  );
}
