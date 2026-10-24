import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Users, 
  Send, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  Sparkles, 
  UserPlus, 
  CheckCircle2, 
  ExternalLink,
  Bot,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAssignee, LineFriendMember } from '../types';

export const UsersView: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    tasks, 
    settings, 
    lineMembers, 
    syncLineMemberToUser, 
    simulateLineAddFriend, 
    setToastBanner 
  } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAssignee | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [lineUserId, setLineUserId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const AVATAR_GRADIENTS = [
    'from-blue-600 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-purple-600 to-pink-600',
    'from-rose-500 to-red-600',
    'from-cyan-500 to-blue-600',
  ];

  const botBasicId = settings.lineBotBasicId || '@nonglekha';
  const cleanBotId = botBasicId.startsWith('@') ? botBasicId : `@${botBasicId}`;
  const addFriendLink = `https://line.me/R/ti/p/${cleanBotId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(addFriendLink);
    setCopiedLink(true);
    setToastBanner({
      type: 'success',
      message: 'คัดลอกลิงก์เพิ่มเพื่อน LINE แล้ว! นำไปส่งในกลุ่มหรือส่งให้ทีมงานได้เลย',
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenNew = () => {
    setEditingUser(null);
    setName('');
    setRole('');
    setEmail('');
    setLineUserId('');
    setIsEditing(true);
  };

  const handleEdit = (u: UserAssignee) => {
    setEditingUser(u);
    setName(u.name);
    setRole(u.role);
    setEmail(u.email);
    setLineUserId(u.lineUserId || '');
    setIsEditing(true);
  };

  const handleSelectLineFriend = (member: LineFriendMember) => {
    setLineUserId(member.userId);
    if (!name.trim()) {
      setName(member.displayName);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name,
        role,
        email,
        lineUserId: lineUserId.trim() || undefined,
      });
    } else {
      const randomGradient = AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];
      addUser({
        name,
        role,
        email,
        avatarColor: randomGradient,
        lineUserId: lineUserId.trim() || undefined,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Clean Executive Style */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>สมาชิกและผู้รับผิดชอบ (Team & Assignees)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการสมาชิกในทีม มอบหมายงาน และผูกบัญชี LINE สำหรับส่งแจ้งเตือนรายบุคคลหรือกลุ่ม
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => simulateLineAddFriend()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all cursor-pointer min-h-[40px] active:scale-97 shadow-2xs"
            title="ทดลองจำลองเพื่อนคนใหม่กดแอดบอท"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>⚡ จำลองเพื่อนกดแอดบอท</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-97 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>เพิ่มสมาชิกใหม่</span>
          </button>
        </div>
      </div>

      {/* Feature Banner: Add Bot as Friend Instead of Asking for LINE User ID */}
      <div className="bg-gradient-to-r from-emerald-50/90 via-white to-blue-50/80 rounded-2xl sm:rounded-3xl border border-emerald-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#00B900] text-white flex items-center justify-center font-bold shadow-sm shadow-[#00B900]/25">
                <Smartphone className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>ให้เพิ่มบอทเป็นเพื่อนแทน ไม่ต้องขอ LINE User ID!</span>
                <span className="text-[10px] font-bold bg-[#00B900]/15 text-[#008700] px-2 py-0.5 rounded-full border border-[#00B900]/30">
                  ง่ายที่สุด ✨
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-10">
              คนทั่วไปหา LINE User ID ของตัวเองไม่เป็น คุณไม่ต้องไปอธิบายวิธีหาให้ยุ่งยากอีกต่อไป — เพียงให้เขาสแกน QR Code หรือส่งลิงก์เพิ่มเพื่อนให้เขากด <strong>"เพิ่มเพื่อน"</strong> ใน LINE ระบบจะตรวจจับ User ID และชื่อโปรไฟล์ LINE มาบันทึกให้อัตโนมัติ 100%!
            </p>
          </div>

          {/* Quick Action Button for Add Friend Link */}
          <div className="flex flex-wrap items-center gap-2 pl-10 md:pl-0 shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00B900] hover:bg-[#009e00] text-white rounded-2xl text-xs font-bold transition-all shadow-sm shadow-[#00B900]/25 cursor-pointer active:scale-97"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์แอดเพื่อนส่งในแชท'}</span>
            </button>
          </div>
        </div>

        {/* 3 Step Visual Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>ส่งลิงก์ / QR Code ให้เพื่อน</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ส่งลิงก์ <code className="bg-slate-100 text-emerald-800 px-1 py-0.5 rounded font-mono text-[10px]">{cleanBotId}</code> ให้เพื่อนหรือดึงบอทเข้ากลุ่มทำงาน
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>เพื่อนกด "เพิ่มเพื่อน" ใน LINE</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ระบบ Webhook จะได้รับสัญญาณทันที และดึง <strong>ชื่อโปรไฟล์ LINE</strong> มาบันทึกให้อัตโนมัติ พร้อมส่งข้อความต้อนรับ
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>เลือกผูกชื่อในคลิกเดียว</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              รายชื่อเพื่อนจะปรากฏในตารางด้านล่าง คุณเพียงกด <strong>"ผูกเข้าสู่ทีม"</strong> โดยไม่ต้องพิมพ์ ID เลยแม้แต่ตัวเดียว
            </p>
          </div>
        </div>
      </div>

      {/* Captured LINE Friends List (Automated from Add Friend / Webhook) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                รายชื่อเพื่อน LINE ที่แอดบอทแล้ว ({lineMembers.length} รายการ)
              </h3>
              <p className="text-[11px] text-slate-500">
                ดึงข้อมูลอัตโนมัติเมื่อมีคนแอดเพื่อนหรือดึงบอทเข้ากลุ่ม LINE
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            ● ระบบจับสัญญาณอัตโนมัติ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lineMembers.map((member) => {
            const isAlreadyLinked = users.some(u => u.lineUserId === member.userId);
            const linkedUser = users.find(u => u.lineUserId === member.userId);

            return (
              <div 
                key={member.userId} 
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#00B900] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {member.displayName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {member.displayName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        ID: {member.userId.substring(0, 10)}...
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    member.type === 'group' 
                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {member.type === 'group' ? 'กลุ่ม LINE' : 'เพื่อนใน LINE'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 text-[10px]">
                    เพิ่มเมื่อ: {member.joinedAt}
                  </span>

                  {isAlreadyLinked ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ผูกกับ {linkedUser?.name} แล้ว</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => syncLineMemberToUser(member)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ ผูกเข้าสู่ทีม</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Grid (Team Members) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            ทำเนียบสมาชิกในทีม (Team Members) - {users.length} คน
          </h2>
          <span className="text-xs text-slate-500">
            พร้อมรับมอบหมายงานและแจ้งเตือนผ่าน LINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {users.map((u) => {
            const userTasks = tasks.filter(t => t.assigneeId === u.id);
            const pendingTasks = userTasks.filter(t => t.status !== 'completed');

            return (
              <div
                key={u.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 tracking-tight">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{u.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{u.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {users.length > 1 && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">อีเมล:</span>
                      <span className="font-mono text-slate-800 font-medium">{u.email || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">สถานะ LINE:</span>
                      {u.lineUserId ? (
                        <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>เชื่อมต่อแล้ว ({u.lineUserId.substring(0, 8)}...)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          ใช้ LINE รวมของระบบ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">งานที่มอบหมาย: <strong className="text-slate-900 font-bold">{userTasks.length}</strong></span>
                  <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                    ค้าง {pendingTasks.length} งาน
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">
              {editingUser ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Pick from Connected LINE Friends Helper */}
              {lineMembers.length > 0 && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1.5">
                  <label className="block font-bold text-emerald-950 text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>เลือกจากเพื่อน LINE ที่แอดบอทแล้ว (ไม่ต้องพิมพ์ ID):</span>
                  </label>
                  <select
                    onChange={(e) => {
                      const found = lineMembers.find(m => m.userId === e.target.value);
                      if (found) handleSelectLineFriend(found);
                    }}
                    value={lineUserId}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">- เลือกเพื่อน LINE ที่แอดบอทแล้ว -</option>
                    {lineMembers.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.displayName} ({m.type === 'group' ? 'กลุ่ม' : 'ส่วนตัว'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-emerald-700">
                    * เมื่อเลือก ระบบจะกรอกชื่อและผูก LINE User ID ให้ทันทีโดยไม่ต้องถามหา ID
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น คุณสมศักดิ์, Jane Doe..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ตำแหน่ง / ฝ่าย:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="เช่น ฝ่ายการตลาด, Developer, ผู้จัดการ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">อีเมล:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  LINE User ID (ผูกอัตโนมัติจากการแอดเพื่อน):
                </label>
                <input
                  type="text"
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  placeholder="จะถูกกรอกให้อัตโนมัติเมื่อเลือกเพื่อนด้านบน..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  * หากเว้นว่างไว้ ระบบจะใช้ LINE รวมในหน้าตั้งค่า
                </p>
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
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

