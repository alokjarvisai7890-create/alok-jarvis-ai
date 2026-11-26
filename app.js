const $ = (id) => document.getElementById(id);
const messages = $("messages");
const input = $("messageInput");
const avatar = $("avatar");
const menu = $("secretMenu");
let lastTap = 0;
let chosenVoice = null;

function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = "bubble " + who;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
function alokReply(text) {
  const t = text.toLowerCase();
  if (/hello|hi|hey|hii|namaste/.test(t)) return "Hey Anshu! 😄 Kya haal hai dost? Aaj kya plan hai?";
  if (/kaise ho|how are you/.test(t)) return "Main mast hoon Anshu! Tumse baat karke aur bhi achha lag raha hai. ❤️";
  if (/naam|name/.test(t)) return "Mera naam ALOK hai, aur tum mere dost Anshu ho!";
  if (/joke|hasao|funny/.test(t)) return "Ek joke suno Anshu: Computer thak kyun gaya? Kyunki uske bahut saare tabs khule the! 😂";
  if (/time|samay|baje/.test(t)) return "Phone ki current time dekh lo Anshu. Main abhi starter mode mein hoon.";
  return "Samajh gaya Anshu! ❤️ Main abhi starter version hoon. Is feature ko hum next updates mein smart AI se connect karenge. Tum mujhe aur batao!";
}
function speak(text) {
  if (!("speechSynthesis" in window)) { alert("Is browser mein text-to-speech support nahi hai."); return; }
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  utter.pitch = Number($("pitch").value);
  utter.rate = Number($("rate").value);
  const voices = speechSynthesis.getVoices();
  if (chosenVoice) utter.voice = voices.find(v => v.name === chosenVoice) || null;
  speechSynthesis.speak(utter);
}
function send(text) {
  const clean = text.trim(); if (!clean) return;
  addMessage(clean, "user"); input.value = "";
  const reply = alokReply(clean);
  setTimeout(() => { addMessage(reply, "bot"); }, 250);
}
$("chatForm").addEventListener("submit", e => { e.preventDefault(); send(input.value); });
$("speakBtn").addEventListener("click", () => {
  const last = [...messages.querySelectorAll(".bot")].pop();
  speak(last ? last.textContent : "Hey Anshu!");
});
$("micBtn").addEventListener("click", () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert("Voice input ke liye Android Chrome mein microphone permission aur Speech Recognition support chahiye."); return; }
  const rec = new SR(); rec.lang = "hi-IN"; rec.interimResults = false;
  rec.onresult = e => send(e.results[0][0].transcript);
  rec.onerror = () => alert("Voice input nahi chala. Microphone permission check karo.");
  rec.start();
});
function openMenu(){menu.classList.add("open");menu.setAttribute("aria-hidden","false");}
function closeMenu(){menu.classList.remove("open");menu.setAttribute("aria-hidden","true");}
avatar.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastTap < 450) openMenu();
  lastTap = now;
});
avatar.addEventListener("touchend", () => {
  const now = Date.now();
  if (now - lastTap < 450) openMenu();
  lastTap = now;
}, {passive:true});
$("closeMenu").addEventListener("click", closeMenu);
menu.addEventListener("click", e => { if (e.target === menu) closeMenu(); });
document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
  $("voicePanel").classList.toggle("hidden", tab.dataset.tab !== "voice");
  $("characterPanel").classList.toggle("hidden", tab.dataset.tab !== "character");
}));
$("pitch").addEventListener("input", e => $("pitchVal").textContent = Number(e.target.value).toFixed(1));
$("rate").addEventListener("input", e => $("rateVal").textContent = Number(e.target.value).toFixed(1));
$("testVoice").addEventListener("click", () => speak("Hey Anshu! Main ALOK hoon. Kaise ho mere dost?"));
$("voiceSelect").addEventListener("change", e => chosenVoice = e.target.value || null);
function loadVoices(){
  const select = $("voiceSelect"); const old = select.value;
  select.innerHTML = '<option value="">Default phone voice</option>';
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.getVoices().forEach(v => {
    const opt = document.createElement("option"); opt.value = v.name; opt.textContent = `${v.name} (${v.lang})`; select.appendChild(opt);
  });
  select.value = old;
}
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
