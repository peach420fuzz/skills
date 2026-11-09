/* OBJEKTS Visual QC — deterministic local preflight helpers, MIT License. */
export const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const DEFAULTS = Object.freeze({ minWidth: 700, minHeight: 933, maxBytes: 10 * 1024 * 1024 });

export function parseFileName(name) {
  const stem = name.replace(/\.[^.]+$/, '');
  const split = stem.split('__');
  if (split.length < 2 || !split[0].trim() || !split[1].trim()) return { sku: stem, view: null, grouped: false };
  return { sku: split[0].trim(), view: split.slice(1).join('__').trim().toLowerCase(), grouped: true };
}

export function normalizeViews(raw) {
  return [...new Set(String(raw || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean))];
}

// Identification only: full decoding remains mandatory in app.js.
export function signatureMime(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || 0);
  const matches = (offset, values) => values.every((v, i) => b[offset + i] === v);
  if (b.length >= 8 && matches(0, [137, 80, 78, 71, 13, 10, 26, 10])) return 'image/png';
  if (b.length >= 3 && matches(0, [255, 216, 255])) return 'image/jpeg';
  if (b.length >= 16 && matches(0, [82, 73, 70, 70]) && matches(8, [87, 69, 66, 80]) &&
      (matches(12, [86, 80, 56, 32]) || matches(12, [86, 80, 56, 76]) || matches(12, [86, 80, 56, 88]))) return 'image/webp';
  return '';
}

export function checkFile(file, dimensions, rules = DEFAULTS, header = null) {
  const issues = [];
  const type = String(file.type || '').toLowerCase();
  const actual = signatureMime(header);
  const ext = String(file.name || '').split('.').pop().toLowerCase();
  const expected = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext];
  if (type && !ALLOWED.has(type)) issues.push('Неподдерживаемый формат');
  if (!actual) issues.push('Не удалось подтвердить формат по содержимому файла');
  if (!expected) issues.push('Неподдерживаемое расширение файла');
  if (actual && ((type && type !== actual) || (expected && expected !== actual))) {
    issues.push('Содержимое файла не совпадает с расширением или MIME-типом');
  }
  if (file.size <= 0) issues.push('Пустой файл');
  if (file.size > rules.maxBytes) issues.push('Размер превышает лимит');
  if (!dimensions) issues.push('Не удалось прочитать изображение');
  else if (dimensions.width < rules.minWidth || dimensions.height < rules.minHeight) {
    issues.push('Разрешение ниже ориентира');
  }
  return issues;
}

export function evaluateEntries(entries, requiredViews = []) {
  const groups = new Map();
  const hashFirst = new Map();
  const output = [];
  for (const e of entries) {
    const parsed = parseFileName(e.name);
    const issues = [...(e.issues || [])];
    if (!parsed.grouped && requiredViews.length) issues.push('Имя без схемы SKU__ракурс');
    if (e.sha256) {
      if (hashFirst.has(e.sha256)) issues.push(`Полный дубликат: ${hashFirst.get(e.sha256)}`);
      else hashFirst.set(e.sha256, e.name);
    }
    const row = { ...e, sku: parsed.sku, view: parsed.view, grouped: parsed.grouped, issues };
    output.push(row);
    if (!groups.has(parsed.sku)) groups.set(parsed.sku, []);
    groups.get(parsed.sku).push(row);
  }
  // Mark every ambiguous version, not only the last file in upload order.
  const byView = new Map();
  for (const row of output) {
    if (!row.grouped) continue;
    const key = JSON.stringify([row.sku, row.view]);
    if (!byView.has(key)) byView.set(key, []);
    byView.get(key).push(row);
  }
  for (const rows of byView.values()) {
    if (rows.length < 2) continue;
    const known = rows.every(row => Boolean(row.sha256));
    if (known && new Set(rows.map(row => row.sha256)).size === 1) continue;
    const note = 'Несколько версий одного ракурса: выберите утверждённый файл';
    for (const row of rows) row.issues.push(note);
  }
  const missing = [];
  if (requiredViews.length) {
    for (const [sku, rows] of groups) {
      const got = new Set(rows.map(r => r.view).filter(Boolean));
      const absent = requiredViews.filter(v => !got.has(v));
      if (absent.length) missing.push({ sku, absent });
    }
  }
  const failures = output.filter(x => x.issues.length).length;
  return {
    files: output,
    groups: groups.size,
    missing,
    stats: { total: output.length, issues: failures, clean: output.length - failures, missingSku: missing.length },
    caveat: 'Техническая проверка. Не оценивает соответствие товара, цвет, посадку, дефекты генерации или решение модератора.'
  };
}

export function csvEscape(value) {
  const s = String(value ?? '');
  const guarded = /^[=+@\-\t\r]/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(guarded) ? `"${guarded.replaceAll('"', '""')}"` : guarded;
}

export function reportCSV(report) {
  const lines = [['Файл', 'SKU', 'Ракурс', 'Ширина', 'Высота', 'Байт', 'Статус', 'Проблемы']];
  for (const r of report.files) lines.push([r.name, r.sku, r.view || '', r.width ?? '', r.height ?? '', r.size, r.issues.length ? 'Проверить' : 'Технически OK', r.issues.join('; ')]);
  for (const g of report.missing) lines.push(['', g.sku, '', '', '', '', 'Нет ракурсов', g.absent.join(', ')]);
  return '\ufeff' + lines.map(row => row.map(csvEscape).join(',')).join('\r\n');
}
