const $=id=>document.getElementById(id);
const ACCOUNT_KEY="taskflow_account_v2", SESSION_KEY="taskflow_session_v2";
let mode="login", view="dashboard", tasks=[], account=null;

function load(){
 account=JSON.parse(localStorage.getItem(ACCOUNT_KEY)||"null");
 if(localStorage.getItem(SESSION_KEY)&&account){showApp();tasks=JSON.parse(localStorage.getItem("taskflow_tasks_"+account.username)||"[]");render();}
}
function save(){if(account)localStorage.setItem("taskflow_tasks_"+account.username,JSON.stringify(tasks))}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function days(d){let a=new Date();a.setHours(0,0,0,0);return Math.ceil((new Date(d+"T00:00:00")-a)/86400000)}
function date(d){return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(d+"T00:00:00"))}
function priority(p){return p==="high"?"Tinggi":p==="medium"?"Sedang":"Rendah"}

function showApp(){
 $("authScreen").classList.add("hidden");$("appScreen").classList.remove("hidden");
 $("profileName").textContent=account.username;$("avatar").textContent=account.username[0].toUpperCase();
 $("hello").textContent=`Selamat datang, ${account.username} 👋`;
}
$("switchAuth").onclick=()=>{mode=mode==="login"?"register":"login";$("authTitle").innerHTML=mode==="login"?'Kelola tugas. <span>Lebih teratur.</span>':'Buat akun. <span>Mulai produktif.</span>';$("authSubtitle").textContent=mode==="login"?"Masuk ke dashboard pribadi kamu dan pantau semua deadline kuliah dalam satu tempat.":"Buat akun lokal untuk menyimpan tugas kuliah kamu di browser ini.";$("authSubmit").innerHTML=mode==="login"?'Masuk ke Dashboard <span>→</span>':'Buat Akun <span>→</span>';$("switchAuth").innerHTML=mode==="login"?'Belum punya akun? <button type="button">Daftar sekarang</button>':'Sudah punya akun? <button type="button">Masuk sekarang</button>';};
$("switchAuth").addEventListener("click",()=>{}); // label click is handled by delegated-style refresh below
document.addEventListener("click",e=>{if(e.target.closest("#switchAuth button")){$("switchAuth").click();}});

$("authForm").onsubmit=e=>{e.preventDefault();let u=$("authUser").value.trim(),p=$("authPass").value;if(!u||!p)return;
 if(mode==="register"){if(localStorage.getItem(ACCOUNT_KEY)){alert("Akun lokal sudah ada. Silakan masuk.");return}account={username:u,password:p};localStorage.setItem(ACCOUNT_KEY,JSON.stringify(account));localStorage.setItem(SESSION_KEY,"1");tasks=[];showApp();render();}
 else {let saved=JSON.parse(localStorage.getItem(ACCOUNT_KEY)||"null");if(!saved||saved.username!==u||saved.password!==p){alert("Username atau password salah.");return}account=saved;localStorage.setItem(SESSION_KEY,"1");tasks=JSON.parse(localStorage.getItem("taskflow_tasks_"+u)||"[]");showApp();render();}
};
$("showPass").onclick=()=>{$("authPass").type=$("authPass").type==="password"?"text":"password"};
$("logoutBtn").onclick=()=>{localStorage.removeItem(SESSION_KEY);location.reload()};
$("themeBtn").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("taskflow_theme",document.body.classList.contains("light")?"light":"dark")};
if(localStorage.getItem("taskflow_theme")==="light")document.body.classList.add("light");

function countUp(el,to){let start=0,step=Math.max(1,Math.ceil(to/18));let timer=setInterval(()=>{start=Math.min(to,start+step);el.textContent=start;if(start>=to)clearInterval(timer)},25)}
function render(){
 let done=tasks.filter(t=>t.done).length,pending=tasks.length-done,urgent=tasks.filter(t=>!t.done&&days(t.deadline)>=0&&days(t.deadline)<=3).length,total=tasks.length,pct=total?Math.round(done/total*100):0;
 [["total",total],["pending",pending],["done",done],["urgent",urgent]].forEach(([k,v])=>countUp(document.querySelector(`[data-count="${k}"]`),v));
 $("navAll").textContent=total;$("navPending").textContent=pending;$("navDone").textContent=done;$("progressText").textContent=pct+"%";$("ringNumber").textContent=pct+"%";$("progressRing").style.background=`conic-gradient(#7c68ff ${pct*3.6}deg,#ffffff0c 0deg)`;
 $("quote").textContent=pct===100?"🎉 Semua tugas selesai! Mantap!":pct>=70?"🔥 Tinggal sedikit lagi. Kamu pasti bisa!":pct>=40?"🚀 Progress bagus, lanjutkan!":"💡 Sedikit demi sedikit, semua akan selesai.";
 let q=$("search").value.toLowerCase(), list=tasks.filter(t=>(view==="all"||view==="dashboard"&&true||view==="pending"&&!t.done||view==="done"&&t.done)&&(`${t.name} ${t.course} ${t.description}`.toLowerCase().includes(q)));
 let s=$("sort").value;list.sort((a,b)=>s==="newest"?b.createdAt-a.createdAt:s==="name"?a.name.localeCompare(b.name):s==="priority"?({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority]):a.deadline.localeCompare(b.deadline));
 $("listTitle").textContent=view==="dashboard"?"Tugas Terbaru":view==="pending"?"Belum Selesai":view==="done"?"Tugas Selesai":"Semua Tugas";
 $("taskList").innerHTML=list.length?list.map((t,i)=>{let d=days(t.deadline),dt=t.done?date(t.deadline):d<0?`Terlambat ${Math.abs(d)} hari`:d===0?"Hari ini":d===1?"Besok":`${date(t.deadline)} · ${d} hari lagi`;return `<article class="task glass" style="animation-delay:${i*40}ms"><button class="check ${t.done?"done":""}" onclick="toggle('${t.id}')">${t.done?"✓":""}</button><div><h4 class="${t.done?"done":""}">${esc(t.name)}</h4><div class="meta"><span>${esc(t.course)}</span><span>•</span><span class="badge ${t.priority}">${priority(t.priority)}</span><span>•</span><span>${dt}</span></div>${t.description?`<p class="desc">${esc(t.description)}</p>`:""}</div><div class="actions"><button class="mini" onclick="edit('${t.id}')">Edit</button><button class="mini del" onclick="removeTask('${t.id}')">Hapus</button></div></article>`}).join(""):`<div class="empty glass"><strong>✨ Tidak ada tugas di sini</strong>Tambahkan tugas baru untuk mulai mengatur kuliahmu.</div>`;
}
function openModal(t=null){$("modal").classList.remove("hidden");if(t){$("modalTitle").textContent="Edit Tugas";$("taskId").value=t.id;$("taskName").value=t.name;$("course").value=t.course;$("deadline").value=t.deadline;$("priority").value=t.priority;$("description").value=t.description||""}else{$("modalTitle").textContent="Tambah Tugas";$("taskForm").reset();$("taskId").value="";$("priority").value="medium";$("deadline").value=new Date().toISOString().slice(0,10)}setTimeout(()=>$("taskName").focus(),50)}
function closeModal(){$("modal").classList.add("hidden")}
$("addBtn").onclick=()=>openModal();$("close").onclick=closeModal;$("cancel").onclick=closeModal;
$("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("taskForm").onsubmit=e=>{e.preventDefault();let id=$("taskId").value,data={name:$("taskName").value.trim(),course:$("course").value.trim(),deadline:$("deadline").value,priority:$("priority").value,description:$("description").value.trim()};if(id){let i=tasks.findIndex(t=>t.id===id);tasks[i]={...tasks[i],...data}}else tasks.push({id:crypto.randomUUID?crypto.randomUUID():Date.now()+"",...data,done:false,createdAt:Date.now()});save();render();closeModal()};
window.toggle=id=>{let t=tasks.find(x=>x.id===id);t.done=!t.done;save();render()};
window.edit=id=>openModal(tasks.find(x=>x.id===id));
window.removeTask=id=>{let t=tasks.find(x=>x.id===id);if(confirm(`Hapus "${t.name}"?`)){tasks=tasks.filter(x=>x.id!==id);save();render()}};
$("search").oninput=render;$("sort").onchange=render;
document.querySelectorAll(".nav[data-view]").forEach(n=>n.onclick=()=>{view=n.dataset.view;document.querySelectorAll(".nav[data-view]").forEach(x=>x.classList.remove("active"));n.classList.add("active");render()});
load();
