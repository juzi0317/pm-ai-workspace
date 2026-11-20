/**
 * Markdown → styled DOCX converter for 观严代扣代缴 PRD
 * Uses: marked (parser) + docx (generator)
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
        HeadingLevel, WidthType, BorderStyle, AlignmentType,
        ShadingType, TableLayoutType, convertInchesToTwip,
        Header, Footer, PageNumber, NumberFormat } = require('docx');

const srcPath = process.argv[2] || path.join(__dirname, '观严代扣代缴product-prd.md');
const srcDir = path.dirname(srcPath);
const outPath = process.argv[3] || srcPath.replace('.md', '.docx');
const md = fs.readFileSync(srcPath, 'utf8');

// ── Style constants ──
const F = '微软雅黑';
const FM = 'Consolas';
const C_BORDER = 'B4C6E7';
const C_HDR_BG = 'D9E2F3';
const C_ACCENT = '2F5496';
const C_TEXT = '1A1A1A';
const C_CODE_BG = 'F2F2F2';

const tB = { style: BorderStyle.SINGLE, size: 1, color: C_BORDER };
const cellB = { top: tB, bottom: tB, left: tB, right: tB };

// ── Run builder from marked inline tokens ──
function runsFromTokens(tokens, style) {
  if (!tokens) return [new TextRun({ text: ' ', font: F, size: 21, color: C_TEXT })];
  const s = Object.assign({ font: F, size: 21, color: C_TEXT }, style || {});
  const runs = [];
  for (const t of tokens) {
    if (t.type === 'text') {
      runs.push(new TextRun({ ...s, text: t.text }));
    } else if (t.type === 'strong') {
      runs.push(...runsFromTokens(t.tokens, { ...s, bold: true }));
    } else if (t.type === 'em') {
      runs.push(...runsFromTokens(t.tokens, { ...s, italics: true }));
    } else if (t.type === 'codespan') {
      runs.push(new TextRun({ text: t.text, font: FM, size: 20, color: 'C7254E', shading: { type: ShadingType.SOLID, color: C_CODE_BG } }));
    } else if (t.type === 'link') {
      runs.push(new TextRun({ text: t.text || t.href, ...s, color: '0563C1' }));
    } else if (t.type === 'br') {
      // handled by paragraph
    } else {
      runs.push(new TextRun({ ...s, text: t.raw || t.text || '' }));
    }
  }
  return runs.length ? runs : [new TextRun({ text: ' ', ...s })];
}

// ── Parse inline text (for table cells etc without token tree) ──
function runsFromText(text, style) {
  const s = Object.assign({ font: F, size: 21, color: C_TEXT }, style || {});
  const runs = [];
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))|([^*`\[]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) runs.push(new TextRun({ ...s, text: m[2], bold: true }));
    else if (m[3]) runs.push(new TextRun({ ...s, text: m[4], italics: true }));
    else if (m[5]) runs.push(new TextRun({ text: m[6], font: FM, size: 20, color: 'C7254E', shading: { type: ShadingType.SOLID, color: C_CODE_BG } }));
    else if (m[7]) runs.push(new TextRun({ ...s, text: m[8], color: '0563C1' }));
    else if (m[10]) runs.push(new TextRun({ ...s, text: m[10] }));
  }
  return runs.length ? runs : [new TextRun({ text: ' ', ...s })];
}

// ── Block converters ──
function convertHeading(t) {
  const sizes = { 1: 32, 2: 28, 3: 24, 4: 22, 5: 20 };
  const levels = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4, 5: HeadingLevel.HEADING_5 };
  const color = t.depth <= 2 ? C_ACCENT : C_TEXT;
  const runs = t.tokens ? runsFromTokens(t.tokens, { size: sizes[t.depth] || 20, bold: true, color }) : runsFromText(t.text, { size: sizes[t.depth] || 20, bold: true, color });
  return new Paragraph({ heading: levels[t.depth], children: runs, spacing: { before: t.depth <= 2 ? 240 : 160, after: 80 } });
}

function convertParagraph(t) {
  const runs = t.tokens ? runsFromTokens(t.tokens) : runsFromText(t.text || '');
  return new Paragraph({ children: runs, spacing: { before: 40, after: 40 } });
}

function convertTable(t) {
  const hRow = new TableRow({
    tableHeader: true,
    children: t.header.map(h => {
      const txt = (h.text || h).toString().trim();
      const runs = h.tokens ? runsFromTokens(h.tokens, { bold: true, color: C_ACCENT }) : runsFromText(txt, { bold: true, color: C_ACCENT });
      return new TableCell({ borders: cellB, shading: { type: ShadingType.SOLID, color: C_HDR_BG }, children: [new Paragraph({ children: runs, spacing: { before: 40, after: 40 } })] });
    }),
  });
  const dRows = t.rows.map(row => new TableRow({
    children: row.map(cell => {
      const txt = (cell.text || cell).toString().trim();
      const runs = cell.tokens ? runsFromTokens(cell.tokens) : runsFromText(txt);
      return new TableCell({ borders: cellB, children: [new Paragraph({ children: runs, spacing: { before: 30, after: 30 } })] });
    }),
  }));
  return new Table({ rows: [hRow, ...dRows], width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED });
}

function convertList(t, depth) {
  const items = [];
  for (const item of t.items) {
    const body = [];
    const nested = [];
    for (const tok of (item.tokens || [])) {
      if (tok.type === 'text') {
        body.push(...runsFromTokens(tok.tokens || [{ type: 'text', text: tok.text }]));
      } else if (tok.type === 'paragraph') {
        body.push(...runsFromTokens(tok.tokens || [{ type: 'text', text: tok.text }]));
      } else if (tok.type === 'list') {
        nested.push(convertList(tok, depth + 1));
      } else {
        body.push(...runsFromText(tok.text || tok.raw || ''));
      }
    }
    items.push(new Paragraph({
      children: body.length ? body : [new TextRun({ text: ' ', font: F, size: 21 })],
      bullet: t.ordered ? undefined : { level: depth },
      numbering: t.ordered ? { reference: `ol-${depth}`, level: depth } : undefined,
      spacing: { before: 20, after: 20 },
    }));
    if (nested.length) items.push(...nested.flat());
  }
  return items;
}

function convertCode(t) {
  return (t.text || '').split('\n').map(line => new Paragraph({
    children: [new TextRun({ text: line || ' ', font: FM, size: 18, color: '333333' })],
    shading: { type: ShadingType.SOLID, color: C_CODE_BG },
    spacing: { before: 0, after: 0, line: 260 },
    indent: { left: convertInchesToTwip(0.2) },
  }));
}

// ── Image handling ──
function convertImage(t) {
  const href = t.href || '';
  const imgPath = path.resolve(srcDir, href);
  if (!fs.existsSync(imgPath)) {
    return new Paragraph({ children: [new TextRun({ text: `[图片缺失: ${href}]`, font: F, size: 18, color: 'CC0000', italics: true })], spacing: { before: 60, after: 60 } });
  }
  const buf = fs.readFileSync(imgPath);
  // Determine dimensions: try reading PNG header for width/height, else use defaults
  let w = 500, h = 300;
  if (buf[0] === 0x89 && buf[1] === 0x50) { // PNG
    w = buf.readUInt32BE(16) || 500;
    h = buf.readUInt32BE(20) || 300;
  }
  // Scale to max 550px width
  const maxW = 550;
  if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new ImageRun({ data: buf, transformation: { width: w, height: h }, type: 'png' })],
    spacing: { before: 80, after: 80 },
  });
}

function convertBlockquote(t) {
  const items = [];
  for (const tok of (t.tokens || [])) {
    if (tok.type === 'paragraph') {
      // Check if paragraph contains an image token
      const imgTok = (tok.tokens || []).find(st => st.type === 'image');
      if (imgTok) {
        items.push(convertImage(imgTok));
      } else {
        const runs = runsFromTokens(tok.tokens, { color: '555555', italics: true });
        items.push(new Paragraph({ children: runs, indent: { left: convertInchesToTwip(0.4) }, border: { left: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 8 } }, spacing: { before: 40, after: 40 } }));
      }
    }
  }
  return items;
}

function convertToken(token) {
  switch (token.type) {
    case 'heading': return convertHeading(token);
    case 'paragraph': return convertParagraph(token);
    case 'table': return convertTable(token);
    case 'list': return convertList(token, 0);
    case 'code': return convertCode(token);
    case 'hr': return new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: '─'.repeat(50), color: 'CCCCCC', font: FM, size: 16 })] });
    case 'blockquote': return convertBlockquote(token);
    case 'html': {
      const text = (token.text || '').replace(/<[^>]+>/g, '').trim();
      if (!text) return null;
      return new Paragraph({ children: runsFromText(text), spacing: { before: 40, after: 40 } });
    }
    case 'image': return convertImage(token);
    default: return null;
  }
}

// ── Main ──
async function main() {
  const tokens = marked.lexer(md);
  const elements = [];
  for (const token of tokens) {
    const r = convertToken(token);
    if (r === null) continue;
    if (Array.isArray(r)) elements.push(...r);
    else elements.push(r);
  }

  const numbering = [];
  for (let d = 0; d < 5; d++) {
    numbering.push({ reference: `ol-${d}`, levels: [{ level: d, format: NumberFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START }] });
  }

  const doc = new Document({
    numbering: { config: numbering },
    styles: {
      default: {
        document: { run: { font: F, size: 21, color: C_TEXT }, paragraph: { spacing: { line: 360 } } },
        heading1: { run: { font: F, size: 32, bold: true, color: C_ACCENT } },
        heading2: { run: { font: F, size: 28, bold: true, color: C_ACCENT } },
        heading3: { run: { font: F, size: 24, bold: true, color: C_TEXT } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1) } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '观严代扣代缴产品PRD V3.7', font: F, size: 16, color: '999999' })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: '第 ', font: F, size: 16, color: '999999' }),
          new TextRun({ children: [PageNumber.CURRENT], font: F, size: 16, color: '999999' }),
          new TextRun({ text: ' 页', font: F, size: 16, color: '999999' }),
        ] })] }),
      },
      children: elements,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buf);
  console.log(`OK ${outPath} (${(buf.length/1024).toFixed(0)}KB, ${elements.length} elements)`);
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
