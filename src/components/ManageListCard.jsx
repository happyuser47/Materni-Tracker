import React, { useState } from 'react';
import { Check, Edit2, Trash2, Plus } from 'lucide-react';

export const ManageListCard = ({ title, listType, items, handleModifyList, placeholder, requestConfirm }) => {
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newItem.trim();
    if (trimmed && !items.some(item => item.value === trimmed)) {
      await handleModifyList(listType, 'add', trimmed);
      setNewItem('');
    }
  };

  const handleDelete = (item) => {
    requestConfirm(
      `Are you sure you want to delete "${item.value}" from ${title}?`,
      () => handleModifyList(listType, 'delete', item.value, item.id)
    );
  };

  const handleSaveEdit = async (item) => {
    const trimmed = editValue.trim();
    if (trimmed && (!items.some(i => i.value === trimmed) || item.value === trimmed)) {
      await handleModifyList(listType, 'edit', trimmed, item.id);
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col h-[350px] md:h-[400px]">
      <h3 className="font-bold text-slate-800 text-lg mb-4 shrink-0">{title}</h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 shrink-0 w-full">
        <input 
          type="text" 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-sm border border-slate-300 rounded-lg px-3 lg:px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        />
        <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white p-2 flex items-center justify-center rounded-lg transition-colors shrink-0 aspect-square">
          <Plus className="h-5 w-5" />
        </button>
      </form>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-0">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-lg group">
            {editingId === item.id ? (
              <input 
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item)}
                className="flex-1 min-w-0 text-sm bg-white border border-slate-300 rounded px-2 py-1 outline-none mr-2 focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
            ) : (
              <span className="text-sm text-slate-700 truncate min-w-0 flex-1 mr-2" title={item.value}>{item.value}</span>
            )}
            
            <div className="flex items-center gap-1 shrink-0">
              {editingId === item.id ? (
                <button onClick={() => handleSaveEdit(item)} className="text-teal-600 hover:bg-teal-100 p-1.5 rounded transition-colors" title="Save">
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  onClick={() => { setEditingId(item.id); setEditValue(item.value); }} 
                  className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 p-1.5 rounded transition-colors opacity-0 md:group-hover:opacity-100"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => handleDelete(item)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors opacity-0 md:group-hover:opacity-100" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};