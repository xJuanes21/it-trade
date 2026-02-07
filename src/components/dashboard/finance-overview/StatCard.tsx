import React from "react";

interface StatCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: string;
}

export const StatCard = ({
  title,
  children,
  className = "",
  delay = "0s",
}: StatCardProps) => {
  return (
    <div
      className={`glass-widget-darker widget-hover p-4 md:p-5 stat-fade-in ${className}`}
      style={{ animationDelay: delay }}
    >
      <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-3 md:mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
};
