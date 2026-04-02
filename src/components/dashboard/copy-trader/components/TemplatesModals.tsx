"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, User as UserIcon } from "lucide-react";
import TemplateForm from "../TemplateForm";
import { FollowModal } from "./FollowModal";

// Minimal X icon (inline SVG)
const XIcon = ({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

interface TemplatesModalsProps {
  // Create / Clone Modal
  isAdding: boolean;
  cloneData: any;
  masters: any[];
  onCloseAdd: () => void;
  onCreate: (data: any) => void;

  // Follow Modal
  followTarget: any;
  onCloseFollow: () => void;
  onConfirmFollow: (slaveId: string) => Promise<void>;
  slaves: any[];
}

export function TemplatesModals({
  isAdding,
  cloneData,
  masters,
  onCloseAdd,
  onCreate,
  followTarget,
  onCloseFollow,
  onConfirmFollow,
  slaves,
}: TemplatesModalsProps) {
  return (
    <>
      {/* New / Clone Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-8">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-white/10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="sticky top-0 z-20 flex items-center justify-between p-8 bg-card/80 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Plus size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1">
                    {cloneData ? "Modo Clonación" : "Creación de Estrategia"}
                  </p>
                  <h2 className="text-2xl font-black text-foreground">
                    {cloneData
                      ? `Clonando: ${cloneData.name}`
                      : "Nueva Plantilla de Trading"}
                  </h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseAdd}
                className="rounded-full h-12 w-12 hover:bg-white/5"
              >
                <XIcon className="h-6 w-6" />
              </Button>
            </div>

            <div className="p-8 sm:p-12 pb-60">
              {masters.length > 0 ? (
                <TemplateForm
                  masters={masters}
                  initialData={cloneData}
                  onSubmit={onCreate}
                  onCancel={onCloseAdd}
                />
              ) : (
                <div className="p-10 text-center border border-dashed border-white/10 rounded-[2rem]">
                  <UserIcon
                    size={40}
                    className="mx-auto mb-4 text-muted-foreground opacity-30"
                  />
                  <p className="text-lg font-bold mb-2">
                    Para crear una plantilla necesitas una cuenta Master
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Configura una cuenta institucional desde la sección Cuentas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Follow / Subscribe Modal */}
      <FollowModal
        isOpen={!!followTarget}
        onClose={onCloseFollow}
        onConfirm={onConfirmFollow}
        slaves={slaves}
        templateName={followTarget?.name || ""}
      />
    </>
  );
}
