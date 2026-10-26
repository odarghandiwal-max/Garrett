"use strict";
(()=>{
const BASE="https://hefwxmhdgkeqtyyfpwub.supabase.co";
const KEY="sb_publishable_VJjXv7HOU5zyT4SAQWvl7w_iFU0h5cx";
const fallback=[
["Sterling & Jasmine",["Sterling","Jasmine"],["Harlo","Atlas"]],["Tyler & Kayla",["Tyler","Kayla"],["Hunter"]],["Sophia & Parker",["Sophia","Parker"],[]],["Adi & Dolav",["Adi","Dolav"],[]],["Shauna & Paul",["Shauna","Paul"],[]],["Annabelle & Rafik",["Annabelle","Rafik"],[],"maybe"],["Evan & Louise",["Evan","Louise"],[],"maybe"],["Michelle",["Michelle"],[]],["Brad",["Brad"],[]],["Nawa",["Nawa"],[]],["Zoe",["Zoe"],[],"maybe"]
].map((p,i)=>({id:null,label:p[0],names:p[1],kids:p[2],status:p[3]||"invited",sort_order:i}));
let groups=fallback, token=null, refresh=null;
const el=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const api=async(path,method="GET",body,auth=token)=>{
 const res=await fetch(BASE+"/rest/v1/"+path,{method,headers:{apikey:KEY,Authorization:"Bearer "+(auth||KEY),"Content-Type":"application/json",Prefer:"return=representation"},body:body===undefined?undefined:JSON.stringify(body)});
 if(!res.ok)throw Error("Request failed ("+res.status+")");
 return res.status===204?[]:res.json();
};
const auth=async(path,body)=>{
 const res=await fetch(BASE+"/auth/v1/"+path,{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify(body)});
 const data=await res.json();if(!res.ok)throw Error(data.error_description||data.msg||data.error||"Login failed");return data;
};
const panel=document.createElement("section");panel.className="compose";panel.id="guestAdminPanel";
panel.innerHTML='<h2 class="label">Guest list management</h2><p id="guestAdminMessage" class="field-help">Guests can view this list. Anyone can edit this list. No login required.</p><form id="guestLoginForm" class="grid" autocomplete="on" hidden><div class="field"><label for="guestEmail">Host email</label><input id="guestEmail" type="email" autocomplete="username" required></div><div class="field"><label for="guestPassword">Password</label><input id="guestPassword" type="password" autocomplete="current-password" required></div><div class="field wide"><button class="primary" type="submit">Host sign in</button></div></form><div id="guestAdminTools"><div class="row"><button type="button" class="text-button" id="guestNew">Add guest or group</button></div><form id="guestEditForm" hidden><input type="hidden" id="guestId"><div class="grid"><div class="field wide"><label for="guestLabel">Group name / display heading</label><input id="guestLabel" type="text" maxlength="100" required placeholder="e.g. Sterling & Jasmine"></div><div class="field wide"><label for="guestNames">Adults / guests (one per line)</label><textarea id="guestNames" rows="3"></textarea></div><div class="field wide"><label for="guestKids">Children (one per line, optional)</label><textarea id="guestKids" rows="2"></textarea></div><div class="field"><label for="guestStatus">RSVP status</label><select id="guestStatus"><option value="invited">Invited</option><option value="confirmed">Confirmed</option><option value="maybe">Maybe</option><option value="declined">Declined</option></select></div></div><div class="row"><button type="submit" class="primary">Save changes</button><button type="button" class="text-button" id="guestCancel">Cancel</button><button type="button" class="text-button" id="guestDelete" hidden>Delete group</button></div></form></div>';
el("gsList").after(panel);
const msg=s=>el("guestAdminMessage").textContent=s;
function render(){
 const count=groups.reduce((n,g)=>n+(g.names?.length||0)+(g.kids?.length||0),0);
 el("gsList").innerHTML='<p class="count">'+count+' invited guests · plus Onay & Jordan hosting</p>'+groups.map(g=>'<section class="guest-party"><h2>'+esc(g.label)+'</h2><p>'+esc((g.names||[]).join(" & "))+'</p>'+(g.kids?.length?'<p>With '+esc(g.kids.join(" & "))+'</p>':"")+(g.status!=="invited"?'<span class="guest-status">'+esc(g.status)+'</span>':"")+(g.id?'<div class="row"><button class="text-button guestEdit" type="button" data-id="'+esc(g.id)+'">Edit group</button></div>':"")+'</section>').join("");
 el("gsList").querySelectorAll(".guestEdit").forEach(b=>b.onclick=()=>open(groups.find(g=>g.id===b.dataset.id)));
}
async function load(){try{const data=await api("garrett_guest_groups?select=*&order=sort_order.asc,created_at.asc");if(Array.isArray(data)){groups=data;render();}}catch(e){msg("Guest list database is not configured yet. The existing list is displayed.");}}
function open(g){
 el("guestEditForm").hidden=false;el("guestId").value=g?.id||"";el("guestLabel").value=g?.label||"";el("guestNames").value=(g?.names||[]).join("\n");el("guestKids").value=(g?.kids||[]).join("\n");el("guestStatus").value=g?.status||"invited";el("guestDelete").hidden=!g?.id;el("guestLabel").focus();
}
function setLoggedIn(on){el("guestLoginForm").hidden=on;el("guestAdminTools").hidden=!on;if(!on)el("guestEditForm").hidden=true;render();}
el("guestLoginForm").onsubmit=async e=>{
 e.preventDefault();msg("Signing in…");
 try{
 const data=await auth("token?grant_type=password",{email:el("guestEmail").value.trim(),password:el("guestPassword").value});
 const candidate=data.access_token;
 const r=await api("rpc/garrett_is_guest_admin","POST",{},candidate);
 if(r!==true)throw Error("This account is not approved as a host admin.");
 token=candidate;el("guestPassword").value="";setLoggedIn(true);msg("Signed in as a host. You can edit the guest list.");await load();
 }catch(err){token=null;setLoggedIn(false);msg(err.message);}
};
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
 const id=el("guestId").value;if(!id||!confirm("Delete this entire guest group?"))return;
 try{await api("garrett_guest_groups?id=eq."+encodeURIComponent(id),"DELETE");el("guestEditForm").hidden=true;msg("Group deleted.");await load();}catch(err){msg("Could not delete: "+err.message);}
};
render();load();
})();
