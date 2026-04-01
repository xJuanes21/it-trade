"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Edit2,
  Activity,
  Server,
  ArrowUpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Account } from "@/lib/copy-trader-types";

interface AccountCardProps {
  account: Account;
  isSuperAdmin: boolean;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onPromote?: (account: Account) => void;
}

export function AccountCard({
  account,
  isSuperAdmin,
  onEdit,
  onDelete,
  onPromote,
}: AccountCardProps) {
  return (
    <Card
      className="backdrop-blur-md bg-card/40 border-white/5 hover:bg-card/60 transition-all duration-300 group overflow-hidden"
    >
      <CardContent className="p-0">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                account.type === 0
                  ? "bg-primary/10 text-primary"
                  : "bg-emerald-500/10 text-emerald-500",
              )}
            >
              {account.type === 0 ? (
                <Server size={24} />
              ) : (
                <Activity size={24} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight text-foreground">
                  {account.name}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    account.type === 0
                      ? "bg-primary/20 text-primary"
                      : "bg-emerald-500/20 text-emerald-500",
                  )}
                >
                  {account.type === 0 ? "MASTER" : "SLAVE"}
                </span>
                {account.isOwner === false && account.ownerEmail && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 ml-2">
                    De: {account.ownerEmail}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {account.state || "CONECTADA"}
                </span>
                <span className="opacity-20">|</span>
                <span>{account.broker.toUpperCase()}</span>
                <span className="opacity-20">|</span>
                <span>#{account.login}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 px-6 border-x border-white/5 h-full py-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                Balance
              </p>
              <p className="text-lg font-black text-foreground">
                {account.balance || "0.00"}{" "}
                <span className="text-xs font-medium opacity-50">
                  {account.ccy || "USD"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                Equity
              </p>
              <p className="text-lg font-black text-primary">
                {account.equity || "0.00"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin && account.type === 1 && onPromote && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPromote(account)}
                className="h-10 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all text-emerald-400 border-white/10 hidden md:flex items-center gap-2 px-3"
                title="Ascender a Master"
              >
                <ArrowUpCircle size={16} />
                <span className="text-[10px] uppercase font-black tracking-widest">
                  Ascender
                </span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(account)}
              className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(account.account_id!)}
              className="h-10 w-10 rounded-xl hover:bg-red-500 hover:text-white transition-all text-red-400"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
