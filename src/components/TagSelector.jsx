import React, { useState, useRef, useEffect } from 'react';
import { Tag, Plus, Check, Search, X } from 'lucide-react';
import { TagBadge, getTagColorClass } from './TagBadge';

export default function TagSelector({
  selectedTags = [],
  availableTags = [],
  onToggleTag,
  onCreateTag,
  onRemoveTag,
  mode = 'popover', // 'popover' or 'inline'
  buttonLabel = 'Tag',
  placeholder = 'Type custom tag name...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const tagList = availableTags.map(t => typeof t === 'string' ? t : t.value || t.name).filter(Boolean);
  
  // All unique known tags excluding ones already added to this patient
  const availableUnselectedTags = Array.from(new Set(tagList)).filter(
    tag => !selectedTags.some(st => st.toLowerCase() === tag.toLowerCase())
  );

  const queryTrimmed = searchQuery.trim();

  // Filter only matching unselected tags when typed
  const filteredTags = queryTrimmed
    ? availableUnselectedTags.filter(tag =>
        tag.toLowerCase().includes(queryTrimmed.toLowerCase())
      )
    : [];

  const isExactMatch = availableUnselectedTags.some(
    tag => tag.toLowerCase() === queryTrimmed.toLowerCase()
  );

  const isAlreadySelected = selectedTags.some(
    tag => tag.toLowerCase() === queryTrimmed.toLowerCase()
  );

  const handleSelectTag = (tag) => {
    if (!tag) return;
    if (onToggleTag) onToggleTag(tag);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    if (!queryTrimmed) return;
    if (isAlreadySelected) {
      setSearchQuery('');
      setIsOpen(false);
      return;
    }
    if (onCreateTag) {
      onCreateTag(queryTrimmed);
    } else if (onToggleTag) {
      onToggleTag(queryTrimmed);
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (queryTrimmed) {
        const exactMatch = availableUnselectedTags.find(
          t => t.toLowerCase() === queryTrimmed.toLowerCase()
        );
        if (exactMatch) {
          handleSelectTag(exactMatch);
        } else if (!isAlreadySelected) {
          handleCreateNew();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const cleanButtonLabel = buttonLabel ? buttonLabel.replace(/^\+\s*/, '') : 'Tag';

  if (mode === 'inline') {
    return (
      <div className="space-y-2 w-full">
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px] focus-within:ring-2 focus-within:ring-teal-500 focus-within:bg-white focus-within:border-teal-400 transition-all">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              onRemove={onRemoveTag ? () => onRemoveTag(tag) : (onToggleTag ? () => onToggleTag(tag) : undefined)}
              size="sm"
            />
          ))}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : 'Type to add more...'}
            className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-800 outline-none px-1 py-0.5"
          />
        </div>

        {/* Existing unselected custom tags (if any exist in database) */}
        {availableUnselectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center">
              <Tag className="h-3 w-3 mr-1 opacity-70" /> Quick Add:
            </span>
            {availableUnselectedTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag && onToggleTag(tag)}
                className="text-[11px] px-2 py-0.5 rounded-md border font-medium bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
              >
                + {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Popover mode (for detail modal header and cards)
  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery('');
        }}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border border-dashed border-teal-300 text-teal-700 bg-teal-50/80 hover:bg-teal-100 hover:border-teal-400 transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
        title="Add tag"
      >
        <Plus className="h-3 w-3 shrink-0" />
        <span>{cleanButtonLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-0 top-full mt-1.5 w-64 sm:w-72 max-w-[calc(100vw-3rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-[300] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/90">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type tag name..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Dropdown content */}
          {queryTrimmed ? (
            <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
              {filteredTags.length > 0 && (
                filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getTagColorClass(tag).split(' ')[0]}`} />
                      <span className="truncate">{tag}</span>
                    </div>
                    <span className="text-[10px] text-teal-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      + Add
                    </span>
                  </button>
                ))
              )}

              {isAlreadySelected && (
                <div className="p-2 text-center text-xs text-amber-600 font-medium">
                  "{queryTrimmed}" is already added
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 text-center text-xs text-slate-400">
              <Tag className="h-4 w-4 mx-auto mb-1 opacity-50 text-teal-600" />
              <p className="font-medium text-slate-600">Type tag name</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Press Enter to add tag</p>
            </div>
          )}

          {/* Create New Tag Button (only when typed, not exact match, and not already selected) */}
          {queryTrimmed && !isExactMatch && !isAlreadySelected && (
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add "{queryTrimmed}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
