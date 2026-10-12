"use strict";
const BASE="https://hefwxmhdgkeqtyyfpwub.supabase.co/rest/v1/";
const API_KEY="sb_publishable_VJjXv7HOU5zyT4SAQWvl7w_iFU0h5cx";
const PARTIES=[{"label":"Sterling & Jasmine","names":["Sterling","Jasmine"],"kids":["Harlo","Atlas"]},{"label":"Tyler & Kayla","names":["Tyler","Kayla"],"kids":["Hunter"]},{"label":"Sophia & Parker","names":["Sophia","Parker"]},{"label":"Adi & Dolaf","names":["Adi","Dolaf"]},{"label":"Shauna & Paul","names":["Shauna","Paul"]},{"label":"Annabelle & Rafik","names":["Annabelle","Rafik"],"status":"maybe"},{"label":"Evan & Louise","names":["Evan","Louise"],"status":"maybe"},{"label":"HLers","names":["Sahar","Jasmine (Sahar’s)","Shay","Hilay"]},{"label":"Michelle","names":["Michelle"]},{"label":"Brad","names":["Brad"]},{"label":"Nawa","names":["Nawa"]},{"label":"Zoe","names":["Zoe"],"status":"maybe"}];
const MENU=[["Appetizers","other",["Charcuterie board","Jalapeño cream cheese wontons","Chili-lime chips & guacamole"]],["Sides","side",["Gravy","Stuffing","Mashed potatoes","Sweet potato casserole","Mac and cheese","Green bean casserole","Dinner rolls","Extra butter","Roasted vegetables","Brussels sprouts with bacon","Corn","Cranberry sauce","Applesauce","Fall salad","Caesar salad"]],["Desserts","dessert",["Pumpkin pie","Apple pie","Pecan pie","Whipped cream","Katella Bakery cookies or desserts"]],["Drinks","drink",["White wine","Red wine","Sparkling cider (non-alcoholic)","Beer","Soda","Coffee & tea"]],["Supplies","other",["Ice"]]];
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const KINDS=[["main","Mains"],["side","Sides"],["dessert","Desserts"],["drink","Drinks"],["other","Appetizers & supplies"]];
let entries=[],ready=false,currentId=null,currentToken=null,loading=false,saving=false;
let owned={};
try{owned=JSON.parse(localStorage.getItem("garrett-owned")||"{}");}catch(e){}
function remember(id,token){owned[id]=token;try{localStorage.setItem("garrett-owned",JSON.stringify(owned));}catch(e){}}
const maps='<div class="map-links"><a href="https://www.google.com/maps/search/?api=1&query=158%20Santa%20Ana%20Ave%2C%20Long%20Beach%2C%20CA" target="_blank" rel="noopener noreferrer">Google Maps ↗</a><a href="https://maps.apple.com/?q=158%20Santa%20Ana%20Ave%2C%20Long%20Beach%2C%20CA" target="_blank" rel="noopener noreferrer">Apple Maps ↗</a></div>';
$("evHead").innerHTML='<li class="event invitation-event"><h1 class="sr-only">Friendsgiving</h1><img class="invitation-image" src="assets/friendsgiving-invitation.jpg" width="1206" height="1761" alt="You’re invited to Friendsgiving at The Garretts, Saturday November 21, 2026 at 2:00 PM. 158 Santa Ana Ave, Long Beach, CA 90803. Bring your favorite dish or drink.">'+maps+'</li>';
$("eventView").querySelector(".lede").textContent="Pick something below or bring a favorite of your own. Ham and turkey are on us.";
$("pl-h").textContent="What to bring";
const names=PARTIES.flatMap(p=>p.names.concat(p.kids||[]));
const blankForm='<h2 class="label" id="add-h">Add your name</h2><p class="hint">Pick from the list or type your own idea. You can edit your entry after saving.</p>'+
'<form id="signupForm"><div class="grid"><div class="field"><label for="guestName">Your name</label><input id="guestName" type="text" autocomplete="name" list="guestNames" maxlength="60" required placeholder="Your name"><datalist id="guestNames">'+names.map(n=>'<option value="'+esc(n)+'"></option>').join("")+'</datalist></div>'+
'<div class="field"><label for="bringing">What are you bringing?</label><input id="bringing" type="text" maxlength="160" required placeholder="Pick above or type your own"></div>'+
'<div class="field"><label for="course">Category</label><select id="course">'+KINDS.map(k=>'<option value="'+k[0]+'">'+k[1]+'</option>').join("")+'</select></div>'+
'<div class="field"><label for="note">Note (optional)</label><input id="note" type="text" maxlength="160" placeholder="For example: serves 8"></div>'+
'<div class="field wide"><label for="drinkPreference">What do you like to drink? (optional)</label><input id="drinkPreference" type="text" maxlength="160" list="drinkIdeas" placeholder="For example: sparkling water, Pinot Noir, IPA or Diet Coke"><datalist id="drinkIdeas"><option value="Water"><option value="Sparkling water"><option value="White wine"><option value="Red wine"><option value="Sparkling cider"><option value="Beer"><option value="Soda"><option value="Coffee"><option value="Tea"></datalist><p class="field-help">A preference does not sign you up to bring it.</p></div>'+
'</div><div class="row"><button class="primary" id="saveButton" type="submit" disabled>Save my item</button><button class="text-button" id="newButton" type="button" hidden>Add another item</button><span class="status" id="saveStatus" role="status" aria-live="polite"></span></div></form>'+
'<div id="savedLink" hidden><p class="after">To edit on another device, keep this private link. It lets you edit only this entry.</p><div class="row"><input id="editLink" type="text" readonly aria-label="Your private edit link"><button id="copyLink" class="text-button" type="button">Copy edit link</button></div></div><p class="after">Names, items and drink preferences appear on the shared board.</p>';
$("eventView").querySelector(".compose").innerHTML=blankForm;
const menu=document.createElement("section");menu.id="menu";menu.innerHTML='<h2 class="label">Pick something to bring</h2><p class="lede">Choose an item below, or <a href="#signup" id="ownIdea">bring something else</a>.</p><div id="menuRows"></div>';$("eventView").querySelector(".compose").before(menu);
$("guestsView").querySelector(".compose").remove();
$("guestsView").querySelector(".intro p").textContent="Good company, all together. Families and friends are grouped together below.";
$("lgList").innerHTML='<section class="lg"><h3>Friendsgiving</h3><dl class="facts"><div class="fact"><dt>When</dt><dd>Saturday, November 21, 2026 at 2:00 PM PST</dd></div><div class="fact"><dt>Where</dt><dd>158 Santa Ana Ave, Long Beach, CA'+maps+'</dd></div><div class="fact"><dt>Mains</dt><dd>Onay & Jordan are providing Honey Baked Ham and turkey.</dd></div><div class="fact"><dt>Food</dt><dd>Pick a side, appetizer, dessert, drink or supply from the menu, or bring your own favorite.</dd></div></dl></section>';
$("gsList").innerHTML='<p class="count">'+names.length+' invited guests · plus Onay & Jordan hosting</p>'+PARTIES.map(p=>'<section class="guest-party"><h2>'+esc(p.label)+'</h2>'+(p.kids?.length?'<p>With '+esc(p.kids.join(" & "))+'</p>':p.label==="HLers"?'<p>'+esc(p.names.join(", "))+'</p>':"")+(p.status==="maybe"?'<span class="guest-status">Maybe</span>':"")+'</section>').join("");
document.querySelector('nav a[href="#past"]')?.remove();
document.querySelector('nav a[href="#events"]').textContent="Potluck";
function render(){
 const host=[{name:"Onay & Jordan",bringing:"Honey Baked Ham",kind:"main",note:"Provided by the hosts"},{name:"Onay & Jordan",bringing:"Turkey",kind:"main",note:"Provided by the hosts"}];
 const all=host.concat(entries);
 $("plCount").textContent=entries.length?entries.length+" guest "+(entries.length===1?"item":"items")+" signed up · ham and turkey are covered":"Ham and turkey are covered. Pick a side, appetizer, dessert or drink below.";
 $("plBoard").innerHTML=KINDS.map(k=>{
 const items=all.filter(g=>g.kind===k[0]);
 return '<section class="kind"><h3>'+k[1]+' <span class="n">'+items.length+'</span></h3><ul class="dishes">'+(items.length?items.map(g=>'<li><span class="dish">'+esc(g.bringing)+'</span><span class="by">'+esc(g.name)+'</span>'+(g.note?'<span class="note">'+esc(g.note)+'</span>':"")+(g.id&&owned[g.id]?'<button type="button" class="text-button edit-entry" data-id="'+esc(g.id)+'">Edit my item</button>':"")+'</li>').join(""):'<li class="none">Open for sign-ups</li>')+'</ul></section>';
 }).join("");
 $("menuRows").innerHTML=MENU.map((m,mi)=>'<section class="menu-group"><h3>'+m[0]+'</h3>'+m[2].map((dish,di)=>{
 const claims=entries.filter(g=>g.bringing.toLowerCase()===dish.toLowerCase());
 return '<div class="menu-item"><div><strong>'+esc(dish)+'</strong>'+(claims.length?'<small>'+claims.map(g=>esc(g.name)).join(", ")+' signed up</small>':"")+'</div><button class="text-button choose-item" type="button" data-item="'+mi+":"+di+'">'+(claims.length?"Bring more":"Bring this")+'</button></div>';
 }).join("")+'</section>').join("");
 $("menuRows").querySelectorAll(".choose-item").forEach(b=>b.addEventListener("click",()=>{
 const [mi,di]=b.dataset.item.split(":").map(Number);reset();$("bringing").value=MENU[mi][2][di];$("course").value=MENU[mi][1];showForm();
 }));
 $("plBoard").querySelectorAll(".edit-entry").forEach(b=>b.addEventListener("click",()=>edit(b.dataset.id)));
 const prefs=entries.filter(g=>g.drink_preference);
 let prefEl=$("drinkPrefs");if(!prefEl){prefEl=document.createElement("section");prefEl.id="drinkPrefs";$("plBoard").after(prefEl);}
 prefEl.innerHTML=prefs.length?'<h2 class="label">Drink preferences</h2><ul class="dishes">'+prefs.map(g=>'<li><span class="dish">'+esc(g.name)+'</span><span class="by">'+esc(g.drink_preference)+'</span></li>').join("")+'</ul>':"";
}
function showForm(){$("eventView").hidden=false;$("guestsView").hidden=true;$("logisticsView").hidden=true;$("signupForm").scrollIntoView({behavior:"smooth",block:"start"});$("guestName").focus();}
function reset(){currentId=null;currentToken=null;$("signupForm").reset();$("course").value="side";$("saveButton").textContent="Save my item";$("newButton").hidden=true;$("saveStatus").textContent="";$("savedLink").hidden=true;}
function edit(id){
 const e=entries.find(e=>e.id===id);if(!e||!owned[id])return;
 currentId=id;currentToken=owned[id];
 $("guestName").value=e.name;$("bringing").value=e.bringing;$("course").value=e.kind;$("note").value=e.note;$("drinkPreference").value=e.drink_preference;$("saveButton").textContent="Save changes";$("newButton").hidden=false;$("saveStatus").textContent="";setEditLink();showForm();
}
function setEditLink(){const u=new URL(location.href);u.hash="friendsgiving?entry="+encodeURIComponent(currentId)+"&edit="+encodeURIComponent(currentToken);$("editLink").value=u.href;$("savedLink").hidden=false;}
function route(){
 const h=location.hash.slice(1).split("?")[0]||"friendsgiving";
 ["home","eventView","guestsView","logisticsView"].forEach(id=>$(id).hidden=true);
 $(h==="guests"?"guestsView":h==="logistics"?"logisticsView":"eventView").hidden=false;
 document.querySelectorAll("nav a").forEach(a=>{const selected=a.getAttribute("href")===(h==="guests"?"#guests":h==="logistics"?"#logistics":"#events");if(selected)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 document.title=(h==="guests"?"Guests":h==="logistics"?"The details":"Friendsgiving")+" | The Garretts";
 if(h==="signup")showForm();else window.scrollTo(0,0);
}
async function api(path,method="GET",body){
 const r=await fetch(BASE+path,{method,headers:{apikey:API_KEY,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});
 const data=await r.json();if(!r.ok)throw Error(data.code||"SAVE_FAILED");return data;
}
async function load(){
 if(loading||saving)return;loading=true;
 try{const data=await api("garrett_signups?select=*&order=created_at");if(!Array.isArray(data))throw Error("INVALID_DATA");entries=data;ready=true;render();
 const p=new URLSearchParams(location.hash.split("?")[1]||"");
 const id=p.get("entry"),token=p.get("edit");if(id&&token&&token.length>=32&&entries.some(e=>e.id===id)){remember(id,token);edit(id);history.replaceState(null,"","#friendsgiving");}
 }catch(e){ready=false;$("saveStatus").textContent="Saving is not available yet. Please check back soon.";}
 finally{loading=false;$("saveButton").disabled=!ready||saving;}
}
$("signupForm").addEventListener("submit",async ev=>{
 ev.preventDefault();if(!ready||saving)return;
 const clean=id=>$(id).value.trim().replace(/\s+/g," ");
 $("guestName").setCustomValidity(clean("guestName")?"":"Enter your name.");$("bringing").setCustomValidity(clean("bringing")?"":"Enter what you are bringing.");
 if(!ev.target.reportValidity())return;
 const id=currentId||crypto.randomUUID(),token=currentToken||Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,"0")).join("");
 saving=true;$("saveButton").disabled=true;$("saveStatus").textContent="Saving…";
 try{
 const data=await api("rpc/garrett_save_signup","POST",{p_id:id,p_token:token,p_name:clean("guestName"),p_bringing:clean("bringing"),p_kind:$("course").value,p_note:clean("note"),p_drink_preference:clean("drinkPreference")});
 const row=Array.isArray(data)?data[0]:data;if(!row||row.id!==id)throw Error("SAVE_NOT_CONFIRMED");
 currentId=id;currentToken=token;remember(id,token);entries=entries.filter(e=>e.id!==id).concat(row);render();setEditLink();$("saveStatus").textContent="Saved! You’re on the list.";$("saveButton").textContent="Save changes";$("newButton").hidden=false;
 }catch(e){currentId=id;currentToken=token;remember(id,token);$("saveStatus").textContent="Could not confirm the save. Please try again; your form is still here.";}
 finally{saving=false;$("saveButton").disabled=!ready;}
});
["guestName","bringing"].forEach(id=>$(id).addEventListener("input",()=>$(id).setCustomValidity("")));
$("newButton").addEventListener("click",reset);
$("ownIdea").addEventListener("click",ev=>{ev.preventDefault();reset();showForm();});
$("copyLink").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("editLink").value);$("saveStatus").textContent="Private edit link copied.";}catch(e){$("editLink").focus();$("editLink").select();$("saveStatus").textContent="Select and copy your edit link."; }});
window.addEventListener("hashchange",route);render();route();load();
setInterval(()=>{if(!document.hidden)load();},30000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)load();});
