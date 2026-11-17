import { normaliseRefinementRotation } from './refinementRotation.js';
// Local, browser-only exports of the editable working copy.
// Deliberately excludes pointers, selection highlights, conversation, zoom and
// reference artwork. No request is sent to a service and no file is uploaded.
export const EXPORT_WIDTH = 690;
export const EXPORT_HEIGHT = EXPORT_WIDTH / 1.6;

const xml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const fmt = (value) => Number(value.toFixed(3));

export function refinementExportFilename(name, ext = 'png') {
  const stem = String(name || 'intenta-design').normalize('NFKD')
    .replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/[ _]+/g, '-').slice(0, 50);
  return `${stem || 'intenta-design'}-business-card.${ext === 'svg' ? 'svg' : 'png'}`;
}

function rawNodeFor(id, o, working) {
  if (o.visible === false) return '';
  const kind = o.kind || String(id).replace(/-copy-\d+$/, '');
  const x = fmt(clamp(o.x, 0, 100) * EXPORT_WIDTH / 100);
  const y = fmt(clamp(o.y, 0, 100) * EXPORT_HEIGHT / 100);
  const size = fmt(clamp(o.size, 1, 2000));
  const color = xml(o.color || working.foreground || '#111111');
  if (kind === 'divider' || o.shape === 'line') {
    return `<line x1="${x}" y1="${y}" x2="${fmt(x + size)}" y2="${y}" stroke="${color}" stroke-width="2.967"/>`;
  }
  if (kind === 'decorations' || ['circle', 'leaf', 'stripe'].includes(o.shape)) {
    if (o.shape === 'circle') return `<circle cx="${x}" cy="${y}" r="${fmt(size / 2)}" fill="${color}" opacity=".64"/>`;
    if (o.shape === 'leaf') {
      const w = size, h = size * 1.263;
      // Approximate CSS leaf border radii with a soft asymmetric leaf path.
      const path = `M ${fmt(x - w * .4)} ${fmt(y + h * .46)} C ${fmt(x - w * .55)} ${fmt(y - h * .25)}, ${fmt(x + w * .16)} ${fmt(y - h * .55)}, ${fmt(x + w * .48)} ${fmt(y - h * .49)} C ${fmt(x + w * .51)} ${fmt(y + h * .08)}, ${fmt(x + w * .19)} ${fmt(y + h * .46)}, ${fmt(x - w * .4)} ${fmt(y + h * .46)} Z`;
      return `<path d="${path}" fill="${color}" opacity=".48" transform="rotate(-25 ${x} ${y})"/>`;
    }
    return `<rect x="${fmt(x - size / 2)}" y="0" width="${size}" height="${EXPORT_HEIGHT}" fill="${color}" opacity=".85"/>`;
  }
  // Render built-in decorative glyphs as vector geometry rather than relying
  // on device fonts. This also makes PNG export consistent across platforms.
  if (kind === 'mark') {
    const glyph = String(o.text || '');
    const shapeSize = size * 0.72;
    const left = x - shapeSize;
    const top = y + size * 0.08;
    if (glyph === '◩') {
      return `<rect x="${fmt(left)}" y="${fmt(top)}" width="${fmt(shapeSize)}" height="${fmt(shapeSize)}" stroke="${color}" stroke-width="2.7" fill="none"/>` +
        `<path d="M ${fmt(left)} ${fmt(top + shapeSize)} L ${fmt(left)} ${fmt(top)} L ${fmt(left + shapeSize)} ${fmt(top + shapeSize)} Z" fill="${color}"/>`;
    }
    if (glyph === '✦') {
      const cx = x - shapeSize / 2, cy = top + shapeSize / 2, r = shapeSize / 2, r2 = r * .19;
      return `<polygon points="${fmt(cx)},${fmt(cy-r)} ${fmt(cx+r2)},${fmt(cy-r2)} ${fmt(cx+r)},${fmt(cy)} ${fmt(cx+r2)},${fmt(cy+r2)} ${fmt(cx)},${fmt(cy+r)} ${fmt(cx-r2)},${fmt(cy+r2)} ${fmt(cx-r)},${fmt(cy)} ${fmt(cx-r2)},${fmt(cy-r2)}" fill="${color}"/>`;
    }
    if (glyph === '✳') {
      const cx = x - shapeSize / 2, cy = top + shapeSize / 2, r = shapeSize * .39;
      return `<g stroke="${color}" stroke-width="${fmt(Math.max(2, shapeSize * .095))}" stroke-linecap="round">` +
        Array.from({ length: 8 }, (_, i) => {
          const a = i * Math.PI / 4;
          return `<line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(cx + Math.cos(a) * r)}" y2="${fmt(cy + Math.sin(a) * r)}"/>`;
        }).join('') + '</g>';
    }
  }
  const serif = working.typography === 'serif';
  const font = serif ? 'Georgia, Times New Roman, serif' : 'Arial, Helvetica, sans-serif';
  const weight = kind === 'logo' ? (working.styleId === 'minimal' ? 800 : 700) : kind === 'name' ? 700 : kind === 'mark' ? 500 : 400;
  const tracking = kind === 'logo' ? (working.styleId === 'minimal' ? size * .07 : -size * .03)
    : kind === 'name' ? size * .09 : kind === 'job' ? size * .055 : 0;
  const right = (working.layout === 'dynamic' && ['name', 'job'].includes(kind)) || kind === 'mark';
  const anchor = right ? 'end' : 'start';
  const baseline = kind === 'mark' ? 'hanging' : 'middle';
  const italic = kind === 'logo' && working.styleId === 'expressive';
  return `<text x="${x}" y="${y}" font-family="${xml(font)}" font-size="${size}" font-weight="${weight}"` +
    ` text-anchor="${anchor}" dominant-baseline="${baseline}"` + (tracking ? ` letter-spacing="${fmt(tracking)}"` : '') +
    (italic ? ' font-style="italic"' : '') + ` fill="${color}">${xml(o.text || '')}</text>`;
}

function nodeFor(id, o, working) {
  const node = rawNodeFor(id, o, working);
  const angle = normaliseRefinementRotation(o.rotation);
  if (!node || !angle) return node;
  const x = fmt(clamp(o.x, 0, 100) * EXPORT_WIDTH / 100);
  const y = fmt(clamp(o.y, 0, 100) * EXPORT_HEIGHT / 100);
  return `<g transform="rotate(${angle} ${x} ${y})">${node}</g>`;
}

export function buildRefinementSvg(working) {
  if (!working?.objects) throw new Error('There is no editable design to export.');
  const background = xml(working.background || '#ffffff');
  const order = Object.entries(working.objects).sort(([idA, a], [idB, b]) => {
    const type = (id, o) => o.kind || String(id).replace(/-copy-\d+$/, '');
    const priority = (id, o) => type(id, o) === 'decorations' ? 0 : type(id, o) === 'divider' ? 1 : type(id, o) === 'mark' ? 3 : 2;
    return priority(idA, a) - priority(idB, b);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}">` +
    `<title>Intenta business card</title><defs><clipPath id="intenta-clip"><rect width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}"/></clipPath></defs>` +
    `<rect width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" fill="${background}"/>` +
    `<g clip-path="url(#intenta-clip)">${order.map(([id, o]) => nodeFor(id, o, working)).join('')}</g></svg>`;
}

function saveBrowserBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Defer revocation long enough for Chrome to begin the local download.
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function exportRefinementSvg(working, projectName) {
  saveBrowserBlob(new Blob([buildRefinementSvg(working)], { type: 'image/svg+xml;charset=utf-8' }), refinementExportFilename(projectName, 'svg'));
}

export async function exportRefinementPng(working, projectName, scale = 2) {
  const svgBlob = new Blob([buildRefinementSvg(working)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('The card could not be rendered as PNG. Try SVG export.'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(EXPORT_WIDTH * scale);
    canvas.height = Math.round(EXPORT_HEIGHT * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('PNG export is not supported by this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve, reject) => canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('PNG encoding failed. Try SVG export.'));
    }, 'image/png'));
    saveBrowserBlob(blob, refinementExportFilename(projectName, 'png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
