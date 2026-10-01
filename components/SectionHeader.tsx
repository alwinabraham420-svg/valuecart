import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  children?: React.ReactNode;
}

export default function SectionHeader({
  title,
  highlight,
  subtitle,
  actionText,
  actionHref,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-valuecart-navy tracking-tight flex items-center gap-1.5">
          <span>{title}</span>
          {highlight && <span className="text-valuecart-green">{highlight}</span>}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-valuecart-text-muted mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 self-start sm:self-auto">
        {children}

        {actionText && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-valuecart-navy hover:text-valuecart-green transition-colors group"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
