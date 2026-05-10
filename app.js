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
  if (v === 'custom') { const c = document.getElementById('customModel').value.trim(); return c || 'google/gemini-3.1-flash-lite'; }
  return v;
}

/* ── Lingue ── */
const LANG_MAP = {
  it: { name: 'Italiano',   flag: '🇮🇹', negotiable: '🤝 Prezzo trattabile!',      label: 'Italian'    },
  en: { name: 'English',    flag: '🇬🇧', negotiable: '🤝 Price negotiable!',        label: 'English'    },
  fr: { name: 'Français',   flag: '🇫🇷', negotiable: '🤝 Prix négociable!',         label: 'French'     },
  de: { name: 'Deutsch',    flag: '🇩🇪', negotiable: '🤝 Preis verhandelbar!',      label: 'German'     },
  es: { name: 'Español',    flag: '🇪🇸', negotiable: '🤝 Precio negociable!',       label: 'Spanish'    },
  pt: { name: 'Português',  flag: '🇵🇹', negotiable: '🤝 Preço negociável!',        label: 'Portuguese' },
  nl: { name: 'Nederlands', flag: '🇳🇱', negotiable: '🤝 Prijs bespreekbaar!',      label: 'Dutch'      },
  pl: { name: 'Polski',     flag: '🇵🇱', negotiable: '🤝 Cena do negocjacji!',      label: 'Polish'     },
  sv: { name: 'Svenska',    flag: '🇸🇪', negotiable: '🤝 Pris förhandlingsbart!',   label: 'Swedish'    },
  ro: { name: 'Română',     flag: '🇷🇴', negotiable: '🤝 Preț negociabil!',         label: 'Romanian'   },
};

let selectedLangs = ['it', 'en'];

function loadLangs() {
  try {
    const saved = localStorage.getItem('lai_langs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) selectedLangs = parsed;
    }
  } catch (_) {}
  renderLangTags();
}

function saveLangs() {
  try { localStorage.setItem('lai_langs', JSON.stringify(selectedLangs)); } catch (_) {}
}

function renderLangTags() {
  const container = document.getElementById('langTags');
  container.innerHTML = '';
  const canRemove = selectedLangs.length > 1;
  selectedLangs.forEach((code, i) => {
    const info = LANG_MAP[code] || { name: code, flag: '🌐' };
    const tag = document.createElement('span');
    tag.className = 'lang-tag';
    tag.innerHTML = info.flag + ' ' + info.name +
      (canRemove ? '<button class="lang-rm" onclick="removeLang(' + i + ')" title="Rimuovi ' + info.name + '">&#x2715;</button>' : '');
    container.appendChild(tag);
  });
  const addSel = document.getElementById('langAdd');
  if (addSel) {
    [...addSel.options].forEach(opt => {
      if (opt.value) opt.disabled = selectedLangs.includes(opt.value);
    });
  }
}

function addLangFromSelect() {
  const sel = document.getElementById('langAdd');
  const code = sel.value;
  if (!code || selectedLangs.includes(code)) { sel.value = ''; return; }
  selectedLangs.push(code);
  sel.value = '';
  saveLangs();
  renderLangTags();
}

function removeLang(index) {
  if (selectedLangs.length <= 1) return;
  selectedLangs.splice(index, 1);
  saveLangs();
  renderLangTags();
}

/* ── Categoria & Bambini ── */
const CLOTHING_CATS = ['donna', 'uomo', 'unisex', 'griffati'];

function isClothingCat() {
  const cat = document.getElementById('categoria').value;
  if (cat !== 'bambini') return CLOTHING_CATS.includes(cat);
  const bt = document.getElementById('bambiniTipo');
  return bt ? bt.value === 'vestiti' : false;
}

function onCategoriaChange() {
  const cat = document.getElementById('categoria').value;
  const isBambini = cat === 'bambini';
  document.getElementById('bambiniSub').classList.toggle('open', isBambini);
  if (!isBambini) {
    _showTagliaOrSottocat(CLOTHING_CATS.includes(cat));
  } else {
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
  if (!isClothingCat()) return document.getElementById('sottocatVal').value.trim() || 'da identificare dalle foto';
  const t = document.getElementById('tagliaTipo').value;
  if (t === 'unica') return 'Taglia Unica';
  if (t === 'photo') return 'da identificare dalle foto';
  if (t === 'na') return 'non applicabile';
  const cat = document.getElementById('catCapo').value;
  const val = document.getElementById('tagliaVal').value.trim();
  return cat + ' – taglia IT: ' + (val || '?');
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
    d.innerHTML = '<img src="' + u + '"/><button class="pr" onclick="removeFile(' + i + ')">&#x2715;</button>';
    g.appendChild(d);
  });
  document.getElementById('pc').textContent = files.length ? files.length + '/10 immagini' : '';
}
function showErr(m) { const e = document.getElementById('em'); e.textContent = m; e.style.display = 'block'; }
function hideErr() { document.getElementById('em').style.display = 'none'; }

/* ── Resize immagini ── */
function resEnc(file, max) {
  max = max || 640;
  return new Promise(function(res, rej) {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = function() {
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * sc), h = Math.round(img.height * sc);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.82).split(',')[1]);
    };
    img.onerror = function() { rej(new Error('Errore lettura immagine')); };
    img.src = url;
  });
}

/* ── Copy ── */
function cp(id, btn) {
  navigator.clipboard.writeText(document.getElementById(id).textContent).then(function() {
    btn.textContent = 'copiato!'; btn.classList.add('ok');
    setTimeout(function() { btn.textContent = 'copia'; btn.classList.remove('ok'); }, 2000);
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

  const savedKey = (function() { try { return localStorage.getItem('lai_k'); } catch (_) { return null; } })();

  try {
    const imgs = await Promise.all(files.map(async function(f) {
      const b64 = await resEnc(f, 640);
      return { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } };
    }));

    const cond = getCondLabel();
    const taglia = getTagliaIT();
    const discount = getCondDiscount();
    const categoria = getCategoria();
    const isCloth = isClothingCat();
    const sottocat = getSottocategoria();
    const extra = getExtraInfo();

    const schedaCampi = isCloth
      ? '"Brand":"","Tipo":"","Colore":"","Materiale":"","Taglia IT":"' + (taglia === 'da identificare dalle foto' ? '[da foto]' : taglia) + '","Condizione":"' + cond.split('(')[0].trim() + '"'
      : '"Brand":"","Sottocategoria":"' + (sottocat || '[da foto]') + '","Colore/Variante":"","Specifiche tecniche":"","Stato":"' + cond.split('(')[0].trim() + '"';

    const tagliaLabel = isCloth ? 'Taglia IT' : 'Sottocategoria';
    const tagliaValore = isCloth ? taglia : (sottocat || 'da identificare dalle foto');
    const schedaTemplate = '{' + schedaCampi + '}';
    const extraBlock = extra ? '\nINFO AGGIUNTIVE (verifica, completa, usa nell\'annuncio):\n"' + extra + '"' : '';

    /* Regole lingue dinamiche */
    const contentDesc = isCloth
      ? 'Materiale, colore, stile, fit, punti forza, condizione'
      : 'Caratteristiche tecniche, stato, compatibilità, punti forza';

    const langRules = selectedLangs.map(function(code, i) {
      const info = LANG_MAP[code] || { negotiable: '🤝 Price negotiable!', label: code };
      const ruleNum = i + 2;
      if (i === 0) {
        return ruleNum + '. langs.' + code + ': 380-420 chars. Lingua: ' + info.label + '. Inizia "' + info.negotiable + '\\n". ' + contentDesc + '. Includi ' + tagliaLabel + '.' + (extra ? ' Usa info aggiuntive.' : '') + ' NO hashtag.';
      }
      return ruleNum + '. langs.' + code + ': 380-420 chars. Lingua: ' + info.label + '. Inizia "' + info.negotiable + '\\n". Stessa descrizione tradotta, adattata. Includi ' + tagliaLabel + '. NO hashtag.';
    }).join('\n');

    const htRuleNum = selectedLangs.length + 2;
    const langJsonTemplate = selectedLangs.map(function(c) { return '"' + c + '":""'; }).join(',');
    const maxTokens = Math.max(1200, 700 + selectedLangs.length * 350);

    const prompt = 'Esperto listing Vinted. Categoria: ' + categoria + '. Analizza TUTTE le immagini→JSON.\n\nFISSO (non modificare):\n- Condizione: ' + cond + '\n- ' + tagliaLabel + ': ' + tagliaValore + extraBlock + '\n\nREGOLE:\n1. t: ≤50 chars. ' + (isCloth ? 'Brand+tipo+taglia IT+keyword SEO' : 'Brand+modello+specifiche chiave') + '. NO articoli iniziali.\n' + langRules + '\n' + htRuleNum + '. ht: 7 hashtag separati da spazio. Rilevanti per categoria e prodotto. Mix di lingue.\n' + (htRuleNum + 1) + '. p.nMin/nMax: prezzo nuovo € (Amazon IT/sito brand, stima realistica).\n   p.vMin=nMin×' + discount + ' arrotonda €0.50, p.vMax=nMax×' + discount + ' arrotonda €0.50.\n   vMin<vMax, entrambi<nMin.\n   p.note: cita fonte+€ e giustifica il prezzo Vinted in 1 frase.\n' + (htRuleNum + 2) + '. s: usa ESATTAMENTE questo schema → ' + schedaTemplate + '\n\nSOLO JSON VALIDO, zero markdown, zero testo extra:\n{"t":"","langs":{' + langJsonTemplate + '},"ht":"","p":{"nMin":"€X","nMax":"€X","vMin":"€X","vMax":"€X","note":""},"s":' + schedaTemplate + '}';

    const body = {
      model: model,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }].concat(imgs) }],
      temperature: 0.15,
      max_tokens: maxTokens
    };

    async function fetchR(url, opts, n) {
      n = n || 3;
      for (let i = 1; i <= n; i++) {
        const r = await fetch(url, opts);
        if ((r.status === 429 || r.status === 503) && i < n) {
          const w = i * 10;
          btn.innerHTML = '<span class="sp"></span> Occupato, riprovo tra ' + w + 's…';
          await new Promise(function(res) { setTimeout(res, w * 1000); });
          continue;
        }
        return r;
      }
    }

    const resp = await fetchR('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey, 'HTTP-Referer': location.href, 'X-Title': 'ListAI Vinted' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(function() { return {}; });
      if (resp.status === 401) throw new Error('API Key non valida — controlla su openrouter.ai/keys');
      if (resp.status === 429) throw new Error('Modello sovraccarico — prova un altro dal menu!');
      if (resp.status === 503) throw new Error('Modello non disponibile — prova un altro dal menu!');
      throw new Error((err && err.error && err.error.message) || 'Errore API (' + resp.status + ')');
    }

    const data = await resp.json();
    const raw = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, '').replace(/^[^{]*/, '').replace(/[^}]*$/, '').trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (_) { throw new Error('Risposta AI non valida. Riprova o cambia modello.'); }
      } else {
        throw new Error('Risposta AI non valida. Riprova o cambia modello.');
      }
    }

    if (!parsed.t || parsed.t.length > 50) parsed.t = (parsed.t || '').slice(0, 50);

    if (!parsed.langs || typeof parsed.langs !== 'object') {
      throw new Error('Risposta AI non valida (langs mancante). Riprova o cambia modello.');
    }
    for (let ci = 0; ci < selectedLangs.length; ci++) {
      const code = selectedLangs[ci];
      const desc = parsed.langs[code];
      if (!desc || desc.length < 100) {
        const langName = (LANG_MAP[code] || { name: code }).name;
        throw new Error('Descrizione ' + langName + ' incompleta. Riprova.');
      }
    }

    renderResults(parsed);
    if (apiKey !== savedKey) promptSave(apiKey);

  } catch (e) {
    showErr(e.message || 'Errore imprevisto.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> Analizza di nuovo';
  }
}

/* ── Helpers ── */
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseEuro(s) {
  if (!s || s === '—') return null;
  var n = parseFloat(String(s).replace(/[€\s]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

function fmtEuro(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  var r = Math.round(n * 2) / 2;
  return '€' + (r % 1 === 0 ? r.toFixed(0) : r.toFixed(2));
}

/* ── Render ── */
function renderResults(d, skipHistory) {
  /* Titolo SEO */
  var t = d.t || '—';
  document.getElementById('seoTitle').textContent = t;
  var tl = document.getElementById('titleLen');
  tl.textContent = t.length + '/50 caratteri' + (t.length > 50 ? ' ⚠️ troppo lungo' : '');
  tl.style.color = t.length > 50 ? 'var(--wn)' : 'var(--ink3)';

  /* Descrizioni */
  var langs = d.langs || {};
  var ht = d.ht || '';
  var parts = selectedLangs.map(function(code) { return langs[code] || ''; }).filter(Boolean);
  var full = parts.join('\n\n') + (ht ? '\n\n' + ht : '');
  document.getElementById('descFull').textContent = full;
  document.getElementById('descFullLen').textContent = full.length + ' caratteri totali';

  /* Schede per singola lingua */
  var langGrid = document.getElementById('descLangCards');
  langGrid.innerHTML = '';
  selectedLangs.forEach(function(code) {
    var info = LANG_MAP[code] || { flag: '🌐', name: code };
    var text = langs[code] || '—';
    var elId = 'descLang_' + code;
    var card = document.createElement('div');
    card.className = 'dc';
    card.innerHTML =
      '<div class="clbl">' + info.flag + ' ' + escHtml(info.name) +
      ' <span style="font-weight:400;text-transform:none;letter-spacing:0">(senza hashtag)</span>' +
      '<button class="cpbtn" onclick="cp(\'' + elId + '\',this)">copia</button></div>' +
      '<div class="dtxt" id="' + elId + '">' + escHtml(text) + '</div>' +
      '<div class="dlen">' + (text === '—' ? '' : text.length + ' caratteri') + '</div>';
    langGrid.appendChild(card);
  });

  /* Prezzi */
  var p = d.p || {};
  document.getElementById('pNMin').textContent = p.nMin || '—';
  document.getElementById('pNMax').textContent = p.nMax || '—';
  document.getElementById('pVMin').textContent = p.vMin || '—';
  document.getElementById('pVMax').textContent = p.vMax || '—';

  /* Prezzi da pubblicare (margine trattativa +15%) */
  var NEGO_MARGIN = 0.15;
  var vMinN = parseEuro(p.vMin);
  var vMaxN = parseEuro(p.vMax);
  document.getElementById('pCMin').textContent = fmtEuro(vMinN !== null ? vMinN * (1 + NEGO_MARGIN) : null);
  document.getElementById('pCMax').textContent = fmtEuro(vMaxN !== null ? vMaxN * (1 + NEGO_MARGIN) : null);

  document.getElementById('priceNote').textContent = p.note || '—';

  /* Scheda prodotto */
  var s = d.s || {};
  document.getElementById('detailTable').innerHTML =
    Object.entries(s).map(function(kv) {
      return '<tr><td>' + escHtml(kv[0]) + '</td><td>' + escHtml(kv[1] || '—') + '</td></tr>';
    }).join('');

  var r = document.getElementById('results');
  r.style.display = 'block';
  r.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!skipHistory) saveToHistory(d);
}

/* ════════════════════════════════
   STORICO
   ════════════════════════════════ */
var HIST_KEY = 'lai_history';
var HIST_MAX = 50;

function loadHistory() {
  try {
    var raw = localStorage.getItem(HIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

function saveHistory(arr) {
  try { localStorage.setItem(HIST_KEY, JSON.stringify(arr)); } catch (_) {}
}

function saveToHistory(d) {
  var arr = loadHistory();
  var entry = {
    id: Date.now(),
    ts: new Date().toISOString(),
    title: d.t || '(senza titolo)',
    data: d
  };
  arr.unshift(entry);
  if (arr.length > HIST_MAX) arr = arr.slice(0, HIST_MAX);
  saveHistory(arr);
  renderHistoryList();
}

function clearHistory() {
  if (!confirm('Cancellare tutto lo storico delle ' + loadHistory().length + ' analisi?')) return;
  saveHistory([]);
  renderHistoryList();
}

function deleteHistoryEntry(id) {
  var arr = loadHistory().filter(function(e) { return e.id !== id; });
  saveHistory(arr);
  renderHistoryList();
}

function loadHistoryEntry(id) {
  var arr = loadHistory();
  var entry = null;
  for (var i = 0; i < arr.length; i++) { if (arr[i].id === id) { entry = arr[i]; break; } }
  if (!entry) return;
  renderResults(entry.data, true);
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleHistory() {
  var body = document.getElementById('histBody');
  var arrow = document.getElementById('histArrow');
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  arrow.style.transform = open ? '' : 'rotate(180deg)';
}

function fmtDate(iso) {
  try {
    var d = new Date(iso);
    var day = String(d.getDate()).padStart(2, '0');
    var mon = String(d.getMonth() + 1).padStart(2, '0');
    var yr = d.getFullYear();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return day + '/' + mon + '/' + yr + ' ' + hh + ':' + mm;
  } catch (_) { return iso; }
}

function renderHistoryList() {
  var arr = loadHistory();
  var badge = document.getElementById('histBadge');
  var clearBtn = document.getElementById('histClearBtn');
  badge.textContent = arr.length;
  clearBtn.style.display = arr.length > 0 ? 'inline-flex' : 'none';

  var list = document.getElementById('histList');
  if (arr.length === 0) {
    list.innerHTML = '<div class="hist-empty">Nessuna analisi ancora — i risultati verranno salvati automaticamente qui.</div>';
    return;
  }

  list.innerHTML = arr.map(function(entry, idx) {
    var p = (entry.data && entry.data.p) || {};
    var vMin = p.vMin || '—';
    var vMax = p.vMax || '—';
    var priceStr = (vMin !== '—' || vMax !== '—') ? vMin + ' – ' + vMax : '';
    var firstLang = '';
    if (entry.data && entry.data.langs) {
      var codes = Object.keys(entry.data.langs);
      if (codes.length) firstLang = (entry.data.langs[codes[0]] || '').slice(0, 90);
      if (firstLang.length === 90) firstLang += '…';
    }
    return '<div class="hist-item" id="hitem_' + entry.id + '">' +
      '<div class="hist-item-head" onclick="toggleHistItem(' + entry.id + ')">' +
        '<div class="hist-item-info">' +
          '<span class="hist-num">' + (idx + 1) + '</span>' +
          '<div>' +
            '<div class="hist-item-title">' + escHtml(entry.title) + '</div>' +
            '<div class="hist-item-meta">' + fmtDate(entry.ts) + (priceStr ? ' · ' + escHtml(priceStr) : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="hist-item-actions" onclick="event.stopPropagation()">' +
          '<button class="hist-load-btn" onclick="loadHistoryEntry(' + entry.id + ')">📂 Carica</button>' +
          '<button class="hist-del-btn" onclick="deleteHistoryEntry(' + entry.id + ')">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="hist-item-body" id="hbody_' + entry.id + '" style="display:none">' +
        (firstLang ? '<div class="hist-preview">' + escHtml(firstLang) + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleHistItem(id) {
  var body = document.getElementById('hbody_' + id);
  if (!body) return;
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

/* ── Init ── */
loadLangs();
renderHistoryList();
