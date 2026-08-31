import React from 'react';
import { X, Tag } from 'lucide-react';

const DYNAMIC_PALETTES = [
  'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20 hover:bg-emerald-100',
  'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20 hover:bg-sky-100',
  'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20 hover:bg-amber-100',
  'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20 hover:bg-purple-100',
  'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20 hover:bg-rose-100',
  'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20 hover:bg-teal-100',
  'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20 hover:bg-indigo-100',
  'bg-pink-50 text-pink-700 border-pink-200 ring-pink-500/20 hover:bg-pink-100',
  'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20 hover:bg-orange-100',
  'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-500/20 hover:bg-cyan-100',
  'bg-violet-50 text-violet-700 border-violet-200 ring-violet-500/20 hover:bg-violet-100',
];

export const getTagColorClass = (tagName = '') => {
  if (!tagName) return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = (hash << 5) - hash + tagName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DYNAMIC_PALETTES.length;
  return DYNAMIC_PALETTES[index];
};

export const TagBadge = ({ 
  tag, 
  onRemove, 
  onClick, 
  size = 'md',
  showIcon = false,
  className = '' 
}) => {
  const colorClass = getTagColorClass(tag);
  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-semibold rounded-full border shadow-2xs transition-all duration-150 whitespace-nowrap max-w-full ${colorClass} ${onClick ? 'cursor-pointer hover:shadow-xs' : ''} ${sizeClasses} ${className}`}
    >
      {showIcon && <Tag className="h-3 w-3 shrink-0 opacity-70" />}
      <span className="truncate max-w-[160px] sm:max-w-[200px]">{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors text-inherit opacity-70 hover:opacity-100 cursor-pointer"
          title={`Remove tag "${tag}"`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};
export default TagBadge;
