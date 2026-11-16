const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle,
  ShadingType, TableLayoutType, ImageRun,
  convertMillimetersToTwip,
  Header, Footer, PageNumber,
  VerticalAlign
} = require('docx');

// ===== Config =====
const MD_PATH = path.resolve(__dirname, '../01-prd/观严代扣代缴product-prd.md');
const MD_DIR = path.dirname(MD_PATH);
const OUT_PATH = path.resolve(__dirname, '../01-prd/观严代扣代缴product-prd-v3.2.docx');

// ===== Color constants =====
const BLUE = '1890FF';
const DARK = '1F1F1F';
const GRAY = '666666';
const LIGHT_GRAY = '999999';
const TABLE_HEADER_BG = '5B9BD5';
const TABLE_HEADER_FG = 'FFFFFF';
const TABLE_ALT_BG = 'F2F7FC';
const RED = 'D4380D';

// ===== Read PNG dimensions from header =====
function getPngDimensions(buf) {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      return { width: w, height: h };
    }
  } catch (e) {}
  return null;
}

// ===== Resolve image path relative to MD file =====
function resolveImagePath(imgRelPath) {
  const fullPath = path.resolve(MD_DIR, imgRelPath);
  if (fs.existsSync(fullPath)) return fullPath;
  return null;
}

// ===== Create image paragraph =====
function createImageParagraph(imgPath) {
  try {
    const imgBuf = fs.readFileSync(imgPath);
    const dims = getPngDimensions(imgBuf);
    const MAX_W = 460;
    let w, h;
    if (dims && dims.width > 0 && dims.height > 0) {
      const scale = Math.min(MAX_W / dims.width, 1);
      w = Math.round(dims.width * scale);
      h = Math.round(dims.height * scale);
    } else {
      w = MAX_W;
      h = 300;
    }
    return new Paragraph({
      children: [new ImageRun({ data: imgBuf, transformation: { width: w, height: h } })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 }
    });
  } catch (e) {
    return null;
  }
}

// ===== Simple Markdown Parser =====
function parseMD(text) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === '') { i++; continue; }

    // Horizontal rule
    if (line.match(/^---+\s*$/)) { i++; continue; }

    // Headings
    const hMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (hMatch) {
      blocks.push({ type: 'heading', level: hMatch[1].length, text: hMatch[2].trim() });
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ') || line === '>') {
      const bqLines = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        bqLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', lines: bqLines });
      continue;
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines
        .filter(l => !l.match(/^\|[\s\-:|]+\|$/))
        .map(l => l.split('|').slice(1, -1).map(c => c.trim()));
      if (rows.length > 0) {
        blocks.push({ type: 'table', header: rows[0], body: rows.slice(1) });
      }
      continue;
    }

    // Unordered list
    if (line.match(/^\s*[-*]\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        listItems.push({ indent: (lines[i].match(/^(\s*)/)[0].length / 2), text: lines[i].replace(/^\s*[-*]\s+/, '') });
        i++;
      }
      blocks.push({ type: 'ulist', items: listItems });
      continue;
    }

    // Ordered list
    if (line.match(/^\s*\d+\.\s+/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        listItems.push({ indent: (lines[i].match(/^(\s*)/)[0].length / 2), text: lines[i].replace(/^\s*\d+\.\s+/, '') });
        i++;
      }
      blocks.push({ type: 'olist', items: listItems });
      continue;
    }

    // Paragraph
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^(#{1,4}\s|> |\||\s*[-*]\s+|\s*\d+\.\s+|---+)/)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n') });
    }
  }

  return blocks;
}

// ===== Parse simple inline (no images/links) =====
function parseSimpleInline(text, opts = {}) {
  const runs = [];
  const parts = text.split(/(`[^`]+`)/g);
  for (const part of parts) {
    const codeMatch = part.match(/^`(.+)`$/);
    if (codeMatch) {
      runs.push(new TextRun({ text: codeMatch[1], font: 'Consolas', size: 20, color: RED, shading: { type: ShadingType.SOLID, color: 'FFF5F5' }, ...opts }));
    } else if (part) {
      runs.push(new TextRun({ text: part, size: 21, font: 'Microsoft YaHei', color: DARK, ...opts }));
    }
  }
  return runs;
}

// ===== Parse inline markdown =====
// Groups: **bold** → [2], `code` → [3], [link](url) → [4]text [5]url, ![img](src) → [6]alt [7]src
function parseInline(text) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\)|!\[([^\]]*)\]\(([^)]+)\))/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      const before = text.slice(lastIdx, match.index);
      if (before) runs.push(...parseSimpleInline(before));
    }

    if (match[2] !== undefined) {
      // Bold
      runs.push(...parseSimpleInline(match[2], { bold: true }));
    } else if (match[3] !== undefined) {
      // Inline code
      runs.push(new TextRun({ text: match[3], font: 'Consolas', size: 20, color: RED, shading: { type: ShadingType.SOLID, color: 'FFF5F5' } }));
    } else if (match[6] !== undefined) {
      // Image — inline placeholder
      runs.push(new TextRun({ text: `[图片: ${match[6] || '图片'}]`, color: BLUE, italics: true, size: 20 }));
    } else if (match[4] !== undefined) {
      // Link
      runs.push(new TextRun({ text: match[4], color: BLUE, underline: { type: 'single' }, size: 21, font: 'Microsoft YaHei' }));
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    runs.push(...parseSimpleInline(text.slice(lastIdx)));
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: 21, font: 'Microsoft YaHei', color: DARK })];
}

// ===== Extract images from text, return { imageParagraphs[], textParagraphs[] } =====
function processBlockquoteLines(bqLines) {
  const imageParagraphs = [];
  const textParagraphs = [];
  let imageCount = 0;
  let imageMissing = 0;

  for (const bqLine of bqLines) {
    const trimmed = bqLine.trim();
    if (trimmed === '') continue;

    // Strip leading list marker
    const cleaned = trimmed.replace(/^[-*]\s+/, '');

    // Check for image
    const imgMatch = cleaned.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      const imgPath = resolveImagePath(imgMatch[2]);
      if (imgPath) {
        const imgPara = createImageParagraph(imgPath);
        if (imgPara) {
          imageParagraphs.push(imgPara);
          imageCount++;
        } else {
          textParagraphs.push(new Paragraph({
            children: [new TextRun({ text: `[图片加载失败: ${imgMatch[1]}]`, color: RED, size: 18, italics: true })],
            indent: { left: convertMillimetersToTwip(8) },
            border: { left: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
            spacing: { after: 60 }
          }));
        }
      } else {
        textParagraphs.push(new Paragraph({
          children: [new TextRun({ text: `[图片未找到: ${imgMatch[2]}]`, color: LIGHT_GRAY, size: 18, italics: true })],
          indent: { left: convertMillimetersToTwip(8) },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
          spacing: { after: 60 }
        }));
        imageMissing++;
      }

      // Check for text after the image
      const remaining = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/, '').trim();
      if (remaining) {
        const runs = parseInline(remaining);
        textParagraphs.push(new Paragraph({
          children: runs,
          indent: { left: convertMillimetersToTwip(8) },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
          spacing: { after: 60 }
        }));
      }
    } else {
      const runs = parseInline(cleaned);
      textParagraphs.push(new Paragraph({
        children: runs,
        indent: { left: convertMillimetersToTwip(8) },
        border: { left: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
        spacing: { after: 60 }
      }));
    }
  }

  return { imageParagraphs, textParagraphs, imageCount, imageMissing };
}

// ===== Build DOCX sections =====
function buildDocx(blocks) {
  const children = [];
  let totalImages = 0;
  let totalMissing = 0;

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const levelMap = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
        const sizeMap = { 1: 32, 2: 28, 3: 24, 4: 22 };
        const colorMap = { 1: BLUE, 2: DARK, 3: DARK, 4: GRAY };
        const plainText = block.text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1');
        children.push(new Paragraph({
          text: plainText,
          heading: levelMap[block.level],
          spacing: { before: block.level <= 2 ? 360 : 240, after: 120 },
          run: { size: sizeMap[block.level], bold: block.level <= 2, color: colorMap[block.level], font: 'Microsoft YaHei' }
        }));
        break;
      }

      case 'paragraph': {
        // Check if paragraph is just an image
        const imgMatch = block.text.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          const imgPath = resolveImagePath(imgMatch[2]);
          if (imgPath) {
            const imgPara = createImageParagraph(imgPath);
            if (imgPara) {
              children.push(imgPara);
              totalImages++;
              break;
            }
          }
          children.push(new Paragraph({
            children: [new TextRun({ text: `[图片未找到: ${imgMatch[2]}]`, color: LIGHT_GRAY, size: 18, italics: true })],
            spacing: { after: 60 }
          }));
          totalMissing++;
          break;
        }
        const runs = parseInline(block.text);
        children.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
        break;
      }

      case 'blockquote': {
        const { imageParagraphs, textParagraphs, imageCount, imageMissing } = processBlockquoteLines(block.lines);
        // Render text first (context/captions), then images
        children.push(...textParagraphs);
        children.push(...imageParagraphs);
        totalImages += imageCount;
        totalMissing += imageMissing;
        break;
      }

      case 'table': {
        const colCount = block.header.length;
        const colWidth = Math.floor(9000 / colCount);

        const headerRow = new TableRow({
          tableHeader: true,
          children: block.header.map(h => new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: h.replace(/\*\*(.+?)\*\*/g, '$1'), bold: true, color: TABLE_HEADER_FG, size: 20, font: 'Microsoft YaHei' })],
              alignment: AlignmentType.CENTER
            })],
            shading: { type: ShadingType.SOLID, color: TABLE_HEADER_BG },
            verticalAlign: VerticalAlign.CENTER,
            width: { size: colWidth, type: WidthType.DXA },
            margins: { top: 40, bottom: 40, left: 80, right: 80 }
          }))
        });

        const bodyRows = block.body.map((row, idx) => new TableRow({
          children: row.map(cell => new TableCell({
            children: [new Paragraph({ children: parseInline(cell), spacing: { before: 20, after: 20 } })],
            shading: idx % 2 === 1 ? { type: ShadingType.SOLID, color: TABLE_ALT_BG } : undefined,
            verticalAlign: VerticalAlign.CENTER,
            width: { size: colWidth, type: WidthType.DXA },
            margins: { top: 30, bottom: 30, left: 80, right: 80 }
          }))
        }));

        children.push(new Table({
          rows: [headerRow, ...bodyRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED
        }));

        children.push(new Paragraph({ spacing: { after: 120 } }));
        break;
      }

      case 'ulist': {
        for (const item of block.items) {
          const runs = parseInline(item.text);
          children.push(new Paragraph({
            children: [new TextRun({ text: '• ', size: 21, font: 'Microsoft YaHei' }), ...runs],
            indent: { left: convertMillimetersToTwip(6 + item.indent * 6), hanging: convertMillimetersToTwip(4) },
            spacing: { after: 40 }
          }));
        }
        break;
      }

      case 'olist': {
        for (let j = 0; j < block.items.length; j++) {
          const item = block.items[j];
          const runs = parseInline(item.text);
          children.push(new Paragraph({
            children: [new TextRun({ text: `${j + 1}. `, size: 21, font: 'Microsoft YaHei' }), ...runs],
            indent: { left: convertMillimetersToTwip(6 + item.indent * 6), hanging: convertMillimetersToTwip(4) },
            spacing: { after: 40 }
          }));
        }
        break;
      }
    }
  }

  return { children, totalImages, totalMissing };
}

// ===== Main =====
async function main() {
  console.log('Reading PRD markdown...');
  const md = fs.readFileSync(MD_PATH, 'utf8');

  console.log('Parsing markdown...');
  const blocks = parseMD(md);
  console.log(`Parsed ${blocks.length} blocks`);

  console.log('Building DOCX...');
  const { children, totalImages, totalMissing } = buildDocx(blocks);
  console.log(`Embedded ${totalImages} images, ${totalMissing} missing`);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Microsoft YaHei', size: 21, color: DARK }
        },
        heading1: { run: { font: 'Microsoft YaHei', size: 32, bold: true, color: BLUE } },
        heading2: { run: { font: 'Microsoft YaHei', size: 28, bold: true, color: DARK } },
        heading3: { run: { font: 'Microsoft YaHei', size: 24, bold: true, color: DARK } },
        heading4: { run: { font: 'Microsoft YaHei', size: 22, bold: true, color: GRAY } }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: { top: convertMillimetersToTwip(25), bottom: convertMillimetersToTwip(25), left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20) }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: '观严平台代扣代缴 PRD V3.1', color: LIGHT_GRAY, size: 16, font: 'Microsoft YaHei' })],
            alignment: AlignmentType.RIGHT
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: '机密文档 | 第 ', color: LIGHT_GRAY, size: 16 }),
              new TextRun({ children: [PageNumber.CURRENT], color: LIGHT_GRAY, size: 16 }),
              new TextRun({ text: ' 页', color: LIGHT_GRAY, size: 16 })
            ],
            alignment: AlignmentType.CENTER
          })]
        })
      },
      children
    }]
  });

  console.log('Packing DOCX...');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_PATH, buffer);
  console.log(`Done! Output: ${OUT_PATH}`);
  console.log(`Size: ${(buffer.length / 1024).toFixed(0)} KB`);
}

main().catch(err => { console.error('Error:', err); console.error(err.stack); process.exit(1); });
