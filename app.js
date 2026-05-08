/* ════════════════════════════════
   ListAI — app.js
   ════════════════════════════════ */

let files = [], pendingKey = '';

/* ── Chiave salvata ── */
(function () {
  try {
    const k = localStorage.getItem('lai_k'), e = localStorage.getItem('lai_e');
    if (k && e && Date.now() < +e) document.getElementById('apiKey').value = k;
  } catch (_) {}
})();

function toggleKey() {
  const i = document.getElementById('apiKey');
  i.type = i.type === 'password' ? 'text' : 'password';
}
function promptSave(k) { pendingKey = k; document.getElementById('saveModal').classList.add('open'); }
function saveKey(yes) {
  document.getElementById('saveModal').classList.remove('open');
  if (yes && pendingKey) {
    try { localStorage.setItem('lai_k', pendingKey); localStorage.setItem('lai_e', Date.now() + 30 * 24 * 60 * 60 * 1000); } catch (_) {}
  }
  pendingKey = '';
}

/* ── Modello custom ── */
function onModelChange() {
  const v = document.getElementById('modelSelect').value;
  const ci = document.getElementById('customModel');
  ci.style.display = v === 'custom' ? 'block' : 'none';
  if (v === 'custom') ci.focus();
}
function getModel() {
  const v = document.getElementById('modelSelect').value;
  if (v === 'custom') { const c = document.getElementById('customModel').value.trim(); return c || 'google/gemini-flash-3.1'; }
  return v;
}

/* ── Categoria & Bambini ── */
const CLOTHING_CATS = ['donna', 'uomo', 'unisex', 'griffati'];

function isClothingCat() {
  const cat = document.getElementById('categoria').value;
  if (cat !== 'bambini') return CLOTHING_CATS.includes(cat);
  // bambini: dipende dal tipo scelto
  const bt = document.getElementById('bambiniTipo');
  return bt ? bt.value === 'vestiti' : false;
}

function onCategoriaChange() {
  const cat = document.getElementById('categoria').value;
  const isBambini = cat === 'bambini';
  const bambiniSub = document.getElementById('bambiniSub');
  bambiniSub.classList.toggle('open', isBambini);

  if (!isBambini) {
    const isCloth = CLOTHING_CATS.includes(cat);
    _showTagliaOrSottocat(isCloth);
  } else {
    // default bambini = vestiti
    _showTagliaOrSottocat(true);
  }
  document.getElementById('sottocatVal').value = '';
}

function onBambiniTipoChange() {
  const v = document.getElementById('bambiniTipo').value;
  _showTagliaOrSottocat(v === 'vestiti');
  document.getElementById('sottocatVal').value = '';
}

function _showTagliaOrSottocat(isCloth) {
  document.getElementById('blockTaglia').style.display = isCloth ? '' : 'none';
  document.getElementById('blockSottocat').style.display = isCloth ? 'none' : '';
}

/* ── Taglia ── */
function onT() {
  const v = document.getElementById('tagliaTipo').value;
  document.getElementById('tsub').classList.toggle('open', v === 'manual');
}
function toggleSz() { document.getElementById('szwrap').classList.toggle('open'); }
function showSz(n, b) {
  document.querySelectorAll('.szp').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sztab').forEach(t => t.classList.remove('active'));
  document.getElementById('szp-' + n).classList.add('active');
  b.classList.add('active');
}

function getTagliaIT() {
  if (!isClothingCat()) {
    return document.getElementById('sottocatVal').value.trim() || 'da identificare dalle foto';
  }
  const t = document.getElementById('tagliaTipo').value;
  if (t === 'unica') return 'Taglia Unica';
  if (t === 'photo') return 'da identificare dalle foto';
  if (t === 'na') return 'non applicabile';
  const cat = document.getElementById('catCapo').value;
  const val = document.getElementById('tagliaVal').value.trim();
  return `${cat} – taglia IT: ${val || '?'}`;
}

function getSottocategoria() {
  if (isClothingCat()) return null;
  return document.getElementById('sottocatVal').value.trim() || null;
}

function getCategoria() {
  const cat = document.getElementById('categoria').value;
  if (cat === 'bambini') {
    const bt = document.getElementById('bambiniTipo');
    const tipo = bt ? bt.value : 'vestiti';
    return tipo === 'vestiti' ? 'Bambini – Abbigliamento' : 'Bambini – Giochi e Oggetti';
  }
  const map = {
    donna: 'Abbigliamento Donna', unisex: 'Abbigliamento Unisex', uomo: 'Abbigliamento Uomo',
    griffati: 'Articoli Griffati', casa: 'Casa', elettronica: 'Elettronica',
    intrattenimento: 'Intrattenimento', hobby: 'Hobby e Collezionismo', sport: 'Sport'
  };
  return map[cat] || 'Generico';
}

function getCondLabel() {
  return {
    NWT: 'Nuovo con cartellino (brand new with tag)',
    NWOT: 'Nuovo senza cartellino (new without tag)',
    EUC: 'Usato – ottime condizioni (used, excellent)',
    GUC: 'Usato – buone condizioni (used, good)',
    POOR: 'Usato – pessime condizioni (used, poor)'
  }[document.getElementById('condizione').value] || 'N/D';
}

function getCondDiscount() {
  return { NWT: 0.65, NWOT: 0.55, EUC: 0.45, GUC: 0.30, POOR: 0.15 }
  [document.getElementById('condizione').value] || 0.40;
}

function getExtraInfo() {
  return document.getElementById('extraInfo').value.trim();
}

/* ── File upload ── */
const dz = document.getElementById('dz');
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); addFiles([...e.dataTransfer.files]); });
document.getElementById('fi').addEventListener('change', e => addFiles([...e.target.files]));

function addFiles(f) {
  const v = f.filter(x => x.type === 'image/jpeg' || x.type === 'image/png');
  files = [...files, ...v].slice(0, 10);
  renderP();
  document.getElementById('go').disabled = files.length === 0;
  hideErr();
}
function removeFile(i) { files.splice(i, 1); renderP(); document.getElementById('go').disabled = files.length === 0; }
function renderP() {
  const g = document.getElementById('pg'); g.innerHTML = '';
  files.forEach((f, i) => {
    const u = URL.createObjectURL(f), d = document.createElement('div');
    d.className = 'pi';
    d.innerHTML = `<img src="${u}"/><button class="pr" onclick="removeFile(${i})">✕</button>`;
    g.appendChild(d);
  });
  document.getElementById('pc').textContent = files.length ? `${files.length}/10 immagini` : '';
}
function showErr(m) { const e = document.getElementById('em'); e.textContent = m; e.style.display = 'block'; }
function hideErr() { document.getElementById('em').style.display = 'none'; }

/* ── Resize immagini ── */
function resEnc(file, max = 640) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * sc), h = Math.round(img.height * sc);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.82).split(',')[1]);
    };
    img.onerror = () => rej(new Error('Errore lettura immagine'));
    img.src = url;
  });
}

/* ── Copy ── */
function cp(id, btn) {
  navigator.clipboard.writeText(document.getElementById(id).textContent).then(() => {
    btn.textContent = 'copiato!'; btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'copia'; btn.classList.remove('ok'); }, 2000);
  });
}

/* ── Analyze ── */
async function analyze() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const model = getModel();
  if (!apiKey) { showErr('Inserisci la tua OpenRouter API Key.'); return; }
  if (model === 'custom' || !model) { showErr('Inserisci il modello personalizzato.'); return; }
  if (!files.length) { showErr("Carica almeno un'immagine."); return; }
  hideErr();
  const btn = document.getElementById('go');
  btn.disabled = true;
  btn.innerHTML = '<span class="sp"></span> Analisi in corso…';
  document.getElementById('results').style.display = 'none';

  const savedKey = (() => { try { return localStorage.getItem('lai_k'); } catch (_) { return null; } })();

  try {
    const imgs = await Promise.all(files.map(async f => {
      const b64 = await resEnc(f, 640);
      return { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } };
    }));

    const cond = getCondLabel();
    const taglia = getTagliaIT();
    const discount = getCondDiscount();
    const categoria = getCategoria();
    const isCloth = isClothingCat();
    const sottocat = getSottocategoria();
    const extra = getExtraInfo();

    const schedaCampi = isCloth
      ? `"Brand":"","Tipo":"","Colore":"","Materiale":"","Taglia IT":"${taglia === 'da identificare dalle foto' ? '[da foto]' : taglia}","Condizione":"${cond.split('(')[0].trim()}"`
      : `"Brand":"","Sottocategoria":"${sottocat || '[da foto]'}","Colore/Variante":"","Specifiche tecniche":"","Stato":"${cond.split('(')[0].trim()}"`;

    const tagliaLabel = isCloth ? 'Taglia IT' : 'Sottocategoria';
    const tagliaValore = isCloth ? taglia : (sottocat || 'da identificare dalle foto');
    const schedaTemplate = `{${schedaCampi}}`;
    const extraBlock = extra ? `\nINFO AGGIUNTIVE (verifica, completa, usa nell'annuncio):\n"${extra}"` : '';

    const prompt = `Esperto listing Vinted. Categoria: ${categoria}. Analizza TUTTE le immagini→JSON.

FISSO (non modificare):
- Condizione: ${cond}
- ${tagliaLabel}: ${tagliaValore}${extraBlock}

REGOLE:
1. t: ≤50 chars. ${isCloth ? 'Brand+tipo+taglia IT+keyword SEO' : 'Brand+modello+specifiche chiave'}. NO articoli iniziali.
2. it: 380-420 chars. Inizia "🤝 Prezzo trattabile!\n". ${isCloth ? 'Materiale, colore, stile, fit, punti forza, condizione' : 'Caratteristiche tecniche, stato, compatibilità, punti forza'}. Includi sempre ${tagliaLabel}. Usa info aggiuntive se presenti. NO hashtag.
3. en: 380-420 chars. Inizia "🤝 Price negotiable!\n". Stesso in inglese. Includi ${tagliaLabel}. NO hashtag.
4. ht: 7 hashtag IT+EN separati da spazio. Rilevanti per categoria e prodotto.
5. p.nMin/nMax: prezzo nuovo € (Amazon IT/sito brand, stima realistica).
   p.vMin=nMin×${discount} arrotonda €0.50, p.vMax=nMax×${discount} arrotonda €0.50.
   vMin<vMax, entrambi<nMin.
   p.note: cita fonte+€ e giustifica il prezzo Vinted in 1 frase.
6. s: usa ESATTAMENTE questo schema → ${schedaTemplate}

SOLO JSON VALIDO, zero markdown, zero testo extra:
{"t":"","it":"","en":"","ht":"","p":{"nMin":"€X","nMax":"€X","vMin":"€X","vMax":"€X","note":""},"s":${schedaTemplate}}`;

    const body = {
      model,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...imgs] }],
      temperature: 0.15,
      max_tokens: 900
    };

    const fetchR = async (url, opts, n = 3) => {
      for (let i = 1; i <= n; i++) {
        const r = await fetch(url, opts);
        if ((r.status === 429 || r.status === 503) && i < n) {
          const w = i * 10;
          btn.innerHTML = `<span class="sp"></span> Occupato, riprovo tra ${w}s…`;
          await new Promise(res => setTimeout(res, w * 1000));
          continue;
        }
        return r;
      }
    };

    const resp = await fetchR('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': location.href, 'X-Title': 'ListAI Vinted' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      if (resp.status === 401) throw new Error('API Key non valida — controlla su openrouter.ai/keys');
      if (resp.status === 429) throw new Error('Modello sovraccarico — prova un altro dal menu!');
      if (resp.status === 503) throw new Error('Modello non disponibile — prova un altro dal menu!');
      throw new Error(err?.error?.message || `Errore API (${resp.status})`);
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, '').replace(/^[^{]*/, '').replace(/[^}]*$/, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) { try { parsed = JSON.parse(match[0]); } catch { throw new Error('Risposta AI non valida. Riprova o cambia modello.'); } }
      else throw new Error('Risposta AI non valida. Riprova o cambia modello.');
    }

    if (!parsed.t || parsed.t.length > 50) parsed.t = (parsed.t || '').slice(0, 50);
    if (!parsed.it || parsed.it.length < 100) throw new Error('Descrizione IT incompleta. Riprova.');
    if (!parsed.en || parsed.en.length < 100) throw new Error('Descrizione EN incompleta. Riprova.');

    renderResults(parsed);
    if (apiKey !== savedKey) promptSave(apiKey);

  } catch (e) {
    showErr(e.message || 'Errore imprevisto.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> Analizza di nuovo`;
  }
}

/* ── Render ── */
function renderResults(d) {
  const t = d.t || '—';
  document.getElementById('seoTitle').textContent = t;
  const tl = document.getElementById('titleLen');
  tl.textContent = `${t.length}/50 caratteri${t.length > 50 ? ' ⚠️ troppo lungo' : ''}`;
  tl.style.color = t.length > 50 ? 'var(--wn)' : 'var(--ink3)';

  const it = d.it || '—', en = d.en || '—', ht = d.ht || '';
  const full = `${it}\n\n${en}${ht ? '\n\n' + ht : ''}`;
  document.getElementById('descFull').textContent = full;
  document.getElementById('descFullLen').textContent = `${full.length} caratteri totali`;
  document.getElementById('descIT').textContent = it;
  document.getElementById('descITLen').textContent = `${it.length} caratteri`;
  document.getElementById('descEN').textContent = en;
  document.getElementById('descENLen').textContent = `${en.length} characters`;

  const p = d.p || {};
  document.getElementById('pNMin').textContent = p.nMin || '—';
  document.getElementById('pNMax').textContent = p.nMax || '—';
  document.getElementById('pVMin').textContent = p.vMin || '—';
  document.getElementById('pVMax').textContent = p.vMax || '—';
  document.getElementById('priceNote').textContent = p.note || '—';

  const s = d.s || {};
  document.getElementById('detailTable').innerHTML =
    Object.entries(s).map(([k, v]) => `<tr><td>${k}</td><td>${v || '—'}</td></tr>`).join('');

  const r = document.getElementById('results');
  r.style.display = 'block';
  r.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
