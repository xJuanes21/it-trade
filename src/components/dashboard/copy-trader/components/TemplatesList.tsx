"use client";

import React from "react";
import { Layout, Globe, AlertCircle } from "lucide-react";
import { TemplateCard } from "./TemplateCard";
import { SharedTemplateCard } from "./SharedTemplateCard";
import { Pagination } from "@/components/ui/Pagination";

interface TemplatesListProps {
  title: string;
  accentColor: string;
  badge: string;
  templates: any[];
  emptyTitle: string;
  emptyDescription: string;
  variant: "own" | "shared";

  // Own variant
  masters?: any[];
  editingId?: string | null;
  onEdit?: (id: string | null) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (data: any) => void;
  onCancelEdit?: () => void;

  // Shared variant
  hasSlave?: boolean;
  isTrader?: boolean;
  onClone?: (template: any) => void;
  onFollow?: (template: any) => void;
  onUnfollow?: (template: any) => void;
  showSlaveWarning?: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TemplatesList({
  title,
  accentColor,
  badge,
  templates,
  emptyTitle,
  emptyDescription,
  variant,
  masters = [],
  editingId,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  hasSlave = false,
  isTrader = false,
  onClone,
  onFollow,
  onUnfollow,
  showSlaveWarning = false,
  currentPage,
  totalPages,
  onPageChange,
}: TemplatesListProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-1.5 rounded-full ${accentColor === "primary" ? "bg-primary" : "bg-blue-500"}`} />
          <h2 className="text-xl font-black text-foreground uppercase tracking-widest">
            {title}
          </h2>
        </div>
        {variant === "own" ? (
          <span className="text-[10px] font-black bg-white/5 px-4 py-1.5 rounded-full text-muted-foreground uppercase border border-white/5">
            {badge}
          </span>
        ) : (
          <div className="flex items-center gap-2 text-[10px] font-black text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
            <Globe size={12} /> {badge}
          </div>
        )}
      </div>

      {/* Slave Warning (shared only) */}
      {showSlaveWarning && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center gap-4 text-amber-500">
          <AlertCircle size={24} />
          <p className="text-sm font-bold">
            Necesitas una cuenta <strong>ESCLAVA</strong> para poder copiarte
            cualquier plantilla.
          </p>
        </div>
      )}

      {/* Template Cards */}
      {templates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            {variant === "own"
              ? templates.map((model) => (
                  <TemplateCard
                    key={model.id}
                    template={model}
                    masters={masters}
                    isEditing={editingId === model.id}
                    onEdit={onEdit!}
                    onDelete={onDelete!}
                    onUpdate={onUpdate!}
                    onUnfollow={onUnfollow}
                    onCancelEdit={onCancelEdit!}
                  />
                ))
              : templates.map((model) => (
                  <SharedTemplateCard
                    key={model.id}
                    template={model}
                    hasSlave={hasSlave}
                    isTrader={isTrader}
                    onClone={onClone!}
                    onFollow={onFollow!}
                  />
                ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="mt-8"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white/5 border border-dashed border-white/10 rounded-[3rem] text-center group hover:bg-white/[0.07] transition-all">
          <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Layout className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <p className="text-xl font-black text-muted-foreground mb-2">
            {emptyTitle}
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-[280px]">
            {emptyDescription}
          </p>
        </div>
      )}
    </div>
  );
}
