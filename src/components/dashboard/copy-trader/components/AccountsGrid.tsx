"use client";

import React from "react";
import { Account } from "@/lib/copy-trader-types";
import { AccountCard } from "./AccountCard";

interface AccountsGridProps {
  accounts: Account[];
  isSuperAdmin: boolean;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onPromote: (account: Account) => void;
}

export function AccountsGrid({
  accounts,
  isSuperAdmin,
  onEdit,
  onDelete,
  onPromote,
}: AccountsGridProps) {
  if (!isSuperAdmin) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.account_id}
            account={account}
            isSuperAdmin={false}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  const myAccounts = accounts.filter((a) => a.isOwner !== false);
  const userAccounts = accounts.filter((a) => a.isOwner === false);

  return (
    <div className="space-y-8">
      {/* My Accounts */}
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
          Mis cuentas ({myAccounts.length})
        </summary>
        <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {myAccounts.map((account) => (
            <AccountCard
              key={account.account_id}
              account={account}
              isSuperAdmin={true}
              onEdit={onEdit}
              onDelete={onDelete}
              onPromote={onPromote}
            />
          ))}
        </div>
      </details>

      {/* User Accounts */}
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
          Cuentas vinculadas por usuarios ({userAccounts.length})
        </summary>
        <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {userAccounts.map((account) => (
            <AccountCard
              key={account.account_id}
              account={account}
              isSuperAdmin={true}
              onEdit={onEdit}
              onDelete={onDelete}
              onPromote={onPromote}
            />
          ))}
        </div>
      </details>
    </div>
  );
}
