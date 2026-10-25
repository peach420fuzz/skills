import { ALLOWED, DEFAULTS, checkFile, evaluateEntries, normalizeViews, reportCSV } from './qc-core.js';

const $ = selector => document.querySelector(selector);
const $input = $('#files');
const $drop = $('#drop');
const $run = $('#run');
const $export = $('#export');
const $clear = $('#clear');
const $status = $('#status');
const $results = $('#results');
const $summary = $('#summary');
const $table = $('#result-rows');
const $missing = $('#missing');
let selected = [];
let report = null;
const maxFiles = 200;

function say(message, kind = '') { $status.textContent = message; $status.dataset.kind = kind; }
function formatSize(n) { return (n / 1024 / 1024).toFixed(2) + ' МБ'; }
function setFiles(files) {
  selected = [...files].slice(0, maxFiles);
  if (files.length > maxFiles) say(`Добавлено только ${maxFiles} файлов. Разбейте пакет на части.`, 'warning');
  else say(selected.length ? `Выбрано файлов: ${selected.length}. Они останутся в вашем браузере.` : 'Файлы не выбраны.');
  $run.disabled = selected.length === 0;
  $results.hidden = true;
  $export.disabled = true;
  report = null;
}

$input.addEventListener('change', () => setFiles($input.files));
for (const type of ['dragenter', 'dragover']) $drop.addEventListener(type, e => { e.preventDefault(); $drop.classList.add('drag'); });
for (const type of ['dragleave', 'drop']) $drop.addEventListener(type, e => { e.preventDefault(); $drop.classList.remove('drag'); });
$drop.addEventListener('drop', e => { if (e.dataTransfer?.files?.length) setFiles(e.dataTransfer.files); });
$clear.addEventListener('click', () => { $input.value = ''; setFiles([]); $table.replaceChildren(); $missing.replaceChildren(); });

async function dimensions(file) {
  if (!ALLOWED.has(file.type) || !file.size) return null;
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Не удалось прочитать изображение'));
      img.src = url;
    });
  } catch { return null; }
  finally { URL.revokeObjectURL(url); }
}

async function digest(file) {
  if (!globalThis.crypto?.subtle) return '';
  try {
    const bytes = await file.arrayBuffer();
    const buffer = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(buffer)].map(v => v.toString(16).padStart(2, '0')).join('');
  } catch { return ''; }
}

function td(text, cls = '') { const cell = document.createElement('td'); cell.textContent = String(text); if (cls) cell.className = cls; return cell; }
function render(result) {
  $results.hidden = false;
  $summary.textContent = `${result.stats.total} файлов · ${result.groups} групп SKU · ${result.stats.issues} файлов с замечаниями · ${result.stats.missingSku} неполных групп`;
  $table.replaceChildren();
  for (const r of result.files) {
    const tr = document.createElement('tr');
    tr.append(td(r.name), td(r.sku), td(r.view || '—'), td(r.width && r.height ? `${r.width}×${r.height}` : '—'), td(formatSize(r.size)), td(r.issues.length ? r.issues.join(' · ') : 'Технически OK', r.issues.length ? 'problem' : 'pass'));
    $table.append(tr);
  }
  $missing.replaceChildren();
  if (result.missing.length) {
    const title = document.createElement('p'); title.textContent = 'Недостающие ракурсы:'; $missing.append(title);
    const ul = document.createElement('ul');
    for (const group of result.missing) { const li = document.createElement('li'); li.textContent = `${group.sku}: ${group.absent.join(', ')}`; ul.append(li); }
    $missing.append(ul);
  }
  $export.disabled = false;
  $results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$run.addEventListener('click', async () => {
  if (!selected.length) return;
  $run.disabled = true;
  say('Проверка выполняется локально. Это может занять время для больших пакетов.');
  const rules = {
    minWidth: Number($('#min-width').value) || DEFAULTS.minWidth,
    minHeight: Number($('#min-height').value) || DEFAULTS.minHeight,
    maxBytes: (Number($('#max-mb').value) || 10) * 1024 * 1024
  };
  const entries = [];
  try {
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      const d = await dimensions(file);
      const issues = checkFile(file, d, rules);
      const sha256 = await digest(file);
      entries.push({ name: file.name, size: file.size, type: file.type, width: d?.width ?? null, height: d?.height ?? null, sha256, issues });
      if (i % 5 === 0) { say(`Проверено ${i + 1} из ${selected.length} файлов…`); await new Promise(resolve => setTimeout(resolve, 0)); }
    }
    report = evaluateEntries(entries, normalizeViews($('#views').value));
    render(report);
    say(`Готово. ${report.stats.clean} файлов прошли технические проверки; ${report.stats.issues} требуют внимания.`, 'success');
  } catch (error) { say('Проверка прервана: ' + (error?.message || 'неизвестная ошибка'), 'error'); }
  finally { $run.disabled = selected.length === 0; }
});

$export.addEventListener('click', () => {
  if (!report) return;
  const blob = new Blob([reportCSV(report)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'objekts-visual-qc-report.csv';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});

setFiles([]);
