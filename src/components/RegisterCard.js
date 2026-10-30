export const RegisterCard = () => `
<div class="glass border border-white rounded-[2.5rem] p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12)]">
  <h1 class="text-6xl font-black tracking-tighter">Register new <br><span class="text-blue-600">Student.</span></h1>
  <div class="mt-8 grid grid-cols-2 gap-4">
    <label class="bg-zinc-50 border rounded-2xl p-4"><span class="text-[11px] text-zinc-400">ROLL NO</span><input id="roll" class="w-full bg-transparent outline-none font-semibold mt-1" placeholder="CS-2024-001"/></label>
    <label class="bg-zinc-50 border rounded-2xl p-4"><span class="text-[11px] text-zinc-400">FULL NAME</span><input id="name" class="w-full bg-transparent outline-none font-semibold mt-1" placeholder="Palak Sharma"/></label>
  </div>
  <label class="mt-4 border-2 border-dashed rounded-[1.8rem] h-56 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 overflow-hidden">
    <img id="preview-reg" class="hidden h-full w-full object-cover rounded-[1.8rem]" />
    <span id="placeholder-reg" class="text-sm font-medium">Click to upload clear front face</span>
    <input type="file" id="file-reg" class="hidden" accept="image/*">
  </label>
  <button id="btn-register" class="w-full mt-6 bg-blue-600 text-white py-4 rounded-full font-semibold">Save with DeepFace Embedding</button>
  <p id="result-reg" class="mt-4 text-center text-sm font-medium"></p>
</div>
`;