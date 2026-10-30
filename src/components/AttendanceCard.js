export const AttendanceCard = () => `
<div class="glass border border-white rounded-[2.5rem] p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12)]">
  <h1 class="text-6xl font-black tracking-tighter leading-[0.9]">Mark your <br><span class="text-violet-600">Presence.</span></h1>
  <div class="mt-8 relative aspect-[16/9] bg-zinc-900 rounded-[1.8rem] overflow-hidden">
    <img id="preview-att" class="hidden w-full h-full object-cover" />
    <div id="placeholder-att" class="w-full h-full flex flex-col items-center justify-center text-white/30">Camera Preview</div>
    <div class="scan-line absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
    <label class="absolute bottom-4 right-4 bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer">Upload Face<input type="file" id="file-att" class="hidden" accept="image/*"></label>
  </div>
  <div class="mt-6 grid grid-cols-2 gap-3">
    <button id="btn-attendance" class="bg-black text-white py-4 rounded-full font-semibold">Verify & Mark Attendance</button>
    <button id="btn-clear-att" class="bg-zinc-100 py-4 rounded-full font-semibold">Clear</button>
  </div>
  <p id="result-att" class="mt-4 text-center text-sm font-medium"></p>
</div>
`;