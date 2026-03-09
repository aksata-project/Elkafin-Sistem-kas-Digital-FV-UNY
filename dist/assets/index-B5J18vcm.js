import{_ as N,r as Be,u as C,w as ce,E as Me}from"./export-CmNG1Z6L.js";import{i as $e,g as Ce,a as _e,G as Se,s as Te,b as Ae,o as De,c as F,d as M,e as T,f as I,h as $,q as K,j as ae,k as me,l as R,w as ue,m as H,u as Pe,T as ne,n as W}from"./firebase-CPwTeqWU.js";import{C as ge,r as je}from"./charts-DU5eDjOK.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(s){if(s.ep)return;s.ep=!0;const o=a(s);fetch(s.href,o)}})();const Ke={apiKey:"AIzaSyA6OoKEDECUhf9kzTXPDVybXQnx3Oor9xM",authDomain:"elka-financial-app.firebaseapp.com",projectId:"elka-financial-app",storageBucket:"elka-financial-app.appspot.com",messagingSenderId:"754443991037",appId:"1:754443991037:web:62f9b95b4a39370577cb94"},pe=$e(Ke),ee=Ce(pe),v=_e(pe),Ne=new Se,A=e=>2e3;let B=null,p=null,Y=!0,be=[];function se(e){B=e}function oe(e){p=e}function fe(e){Y=e}function he(e){be=e}const c={allStudents:[],kasTransactions:[],kasExpenses:[],roles:{},announcement:null,currentWeek:1,manualMaxWeek:1,paymentStatusPage:0,trenKasPage:0,carryOver:{teori_c:0,teori_d:0,angkatan:0},warnings:{}};let P={};const Re=()=>{P={},c.kasTransactions.forEach(e=>{P[e.nim]||(P[e.nim]={}),P[e.nim][e.week]=(P[e.nim][e.week]||0)+e.amount})},te=(e,t)=>{var a;return((a=P[e])==null?void 0:a[t])||0},_=e=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(e),J=e=>e?new Date(e.seconds*1e3).toLocaleString("id-ID",{dateStyle:"long",timeStyle:"short"}):"-",ye=Object.freeze(Object.defineProperty({__proto__:null,formatCurrency:_,formatDateTime:J},Symbol.toStringTag,{value:"Module"})),y=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),j=e=>c.allStudents.find(t=>t.nim===e),xe=e=>({mahasiswa:"Mahasiswa",bendahara_praktik:"Bendahara Praktik",bendahara_teori:"Bendahara Teori",bendahara_angkatan:"Ketua Kelas"})[e]||"Tidak Diketahui",ve=(e,t)=>{if(!t||!e)return!1;switch(t.role){case"bendahara_angkatan":return!0;case"bendahara_teori":return t.theoryClass===e.theoryClass;case"bendahara_praktik":return t.practiceClass===e.practiceClass;default:return!1}};function ke(){const e=new Date,t=document.getElementById("current-time"),a=document.getElementById("current-date");t&&(t.textContent=e.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).replace(/\./g,":")),a&&(a.textContent=e.toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"}))}function Q(e){var i;const t=e.target.closest("[data-view]");if(!t)return;e.preventDefault();const a=`view-${t.dataset.view}`;document.querySelectorAll(".view").forEach(m=>{m.classList.add("hidden"),m.classList.remove("view-enter")});const n=document.getElementById(a);n&&(n.classList.remove("hidden"),n.offsetWidth,n.classList.add("view-enter")),document.querySelectorAll(".nav-link").forEach(m=>m.classList.remove("nav-link-active","bg-blue-500/10","text-blue-400"));const s=document.querySelector(`.nav-link[data-view="${t.dataset.view}"]`);s&&s.classList.add("nav-link-active"),document.querySelectorAll(".bottom-nav-item").forEach(m=>m.classList.remove("active"));const o=document.getElementById(`bnav-${t.dataset.view}`);o&&o.classList.add("active"),window.innerWidth<768&&((i=document.getElementById("sidebar"))==null||i.classList.add("-translate-x-full"))}function X(e,{onExportExcel:t,onExportPdf:a,onAddWeek:n,onRemoveWeek:s}){var o,i,m;try{if(!e)return;document.getElementById("user-profile").innerHTML=`
            <p class="font-bold text-lg text-white">${y(e.displayName)}</p>
            <p class="text-sm text-gray-400">${y(e.nim)}</p>
            <p class="text-sm text-gray-500 truncate">${y(e.email)}</p>
            <span class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">${xe(e.role)}</span>
        `;const u=document.getElementById("main-nav");let l='<a href="#" data-view="angkatan" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>Kas Angkatan</a>';l+='<a href="#" data-view="pengeluaran" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 14a5 5 0 11-10 0 5 5 0 0110 0z"></path></svg>Pengeluaran</a>',(e.role==="bendahara_angkatan"||e.role==="bendahara_teori")&&(l+='<a href="#" data-view="arsip" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h4M8 7a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2z" /></svg>Arsip Laporan</a>',(o=document.getElementById("bnav-arsip"))==null||o.classList.remove("hidden")),e.role==="bendahara_angkatan"&&(l+='<a href="#" data-view="admin" class="nav-link flex items-center px-4 py-2.5 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Admin</a>',(i=document.getElementById("bnav-admin"))==null||i.classList.remove("hidden"));const d=document.getElementById("bottom-nav");d&&!d.dataset.handlersAttached&&(d.addEventListener("click",Q),d.dataset.handlersAttached="true"),u.innerHTML=l,u.dataset.handlersAttached||(u.addEventListener("click",Q),u.dataset.handlersAttached="true"),document.querySelectorAll(".nav-link").forEach(L=>L.classList.remove("nav-link-active"));const g=((m=document.querySelector(".view:not(.hidden)"))==null?void 0:m.id)||"view-angkatan",r=u.querySelector(`[data-view=${g.split("-")[1]}]`);r&&r.classList.add("nav-link-active");const b=e.role!=="mahasiswa",k=e.role==="bendahara_angkatan"||e.role==="bendahara_teori",f=e.role==="bendahara_angkatan",x=document.getElementById("treasurer-actions"),h=document.getElementById("week-management-actions");x.innerHTML=b?`
            <button id="export-excel-btn" class="btn-secondary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.5 1A1.5 1.5 0 001 2.5v11A1.5 1.5 0 002.5 15h11a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0013.5 1h-11zM2 2.5a.5.5 0 01.5-.5h11a.5.5 0 01.5.5v11a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5v-11z"/><path d="M5.884 4.61a.5.5 0 10-.768.64L7.349 8l-2.233 2.75a.5.5 0 00.768.64L8 8.781l2.116 2.609a.5.5 0 00.768-.64L8.651 8l2.233-2.75a.5.5 0 00-.768-.64L8 7.219 5.884 4.61z"/></svg>Excel</button>
            <button id="export-pdf-btn" class="btn-secondary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm0 1h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zm5 2.5a.5.5 0 00-1 0v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1z" clip-rule="evenodd"/></svg>PDF</button>`:"",b?(x.classList.remove("hidden"),document.getElementById("export-excel-btn").onclick=t,document.getElementById("export-pdf-btn").onclick=a):x.classList.add("hidden"),f?(h.classList.remove("hidden"),h.classList.add("flex"),document.getElementById("add-week-btn").onclick=n,document.getElementById("remove-week-btn").onclick=s):h.classList.add("hidden"),document.getElementById("view-pengeluaran").innerHTML=`
            <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 class="text-4xl font-bold text-white">Laporan Pengeluaran</h2>
                <div id="expense-actions">${k?'<button id="add-expense-btn" class="btn-primary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>Buat Pengeluaran</button>':""}</div>
            </div>
            <div class="glass-card p-6 rounded-xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead><tr class="border-b border-gray-800"><th class="p-4 text-sm font-semibold text-gray-400">Tanggal</th><th class="p-4 text-sm font-semibold text-gray-400">Deskripsi</th><th class="p-4 text-sm font-semibold text-gray-400">Kategori</th><th class="p-4 text-sm font-semibold text-gray-400">Jumlah</th><th class="p-4 text-sm font-semibold text-gray-400">Dicatat Oleh</th><th class="p-4 text-sm font-semibold text-gray-400 text-center">Aksi</th></tr></thead>
                        <tbody id="expenses-table-body"></tbody>
                    </table>
                </div>
            </div>`,ke()}catch(u){console.error("setupUI error:",u)}}const He=Object.freeze(Object.defineProperty({__proto__:null,findStudentByNim:j,getRoleName:xe,handleNavigation:Q,hasPermissionToEdit:ve,setupUI:X,updateTime:ke},Symbol.toStringTag,{value:"Module"}));function U(e,t,a,n=1e3,s=!0){if(!e)return;let o=null;const i=m=>{o||(o=m);const u=Math.min((m-o)/n,1),l=Math.floor(u*(a-t)+t);e.textContent=s?_(l):l,u<1&&window.requestAnimationFrame(i)};window.requestAnimationFrame(i)}const D={finalC:0,finalD:0,total:0};function q(){try{let e=c.carryOver.teori_c||0,t=c.carryOver.teori_d||0;const a=c.carryOver.angkatan||0;c.kasTransactions.forEach(r=>{const b=j(r.nim);b&&(b.theoryClass==="C"?e+=r.amount:b.theoryClass==="D"&&(t+=r.amount))});const n=c.kasExpenses.filter(r=>r.category==="teori_c").reduce((r,b)=>r+b.amount,0),s=c.kasExpenses.filter(r=>r.category==="teori_d").reduce((r,b)=>r+b.amount,0),o=c.kasExpenses.filter(r=>r.category==="angkatan").reduce((r,b)=>r+b.amount,0),i=e-n-o/2,m=t-s-o/2,u=i+m+a,l=document.getElementById("total-kas-c"),d=document.getElementById("total-kas-d"),g=document.getElementById("total-kas-angkatan");l&&U(l,D.finalC,i),d&&U(d,D.finalD,m),g&&U(g,D.total,u),D.finalC=i,D.finalD=m,D.total=u}catch(e){console.error("renderDashboardSummary error:",e)}}function Oe(){try{const e=document.getElementById("announcement-banner");c.announcement&&c.announcement.message?(e.innerHTML=`
                <div class="glass-card p-4 rounded-lg flex items-start gap-4 border border-blue-500/20">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.998.75a.75.75 0 01.75.75v5.021a3.021 3.021 0 11-4.042 0V1.5a.75.75 0 01.75-.75zM8.5 4.5a.75.75 0 00-1.5 0v3.406c0 .175.006.348.019.52a4.521 4.521 0 108.962 0c.013-.172.019-.345.019-.52V4.5a.75.75 0 00-1.5 0v2.521a3.021 3.021 0 11-6 0V4.5zM12.75 18a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5z" /></svg>
                    </div>
                    <div>
                        <p class="font-bold text-blue-400">Pengumuman</p>
                        <p class="text-sm text-gray-300">${y(c.announcement.message)}</p>
                        <p class="text-xs text-gray-500 mt-1">Diposting oleh ${y(c.announcement.authorName)} pada ${J(c.announcement.createdAt)}</p>
                    </div>
                    <button id="dismiss-announcement-btn" class="ml-auto text-gray-500 hover:text-gray-300">&times;</button>
                </div>`,e.classList.remove("hidden"),document.getElementById("dismiss-announcement-btn").addEventListener("click",()=>e.classList.add("hidden"))):e.classList.add("hidden")}catch(e){console.error("renderAnnouncement error:",e)}}function V(e){try{const t=document.getElementById("my-payment-status-container"),a=3,n=Math.max(c.currentWeek,c.manualMaxWeek),s=n>0?Math.ceil(n/a):1;c.paymentStatusPage>=s&&(c.paymentStatusPage=Math.max(0,s-1));let o='<h3 class="text-xl font-bold mb-4 text-white">Status Pembayaran Kas Saya</h3>';const i=c.paymentStatusPage*a+1,m=Math.min(i+a-1,n);let u="";if(n>0)for(let g=i;g<=m;g++){const r=te(e.nim,g),b=A(g),k=r>=b;u+=`<div class="flex-1 p-3 rounded-lg text-center min-w-[4rem] ${k?"bg-blue-500/10":"bg-gray-800/20"}">
                    <p class="text-sm text-gray-400">Minggu ${g}</p>
                    <p class="font-bold text-lg ${k?"text-blue-400":"text-gray-500"}">${k?"Lunas":"Belum"}</p>
                </div>`}else u='<p class="text-gray-500 text-center col-span-5">Belum ada data minggu.</p>';o+=`<div class="flex items-center gap-2">
            <button id="prev-week-page" class="pagination-btn p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
            <div class="flex-1 flex justify-center gap-3">${u}</div>
            <button id="next-week-page" class="pagination-btn p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
        </div>`,t&&(t.innerHTML=o);const l=document.getElementById("prev-week-page"),d=document.getElementById("next-week-page");l&&d&&(l.disabled=c.paymentStatusPage===0,d.disabled=c.paymentStatusPage>=s-1,l.addEventListener("click",()=>{c.paymentStatusPage>0&&(c.paymentStatusPage--,V(e))}),d.addEventListener("click",()=>{c.paymentStatusPage<s-1&&(c.paymentStatusPage++,V(e))}))}catch(t){console.error("renderMyPaymentStatus error:",t)}}function S(e){var t;try{const a=document.getElementById("kas-angkatan-table");if(!a)return;const n=document.getElementById("kas-filter-week").value,s=document.getElementById("kas-filter-class").value,o=document.getElementById("kas-filter-status").value,i=(((t=document.getElementById("kas-filter-name"))==null?void 0:t.value)||"").toLowerCase().trim();let m=c.allStudents;s!=="all"&&(m=m.filter(r=>s.length===1?r.theoryClass===s:r.practiceClass===s)),i&&(m=m.filter(r=>r.name.toLowerCase().includes(i)||r.nim.includes(i)));const u=parseInt(n),l=A(u),g=m.map(r=>{const b=te(r.nim,u);return{...r,totalPaid:b,status:b>=l?"Lunas":"Belum Lunas"}}).filter(r=>o==="all"||r.status===o);a.innerHTML=g.length===0?'<tr><td colspan="6" class="text-center p-6 text-gray-500">Tidak ada data untuk filter ini.</td></tr>':g.map(r=>{const b=ve(r,e),k=Math.min(r.totalPaid/l*100,100),f=r.totalPaid>=l,x=c.warnings&&c.warnings[r.nim]&&c.warnings[r.nim].active?c.warnings[r.nim]:null;let h='<span class="text-gray-600 text-sm">-</span>';b&&(f?h=`<button data-nim="${r.nim}" class="open-history-modal-btn btn-secondary py-2 px-4 rounded-lg text-sm font-semibold">Edit</button>`:h=`
                        <div class="flex gap-2 justify-center">
                            <button data-nim="${r.nim}" class="quick-pay-btn btn-primary py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1" title="Bayar Instan Rp ${l}">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                ${l/1e3}k
                            </button>
                            <button data-nim="${r.nim}" data-name="${y(r.name)}" class="open-kas-modal-btn btn-secondary py-2 px-3 rounded-lg text-xs font-semibold">Input</button>
                        </div>`);let L=`<a href="#" class="hover:text-blue-400 open-history-modal-btn transition-colors" data-nim="${r.nim}">${y(r.name)}</a>`;return x&&(L=`
                        <div class="flex items-center gap-2">
                            <a href="#" class="text-red-500 hover:text-red-400 open-history-modal-btn transition-colors drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" data-nim="${r.nim}">${y(r.name)}</a>
                            <div class="group relative flex items-center">
                                <span ${b?`data-nim="${r.nim}" title="Klik untuk cabut peringatan"`:""} class="${b?"remove-warning-btn cursor-pointer hover:bg-red-500 hover:text-white transition-colors":"cursor-help"} flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse">
                                    <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                </span>
                                <div class="absolute left-8 w-64 p-3 bg-red-950 text-red-200 text-xs rounded-lg shadow-2xl border border-red-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[9999] pointer-events-none break-words whitespace-normal">
                                    <p class="font-bold text-red-400 mb-1 text-sm border-b border-red-800/50 pb-1">⚠ Catatan Khusus Peringatan</p>
                                    <p class="mt-1 leading-relaxed">${y(x.message)}</p>
                                </div>
                            </div>
                        </div>
                    `),`
                    <tr class="border-b ${x?"border-red-900/40 bg-red-950/20":"border-gray-800"} hover:bg-gray-900/50 text-sm transition-colors relative">
                        <td class="p-2 md:p-4 hidden md:table-cell text-gray-400">${y(r.nim)}</td>
                        <td class="p-2 md:p-4 font-semibold text-white">${L}</td>
                        <td class="p-2 md:p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-800 text-gray-300">${y(r.practiceClass)}</span></td>
                        <td class="p-2 md:p-4"><div class="w-full"><span class="font-semibold ${f?"text-blue-400":"text-blue-600"}">${_(r.totalPaid)}</span><div class="w-full bg-gray-700 rounded-full h-1.5 mt-1"><div class="${f?"bg-blue-500":"bg-blue-800"} h-1.5 rounded-full transition-all duration-500" style="width: ${k}%"></div></div></div></td>
                        <td class="p-2 md:p-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${f?"bg-blue-500/10 text-blue-400":"bg-red-500/10 text-red-500"}">${r.status}</span></td>
                        <td class="p-2 md:p-4 text-center">${h}</td>
                    </tr>`}).join("")}catch(a){console.error("renderKasAngkatan error:",a)}}function We(e){try{const t=document.getElementById("expenses-table-body");if(!t)return;const a=[...c.kasExpenses].sort((o,i)=>i.timestamp.seconds-o.timestamp.seconds),n=e.role==="bendahara_angkatan"||e.role==="bendahara_teori";if(a.length===0){t.innerHTML='<tr><td colspan="6" class="text-center p-6 text-gray-500">Belum ada pengeluaran.</td></tr>';return}const s={teori_c:"Kas Teori C",teori_d:"Kas Teori D",angkatan:"Kas Angkatan (Dibagi Rata)"};t.innerHTML=a.map(o=>`
            <tr class="border-b border-gray-800">
                <td class="p-4">${J(o.timestamp)}</td>
                <td class="p-4 text-white">${y(o.description)}</td>
                <td class="p-4"><span class="px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">${s[o.category]||"Lainnya"}</span></td>
                <td class="p-4 text-blue-500 font-semibold">${_(o.amount)}</td>
                <td class="p-4 text-gray-400">${y(o.recordedByName)}</td>
                <td class="p-4 text-center">${n?`<button data-id="${o.id}" class="delete-expense-btn text-red-500 hover:text-red-400 text-xs font-semibold">&times; Hapus</button>`:""}</td>
            </tr>`).join("")}catch(t){console.error("renderExpenses error:",t)}}function qe(e,t,a){try{const n=document.getElementById("view-arsip"),s=new Date,o=s.getMonth(),i=s.getFullYear(),m=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((g,r)=>`<option value="${r}" ${r===o?"selected":""}>${g}</option>`).join(""),u=Array.from({length:5},(g,r)=>{const b=i-r;return`<option value="${b}">${b}</option>`}).join(""),l=e&&e.role==="bendahara_angkatan",d=l?`
            <div class="mt-8 border-t border-gray-800 pt-8">
                <h3 class="text-xl font-bold text-white mb-4">Input Saldo Pindahan Semester Lalu</h3>
                <form id="carry-over-form" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Saldo Teori C (Rp)</label>
                        <input type="number" name="teori_c" value="${c.carryOver.teori_c||0}" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Saldo Teori D (Rp)</label>
                        <input type="number" name="teori_d" value="${c.carryOver.teori_d||0}" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Saldo Angkatan (Rp)</label>
                        <input type="number" name="angkatan" value="${c.carryOver.angkatan||0}" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                    </div>
                    <button type="submit" class="w-full btn-secondary font-bold py-3 rounded-lg">Simpan Saldo Awal</button>
                </form>
            </div>
        `:"";n.innerHTML=`
            <h2 class="text-4xl font-bold text-white mb-6">Arsip Laporan Bulanan</h2>
            <div class="glass-card p-8 rounded-xl">
                <p class="text-gray-400 mb-6">Pilih bulan dan tahun untuk mengunduh laporan kas lengkap dalam format Excel.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label for="report-month" class="block text-sm font-medium text-gray-400 mb-1">Bulan</label>
                        <select id="report-month" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">${m}</select>
                    </div>
                    <div>
                        <label for="report-year" class="block text-sm font-medium text-gray-400 mb-1">Tahun</label>
                        <select id="report-year" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">${u}</select>
                    </div>
                    <button id="download-monthly-report-btn" class="w-full btn-primary font-bold py-3 rounded-lg">Unduh Laporan</button>
                </div>
                ${d}
            </div>`,document.getElementById("download-monthly-report-btn").addEventListener("click",()=>{const g=document.getElementById("report-month").value,r=document.getElementById("report-year").value;t(parseInt(g),parseInt(r))}),l&&a&&a.onSaveCarryOver&&document.getElementById("carry-over-form").addEventListener("submit",a.onSaveCarryOver)}catch(n){console.error("renderArchiveView error:",n)}}function re(e,{onAddStudent:t,onManageRoles:a,onAnnouncement:n,onResetWeek:s,onSendBilling:o,onAddWarning:i,onRemoveWarning:m}){var u;try{if(!e||e.role!=="bendahara_angkatan"){const f=document.getElementById("view-admin");f&&(f.innerHTML="");return}const l=document.getElementById("view-admin"),d=c.allStudents.map(f=>`
            <tr class="border-b border-gray-800">
                <td class="p-3">${y(f.nim)}</td>
                <td class="p-3 text-white">${y(f.name)}</td>
                <td class="p-3">${y(f.practiceClass)}</td>
                <td class="p-3">${y(f.email||"-")}</td>
                <td class="p-3 text-center"><button data-nim="${y(f.nim)}" class="delete-student-btn text-blue-600 hover:text-blue-400 text-sm font-semibold">&times; Hapus</button></td>
            </tr>`).join(""),g={bendahara_angkatan:"Ketua Kelas",bendahara_teori:"Bendahara Teori",bendahara_praktik:"Bendahara Praktik"};let r="";for(const f in c.roles){const x=j(f);if(x){const h=c.roles[f].includes("teori")?`(${x.theoryClass})`:c.roles[f].includes("praktik")?`(${x.practiceClass})`:"";r+=`<div class="flex justify-between items-center p-3 border-b border-gray-800">
                    <span><strong>${g[c.roles[f]]} ${h}</strong>: ${y(x.name)}</span>
                    <button data-nim="${y(f)}" class="remove-role-btn text-xs text-blue-600 hover:text-blue-400 font-semibold">&times; Hapus</button>
                </div>`}}let b="";for(const f in c.warnings){const x=c.warnings[f],h=j(f);h&&x.active&&(b+=`<div class="flex justify-between items-center p-3 border-b border-red-900/30">
                    <div class="flex-1">
                        <p class="font-bold text-red-500">${y(h.name)} <span class="text-gray-500 text-xs font-normal">(${h.practiceClass})</span></p>
                        <p class="text-xs text-red-400 mt-1 flex items-start gap-1">
                            <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            ${y(x.message)}
                        </p>
                    </div>
                    <button data-nim="${y(f)}" class="remove-warning-btn ml-4 text-xs text-gray-400 hover:text-white font-semibold flex-shrink-0 whitespace-nowrap">&times; Cabut</button>
                </div>`)}const k=[...new Set(c.allStudents.map(f=>f.practiceClass).filter(Boolean))].sort().map(f=>`<option value="${f}">Praktik ${f}</option>`).join("");l.innerHTML=`
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div class="flex justify-between items-center mb-4"><h2 class="text-3xl font-bold text-white">Manajemen Anggota</h2><button id="add-student-btn" class="btn-primary px-4 py-2 rounded-lg font-semibold text-sm">Tambah Anggota</button></div>
                    <div class="glass-card p-4 rounded-xl"><div class="overflow-y-auto max-h-96"><table class="w-full text-sm"><thead><tr class="border-b border-gray-800"><th class="p-3 text-left">NIM</th><th class="p-3 text-left">Nama</th><th class="p-3 text-left">Kelas</th><th class="p-3 text-left">Email Terdaftar</th><th class="p-3 text-center">Aksi</th></tr></thead><tbody>${d}</tbody></table></div></div>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-3xl font-bold text-white">Manajemen Bendahara</h2>
                        <div class="flex gap-2">
                            <button id="reset-week-btn" class="btn-secondary px-4 py-2 rounded-lg font-semibold text-sm border-red-500/50 text-red-500 hover:bg-red-500/10">Reset Minggu 1</button>
                            <button id="manage-roles-btn" class="btn-primary px-4 py-2 rounded-lg font-semibold text-sm">Tunjuk Bendahara</button>
                        </div>
                    </div>
                    <div class="glass-card p-4 rounded-xl mb-8">${r||'<p class="p-3 text-gray-500">Belum ada bendahara yang ditunjuk.</p>'}</div>
                    
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-3xl font-bold text-red-500 flex items-center gap-2">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            Peringatan Keras
                        </h2>
                        <button id="add-warning-btn" class="btn-primary border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all">Beri Peringatan</button>
                    </div>
                    <div class="glass-card p-4 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-950/10">
                        ${b||'<p class="p-3 text-gray-500">Belum ada peringatan keras yang diberikan.</p>'}
                    </div>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-3xl font-bold text-white mb-4">Manajemen Pengumuman</h2>
                <div class="glass-card p-6 rounded-xl">
                    <form id="announcement-form">
                        <label for="announcement-text" class="block text-sm font-medium text-gray-400 mb-1">Tulis Pengumuman Baru</label>
                        <textarea id="announcement-text" rows="3" class="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg" placeholder="Contoh: Batas akhir pembayaran untuk acara X adalah tanggal Y...">${c.announcement?y(c.announcement.message):""}</textarea>
                        <div class="flex justify-end mt-4"><button type="submit" class="px-6 py-2 btn-primary rounded-lg font-bold">Publikasikan</button></div>
                    </form>
                </div>
            </div>
            <div class="mt-8">
                <h2 class="text-3xl font-bold text-white mb-1">Kirim Tagihan Kumulatif</h2>
                <p class="text-gray-500 text-sm mb-4">Kirim satu email per anggota yang berisi total tunggakan pada minggu tertentu, difilter berdasarkan kelas.</p>
                <div class="glass-card p-6 rounded-xl">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-400 mb-1">Pilih Kelas Praktik</label>
                            <select id="billing-class-select" class="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
                                <option value="all">Semua Kelas</option>
                                ${k}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Dari Minggu</label>
                            <select id="billing-start-week" class="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
                                ${Array.from({length:c.currentWeek||1},(f,x)=>x+1).map(f=>`<option value="${f}">Minggu ke-${f}</option>`).join("")}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Sampai Minggu</label>
                            <select id="billing-end-week" class="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm">
                                ${Array.from({length:c.currentWeek||1},(f,x)=>x+1).map(f=>`<option value="${f}"${f===(c.currentWeek||1)?" selected":""}>Minggu ke-${f}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-4 items-center">
                        <button id="send-billing-btn" class="btn-primary px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-sm w-full md:w-auto justify-center">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            Kirim Tagihan Kumulatif
                        </button>
                    </div>
                    <p class="text-xs text-gray-600 mt-3">* Hanya anggota yang sesuai filter, memiliki email terdaftar, dan memiliki tunggakan yang akan menerima email.</p>
                    <div id="billing-progress" class="hidden mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300"></div>
                </div>
            </div>`,document.getElementById("add-student-btn").addEventListener("click",t),document.getElementById("manage-roles-btn").addEventListener("click",a),document.getElementById("reset-week-btn").addEventListener("click",s),document.getElementById("announcement-form").addEventListener("submit",n),document.getElementById("send-billing-btn").addEventListener("click",()=>{const f=document.getElementById("billing-class-select").value,x=parseInt(document.getElementById("billing-start-week").value),h=parseInt(document.getElementById("billing-end-week").value);o==null||o(f,x,h)}),(u=document.getElementById("add-warning-btn"))==null||u.addEventListener("click",i),document.querySelectorAll(".remove-warning-btn").forEach(f=>{f.addEventListener("click",m)})}catch(l){console.error("renderAdminView error:",l)}}function Z(){var o;const e=document.getElementById("rekap-pemasukan-container");if(!e)return;const t=parseInt((o=document.getElementById("kas-filter-week"))==null?void 0:o.value)||c.currentWeek,a=A(),n=["C","C1","C2","D","D1","D2"];let s=`<h3 class="text-xl font-bold mb-4 text-white">Rekap Pemasukan Kas (Minggu ${t})</h3><div class="space-y-4 text-gray-300">`;n.forEach(i=>{const m=i.length===1,u=c.allStudents.filter(d=>m?d.theoryClass===i:d.practiceClass===i);let l=0;u.forEach(d=>{te(d.nim,t)>=a&&l++}),s+=`
            <div>
                <div class="flex justify-between font-semibold"><p>Kelas ${m?"Teori":"Praktik"} ${i}</p><p>${l} / ${u.length}</p></div>
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-1"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${u.length>0?l/u.length*100:0}%"></div></div>
            </div>`}),s+="</div>",e.innerHTML=s}function Ge(e){const t=document.getElementById("kas-filter-class");if(!t)return;let a=t.value;const n=!a,s=[...new Set(c.allStudents.map(o=>o.practiceClass))].sort();t.innerHTML=`
        <option value="all">Semua Kelas</option>
        <option value="C">Teori C</option>
        <option value="D">Teori D</option>
        ${s.map(o=>`<option value="${o}">Praktik ${o}</option>`).join("")}
    `,n&&e&&e.practiceClass&&(a=e.practiceClass),Array.from(t.options).some(o=>o.value===a)&&(t.value=a)}function ie(){const e=document.getElementById("kas-filter-week");if(!e)return;const t=e.value,a=Math.max(c.currentWeek,c.manualMaxWeek);if(e.options.length===a&&parseInt(t)<=a)return;const n=Array.from({length:a},(s,o)=>`<option value="${o+1}">Minggu ke-${o+1}</option>`).join("");e.innerHTML!==n&&(e.innerHTML=n),t&&parseInt(t)<=a?e.value=t:e.value=c.currentWeek}ge.register(...je);let G=null;function le(){var u;const e=document.getElementById("tren-kas-container");if(!e)return;const t=Math.max(c.currentWeek,c.manualMaxWeek);if(t<1)return;const a=[],n=[];for(let l=1;l<=t;l++){const d=c.kasTransactions.filter(g=>g.week===l).reduce((g,r)=>g+r.amount,0);a.push(d),n.push(`Minggu ${l}`)}e.querySelector(".chart-container")||(e.innerHTML=`
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-white">📊 Tren Pemasukan Mingguan</h3>
            </div>
            <div class="chart-container" style="height: 220px; position: relative;">
                <canvas id="tren-chart"></canvas>
            </div>
            <div class="flex justify-between mt-3 text-xs text-gray-500">
                <span id="tren-total-label">Total: <span class="text-blue-400 font-bold">Rp 0</span></span>
                <span id="tren-week-label">0 minggu</span>
            </div>
        `);const s=document.getElementById("tren-total-label"),o=document.getElementById("tren-week-label");s&&(s.innerHTML=`Total seluruh minggu: <span class="text-blue-400 font-bold">${_(a.reduce((l,d)=>l+d,0))}</span>`),o&&(o.textContent=`${t} minggu`);const i=(u=document.getElementById("tren-chart"))==null?void 0:u.getContext("2d");if(!i)return;const m={labels:n,datasets:[{label:"Pemasukan (Rp)",data:a,backgroundColor:a.map((l,d)=>d===t-1?"rgba(59, 130, 246, 0.9)":"rgba(59, 130, 246, 0.35)"),borderColor:"rgba(59, 130, 246, 0.8)",borderWidth:1,borderRadius:4}]};G?(G.data=m,G.update()):G=new ge(i,{type:"bar",data:m,options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:l=>" "+_(l.parsed.y)},backgroundColor:"#111",titleColor:"#9ca3af",bodyColor:"#60A5FA",borderColor:"#333",borderWidth:1}},scales:{x:{grid:{color:"rgba(255,255,255,0.05)"},ticks:{color:"#6b7280",font:{size:10}}},y:{grid:{color:"rgba(255,255,255,0.05)"},ticks:{color:"#6b7280",font:{size:10},callback:l=>"Rp "+(l/1e3).toFixed(0)+"k"},beginAtZero:!0}}}})}const w=(e,t,a=3500)=>{const n=document.getElementById("toast-container");if(!n)return;const s=e==="success"?'<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>':'<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',o=document.createElement("div");o.className=`toast ${e}`,o.innerHTML=`${s}<span>${y(t)}</span>`,n.appendChild(o),setTimeout(()=>{o.classList.add("fade-out"),o.addEventListener("animationend",()=>o.remove(),{once:!0})},a)},E=(e,t,a)=>{const n=document.getElementById("alert-modal"),s="text-yellow-600",o="bg-yellow-600/10";n.innerHTML=`
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-sm text-center">
            <div class="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${o}">
                ${`<svg class="w-10 h-10 ${s}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`}
            </div>
            <h3 class="text-2xl font-bold mb-2 text-white">${y(t)}</h3>
            <p class="text-gray-300 mb-8">${y(a)}</p>
            <button id="alert-ok-btn" class="w-full px-6 py-3 btn-primary rounded-lg font-bold">OK</button>
        </div>`,n.classList.remove("hidden"),n.querySelector("#alert-ok-btn").addEventListener("click",()=>n.classList.add("hidden"))},O=(e,t)=>new Promise(a=>{const n=document.getElementById("alert-modal");n.innerHTML=`
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-sm text-center">
            <div class="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-yellow-600/10">
                <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-white">${y(e)}</h3>
            <p class="text-gray-300 mb-8">${y(t)}</p>
            <div class="flex justify-center gap-4">
                <button id="confirm-cancel-btn" class="w-full px-6 py-3 btn-secondary rounded-lg font-bold">Batal</button>
                <button id="confirm-ok-btn" class="w-full px-6 py-3 btn-primary rounded-lg font-bold">Yakin</button>
            </div>
        </div>`,n.classList.remove("hidden");const s=()=>n.classList.add("hidden");n.querySelector("#confirm-ok-btn").onclick=()=>{s(),a(!0)},n.querySelector("#confirm-cancel-btn").onclick=()=>{s(),a(!1)}});function ze(e){let t=!1,a=null;we().then(()=>{t=!0;const n=document.getElementById("loading-screen");n&&n.classList.add("hidden"),a&&a()}),De(ee,async n=>{const s=async()=>{const o=document.getElementById("login-screen"),i=document.getElementById("app"),m=document.getElementById("bottom-nav");n?(se(n),oe({uid:n.uid,displayName:n.displayName,email:n.email,photoURL:n.photoURL,nim:null,role:"mahasiswa",theoryClass:null,practiceClass:null}),o.classList.add("hidden"),i.classList.remove("hidden"),m&&m.classList.remove("hidden"),await Ve(),Je(e)):(se(null),oe(null),be.forEach(u=>u()),he([]),fe(!0),o.classList.remove("hidden"),i.classList.add("hidden"),m&&m.classList.add("hidden"))};t?await s():a=s})}function we(){return new Promise(e=>{const t=document.getElementById("loading-screen"),a=document.getElementById("intro-phase-1"),n=document.getElementById("intro-phase-2");if(!t||!a||!n){e();return}t.classList.remove("hidden"),t.style.opacity="1",t.style.transition="",a.classList.remove("hidden","fade-out"),n.classList.add("hidden"),n.classList.remove("flex","fade-in"),a.querySelectorAll(".intro-letter").forEach(o=>{o.style.animation="none",o.offsetWidth,o.style.animation=""});const s=a.querySelector(".intro-tagline-bar");s&&(s.style.animation="none",s.offsetWidth,s.style.animation=""),setTimeout(()=>{a.classList.add("fade-out"),setTimeout(()=>{a.classList.add("hidden"),n.classList.remove("hidden"),n.classList.add("flex","fade-in");const o=n.querySelector(".intro-logo"),i=n.querySelector(".intro-powered-text");[o,i].forEach(m=>{m&&(m.style.animation="none",m.offsetWidth,m.style.animation="")}),setTimeout(()=>{t.style.transition="opacity 0.5s ease",t.style.opacity="0",setTimeout(()=>{t.classList.add("hidden"),t.style.opacity="",e()},500)},1600)},600)},1800)})}async function Fe(){try{const e=document.getElementById("login-screen");e&&e.classList.add("hidden");const t=we();await Te(ee,Ne),await t}catch(e){const t=document.getElementById("login-screen"),a=document.getElementById("loading-screen");t&&t.classList.remove("hidden"),a&&a.classList.add("hidden"),console.error("Login error:",e),E("error","Login Gagal",e.message)}}async function Ee(){try{await Ae(ee)}catch(e){console.error("Logout error:",e),E("error","Logout Gagal",e.message)}}async function Ve(){try{(await F(M(v,"internal_config"))).empty&&(await T(I(v,"internal_config","weeks"),{manualMaxWeek:1}),await T(I(v,"internal_config","current_semester"),{startWeek:17}),console.log("Database initialized with default config."))}catch(e){console.error("initializeDatabaseIfNeeded error:",e)}}function Je(e){const t=$(M(v,"students"),l=>{var b,k,f;c.allStudents=l.docs.map(x=>({nim:x.id,...x.data()}));const d="muhammadilham.2025@student.uny.ac.id".toLowerCase(),g=((b=B==null?void 0:B.email)==null?void 0:b.toLowerCase())===d,r=c.allStudents.find(x=>x.email===(B==null?void 0:B.email));if(p&&(g?(p.role="bendahara_angkatan",p.nim=r?r.nim:"ADMIN",p.theoryClass=r?r.theoryClass:"C",p.practiceClass=r?r.practiceClass:"C1"):r?(p.nim=r.nim,p.theoryClass=r.theoryClass,p.practiceClass=r.practiceClass,p.role=c.roles[r.nim]||"mahasiswa"):p.nim=null),Ge(p),!p||!g&&!r){document.getElementById("app").classList.add("hidden");const x=document.getElementById("nim-registration-modal");x&&(x.innerHTML=`
                    <div class="glass-card p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                        <h3 class="text-2xl font-bold text-red-500 mb-4">Akses Ditolak</h3>
                        <p class="text-gray-300 mb-6">Email <strong>${B==null?void 0:B.email}</strong> tidak terdaftar di sistem Elka Finance.</p>
                        <p class="text-sm text-gray-400 mb-8">Silakan hubungi Ketua Kelas untuk mendaftarkan email Anda.</p>
                        <button id="logout-from-reg-btn" class="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg font-bold transition-all">Keluar</button>
                    </div>`,x.classList.remove("hidden"),(k=document.getElementById("logout-from-reg-btn"))==null||k.addEventListener("click",Ee));return}(f=document.getElementById("nim-registration-modal"))==null||f.classList.add("hidden"),document.getElementById("app").classList.remove("hidden"),X(p,e),q(),S(p),Z(),p.role==="bendahara_angkatan"&&re(p,e.adminCallbacks)}),a=$(M(v,"roles"),l=>{var r;c.roles={},l.docs.forEach(b=>c.roles[b.id]=b.data().role);const d="muhammadilham.2025@student.uny.ac.id".toLowerCase(),g=((r=B==null?void 0:B.email)==null?void 0:r.toLowerCase())===d;p&&p.nim&&(g?p.role="bendahara_angkatan":p.role=c.roles[p.nim]||"mahasiswa"),p&&(g||p.nim)&&(X(p,e),(p.role==="bendahara_angkatan"||p.role==="bendahara_teori")&&qe(p,e.onMonthlyExport,e.adminCallbacks),p.role==="bendahara_angkatan"&&re(p,e.adminCallbacks))}),n=$(K(M(v,"kas_transactions"),ae("timestamp","asc")),l=>{c.kasTransactions=l.docs.map(g=>({id:g.id,...g.data()})),Re();const d=c.kasTransactions.length>0?Math.max(...c.kasTransactions.map(g=>g.week)):1;c.currentWeek=d,ie(),p&&p.nim&&(q(),V(p),S(p),Z(),le()),Y||w("success","Data kas telah diperbarui.",2e3)}),s=$(K(M(v,"kas_expenses"),ae("timestamp","asc")),l=>{c.kasExpenses=l.docs.map(d=>({id:d.id,...d.data()})),p&&p.nim&&(q(),We(p)),Y||w("success","Data pengeluaran telah diperbarui.",2e3)}),o=$(I(v,"internal_config","weeks"),l=>{l.exists()&&(c.manualMaxWeek=l.data().manualMaxWeek||1,ie(),p&&p.nim&&(V(p),le()))}),i=$(M(v,"announcements"),l=>{if(l.empty)c.announcement=null;else{const d=l.docs[0].data();c.announcement={id:l.docs[0].id,...d}}Oe()}),m=$(I(v,"internal_config","carry_over"),l=>{l.exists()&&(c.carryOver=l.data(),p&&p.nim&&q())}),u=$(M(v,"warnings"),l=>{c.warnings={},l.docs.forEach(d=>{d.data().active&&(c.warnings[d.id]=d.data())}),p&&p.nim&&S(p)});he([t,a,n,s,o,i,m,u]),setTimeout(()=>{fe(!1)},1500)}async function Ue(e,t,a){e.preventDefault();const n=e.target.closest(".quick-pay-btn"),s=n.dataset.nim,o=parseInt(document.getElementById("kas-filter-week").value),i=A(),m=n.innerHTML;n.innerHTML='<div class="animate-spin rounded-full h-3 w-3 border-2 border-white"></div>',n.disabled=!0;try{await me(M(v,"kas_transactions"),{nim:s,week:o,amount:i,paymentMethod:"Cash",bankName:null,recordedBy:t.uid,recordedByName:a.displayName,timestamp:R()}),w("success","Pembayaran kas berhasil dicatat.")}catch(u){E("error","Gagal",`Gagal mencatat Quick Pay: ${u.message}`),n.innerHTML=m,n.disabled=!1}}async function Ye(e,t,a){e.preventDefault();const n=e.target.querySelector('button[type="submit"]');n.disabled=!0,n.textContent="Menyimpan...";const s=new FormData(e.target),o=s.get("nim");let i=parseInt(s.get("amount")),m=parseInt(s.get("week"));if(isNaN(i)||i<=0){E("error","Gagal","Jumlah setoran tidak valid."),n.disabled=!1,n.textContent="Simpan";return}const u=s.get("paymentMethod"),l=u==="Transfer"?s.get("bankName"):null,d=ue(v);try{for(;i>0;){const g=A(m),r=Math.min(i,g),b={nim:o,week:m,amount:r,paymentMethod:u,bankName:l,recordedBy:t.uid,recordedByName:a.displayName,timestamp:R()};d.set(I(M(v,"kas_transactions")),b),i-=r,m++}await d.commit(),document.getElementById("kas-input-modal").classList.add("hidden"),w("success","Setoran kas berhasil dicatat.")}catch(g){E("error","Gagal",`Gagal mencatat setoran: ${g.message}`),n.disabled=!1,n.textContent="Simpan"}}async function Qe(e){e.preventDefault();const t=e.target.querySelector('button[type="submit"]');t.disabled=!0,t.textContent="Menyimpan...";const a=new FormData(e.target),n=a.get("id"),s=parseInt(a.get("amount")),o=c.kasTransactions.find(m=>m.id===n),i=o?A(o.week):5e3;if(isNaN(s)||s<0||s>i){E("error","Gagal",`Jumlah tidak valid (0 - Rp ${i.toLocaleString("id-ID")}).`),t.disabled=!1,t.textContent="Simpan Perubahan";return}try{s===0?(await H(I(v,"kas_transactions",n)),w("success","Transaksi telah dihapus (nominal 0).")):(await Pe(I(v,"kas_transactions",n),{amount:s}),w("success","Setoran kas telah diperbarui.")),document.getElementById("kas-edit-modal").classList.add("hidden"),document.getElementById("transaction-history-modal").classList.add("hidden")}catch{E("error","Gagal","Gagal memproses transaksi."),t.disabled=!1,t.textContent="Simpan Perubahan"}}async function Xe(){try{const{doc:e,setDoc:t}=await N(async()=>{const{doc:n,setDoc:s}=await import("./firebase-CPwTeqWU.js").then(o=>o.p);return{doc:n,setDoc:s}},[]),a=c.manualMaxWeek+1;await t(e(v,"internal_config","weeks"),{manualMaxWeek:a}),w("success",`Minggu ke-${a} telah ditambahkan.`)}catch{E("error","Gagal","Gagal menambahkan minggu baru.")}}async function Ze(){const e=c.manualMaxWeek-1;if(e<c.currentWeek){E("error","Gagal",`Tidak dapat mengurangi minggu menjadi lebih kecil dari minggu saat ini (Minggu ke-${c.currentWeek}).`);return}if(e<1){E("error","Gagal","Tidak dapat mengurangi minggu di bawah 1.");return}try{const{doc:t,setDoc:a}=await N(async()=>{const{doc:s,setDoc:o}=await import("./firebase-CPwTeqWU.js").then(i=>i.p);return{doc:s,setDoc:o}},[]);await a(t(v,"internal_config","weeks"),{manualMaxWeek:e}),w("success",`Minggu pembayaran dikurangi menjadi ${e} minggu.`);const n=document.getElementById("kas-filter-week");parseInt(n.value)>e&&(n.value=e)}catch{E("error","Gagal","Gagal mengurangi minggu.")}}async function et(e,t,a){e.preventDefault();const n=e.target.querySelector('button[type="submit"]');n.disabled=!0,n.textContent="Menyimpan...";const s=new FormData(e.target),o=parseInt(s.get("amount")),i=s.get("category");let m=c.carryOver.teori_c||0,u=c.carryOver.teori_d||0;const l=c.carryOver.angkatan||0;c.kasTransactions.forEach(h=>{const L=j(h.nim);L&&(L.theoryClass==="C"?m+=h.amount:L.theoryClass==="D"&&(u+=h.amount))});const d=c.kasExpenses.filter(h=>h.category==="teori_c").reduce((h,L)=>h+L.amount,0),g=c.kasExpenses.filter(h=>h.category==="teori_d").reduce((h,L)=>h+L.amount,0),r=c.kasExpenses.filter(h=>h.category==="angkatan").reduce((h,L)=>h+L.amount,0),b=m-d-r/2,k=u-g-r/2,f=b+k+l;let x=0;if(i==="teori_c"?x=b:i==="teori_d"?x=k:i==="angkatan"&&(x=f),o>x){const{formatCurrency:h}=await N(async()=>{const{formatCurrency:L}=await Promise.resolve().then(()=>ye);return{formatCurrency:L}},void 0);E("error","Gagal",`Saldo tidak mencukupi. Saldo tersisa: ${h(x)}`),n.disabled=!1,n.textContent="Simpan";return}try{await me(M(v,"kas_expenses"),{description:s.get("description"),amount:o,category:i,recordedBy:t.uid,recordedByName:a.displayName,timestamp:R()}),document.getElementById("kas-expense-modal").classList.add("hidden"),w("success","Data pengeluaran berhasil disimpan.")}catch{E("error","Gagal","Gagal menyimpan data pengeluaran."),n.disabled=!1,n.textContent="Simpan"}}async function tt(e){const a=e.target.closest(".delete-expense-btn").dataset.id;if(await O("Konfirmasi Hapus","Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat diurungkan."))try{await H(I(v,"kas_expenses",a)),w("success","Data pengeluaran telah dihapus.")}catch{E("error","Gagal","Gagal menghapus data pengeluaran.")}}async function at(e){e.preventDefault();const t=e.target.querySelector('button[type="submit"]');t.disabled=!0,t.textContent="Menyimpan...";const a=new FormData(e.target),n=a.get("nim"),s=a.get("practiceClass").toUpperCase(),o={nim:n,name:a.get("name"),practiceClass:s,theoryClass:s.charAt(0),email:a.get("email")};try{await T(I(v,"students",n),o),document.getElementById("add-student-modal").classList.add("hidden"),w("success","Anggota baru berhasil ditambahkan.")}catch(i){E("error","Gagal",`Gagal menambahkan anggota: ${i.message}`),t.disabled=!1,t.textContent="Tambah"}}async function nt(e){const a=e.target.closest(".delete-student-btn").dataset.nim;if(await O("Konfirmasi Hapus",`Anda yakin ingin menghapus anggota dengan NIM ${a}? Tindakan ini tidak dapat diurungkan.`))try{await H(I(v,"students",a)),w("success",`Anggota dengan NIM ${a} telah dihapus.`)}catch{E("error","Gagal","Gagal menghapus anggota.")}}async function st(e){e.preventDefault();const t=new FormData(e.target),a=t.get("nim"),n=t.get("role");try{await T(I(v,"roles",a),{role:n}),document.getElementById("manage-roles-modal").classList.add("hidden"),w("success","Jabatan bendahara telah diatur.")}catch(s){console.error("handleSetRole error:",s),E("error","Gagal","Gagal mengatur jabatan.")}}async function ot(e){const a=e.target.closest(".remove-role-btn").dataset.nim;if(await O("Konfirmasi Hapus",`Anda yakin ingin menghapus jabatan dari anggota dengan NIM ${a}?`))try{await H(I(v,"roles",a)),w("success","Jabatan telah dihapus.")}catch(s){console.error("handleRemoveRole error:",s),E("error","Gagal","Gagal menghapus jabatan.")}}async function rt(e,t){e.preventDefault();const a=document.getElementById("announcement-text").value;if(a)try{const n=await F(K(M(v,"announcements"))),s=ue(v);n.forEach(o=>s.delete(o.ref)),s.set(I(M(v,"announcements")),{message:a,authorName:t.displayName,createdAt:R()}),await s.commit(),w("success","Pengumuman telah dipublikasikan.")}catch(n){console.error("handlePublishAnnouncement error:",n),E("error","Gagal","Gagal mempublikasikan pengumuman.")}}async function it(){if(await O("Konfirmasi Reset","Apakah Anda yakin ingin mereset minggu pembayaran kembali ke Minggu 1? Filter minggu di dashboard akan kembali ke awal."))try{await T(I(v,"internal_config","weeks"),{manualMaxWeek:1}),w("success","Minggu pembayaran telah direset ke Minggu 1.")}catch(t){console.error("handleResetWeek error:",t),E("error","Gagal","Gagal mereset minggu.")}}async function lt(e){e.preventDefault();const t=e.target.querySelector('button[type="submit"]');t&&(t.disabled=!0,t.textContent="Menyimpan...");const a=new FormData(e.target),n={teori_c:parseInt(a.get("teori_c"))||0,teori_d:parseInt(a.get("teori_d"))||0,angkatan:parseInt(a.get("angkatan"))||0};try{await T(I(v,"internal_config","carry_over"),n),w("success","Saldo semester lalu telah diperbarui.")}catch(s){console.error("handleSaveCarryOver error:",s),E("error","Gagal","Gagal menyimpan saldo semester lalu.")}finally{t&&(t.disabled=!1,t.textContent="Simpan Saldo Awal")}}async function dt(e){var s;e.preventDefault();const t=new FormData(e.target),a=t.get("nim"),n=t.get("message");try{await T(I(v,"warnings",a),{active:!0,message:n,timestamp:R()}),(s=document.getElementById("manage-warnings-modal"))==null||s.classList.add("hidden"),w("success","Peringatan keras telah disematkan.")}catch(o){console.error("handleSetWarning error:",o),E("error","Gagal","Gagal memberikan peringatan.")}}async function Le(e){const t=e.target.closest(".remove-warning-btn");if(!t)return;const a=t.dataset.nim;if(await O("Konfirmasi Hapus",`Anda yakin ingin mencabut peringatan dari anggota dengan NIM ${a}?`))try{await H(I(v,"warnings",a)),w("success","Peringatan keras telah dicabut.")}catch(s){console.error("handleRemoveWarning error:",s),E("error","Gagal","Gagal mencabut peringatan.")}}Be();function de(e){const t=document.getElementById("kas-filter-week").value,a=document.getElementById("kas-filter-class").value,n=document.getElementById("kas-filter-status").value;let s=c.allStudents;a!=="all"&&(s=s.filter(d=>a.length===1?d.theoryClass===a:d.practiceClass===a));const o=A(),i=s.map(d=>{const g=c.kasTransactions.filter(r=>r.nim===d.nim&&r.week===parseInt(t)).reduce((r,b)=>r+b.amount,0);return{...d,totalPaid:g,status:g>=o?"Lunas":"Belum Lunas"}}).filter(d=>n==="all"||d.status===n),m=["NIM","Nama","Kelas","Total Setoran","Status"],u=i.map(d=>[d.nim,d.name,d.practiceClass,_(d.totalPaid),d.status]),l=`Laporan_Kas_Minggu_${t}_${new Date().toLocaleDateString("id-ID")}`;if(e==="pdf"){const d=new Me;d.text(`Laporan Kas Angkatan - Minggu ke-${t}`,14,16),d.autoTable({head:[m],body:u,startY:20}),d.save(`${l}.pdf`)}else if(e==="excel"){const d=C.aoa_to_sheet([m,...u]),g=C.book_new();C.book_append_sheet(g,d,`Minggu ${t}`),ce(g,`${l}.xlsx`)}}async function ct(){const e=document.getElementById("download-monthly-report-btn");e.disabled=!0,e.textContent="Memproses...";try{const t=parseInt(document.getElementById("report-month").value),a=parseInt(document.getElementById("report-year").value),n=new Date(a,t,1),s=new Date(a,t+1,1),o=ne.fromDate(n),i=ne.fromDate(s),m=K(M(v,"kas_transactions"),W("timestamp",">=",o),W("timestamp","<",i)),u=K(M(v,"kas_expenses"),W("timestamp",">=",o),W("timestamp","<",i)),[l,d]=await Promise.all([F(m),F(u)]),g=C.book_new(),{formatDateTime:r}=await N(async()=>{const{formatDateTime:x}=await Promise.resolve().then(()=>ye);return{formatDateTime:x}},void 0),b=l.docs.map(x=>{var L;const h=x.data();return[x.id,h.nim,((L=j(h.nim))==null?void 0:L.name)||"?",h.week,h.amount,h.paymentMethod,h.bankName||"-",h.recordedByName,r(h.timestamp)]});C.book_append_sheet(g,C.aoa_to_sheet([["ID Transaksi","NIM","Nama","Minggu ke-","Jumlah","Metode","Bank","Dicatat Oleh","Tanggal"],...b]),"Pemasukan");const k=d.docs.map(x=>{const h=x.data();return[x.id,h.description,h.category,h.amount,h.recordedByName,r(h.timestamp)]});C.book_append_sheet(g,C.aoa_to_sheet([["ID Transaksi","Deskripsi","Kategori","Jumlah","Dicatat Oleh","Tanggal"],...k]),"Pengeluaran");const f=document.getElementById("report-month").options[t].text;ce(g,`Laporan_Kas_${f}_${a}.xlsx`),w("success","Laporan bulanan telah diunduh.")}catch(t){console.error("handleMonthlyReportExport error:",t),E("error","Gagal","Gagal mengunduh laporan bulanan.")}finally{e.disabled=!1,e.textContent="Unduh Laporan"}}function mt(e,t){const a=e.target.closest(".open-kas-modal-btn"),n=a.dataset.nim,s=a.dataset.name,o=document.getElementById("kas-filter-week").value,i=document.getElementById("kas-input-modal");i.innerHTML=`
      <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
        <h3 class="text-2xl font-bold text-white mb-2">Input Setoran Kas</h3>
        <p class="text-gray-400 mb-6">Untuk: <strong>${y(s)}</strong> (Mulai dari Minggu ke-${y(o)})</p>
        <form id="kas-form">
            <input type="hidden" name="nim" value="${y(n)}">
            <input type="hidden" name="week" value="${y(o)}">
            <div class="space-y-4">
                <div>
                    <label for="amount" class="block text-sm font-medium text-gray-400 mb-1">Jumlah Setoran (Rp)</label>
                    <input type="number" id="amount" name="amount" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" required step="1000" max="5000000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Metode Pembayaran</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 p-3 bg-gray-900 border border-gray-700 rounded-lg flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
                            <input type="radio" name="paymentMethod" value="Cash" class="accent-blue-500" checked> Tunai
                        </label>
                        <label class="flex items-center gap-2 p-3 bg-gray-900 border border-gray-700 rounded-lg flex-1 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
                            <input type="radio" name="paymentMethod" value="Transfer" class="accent-blue-500"> Transfer
                        </label>
                    </div>
                </div>
                <div id="bank-name-container" class="hidden">
                    <label for="bankName" class="block text-sm font-medium text-gray-400 mb-1">Nama Bank Pengirim</label>
                    <input type="text" id="bankName" name="bankName" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" placeholder="Contoh: BCA, BNI, Dana">
                </div>
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
                <button type="button" class="close-modal-btn text-gray-400 hover:text-white font-semibold">Batal</button>
                <button type="submit" class="px-6 py-3 btn-primary rounded-lg font-bold">Simpan</button>
            </div>
        </form>
      </div>`,i.classList.remove("hidden"),i.querySelector(".close-modal-btn").addEventListener("click",()=>i.classList.add("hidden"));const m=document.getElementById("kas-form");m.addEventListener("submit",t),m.querySelectorAll('input[name="paymentMethod"]').forEach(u=>{u.addEventListener("change",l=>{document.getElementById("bank-name-container").classList.toggle("hidden",l.target.value!=="Transfer")})})}function ut(e,t){const a=c.kasTransactions.find(s=>s.id===e);if(!a)return;const n=document.getElementById("kas-edit-modal");n.innerHTML=`
      <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
        <h3 class="text-2xl font-bold text-white mb-2">Edit Setoran Kas</h3>
        <p class="text-gray-400 mb-6">Minggu ke-${y(String(a.week))}</p>
        <form id="kas-edit-form">
            <input type="hidden" name="id" value="${y(a.id)}">
            <div class="space-y-4">
                <div>
                    <label for="edit-amount" class="block text-sm font-medium text-gray-400 mb-1">Jumlah Setoran (Rp)</label>
                    <input type="number" id="edit-amount" name="amount" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" value="${a.amount}" required step="1000">
                </div>
            </div>
            <div class="flex items-center justify-end gap-4 mt-8">
                <button type="button" class="close-modal-btn text-gray-400 hover:text-white font-semibold">Batal</button>
                <button type="submit" class="px-6 py-3 btn-primary rounded-lg font-bold">Simpan Perubahan</button>
            </div>
        </form>
      </div>`,n.classList.remove("hidden"),n.querySelector(".close-modal-btn").addEventListener("click",()=>n.classList.add("hidden")),document.getElementById("kas-edit-form").addEventListener("submit",t)}function gt(e,t,a){e.preventDefault();const s=e.target.closest(".open-history-modal-btn").dataset.nim,o=c.allStudents.find(l=>l.nim===s);if(!o)return;const i=document.getElementById("transaction-history-modal"),m=c.kasTransactions.filter(l=>l.nim===s).sort((l,d)=>d.week-l.week||d.timestamp.seconds-l.timestamp.seconds),u=t.role&&t.role!=="mahasiswa";i.innerHTML=`
     <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-lg">
       <h3 class="text-2xl font-bold text-white mb-2">Riwayat Transaksi</h3>
       <p class="text-gray-400 mb-6">Untuk: <strong>${y(o.name)}</strong></p>
       <div class="max-h-96 overflow-y-auto no-scrollbar">
           ${m.length===0?'<p class="text-gray-500 text-center py-4">Tidak ada riwayat.</p>':m.map(l=>{const d=l.paymentMethod==="Transfer"?`via ${y(l.bankName||"Transfer")}`:"via Tunai";return`
                   <div class="p-3 border-b border-gray-800 flex justify-between items-start">
                       <div>
                           <p class="font-bold text-white">${_(l.amount)} - Minggu ke-${l.week}</p>
                           <p class="text-sm text-gray-400">Dicatat oleh ${y(l.recordedByName)} (${d})</p>
                           <p class="text-xs text-gray-500">${J(l.timestamp)}</p>
                       </div>
                       ${u?`<button data-id="${y(l.id)}" class="open-edit-modal-btn btn-secondary py-1 px-3 rounded-lg text-xs font-semibold">Edit</button>`:""}
                   </div>`}).join("")}
       </div>
       <div class="text-right mt-6">
           <button class="close-modal-btn px-6 py-2 btn-primary rounded-lg font-bold">Tutup</button>
       </div>
     </div>`,i.classList.remove("hidden"),i.querySelector(".close-modal-btn").addEventListener("click",()=>i.classList.add("hidden")),i.querySelectorAll(".open-edit-modal-btn").forEach(l=>{l.addEventListener("click",d=>{i.classList.add("hidden"),a(d.target.closest(".open-edit-modal-btn").dataset.id)})})}function pt(e){const t=document.getElementById("kas-expense-modal");t.innerHTML=`
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-white mb-6">Buat Pengeluaran</h3>
            <form id="expense-form" class="space-y-4">
                <div>
                    <label for="expense-desc" class="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
                    <input type="text" id="expense-desc" name="description" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" required>
                </div>
                <div>
                    <label for="expense-amount" class="block text-sm font-medium text-gray-400 mb-1">Jumlah (Rp)</label>
                    <input type="number" id="expense-amount" name="amount" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white" required>
                </div>
                <div>
                    <label for="expense-category" class="block text-sm font-medium text-gray-400 mb-1">Sumber Dana</label>
                    <select id="expense-category" name="category" class="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg text-white">
                        <option value="teori_c">Kas Teori C</option>
                        <option value="teori_d">Kas Teori D</option>
                        <option value="angkatan">Kas Angkatan (Dibagi Rata)</option>
                    </select>
                </div>
                <div class="flex items-center justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn text-gray-400 hover:text-white font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-3 btn-primary rounded-lg font-bold">Simpan</button>
                </div>
            </form>
        </div>`,t.classList.remove("hidden"),t.querySelector(".close-modal-btn").addEventListener("click",()=>t.classList.add("hidden")),document.getElementById("expense-form").addEventListener("submit",e)}function bt(e){const t=document.getElementById("add-student-modal");t.innerHTML=`
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-white mb-6">Tambah Anggota Baru</h3>
            <form id="add-student-form" class="space-y-4">
                <div><label class="block text-sm text-gray-400 mb-1">NIM</label><input type="text" name="nim" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required></div>
                <div><label class="block text-sm text-gray-400 mb-1">Nama Lengkap</label><input type="text" name="name" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required></div>
                <div><label class="block text-sm text-gray-400 mb-1">Email</label><input type="email" name="email" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required></div>
                <div><label class="block text-sm text-gray-400 mb-1">Kelas Praktik (C1, C2, D1, D2)</label><input type="text" name="practiceClass" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white" required pattern="[CDcd][12]"></div>
                <div class="flex justify-end gap-4 pt-2">
                    <button type="button" class="close-modal-btn text-gray-400 font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-2 btn-primary font-bold rounded-lg">Tambah</button>
                </div>
            </form>
        </div>`,t.classList.remove("hidden"),t.querySelector(".close-modal-btn").addEventListener("click",()=>t.classList.add("hidden")),document.getElementById("add-student-form").addEventListener("submit",e)}function ft(e){const t=document.getElementById("manage-roles-modal"),a=c.allStudents.map(n=>`<option value="${y(n.nim)}">${y(n.name)} (${y(n.nim)})</option>`).join("");t.innerHTML=`
        <div class="glass-card p-8 rounded-2xl shadow-2xl shadow-black/30 w-full max-w-md">
            <h3 class="text-2xl font-bold text-white mb-6">Tunjuk Bendahara</h3>
            <form id="set-role-form" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Pilih Anggota</label>
                    <select name="nim" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white">${a}</select>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Pilih Jabatan</label>
                    <select name="role" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white">
                        <option value="bendahara_teori">Bendahara Teori</option>
                        <option value="bendahara_praktik">Bendahara Praktik</option>
                    </select>
                </div>
                <div class="flex justify-end gap-4 pt-2">
                    <button type="button" class="close-modal-btn text-gray-400 font-semibold">Batal</button>
                    <button type="submit" class="px-6 py-2 btn-primary font-bold rounded-lg">Simpan</button>
                </div>
            </form>
        </div>`,t.classList.remove("hidden"),t.querySelector(".close-modal-btn").addEventListener("click",()=>t.classList.add("hidden")),document.getElementById("set-role-form").addEventListener("submit",e)}function ht(e){const t=document.getElementById("manage-warnings-modal"),a=c.allStudents.map(n=>`<option value="${y(n.nim)}">${y(n.name)} (${y(n.nim)})</option>`).join("");t.innerHTML=`
        <div class="glass-card p-8 rounded-2xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-gray-900 w-full max-w-md">
            <div class="flex items-center gap-3 mb-6">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <h3 class="text-2xl font-bold text-red-500">Peringatan Keras</h3>
            </div>
            <p class="text-gray-400 text-sm mb-6">Label merah dan catatan akan tertampil secara publik di sebelah nama anggota pada tabel kas.</p>
            <form id="set-warning-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Pilih Anggota</label>
                    <select name="nim" class="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white">${a}</select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Catatan Peringatan</label>
                    <textarea name="message" rows="3" class="w-full p-3 bg-gray-900 border border-red-500/50 focus:border-red-500 rounded-lg text-white" required placeholder="Contoh: Belum bayar kas 15 minggu, harap segera lapor."></textarea>
                </div>
                <div class="flex justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn text-gray-400 font-semibold hover:text-white transition-colors">Batal</button>
                    <button type="submit" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Sematan</button>
                </div>
            </form>
        </div>`,t.classList.remove("hidden"),t.querySelector(".close-modal-btn").addEventListener("click",()=>t.classList.add("hidden")),document.getElementById("set-warning-form").addEventListener("submit",e)}const yt="service_0ufbpxe",xt="template_vuesfjp",vt="pfdKjO-Bh1WkTR7sA";let z=null;function Ie(){return z||(z=new Promise((e,t)=>{if(window.emailjs){e();return}const a=document.createElement("script");a.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js",a.onload=()=>{window.emailjs.init({publicKey:vt}),e()},a.onerror=()=>t(new Error("Gagal memuat EmailJS SDK")),document.head.appendChild(a)}),z)}async function kt(e,t,a){await Ie();const n=(t.length*a).toLocaleString("id-ID");return window.emailjs.send(yt,xt,{student_name:e.name,email:e.email,unpaid_weeks:t.join(", "),week_count:t.length,total_debt:n})}async function wt(e,t,a,n,s,o){await Ie();const i=new Set(t.filter(r=>r.amount>0).map(r=>`${r.nim}-${r.week}`)),m=e.map(r=>{const b=Array.from({length:n-a+1},(k,f)=>a+f).filter(k=>!i.has(`${r.nim}-${k}`));return{student:r,unpaidWeeks:b}}).filter(({student:r,unpaidWeeks:b})=>b.length>0&&r.email),u=e.filter(r=>Array.from({length:n-a+1},(b,k)=>a+k).some(b=>!i.has(`${r.nim}-${b}`))&&!r.email).length,l=m.length;let d=0,g=0;for(const{student:r,unpaidWeeks:b}of m){try{await kt(r,b,s),d++}catch{g++}o==null||o(d+g,l,r.name),await new Promise(k=>setTimeout(k,300))}return{sent:d,skipped:u,failed:g}}const Et={onExportExcel:()=>de("excel"),onExportPdf:()=>de("pdf"),onAddWeek:Xe,onRemoveWeek:Ze,onMonthlyExport:ct,adminCallbacks:{onAddStudent:()=>bt(e=>at(e)),onManageRoles:()=>ft(e=>st(e)),onAnnouncement:e=>rt(e,p),onResetWeek:it,onSaveCarryOver:lt,onAddWarning:()=>ht(e=>dt(e)),onRemoveWarning:Le,onSendBilling:async(e,t,a)=>{if(t>a){w("error","Minggu Awal tidak boleh lebih besar dari Minggu Akhir.");return}let n=c.allStudents;e!=="all"&&(n=c.allStudents.filter(d=>d.practiceClass===e));const s=new Set(c.kasTransactions.filter(d=>d.amount>0).map(d=>`${d.nim}-${d.week}`)),o=n.filter(d=>d.email&&Array.from({length:a-t+1},(g,r)=>t+r).some(g=>!s.has(`${d.nim}-${g}`))).length,i=n.filter(d=>!d.email&&Array.from({length:a-t+1},(g,r)=>t+r).some(g=>!s.has(`${d.nim}-${g}`))).length;if(o===0){w("info",`Semua anggota ${e!=="all"?"kelas ini ":""}telah lunas untuk rentang minggu tersebut! 🎉`);return}if(!confirm(`Akan mengirim tagihan kumulatif ke ${o} anggota yang masih memiliki tunggakan (Minggu ${t}–${a}).
`+(i>0?`(${i} anggota tanpa email akan dilewati)
`:"")+`
Setiap orang menerima 1 email berisi daftar tunggakan. Lanjutkan?`))return;const u=document.getElementById("send-billing-btn"),l=document.getElementById("billing-progress");u&&(u.disabled=!0,u.textContent="Mengirim..."),l&&(l.classList.remove("hidden"),l.textContent="Mempersiapkan...");try{const d=await wt(n,c.kasTransactions,t,a,2e3,(g,r,b)=>{l&&(l.textContent=`Mengirim... ${g}/${r} — ${b}`)});l&&l.classList.add("hidden"),w("success",`✅ ${d.sent} email kumulatif terkirim${d.failed>0?`, ${d.failed} gagal`:""}${d.skipped>0?`, ${d.skipped} tanpa email`:""}.`)}catch(d){l&&l.classList.add("hidden"),w("error","Gagal mengirim email. Cek koneksi atau konfigurasi EmailJS."),console.error(d)}finally{u&&(u.disabled=!1,u.innerHTML='<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>Kirim Tagihan Kumulatif')}}}};document.addEventListener("DOMContentLoaded",()=>{var e,t,a,n,s,o;(e=document.getElementById("google-login-btn"))==null||e.addEventListener("click",Fe),(t=document.getElementById("logout-btn"))==null||t.addEventListener("click",Ee),ze(Et),(a=document.getElementById("kas-filter-class"))==null||a.addEventListener("change",()=>S(p)),(n=document.getElementById("kas-filter-status"))==null||n.addEventListener("change",()=>S(p)),(s=document.getElementById("kas-filter-name"))==null||s.addEventListener("input",()=>S(p)),(o=document.getElementById("kas-filter-week"))==null||o.addEventListener("change",()=>{S(p),Z()}),document.body.addEventListener("click",i=>{i.target.closest(".open-kas-modal-btn")&&mt(i,m=>Ye(m,B,p)),i.target.closest(".open-history-modal-btn")&&gt(i,p,m=>{ut(m,Qe)}),i.target.closest(".quick-pay-btn")&&Ue(i,B,p),i.target.closest("#add-expense-btn")&&pt(m=>et(m,B,p)),i.target.closest(".delete-expense-btn")&&tt(i),i.target.closest(".delete-student-btn")&&nt(i),i.target.closest(".remove-role-btn")&&ot(i),i.target.closest(".remove-warning-btn")&&Le(i)}),setInterval(()=>{N(async()=>{const{updateTime:i}=await Promise.resolve().then(()=>He);return{updateTime:i}},void 0).then(({updateTime:i})=>i())},1e3)});
