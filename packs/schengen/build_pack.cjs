/**
 * แพ็กวีซ่าเชงเก้น (ฮักฝรั่ง) — Gumroad pack builder.
 * Generates the branded reference guide + four fill-in templates as .docx.
 *
 * Facts (insurance €30k, 90/180 rule, passport validity, multi-entry cascade)
 * mirror the free article and are dated LAST_VERIFIED — the guide shows it and
 * tells the buyer to re-check with the consulate. Run: node build_pack.cjs
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, PageNumber, Header, Footer, PageBreak,
} = require("docx");

const OUT = path.join(__dirname, "dist");
fs.mkdirSync(OUT, { recursive: true });

const LAST_VERIFIED = "25 กรกฎาคม 2569 (2026-07-25)";
const FONT = "Tahoma"; // renders Thai + Latin reliably on Windows & Mac

// brand palette (hex, no #)
const MARIGOLD = "E4941F";
const NAGA = "175248";
const NAGA_DARK = "124038";
const INK = "2A2320";
const INK_SOFT = "5C5148";
const GOLD_BG = "FCEBC5";
const CREAM_BG = "FBF6EC";
const NAGA_BG = "E8F2F0";

// ---- inline helpers -------------------------------------------------------
const run = (text, o = {}) =>
  new TextRun({ text, font: FONT, size: o.size || 24, color: o.color || INK,
    bold: o.bold, italics: o.italics, highlight: o.highlight });

// a [FILL IN] placeholder — highlighted so it's easy to spot
const fill = (text) =>
  new TextRun({ text: `[${text}]`, font: FONT, size: 24, bold: true, color: "9C5C0E", highlight: "yellow" });

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 320, after: 140 },
  children: [run(text, { size: 34, bold: true, color: NAGA_DARK })],
});
const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 100 },
  children: [run(text, { size: 28, bold: true, color: NAGA })],
});
const P = (children, o = {}) => new Paragraph({
  spacing: { after: o.after != null ? o.after : 120, line: 300 },
  alignment: o.align, indent: o.indent,
  children: Array.isArray(children) ? children : [run(children, o)],
});
const bullet = (children) => new Paragraph({
  numbering: { reference: "bul", level: 0 },
  spacing: { after: 60, line: 290 },
  children: Array.isArray(children) ? children : [run(children)],
});
const check = (text) => new Paragraph({
  spacing: { after: 70, line: 300 },
  indent: { left: 260, hanging: 260 },
  children: [run("☐  ", { size: 26, color: MARIGOLD }), run(text)],
});
const spacer = (h = 80) => new Paragraph({ spacing: { after: h }, children: [run("")] });

// a soft callout box (single-cell shaded table)
const callout = (lines, bg = GOLD_BG) => new Table({
  width: { size: 9740, type: WidthType.DXA },
  columnWidths: [9740],
  borders: noBorders("F2D488"),
  rows: [new TableRow({ children: [new TableCell({
    width: { size: 9740, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: bg },
    margins: { top: 140, bottom: 140, left: 200, right: 200 },
    children: lines.map((l) => new Paragraph({
      spacing: { after: 40, line: 290 },
      children: Array.isArray(l) ? l : [run(l, { size: 22 })],
    })),
  })] })],
});

function noBorders(color) {
  const s = { style: BorderStyle.SINGLE, size: 6, color };
  return { top: s, bottom: s, left: s, right: s,
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E7DFCB" },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E7DFCB" } };
}
function tblBorders(color = "D9CFB6") {
  const s = { style: BorderStyle.SINGLE, size: 4, color };
  return { top: s, bottom: s, left: s, right: s, insideHorizontal: s, insideVertical: s };
}
const cell = (children, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill } : undefined,
  margins: { top: 70, bottom: 70, left: 120, right: 120 },
  verticalAlign: "center",
  children: (Array.isArray(children) ? children : [children]).map((c) =>
    typeof c === "string"
      ? new Paragraph({ children: [run(c, { size: 22, bold: o.bold, color: o.color })] })
      : c),
});

const numbering = {
  config: [{
    reference: "bul",
    levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
      alignment: AlignmentType.LEFT,
      style: { run: { color: MARIGOLD }, paragraph: { indent: { left: 460, hanging: 240 } } } }],
  }],
};

const baseStyles = {
  default: {
    document: { run: { font: FONT, size: 24, color: INK }, paragraph: { spacing: { line: 300 } } },
  },
};

// build one Document (optionally branded header/footer)
function makeDoc(children, opts = {}) {
  const section = {
    properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    children,
  };
  if (opts.branded) {
    section.headers = { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT, spacing: { after: 0 },
      children: [run("๙  ฮักฝรั่ง · hakfarang.net", { size: 18, color: MARIGOLD, bold: true })],
    })] }) };
    section.footers = { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 60 },
      children: [
        run("แพ็กวีซ่าเชงเก้น · หน้า ", { size: 18, color: INK_SOFT }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: INK_SOFT }),
      ],
    })] }) };
  }
  return new Document({ styles: baseStyles, numbering, sections: [section] });
}

async function write(name, doc) {
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log("  wrote", name);
}

// ===========================================================================
// FILE A — the branded reference guide
// ===========================================================================
function guide() {
  const c = [];
  // cover
  c.push(new Paragraph({ spacing: { before: 1200, after: 0 }, alignment: AlignmentType.CENTER,
    children: [run("๙", { size: 60, color: MARIGOLD, bold: true })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 },
    children: [run("แพ็กวีซ่าเชงเก้น", { size: 56, bold: true, color: NAGA_DARK })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [run("ให้แฟนฝรั่งเป็นสปอนเซอร์ · ฉบับกรอกได้ พร้อมยื่น", { size: 26, color: INK_SOFT })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [run("Schengen Visa Pack — with your farang partner as sponsor", { size: 20, italics: true, color: INK_SOFT })] }));
  c.push(spacer(240));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER,
    children: [run("พี่สาวที่ผ่านมาก่อน · ฮักฝรั่ง · hakfarang.net", { size: 22, color: MARIGOLD, bold: true })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 },
    children: [run("ตรวจสอบข้อมูลล่าสุด: " + LAST_VERIFIED, { size: 18, color: INK_SOFT })] }));
  c.push(new Paragraph({ children: [new PageBreak()] }));

  // how to use
  c.push(H1("อ่านก่อนเน้อ — แพ็กนี้มีอะไรบ้าง"));
  c.push(P("แพ็กนี้คือ “ตัวช่วยความสะดวก” — บทความในเว็บฮักฝรั่งบอกครบทุกอย่างฟรีอยู่แล้ว แพ็กนี้แค่ทำให้เจ้าทำตามได้ง่ายขึ้น มีฟอร์มกรอก มีจดหมายให้ก๊อปไปใช้ ปรินต์ได้เลย"));
  c.push(P("ในแพ็กมี ๕ ไฟล์:"));
  c.push(bullet([run("ไฟล์นี้ — ", { bold: true }), run("คู่มือ + เช็กลิสต์เอกสาร + ไทม์ไลน์ ๘ สัปดาห์ + คำถามที่เจ้าหน้าที่ชอบถาม")]));
  c.push(bullet([run("แบบฟอร์ม ๑ — จดหมายเชิญ (Invitation Letter)", { bold: true }), run(" · แฟนเป็นคนเขียน")]));
  c.push(bullet([run("แบบฟอร์ม ๒ — จดหมายรับรองค่าใช้จ่าย (Sponsorship Letter)", { bold: true }), run(" · แฟนเป็นคนเขียน")]));
  c.push(bullet([run("แบบฟอร์ม ๓ — จดหมายชี้แจงการเดินทาง (Cover Letter)", { bold: true }), run(" · เจ้าเป็นคนเขียน")]));
  c.push(bullet([run("แบบฟอร์ม ๔ — แผนการเดินทางรายวัน (Itinerary)", { bold: true }), run(" · กรอกในตาราง")]));
  c.push(spacer(60));
  c.push(callout([
    [run("วิธีใช้ฟอร์มจดหมาย: ", { bold: true, size: 22 }), run("ตรงไหนเป็น ", { size: 22 }),
      new TextRun({ text: "[แบบนี้ไฮไลต์เหลือง]", font: FONT, size: 22, bold: true, color: "9C5C0E", highlight: "yellow" }),
      run(" คือช่องที่ต้องกรอกข้อมูลของเจ้า/แฟน แล้วลบวงเล็บกับไฮไลต์ออก", { size: 22 })],
    [run("ก่อนปรินต์จดหมาย: ลบ “กล่องคำแนะนำภาษาไทย” ที่อยู่บนหัวฟอร์มออกก่อน เพราะจดหมายที่ยื่นควรมีแต่ภาษาอังกฤษ", { size: 22 })],
  ]));

  // checklist
  c.push(H1("เช็กลิสต์เอกสาร — ปรินต์แล้วติ๊กตามได้เลย"));
  c.push(H2("เอกสารของเจ้า (ผู้ยื่น)"));
  [
    "แบบฟอร์มขอวีซ่า กรอกครบและเซ็นชื่อ",
    "พาสปอร์ต อายุเหลือเกิน ๓ เดือนหลังวันกลับ มีหน้าว่าง ≥ ๒ หน้า เล่มอายุไม่เกิน ๑๐ ปี",
    "พาสปอร์ตเล่มเก่า (ถ้ามี) — โชว์ประวัติการเดินทาง",
    "รูปถ่ายตามสเปคเชงเก้น (พื้นหลังขาว ขนาดที่กำหนด) ๒ ใบ",
    "ประกันเดินทาง คุ้มครอง ≥ ๓๐,๐๐๐ ยูโร ครอบคลุมค่ารักษาและการส่งตัวกลับ",
    "สเตทเมนต์บัญชีย้อนหลัง ๓–๖ เดือน (ตัวจริงจากธนาคาร)",
    "หนังสือรับรองการทำงาน/ทะเบียนการค้า + สลิปเงินเดือน (ถ้ามี)",
    "หลักฐานผูกพันกับไทย: โฉนดที่ดิน ทะเบียนบ้าน สูติบัตรลูก ฯลฯ",
    "ตั๋วเครื่องบินไป–กลับ (จองไว้ก่อน ยังไม่ต้องออกเต็ม)",
    "หลักฐานที่พักตลอดทริป",
    "จดหมายชี้แจงการเดินทาง (แบบฟอร์ม ๓)",
    "แผนการเดินทางรายวัน (แบบฟอร์ม ๔)",
  ].forEach((t) => c.push(check(t)));

  c.push(H2("เอกสารจากแฟน (สปอนเซอร์)"));
  [
    "จดหมายเชิญ (แบบฟอร์ม ๑) เซ็นชื่อ",
    "จดหมายรับรองค่าใช้จ่าย (แบบฟอร์ม ๒) เซ็นชื่อ",
    "สำเนาพาสปอร์ต/บัตรประชาชนของแฟน",
    "หลักฐานที่อยู่ของแฟน (บิลค่าบ้าน/ค่าเช่า/ทะเบียนบ้าน)",
    "สเตทเมนต์บัญชีของแฟน แสดงว่าดูแลค่าใช้จ่ายไหว",
    "หนังสือรับรองงาน/รายได้ของแฟน",
    "หลักฐานความสัมพันธ์: รูปคู่ แชต ตั๋วที่เคยมาหากัน (ถ้ามี)",
  ].forEach((t) => c.push(check(t)));
  c.push(spacer(40));
  c.push(callout([
    [run("ถ้าจดทะเบียนสมรสแล้ว ", { bold: true, size: 22 }), run("แนบทะเบียนสมรส (คร.๓) แปลรับรอง — ช่วยให้เรื่องง่ายขึ้นมาก", { size: 22 })],
  ], NAGA_BG));
  c.push(new Paragraph({ children: [new PageBreak()] }));

  // timeline
  c.push(H1("ไทม์ไลน์ ๘ สัปดาห์ — ทำอะไรตอนไหน"));
  c.push(P("เริ่มเตรียมล่วงหน้าอย่างน้อย ๖–๘ สัปดาห์ก่อนวันเดินทาง ยิ่งช่วงหน้าร้อน/ปิดเทอมยุโรป คิวยิ่งเต็ม จองคิวยื่นให้เร็ว", { after: 100 }));
  const tRows = [
    ["ช่วงเวลา", "สิ่งที่ต้องทำ"],
    ["๖–๘ สัปดาห์ก่อน", "เลือกประเทศที่จะอยู่นานสุด · เปิดดูเว็บสถานทูต/ศูนย์รับคำร้อง (VFS) · จองคิวยื่น"],
    ["๕–๖ สัปดาห์ก่อน", "แฟนเขียนจดหมายเชิญ + จดหมายรับรองค่าใช้จ่าย · ขอสเตทเมนต์ของแฟน"],
    ["๔ สัปดาห์ก่อน", "ขอสเตทเมนต์บัญชีตัวเอง · หนังสือรับรองงาน · รวมหลักฐานผูกพันกับไทย"],
    ["๓ สัปดาห์ก่อน", "จองตั๋วเครื่องบิน (ไป–กลับ) + ที่พัก · ทำแผนการเดินทางรายวัน"],
    ["๒ สัปดาห์ก่อน", "ซื้อประกันเดินทาง ≥ ๓๐,๐๐๐ ยูโร · ถ่ายรูปวีซ่า · เขียนจดหมายชี้แจงการเดินทาง"],
    ["๑ สัปดาห์ก่อน", "ตรวจเช็กลิสต์ให้ครบ · ปรินต์ทุกอย่าง · เตรียมตอบคำถาม (หน้าถัดไป)"],
    ["วันยื่น", "ไปตามคิว ยิ้มแย้ม เอกสารครบ · เก็บใบเสร็จและใบนัดรับเล่ม"],
  ];
  c.push(new Table({
    width: { size: 9740, type: WidthType.DXA }, columnWidths: [2300, 7440], borders: tblBorders(),
    rows: tRows.map((r, i) => new TableRow({
      tableHeader: i === 0,
      children: [
        cell(r[0], { w: 2300, bold: true, fill: i === 0 ? MARIGOLD : GOLD_BG, color: i === 0 ? "FFFFFF" : NAGA_DARK }),
        cell(r[1], { w: 7440, bold: i === 0, fill: i === 0 ? MARIGOLD : undefined, color: i === 0 ? "FFFFFF" : undefined }),
      ],
    })),
  }));
  c.push(new Paragraph({ children: [new PageBreak()] }));

  // proof of ties
  c.push(H1("พิสูจน์ว่าจะกลับไทย — หัวใจของการผ่าน"));
  c.push(P("เจ้าหน้าที่กลัวอย่างเดียว คือกลัวไปแล้วไม่กลับ ยิ่งโชว์ได้ว่ามีอะไรผูกกับไทยมาก ยิ่งดี ติ๊กที่เจ้ามี:"));
  [
    "งานประจำ + หนังสือรับรองงาน (ระบุว่ากลับมาทำงานต่อ)",
    "กิจการ/ร้านของตัวเอง + ทะเบียนการค้า",
    "ที่ดิน/บ้านในชื่อเรา (โฉนด)",
    "ลูกที่อยู่ไทย (สูติบัตร)",
    "พ่อแม่/ครอบครัวที่ต้องดูแล",
    "บัญชีเงินฝาก/เงินออมในไทย",
    "ประวัติเดินทางกลับตรงเวลา (พาสปอร์ตเล่มเก่า)",
  ].forEach((t) => c.push(check(t)));
  c.push(spacer(80));

  // Q&A
  c.push(H1("คำถามที่ ตม./เจ้าหน้าที่ชอบถาม + วิธีตอบ"));
  c.push(P("ตอบ สั้น จริง ชัด พอ ไม่ต้องเล่ายาว ถ้าฟังไม่ทัน ขอให้พูดช้า ๆ หรือขอล่ามได้ ไม่ใช่เรื่องผิด", { after: 120 }));
  const qa = [
    ["ไปทำอะไรที่ยุโรป?", "ไปเที่ยว/ไปเยี่ยมแฟน (ตอบตามความจริงและตามประเภทวีซ่า)"],
    ["ไปกี่วัน กลับวันไหน?", "ตอบตามตั๋วเครื่องบินขากลับที่จองไว้"],
    ["ไปพักที่ไหน?", "บ้านแฟนที่ [เมือง] / โรงแรม (มีหลักฐานที่พักแนบ)"],
    ["ใครออกค่าใช้จ่าย?", "แฟนสปอนเซอร์ / ออกเอง (ตรงกับจดหมายรับรอง)"],
    ["รู้จักแฟนได้ยังไง นานหรือยัง?", "เล่าสั้น ๆ ตามจริง มีรูป/แชตเป็นหลักฐานยิ่งดี"],
    ["ทำงานอะไรที่ไทย?", "บอกงาน/กิจการ เน้นว่ามีเหตุให้กลับมา"],
    ["เคยไปต่างประเทศไหม?", "ตอบตามจริง เคยไปไหนกลับตรงเวลาบ้าง"],
  ];
  c.push(new Table({
    width: { size: 9740, type: WidthType.DXA }, columnWidths: [3900, 5840], borders: tblBorders(),
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("เจ้าหน้าที่ถาม", { w: 3900, bold: true, fill: NAGA, color: "FFFFFF" }),
        cell("ตอบประมาณนี้", { w: 5840, bold: true, fill: NAGA, color: "FFFFFF" }),
      ] }),
      ...qa.map((r, i) => new TableRow({ children: [
        cell(r[0], { w: 3900, bold: true, fill: i % 2 ? undefined : CREAM_BG, color: NAGA_DARK }),
        cell(r[1], { w: 5840, fill: i % 2 ? undefined : CREAM_BG }),
      ] })),
    ],
  }));
  c.push(new Paragraph({ children: [new PageBreak()] }));

  // tips + do/don't
  c.push(H1("เคล็ดลับ + ข้อควรระวัง"));
  c.push(H2("ควรทำ"));
  ["เอกสารเรียงตามเช็กลิสต์ ใส่แฟ้มให้เป็นระเบียบ",
   "ตัวเลขในจดหมาย ตั๋ว ที่พัก แผนเที่ยว ต้องตรงกันหมด",
   "โชว์เงินในบัญชีให้พอกับจำนวนวัน (ราว ๔๕–๖๐ ยูโร/วัน) และมีมาสักพัก ไม่ใช่เพิ่งโปะเข้าก้อนเดียว",
   "จองตั๋ว/ที่พักแบบยกเลิกได้ เผื่อวีซ่าไม่ผ่าน",
  ].forEach((t) => c.push(bullet(t)));
  c.push(H2("อย่าทำ"));
  ["อย่าใช้เอกสารปลอมหรือข้อมูลเท็จเด็ดขาด — โดนแบนยาว",
   "อย่าเพิ่งลาออกจากงานก่อนได้วีซ่า",
   "อย่าโอนเงินก้อนใหญ่เข้าบัญชีกะทันหันก่อนยื่น (ดูน่าสงสัย)",
   "อย่าจองตั๋วจริงแบบจ่ายเต็มก่อนวีซ่าออก",
  ].forEach((t) => c.push(bullet(t)));
  c.push(spacer(80));
  c.push(callout([
    [run("ถ้าโดนปฏิเสธ อย่าเพิ่งท้อ ", { bold: true, size: 22 }), run("เขาจะบอกเหตุผลมา เรามีสิทธิ์ยื่นอุทธรณ์หรือยื่นใหม่พร้อมแก้จุดที่ขาด อ่านต่อได้ที่ hakfarang.net", { size: 22 })],
  ]));

  // sources
  c.push(H1("แหล่งอ้างอิง + คำเตือน"));
  c.push(P("ข้อมูลในแพ็กนี้ตรวจล่าสุด: " + LAST_VERIFIED + " กฎวีซ่าปรับได้เรื่อย ๆ ก่อนยื่นให้เช็กกับเว็บสถานทูต/ศูนย์รับคำร้องของประเทศปลายทางอีกครั้งเน้อ", { after: 120 }));
  c.push(bullet("EEAS / EU Delegation to Thailand — Schengen visa rules for Thailand"));
  c.push(bullet("AXA Schengen — visa requirements & ประกัน €30,000"));
  c.push(bullet("เว็บสถานทูตของประเทศปลายทาง + ศูนย์รับคำร้อง (VFS Global ฯลฯ)"));
  c.push(spacer(60));
  c.push(P([run("แพ็กนี้เป็นแนวทางทั่วไป ไม่ใช่คำปรึกษากฎหมายหรือการรับประกันผลวีซ่า การอนุมัติขึ้นอยู่กับดุลยพินิจของสถานทูต", { size: 20, italics: true, color: INK_SOFT })]));
  c.push(P([run("© ฮักฝรั่ง · hakfarang.net — ทำด้วยใจเพื่อพี่น้องเมียฝรั่งทุกคน", { size: 20, color: MARIGOLD })]));

  return makeDoc(c, { branded: true });
}

// ===========================================================================
// Letter shells (no branding — buyer submits these as her own documents)
// ===========================================================================
function letterInstruction(lines) {
  return callout([
    [run("☞ คำแนะนำ (ลบกล่องนี้ก่อนปรินต์): ", { bold: true, size: 22, color: "9C5C0E" })],
    ...lines.map((l) => (Array.isArray(l) ? l : [run(l, { size: 22 })])),
  ]);
}
const line = (children) => new Paragraph({ spacing: { after: 160, line: 320 },
  children: Array.isArray(children) ? children : [run(children)] });
const addrLine = (children) => new Paragraph({ spacing: { after: 20, line: 300 },
  children: Array.isArray(children) ? children : [run(children)] });

function invitationLetter() {
  const c = [];
  c.push(letterInstruction([
    "จดหมายนี้ “แฟน (สปอนเซอร์)” เป็นคนเขียน เป็นภาษาอังกฤษ",
    [run("กรอกช่อง ", { size: 22 }), fill("แบบนี้"), run(" ด้วยข้อมูลจริง แล้วลบวงเล็บ/ไฮไลต์ออก · เซ็นชื่อจริงตอนท้าย", { size: 22 })],
  ]));
  c.push(spacer(120));
  c.push(addrLine([fill("Full name of sponsor")]));
  c.push(addrLine([fill("Street address")]));
  c.push(addrLine([fill("City, Postcode, Country")]));
  c.push(addrLine([run("Email: "), fill("email"), run("   ·   Tel: "), fill("phone")]));
  c.push(spacer(120));
  c.push(addrLine([run("Date: "), fill("date")]));
  c.push(spacer(80));
  c.push(addrLine([run("To: The Consulate / Embassy of "), fill("destination country")]));
  c.push(spacer(120));
  c.push(line([run("Subject: Letter of Invitation for ", { bold: true }), fill("applicant full name"), run(" (Thai national)", { bold: true })]));
  c.push(line("Dear Sir or Madam,"));
  c.push(line([
    run("I, "), fill("sponsor full name"), run(", a "), fill("nationality"),
    run(" citizen (passport/ID no. "), fill("number"), run("), residing at "),
    fill("full address"), run(", would like to invite my "), fill("partner / fiancée / wife"),
    run(", "), fill("applicant full name"), run(", born "), fill("date of birth"),
    run(", holder of Thai passport no. "), fill("passport no."),
    run(", to visit me in "), fill("country"), run("."),
  ]));
  c.push(line([
    run("The purpose of the visit is "), fill("tourism / to visit me"),
    run(". She intends to stay from "), fill("arrival date"), run(" to "), fill("departure date"),
    run(", a total of "), fill("number"), run(" days."),
  ]));
  c.push(line([
    run("During her stay she will reside with me at "), fill("your full address"),
    run(". I will personally cover all costs of her trip, including travel, accommodation, and living expenses (see my separate letter of financial guarantee)."),
  ]));
  c.push(line([
    run("We have known each other since "), fill("month/year"),
    run(", and "), fill("one sentence about your relationship / how you met"), run("."),
  ]));
  c.push(line("I confirm that she will return to Thailand before the expiry of her visa. She has strong ties to Thailand, including her work, family, and property there."));
  c.push(line("Thank you for your kind consideration. I remain available for any further information you may require."));
  c.push(spacer(120));
  c.push(line("Yours faithfully,"));
  c.push(spacer(200));
  c.push(addrLine([run("_______________________________")]));
  c.push(addrLine([fill("Sponsor full name")]));
  c.push(addrLine([run("Enclosures: copy of passport/ID, proof of address, bank statements")]));
  return makeDoc(c);
}

function sponsorshipLetter() {
  const c = [];
  c.push(letterInstruction([
    "จดหมายนี้ “แฟน (สปอนเซอร์)” เป็นคนเขียน เป็นภาษาอังกฤษ — เป็นการรับรองว่าจะออกค่าใช้จ่ายให้",
    [run("กรอกช่อง ", { size: 22 }), fill("แบบนี้"), run(" แล้วลบวงเล็บ/ไฮไลต์ · แนบสเตทเมนต์บัญชี + หลักฐานรายได้", { size: 22 })],
  ]));
  c.push(spacer(120));
  c.push(addrLine([fill("Full name of sponsor")]));
  c.push(addrLine([fill("Full address")]));
  c.push(addrLine([run("Email: "), fill("email"), run("   ·   Tel: "), fill("phone")]));
  c.push(spacer(100));
  c.push(addrLine([run("Date: "), fill("date")]));
  c.push(spacer(80));
  c.push(addrLine([run("To: The Consulate / Embassy of "), fill("destination country")]));
  c.push(spacer(120));
  c.push(line([run("Subject: Financial Guarantee (Sponsorship) for ", { bold: true }), fill("applicant full name")]));
  c.push(line("Dear Sir or Madam,"));
  c.push(line([
    run("I, "), fill("sponsor full name"), run(", "), fill("nationality"),
    run(" citizen, passport/ID no. "), fill("number"),
    run(", hereby declare that I take full financial responsibility for "),
    fill("applicant full name"), run(", Thai passport no. "), fill("passport no."),
    run(", during her entire stay in the Schengen area from "), fill("arrival date"),
    run(" to "), fill("departure date"), run("."),
  ]));
  c.push(line("This guarantee covers her international travel, accommodation, health, daily living expenses, and any unforeseen costs, so that she will not be a financial burden on the host state."));
  c.push(line([
    run("My "), fill("monthly / annual"), run(" income is "), fill("amount + currency"),
    run(", and I have sufficient savings to support this visit, as shown in the enclosed bank statements."),
  ]));
  c.push(line("I make this declaration knowing it will be relied upon by the visa authorities."));
  c.push(spacer(120));
  c.push(line("Yours faithfully,"));
  c.push(spacer(200));
  c.push(addrLine([run("_______________________________")]));
  c.push(addrLine([fill("Sponsor full name")]));
  c.push(addrLine([run("Enclosures: bank statements (3–6 months), proof of employment/income, proof of address, copy of ID/passport")]));
  return makeDoc(c);
}

function coverLetter() {
  const c = [];
  c.push(letterInstruction([
    "จดหมายนี้ “เจ้า (ผู้ยื่น)” เป็นคนเขียนถึงสถานทูต เป็นภาษาอังกฤษ — เล่าว่าจะไปไหน ทำไม และจะกลับแน่",
    [run("กรอกช่อง ", { size: 22 }), fill("แบบนี้"), run(" แล้วลบวงเล็บ/ไฮไลต์ออก", { size: 22 })],
  ]));
  c.push(spacer(120));
  c.push(addrLine([fill("Your full name")]));
  c.push(addrLine([fill("Your address in Thailand")]));
  c.push(addrLine([run("Email: "), fill("email"), run("   ·   Tel: "), fill("phone")]));
  c.push(spacer(100));
  c.push(addrLine([run("Date: "), fill("date")]));
  c.push(spacer(80));
  c.push(addrLine([run("To: The Consulate / Embassy of "), fill("destination country")]));
  c.push(spacer(120));
  c.push(line([run("Subject: Application for a short-stay Schengen visa", { bold: true })]));
  c.push(line("Dear Sir or Madam,"));
  c.push(line([
    run("My name is "), fill("full name"), run(", a Thai national, passport no. "),
    fill("passport no."), run(". I am applying for a short-stay Schengen visa to visit "),
    fill("destination country"), run(" from "), fill("arrival date"), run(" to "),
    fill("departure date"), run(" ("), fill("number"), run(" days)."),
  ]));
  c.push(line([
    run("The purpose of my trip is "), fill("tourism / visiting my partner"),
    run(". I will be staying at "), fill("host address / hotel"),
    run(". All costs of my trip are "), fill("covered by myself / sponsored by my partner"),
    run(", as detailed in the enclosed documents."),
  ]));
  c.push(line([
    run("I have strong ties to Thailand and will return before my visa expires. In Thailand I "),
    fill("work as … / run … / care for my family / own property"),
    run(", and I fully intend to resume these responsibilities after my trip."),
  ]));
  c.push(line("Please find enclosed all supporting documents. I would be grateful for your kind consideration of my application."));
  c.push(spacer(120));
  c.push(line("Yours faithfully,"));
  c.push(spacer(200));
  c.push(addrLine([run("_______________________________")]));
  c.push(addrLine([fill("Your full name")]));
  return makeDoc(c);
}

function itineraryForm() {
  const c = [];
  c.push(letterInstruction([
    "ตารางแผนการเดินทางรายวัน — กรอกให้ตรงกับตั๋วและที่พักที่จองไว้ (มีตัวอย่างแถวแรกให้ดู)",
  ]));
  c.push(spacer(80));
  c.push(new Paragraph({ spacing: { after: 120 },
    children: [run("Travel Itinerary — ", { bold: true, size: 26, color: NAGA_DARK }), fill("your full name"),
      run("   ·   ", { size: 26 }), fill("destination country")] }));
  const head = ["Day", "Date", "City / Area", "Plan for the day", "Overnight stay"];
  const widths = [900, 1500, 2000, 3140, 2200];
  const example = ["1", "12 Aug 2026", "Munich", "Arrive MUC, meet partner, rest", "Partner's home, Munich"];
  const rows = [
    new TableRow({ tableHeader: true, children: head.map((h, i) =>
      cell(h, { w: widths[i], bold: true, fill: MARIGOLD, color: "FFFFFF" })) }),
    new TableRow({ children: example.map((e, i) =>
      cell([new Paragraph({ children: [run(e, { size: 20, italics: true, color: INK_SOFT })] })], { w: widths[i], fill: CREAM_BG })) }),
  ];
  for (let d = 2; d <= 12; d++) {
    rows.push(new TableRow({ children: widths.map((w, i) =>
      cell(i === 0 ? String(d) : " ", { w, bold: i === 0, color: NAGA_DARK })) }));
  }
  c.push(new Table({ width: { size: 9740, type: WidthType.DXA }, columnWidths: widths, borders: tblBorders(), rows }));
  c.push(spacer(80));
  c.push(P([run("เคล็ดลับ: วันแรก = วันลงเครื่อง วันสุดท้าย = วันบินกลับ ให้ตรงกับตั๋ว", { size: 22, color: INK_SOFT })]));
  return makeDoc(c);
}

// ---- run ------------------------------------------------------------------
(async () => {
  console.log("Building Schengen pack…");
  await write("00 แพ็กวีซ่าเชงเก้น — คู่มือฉบับเต็ม (ฮักฝรั่ง).docx", guide());
  await write("01 แบบฟอร์ม — จดหมายเชิญ (Invitation Letter).docx", invitationLetter());
  await write("02 แบบฟอร์ม — จดหมายรับรองค่าใช้จ่าย (Sponsorship Letter).docx", sponsorshipLetter());
  await write("03 แบบฟอร์ม — จดหมายชี้แจงการเดินทาง (Cover Letter).docx", coverLetter());
  await write("04 แบบฟอร์ม — แผนการเดินทางรายวัน (Itinerary).docx", itineraryForm());
  console.log("Done → " + OUT);
})();
