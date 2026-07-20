import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function SearchableSelect({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return options;
    return options.filter((option) => option.label.toLowerCase().includes(searchTerm));
  }, [options, query]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={selectedOption ? selectedOption.label : ''}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          readOnly
          required={required}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none bg-white shadow-sm cursor-pointer pr-10 placeholder:text-slate-400"
        />
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />

        {isOpen && (
          <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-teal-500">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${label ? label.toLowerCase() : 'options'}...`}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500">No matches found</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value || option.label}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm transition-colors flex items-center justify-between gap-3 ${isSelected ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-teal-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
