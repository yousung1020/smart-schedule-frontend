import { type ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * 일관된 레이아웃 컨테이너를 위한 기본 카드 컴포넌트
 */
export const Card = ({ title, children, className = "" }: CardProps) => (
  <div className={`bg-white border border-slate-200 rounded-3xl p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col ${className}`}>
    <h3 className="text-lg font-bold mb-4 text-slate-900 font-heading tracking-tight">{title}</h3>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

/**
 * 대시보드 지표 표시를 위한 특화된 통계 카드 컴포넌트
 */
export const StatCard = ({ title, children, className = "" }: CardProps) => (
  <Card title={title} className={className}>
    <div className="flex flex-col items-center justify-center h-full min-h-[140px]">
      {children}
    </div>
  </Card>
);
