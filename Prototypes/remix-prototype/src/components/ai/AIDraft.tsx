import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Plus,
  FileText,
  History,
  Download,
  Check,
  Edit3,
  Loader2,
  AlertCircle,
  Trash2,
  Search,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Send,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Save,
  Paperclip,
  Settings,
  X,
  FileDown,
  BookOpen,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

// 配置 pdfjs worker（使用 CDN，硬编码版本号避免 version 未定义问题）
const PDFJS_VERSION = "4.10.38";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

// ============================================================
// 生成步骤类型（瀑布流展示）
// ============================================================
interface GenerationStep {
  stage: string;
  name: string;
  detail: string;
  status: "running" | "done" | "error" | "pending";
  startedAt?: number;
  finishedAt?: number;
}

// ============================================================
// 瀑布流组件：展示6阶段生成过程的深度思考时间线
// ============================================================
function WaterfallDisplay({ steps, currentStageId, startedAt }: { steps: GenerationStep[]; currentStageId: string; startedAt?: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (steps.some(s => s.status === "running")) {
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }
  }, [steps]);

  if (steps.length === 0) return null;

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
  const fmtDuration = (ms: number) => {
    const s = Math.round(ms / 1000);
    if (s < 1) return `${ms}ms`;
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m${s % 60}s`;
  };

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[520px]">
        <div className="mb-2 text-[11px] font-bold text-gray-500 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#083190]" />
          <span>执行过程 · 深度思考</span>
        </div>
        <div className="space-y-0">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isRunning = step.status === "running";
            const isDone = step.status === "done";
            const isError = step.status === "error";
            const isPending = step.status === "pending";

            const elapsed = isRunning && startedAt ? now - startedAt : 0;
            const duration = step.finishedAt && step.startedAt ? step.finishedAt - step.startedAt : null;

            let dotColor = "bg-gray-300 border-gray-400";
            let dotIcon: React.ReactNode = <span className="text-[8px] text-gray-500">{idx + 1}</span>;
            let textColor = "text-gray-400";
            let detailColor = "text-gray-400";

            if (isDone) { dotColor = "bg-green-500 border-green-600"; dotIcon = <Check className="w-3 h-3 text-white" />; textColor = "text-gray-700"; detailColor = "text-gray-500"; }
            else if (isRunning) { dotColor = "bg-[#083190] border-blue-800"; dotIcon = <Loader2 className="w-3 h-3 text-white animate-spin" />; textColor = "text-[#083190]"; detailColor = "text-gray-600"; }
            else if (isError) { dotColor = "bg-red-500 border-red-600"; dotIcon = <AlertCircle className="w-3 h-3 text-white" />; textColor = "text-red-600"; detailColor = "text-red-400"; }

            return (
              <div key={`${step.stage}-${idx}`} className="flex items-start">
                <div className="flex flex-col items-center mr-3 shrink-0" style={{ minWidth: 20 }}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all ${dotColor}`}>
                    {dotIcon}
                  </div>
                  {!isLast && <div className={`w-px mt-0.5 ${isDone ? "bg-green-300" : isRunning ? "bg-blue-200" : "bg-gray-200"}`} style={{ height: 20 }} />}
                </div>
                <div className={`pb-4 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className={`text-[13px] font-bold ${textColor}`}>{step.name}</span>
                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      {duration !== null && duration !== undefined && <span className="text-[10px] text-gray-400 font-mono">{fmtDuration(duration)}</span>}
                      {isRunning && <span className="text-[10px] text-blue-500 font-mono animate-pulse">{fmtDuration(elapsed)}</span>}
                      {step.finishedAt && <span className="text-[10px] text-gray-400">{fmtTime(step.finishedAt)}</span>}
                    </div>
                  </div>
                  <div className={`text-[12px] ${detailColor}`}>{step.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 行内 Markdown 格式处理（粗体、斜体、行内代码）
// ============================================================
function applyInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, "<em>$1</em>");
}

// ============================================================
// Markdown 渲染器（逐行解析，稳定可靠）
// ============================================================
function renderMarkdown(text: string): string {
  // 1. 转义 HTML
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. 代码块
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) =>
    `<pre class="bg-gray-50 border border-gray-200 rounded p-3 my-3 text-[12px] font-mono overflow-x-auto">${code.trim()}</pre>`
  );

  // 3. 行内代码
  html = html.replace(/`([^`]+)`/g,
    `<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-[12px] font-mono">$1</code>`
  );

  // 4. 逐行解析
  const srcLines = html.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < srcLines.length) {
    const line = srcLines[i];
    const trimmed = line.trim();

    // 表格：连续以 | 开头结尾的行
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 2) {
      const tableRows: string[] = [];
      while (i < srcLines.length) {
        const t = srcLines[i].trim();
        if (t.startsWith("|") && t.endsWith("|") && t.length > 2) {
          tableRows.push(srcLines[i]);
          i++;
        } else break;
      }
      // 过滤掉纯分隔行
      const dataRows = tableRows.filter(r => {
        const tr = r.trim();
        return !/^\|[\s\-:|]+\|$/.test(tr);
      });
      if (dataRows.length > 0) {
        const makeRow = (row: string, isHeader: boolean) => {
          const cells = row.split("|").filter((c: string) => c.trim());
          const tag = isHeader ? "th" : "td";
          return "<tr>" + cells.map((cell: string) =>
            `<${tag} class="border border-gray-200 px-2 py-1.5 text-left ${isHeader ? "bg-gray-50 font-bold text-gray-700" : "text-gray-600"}">${applyInlineMarkdown(cell.trim())}</${tag}>`
          ).join("") + "</tr>";
        };
        let t = '<table class="w-full text-[12px] border-collapse border border-gray-200 my-3">';
        t += makeRow(dataRows[0], true);
        for (let r = 1; r < dataRows.length; r++) t += makeRow(dataRows[r], false);
        t += "</table>";
        out.push(t);
        continue;
      }
    }

    // 标题
    const h2 = trimmed.match(/^## (.+)$/);
    if (h2) { out.push(`<h3 class="text-[16px] font-bold text-[#083190] mt-5 mb-3 pb-1.5 border-b border-gray-100">${applyInlineMarkdown(h2[1])}</h3>`); i++; continue; }
    const h3 = trimmed.match(/^### (.+)$/);
    if (h3) { out.push(`<h4 class="text-[15px] font-bold text-gray-900 mt-4 mb-2">${applyInlineMarkdown(h3[1])}</h4>`); i++; continue; }
    const h4 = trimmed.match(/^#### (.+)$/);
    if (h4) { out.push(`<h5 class="text-[14px] font-bold text-gray-800 mt-4 mb-2">${applyInlineMarkdown(h4[1])}</h5>`); i++; continue; }
    const h1 = trimmed.match(/^# (.+)$/);
    if (h1) { out.push(`<h2 class="text-[18px] font-bold text-[#083190] mt-6 mb-3 pb-2 border-b border-gray-200">${applyInlineMarkdown(h1[1])}</h2>`); i++; continue; }

    // 分隔线
    if (trimmed === "---") { out.push('<hr class="my-4 border-gray-200" />'); i++; continue; }

    // 有序列表
    const ol = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ol) { out.push(`<li class="ml-5 list-decimal text-gray-700 mb-1">${applyInlineMarkdown(ol[1])}</li>`); i++; continue; }

    // 无序列表 - 或 *
    const ul = trimmed.match(/^[\-\*]\s+(.+)$/);
    if (ul) { out.push(`<li class="ml-5 list-disc text-gray-700 mb-1">${applyInlineMarkdown(ul[1])}</li>`); i++; continue; }

    // 空行 → 段落分隔
    if (trimmed === "") { out.push(""); i++; continue; }

    // 普通段落（应用行内格式）
    out.push(`<p class="mb-2">${applyInlineMarkdown(trimmed)}</p>`);
    i++;
  }

  // 包裹相邻 <li> 到 <ul>
  let result = out.join("\n");
  result = result.replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, (block) => {
    const cleaned = block.replace(/\n/g, "");
    return `<ul class="my-2">${cleaned}</ul>`;
  });

  // 清理空段落
  result = result.replace(/<p class="mb-2"><\/p>/g, "");

  return result;
}

// ============================================================
// 参数字段定义（13个字段：5必填 + 8选填）
// ============================================================
const PARAM_FIELDS = [
  // 必填参数（5个）
  { id: "trial_drug_name", label: "试验用药通用名", required: true, priority: 1, type: "text" },
  { id: "indication", label: "适应症", required: true, priority: 2, type: "text" },
  { id: "trial_phase", label: "试验分期", required: true, priority: 3, type: "enum", options: ["I期", "Ia/Ib期", "II期", "IIa/IIb期", "III期", "IV期"] },
  { id: "register_class", label: "药品注册分类", required: true, priority: 4, type: "enum", options: ["1类创新药", "改良型新药", "仿制药", "生物类似药"] },
  { id: "control_plan", label: "对照药/对照方案类型", required: true, priority: 5, type: "enum", options: ["安慰剂对照", "阳性对照", "无对照"] },
  // 选填参数（8个）
  { id: "drug_dosage_freq", label: "给药频次与单次剂量", required: false, priority: 6, type: "text" },
  { id: "treat_duration", label: "单个治疗周期时长", required: false, priority: 7, type: "text" },
  { id: "blinding_method", label: "试验盲法设计", required: false, priority: 8, type: "enum", options: ["开放标签", "单盲", "双盲"] },
  { id: "primary_endpoint", label: "主要疗效终点", required: false, priority: 9, type: "text" },
  { id: "trial_design_type", label: "试验设计类型", required: false, priority: 10, type: "enum", options: ["随机对照试验", "单臂试验"] },
  { id: "sample_size", label: "样本量", required: false, priority: 11, type: "text" },
  { id: "inclusion_exclusion", label: "入排关键限定", required: false, priority: 12, type: "text" },
  { id: "administration_route", label: "给药途径", required: false, priority: 13, type: "text" },
];

// ============================================================
// 生成阶段定义（6个阶段）
// ============================================================
const GENERATION_STAGES = [
  { id: "collect", name: "引导式参数收集" },
  { id: "validate", name: "参数完整性校验" },
  { id: "prepare", name: "素材准备" },
  { id: "core_design", name: "核心要素设计" },
  { id: "parallel_gen", name: "并行章节生成" },
  { id: "integrate", name: "整合润色定稿" },
];

// ============================================================
// 对话消息类型
// ============================================================
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  extractedParams?: Record<string, string>;
  progress?: { filled: number; total: number; requiredFilled: number; requiredTotal: number };
}

// ============================================================
// 方案章节类型
// ============================================================
interface DraftSection {
  id: string;
  title: string;
  content: string;
  aiNote?: string;
}

// ============================================================
// 知识库引用类型
// ============================================================
interface CitationRef {
  id: number;
  color: 'blue' | 'pink' | 'green' | 'amber';
  title: string;
  page: number;
  content: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
}

interface FileGroup {
  fileName: string;
  fileType: 'pdf' | 'docx';
  citations: CitationRef[];
}

// 示例引用数据（演示用）
const MOCK_FILE_GROUPS: FileGroup[] = [
  {
    fileName: '冠心宁片V3.0方案.pdf',
    fileType: 'pdf',
    citations: [
      { id: 1, color: 'blue', title: '第二章 入选标准与排除标准细节', page: 4, content: 'ICH-GCP 及中国《药物临床试验质量管理规范》（GCP）：作为临床试验合规和受试者保护的法律基石。年龄限制为18-75岁，确诊稳定性心绞痛病史≥6个月，原发病稳定。', fileName: '冠心宁片V3.0方案.pdf', fileType: 'pdf' },
      { id: 2, color: 'pink', title: '第四章 主要疗效终点与统计效能设计', page: 15, content: '终点指标确定：优先选择经科学验证的硬终点（Hard Endpoint），合并应用公认量表与生物标记物（Biomarkers）。统计效能估算须满足 Power > 80%。', fileName: '冠心宁片V3.0方案.pdf', fileType: 'pdf' },
      { id: 3, color: 'green', title: '统计学方法与样本量计算', page: 5, content: '样本量估算需基于主要疗效终点，采用双侧 α=0.05、Power=90% 的假设，考虑 15% 脱落率。ITT 分析集与 PP 分析集的定义需预先明确。', fileName: '冠心宁片V3.0方案.pdf', fileType: 'pdf' },
    ]
  },
  {
    fileName: '临床试验质量管理规范.docx',
    fileType: 'docx',
    citations: [
      { id: 4, color: 'amber', title: '第三篇 实施规范与数据管理', page: 22, content: '临床试验的实施应遵循赫尔辛基宣言原则，所有受试者均须签署书面知情同意书。电子数据采集系统（EDC）应经过验证，并符合 21 CFR Part 11 要求。', fileName: '临床试验质量管理规范.docx', fileType: 'docx' },
    ]
  }
];

// ============================================================
// 会话类型
// ============================================================
interface DraftSession {
  id: string;
  title: string;
  drugName: string;
  indication: string;
  phase: string;
  status: "collecting" | "ready" | "generating" | "completed";
  params: Record<string, string>;
  messages: ChatMessage[];
  sections: DraftSection[];
  createdAt: string;
}

// ============================================================
// 预设会话
// ============================================================
const PRESET_SESSIONS: DraftSession[] = [
  {
    id: "draft-1",
    title: "冠心宁片中风后遗症临床试验方案草案",
    drugName: "冠心宁片",
    indication: "中风后遗症（气虚血瘀证）",
    phase: "III期",
    status: "completed",
    params: {
      trial_drug_name: "冠心宁片",
      indication: "中风后遗症（气虚血瘀证）",
      trial_phase: "III期",
      register_class: "2类改良型新药",
      control_plan: "安慰剂对照",
      combine_regimen: "无",
      drug_dosage_freq: "0.4g/片，口服，一次3片，一日3次",
      treat_duration: "12周",
      special_enroll_limit: "NIHSS评分4-15分，BI评分<80分",
      ref_file_list: "中药新药临床研究指导原则(试行).pdf",
    },
    messages: [
      { id: "msg-1", role: "user", content: "冠心宁片III期试验，适应症中风后遗症（气虚血瘀证），安慰剂对照，2类改良型新药", timestamp: "2026-07-20T10:00:00.000Z", progress: { filled: 5, total: 10, requiredFilled: 5, requiredTotal: 5 } },
      { id: "msg-2", role: "assistant", content: "已记录试验参数。请问给药频次和剂量是什么？", timestamp: "2026-07-20T10:01:00.000Z", extractedParams: { trial_drug_name: "冠心宁片", indication: "中风后遗症（气虚血瘀证）", trial_phase: "III期", register_class: "2类改良型新药", control_plan: "安慰剂对照" }, progress: { filled: 5, total: 10, requiredFilled: 5, requiredTotal: 5 } },
    ],
    sections: [
      { id: "sec-1", title: "1. 研究背景", content: "中风（脑卒中）是导致我国成人致死、致残的首位病因。气虚血瘀证是中风后遗症期的核心中医证型。冠心宁片主要由丹参、川芎两味中药提取、精制而成，具有活血化瘀、行气止痛之功效。\n\n二期临床试验（共招募240例受试者）结果表明，冠心宁片治疗8周和12周后，患者的神经功能缺损显著改善，且具有极高的安全性。本三期临床研究旨在进一步在大样本多中心人群中，严格确证冠心宁片对于中风后遗症气虚血瘀证受试者的长期疗效与靶器官保护作用。" },
      { id: "sec-2", title: "2. 试验设计", content: "本研究是一项多中心、随机、双盲、安慰剂对照、平行组设计的临床试验。试验拟招募480例符合入排标准的受试者，按1:1比例随机分入冠心宁片组和安慰剂对照组。\n\n【入选标准】\n1. 年龄在18至75周岁（含两端），性别不限；\n2. 符合缺血性中风（脑梗死）诊断标准，处于后遗症期（病程在1个月至6个月之间）；\n3. 中医辨证属于「气虚血瘀证」；\n4. NIHSS评分介于4分至15分（含两端），且生活不能自理（BI评分小于80分）；\n5. 受试者或其法定代理人签署知情同意书。\n\n【排除标准】\n1. 短期内（3个月内）有进行过脑溢血、大面积脑梗死手术者；\n2. 合并严重心、肝、肾功能不全者；\n3. 伴有严重失语、精神障碍，无法配合评估者；\n4. 近3个月内参加过其他临床试验者。" },
      { id: "sec-3", title: "3. 统计分析与样本量", content: "基于二期临床试验主要终点BI评分改善率的差异（试验组75%，对照组58%），设双侧显著性水平α=0.05，检验效能(1-β)=0.80。采用1:1分配，并考虑20%的脱落率，最终估算出每组需招募240例，共计480例受试者。\n\n主要疗效分析采用全分析集（FAS）和符合方案集（PPS）。分类变量使用卡方检验或Fisher确切概率法，连续变量采用协方差分析（ANCOVA），将基线值作为协变量进行调整。" },
      { id: "sec-4", title: "4. 安全性与伦理合规", content: "【安全性指标】\n1. 基础体征：体温、呼吸、脉搏、血压；\n2. 实验室检查：血常规、尿常规、肝功能（ALT、AST、TBIL）、肾功能（Cr、BUN）、心电图；\n3. 治疗期间不良事件（AE）及严重不良事件（SAE）的发生率、严重程度、与试验药物的相关性判定。\n\n【严重不良事件响应】\n若试验期间发生SAE，研究者必须在24小时内向申办方、伦理委员会以及国家药品监督管理局（NMPA）书面报告，并立即停止给药，开启受试者医疗救治通道。" },
      { id: "sec-5", title: "5. 方案管理", content: "【方案版本管理】\n本方案版本号：V1.0，日期：2026-07-23。任何方案修正需经伦理委员会批准后实施。\n\n【方案偏离/违背的处理】\n任何方案偏离均需记录并报告。重大偏离需在24小时内报告申办方和伦理委员会。\n\n【试验暂停/终止标准】\n当出现以下情况时，应考虑暂停或终止试验：\n1. 出现非预期的严重安全性问题；\n2. 主要疗效指标显示试验组与对照组无显著差异；\n3. 受试者入组速度远低于预期。" },
      { id: "sec-6", title: "6. 缩略语表", content: "AE - Adverse Event（不良事件）\nAE/SAE - Adverse Event / Serious Adverse Event（不良事件/严重不良事件）\nAI - Artificial Intelligence（人工智能）\nANCOVA - Analysis of Covariance（协方差分析）\nBE - Bioequivalence（生物等效性）\nBI - Barthel Index（巴塞尔指数）\nCRO - Contract Research Organization（合同研究组织）\nCRF - Case Report Form（病例报告表）\nCTCAE - Common Terminology Criteria for Adverse Events（不良事件通用术语标准）\nDMC - Data Monitoring Committee（数据监查委员会）\nEDC - Electronic Data Capture（电子数据采集）\nFAS - Full Analysis Set（全分析集）\nGCP - Good Clinical Practice（药物临床试验质量管理规范）\nICH - International Council for Harmonisation（国际协调会议）\nIRB - Institutional Review Board（伦理审查委员会）\nNMPA - National Medical Products Administration（国家药品监督管理局）\nORR - Objective Response Rate（客观缓解率）\nPFS - Progression-Free Survival（无进展生存期）\nPPS - Per-Protocol Set（符合方案集）\nRECIST - Response Evaluation Criteria in Solid Tumors（实体瘤疗效评价标准）\nSAE - Serious Adverse Event（严重不良事件）\nSAP - Statistical Analysis Plan（统计分析计划）\nSOC - Standard of Care（标准治疗）\nSS - Safety Set（安全数据集）" },
    ],
    createdAt: "2026-07-20T00:00:00.000Z",
  },
  {
    id: "draft-2",
    title: "盐酸安罗替尼胶囊非小细胞肺癌二期方案草案",
    drugName: "盐酸安罗替尼胶囊",
    indication: "晚期非小细胞肺癌（NSCLC）",
    phase: "II期",
    status: "completed",
    params: {
      trial_drug_name: "盐酸安罗替尼胶囊",
      indication: "晚期非小细胞肺癌（NSCLC）",
      trial_phase: "II期",
      register_class: "1类创新药",
      control_plan: "单臂",
      drug_dosage_freq: "12mg，每日一次，连续服用2周，停药1周",
      treat_duration: "每3周为一个周期，直至疾病进展或出现不可耐受的毒性",
    },
    messages: [
      { id: "msg-1", role: "user", content: "盐酸安罗替尼胶囊II期试验，适应症晚期非小细胞肺癌，1类创新药，单臂设计", timestamp: "2026-07-21T09:00:00.000Z", progress: { filled: 5, total: 10, requiredFilled: 5, requiredTotal: 5 } },
      { id: "msg-1b", role: "assistant", content: "已记录以下试验参数：\n• 试验用药通用名：盐酸安罗替尼胶囊\n• 适应症：晚期非小细胞肺癌（NSCLC）\n• 试验分期：II期\n• 药品注册分类：1类创新药\n• 对照药/对照方案类型：单臂", timestamp: "2026-07-21T09:00:01.000Z", extractedParams: { trial_drug_name: "盐酸安罗替尼胶囊", indication: "晚期非小细胞肺癌（NSCLC）", trial_phase: "II期", register_class: "1类创新药", control_plan: "单臂" }, progress: { filled: 5, total: 10, requiredFilled: 5, requiredTotal: 5 } },
    ],
    sections: [
      { id: "sec-1", title: "1. 研究背景", content: "肺癌是全球高发的恶性肿瘤，非小细胞肺癌约占所有肺癌的85%。对于晚期多线治疗失败的患者，目前临床缺乏标准有效的靶向药物。盐酸安罗替尼是一种新型多靶点酪氨酸激酶抑制剂，能强效抑制VEGFR、PDGFR、FGFR及c-Kit等多重激酶。\n\n一期剂量递增和扩大研究表明，安罗替尼在8mg、10mg、12mg剂量下均具有良好的耐受性，且在12mg剂量下表现出最佳的药代动力学特征和初步抗肿瘤活性。本研究旨在确证安罗替尼胶囊在特定晚期NSCLC人群中的有效性，并为三期确证性临床试验推荐合理的给药方案。" },
      { id: "sec-2", title: "2. 试验设计", content: "本研究是一项多中心、单臂、开放、二期临床试验。旨在评估盐酸安罗替尼胶囊单药治疗晚期非小细胞肺癌（NSCLC）患者的客观缓解率（ORR）及无进展生存期（PFS）。\n\n研究计划招募120例既往接受过至少两线系统性化疗失败的晚期NSCLC患者。药物给药方案为安罗替尼12mg，每日一次，连续服用2周，停药1周，每3周为一个周期，直至疾病进展或出现不可耐受的毒性。" },
    ],
    createdAt: "2026-07-21T00:00:00.000Z",
  },
];

export default function AIDraft({ selectedProject = "全部" }: { selectedProject?: string }) {
  // ============================================================
  // 状态管理
  // ============================================================
  const [sessions, setSessions] = useState<DraftSession[]>(() => {
    try {
      const raw = localStorage.getItem("totrial_draft_sessions_v2");
      if (raw) {
        const parsed = JSON.parse(raw) as DraftSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 确保预设的 draft-1 和 draft-2 始终存在于列表中
          const hasDraft1 = parsed.some(s => s.id === "draft-1");
          const hasDraft2 = parsed.some(s => s.id === "draft-2");
          const presetDraft1 = PRESET_SESSIONS.find(p => p.id === "draft-1")!;
          const presetDraft2 = PRESET_SESSIONS.find(p => p.id === "draft-2")!;

          // 补全或插入预设数据
          const enriched = parsed.map(sess => {
            const preset = PRESET_SESSIONS.find(p => p.id === sess.id);
            const hasEmptySections = !sess.sections || sess.sections.length === 0;
            const hasEmptyParams = !sess.params || Object.keys(sess.params).length === 0;
            return {
              ...sess,
              sections: hasEmptySections && preset ? preset.sections : (sess.sections || []),
              params: hasEmptyParams && preset ? preset.params : (sess.params || {}),
              messages: (sess.messages || []).map(msg => ({
                ...msg,
                timestamp: typeof msg.timestamp === "string" ? msg.timestamp : new Date(msg.timestamp).toISOString(),
              })),
              createdAt: typeof sess.createdAt === "string" ? sess.createdAt : new Date(sess.createdAt).toISOString(),
              drugName: sess.drugName || preset?.drugName || "",
              indication: sess.indication || preset?.indication || "",
              phase: sess.phase || preset?.phase || "",
              status: sess.status || (hasEmptySections ? "collecting" : "completed"),
            };
          });

          // 追加缺失的预设记录
          if (!hasDraft1) enriched.push(presetDraft1);
          if (!hasDraft2) enriched.push(presetDraft2);

          localStorage.setItem("totrial_draft_sessions_v2", JSON.stringify(enriched));
          return enriched;
        }
      }
    } catch (e) {
      console.error("Failed to load sessions from localStorage:", e);
    }
    // 首次加载：预设2条 + 空会话
    const initial = [
      {
        id: "draft-new",
        title: "新建临床试验方案",
        drugName: "",
        indication: "",
        phase: "",
        status: "collecting" as const,
        params: {},
        messages: [],
        sections: [],
        createdAt: new Date().toISOString(),
      },
      ...PRESET_SESSIONS,
    ];
    localStorage.setItem("totrial_draft_sessions_v2", JSON.stringify(initial));
    return initial;
  });
  const [activeSessionId, setActiveSessionId] = useState<string>("draft-new");
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");

  // 对话相关状态
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState("collect");
  const [isLoading, setIsLoading] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generationStartedAt, setGenerationStartedAt] = useState<number>(0);

  // 方案模板上传相关状态
  const [uploadedTemplate, setUploadedTemplate] = useState<{ name: string; content: string } | null>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [templateUploadError, setTemplateUploadError] = useState<string | null>(null);

// 草稿展示相关状态
const [activeChapterId, setActiveChapterId] = useState<string>("sec-1");

// Toast 状态
const [toast, setToast] = useState<{
  show: boolean;
  type: "success" | "error" | "warning";
  message: string;
}>({ show: false, type: "success", message: "" });

// ConfirmDialog 状态
const [confirmDialog, setConfirmDialog] = useState<{
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}>({ show: false, title: "", message: "", onConfirm: () => {} });

// 导出状态
const [isExporting, setIsExporting] = useState(false);
const [exportFormat, setExportFormat] = useState<"docx" | "pdf">("docx");

// 右侧引用面板状态
const [showRefPanel, setShowRefPanel] = useState(true);
const [activeRefTab, setActiveRefTab] = useState<'kb' | 'ai'>('kb');
const [highlightedCardId, setHighlightedCardId] = useState<number | null>(null);

const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
const chatContainerRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLTextAreaElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

// Toast 自动隐藏
useEffect(() => {
  if (toast.show) {
    const timer = setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [toast.show]);

  // 处理文件上传
  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
  const allowedTypes = ['.txt', '.md', '.docx', '.pdf'];
  const fileName = file.name.toLowerCase();
  const isValidType = allowedTypes.some(ext => fileName.endsWith(ext));
  
  if (!isValidType) {
    setTemplateUploadError('仅支持 .txt, .md, .docx, .pdf 格式');
    return;
  }

    // 检查文件大小
    if (file.size > 50 * 1024 * 1024) {
      setTemplateUploadError('文件大小不能超过 50MB');
      return;
    }

    setIsUploadingTemplate(true);
    setTemplateUploadError(null);

    try {
      let content = '';
      
      if (fileName.endsWith('.docx')) {
        // 解析 docx
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else if (fileName.endsWith('.pdf')) {
        // 解析 pdf — 按段落保留结构，每页之间加分隔符
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // 将每个 item 的文本按行拼接，保留原始间距信息
          const pageLines: string[] = [];
          let currentLine = '';
          let lastY: number | null = null;
          for (const item of textContent.items as any[]) {
            if (typeof item.str !== 'string') continue;
            const itemY = Math.round(item.transform[5]);
            if (lastY !== null && Math.abs(itemY - lastY) > 2) {
              // 换行了，保存上一行
              pageLines.push(currentLine.trim());
              currentLine = item.str;
            } else {
              currentLine += (currentLine ? ' ' : '') + item.str;
            }
            lastY = itemY;
          }
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          text += `[第${i}页]\n` + pageLines.join('\n') + '\n\n';
        }
        content = text;
      } else {
        // 读取 txt 或 md
        content = await file.text();
      }

      // 截断到 15000 字符（约 5000 token，临床方案内容通常很长）
      if (content.length > 15000) {
        content = content.substring(0, 15000) + '\n...[内容过长已截断，仅展示前文]';
      }

      // 检查解析结果是否有效
      if (content.trim().length < 10) {
        setTemplateUploadError(`文件"${file.name}"提取内容为空。如果是扫描版PDF，请尝试上传Word(.docx)或文本(.txt)版本。`);
        setIsUploadingTemplate(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      console.log(`[文件上传] 成功解析 ${file.name}, 提取字数: ${content.length}`);

      setUploadedTemplate({
        name: file.name,
        content: content
      });
      setTemplateUploadError(null); // 清除之前的错误
    } catch (err) {
      setTemplateUploadError(`文件解析失败，支持 .txt、.md、.docx、.pdf 格式`);
      console.error('Template upload error:', err);
    } finally {
      setIsUploadingTemplate(false);
      // 清空 input 以便再次上传同名文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 移除已上传模板
  const handleRemoveTemplate = () => {
    setUploadedTemplate(null);
    setTemplateUploadError(null);
  };

  // 过滤会话
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = sidebarSearchQuery === ""
      ? true
      : (s.title.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
         s.drugName.toLowerCase().includes(sidebarSearchQuery.toLowerCase()));
    return matchesSearch;
  });

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current && activeSession) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeSession?.messages, generationSteps]);

  // 切换会话时更新章节
  useEffect(() => {
    if (activeSession && activeSession.sections && activeSession.sections.length > 0) {
      setActiveChapterId(activeSession.sections[0].id);
      setCurrentStage(activeSession.status);
    }
  }, [activeSessionId]);

  // ============================================================
  // 核心逻辑：处理用户输入（调用真实 LLM）
  // ============================================================
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeSession || isLoading) return;

    const userContent = inputMessage;
    setInputMessage("");

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userContent,
      timestamp: new Date().toISOString(),
    };

    setIsLoading(true);

    // 调试日志：检查上传资料
    console.log('[DEBUG] 发送消息时的上传资料:', {
      hasTemplate: !!uploadedTemplate,
      templateName: uploadedTemplate?.name,
      contentLength: uploadedTemplate?.content?.length || 0,
      contentPreview: uploadedTemplate?.content?.substring(0, 100) || null,
    });

    try {
      const requestBody = {
        userMessage: userContent,
        currentParams: activeSession.params,
        templateContent: uploadedTemplate?.content || null,
        templateName: uploadedTemplate?.name || null,
      };
      
      console.log('[DEBUG] 请求体:', requestBody);
      
      const response = await fetch("/api/aidraft/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("API 调用失败");

      const data = await response.json();
      const extracted = data.extractedParams || {};
      const updatedParams = { ...activeSession.params, ...extracted };
      const filledCount = Object.keys(updatedParams).filter(k => updatedParams[k]).length;
      const requiredFilled = PARAM_FIELDS.filter(f => f.required && updatedParams[f.id]).length;

      userMessage.progress = {
        filled: filledCount,
        total: PARAM_FIELDS.length,
        requiredFilled,
        requiredTotal: PARAM_FIELDS.filter(f => f.required).length,
      };

      const nextStage = data.isComplete ? "ready" : currentStage;
      const aiContent = data.isComplete ? data.completionSummary : data.nextQuestion;

      // 已提取参数归属到 AI 回复消息（不在用户消息中展示）
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: aiContent,
        timestamp: new Date().toISOString(),
        progress: userMessage.progress,
        extractedParams: Object.keys(extracted).length > 0 ? extracted : undefined,
      };

      // 用户消息不再携带 extractedParams
      const updatedSession = {
        ...activeSession,
        title: activeSession.title === "新建临床试验方案" || activeSession.title === "新建方案"
          ? (userContent.length > 20 ? userContent.substring(0, 20) + "..." : userContent)
          : (activeSession.drugName && activeSession.indication
            ? `${activeSession.drugName}${activeSession.indication}${activeSession.phase || ""}方案`
            : activeSession.title),
        drugName: activeSession.drugName || extracted.trial_drug_name || "",
        indication: activeSession.indication || extracted.indication || "",
        phase: activeSession.phase || extracted.trial_phase || "",
        params: updatedParams,
        messages: [...activeSession.messages, userMessage, aiMessage],
        status: nextStage as any,
      };

      updateSession(updatedSession);
      setCurrentStage(nextStage);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "抱歉，AI 服务暂时不可用，请稍后再试。",
        timestamp: new Date().toISOString(),
      };
      updateSession({
        ...activeSession,
        messages: [...activeSession.messages, userMessage, errorMsg],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 更新会话
  const updateSession = (session: DraftSession) => {
    const updated = sessions.map(s => s.id === session.id ? session : s);
    setSessions(updated);
    localStorage.setItem("totrial_draft_sessions_v2", JSON.stringify(updated));
  };

  // 生成草稿（6阶段 SSE 流水线 + 瀑布流展示）
  const handleGenerateDraft = async () => {
    if (!activeSession) return;

    setIsGenerating(true);
    setCurrentStage("validate");
    setGenerationStartedAt(Date.now());

    // 初始化6个阶段的瀑布流步骤（全部 pending）
    const allSteps: GenerationStep[] = [
      { stage: "2", name: "参数完整性校验", detail: "等待开始...", status: "pending" },
      { stage: "3", name: "素材准备", detail: "等待开始...", status: "pending" },
      { stage: "4", name: "核心要素设计", detail: "等待开始...", status: "pending" },
      { stage: "5", name: "章节生成 + 样本量计算", detail: "等待开始...", status: "pending" },
      { stage: "6", name: "整合润色定稿", detail: "等待开始...", status: "pending" },
      { stage: "done", name: "生成完毕", detail: "等待开始...", status: "pending" },
    ];
    setGenerationSteps(allSteps);

    // 阶段序号到步骤索引的映射
    const stageToIndex: Record<string, number> = { "2": 0, "3": 1, "4": 2, "5": 3, "6": 4, "done": 5, "error": 5 };

    try {
      const response = await fetch("/api/aidraft/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          params: activeSession.params,
          templateContent: uploadedTemplate?.content || null 
        }),
      });

      if (!response.ok) throw new Error("生成失败");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let buffer = "";
      let finalSections: DraftSection[] = [];
      let stepStartTime: number | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.stage && data.name && data.status) {
              const idx = stageToIndex[data.stage] ?? -1;

              if (data.status === "running" && idx >= 0) {
                // 标记上一个完成的步骤
                if (stepStartTime !== null) {
                  setGenerationSteps(prev => {
                    const copy = [...prev];
                    // 找到之前 running 的
                    const runningIdx = copy.findIndex(s => s.status === "running");
                    if (runningIdx >= 0 && runningIdx !== idx) {
                      copy[runningIdx] = { ...copy[runningIdx], status: "done", finishedAt: Date.now() };
                    }
                    copy[idx] = { ...copy[idx], status: "running", detail: data.detail || copy[idx].detail, startedAt: Date.now() };
                    return copy;
                  });
                } else {
                  setGenerationSteps(prev => {
                    const copy = [...prev];
                    copy[idx] = { ...copy[idx], status: "running", detail: data.detail || copy[idx].detail, startedAt: Date.now() };
                    return copy;
                  });
                }
                stepStartTime = Date.now();
                setCurrentStage(data.stage === "2" ? "validate" : data.stage === "3" ? "prepare" : data.stage === "4" ? "core_design" : data.stage === "5" ? "parallel_gen" : data.stage === "6" ? "integrate" : "completed");
              } else if (data.status === "done" && idx >= 0) {
                setGenerationSteps(prev => {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], status: "done", detail: data.detail || copy[idx].detail, finishedAt: Date.now() };
                  return copy;
                });
                stepStartTime = null;
              }
            }

            if (data.stage === "done" && data.sections) {
              finalSections = data.sections.map((s: any) => ({
                id: s.id,
                title: s.title,
                content: s.content,
              }));
            }
            if (data.stage === "error") {
              throw new Error(data.detail || "生成失败");
            }
          } catch (parseErr: any) {
            if (parseErr.message?.includes("生成失败")) throw parseErr;
          }
        }
      }

      if (finalSections.length === 0) throw new Error("未生成任何章节");

      // 标记全部完成
      setGenerationSteps(prev => prev.map(s => s.status === "pending" ? { ...s, status: "done" as const, finishedAt: Date.now() } : s));

      // 生成完成后，标题格式：{试验药物名}-试验草案
      const newTitle = activeSession.drugName
        ? `${activeSession.drugName}-试验草案`
        : "试验草案";

      const updatedSession = {
        ...activeSession,
        title: newTitle,
        status: "completed" as const,
        sections: finalSections,
        messages: [
          ...activeSession.messages,
          {
            id: `msg-done-${Date.now()}`,
            role: "assistant" as const,
            content: `✅ 已生成草稿：${activeSession.drugName || ""}${activeSession.indication || ""}临床试验方案，共 ${finalSections.length} 个章节。请在右侧查看完整方案。`,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      updateSession(updatedSession);
      setActiveChapterId(finalSections[0]?.id || "sec-1");
    } catch (error: any) {
      setGenerationSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "error" as const, detail: error.message || "生成失败", finishedAt: Date.now() } : s));
      updateSession({
        ...activeSession,
        status: "ready" as const,
        messages: [
          ...activeSession.messages,
          {
            id: `msg-err-${Date.now()}`,
            role: "assistant" as const,
            content: "抱歉，草稿生成失败，请稍后再试。",
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } finally {
      setIsGenerating(false);
      setCurrentStage("completed");
    }
  };

  // 新建会话
  const handleNewSession = () => {
    const newSession: DraftSession = {
      id: `draft-${Date.now()}`,
      title: "新建临床试验方案",
      drugName: "",
      indication: "",
      phase: "",
      status: "collecting",
      params: {},
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "您好！我是AI临床试验方案起草助手。请告诉我您的试验信息，您可以一次性描述，也可以逐步告诉我。\n\n例如：\n\u2022 \u300c阿帕替尼II期试验，适应症晚期肝癌，对照安慰剂，1类创新药，500mg BID，21天/周期\u300d\n\n或者直接告诉我：\n\u2022 试验药物名称\n\u2022 适应症\n\u2022 试验分期\n\u2022 注册分类\n\u2022 对照方案\n\n开始吧！",
          timestamp: new Date().toISOString(),
          progress: { filled: 0, total: PARAM_FIELDS.length, requiredFilled: 0, requiredTotal: PARAM_FIELDS.filter(f => f.required).length },
        },
      ],
      sections: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("totrial_draft_sessions_v2", JSON.stringify(updated));
    setActiveSessionId(newSession.id);
    setCurrentStage("collecting");
  };

  // 删除会话
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("请至少保留一个方案草案！");
      return;
    }
    if (confirm("确定要删除此方案草案吗？")) {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      localStorage.setItem("totrial_draft_sessions_v2", JSON.stringify(updated));
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // 保存草稿到项目文档
  const handleSaveToProject = () => {
    if (!activeSession) return;
    
    const filename = `[AI草案] ${activeSession.drugName || '未知药物'}_${activeSession.indication || '未知适应症'}_${activeSession.phase || '未知分期'}.docx`;
    
    let customGenerated: any[] = [];
    try {
      const saved = localStorage.getItem("totrial_custom_generated_docs");
      if (saved) customGenerated = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    const newDoc = {
      id: `ai-draft-art-${Date.now()}`,
      name: filename,
      type: "docx",
      size: "185 KB",
      project: selectedProject === "全部" ? "冠心宁片中保临床方案" : selectedProject,
    };

    customGenerated.push(newDoc);
    localStorage.setItem("totrial_custom_generated_docs", JSON.stringify(customGenerated));
    window.dispatchEvent(new Event("totrial_project_changed"));
    
    addToast('success', `已成功保存方案草案"${filename}"到项目文档中！`);
  };

  // 按Enter发送消息
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-gray-50/50 overflow-hidden text-gray-700 font-sans relative">
      {/* ============================================================ */}
      {/* 左侧：历史会话列表 */}
      {/* ============================================================ */}
      <AnimatePresence>
        {!isHistoryCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-[280px] border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden"
          >
            {/* 新建任务按钮 */}
            <div className="p-4 w-full border-b border-gray-100">
              <button
                onClick={handleNewSession}
                className="w-full bg-[#2b64e3] hover:bg-[#1a4eb8] text-white rounded-md py-2.5 text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-[18px] h-[18px] mr-1.5" />
                新建任务
              </button>
            </div>

            {/* 搜索框 */}
            <div className="px-4 py-3 w-full border-b border-gray-100/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索历史任务"
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded text-[13px] outline-none focus:border-blue-400 transition-colors placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 历史任务列表 */}
            <div className="px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              历史任务
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 hide-scrollbar">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-[12px]">
                  未找到匹配的任务
                </div>
              ) : (
                filteredSessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setActiveSessionId(sess.id);
                      }}
                      className={`group relative px-3 py-2 rounded-lg cursor-pointer transition-all font-medium ${
                        isActive
                          ? "bg-blue-50/60 text-[#083190] border border-blue-100"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                      style={{ width: "100%", boxSizing: "border-box", overflow: "hidden" }}
                    >
                      {/* 标题行 */}
                      <div style={{ display: "flex", alignItems: "center", minWidth: 0, paddingRight: 28 }}>
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 mr-2 ${isActive ? "text-[#083190]" : "text-gray-400"}`} />
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1, lineHeight: "1.4" }}>
                          {sess.title}
                        </span>
                      </div>
                      {/* 第二行：分期 + 适应症 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, paddingLeft: 20, minWidth: 0 }}>
                        <span className="bg-blue-50 text-[#083190] px-1.5 py-0.5 rounded font-bold border border-blue-100/30 shrink-0" style={{ fontSize: 9, lineHeight: "1.4" }}>
                          {sess.phase || "待收集"}
                        </span>
                        <span className="text-gray-500" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1, lineHeight: "1.4" }}>
                          {sess.indication || "待填写"}
                        </span>
                      </div>
                      {/* 删除按钮 */}
                      <div className={`absolute flex items-center space-x-0.5 group-hover:opacity-100 opacity-0 transition-opacity rounded p-0.5 ${isActive ? "bg-blue-50/90" : "bg-white/90 group-hover:bg-gray-50/90"}`} style={{ right: 6, top: 6 }}>
                        <button
                          onClick={(e) => handleDeleteSession(sess.id, e)}
                          className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                          title="删除任务"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 底部 spacer */}
            <div className="p-4 shrink-0"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 中间：对话区域 */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col bg-white border-r border-gray-100 overflow-hidden">
        {/* 对话头部 */}
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <div className="min-w-0 flex-1 flex items-center space-x-2">
            {isHistoryCollapsed && (
              <button
                onClick={() => setIsHistoryCollapsed(false)}
                className="p-1 hover:bg-gray-200 rounded text-[#083190] mr-1.5"
                title="展开历史列表"
              >
                <History className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-[13px] font-bold text-gray-800 flex items-center">
                {activeSession?.drugName ? (
                  <Sparkles className="w-4 h-4 text-[#083190] mr-1.5" />
                ) : (
                  <Settings className="w-4 h-4 text-gray-600 mr-1.5" />
                )}
                <span className="truncate">{activeSession?.drugName ? activeSession.title : "新建临床试验方案"}</span>
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                {activeSession?.drugName
                  ? `${activeSession.drugName} · ${activeSession.indication || "未填写"} · ${activeSession.phase || "待收集"}`
                  : "通过对话收集试验参数，AI将引导您完成方案草稿"}
              </p>
            </div>
          </div>

          {/* 生成进度指示器 */}
          {isGenerating && (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-[#083190] animate-spin" />
              <span className="text-[11px] font-bold text-[#083190]">
                {GENERATION_STAGES.find(s => s.id === currentStage)?.name || "生成中..."}
              </span>
            </div>
          )}
        </div>

        {/* 参数收集进度条 — 仅在 collecting 阶段显示 */}
        {activeSession && activeSession.messages.length > 0 && currentStage === "collecting" && (
          <div className="px-5 py-3 border-b border-gray-100 bg-blue-50/15 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#083190] flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                参数收集进度
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {activeSession.messages[activeSession.messages.length - 1]?.progress ? (
                  <>必填：{activeSession.messages[activeSession.messages.length - 1].progress.requiredFilled}/{activeSession.messages[activeSession.messages.length - 1].progress.requiredTotal}</>
                ) : "必填：0/5"}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#083190] to-blue-500 h-full transition-all duration-300"
                style={{
                  width: activeSession.messages[activeSession.messages.length - 1]?.progress
                    ? `${(activeSession.messages[activeSession.messages.length - 1].progress.filled / activeSession.messages[activeSession.messages.length - 1].progress.total) * 100}%`
                    : "0%",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* 对话消息区域 */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
          {/* 对话消息 */}
          {activeSession?.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#f7fef9] border border-gray-50 text-gray-700"
                    : "bg-white border border-gray-100 text-gray-700"
                }`}
              >
                {/* AI 消息：在内容后添加引用角标 */}
                {msg.role === "assistant" && msg.content.includes("统计学") ? (
                  <>
                    <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
                      {msg.content.split("\n\n").map((paragraph, pIdx) => {
                        // 在特定段落末尾添加角标
                        if (paragraph.includes("统计效能")) {
                          return (
                            <p key={pIdx} className="mb-2">
                              {paragraph}
                              <span
                                onClick={() => {
                                  setHighlightedCardId(2);
                                  setShowRefPanel(true);
                                  setTimeout(() => setHighlightedCardId(null), 3000);
                                }}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-[11px] font-bold ml-1 cursor-pointer hover:scale-110 transition-transform align-super"
                              >
                                2
                              </span>
                            </p>
                          );
                        }
                        if (paragraph.includes("样本量")) {
                          return (
                            <p key={pIdx} className="mb-2">
                              {paragraph}
                              <span
                                onClick={() => {
                                  setHighlightedCardId(3);
                                  setShowRefPanel(true);
                                  setTimeout(() => setHighlightedCardId(null), 3000);
                                }}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold ml-1 cursor-pointer hover:scale-110 transition-transform align-super"
                              >
                                3
                              </span>
                            </p>
                          );
                        }
                        if (paragraph.includes("GCP") || paragraph.includes("法规")) {
                          return (
                            <p key={pIdx} className="mb-2">
                              {paragraph}
                              <span
                                onClick={() => {
                                  setHighlightedCardId(1);
                                  setShowRefPanel(true);
                                  setTimeout(() => setHighlightedCardId(null), 3000);
                                }}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold ml-1 cursor-pointer hover:scale-110 transition-transform align-super"
                              >
                                1
                              </span>
                            </p>
                          );
                        }
                        return <p key={pIdx} className="mb-2">{paragraph}</p>;
                      })}
                    </div>

                    {/* 查看引用来源按钮 */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowRefPanel(true);
                          setActiveRefTab('kb');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        查看引用来源（3 个段落，2 个文件）
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                )}

                {msg.extractedParams && Object.keys(msg.extractedParams).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200/30">
                    <div className="text-[10px] text-gray-500 mb-1">已提取参数：</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(msg.extractedParams).map(([key, value]) => (
                        <span key={key} className="bg-blue-50 text-[#083190] px-2 py-0.5 rounded text-[10px] border border-blue-100/50">
                          {PARAM_FIELDS.find(f => f.id === key)?.label}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-[9px] mt-1 text-gray-400">
                  {(() => {
                    try {
                      const d = new Date(msg.timestamp);
                      return isNaN(d.getTime()) ? msg.timestamp : d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
                    } catch { return msg.timestamp; }
                  })()}
                </div>
              </div>
            </div>
          ))}

          {/* 生成中瀑布流 */}
          {isGenerating && (
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 max-w-[560px]">
              <WaterfallDisplay steps={generationSteps} currentStageId={currentStage} startedAt={generationStartedAt} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="p-4 bg-white shrink-0">
          {currentStage === "ready" && activeSession?.status === "ready" && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center text-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span className="text-[12px] font-bold">所有必填参数已收集完毕，可以生成方案草稿</span>
              </div>
              <button
                onClick={handleGenerateDraft}
                disabled={isGenerating}
                className="bg-[#083190] hover:bg-blue-900 disabled:bg-gray-300 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold flex items-center transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                生成草稿
              </button>
            </div>
          )}

          {/* 隐藏的模板文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.docx,.pdf"
            onChange={handleTemplateUpload}
            className="hidden"
          />

          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入试验信息，例如：阿帕替尼II期试验，适应症晚期肝癌..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pb-12 text-[13px] outline-none focus:border-[#083190] focus:ring-1 focus:ring-blue-100 transition-all resize-none"
              disabled={isGenerating}
            />
            {/* 底部工具栏：左侧"+"上传模板，右侧发送按钮 */}
            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* "+"上传方案模板按钮 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating || isUploadingTemplate}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[#083190] disabled:bg-gray-50 disabled:text-gray-300 text-gray-500 transition-colors"
                  title="上传方案模板（支持 txt/md/docx/pdf）"
                >
                  {isUploadingTemplate ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
                {uploadedTemplate && (
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {uploadedTemplate.name}
                  </span>
                )}
                {templateUploadError && (
                  <span className="text-[11px] text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {templateUploadError}
                  </span>
                )}
              </div>
              {/* 发送按钮 */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isGenerating}
                className="p-2 bg-[#083190] hover:bg-blue-900 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
            <span>按 Enter 发送，Shift + Enter 换行</span>
            <span className="flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              支持一次性输入多个参数，AI会自动提取
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 右侧：引用来源面板 / 方案草稿展示（Tab 切换） */}
      {/* ============================================================ */}
      <aside className="w-[400px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
        {/* 顶部 Tab 栏 */}
        <div className="flex items-center border-b border-gray-200 shrink-0">
          <button
            onClick={() => setActiveRefTab('kb')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeRefTab === 'kb'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-blue-600 border-b-2 border-transparent'
            }`}
          >
            项目知识库
          </button>
          <button
            onClick={() => setActiveRefTab('ai')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeRefTab === 'ai'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-blue-600 border-b-2 border-transparent'
            }`}
          >
            AI产物
          </button>
        </div>

        {/* Tab 内容 */}
        {activeRefTab === 'kb' ? (
          /* ========== 项目知识库 Tab ========== */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* 面板标题 */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-800">引用来源</h3>
              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {MOCK_FILE_GROUPS.reduce((sum, g) => sum + g.citations.length, 0)} 个段落
              </span>
            </div>

            {/* 文件分组列表 */}
            <div className="flex-1 overflow-y-auto">
              {MOCK_FILE_GROUPS.map((group, gi) => (
                <div key={gi} className="border-b border-gray-100 last:border-b-0">
                  {/* 文件分组头 */}
                  <div className="px-4 py-3 bg-gray-50 flex items-center gap-3 hover:bg-gray-100 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      group.fileType === 'pdf'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {group.fileType.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900 truncate">{group.fileName}</div>
                      <div className="text-[11px] text-gray-500">{group.citations.length} 个引用段落</div>
                    </div>
                    <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {group.citations.length} 引用
                    </span>
                  </div>

                  {/* 引用卡片 */}
                  <div className="px-3 py-2 space-y-2">
                    {group.citations.map((cite) => {
                      const colorMap = {
                        blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500', shadow: 'shadow-blue-100' },
                        pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-500', shadow: 'shadow-pink-100' },
                        green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', shadow: 'shadow-green-100' },
                        amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-500', shadow: 'shadow-amber-100' },
                      };
                      const c = colorMap[cite.color];
                      const isHighlighted = highlightedCardId === cite.id;

                      return (
                        <div
                          key={cite.id}
                          id={`cite-card-${cite.id}`}
                          onClick={() => {
                            setHighlightedCardId(cite.id);
                            setTimeout(() => setHighlightedCardId(null), 3000);
                          }}
                          className={`border rounded-lg bg-white overflow-hidden transition-all duration-200 cursor-pointer ${
                            isHighlighted
                              ? `${c.border} border-2 shadow-md ${c.shadow}`
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          {/* 卡片头 */}
                          <div className="px-3 py-2 flex items-center gap-2 bg-gray-50 border-b border-gray-100">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${c.bg} ${c.text}`}>
                              {cite.id}
                            </span>
                            <span className="text-[12px] text-gray-600 flex-1 truncate">{cite.title}</span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                              P.{cite.page}
                            </span>
                          </div>
                          {/* 卡片体 */}
                          <div className="px-3 py-2.5 text-[12px] text-gray-700 leading-relaxed">
                            {cite.content}
                          </div>
                          {/* 卡片脚 */}
                          <div className="px-3 py-1.5 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-400">
                            <FileText className="w-3 h-3" />
                            <span>{cite.fileName}</span>
                            <span>·</span>
                            <span>第 {cite.page} 页</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ========== AI产物 Tab ========== */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileDown className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">暂无 AI 产物</div>
            <div className="text-xs text-gray-400">完成方案生成后，AI 产物将在此处展示</div>
          </div>
        )}
      </aside>

      {/* ============================================================ */}
      {/* 最右侧：方案草稿展示（只在有草稿时显示） */}
      {/* ============================================================ */}
      {activeSession?.sections && activeSession.sections.length > 0 && (
        <div className="w-[500px] flex flex-col bg-white overflow-hidden shrink-0">
          {/* 草稿头部 */}
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-[13px] font-bold text-gray-800 flex items-center">
                <FileText className="w-4 h-4 text-[#083190] mr-1.5" />
                方案草稿预览
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                {activeSession.drugName && activeSession.indication ? (
                  <>
                    {activeSession.drugName} · {activeSession.indication} · {activeSession.phase}
                  </>
                ) : (
                  "等待生成"
                )}
              </p>
            </div>
          </div>

          {/* 草稿内容区域 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 章节内容 */}
            <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
              <div className="bg-white border border-gray-100 max-w-2xl w-full min-h-[95%] p-8 shadow-sm relative">
                {/* 文档水印 */}
                <div className="border-b border-gray-100 pb-3 mb-6 flex justify-between items-center text-[10px] text-gray-400 select-none">
                  <span>LINTONG TRIAL AI DRAFT ENGINE</span>
                  <span className="font-mono">Page 1 of {activeSession.sections.length} · Confidential</span>
                </div>

                {/* 显示所有章节 */}
                {activeSession.sections.map((sec) => (
                    <div key={sec.id} className="flex-1 flex flex-col mb-6">
                      <h3 className="text-[16px] font-bold text-[#083190] mb-4 pb-2 border-b border-gray-100">
                        {sec.title}
                      </h3>
                      <div
                        className="text-[13px] text-gray-700 leading-relaxed font-sans bg-white select-text"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(sec.content) }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 底部导出按钮 */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <button
              onClick={() => alert("正在导出方案 Word 版并下载成功...")}
              className="w-full bg-[#083190] hover:bg-blue-900 text-white rounded-lg py-3 text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              导出草稿
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
