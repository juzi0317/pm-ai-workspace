# Prompt Templates

Use these templates when the user asks for copy/paste prompts, training material, or a reusable prompt pack. Adapt variable names and do not force every field if the user already provided enough context.

## 1. Product Idea To PRD

```text
你是资深产品经理。请把下面的产品想法整理成一份可执行的产品需求文档 PRD。

产品想法：
{{product_idea}}

目标用户：
{{target_users}}

使用场景：
{{scenarios}}

平台：
{{platform}}

请输出 Markdown，包含：
1. 产品定位
2. 用户画像
3. 核心场景
4. MVP 范围
5. 信息架构
6. 页面清单
7. 核心用户流程
8. 每个页面的功能需求、字段、状态、异常情况
9. 内容语气和示例文案
10. 验收标准

要求：不要开始做视觉设计，只把产品结构和需求写清楚。
```

## 2. PRD To Grayscale Prototype

```text
请基于下面的 PRD，生成一份黑白低保真 HTML 原型。

PRD：
{{prd_content}}

输出要求：
1. 使用 HTML/CSS/JS，可以直接在浏览器打开
2. 只使用黑、白、灰，不要品牌色、插画、渐变或高保真装饰
3. 覆盖 PRD 中的主要页面、核心流程和关键状态
4. 页面结构要清晰，组件命名要方便后续修改
5. 使用真实可读的占位文案，不要大段 lorem ipsum
6. 默认按 {{viewport}} 设计

目标：先确认产品结构、信息层级和用户流程，不追求好看。

完成后请停下来询问我：是否继续进入"黑白原型 + 风格参考图 -> 高保真主视觉稿"阶段。如果我不继续，请整理当前 PRD 和黑白原型的交付路径并结束流程。
```

## 3. Prototype Plus Style Reference To Visual UI

```text
请把图 1 的黑白原型，改造成图 2 的视觉风格。

图 1：黑白原型，代表页面结构和信息层级
图 2：风格参考，代表颜色、质感、插画语言、氛围和视觉个性

产品背景：
{{product_context}}

目标用户：
{{target_users}}

视觉关键词：
{{visual_keywords}}

要求：
1. 保留图 1 的页面结构、主要模块和信息层级
2. 迁移图 2 的视觉风格，而不是照抄内容
3. 输出 {{screen_count}} 个主要页面的高保真 UI
4. 风格必须明显，不要泛泛的干净简约
5. 不要删掉原型里的关键功能
6. 适合 {{platform}} 和 {{target_users}} 使用

请同时总结：颜色、字体气质、组件风格、插画/IP 风格和适用场景。
```

## 4. Visual UI To Visual Spec

```text
请从这组高保真 UI 中提取一份可复用的视觉规范 Markdown。

输入：
{{visual_ui_images_or_description}}

请输出：
1. 设计关键词
2. 色彩系统：主色、辅助色、背景色、文本色、状态色，给出 hex 和使用场景
3. 字体系统：字号层级、字重、行高、使用规则
4. 间距、圆角、描边、阴影、卡片和层级规则
5. 组件规范：按钮、卡片、输入框、导航、标签、列表、弹窗等
6. 图标和插画风格
7. 页面布局规则
8. Do / Don't

要求：只基于当前 UI 总结，不要写成通用设计理论。
```

## 5. Visual UI To Optional IP Character Spec

```text
如果当前 UI 中存在角色、吉祥物、头像、贴纸或插画系统，请从中提取 IP 形象规范，并规划可拓展素材包。

如果当前产品不需要 IP 形象，请直接说明"不需要生成 IP 规范"，不要强行创造角色。

输入：
{{character_images_or_ui}}

请输出：
1. 角色定位和性格
2. 轮廓、比例、五官、颜色、材质和线条规则
3. 表情系统
4. 动作/姿势系统
5. 场景使用规则
6. 贴纸包/表情包/引导图/空状态图的拓展清单
7. 文件命名和格式建议
8. Do / Don't

要求：规范要能指导后续继续生成同一角色，不要只做情绪描述。
```

## 6. Specs Plus Prototype To Final Full UI

```text
请结合下面资料，生成完整高保真 UI：

1. PRD：
{{prd_content}}

2. 黑白原型：
{{wireframe_reference}}

3. 选定的主视觉稿：
{{selected_visual_reference}}

4. 视觉规范，以及可选的 IP 规范：
{{specs_content}}

输出要求：
1. 覆盖 PRD 中所有主要页面
2. 保持黑白原型的页面结构和用户流程
3. 严格使用视觉规范中的颜色、字体和组件规则；只有在提供 IP 规范时，才使用插画/IP 规则
4. 输出可编辑的 HTML/CSS/JS 或 Figma-ready 页面结构
5. 不要把整页做成不可编辑的大图
6. 补齐空状态、加载状态、错误状态和关键交互状态

请最后列出页面清单、组件清单和还需要人工确认的地方。
```

## 7. Short Video Teaching Script

```text
请把这套流程整理成适合小红书/抖音的短视频口播文案和 PPT 分页脚本。

案例：
{{case_name}}

流程素材：
{{artifact_list}}

目标：
{{promotion_goal}}

要求：
1. 开头 3 秒要有钩子
2. 每一页优先展示真实图片素材
3. 讲清楚这不是单张 AI 效果图，而是一套可复用工作流
4. 结构为：结果展示 -> 5 步流程 -> 方法关键点 -> skill/服务 CTA
5. 文案口语化，适合录屏讲解

请输出：口播稿、每页 PPT 内容、每页对应画面建议。
```
