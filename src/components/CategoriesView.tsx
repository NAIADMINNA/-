import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FolderKanban } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, tasks } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#0071E3');
  const [description, setDescription] = useState('');

  const PRESET_COLORS = [
    { label: 'Blue', hex: '#0071E3' },
    { label: 'Green', hex: '#34C759' },
    { label: 'Orange', hex: '#FF9500' },
    { label: 'Purple', hex: '#AF52DE' },
    { label: 'Rose', hex: '#FF2D55' },
    { label: 'Cyan', hex: '#00C7BE' },
    { label: 'Indigo', hex: '#5856D6' },
    { label: 'Yellow', hex: '#FFCC00' },
  ];

  const handleOpenNew = () => {
    setEditingCategory(null);
    setName('');
    setColor('#0071E3');
    setDescription('');
    setIsEditing(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setDescription(cat.description || '');
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name,
        color,
        bgColor: `bg-slate-50`,
        textColor: 'text-slate-800',
        description,
      });
    } else {
      addCategory({
        name,
        color,
        bgColor: `bg-slate-50`,
        textColor: 'text-slate-800',
        description,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-slate-700" />
            <span>หมวดหมู่งาน (Categories)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            สร้างและกำหนดสีสำหรับแต่ละประเภทงาน เพื่อแยกแยะและกรองงานได้สะดวกรวดเร็ว
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-97 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer min-h-[40px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {/* Categories Grid with Colorful Highlights (1 col phone, 2 col tablet, 3 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {categories.map(cat => {
          const count = tasks.filter(t => t.categoryId === cat.id).length;
          const pendingCount = tasks.filter(t => t.categoryId === cat.id && t.status !== 'completed').length;

          return (
            <div
              key={cat.id}
              className="bg-white/95 backdrop-blur-md rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              style={{ borderColor: `${cat.color}35` }}
            >
              {/* Top Accent Strip */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: cat.color }}
              />

              <div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-2 ring-white"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="text-base font-extrabold text-slate-900">{cat.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 cursor-pointer"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs text-slate-500 mt-2">{cat.description}</p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  งานทั้งหมด: <strong className="text-slate-800 font-bold">{count}</strong>
                </span>
                <span 
                  className="font-bold px-2 py-0.5 rounded-full text-[11px]"
                  style={{
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                >
                  ค้างอยู่: {pendingCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">
              {editingCategory ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อหมวดหมู่:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Marketing, บัญชี, ส่วนตัว..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-semibold focus:outline-none focus:border-slate-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เลือกสีประจำหมวดหมู่:</label>
                <div className="flex items-center gap-2 mt-1">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer shadow-xs ${
                        color === c.hex ? 'scale-110 ring-2 ring-offset-2 ring-slate-800' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {color === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบายเพิ่มเติม:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="บันทึกรายละเอียดสั้นๆ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-slate-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-500/20 cursor-pointer active:scale-97 transition-all"
                >
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
