// Simple Retreat List Generator
(function(){
  const fileInput = document.getElementById('fileInput');
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const dropZone = document.getElementById('dropZone');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const printBtn = document.getElementById('printBtn');
  const maleCabinsInput = document.getElementById('maleCabinsInput');
  const femaleCabinsInput = document.getElementById('femaleCabinsInput');
  const neutralCabinsInput = document.getElementById('neutralCabinsInput');
  const bandanasInput = document.getElementById('bandanasInput');
  const busesInput = document.getElementById('busesInput');
  const summary = document.getElementById('summary');
  const output = document.getElementById('output');
  const toastEl = document.getElementById('toast');
  const sortSelect = document.getElementById('sortSelect');
  const megaPreview = document.getElementById('megaPreview');
  const copyMegaBtn = document.getElementById('copyMegaBtn');
  const downloadMegaBtn = document.getElementById('downloadMegaBtn');

  let students = [];
  let studentIdCounter = 0;
  function generate(){
    if(students.length===0){ showToast('Load a CSV first'); return; }
    const maleCabins = Math.max(0, parseInt(maleCabinsInput.value||0));
    const femaleCabins = Math.max(0, parseInt(femaleCabinsInput.value||0));
    const neutralCabins = Math.max(0, parseInt(neutralCabinsInput.value||0));
    const bandanaCount = Math.max(1, parseInt(bandanasInput.value||0));
    const busesCount = Math.max(1, parseInt(busesInput.value||0));

    const perGender = { 'male': maleCabins, 'female': femaleCabins, 'gender neutral': neutralCabins };
    const cabins = allocateCabins(students, perGender);
    const bandanas = assignBandanas(cabins, bandanaCount);
    const buses = assignBuses(cabins, busesCount);

    // store last cabins/results for bus CSV and print use
    const results = {cabins, bandanas, buses};
    window._lastCabins = cabins;
    window._lastResults = results;

    // render
    output.innerHTML = '';
    const cabDiv = document.createElement('div');
    cabDiv.innerHTML = '<h3>Cabins</h3>';
    cabins.forEach((c,idx)=>{
      const el = document.createElement('details'); el.innerHTML = `<summary>Cabin ${idx+1} — ${c.gender} — ${c.members.length} members</summary>`;
      const list = document.createElement('ol'); c.members.forEach(m=>{ const li=document.createElement('li'); li.textContent = `${m.name} — ${m.school} — ${m.gender}`; list.appendChild(li); });
      el.appendChild(list); cabDiv.appendChild(el);
    });
    output.appendChild(cabDiv);

    // add CSV controls for cabins (separate per-gender)
    const cabControls = document.createElement('div'); cabControls.style.margin='8px 0';
    ['male','female','gender neutral'].forEach(g=>{
      const btnCopy = document.createElement('button'); btnCopy.textContent = `Copy ${g} cabins CSV`; btnCopy.style.marginRight='8px'; btnCopy.onclick = ()=>{ const csv = makeGroupCSV(cabins,'cabins',g); copyText(csv).then(()=> showToast(`${g} cabins CSV copied`)); };
      const btnDL = document.createElement('button'); btnDL.textContent = `Download ${g} cabins CSV`; btnDL.style.marginRight='12px'; btnDL.onclick = ()=>{ const csv = makeGroupCSV(cabins,'cabins',g); downloadText(`${g.replace(/ /g,'_')}_cabins.csv`, csv); };
      cabControls.appendChild(btnCopy); cabControls.appendChild(btnDL);
    });
    // all cabins
    const allCopy = document.createElement('button'); allCopy.textContent='Copy all cabins CSV'; allCopy.style.marginRight='8px'; allCopy.onclick = ()=>{ const csv = makeGroupCSV(cabins,'cabins'); copyText(csv).then(()=> showToast('All cabins CSV copied')); };
    const allDL = document.createElement('button'); allDL.textContent='Download all cabins CSV'; allDL.onclick = ()=>{ const csv = makeGroupCSV(cabins,'cabins'); downloadText('cabins.csv', csv); };
    cabControls.appendChild(allCopy); cabControls.appendChild(allDL);
    cabDiv.appendChild(cabControls);

    const banDiv = document.createElement('div'); banDiv.innerHTML = '<h3>Bandana Groups</h3>';
    bandanas.forEach(b=>{ const el=document.createElement('details'); el.innerHTML = `<summary>Bandana ${b.id} — ${b.members.length} members</summary>`; const ol=document.createElement('ol'); b.members.forEach(m=>{ const li=document.createElement('li'); li.textContent = `${m.name} — ${m.school} — ${m.gender}`; ol.appendChild(li); }); el.appendChild(ol); banDiv.appendChild(el); });
    output.appendChild(banDiv);
    const banControls = document.createElement('div'); banControls.style.margin='8px 0';
    const banCopy = document.createElement('button'); banCopy.textContent='Copy bandanas CSV'; banCopy.onclick = ()=>{ const csv = makeGroupCSV(bandanas,'bandanas'); copyText(csv).then(()=> showToast('Bandanas CSV copied')); };
    const banDL = document.createElement('button'); banDL.textContent='Download bandanas CSV'; banDL.style.marginLeft='8px'; banDL.onclick = ()=>{ const csv = makeGroupCSV(bandanas,'bandanas'); downloadText('bandanas.csv', csv); };
    banControls.appendChild(banCopy); banControls.appendChild(banDL); banDiv.appendChild(banControls);

    const busDiv = document.createElement('div'); busDiv.innerHTML = '<h3>Buses</h3>';
    buses.forEach(b=>{ const el=document.createElement('details'); el.innerHTML = `<summary>Bus ${b.id} — ${b.cabins.length} cabins — ${b.riders} riders</summary>`; const ul=document.createElement('ul'); b.cabins.forEach(ci=>{ const li=document.createElement('li'); li.textContent = `Cabin ${ci+1} (${cabins[ci].members.length})`; ul.appendChild(li); }); el.appendChild(ul); busDiv.appendChild(el); });
    output.appendChild(busDiv);
    const busControls = document.createElement('div'); busControls.style.margin='8px 0';
    const busCopy = document.createElement('button'); busCopy.textContent='Copy buses CSV'; busCopy.onclick = ()=>{ const csv = makeGroupCSV(buses,'buses'); copyText(csv).then(()=> showToast('Buses CSV copied')); };
    const busDL = document.createElement('button'); busDL.textContent='Download buses CSV'; busDL.style.marginLeft='8px'; busDL.onclick = ()=>{ const csv = makeGroupCSV(buses,'buses'); downloadText('buses.csv', csv); };
    busControls.appendChild(busCopy); busControls.appendChild(busDL); busDiv.appendChild(busControls);

    // Master table controls (copy/download)
    const masterControls = document.createElement('div'); masterControls.style.margin='8px 0';
    const masterCopy = document.createElement('button'); masterCopy.textContent='Copy master CSV'; masterCopy.onclick = ()=>{ const csv = makeMasterCSV(results); copyText(csv).then(()=> showToast('Master CSV copied')); };
    const masterDL = document.createElement('button'); masterDL.textContent='Download master CSV'; masterDL.style.marginLeft='8px'; masterDL.onclick = ()=>{ const csv = makeMasterCSV(results); downloadText('master.csv', csv); };
    masterControls.appendChild(masterCopy); masterControls.appendChild(masterDL); busDiv.appendChild(masterControls);

    // Master table (flat)
    const masterDiv = document.createElement('div'); masterDiv.innerHTML = '<h3>Master Table</h3>';
    const table = document.createElement('table');
    const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>Name</th><th>Current Middle School</th><th>Gender</th><th>Bandana Group</th><th>Cabin</th><th>Bus</th></tr>'; table.appendChild(thead);
    const tbody = document.createElement('tbody');
    // build maps for bandana and bus
    const bandanaMap = {}; results.bandanas.forEach(b=> b.members.forEach(m=> bandanaMap[m.id] = b.id));
    const cabinToBus = {}; results.buses.forEach(b=> b.cabins.forEach(ci=> cabinToBus[ci] = b.id));
    // cabin labels
    const genderCounters = { 'male':0, 'female':0, 'gender neutral':0 };
    results.cabins.forEach((c,ci)=>{
      const g = c.gender;
      genderCounters[g] = (genderCounters[g]||0) + 1;
      const prefix = g === 'male' ? 'M' : (g === 'female' ? 'F' : 'GN');
      const cabinLabel = `${prefix}${genderCounters[g]}`;
      c.members.forEach(m=>{
        const tr = document.createElement('tr');
        const tdName = document.createElement('td'); tdName.textContent = m.name; tr.appendChild(tdName);
        const tdSchool = document.createElement('td'); tdSchool.textContent = m.school; tr.appendChild(tdSchool);
        const tdGender = document.createElement('td'); tdGender.textContent = m.gender; tr.appendChild(tdGender);
        const tdBand = document.createElement('td'); tdBand.textContent = bandanaMap[m.id] ? `Bandana ${bandanaMap[m.id]}` : ''; tr.appendChild(tdBand);
        const tdCabin = document.createElement('td'); tdCabin.textContent = cabinLabel; tr.appendChild(tdCabin);
        const tdBus = document.createElement('td'); tdBus.textContent = cabinToBus[ci] ? `Bus ${cabinToBus[ci]}` : ''; tr.appendChild(tdBus);
        tbody.appendChild(tr);
      });
    });
    table.appendChild(tbody); masterDiv.appendChild(table); output.appendChild(masterDiv);

    // Build mega CSV preview and enable copy/download
    const masterRows = buildMasterRows(results);
    // sort according to selector
    const sortBy = (typeof sortSelect !== 'undefined' && sortSelect && sortSelect.value) ? sortSelect.value : 'none';
    const sortedRows = masterRows.slice();
    if(sortBy === 'name') sortedRows.sort((a,b)=> a.name.localeCompare(b.name));
    else if(sortBy === 'bandana') sortedRows.sort((a,b)=> (a.bandanaId||0) - (b.bandanaId||0) || a.name.localeCompare(b.name));
    else if(sortBy === 'cabin') sortedRows.sort((a,b)=> {
      // sort by cabin gender prefix order: M, F, GN
      const order = { 'male': 0, 'female': 1, 'gender neutral': 2 };
      const oa = order[a.cabinGender]||3, ob = order[b.cabinGender]||3;
      return oa - ob || a.cabinNumber - b.cabinNumber || a.name.localeCompare(b.name);
    });
    else if(sortBy === 'bus') sortedRows.sort((a,b)=> (a.busId||0) - (b.busId||0) || a.name.localeCompare(b.name));

    const csvRows = sortedRows.map(r=>[r.name, r.school, r.gender, r.bandanaLabel, r.cabinLabel, r.busLabel]);
    const megaCsv = rowsToCSV(csvRows, ['Name','Current Middle School','Gender','Bandana Group','Cabin','Bus']);
    if(megaPreview) megaPreview.value = megaCsv;
    if(copyMegaBtn) copyMegaBtn.onclick = ()=>{ copyText(megaCsv).then(()=> showToast('Mega CSV copied')); };
    if(downloadMegaBtn) downloadMegaBtn.onclick = ()=>{ downloadText('mega.csv', megaCsv); };

    // enable download
    downloadBtn.disabled = false;
    downloadBtn.onclick = ()=>{ const blob=new Blob([JSON.stringify(results,null,2)], {type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='retreat_results.json'; a.click(); URL.revokeObjectURL(url); };

    showToast(`Generated ${cabins.length} cabins, ${bandanas.length} bandanas`);
    // scroll to results
    output.scrollIntoView({behavior:'smooth'});
  }
  function allocateCabins(students, perGenderCabinCounts){
    const genders = ['male','female','gender neutral'];
    const cabinSlots = [];
    for(const g of genders){
      let count = Math.max(0, perGenderCabinCounts[g] || 0);
      const pool = students.filter(s=> ((s.gender||'').toLowerCase() === g));
      // If user didn't configure cabins for this gender but there are students,
      // create at least one cabin so those students are included.
      if(count <= 0 && pool.length > 0){ count = 1; }
      if(count <= 0){ continue; }
      const base = Math.floor(pool.length / count);
      let rem = pool.length % count;
      // create cabin slots for this gender with target capacities
      const startIdx = cabinSlots.length;
      for(let i=0;i<count;i++){ const cap = base + (rem>0?1:0); if(rem>0) rem--; cabinSlots.push({gender: g, members: [], capacity: cap}); }

      // interleave students by school to maximize mixing
      const bySchool = groupBy(pool, 'school');
      const schoolQueues = Object.values(bySchool).map(arr=> arr.slice());
      const interleaved = [];
      while(schoolQueues.some(q=>q.length>0)){
        for(const q of schoolQueues){ if(q.length>0) interleaved.push(q.shift()); }
      }

      const indices = [];
      for(let i=0;i<count;i++) indices.push(startIdx + i);
      let ci = 0;
      for(const student of interleaved){
        let placed = false;
        for(let k=0;k<indices.length;k++){
          const target = indices[(ci + k) % indices.length];
          if(cabinSlots[target].members.length < (cabinSlots[target].capacity || 0)){
            cabinSlots[target].members.push(student);
            placed = true;
            ci = (target + 1) % indices.length;
            break;
          }
        }
        if(!placed){ cabinSlots[indices[0]].members.push(student); }
        ci++;
      }
    }

    for(const c of cabinSlots){ delete c.capacity; }
    return cabinSlots;
  }

  function assignBandanas(cabins, bandanaCount){
    // Rolling assignment across cabins as requested:
    // - All male cabins first, then female, then gender neutral
    // - Iterate cabin members in their stored order and assign bandana by a global counter
    // - Counter increments for each person and wraps modulo bandanaCount
    // This intentionally ignores school mixing and previous proportional logic.
    const bandanas = new Array(Math.max(1, bandanaCount)).fill(null).map((_,i)=> ({id:i+1, members:[]}));

    // order cabins: male, female, gender neutral
    const order = ['male','female','gender neutral'];
    const orderedCabins = [];
    for(const g of order){ for(const c of cabins){ if((c.gender||'') === g) orderedCabins.push(c); } }

    let counter = 0; // global counter across cabins
    for(const c of orderedCabins){
      for(const person of c.members){
        const bi = counter % bandanas.length;
        bandanas[bi].members.push(person);
        counter++;
      }
    }

    return bandanas;
  }

  function assignBuses(cabins, busesCount){
    const buses = new Array(busesCount).fill(null).map((_,i)=> ({id:i+1, cabins:[], riders:0}));
    for(let i=0;i<cabins.length;i++){ const bus = buses[i % busesCount]; bus.cabins.push(i); bus.riders += cabins[i].members.length; }
    return buses;
  }

  // CSV / copy helpers
  function rowsToCSV(rows, headers){
    const esc = v => (''+v).replace(/"/g,'""');
    const lines = [];
    if(headers) lines.push(headers.map(h=>`"${esc(h)}"`).join(','));
    for(const r of rows){ lines.push(r.map(c=>`"${esc(c)}"`).join(',')); }
    return lines.join('\n');
  }

  function makeGroupCSV(groups, groupType, genderFilter){
    const rows = [];
    if(groupType==='cabins'){
      groups.forEach((g,idx)=>{ if(genderFilter && g.gender !== genderFilter) return; g.members.forEach(m=> rows.push([`Cabin ${idx+1} (${g.gender})`, m.name, m.school, m.gender])); });
      return rowsToCSV(rows, ['Group','Name','School','Gender']);
    }
    if(groupType==='bandanas'){
      groups.forEach((g)=>{ g.members.forEach(m=> rows.push([`Bandana ${g.id}`, m.name, m.school, m.gender])); });
      return rowsToCSV(rows, ['Group','Name','School','Gender']);
    }
    if(groupType==='buses'){
      // buses: list cabin numbers and member rows per bus
      groups.forEach(b=>{ b.cabins.forEach(ci=>{ const label = `Bus ${b.id} / Cabin ${ci+1}`; const cabin = ci; const members = (window._lastCabins && window._lastCabins[ci]) ? window._lastCabins[ci].members : []; members.forEach(m=> rows.push([label, m.name, m.school, m.gender])); }); });
      return rowsToCSV(rows, ['Group','Name','School','Gender']);
    }
    return '';
  }

  // Master CSV generator (flat table): accepts results object {cabins, bandanas, buses}
  function makeMasterCSV(results){
    const rows = [];
    if(!results) return '';
    // build mapping student id -> bandana id
    const bandanaMap = {};
    results.bandanas.forEach(b=>{ b.members.forEach(m=> bandanaMap[m.id] = b.id); });
    // build mapping cabinIndex -> bus id
    const cabinToBus = {};
    results.buses.forEach(b=>{ b.cabins.forEach(ci=> cabinToBus[ci] = b.id); });

    // compute cabin labels by gender counters and produce rows array
    const genderCounters = { 'male':0, 'female':0, 'gender neutral':0 };
    results.cabins.forEach((c,ci)=>{
      const g = c.gender;
      genderCounters[g] = (genderCounters[g]||0) + 1;
      const prefix = g === 'male' ? 'M' : (g === 'female' ? 'F' : 'GN');
      const cabinLabel = `${prefix}${genderCounters[g]}`;
      c.members.forEach(m=>{
        const band = bandanaMap[m.id] || '';
        const bus = cabinToBus[ci] || '';
        rows.push({
          name: m.name,
          school: m.school,
          gender: m.gender,
          bandana: band ? `Bandana ${band}` : '',
          bandanaId: band || 0,
          cabin: cabinLabel,
          cabinIndex: ci,
          cabinGender: g,
          cabinNumber: genderCounters[g],
          bus: bus ? `Bus ${bus}` : '',
          busId: bus || 0,
        });
      });
    });

    // convert to CSV in requested column order
    const csvRows = rows.map(r=>[r.name, r.school, r.gender, r.bandana, r.cabin, r.bus]);
    return rowsToCSV(csvRows, ['Name','Current Middle School','Gender','Bandana Group','Cabin','Bus']);
  }

  // Build master rows as objects for sorting/rendering
  function buildMasterRows(results){
    if(!results) return [];
    const bandanaMap = {};
    results.bandanas.forEach(b=>{ b.members.forEach(m=> bandanaMap[m.id] = b.id); });
    const cabinToBus = {};
    results.buses.forEach(b=>{ b.cabins.forEach(ci=> cabinToBus[ci] = b.id); });
    const rows = [];
    const genderCounters = { 'male':0, 'female':0, 'gender neutral':0 };
    results.cabins.forEach((c,ci)=>{
      const g = c.gender;
      genderCounters[g] = (genderCounters[g]||0) + 1;
      const prefix = g === 'male' ? 'M' : (g === 'female' ? 'F' : 'GN');
      const cabinLabel = `${prefix}${genderCounters[g]}`;
      c.members.forEach(m=>{
        const band = bandanaMap[m.id] || '';
        const bus = cabinToBus[ci] || '';
        rows.push({
          name: m.name,
          school: m.school,
          gender: m.gender,
          bandanaLabel: band ? `Bandana ${band}` : '',
          bandanaId: band || 0,
          cabinLabel,
          cabinGender: g,
          cabinNumber: genderCounters[g],
          cabinIndex: ci,
          busLabel: bus ? `Bus ${bus}` : '',
          busId: bus || 0,
        });
      });
    });
    return rows;
  }
  
  // --- Utilities and file handling ---
  const SAMPLE_CSV = `name,school,gender
Alex Johnson,Maple Middle,male
Sofia Martinez,River Middle,female
Jordan Lee,Hillview,gender neutral
Liam Chen,Maple Middle,male
Maya Patel,River Middle,female
Ethan Brown,Hillview,male
Olivia Green,Maple Middle,female
Noah Davis,River Middle,male
Emma Wilson,Hillview,female
Taylor Kim,Maple Middle,gender neutral
`;

  function parseCSV(text){
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
    if(lines.length===0) return [];
    const first = lines[0].split(',').map(h=>h.trim().toLowerCase());
    let start = 0;
    let hasHeader = false;
    if(first.includes('name') && (first.includes('school') || first.includes('middle') ) ){
      hasHeader = true; start = 1;
    }
    const out = [];
    for(let i=start;i<lines.length;i++){
      const cols = lines[i].split(',').map(c=>c.trim());
      if(cols.length<2) continue;
      const strip = s => (s||'').replace(/^\s*"?|"?\s*$/g,'').replace(/^\s*'?|'?\s*$/g,'').trim();
      const name = strip(cols[0]);
      const school = strip(cols[1]);
      const rawG = strip(cols[2]||'').toLowerCase();
      let gender = 'gender neutral';
      const femaleWords = ['female','f','girl','cisfemale','femme'];
      const maleWords = ['male','m','boy','cismale','masc'];
      const neutralWords = ['non-binary','nonbinary','non binary','nb','enby','gender neutral','gender-neutral','gn','x','other','prefer not to say','agender'];
      const matches = (list)=> list.some(w=> {
        if(!w) return false;
        if(w.length===1) return rawG === w; // single-letter tokens: exact match
        return rawG === w || rawG.includes(w) || new RegExp('\\b'+w.replace(/[-\\/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\b').test(rawG);
      });
      if(matches(neutralWords)) gender = 'gender neutral';
      else if(matches(femaleWords)) gender = 'female';
      else if(matches(maleWords)) gender = 'male';
      out.push({ id: ++studentIdCounter, name, school, gender });
    }
    return out;
  }

  function groupBy(arr, key){ return arr.reduce((acc,item)=>{ const k = item[key] || ''; acc[k] = acc[k]||[]; acc[k].push(item); return acc; }, {}); }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

  function copyText(t){ if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t); return Promise.reject('No clipboard'); }
  function downloadText(name, text){ const blob = new Blob([text], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }

  function showToast(msg){ if(!toastEl) return; toastEl.textContent = msg; toastEl.style.opacity = 1; setTimeout(()=>{ toastEl.style.transition = 'opacity 600ms'; toastEl.style.opacity = 0; }, 1800); }
  function enableGenerate(){ if(!generateBtn) return; generateBtn.disabled = students.length === 0; }

  // file input and drag/drop
  fileInput && fileInput.addEventListener('change', e=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = ev=>{ students = parseCSV(ev.target.result); renderSummary(); }; r.readAsText(f); });
  dropZone && (function(){ dropZone.addEventListener('dragover', e=>{ e.preventDefault(); dropZone.classList.add('dragover'); }); dropZone.addEventListener('dragleave', e=>{ dropZone.classList.remove('dragover'); }); dropZone.addEventListener('drop', e=>{ e.preventDefault(); dropZone.classList.remove('dragover'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(!f) return; const r = new FileReader(); r.onload = ev=>{ students = parseCSV(ev.target.result); renderSummary(); }; r.readAsText(f); }); })();
  loadSampleBtn && loadSampleBtn.addEventListener('click', ()=>{
    // Try fetching the workspace sample.csv first (works when served over HTTP).
    fetch('sample.csv').then(r=>{
      if(!r.ok) throw new Error('no fetch');
      return r.text();
    }).then(text=>{
      students = parseCSV(text); renderSummary(); showToast('Loaded sample.csv (fetched)');
    }).catch(()=>{
      students = parseCSV(SAMPLE_CSV); renderSummary(); showToast('Loaded embedded sample CSV');
    });
  });
  

  // Print view: open simple window with tables and call print
  function openPrintView(){
    const res = window._lastResults;
    if(!res){ showToast('Generate groups first'); return; }
    const w = window.open('', '_blank');
    const html = ['<html><head><title>Retreat Groups</title><meta charset="utf-8"/><style>body{font-family:Arial,Helvetica,sans-serif;padding:12px}h2{margin-top:28px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:6px;text-align:left}</style></head><body>'];
    html.push('<h1>Retreat Groups</h1>');
    // cabins
    html.push('<h2>Cabins</h2><table><tr><th>Cabin</th><th>Name</th><th>School</th><th>Gender</th></tr>');
    res.cabins.forEach((c,idx)=>{ c.members.forEach(m=> html.push(`<tr><td>Cabin ${idx+1} (${c.gender})</td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.school)}</td><td>${escapeHtml(m.gender)}</td></tr>`)); });
    html.push('</table>');
    // bandanas
    html.push('<h2>Bandana groups</h2><table><tr><th>Bandana</th><th>Name</th><th>School</th><th>Gender</th></tr>');
    res.bandanas.forEach(b=>{ b.members.forEach(m=> html.push(`<tr><td>Bandana ${b.id}</td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.school)}</td><td>${escapeHtml(m.gender)}</td></tr>`)); });
    html.push('</table>');
    // buses
    html.push('<h2>Buses</h2><table><tr><th>Bus/Cabin</th><th>Name</th><th>School</th><th>Gender</th></tr>');
    res.buses.forEach(b=>{ b.cabins.forEach(ci=>{ const cabin = res.cabins[ci]; cabin.members.forEach(m=> html.push(`<tr><td>Bus ${b.id} / Cabin ${ci+1}</td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.school)}</td><td>${escapeHtml(m.gender)}</td></tr>`)); }); });
    html.push('</table>');
    html.push('</body></html>');
    w.document.write(html.join(''));
    w.document.close();
    w.focus();
    setTimeout(()=> w.print(), 300);
  }

  function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  generateBtn.addEventListener('click', generate);
  printBtn.addEventListener('click', openPrintView);

  // enable/disable generate when students change
  function renderSummary(){
    if(students.length===0){ summary.innerHTML = '<em>No students loaded</em>'; enableGenerate(); return; }
    const byGender = groupBy(students, 'gender');
    const bySchool = groupBy(students, 'school');
    let html = `<p><strong>Students:</strong> ${students.length} — genders: ${Object.entries(byGender).map(([g,a])=>`${g}:${a.length}`).join(', ')}; schools: ${Object.keys(bySchool).length}</p>`;
    // show parsed sample for debugging (first 10)
    html += '<div style="margin-top:8px"><strong>Parsed preview:</strong><ul>';
    for(let i=0;i<Math.min(10, students.length); i++){ const s = students[i]; html += `<li>${escapeHtml(s.name)} — ${escapeHtml(s.school)} — <em>${escapeHtml(s.gender)}</em></li>`; }
    if(students.length>10) html += `<li>... (${students.length-10} more)</li>`;
    html += '</ul></div>';
    summary.innerHTML = html;
    enableGenerate();
  }

  enableGenerate();
})();
