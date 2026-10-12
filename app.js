"use strict";
const SUPABASE_URL="https://hefwxmhdgkeqtyyfpwub.supabase.co";
const PUBLIC_KEY="sb_publishable_VJjXv7HOU5zyT4SAQWvl7w_iFU0h5cx";
const PARTIES=[{"label":"Onay & Jordan","names":["Onay","Jordan"],"status":"yes","hosts":true},{"label":"Sterling & Jasmine","names":["Sterling","Jasmine"],"kids":["Harlo","Atlas"]},{"label":"Tyler & Kayla","names":["Tyler","Kayla"],"kids":["Hunter"]},{"label":"Sophia & Parker","names":["Sophia","Parker"]},{"label":"Adi & Dolaf","names":["Adi","Dolaf"]},{"label":"Shauna & Paul","names":["Shauna","Paul"]},{"label":"Annabelle & Rafik","names":["Annabelle","Rafik"],"status":"maybe"},{"label":"Evan & Louise","names":["Evan","Louise"],"status":"maybe"},{"label":"HLers","names":["Sahar","Jasmine (Sahar’s)","Shay","Hilay"]},{"label":"Michelle","names":["Michelle"]},{"label":"Brad","names":["Brad"]},{"label":"Shabnam","names":["Shabnam"]},{"label":"Nawa","names":["Nawa"]},{"label":"Zoe","names":["Zoe"],"status":"maybe"}];
const INITIAL_GUESTS=[{"id":"p1-g1","name":"Onay","party_id":"p1","child":false,"rsvp":"yes","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p1-g2","name":"Jordan","party_id":"p1","child":false,"rsvp":"yes","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p2-g1","name":"Sterling","party_id":"p2","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p2-g2","name":"Jasmine","party_id":"p2","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p2-g3","name":"Harlo","party_id":"p2","child":true,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p2-g4","name":"Atlas","party_id":"p2","child":true,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p3-g1","name":"Tyler","party_id":"p3","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p3-g2","name":"Kayla","party_id":"p3","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p3-g3","name":"Hunter","party_id":"p3","child":true,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p4-g1","name":"Sophia","party_id":"p4","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p4-g2","name":"Parker","party_id":"p4","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p5-g1","name":"Adi","party_id":"p5","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p5-g2","name":"Dolaf","party_id":"p5","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p6-g1","name":"Shauna","party_id":"p6","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p6-g2","name":"Paul","party_id":"p6","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p7-g1","name":"Annabelle","party_id":"p7","child":false,"rsvp":"maybe","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p7-g2","name":"Rafik","party_id":"p7","child":false,"rsvp":"maybe","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p8-g1","name":"Evan","party_id":"p8","child":false,"rsvp":"maybe","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p8-g2","name":"Louise","party_id":"p8","child":false,"rsvp":"maybe","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p9-g1","name":"Sahar","party_id":"p9","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p9-g2","name":"Jasmine (Sahar’s)","party_id":"p9","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p9-g3","name":"Shay","party_id":"p9","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p9-g4","name":"Hilay","party_id":"p9","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p10-g1","name":"Michelle","party_id":"p10","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p11-g1","name":"Brad","party_id":"p11","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p12-g1","name":"Shabnam","party_id":"p12","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p13-g1","name":"Nawa","party_id":"p13","child":false,"rsvp":"pending","bringing":"","kind":"side","note":"","drink_preference":""},{"id":"p14-g1","name":"Zoe","party_id":"p14","child":false,"rsvp":"maybe","bringing":"","kind":"side","note":"","drink_preference":""}];
const MENU=[["Appetizers","other",["Charcuterie board","Jalapeño cream cheese wontons","Chili-lime chips & guacamole"]],["Sides","side",["Gravy","Stuffing","Mashed potatoes","Sweet potato casserole","Mac and cheese","Green bean casserole","Dinner rolls","Extra butter","Roasted vegetables","Brussels sprouts with bacon","Corn","Cranberry sauce","Applesauce","Fall salad","Caesar salad"]],["Desserts","dessert",["Pumpkin pie","Apple pie","Pecan pie","Whipped cream","Katella Bakery cookies or desserts"]],["Drinks","drink",["White wine","Red wine","Sparkling cider (non-alcoholic)","Beer","Soda","Coffee & tea"]],["Supplies","other",["Ice"]]];
let guests=INITIAL_GUESTS.map(g=>({...g})),ready=false,loading=false;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const statusLabel=s=>({yes:"Coming",maybe:"Maybe",no:"Unable to attend",pending:"Invited"})[s]||"Invited";
const kinds=[["main","Mains"],["side","Sides"],["dessert","Desserts"],["drink","Drinks"],["other","Appetizers & supplies"]];
const notice=document.createElement("p");notice.className="save-notice";notice.role="status";notice.setAttribute("aria-live","polite");$("eventView").append(notice);
$("evHead").innerHTML='<li class="event"><div><p class="eyebrow">You’re invited to</p><h3>Friendsgiving</h3><span class="short"></span><p class="meta"><span>Saturday, November 21, 2026</span><span>2:00 PM PST</span></p><p class="desc">Bring your favorite dish or drink.</p></div></li>';
$("eventView").querySelector(".lede").textContent="Choose from the menu or bring a favorite of your own. See what everyone has signed up for below.";
const options=()=>guests.map(g=>'<option value="'+esc(g.id)+'">'+esc(g.name)+'</option>').join("");
$("eventView").querySelector(".compose").innerHTML=
'<h2 class="label" id="add-h">What are you bringing?</h2><p class="hint">Find your name, pick from the list, or tell us your own idea. You can change your entry later.</p>'+
'<form id="signupForm"><div class="grid">'+
'<div class="field"><label for="guestChoice">Your name</label><select id="guestChoice" required><option value="">Choose your name</option>'+options()+'</select></div>'+
'<div class="field"><label for="dishChoice">Choose an item</label><select id="dishChoice"><option value="">Pick from the menu</option>'+MENU.map((m,mi)=>'<optgroup label="'+esc(m[0])+'">'+m[2].map((v,vi)=>'<option value="'+mi+":"+vi+'">'+esc(v)+'</option>').join("")+'</optgroup>').join("")+'<option value="custom">Something else — type it below</option></select></div>'+
'<div class="field wide"><label for="bringing">Your dish, drink or item</label><input id="bringing" type="text" maxlength="160" placeholder="Choose above or type your own. Bringing more? List it here."></div>'+
'<div class="field"><label for="course">Category</label><select id="course">'+kinds.map(k=>'<option value="'+k[0]+'">'+k[1]+'</option>').join("")+'</select></div>'+
'<div class="field"><label for="dishNote">Serving note (optional)</label><input id="dishNote" type="text" maxlength="160" placeholder="For example: serves 8"></div>'+
'<div class="field wide"><label for="drinkPreference">What do you like to drink? (optional)</label><input id="drinkPreference" type="text" maxlength="160" placeholder="For example: sparkling water, Pinot Noir, IPA or Diet Coke"><p class="field-help">This is your preference; it does not sign you up to bring it.</p></div>'+
'</div><div class="row"><button id="signupSave" class="primary" type="submit" disabled>Save my choices</button><span id="signupStatus" class="status" role="status" aria-live="polite"></span></div></form>'+
'<p class="after">This is a shared board. Choose your own name when updating. Entries and drink preferences are visible to guests.</p>';
$("guestsView").querySelector(".intro p").textContent="Everyone coming together, together on the list. Select your name below to update your RSVP.";
$("guestsView").querySelector(".compose").innerHTML=
'<h2 class="label">Your RSVP</h2><form id="rsvpForm"><div class="grid"><div class="field"><label for="rsvpGuest">Your name</label><select id="rsvpGuest" required><option value="">Choose your name</option>'+options()+'</select></div><div class="field"><label for="rsvpValue">Will you join us?</label><select id="rsvpValue"><option value="pending">Not answered yet</option><option value="yes">Yes, I’m coming</option><option value="maybe">Maybe</option><option value="no">Unable to attend</option></select></div></div><div class="row"><button id="rsvpSave" type="submit" class="primary" disabled>Save RSVP</button><span class="status" id="rsvpStatus" role="status" aria-live="polite"></span></div></form>';
$("lgList").innerHTML='<section class="lg"><h3>Friendsgiving</h3><dl class="facts"><div class="fact"><dt>When</dt><dd>Saturday, November 21, 2026 at 2:00 PM PST</dd></div><div class="fact"><dt>Mains</dt><dd>Onay & Jordan are providing Honey Baked Ham and turkey.</dd></div><div class="fact"><dt>Food</dt><dd>Pick a side, appetizer, dessert, drink or supply from the menu, or bring your own favorite.</dd></div></dl></section>';
function render(){
 const entries=[{name:"Onay & Jordan",bringing:"Honey Baked Ham",kind:"main",note:"Provided by the hosts"},{name:"Onay & Jordan",bringing:"Turkey",kind:"main",note:"Provided by the hosts"},...guests.filter(g=>g.bringing)];
 $("plCount").textContent=entries.length+" items on the board · ham and turkey are covered";
 $("plBoard").innerHTML=kinds.map(k=>{
 const items=entries.filter(g=>g.kind===k[0]);
 return '<section class="kind"><h3>'+k[1]+' <span class="n">'+items.length+'</span></h3><ul class="dishes">'+(items.length?items.map(g=>'<li><span class="dish">'+esc(g.bringing)+'</span><span class="by">'+esc(g.name)+'</span>'+(g.note?'<span class="note">'+esc(g.note)+'</span>':"")+'</li>').join(""):'<li class="none">Open for sign-ups</li>')+'</ul></section>';
 }).join("");
 $("gsList").innerHTML='<p class="count">'+guests.length+' on the list · '+guests.filter(g=>g.rsvp==="yes").length+' coming · '+guests.filter(g=>g.rsvp==="maybe").length+' maybe</p>'+PARTIES.map((p,pi)=>{
 const members=guests.filter(g=>g.party_id==="p"+(pi+1));
 return '<section class="guest-party"><h2>'+esc(p.label)+'</h2>'+(p.kids?.length?'<p>With '+esc(p.kids.join(" & "))+'</p>':"")+'<ul class="party-members">'+members.map(g=>'<li><span>'+esc(g.name)+'</span><span class="guest-status">'+esc(p.hosts?"Hosting":statusLabel(g.rsvp))+'</span>'+(g.drink_preference?'<small>Drink preference: '+esc(g.drink_preference)+'</small>':"")+'</li>').join("")+'</ul></section>';
 }).join("");
}
function route(){
 const h=location.hash.slice(1)||"friendsgiving";
 ["home","eventView","guestsView","logisticsView"].forEach(id=>$(id).hidden=true);
 $(h==="guests"?"guestsView":h==="logistics"?"logisticsView":"eventView").hidden=false;
 document.querySelectorAll("nav a").forEach(a=>a.toggleAttribute("aria-current",a.getAttribute("href")===(h==="guests"?"#guests":h==="logistics"?"#logistics":"#events")));
 document.title=(h==="guests"?"Guests":h==="logistics"?"The details":"Friendsgiving")+" | The Garretts";
 window.scrollTo(0,0);
}
async function api(path,method="GET",body){
 const response=await fetch(SUPABASE_URL+"/rest/v1/"+path,{method,headers:{apikey:PUBLIC_KEY,"Content-Type":"application/json",Prefer:"return=representation"},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});
 const data=await response.json();
 if(!response.ok)throw new Error(data.code||"HTTP "+response.status);
 return data;
}
async function load(){
 if(loading)return;loading=true;
 try{
 const data=await api("garrett_guests?select=*&order=id");
 if(!Array.isArray(data)||!data.length)throw Error("NOT_CONFIGURED");
 guests=data;ready=true;notice.textContent="Changes save to the shared guest list.";render();
 }catch(e){ready=false;notice.textContent="Sign-up saving is not available yet. Please check back soon. Your entries have not been saved.";}
 finally{loading=false;$("signupSave").disabled=!ready;$("rsvpSave").disabled=!ready;}
}
$("guestChoice").addEventListener("change",()=>{
 const g=guests.find(g=>g.id===$("guestChoice").value);
 $("bringing").value=g?.bringing||"";$("course").value=g?.kind||"side";$("dishNote").value=g?.note||"";$("drinkPreference").value=g?.drink_preference||"";$("dishChoice").value="";$("signupStatus").textContent="";
});
$("dishChoice").addEventListener("change",()=>{
 const value=$("dishChoice").value;
 if(value==="custom"){$("bringing").value="";$("bringing").focus();return;}
 if(!value)return;
 const [mi,vi]=value.split(":").map(Number);$("bringing").value=MENU[mi][2][vi];$("course").value=MENU[mi][1];
});
$("rsvpGuest").addEventListener("change",()=>{$("rsvpValue").value=guests.find(g=>g.id===$("rsvpGuest").value)?.rsvp||"pending";$("rsvpStatus").textContent="";});
async function save(id,changes,status,button){
 if(!ready){status.textContent="Saving is not available yet. Nothing was saved.";return;}
 const g=guests.find(g=>g.id===id);if(!g)return;
 button.disabled=true;status.textContent="Saving…";
 try{
 const data=await api("garrett_guests?id=eq."+encodeURIComponent(id),"PATCH",changes);
 if(!Array.isArray(data)||data.length!==1)throw Error("SAVE_NOT_CONFIRMED");
 guests=guests.map(old=>old.id===id?data[0]:old);render();status.textContent="Saved. You can come back to change it.";
 }catch(e){status.textContent="Could not save. Your entry has not been saved; please try again.";}
 finally{button.disabled=!ready;}
}
$("signupForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!e.target.reportValidity())return;
 const clean=id=>$(id).value.trim().replace(/\s+/g," ");
 await save($("guestChoice").value,{bringing:clean("bringing"),kind:$("course").value,note:clean("dishNote"),drink_preference:clean("drinkPreference")},$("signupStatus"),$("signupSave"));
});
$("rsvpForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!e.target.reportValidity())return;
 await save($("rsvpGuest").value,{rsvp:$("rsvpValue").value},$("rsvpStatus"),$("rsvpSave"));
});
document.querySelector('nav a[href="#past"]').remove();
window.addEventListener("hashchange",route);
render();route();load();
setInterval(()=>{if(!document.hidden)load();},30000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)load();});
