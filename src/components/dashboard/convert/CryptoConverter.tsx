"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";

type CryptoKey = "BTC" | "ETH" | "SOL" | "BNB" | "USDT";

type CryptoInfo = {
  name: string;
  price: number; // precio en USDT
  change: number; // variación %
};

const cryptoData: Record<CryptoKey, CryptoInfo> = {
  BTC: { name: "Bitcoin", price: 43250, change: 2.45 },
  ETH: { name: "Ethereum", price: 2389.5, change: 1.23 },
  SOL: { name: "Solana", price: 98.65, change: -0.87 },
  BNB: { name: "Binance Coin", price: 312.0, change: 0.45 },
  USDT: { name: "Tether", price: 1, change: 0.01 },
};

export default function CryptoConverter() {
  const [fromCrypto, setFromCrypto] = useState<CryptoKey>("BTC");
  const [toCrypto, setToCrypto] = useState<CryptoKey>("USDT");
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("43250.00000000");

  useEffect(() => {
    calculateConversion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAmount, fromCrypto, toCrypto]);

  const calculateConversion = () => {
    const amount = parseFloat(fromAmount) || 0;
    const fromPrice = cryptoData[fromCrypto].price;
    const toPrice = cryptoData[toCrypto].price;
    const result = (amount * fromPrice) / toPrice;
    setToAmount(result.toFixed(8));
  };

  const handleSwap = () => {
    setFromCrypto(toCrypto);
    setToCrypto(fromCrypto);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const quickConversions = useMemo(
    () => [
      { from: "1 BTC", to: "USDT", value: cryptoData.BTC.price },
      { from: "1 ETH", to: "USDT", value: cryptoData.ETH.price },
      { from: "100 SOL", to: "USDT", value: cryptoData.SOL.price * 100 },
      { from: "10 BNB", to: "USDT", value: cryptoData.BNB.price * 10 },
    ],
    []
  );

  const keys: CryptoKey[] = ["BTC", "ETH", "SOL", "BNB", "USDT"];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Conversor de Criptomonedas
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Convierte entre diferentes criptomonedas en tiempo real
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-card rounded-3xl p-6 md:p-8 mb-6 shadow-2xl border border-border">
          {/* From Section */}
          <div className="mb-4">
            <label className="text-muted-foreground text-sm mb-2 block">De</label>
            <div className="bg-secondary rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-4">
                <select
                  value={fromCrypto}
                  onChange={(e) => setFromCrypto(e.target.value as CryptoKey)}
                  className="bg-background text-foreground px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring font-medium min-w-[160px] cursor-pointer"
                >
                  {keys.map((key) => (
                    <option key={key} value={key}>
                      {key} - {cryptoData[key].name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent text-foreground text-xl md:text-2xl font-semibold focus:outline-none"
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  1 {fromCrypto} = ${cryptoData[fromCrypto].price.toLocaleString()}
                </span>
                <span
                  className={`font-medium ${
                    cryptoData[fromCrypto].change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {cryptoData[fromCrypto].change >= 0 ? "↗" : "↘"}{" "}
                  {Math.abs(cryptoData[fromCrypto].change)}%
                </span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={handleSwap}
              aria-label="Intercambiar pares"
              className="bg-primary hover:bg-accent text-primary-foreground p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <ArrowDownUp size={20} />
            </button>
          </div>

          {/* To Section */}
          <div className="mb-6">
            <label className="text-muted-foreground text-sm mb-2 block">Para</label>
            <div className="bg-secondary rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-4">
                <select
                  value={toCrypto}
                  onChange={(e) => setToCrypto(e.target.value as CryptoKey)}
                  className="bg-background text-foreground px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring font-medium min-w-[160px] cursor-pointer"
                >
                  {keys.map((key) => (
                    <option key={key} value={key}>
                      {key} - {cryptoData[key].name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  className="flex-1 bg-transparent text-foreground text-xl md:text-2xl font-semibold focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  1 {toCrypto} = ${cryptoData[toCrypto].price.toLocaleString()}
                </span>
                <span
                  className={`font-medium ${
                    cryptoData[toCrypto].change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {cryptoData[toCrypto].change >= 0 ? "↗" : "↘"}{" "}
                  {Math.abs(cryptoData[toCrypto].change)}%
                </span>
              </div>
            </div>
          </div>

          {/* Conversion Info */}
          <div className="bg-background rounded-xl p-4 border border-border">
            <div className="text-center">
              <p className="text-foreground font-medium text-lg mb-1">
                1 {fromCrypto} ≈ {(
                  cryptoData[fromCrypto].price / cryptoData[toCrypto].price
                ).toFixed(8)} {toCrypto}
              </p>
              <p className="text-muted-foreground text-sm">
                Tasa: 1 {fromCrypto} = ${cryptoData[fromCrypto].price.toLocaleString()} {toCrypto}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Conversions */}
        <div className="bg-card rounded-3xl p-6 md:p-8 shadow-2xl border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Conversiones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickConversions.map((conversion, index) => (
              <div
                key={index}
                className="bg-secondary rounded-xl p-4 border border-border hover:border-ring transition-all cursor-pointer"
              >
                <p className="text-muted-foreground text-sm mb-1">
                  {conversion.from} → {conversion.to}
                </p>
                <p className="text-foreground font-bold text-lg">
                  ≈ ${conversion.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {conversion.to}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
