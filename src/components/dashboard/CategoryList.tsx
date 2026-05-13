import { Plus } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat.name} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
            <span className="text-slate-700">{cat.name}</span>
          </div>
          <span className="font-semibold text-slate-500">{cat.value}%</span>
        </div>
      ))}
      <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm hover:border-indigo-400 hover:text-indigo-600 transition-all">
        <Plus size={16} />
        <span>새 카테고리</span>
      </button>
    </div>
  );
};
