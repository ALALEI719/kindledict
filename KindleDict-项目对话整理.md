# KindleDict 项目对话整理

> 整理自 2026-05-20 产品与技术讨论  
> 仓库：https://github.com/ALALEI719/kindledict

---

## 目录

1. [项目目标](#1-项目目标)
2. [能否实现 Kindle 查词兼容](#2-能否实现-kindle-查词兼容)
3. [主要技术难点](#3-主要技术难点)
4. [当前已实现内容](#4-当前已实现内容)
5. [构建词典流程](#5-构建词典流程)
6. [产品形态对比](#6-产品形态对比)
7. [整本书扫描与版权](#7-整本书扫描与版权)
8. [Skill / Agent 插件与商业化](#8-skill--agent-插件与商业化)
9. [LLM 调用方案](#9-llm-调用方案)
10. [网页工具方案](#10-网页工具方案)
11. [SEO 搜索词（中英）](#11-seo-搜索词中英)
12. [英文首页要点](#12-英文首页要点)
13. [Git 与 GitHub 推送](#13-git-与-github-推送)
14. [后续建议](#14-后续建议)

---

## 1. 项目目标

做一个可以根据电子书实际内容 **自动定制词典** 的工具。词典需 **兼容 Kindle 查词机制**：用户在阅读界面长按/点选单词时，能在 **词典弹窗** 里看到对应词条，而不是只能当普通电子书翻页阅读。

**典型场景：** 读《冰与火之歌》等奇幻小说时，内置英汉/英英词典查不到 `Yoren`、`Needle`、`Sourleaf` 等本书专有词。

**英文圈已有品类名：** **Fictionary**（fiction + dictionary），指专为某本小说制作的 Kindle 定制词典。

---

## 2. 能否实现 Kindle 查词兼容

**结论：能实现。**

Kindle 查词兼容的核心不是普通 EPUB/MOBI 电子书，而是 **带词典索引的 MOBI 词典包**，需满足：

| 组件 | 要求 |
|------|------|
| XHTML 词条 | `idx:entry`、`idx:orth`（查词键）、`idx:infl`（别名/变体） |
| OPF 元数据 | `DictionaryInLanguage`、`DictionaryOutLanguage`、`DefaultLookupIndex` |
| 编译 | kindlegen 或 **Kindle Previewer 3** 导出 `.mobi` |
| 使用 | sideload 到 Kindle → 设为默认词典 → 阅读时点词 |

查不到的词会 **fallback** 到系统内置词典（优点：定制词典可只做专有名词）。

**已验证：** 用户将生成的《冰与火之歌》Chapter 4 词典 sideload 后，阅读时点词可正常查释义。

---

## 3. 主要技术难点

### 3.1 从电子书获取正文（自动化入口）

| 情况 | 难度 |
|------|------|
| 无 DRM 的 MOBI/EPUB | 相对容易 |
| 亚马逊购买的 AZW/KFX（带 DRM） | 很难合法自动化 |

### 3.2 精准抓取「读者会点查」的词

内置词典查不到的大致三类：

1. **本书专有**：人名、地名、虚构概念
2. **领域生僻**：古英语用法、行业词
3. **普通词在本书有特殊含义**：如 Queen、Ice、Watch（歧义多）

**推荐策略：多层筛选**

```
章节原文
  → 规则初筛（大写专名、反复出现的新词、头衔等）
  → 对比通用词典（WordNet/COCA：能解释且为普通用法则剔除）
  → LLM 按「读者此刻」精筛（防剧透、写释义、inflections）
  → 去重 + Kindle 查词形式适配
  → 最终 JSON
```

**Kindle 查词行为适配（易忽略）：**

- Kindle 长按多为 **单个词**，不是整短语
- `King's Landing` 可能只能点到 `Landing` → 需 `idx:infl` 覆盖常见片段
- 所有格 `Yoren's` 必须在 inflections 里

### 3.3 格式与打包

- **kindlegen 已停更**，现多用 Kindle Previewer 手动导出
- OPF/HTML 稍有差错，Kindle 会当普通书，点词不走自定义词典
- 各机型需真机测试

### 3.4 词典与书的绑定

Kindle **不会** 自动把某词典绑定某本书；用户需 **手动切换默认词典**。

### 3.5 规模与版权

- 单章 30–80 词条较合理；整书按章分批
- 从正版 Kindle 书批量提取并分发衍生词典涉及版权/服务条款；**不要内置或引导 DRM 破解**

---

## 4. 当前已实现内容

### 4.1 文件结构

```
KindleDict/
├── build_dictionary.py      # JSON → HTML/OPF 源文件
├── dict-config.json         # 词典标题、语言、使用说明等元数据
├── entries-ch04.json        # 第 4 章 48 条词条（示例）
├── content.html             # 早期手工/生成的词条 HTML（可参考）
├── ch04-highlighted.html    # 章节高亮预览
├── acok-dictionary.mobi     # 已编译的示例词典（若已生成）
├── website/index.html       # 英文营销首页
├── dist/entries-ch04/       # 构建输出（.gitignore 忽略，本地生成）
└── .gitignore
```

### 4.2 词条 JSON 结构（示例）

```json
{
  "word": "Yoren",
  "definition": "Black brother of the Night's Watch...",
  "category": "Character",
  "inflections": ["Yoren's"],
  "chapter_id": "ak-ch04",
  "notes": "可选",
  "synonyms": "可选"
}
```

### 4.3 Kindle 词典 HTML 词条格式

```html
<idx:entry name="default" scriptable="yes" spell="yes">
  <h5><dt><idx:orth>Yoren</idx:orth></dt></h5>
  <idx:infl><idx:iform value="Yoren's"/></idx:infl>
  <dd>释义内容...</dd>
</idx:entry>
<hr/>
```

### 4.4 词典配置（dict-config.json）

- 完整标题：`A Clash of Kings — Chapter 4 Companion Dictionary`
- Kindle 列表中可能显示为截断名，如 “Clash of Kings”
- 封面显示：Chapter 4 (Arya IV)、Created by KindleDict

**验证专用测试词：** Yoren、Lommy Greenhands、Sourleaf、The Red Comet、Hot Pie

---

## 5. 构建词典流程

### 5.1 生成源文件

```bash
cd "/Users/leihaiqiang/Library/Mobile Documents/com~apple~CloudDocs/KindleDict"
python3 build_dictionary.py entries-ch04.json
```

输出目录：`dist/entries-ch04/`，包含：

- `dict.opf` — 词典包配置
- `content.html` — 词条正文
- `cover.html` / `copyright.html` / `usage.html`

可选参数：

```bash
python3 build_dictionary.py entries-ch05.json --output dist/entries-ch05
```

### 5.2 导出 .mobi（需 Kindle Previewer）

1. 安装 [Kindle Previewer 3](https://www.amazon.com/gp/feature.html?docId=1000765261)
2. File → Open → 选择 `dist/entries-ch04/dict.opf`
3. File → Export → 保存为 `.mobi`
4. 日志仅 Warning 一般可忽略；Error 需排查

### 5.3 传到 Kindle

**USB：** 复制 `.mobi` 到 `documents/dictionaries/`

**邮件：** 发到 Kindle 绑定邮箱

**阅读时：** 长按单词 → Dictionary → 若弹出其他词典，点顶部名称切换为本词典

### 5.4 流程图

```
上传/粘贴章节文本 → AI 抽词 + 写释义 → entries.json
  → build_dictionary.py → HTML + OPF
  → Kindle Previewer / kindlegen → .mobi
  → sideload → 阅读时点词
```

**Previewer 不是永远必需**，它是 kindlegen 的图形壳；自动化可内置 kindlegen。

---

## 6. 产品形态对比

| 形态 | 目标用户 | 整本书 | 商业化 | 版权敏感度 |
|------|----------|--------|--------|------------|
| **Cursor Skill / Plugin** | 开发者 | 可编排 | 难直接卖；适合引流 | 较低（不托管书） |
| **桌面 App（Streamlit/Electron）** | 技术型读者 | ✅ 本地 | ✅ License | 相对较低 |
| **网页 SaaS** | 普通读者 | ✅ | ✅ 订阅/按本 | 较高（接触内容） |
| **Kindle Previewer 手工流** | 当前 MVP | 按章 | — | 最低 |

**推荐长期架构：** 混合流水线 + 三种 LLM 来源可切换（云端 API / 本地 Ollama / 规则-only）

**Skill 定位：** 研发加速器，不是给 Kindle 读者的最终产品。Cursor Marketplace 要求 **开源**，不适合闭源付费 Skill 直接上架。

---

## 7. 整本书扫描与版权

### 7.1 是否有版权风险？

**有。** 整本扫描并输出整本词典涉及：

- 读取电子书 = **复制**受保护作品（离线也在本机复制）
- 生成释义 = 可能构成 **演绎/衍生作品**
- 破解 DRM = 单独高压线（与是否离线无关）

### 7.2 离线桌面能否规避？

**不能自动规避。** 离线只缓解平台责任与隐私顾虑，不改变对用户无权利作品进行复制/演绎的法律性质。

### 7.3 相对稳妥的产品边界

| 级别 | 做法 | 风险 |
|------|------|------|
| A | 公版书 / 无 DRM EPUB | 低 |
| B | 用户粘贴章节文本 | 中低 |
| C | 无 DRM 文件，本地处理，个人使用 | 中 |
| D | 自动破解 Kindle 全书 | 高 |

**不要做：** 内置 DRM 破解、公开分发热门 IP 预制词典、在线托管盗版书全文。

---

## 8. Skill / Agent 插件与商业化

### 8.1 Cursor Plugin

- 提交：https://cursor.com/marketplace/publish
- **必须开源**，人工审核
- 更像分发曝光，非 App Store 内购

### 8.2 商业化路径（实用排序）

1. 桌面 App 卖 License
2. SaaS 按章节/按本
3. B2B 给出版社做官方伴侣词典
4. 免费 Cursor Plugin + 付费 Pro
5. 在 Marketplace 卖 Skill 本身 — 预期低

### 8.3 产品组合建议

- **网页 SaaS** → 普通读者与付费
- **Cursor Skill** → 内部调试 prompt
- **桌面 Pro** → 隐私敏感用户

---

## 9. LLM 调用方案

### 9.1 三种「离线」含义

| 类型 | 含义 |
|------|------|
| 数据离线 | 书不上传服务器（最常见、最合适） |
| 处理离线 | 抽词+释义在本机（需本地模型） |
| 完全离线 | 永不联网（难，模型体积与质量受限） |

### 9.2 方案对比

| 方案 | 离线程度 | 释义质量 | 适合阶段 |
|------|----------|----------|----------|
| BYOK 云端 API | 书本地，调用联网 | ⭐⭐⭐⭐⭐ | **MVP** |
| 本地 Ollama | 高 | ⭐⭐⭐ | 隐私版 |
| 内置小模型 | 最高 | ⭐⭐⭐ | 后期 Pro |
| 混合 + 可选 LLM | 灵活 | ⭐⭐⭐⭐ | **长期** |
| 纯规则无 LLM | 完全 | ⭐⭐ | 免费引流 |

### 9.3 桌面 App 建议设置

- LLM 来源：云端 API / 本地 Ollama / 暂不使用
- 隐私说明：全书不上传我们服务器；用云端 API 时章节片段会发给 API 提供商
- 整书：按章批处理 + 进度条 + 断点续跑

---

## 10. 网页工具方案

### 10.1 架构

几乎必须 **前端 + 后端**（浏览器无法跑 kindlegen）。

```
上传 EPUB / 粘贴章节 → 后端 LLM 抽词 → build_dictionary → kindlegen → 下载 .mobi
```

### 10.2 与桌面对比

| 维度 | 网页 SaaS | 桌面 |
|------|-----------|------|
| 上手 | 低 | 中 |
| LLM | 统一提供，好卖 | 用户自备 Key/Ollama |
| 隐私叙事 | 弱 | 强 |
| 版权风险 | 较高 | 相对较低 |
| kindlegen | 服务器 Docker | 本机内置 |

### 10.3 稳妥 MVP

「粘贴章节 / 上传无 DRM EPUB → 云端 LLM → 下载 .mobi」，不做 DRM、不永久存书。

### 10.4 技术栈建议

- **MVP：** Streamlit + FastAPI + kindlegen Docker（Railway/Fly.io/VPS）
- **注意：** Streamlit Cloud 通常不便装 kindlegen

---

## 11. SEO 搜索词（中英）

### 11.1 高意图痛点词

**英语：** kindle word not found, kindle dictionary character names, kindle fantasy names dictionary, reading fantasy book don't understand names, flip back to glossary kindle annoying

**中文：** kindle 查词 查不到, kindle 查不到 人名, 读英文小说 人名太多, 读奇幻小说 看不懂 专有名词, kindle 生词本 不好用

### 11.2 品类/解决方案词

**英语：** fictionary, kindle fictionary, custom kindle dictionary, book specific dictionary kindle, companion dictionary for kindle, how to add dictionary to kindle

**中文：** kindle 自定义词典, kindle 定制词典, 制作 kindle 词典, 导入 kindle 词典, 小说 专用词典 kindle, AI 生成 阅读词典

### 11.3 优先打的 20 个词

**英（10）：** fictionary, kindle fictionary, custom kindle dictionary, kindle word not found, kindle dictionary character names, book glossary for kindle, create kindle dictionary, fantasy reading dictionary, companion dictionary kindle, how to add custom dictionary to kindle

**中（10）：** kindle 查词 查不到, kindle 自定义词典, kindle 导入词典, 读英文小说 人名太多, kindle 查不到 人名, 奇幻小说 阅读 辅助, 制作 kindle 词典, kindle 第三方词典, 电子书 专有名词 词典, kindle 读原版书 查词

### 11.4 不建议主投

kindle 去 DRM、破解 kindle 词典、kindle 免费电子书、kindle 越狱

---

## 12. 英文首页要点

文件位置：`website/index.html`

**Title：** KindleDict — Custom Kindle Dictionaries for Every Book You Read

**Meta description：** Build a Kindle fictionary in minutes. Look up character names, places, and book-specific terms while reading — right inside your Kindle dictionary popup. No more 'word not found'.

**H1：** Look up any word in your book — even when Kindle says "not found"

**页面区块：** Hero → Problem → How it works (4 steps) → Features → Compare table → Audience → FAQ (+ Schema) → CTA

**待替换占位：** 域名、CTA 链接、Privacy/Terms/Contact

---

## 13. Git 与 GitHub 推送

### 13.1 仓库信息

- URL：https://github.com/ALALEI719/kindledict
- 本地路径：`/Users/leihaiqiang/Library/Mobile Documents/com~apple~CloudDocs/KindleDict`
- 初始提交：`00831af` — Initial commit: Kindle companion dictionary builder and landing page

### 13.2 首次推送步骤

```bash
# 1. 登录 GitHub（若未安装 gh，可先 brew install gh）
gh auth login

# 2. 推送
cd "/Users/leihaiqiang/Library/Mobile Documents/com~apple~CloudDocs/KindleDict"
git push -u origin main
```

### 13.3 常见错误：`Error in the HTTP2 framing layer`

GitHub 已登录但仍 push 失败时，强制 HTTP/1.1：

```bash
git -c http.version=HTTP/1.1 push -u origin main
```

或长期设置：

```bash
git config --global http.version HTTP/1.1
git push -u origin main
```

### 13.4 其他排查

- 开关 VPN 或换手机热点
- `gh auth setup-git` 后再 push
- 确认浏览器能访问 github.com
- SSH 需配置公钥；HTTPS + gh 登录通常更简单

### 13.5 .gitignore

```
__pycache__/
*.py[cod]
.DS_Store
.env
.venv/
dist/
```

`dist/` 为构建产物，应本地 `python3 build_dictionary.py` 重新生成。

---

## 14. 后续建议

### 14.1 产品 MVP 路线

**A. 读者产品：** Streamlit/Electron 桌面工具 + 按章上传/粘贴  
**B. 开发者产品：** 开源 Cursor Plugin + Pro 桌面一键打包

### 14.2 功能优先级

1. 章节文本 → 自动抽词 pipeline（LLM prompt + 后处理）
2. 一键打包 `.mobi`（内置或调用 kindlegen）
3. Streamlit 上传页原型
4. 英文/中文落地页 + 定价页
5. 合规边界文档（用户协议：个人使用、无 DRM）

### 14.3 参考资源

- [Creating a custom Kindle dictionary — Jake McCrary](https://jakemccrary.com/blog/2020/11/11/creating-a-custom-kindle-dictionary/)
- [The Fictionary](https://www.thefictionary.net/)（品类参考）
- [Kindle Publishing Guidelines / Previewer](https://www.amazon.com/gp/feature.html?docId=1000765261)
- [Dune Dictionary 先例（Gumroad）](https://gumroad.com/l/dune-dictionary)

---

## 附录：一句话总结

**Kindle 兼容的定制词典（Fictionary）技术上可行，且 Chapter 4 样例已验证；难点在自动抽词质量、kindlegen 工具链、真机适配与版权边界。产品可走桌面/SaaS 商业化，SEO 应同时覆盖 fictionary 品类词与「kindle 查不到」痛点词。**
