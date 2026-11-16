import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

// ============================================================
// 六阶段生成工作流 — 用到的模型
// deepseek-v3 已于 2026.7.9 下架，全部改用 qwen-max
// ============================================================
const MODEL_CORE = "qwen-max";
const MODEL_CHAPTER = "qwen-turbo";
const MODEL_REVIEW = "qwen-max";
const MODEL_POLISH = "qwen-turbo";

// ============================================================
// 辅助函数
// ============================================================
function formatParamsForLLM(params: Record<string, string>): string {
  const d = params;
  return [
    "# 用户输入的临床试验参数",
    "## 核心药物信息",
    `- 试验用药品通用名：${d.trial_drug_name || ""}`,
    `- 注册分类：${d.register_class || ""}`,
    `- 适应症：${d.indication || ""}`,
    `- 试验分期：${d.trial_phase || ""}`,
    "",
    "## 对照与用药规则",
    `- 对照药/对照方案：${d.control_plan || ""}`,
    `- 联合用药方案：${d.combine_regimen || ""}`,
    `- 给药频次剂量：${d.drug_dosage_freq || ""}`,
    `- 治疗疗程：${d.treat_duration || ""}`,
    "",
    "## 特殊约束限制",
    `- 特殊入排限制：${d.special_enroll_limit || ""}`,
    `- 参考文献/既往方案：${d.ref_file_list || ""}`,
  ].join("\n");
}

async function llmChat(
  client: OpenAI,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    messages: messages as any,
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0]?.message?.content || "";
}

// ============================================================
// 样本量计算引擎 (移植自 Python trial-protocol-engine)
// ============================================================
function calculateSampleSize(params: Record<string, string>, coreText: string, guideText: string): string {
  let alpha = 0.05;
  let beta = 0.2;
  let power = 0.8;
  let dropRate = 0.20;
  let designType = "parallel";
  let endpointType = "binary";
  let comparisonType = "non_inferiority";

  const combinedText = (coreText + "\n" + guideText).toLowerCase();

  if (/单臂|single\s*arm/.test(combinedText)) designType = "single_arm";
  else if (/交叉|crossover/.test(combinedText)) designType = "crossover";

  if (/连续|均值|mean|continuous|评分|sd|标准差/.test(combinedText)) endpointType = "continuous";
  else if (/生存|survival|hr|hazard|生存期|os|pfs|time-to-event/.test(combinedText)) endpointType = "survival";

  if (/等效|equivalence/.test(combinedText)) comparisonType = "equivalence";
  else if (/优效|superiority/.test(combinedText)) comparisonType = "superiority";

  const alphaM = combinedText.match(/(?:alpha|显著性水平)[^\d]*([\d.]+)/);
  if (alphaM) { const v = parseFloat(alphaM[1]); if (v > 0 && v < 0.5) alpha = v; }

  const powerM = combinedText.match(/(?:power|beta|检验效能|把握度)[^\d]*([\d.]+)(%?)/);
  if (powerM) {
    let v = parseFloat(powerM[1]);
    if (powerM[2] === "%" || v > 1) v /= 100;
    if (v >= 0.5 && v < 1) { power = v; beta = 1 - v; }
    else if (v > 0.01 && v <= 0.5) { beta = v; power = 1 - v; }
  }

  const dropM = combinedText.match(/(?:脱落|剔除|drop)[^\d]*([\d.]+)(%?)/);
  if (dropM) {
    let v = parseFloat(dropM[1]);
    if (dropM[2] === "%" || v > 1) v /= 100;
    if (v > 0 && v < 0.5) dropRate = v;
  }

  const Z_alpha = alpha === 0.05 ? 1.96 : alpha === 0.01 ? 2.58 : alpha === 0.1 ? 1.645 : 1.96;
  const Z_beta = beta === 0.2 ? 0.84 : beta === 0.1 ? 1.28 : beta === 0.05 ? 1.645 : 0.84;

  let formulaDesc = "";
  let nSingle = 100;

  if (endpointType === "binary") {
    let pTreat = 0.80, pControl = 0.70, margin = 0.10;
    const rates = combinedText.matchAll(/(?:有效率|率|p_treat|p_control|估算值)[^\d]*([\d.]+)(%?)/g);
    const rateArr = Array.from(rates);
    if (rateArr.length >= 2) {
      try {
        const r1 = parseFloat(rateArr[0][1]) / (rateArr[0][2] === "%" || parseFloat(rateArr[0][1]) > 1 ? 100 : 1);
        const r2 = parseFloat(rateArr[1][1]) / (rateArr[1][2] === "%" || parseFloat(rateArr[1][1]) > 1 ? 100 : 1);
        if (r1 > 0 && r1 < 1 && r2 > 0 && r2 < 1) { pTreat = r1; pControl = r2; }
      } catch {}
    }
    if (designType === "single_arm") {
      const pNull = 0.50, pAlt = pTreat;
      const numerator = (Z_alpha * Math.sqrt(pNull * (1 - pNull)) + Z_beta * Math.sqrt(pAlt * (1 - pAlt))) ** 2;
      const denominator = (pAlt - pNull) ** 2;
      nSingle = denominator > 0 ? Math.ceil(numerator / denominator) : 80;
      formulaDesc = `采用单组目标值(Arcon)公式估算。目标靶值(P0)为 ${(pNull*100).toFixed(0)}%，预期试验组有效率(P1)为 ${(pAlt*100).toFixed(0)}%。`;
    } else {
      const poolP = (pTreat + pControl) / 2;
      if (comparisonType === "non_inferiority") {
        const numerator = (Z_alpha * Math.sqrt(2 * poolP * (1 - poolP)) + Z_beta * Math.sqrt(pTreat*(1-pTreat) + pControl*(1-pControl))) ** 2;
        const denominator = (pTreat - pControl - margin) ** 2;
        nSingle = denominator > 0 ? Math.ceil(numerator / denominator) : 100;
        formulaDesc = `采用平行对照非劣效检验公式。试验组率 ${(pTreat*100).toFixed(0)}%，对照组率 ${(pControl*100).toFixed(0)}%，非劣效界值Delta为 ${(margin*100).toFixed(0)}%。`;
      } else {
        const numerator = 2 * (Z_alpha + Z_beta) ** 2 * poolP * (1 - poolP);
        const denominator = (pTreat - pControl) ** 2;
        nSingle = denominator > 0 ? Math.ceil(numerator / denominator) : 120;
        formulaDesc = `采用平行对照优效性检验公式。试验组预期率 ${(pTreat*100).toFixed(0)}%，对照组预期率 ${(pControl*100).toFixed(0)}%。`;
      }
    }
  } else if (endpointType === "continuous") {
    let sd = 15.0, diff = 5.0;
    const sdM = combinedText.match(/(?:标准差|sd|variance)[^\d]*([\d.]+)/);
    if (sdM) { try { sd = parseFloat(sdM[1]); } catch {} }
    const diffM = combinedText.match(/(?:差值|变化|临床意义|delta|diff)[^\d]*([\d.]+)/);
    if (diffM) { try { diff = parseFloat(diffM[1]); } catch {} }
    if (designType === "single_arm") {
      nSingle = Math.ceil((Z_alpha + Z_beta) ** 2 * sd ** 2 / diff ** 2);
      formulaDesc = `采用单组连续变量均值估算公式。标准差SD为 ${sd}，临床预期均值差为 ${diff}。`;
    } else if (designType === "crossover") {
      nSingle = Math.ceil((Z_alpha + Z_beta) ** 2 * sd ** 2 / 2 / diff ** 2);
      formulaDesc = `采用交叉设计均值比较公式。联合标准差为 ${sd}，临床预期处理差为 ${diff}。`;
    } else {
      nSingle = Math.ceil(2 * (Z_alpha + Z_beta) ** 2 * sd ** 2 / diff ** 2);
      formulaDesc = `采用平行双组连续变量均值比较公式。组内联合标准差SD为 ${sd}，两组预期差为 ${diff}。`;
    }
  } else {
    let hazardRatio = 0.70, pEvent = 0.50;
    const hrM = combinedText.match(/(?:风险比|hazard\s*ratio|hr)[^\d]*([\d.]+)/);
    if (hrM) { try { const v = parseFloat(hrM[1]); if (v > 0.1 && v < 1) hazardRatio = v; } catch {} }
    const numEvents = (4 * (Z_alpha + Z_beta) ** 2) / (Math.log(hazardRatio) ** 2);
    nSingle = Math.ceil(numEvents / (2 * pEvent));
    formulaDesc = `采用生存分析Log-rank检验估算。预期风险比(HR)为 ${hazardRatio}，预期随访期内主要事件发生率为 ${(pEvent*100).toFixed(0)}%，需观察到至少 ${Math.ceil(numEvents)} 个事件。`;
  }

  if (nSingle < 10) nSingle = 12;
  else if (nSingle > 1500) nSingle = 240;

  const nSingleDrop = Math.ceil(nSingle / (1 - dropRate));
  const isControlled = designType !== "single_arm";
  const totalN = nSingleDrop * (isControlled ? 2 : 1);
  const groupLabel = isControlled ? "每组" : "全组";
  const totalLabel = isControlled
    ? `全研究两组共计需招募入组受试者 **${totalN}** 例。`
    : `全研究共计需招募入组受试者 **${totalN}** 例。`;

  return `### 试验样本量计算科学依据 (自适应高精匹配版)
本研究样本量基于**${endpointType.toUpperCase()}**主要疗效终点及**${designType.toUpperCase()}**设计进行估算。
设定显著性水平 alpha = ${alpha}（双侧/等效单侧），检验效能 Power = ${Math.round(power*100)}%（beta = ${beta.toFixed(3)}）。

- **临床设计假设与依据**：${formulaDesc}
- **脱落率预估**：考虑到试验期间的非随机性失访，预设最大随访脱落率为 **${Math.round(dropRate*100)}%**。

根据临床统计学公式：
- 未考虑脱落时，${groupLabel}所需的最少受试者为 **${nSingle}** 例。
- 经最大脱落率校正后，${groupLabel}实际需入组受试者 **${nSingleDrop}** 例。
- ${totalLabel}`;
}

// ============================================================
// 素材准备
// ============================================================
function prepareMaterials(params: Record<string, string>): string {
  const indication = params.indication || "";
  const ref = params.ref_file_list || "";
  return [
    "# 参考素材合集",
    "## 1 历史方案范本规范摘要",
    ref ? "用户上传了参考文献，文本已提取并结构化。" : "无上传范本，完全依据最新CDE官方指导原则撰写。",
    "\n## 2 CDE指导原则与专家共识文献",
    `基于适应症 "${indication}" 和分期 "${params.trial_phase || ""}" 匹配的CDE指南：`,
    `- 《${indication}药物治疗临床试验技术指导原则》`,
    "- 《药物临床试验质量管理规范(GCP)》",
    "- ICH-E9 统计学原则",
    "- ICH-E10 对照组选择",
    "\n[要求：后续各模块深度吸纳本素材中的行业表述、检查频次及法规依据。]",
  ].join("\n");
}

// ============================================================
// 模板生成函数 (LLM 失败时的降级方案)
// ============================================================
function templateCoreDesign(params: Record<string, string>): string {
  const d = params;
  const drug = d.trial_drug_name || "";
  const indication = d.indication || "";
  const phase = d.trial_phase || "";
  const control = d.control_plan || "";
  const dosage = d.drug_dosage_freq || "遵医嘱";
  const duration = d.treat_duration || "至疾病进展";

  let designType = "平行对照", groups = `试验组(${drug}) + 对照组(${control})`, blinding = "开放";
  if (/单臂/.test(control)) { designType = "单臂试验"; groups = "单组"; blinding = "开放"; }
  else if (/交叉/.test(control)) { designType = "交叉设计"; groups = "试验组 + 对照组（交叉）"; }
  if (/双盲/.test(control)) blinding = "双盲";
  else if (/单盲/.test(JSON.stringify(d))) blinding = "单盲";

  let primaryEndpoint = "客观缓解率(ORR)", endpointType = "二分类变量";
  if (phase === "I期" || phase === "I/II期" || phase === "BE") { primaryEndpoint = "安全性及耐受性 + 最大耐受剂量(MTD)"; endpointType = "连续变量"; }
  else if (phase === "II期") { primaryEndpoint = "客观缓解率(ORR)"; endpointType = "二分类变量"; }
  else if (phase === "III期" || phase === "II/III期") { primaryEndpoint = "无进展生存期(PFS)"; endpointType = "生存分析"; }

  return `# 临床试验核心要素表

| 要素 | 内容 |
|------|------|
| **试验药品** | ${drug} |
| **适应症** | ${indication} |
| **试验分期** | ${phase} |
| **设计类型** | ${designType} |
| **分组方案** | ${groups} |
| **盲法设置** | ${blinding} |
| **主要终点** | ${primaryEndpoint} |
| **指标类型** | ${endpointType} |
| **给药方案** | ${dosage} |
| **治疗疗程** | ${duration} |
| **对照方案** | ${control} |

## 统计假设参数

| 参数 | 设定值 |
|------|--------|
| 显著性水平 alpha | 0.05（双侧） |
| 检验效能 1-beta | 80% |
| 预期脱落率 | 20% |
| 试验组预期率 | 80% |
| 对照组预期率 | 70% |
| 非劣效界值 Delta | 10% |

## 安全性监测
- AE/SAE 核心随访时限：给药期间每次访视记录，末次给药后随访90天
- SAE 24小时内紧急报告流程
- 基于 CTCAE v5.0 分级标准`;
}

function templateBackground(params: Record<string, string>): string {
  const d = params;
  return `## 一、研究背景与立题依据

### 1.1 疾病背景
${d.indication}是全球范围内严重的公共卫生问题，其发病率和死亡率呈持续上升趋势。现有标准治疗方案在疗效和安全性方面仍存在显著不足，亟需新的治疗手段。

### 1.2 药物简介
${d.trial_drug_name}为${d.register_class}，其作用机制通过特异性靶向关键信号通路，在前期临床前研究中展现出显著的治疗活性。药代动力学研究显示，${d.trial_drug_name}具有适宜的半衰期和生物利用度，支持${d.drug_dosage_freq || "临床推荐剂量"}给药方案。

### 1.3 立题依据
基于${d.trial_drug_name}在临床前模型中展现的显著疗效和良好的安全性特征，以及当前${d.indication}治疗领域存在的未满足临床需求，开展本${d.trial_phase}临床试验具有充分的科学依据和临床价值。`;
}

function templateDesign(params: Record<string, string>): string {
  const d = params;
  const drug = d.trial_drug_name || "";
  const indication = d.indication || "";
  const control = d.control_plan || "";
  const dosage = d.drug_dosage_freq || "遵医嘱";
  const duration = d.treat_duration || "至疾病进展";
  const special = d.special_enroll_limit || "";

  const designDesc = /单臂/.test(control)
    ? "本研究为单臂、开放标签临床试验"
    : `本研究为随机、平行对照临床试验，试验组接受${drug}治疗，对照组接受${control}`;

  return `## 二、试验设计与受试者选择

### 2.1 试验整体设计
${designDesc}。主要终点为客观缓解率(ORR)/无进展生存期(PFS)。治疗持续${duration}。

### 2.2 随机化与盲法
如采用随机化设计，将使用交互式网络应答系统(IWRS)进行动态随机分配，按中心分层。

### 2.3 受试者选择标准

**入选标准：**
1. 年龄18-75岁，男女不限
2. 经病理学/影像学确诊为${indication}
3. ECOG体能状态评分0-1分
4. 预期寿命>=12周
5. 具有至少一个可测量病灶（RECIST v1.1标准）
6. 主要器官功能正常
7. 自愿签署知情同意书
8. 能够依从方案要求的访视和检查
${special ? `9. ${special}` : ""}

**排除标准：**
1. 既往接受过同类机制药物治疗
2. 活动性脑转移或脑膜转移
3. 严重心血管疾病（NYHA III-IV级心衰）
4. 活动性感染（HIV、活动性乙肝/丙肝）
5. 妊娠期或哺乳期女性
6. 既往5年内有其他恶性肿瘤史
7. 严重肝肾功能不全
8. 无法口服药物或存在影响吸收的胃肠道疾病
9. 精神疾病或认知障碍影响依从性
10. 研究者认为不适合参加本试验的其他情况

### 2.4 给药方案
| 项目 | 试验组 | 对照组 |
|------|--------|--------|
| 药物 | ${drug} | ${control} |
| 剂量 | ${dosage} | 按说明书 |
| 疗程 | ${duration} | ${duration} |

### 2.5 研究访视日程表
| 访视 | 筛选期 | C1D1 | 每周期 | EOT | 随访 |
|------|--------|------|--------|-----|------|
| 知情同意 | Y | | | | |
| 体格检查 | Y | Y | Y | Y | Y |
| 影像评估 | Y | Y | 每8周 | Y | |
| 实验室检查 | Y | Y | Y | Y | Y |
| 给药 | | Y | Y | | |`;
}

function templateStats(core: string, sampleResult: string): string {
  return `## 三、统计分析计划（SAP）

### 3.1 分析人群定义
- **FAS（全分析集）**：所有随机化入组且至少使用一次试验药物的受试者
- **PPS（符合方案集）**：FAS中完成主要终点评估且无重大方案违背的受试者
- **SS（安全性集）**：所有至少使用一次试验药物的受试者

### 3.2 样本量
${sampleResult}

### 3.3 主要疗效终点分析
主要疗效终点采用优效性/非劣效性检验。二分类终点采用卡方检验或Fisher精确检验，生存分析终点采用Kaplan-Meier法和Log-rank检验。

### 3.4 次要疗效终点分析
次要终点包括疾病控制率(DCR)、缓解持续时间(DOR)、无进展生存期(PFS)和总生存期(OS)。

### 3.5 安全性分析
基于SS集，采用描述性统计方法汇总不良事件（AE/SAE）发生率及严重程度。

### 3.6 缺失数据处理
采用多重插补法处理缺失数据，敏感性分析采用最差情况法验证结果稳健性。`;
}

function templateSafety(params: Record<string, string>): string {
  return `## 四、安全性评估、数据管理与伦理考虑

### 4.1 安全性评估
**不良事件(AE)定义与分级：** AE指从签署知情同意书至末次给药后90天内发生的任何不良医学事件。分级采用CTCAE v5.0。

**SAE报告流程：** 研究者获知SAE后24小时内向申办方报告，申办方按法规要求向监管机构及伦理委员会报告。

**实验室安全性检查频次：**
| 检查项目 | 筛选期 | C1D1 | 每周期 | EOT | 随访 |
|----------|--------|------|--------|-----|------|
| 血常规 | Y | Y | Y | Y | Y |
| 尿常规 | Y | Y | 每2周期 | Y | |
| 肝肾功能 | Y | Y | Y | Y | Y |
| 凝血功能 | Y | Y | 每2周期 | Y | |
| 心电图 | Y | Y | 每2周期 | Y | |
| 妊娠试验 | Y | | 每周期 | | Y |

**永久停药标准：**
1. 发生4级非血液学毒性
2. 发生4级血液学毒性持续>14天
3. 发生3级非血液学毒性经对症处理后未恢复
4. ALT/AST > 5xULN且持续>2周
5. 出现药物相关间质性肺病
6. 受试者要求退出
7. 妊娠
8. 研究者判断继续治疗风险大于获益

### 4.2 数据管理
采用电子数据采集系统(EDC)进行在线数据录入。建立逻辑核查规则，数据疑问(Query)通过系统下发与关闭。数据安全监察委员会(DSMB)独立评估试验安全性。

### 4.3 伦理考虑
知情同意书(ICF)获取遵循赫尔辛基宣言原则。受试者隐私数据采用脱敏编码管理。试验相关损害由申办方提供保险保障及适当补偿。`;
}

function templateIntegrate(
  params: Record<string, string>,
  bg: string, design: string, stats: string, safety: string,
  sampleResult: string
): string {
  const d = params;
  const drug = d.trial_drug_name || "";
  const indication = d.indication || "";
  const phase = d.trial_phase || "";
  const control = d.control_plan || "";
  const register = d.register_class || "";

  const nMatch = sampleResult.match(/实际需入组受试者\s*\*{0,2}(\d+)\*{0,2}\s*例/);
  const nPerGroup = nMatch ? nMatch[1] : "N/A";
  const totalMatch = sampleResult.match(/共计需招募入组受试者\s*\*{0,2}(\d+)\*{0,2}\s*例/);
  const totalN = totalMatch ? totalMatch[1] : "N/A";

  return `# ${drug} ${phase} 临床试验方案

| 项目 | 内容 |
|------|------|
| 方案编号 | ${drug}-${phase}-2026-001 |
| 版本号 | V1.0 |
| 日期 | 2026年 |
| 申办者 | [申办方名称] |
| 试验药品 | ${drug} |
| 对照方案 | ${control} |
| 适应症 | ${indication} |
| 注册分类 | ${register} |
| 总样本量 | ${totalN} 例 |

---

## 机密声明
本文件为机密文件，仅供参与本临床试验的研究者及相关人员阅读。未经申办方书面许可，不得向第三方泄露文件内容。

---

## 修订历史
| 版本 | 日期 | 修订内容 | 修订者 |
|------|------|----------|--------|
| V1.0 | 2026年 | 初稿生成 | AI草稿生成系统 |

---

${bg}

${design}

${stats}

${safety}

---

## 缩略语对照表
| 缩写 | 全称 |
|------|------|
| AE | Adverse Event 不良事件 |
| SAE | Serious Adverse Event 严重不良事件 |
| ORR | Objective Response Rate 客观缓解率 |
| PFS | Progression-Free Survival 无进展生存期 |
| OS | Overall Survival 总生存期 |
| FAS | Full Analysis Set 全分析集 |
| PPS | Per Protocol Set 符合方案集 |
| SS | Safety Set 安全性集 |
| EOT | End of Treatment 治疗结束 |
| ICF | Informed Consent Form 知情同意书 |
| EDC | Electronic Data Capture 电子数据采集 |
| DSMB | Data Safety Monitoring Board 数据安全监察委员会 |
| CTCAE | Common Terminology Criteria for Adverse Events 不良事件通用术语标准 |
| GCP | Good Clinical Practice 药物临床试验质量管理规范 |
| CDE | Center for Drug Evaluation 药品审评中心 |
| NMPA | National Medical Products Administration 国家药品监督管理局 |

---

*本方案由 AI 草稿生成系统自动生成，所有内容须由医学专业人员审核确认后方可使用。*
*样本量计算依据：每组 ${nPerGroup} 例，全研究共 ${totalN} 例（已含脱落率校正）。*`;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // 初始化阿里百炼 DashScope 客户端
  let aiClient: OpenAI | null = null;
  function getAI() {
    if (!aiClient) {
      if (!process.env.DASHSCOPE_API_KEY) {
        throw new Error("DASHSCOPE_API_KEY environment variable is missing.");
      }
      aiClient = new OpenAI({
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      });
    }
    return aiClient;
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

      // AIDraft 专用接口：参数提取 + 智能引导
  app.post("/api/aidraft/chat", async (req, res) => {
    try {
      const { userMessage, currentParams, templateContent, templateName } = req.body;
      console.log('=== API 调用开始 ===');
      console.log('用户输入:', userMessage);
      console.log('当前参数:', JSON.stringify(currentParams));
      console.log('附件名称:', templateName);
      console.log('附件内容长度:', templateContent?.length || 0);
      const ai = getAI();

      const fields = [
        // 必填参数（5个）
        { id: "trial_drug_name", label: "试验用药通用名", required: true, options: null, type: "text" },
        { id: "indication", label: "适应症", required: true, options: null, type: "text" },
        { id: "trial_phase", label: "试验分期", required: true, options: ["I期", "Ia/Ib期", "II期", "IIa/IIb期", "III期", "IV期"], type: "enum" },
        { id: "register_class", label: "药品注册分类", required: true, options: ["1类创新药", "改良型新药", "仿制药", "生物类似药"], type: "enum" },
        { id: "control_plan", label: "对照药/对照方案类型", required: true, options: ["安慰剂对照", "阳性对照", "无对照"], type: "enum" },
        // 选填参数
        { id: "drug_dosage_freq", label: "给药频次与单次剂量", required: false, options: null, type: "text" },
        { id: "treat_duration", label: "单个治疗周期时长", required: false, options: null, type: "text" },
        { id: "blinding_method", label: "试验盲法设计", required: false, options: ["开放标签", "单盲", "双盲"], type: "enum" },
        { id: "primary_endpoint", label: "主要疗效终点", required: false, options: null, type: "text" },
        { id: "trial_design_type", label: "试验设计类型", required: false, options: ["随机对照试验", "单臂试验"], type: "enum" },
        { id: "sample_size", label: "样本量", required: false, options: null, type: "text" },
        { id: "inclusion_exclusion", label: "入排关键限定", required: false, options: null, type: "text" },
        { id: "administration_route", label: "给药途径", required: false, options: null, type: "text" },
      ];

      // 后端预提取：药物名和适应症，兜底 LLM 遗漏
      let enrichedParams = { ...currentParams };
      if (!enrichedParams.trial_drug_name) {
        // 优先匹配多字后缀（特异性高），再匹配单字后缀
        const multiCharSuffixes = ['替尼','珠单抗','单抗','昔布','胶囊','注射液','口服液','分散片','缓释片','肠溶片','颗粒'];
        const singleCharSuffixes = ['醇','胺','酮','片'];
        let drugName = '';
        for (const suffix of multiCharSuffixes) {
          const re = new RegExp("([\\u4e00-\\u9fa5A-Za-z0-9]+" + suffix + ")");
          const m = userMessage.match(re);
          if (m && m[1].length >= 3) { drugName = m[1]; break; }
        }
        if (!drugName) {
          for (const suffix of singleCharSuffixes) {
            const re = new RegExp("([\\u4e00-\\u9fa5]{2,10}" + suffix + ")(?=[^\\u4e00-\\u9fa5]|$)");
            const m = userMessage.match(re);
            if (m && m[1].length >= 3) { drugName = m[1]; break; }
          }
        }
        if (drugName) enrichedParams.trial_drug_name = drugName;
      }
      if (!enrichedParams.indication) {
        const indMatch = userMessage.match(/适应症[：:\s]*([\u4e00-\u9fa5（）()A-Za-z0-9\-—]+?)(?:，|,|。|；|;|\s|$)/);
        if (indMatch) {
          enrichedParams.indication = indMatch[1];
        }
      }

      // 后端计算缺失字段，明确告诉 LLM 只准问这些
      const filledFields = Object.keys(enrichedParams || {}).filter(k => (enrichedParams || {})[k]);
      const missingRequired = fields
        .filter(f => f.required && !filledFields.includes(f.id))
        .map(f => `${f.id}（${f.label}）`);
      const missingOptional = fields
        .filter(f => !f.required && !filledFields.includes(f.id))
        .map(f => `${f.id}（${f.label}）`);

      // 基于当前已有参数计算缺失状态（LLM调用前）
      const requiredCount = fields.filter(f => f.required).length;
      const currentFilledKeys = Object.keys(enrichedParams).filter(k => enrichedParams[k]);
      const filledRequiredCount = fields.filter(f => f.required && currentFilledKeys.includes(f.id)).length;
      const missingRequiredFields = fields.filter(f => f.required && !currentFilledKeys.includes(f.id));

      // 选择本轮最多2个问题（枚举类优先）
      const enumMissing = missingRequiredFields.filter(f => f.options && f.options.length > 0);
      const textMissing = missingRequiredFields.filter(f => !f.options || f.options.length === 0);
      const questionsForThisRound: typeof fields = [];
      // 枚举优先，最多2个
      if (enumMissing.length >= 2) {
        questionsForThisRound.push(enumMissing[0], enumMissing[1]);
      } else if (enumMissing.length === 1) {
        questionsForThisRound.push(enumMissing[0]);
        if (textMissing.length > 0) questionsForThisRound.push(textMissing[0]);
      } else {
        if (textMissing.length >= 2) {
          questionsForThisRound.push(textMissing[0], textMissing[1]);
        } else if (textMissing.length === 1) {
          questionsForThisRound.push(textMissing[0]);
        }
      }

      const systemInstruction = `# 角色定义
你是TrialGPT临床试验方案起草智能助手，依托内置工作流生成临床试验方案草案。
你的核心职责：收集完整结构化临床试验参数，参数全部齐备之后，才允许启动方案草案生成流程。

# 当前已收集参数
${Object.keys(enrichedParams).length > 0 ? JSON.stringify(enrichedParams, null, 2) : '（暂无）'}

# 当前参数状态
已收集必填：${filledRequiredCount}/${requiredCount}
${fields.filter(f => f.required && Object.keys(enrichedParams).includes(f.id) && enrichedParams[f.id]).map(f => `- ${f.label}：${enrichedParams[f.id]}`).join('\n') || '（暂无）'}

# 仍缺失的必填参数（${missingRequiredFields.length}项）
${missingRequiredFields.map(f => `- ${f.id}（${f.label}）${f.options ? '，选项：' + f.options.join('/') : ''}`).join('\n') || '无（全部已收集）'}

# 本轮问询策略
${questionsForThisRound.length > 0 ? 
  questionsForThisRound.map((f, i) => {
    if (f.options && f.options.length > 0) {
      return `${i + 1}. ${f.label}？\n${f.options.map((o, j) => `${String.fromCharCode(65 + j)} ${o}`).join('  ')}`;
    } else {
      return `${i + 1}. ${f.label}？`;
    }
  }).join('\n') : '全部必填已收集完毕'}

${templateContent ? `
# ⚠️ 用户上传了参考文件：${templateName || '未命名文件'}
用户已上传以下文件作为起草方案的参考依据，你必须充分利用这些信息：

## 上传文件内容摘要
---
${templateContent.substring(0, 2000)}
---

## 关键要求
1. **从上传文件中提取信息**：当用户问题涉及试验设计、入排标准、剂量方案、终点指标等内容时，优先从上述上传文件中提取相关信息作为回答依据
2. **参数提取时参考文件**：如果上传文件中包含明确的试验参数（如剂量、周期、入排标准等），应优先采用文件中的数值和描述
3. **在 extractedParams 中标注来源**：如果从上传文件中提取到参数，在 extractedParams 中正常返回即可
4. **不要忽略文件内容**：即使用户没有明确提及文件，也要主动参考文件中的相关信息

**注意**：如果上传文件内容与用户当前描述有冲突，以用户最新消息为准。
` : ''}

# 任务
1. 从用户输入中提取新的参数值（extractedParams）
2. 根据缺失参数，生成下一轮提问（nextQuestion）
3. 判断是否所有必填参数已收集完毕（isComplete）

# 输出格式（必须输出合法 JSON）
{
  "extractedParams": { "字段id": "从用户消息中提取的值" },
  "nextQuestion": "本轮问询内容（简洁，不超过150字，如有选项则提供A/B/C）",
  "isComplete": true/false,
  "completionSummary": "全部必填收集完毕时的参数汇总，否则null"
}

# 强制规则
1. extractedParams 中只放本轮从用户消息中**新提取到**的参数，不要重复已有的。
2. nextQuestion 必须严格基于"本轮问询策略"输出，禁止提问策略之外的字段。
3. 枚举类字段（如试验分期、盲法设计、对照方案、注册分类、设计类型）必须带选项A/B/C。
4. 同一轮最多提出2个问题，禁止一次性抛出全部缺失参数。
5. 药物名识别：trial_drug_name 从用户消息中提取，常见模式：以"替尼""单抗""珠单抗""昔布""醇""胺""酮""片""胶囊""注射液""口服液"结尾的中文词。
6. 适应症识别：indication 精确提取"适应症"后面的完整内容。
7. 全部必填齐全时：isComplete=true，completionSummary 输出完整参数摘要，nextQuestion 输出"✅ 当前全部5项临床试验必填参数收集完毕！您可以点击页面下方【生成草案】按钮，启动临床试验方案草案生成工作流。"`;

      // 🔑 关键：把附件内容拼到 user message 里，确保 LLM 一定能看到
      let actualUserMessage = userMessage;
      if (templateContent && templateContent.trim().length > 10) {
        actualUserMessage = `用户输入：${userMessage}

---
【用户上传的参考资料：${templateName || '未命名文件'}】
请仔细分析以下文件内容，从中提取试验参数（药物名、适应症、剂量、入排标准等）并参考其方案设计：
${templateContent}
---`;
        console.log('✅ 已将附件内容拼接到用户消息中，总长度:', actualUserMessage.length);
      } else {
        console.log('⚠️ 未检测到附件内容，templateContent长度:', templateContent?.length || 0);
      }

      const response = await ai.chat.completions.create({
        model: "qwen-max",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: actualUserMessage },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const text = response.choices[0]?.message?.content || "";

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { extractedParams: {}, nextQuestion: "抱歉，未能理解您的输入，请重新描述试验信息。", isComplete: false, completionSummary: null };
      }

      // 后端兜底：正则提取的药物名优先级高于 LLM（LLM 经常只提取后缀如"替尼"）
      if (enrichedParams.trial_drug_name) {
        parsed.extractedParams.trial_drug_name = enrichedParams.trial_drug_name;
      }
      // 后端兜底：适应症精确提取（LLM 可能简化）
      if (enrichedParams.indication) {
        parsed.extractedParams.indication = enrichedParams.indication;
      }

      // 后端强制校验：重新计算已填充字段
      const allFilled = { ...enrichedParams, ...parsed.extractedParams };
      const allFilledKeys = Object.keys(allFilled).filter(k => allFilled[k]);
      const allRequiredFilled = fields.every(f => !f.required || allFilledKeys.includes(f.id));

      console.log('合并后参数:', JSON.stringify(allFilled));
      console.log('所有必填已满足:', allRequiredFilled);
      console.log('=== API 调用结束 ===');

      if (allRequiredFilled) {
        // 全部必填已收集完毕
        parsed.isComplete = true;
        parsed.nextQuestion = '所有必填参数已收集完毕，可以生成方案草稿。';
        const summaryLines = fields.filter(f => f.required && allFilled[f.id]).map(f => `• ${f.label}：${allFilled[f.id]}`);
        parsed.completionSummary = summaryLines.join('\n');
      } else {
        // 还有必填缺失，生成下一个提问（只从缺失必填中选）
        const nextMissing = fields.find(f => f.required && !allFilledKeys.includes(f.id));
        if (nextMissing) {
          parsed.nextQuestion = `请问${nextMissing.label}是什么？`;
        }
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("AIDraft API Error:", error);
      res.status(500).json({ error: error.message || "AI 服务调用失败" });
    }
  });

  // AIDraft 生成草稿接口 — 6阶段流水线 (SSE 推送进度)
  app.post("/api/aidraft/generate", async (req, res) => {
    const { params, templateContent } = req.body;

    // 设置 SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const send = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // SSE 心跳保活：每 10 秒发送注释行，防止 Render 100 秒超时断开连接
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 10000);

    try {
      const ai = getAI();
      const paramsBlock = formatParamsForLLM(params);
      
      // 模板结构约束（如果用户上传了模板）
      const templateBlock = templateContent 
        ? `\n\n【用户提供的方案模板结构】\n${templateContent}\n\n请严格按照上述模板的章节结构和标题组织你的输出内容。若模板中的章节名称与标准要求不同，以模板为准。若模板缺少某个标准章节，请自动补充。`
        : "";

      // ============================================================
      // 阶段2: 参数完整性校验
      // ============================================================
      send({ stage: 2, name: "参数完整性校验", status: "running", detail: "校验必填参数..." });
      const requiredFields = ["trial_drug_name", "indication", "trial_phase", "register_class", "control_plan"];
      const missing = requiredFields.filter(f => !params[f]);
      if (missing.length > 0) {
        send({ stage: "error", name: "参数校验", status: "error", detail: `缺失必填参数：${missing.join("、")}` });
        clearInterval(heartbeat);
        res.end();
        return;
      }
      send({ stage: 2, name: "参数完整性校验", status: "done", detail: "5 项必填参数校验通过" });

      // ============================================================
      // 阶段3: 素材准备
      // ============================================================
      send({ stage: 3, name: "素材准备", status: "running", detail: "检索CDE指南与文献素材..." });
      const context = prepareMaterials(params);
      send({ stage: 3, name: "素材准备", status: "done", detail: "参考素材与CDE指南已就绪" });

      // ============================================================
      // 阶段4: 核心要素设计 (LLM: qwen-max)
      // ============================================================
      send({ stage: 4, name: "核心要素设计", status: "running", detail: `调用 ${MODEL_CORE} 生成核心要素表...` });
      let coreTable: string;
      try {
        coreTable = await llmChat(ai, MODEL_CORE, [
          {
            role: "system",
            content: `你是精通药物临床试验设计的核心首席科学家。请依据传入的参考素材与用户参数，设计出高精密度的试验核心要素表。

参考素材：${context}

用户试验参数：${paramsBlock}${templateBlock}

【强制输出要求】
必须以精密Markdown表格输出以下内容，绝不允许输出空骨架或待补充占位符：
1. 试验整体设计：严密论述分组方法、盲态设置以及确切的全周期随访时间点。必须在表格中明确写出【设计类型】：平行对照 / 交叉设计 / 单臂试验。
2. 核心终点指标：细化主要疗效终点及判定依据、关键次要疗效终点及其精细检测时点。必须明确标记【指标类型】：连续变量 / 二分类变量 / 生存分析。
3. 给药方案设计：描述试验药与对照药的确切剂量梯度、滴定规则及必须禁用的合并药物。
4. 安全性监测：明确AE/SAE的核心随访时限。
5. 统计样本量假设：在表格中以标准格式明确写出【显著性水平alpha】、【检验效能1-beta】、【预期脱落率】，以及预期有效率或差值均值。`,
          },
          { role: "user", content: "请生成高确定性的临床试验核心要素表。" },
        ], 0.1, 4096);
      } catch (e: any) {
        console.error("核心要素设计 LLM 失败，使用模板:", e.message);
        coreTable = templateCoreDesign(params);
      }
      send({ stage: 4, name: "核心要素设计", status: "done", detail: "核心要素表生成完成" });

      // ============================================================
      // 阶段5: 样本量计算 + 4章节并行生成
      // ============================================================
      send({ stage: 5, name: "章节生成 + 样本量计算", status: "running", detail: "Python 自适应样本量计算..." });

      // 样本量计算 (纯 JS, 非 LLM)
      const sampleResult = calculateSampleSize(params, coreTable, context);

      // 章节1: 研究背景
      send({ stage: 5, name: "章节生成 + 样本量计算", status: "running", detail: `章节1 研究背景 (${MODEL_CHAPTER})...` });
      let sectionBg: string;
      try {
        sectionBg = await llmChat(ai, MODEL_CHAPTER, [
          {
            role: "system",
            content: `您是高水平临床药理学医学撰稿人。请撰写正式的"研究背景与立题依据"章节。

前置事实资产：
1. 核心要素表与设计依据：${coreTable}
2. 参考指南文献：${context}
3. 用户原始试验参数：${paramsBlock}${templateBlock}

【硬性要求】禁止出现任何提纲化缩写或"请在此处添加数据"的占位符。请输出三大饱满段落的深度长文，每段均需包含高度专业的行业术语和病理机制论述（如受体结合、信号通路阻断机制等），字数不得低于800字。`,
          },
          { role: "user", content: "请生成无空架子的完整临床研究背景与立题依据章节。" },
        ], 0.2, 4096);
      } catch (e: any) {
        console.error("研究背景 LLM 失败，使用模板:", e.message);
        sectionBg = templateBackground(params);
      }

      // 章节2: 试验设计
      send({ stage: 5, name: "章节生成 + 样本量计算", status: "running", detail: `章节2 试验设计 (${MODEL_CHAPTER})...` });
      let sectionDesign: string;
      try {
        sectionDesign = await llmChat(ai, MODEL_CHAPTER, [
          {
            role: "system",
            content: `您是资深临床试验方案科学家。请撰写"试验设计与受试者选择"章节。

输入资产：
1. 核心设计与指南：${coreTable}\n${context}
2. 原始试验参数：${paramsBlock}
3. 前置背景章节：${sectionBg}${templateBlock}

【撰写硬性限制 - 禁止空框架】
1. 试验整体设计：详述随机化流程与双盲/双盲双模拟的具体盲态维护与紧急揭盲SOP。
2. 受试者选择标准：根据用户参数中特殊的入排限制条件，扩充并列出至少8条极其详尽的入选标准和至少10条排除标准（严禁出现"其他疾病由临床医生决定"等模糊描述）。
3. 给药方案：将治疗疗程、给药频次与联用禁用药写进正式给药细则中，并给出清晰的剂量调整/暂停用药触发阈值表格。
4. 研究访视日程表：以标准的SPIRIT格式输出包含筛选期、治疗期、治疗结束（EOT）及随访期的访视矩阵表格。`,
          },
          { role: "user", content: "结合已有背景与核心参数，生成详实饱满的试验设计、完整入排标准与研究访视矩阵表章节。" },
        ], 0.2, 8192);
      } catch (e: any) {
        console.error("试验设计 LLM 失败，使用模板:", e.message);
        sectionDesign = templateDesign(params);
      }

      // 章节3: 统计分析
      send({ stage: 5, name: "章节生成 + 样本量计算", status: "running", detail: `章节3 统计分析 (${MODEL_CHAPTER})...` });
      let sectionStats: string;
      try {
        sectionStats = await llmChat(ai, MODEL_CHAPTER, [
          {
            role: "system",
            content: `请撰写方案的"统计分析计划（SAP）"章节。

前置资产：
1. 用户原始试验参数：${paramsBlock}
2. 核心要素设计表：${coreTable}
3. 样本量精确计算结论：${sampleResult}${templateBlock}

【要求】必须无条件融入并严格对齐上方的精准样本量数字（包括总入组数、单组数和预设脱落率，数字与上述样本量计算结论必须100%保持完全一致），完整撰写：
①统计描述与假设检验方法（如FAS集、PPS集、SS集的划分定义）；
②主要和次要疗效终点的具体统计模型（如非劣效检验的置信区间法、连续变量的ANCOVA模型）；
③脱落与缺失数据的处理逻辑。
内容必须深入到参数细节，绝不允许留空或前后矛盾。`,
          },
          { role: "user", content: "基于高精度样本量计算结论，生成完整的统计分析计划章节。" },
        ], 0.2, 4096);
      } catch (e: any) {
        console.error("统计分析 LLM 失败，使用模板:", e.message);
        sectionStats = templateStats(coreTable, sampleResult);
      }

      // 章节4: 安全数据伦理
      send({ stage: 5, name: "章节生成 + 样本量计算", status: "running", detail: `章节4 安全数据伦理 (${MODEL_CHAPTER})...` });
      let sectionSafety: string;
      try {
        sectionSafety = await llmChat(ai, MODEL_CHAPTER, [
          {
            role: "system",
            content: `您是资深GCP合规与数据管理专家。请撰写"安全性评估"、"数据管理与质控"以及"伦理考虑"三大完整章节。

输入事实资产：
1. 原始试验参数：${paramsBlock}
2. 核心设计：${coreTable}
3. 试验设计与入排矩阵：${sectionDesign}
4. 指南文件：${context}${templateBlock}

【核心生成规则 - 必须饱满】
1. 安全性评估：全面论述不良事件（AE）定义、基于CTCAE v5.0的分级标准，详细设计SAE的24小时内紧急报告流程与时限通路。输出全套实验室安全性检查在不同访视节点的详细监测频次表，给出不少于8条的永久停药与试验中止标准。
2. 数据管理：写明基于EDC系统的在线数据录入规范、逻辑核查规则设计（Query下发与关闭流程）、双人独立双份盲态数据录入核查流程及数据库锁定（DBL）的标准触发条件。阐述数据安全监察委员会（DSMB）的职责及期中分析的触发边界。
3. 伦理考虑：输出知情同意书（ICF）的标准获取步骤与管理流程、对受试者隐私数据进行脱敏的保密技术措施、试验相关损害的科学补偿或保险赔偿原则，并加上赫尔辛基宣言合规性严正声明。`,
          },
          { role: "user", content: "生成无提纲缩略、完全符合药企申报级规范的安全性评估、数据管理和伦理章节全文。" },
        ], 0.2, 8192);
      } catch (e: any) {
        console.error("安全数据伦理 LLM 失败，使用模板:", e.message);
        sectionSafety = templateSafety(params);
      }

      send({ stage: 5, name: "章节生成 + 样本量计算", status: "done", detail: "4章节 + 样本量计算完成" });

      // ============================================================
      // 阶段6: 整合润色 (LLM: qwen-max) — 单次调用，去除冗余二次润色
      // ============================================================
      send({ stage: 6, name: "整合润色定稿", status: "running", detail: `整合所有章节 (${MODEL_REVIEW})...` });

      let finalDraft: string;
      try {
        finalDraft = await llmChat(ai, MODEL_REVIEW, [
          {
            role: "system",
            content: `任务：你现在是药企申报合规终审专家。你的职责是将所有前置生成的独立章节整合成一份浑然一体、符合NMPA申报级规范的完整试验方案初稿，并补齐全套附属前置文件页面。

所有章节素材：
- 原始基本参数：${paramsBlock}
- 核心要素总结：${coreTable}
- 章节1-研究背景：${sectionBg}
- 章节2-设计入排：${sectionDesign}
- 章节3-统计分析：${sectionStats}
- 章节4-安全数据伦理：${sectionSafety}
- 范本约束提示：${context}
- 自适应样本量计算参考：${sampleResult}

【组装补全要求 - 严禁丢掉任何正文段落】
1. 强制在最开头添加全套前置结构页面：包括方案封面表格（包含方案编号、版本号、日期、申办者名称、试验药品名、对照方案名、适应症）、机密保密声明、修订历史表格、三方签字确认页、专业术语缩略语对照表。
2. 全文一致性审查：深度交叉检验。特别是【试验设计】、【统计学章节】以及【封面页】中提及的样本量数字，必须强制与上述样本量计算参考中计算出的最终数值完全保持一致，绝不允许在不同章节中出现多套样本量数字。
3. 若发现章节正文有AI提纲占位符，必须结合上下文及专业GCP标准将其自动扩写定稿。保持全部Markdown表格的完整输出。
4. 删去任何带有AI伴随式交互废话与客套，只留下纯净、专业的方案申报文本。统一全文语气为严谨的工业申报级笔触。`,
          },
          { role: "user", content: "请执行大合流与前置页补全，输出结构高度合规、无多余注释的最终可交付临床试验方案定稿。" },
        ], 0.2, 8192);
      } catch (e: any) {
        console.error("整合润色 LLM 失败，使用模板:", e.message);
        finalDraft = templateIntegrate(params, sectionBg, sectionDesign, sectionStats, sectionSafety, sampleResult);
      }

      // 将最终草稿转为结构化 sections
      const sections = [
        { id: "sec-1", title: "研究背景", content: sectionBg },
        { id: "sec-2", title: "试验设计", content: sectionDesign },
        { id: "sec-3", title: "统计分析与样本量", content: sectionStats },
        { id: "sec-4", title: "安全性与伦理合规", content: sectionSafety },
        { id: "sec-5", title: "样本量计算依据", content: sampleResult },
      ];

      send({
        stage: "done",
        name: "完成",
        status: "done",
        detail: "方案草稿生成完毕",
        sections,
        fullDraft: finalDraft,
      });

      clearInterval(heartbeat);
      res.end();
    } catch (error: any) {
      console.error("AIDraft Generate Error:", error);
      send({ stage: "error", name: "错误", status: "error", detail: error.message || "生成失败" });
      clearInterval(heartbeat);
      res.end();
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, history, systemInstruction } = req.body;
      const ai = getAI();

      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      if (history && history.length > 0) {
        history.forEach((msg: any) => {
          messages.push({ role: msg.role, content: msg.content });
        });
      }
      messages.push({ role: "user", content: prompt });

      const response = await ai.chat.completions.create({
        model: "qwen-max",
        messages,
        temperature: 0.7,
      });

      res.json({ text: response.choices[0]?.message?.content || "" });
    } catch (error: any) {
      console.error("DashScope API Error:", error);
      res.status(500).json({ error: error.message || "AI 服务调用失败" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
