"use strict";
(()=>{
const BASE="https://hefwxmhdgkeqtyyfpwub.supabase.co";
const KEY="sb_publishable_VJjXv7HOU5zyT4SAQWvl7w_iFU0h5cx";
const fallback=[
["Sterling & Jasmine",["Sterling","Jasmine"],["Harlow","Atlas"],"confirmed"],
["Tyler & Kayla",["Tyler","Kayla"],["Hunter"],"confirmed"],
["Sophia & Parker",["Sophia","Parker"],[],"confirmed"],
["Adi & Dolav",["Adi","Dolav"],[],"confirmed"],
["Shauna & Paul",["Shauna","Paul"],[],"confirmed"],
["Brad",["Brad"],[],"confirmed"],
["Michelle",["Michelle"],[],"confirmed"],
["Sahar's group",["Sahar","Jasmine","Shay","Hilay"],[],"confirmed"],
["Navid & Sarah",["Navid","Sarah"],[],"confirmed"],
["Naser & Sarah",["Naser","Sarah"],[],"confirmed"],
["Rece & wife",["Rece","Wife"],[],"maybe"],
["Shaun & Vanessa",["Shaun","Vanessa"],[],"maybe"],
["Zoe",["Zoe"],[],"declined"],
["Nawa",["Nawa"],[],"declined"]
].map((p,i)=>({id:null,label:p[0],names:p[1],kids:p[2],status:p[3]||"invited",sort_order:i}));
let groups=fallback, token=null, refresh=null;
const el=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const api=async(path,method="GET",body,auth=token)=>{
 const res=await fetch(BASE+"/rest/v1/"+path,{method,headers:{apikey:KEY,Authorization:"Bearer "+(auth||KEY),"Content-Type":"application/json",Prefer:"return=representation"},body:body===undefined?undefined:JSON.stringify(body)});
 if(!res.ok)throw Error("Request failed ("+res.status+")");
 return res.status===204?[]:res.json();
};
const panel=document.createElement("section");panel.className="compose";panel.id="guestAdminPanel";
panel.innerHTML='<h2 class="label">Guest list management</h2><p id="guestAdminMessage" class="field-help">Guests can view this list. Anyone can edit this list. No login required.</p><div id="guestAdminTools"><div class="row"><button type="button" class="text-button" id="guestNew">Add guest or group</button></div><form id="guestEditForm" hidden><input type="hidden" id="guestId"><div class="grid"><div class="field wide"><label for="guestLabel">Group name / display heading</label><input id="guestLabel" type="text" maxlength="100" required placeholder="e.g. Sterling & Jasmine"></div><div class="field wide"><label for="guestNames">Adults / guests (one per line)</label><textarea id="guestNames" rows="3"></textarea></div><div class="field wide"><label for="guestKids">Children (one per line, optional)</label><textarea id="guestKids" rows="2"></textarea></div><div class="field"><label for="guestStatus">RSVP status</label><select id="guestStatus"><option value="invited">Invited</option><option value="confirmed">Confirmed</option><option value="maybe">Maybe</option><option value="declined">Declined</option></select></div></div><div class="row"><button type="submit" class="primary">Save changes</button><button type="button" class="text-button" id="guestCancel">Cancel</button><button type="button" class="text-button" id="guestDelete" hidden>Delete group</button></div></form></div>';
el("gsList").after(panel);
const msg=s=>el("guestAdminMessage").textContent=s;
function render(){
 const count=groups.reduce((n,g)=>n+(g.names?.length||0)+(g.kids?.length||0),0);
 el("gsList").innerHTML='<p class="count">'+count+' invited guests · plus Onay & Jordan hosting</p>'+groups.map(g=>{const people=(g.names||[]).join(" & ");const isSingle=(g.names||[]).length===1;const title=isSingle?people:(g.label||people);const showPeople=!isSingle&&people&&people.trim().toLowerCase()!==title.trim().toLowerCase();return '<section class="guest-party compact-guest"><div class="guest-summary"><h2>'+esc(title)+'</h2>'+(showPeople?'<span class="guest-members">'+esc(people)+'</span>':"")+(g.kids?.length?'<span class="guest-kids">Kids (unconfirmed): '+esc(g.kids.join(" & "))+'</span>':"")+(g.status!=="invited"?'<span class="guest-status">'+esc(g.status)+'</span>':"")+(g.id?'<button class="text-button guestEdit" type="button" data-id="'+esc(g.id)+'">Edit</button>':"")+'</div></section>';}).join("");
 el("gsList").querySelectorAll(".guestEdit").forEach(b=>b.onclick=()=>open(groups.find(g=>g.id===b.dataset.id)));
}
async function load(){try{const data=await api("garrett_guest_groups?select=*&order=sort_order.asc,created_at.asc");if(Array.isArray(data)){if(data.length===0){groups=fallback;render();msg("Guest list database is empty. Showing the saved list; run the guest import to enable editing these entries.");}else{groups=data;render();}}}catch(e){msg("Could not load the shared guest list. Please try again after the database is active.");}}
function open(g){
 el("guestEditForm").hidden=false;el("guestId").value=g?.id||"";el("guestLabel").value=g?.label||"";el("guestNames").value=(g?.names||[]).join("\n");el("guestKids").value=(g?.kids||[]).join("\n");el("guestStatus").value=g?.status||"invited";el("guestDelete").hidden=!g?.id;el("guestLabel").focus();
}
el("guestNew").onclick=()=>open(null);
el("guestCancel").onclick=()=>el("guestEditForm").hidden=true;

el("guestEditForm").onsubmit=async e=>{
 e.preventDefault();
 const id=el("guestId").value;
 const lines=id=>(el(id).value.split(/\n|,/).map(s=>s.trim()).filter(Boolean));
 const data={label:el("guestLabel").value.trim(),names:lines("guestNames"),kids:lines("guestKids"),status:el("guestStatus").value,sort_order:id?(groups.find(g=>g.id===id)?.sort_order||0):groups.length+1};
 if(!data.label||!data.names.length){msg("Enter a group name and at least one guest.");return;}
 try{
 await api("garrett_guest_groups"+(id?"?id=eq."+encodeURIComponent(id):""),id?"PATCH":"POST",id?data:data);
 el("guestEditForm").hidden=true;msg("Guest list saved.");await load();
 }catch(err){msg("Could not save: "+err.message);}
};
el("guestDelete").onclick=async()=>{
 const id=el("guestId").value;if(!id)return;
 const group=groups.find(g=>g.id===id);
 if(!confirm("Remove "+(group?.label||"this guest group")+" and everyone listed in it? This cannot be undone."))return;
 try{await api("garrett_guest_groups?id=eq."+encodeURIComponent(id),"DELETE");el("guestEditForm").hidden=true;msg("Group deleted.");await load();}catch(err){msg("Could not delete: "+err.message);}
};
render();load();
})();
