"use client";

import React, { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Plus,
  Send,
  Download,
  Edit2,
  Trash2,
  Copy,
  Wallet as WalletIcon,
  Lock,
  Zap,
} from "lucide-react";

// Types
export type WalletColor = "blue" | "amber" | "purple";
export type WalletIconKey = "wallet" | "lock" | "zap";

export interface WalletItem {
  id: number;
  name: string;
  network: string;
  isPrincipal: boolean;
  address: string;
  balance: number;
  color: WalletColor;
  icon: WalletIconKey;
}

const initialWallets: WalletItem[] = [
  {
    id: 1,
    name: "Main Trading Wallet",
    network: "Ethereum",
    isPrincipal: true,
    address: "0x74a103Cc6B9... 7995f9Rb04",
    balance: 15234.56,
    color: "blue",
    icon: "wallet",
  },
  {
    id: 2,
    name: "Cold Storage",
    network: "Bitcoin",
    isPrincipal: false,
    address: "0x8B1F340FEB65... FR31E2C304",
    balance: 45678.9,
    color: "amber",
    icon: "lock",
  },
  {
    id: 3,
    name: "DeFi Wallet",
    network: "Polygon",
    isPrincipal: false,
    address: "0x9C4e41F29F96... F9A881C2D3",
    balance: 8945.23,
    color: "purple",
    icon: "zap",
  },
];

function IconComponent({
  icon,
  size = 24,
}: {
  icon: WalletIconKey;
  size?: number;
}) {
  const icons: Record<WalletIconKey, React.ComponentType<{ size?: number }>> = {
    wallet: WalletIcon,
    lock: Lock,
    zap: Zap,
  };
  const Icon = icons[icon];
  return <Icon size={size} />;
}

function getColorClasses(color: WalletColor) {
  const map = {
    blue: {
      bg: "bg-blue-500/10",
      icon: "bg-blue-500",
      border: "border-blue-500/20",
      button: "bg-blue-500 hover:bg-blue-600",
      hover: "hover:border-blue-500/40",
    },
    amber: {
      bg: "bg-amber-500/10",
      icon: "bg-amber-500",
      border: "border-amber-500/20",
      button: "bg-amber-500 hover:bg-amber-600",
      hover: "hover:border-amber-500/40",
    },
    purple: {
      bg: "bg-purple-500/10",
      icon: "bg-purple-500",
      border: "border-purple-500/20",
      button: "bg-purple-500 hover:bg-purple-600",
      hover: "hover:border-purple-500/40",
    },
  } as const;
  return map[color];
}

export default function MisWallets() {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [wallets] = useState<WalletItem[]>(initialWallets);

  const totalBalance = useMemo(
    () => wallets.reduce((sum, w) => sum + w.balance, 0),
    [wallets],
  );

  const copyAddress = (address: string) => {
    navigator.clipboard?.writeText(address);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <WalletIcon size={32} className="text-primary" />
              Mis Wallets
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Gestiona tus wallets de criptomonedas
            </p>
          </div>
          <button className="mt-4 md:mt-0 bg-primary hover:bg-accent text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg">
            <Plus size={20} />
            Agregar Wallet
          </button>
        </div>

        {/* Balance Total Card */}
        <div className="bg-card rounded-3xl p-6 md:p-8 mb-6 shadow-2xl border border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-muted-foreground text-sm mb-2">
                Balance Total
              </p>
              <div className="flex items-center gap-4">
                {showBalance ? (
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                    $
                    {totalBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h2>
                ) : (
                  <div className="flex gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-muted rounded-full" />
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowBalance((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2"
                >
                  {showBalance ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm mb-2">
                Total de Wallets
              </p>
              <p className="text-4xl md:text-5xl font-bold text-foreground">
                {wallets.length}
              </p>
            </div>
          </div>
        </div>

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {wallets.map((wallet) => {
            const colorClass = getColorClasses(wallet.color);
            return (
              <div
                key={wallet.id}
                className={`bg-card rounded-3xl p-6 shadow-2xl border ${colorClass.border} ${colorClass.hover} transition-all duration-300`}
              >
                {/* Wallet Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${colorClass.icon} w-12 h-12 rounded-2xl flex items-center justify-center text-white`}
                    >
                      <IconComponent icon={wallet.icon} size={24} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-bold text-lg">
                        {wallet.name}
                      </h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        {wallet.network}
                      </p>
                    </div>
                  </div>
                  {wallet.isPrincipal && (
                    <span className="bg-amber-500/20 text-amber-500 text-xs px-3 py-1 rounded-full font-medium">
                      Principal
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className="mb-6">
                  <p className="text-muted-foreground text-xs mb-2">
                    Dirección
                  </p>
                  <div
                    className={`${colorClass.bg} border ${colorClass.border} rounded-xl p-3 flex items-center justify-between`}
                  >
                    <code className="text-foreground text-sm font-mono truncate flex-1">
                      {wallet.address}
                    </code>
                    <button
                      onClick={() => copyAddress(wallet.address)}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                {/* Balance */}
                <div className="mb-6">
                  <p className="text-muted-foreground text-sm mb-2">Balance</p>
                  {showBalance ? (
                    <p className="text-foreground text-3xl font-bold">
                      $
                      {wallet.balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  ) : (
                    <div className="flex gap-1.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 bg-muted rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    className={`${colorClass.button} flex-1 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg`}
                  >
                    <Send size={18} />
                    Enviar
                  </button>
                  <button className="bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 border border-green-500/20">
                    <Download size={18} />
                    Recibir
                  </button>
                  <button className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center">
                    <Edit2 size={18} />
                  </button>
                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center border border-red-500/20">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
