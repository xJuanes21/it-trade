"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Edit2,
  Activity,
  Server,
  ArrowUpCircle,
  Power,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Account } from "@/lib/copy-trader-types";

interface AccountCardProps {
  account: Account;
  isSuperAdmin: boolean;
  isTrader?: boolean;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onPromote?: (account: Account) => void;
  onToggleStatus?: (account: Account) => void;
  onLink?: (account: Account) => void;
  isToggling?: boolean;
}

export function AccountCard({
  account,
  isSuperAdmin,
  isTrader = false,
  onEdit,
  onDelete,
  onPromote,
  onToggleStatus,
  onLink,
  isToggling = false,
}: AccountCardProps) {
  const handleToggle = () => {
    if (onToggleStatus) onToggleStatus(account);
  };

  const isActive = Number(account.status) === 1;
  const isUnlinked = account.isOwner === false && !account.ownerEmail;
  const showOwnership = isSuperAdmin || isTrader;

  return (
    <Card
      className={cn(
        "glass-widget widget-hover group overflow-hidden transition-all duration-300",
        !isActive && "opacity-75 grayscale-[0.5]",
      )}
    >
      <CardContent className="p-0">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden",
                account.type === 0
                  ? "bg-primary/10 text-primary"
                  : "bg-emerald-500/10 text-emerald-500",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
                  isActive
                    ? "opacity-20 from-emerald-500/40 to-transparent"
                    : "opacity-0",
                )}
              />

              {account.type === 0 ? (
                <Server size={24} className="relative z-10" />
              ) : (
                <Activity size={24} className="relative z-10" />
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
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    isActive
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-100",
                  )}
                >
                  {isActive ? "ACTIVA" : "DESACTIVADA"}
                </span>

                {showOwnership && (
                  account.isOwner ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 ml-2 tracking-wider">
                      TUYA
                    </span>
                  ) : (
                    account.ownerEmail ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-2 border border-white/5 font-medium">
                        De: {account.ownerEmail}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold uppercase ml-2 border border-red-500/20 whitespace-nowrap tracking-tight">
                        SIN RELACIÓN CON IT TRADE
                      </span>
                    )
                  )
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500",
                    )}
                  />
                  {isActive ? account.state || "CONECTADA" : "DESCONECTADA"}
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
              <p
                className={cn(
                  "text-lg font-black",
                  isActive ? "text-primary" : "text-muted-foreground/40",
                )}
              >
                {account.equity || "0.00"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin && isUnlinked && onLink && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLink(account)}
                className="h-10 w-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all text-emerald-400 border-none"
                title="Vincular a Usuario"
              >
                <UserPlus size={18} />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={handleToggle}
              disabled={isToggling}
              className={cn(
                "h-10 w-10 rounded-xl transition-all border-none",
                isActive
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400",
              )}
              title={isActive ? "Desactivar Cuenta" : "Activar Cuenta"}
            >
              {isToggling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Power size={18} />
              )}
            </Button>

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
