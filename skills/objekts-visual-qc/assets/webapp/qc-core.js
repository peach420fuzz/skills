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

export function checkFile(file, dimensions, rules = DEFAULTS) {
  const issues = [];
  if (!ALLOWED.has(file.type)) issues.push('Неподдерживаемый формат');
  if (file.size <= 0) issues.push('Пустой файл');
  if (file.size > rules.maxBytes) issues.push('Размер превышает лимит');
  if (!dimensions) issues.push('Не удалось прочитать изображение');
  else {
    if (dimensions.width < rules.minWidth || dimensions.height < rules.minHeight) issues.push('Разрешение ниже ориентира');
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
