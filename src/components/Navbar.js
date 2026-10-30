export const Navbar = (activeTab, setActiveTab) => `
<nav class="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
  <div class="flex items-center gap-2 font-black text-xl tracking-tighter">
    <div class="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">F</div>
    VERIFACE
  </div>
  <div class="flex gap-1 p-1 bg-white border rounded-full shadow-sm">
    <button data-tab="attendance" class="tab-btn ${activeTab==='attendance'?'bg-black text-white':'text-zinc-500'} px-5 py-2 rounded-full text-sm font-medium">Mark Attendance</button>
    <button data-tab="register" class="tab-btn ${activeTab==='register'?'bg-black text-white':'text-zinc-500'} px-5 py-2 rounded-full text-sm font-medium">Register</button>
  </div>
  <div class="text-xs font-medium bg-white border px-3 py-1.5 rounded-full">DeepFace + OpenCV</div>
</nav>
`;