import type { GenerationScopeId } from "@/lib/generation-scope";

export const zh = {
  common: {
    home: "首页",
    privacy: "隐私政策",
    terms: "服务条款",
    contact: "联系我们",
    tryFree: "免费试用",
    buildDictionary: "生成词典",
    howItWorks: "使用流程",
    features: "功能",
    pricing: "价格",
    faq: "常见问题",
    backHome: "← 返回首页",
    footerTagline: "© 2026 KindleDict · 为深度阅读者定制的 Kindle 词典",
    language: "语言",
  },
  meta: {
    homeTitle: "KindleDict — 为每本书定制 Kindle 词典",
    homeDescription:
      "读奇幻、科幻或文学原著时，Kindle 查不到的专名？上传 EPUB，生成可在阅读时点词查询的定制词典。",
    appTitle: "生成词典 — KindleDict",
    appDescription:
      "上传 EPUB 或粘贴章节，生成可在 Kindle 上使用的定制伴侣词典。",
    privacyTitle: "隐私政策 — KindleDict",
    termsTitle: "服务条款 — KindleDict",
    contactTitle: "联系我们 — KindleDict",
  },
  landing: {
    heroBadge: "定制 Kindle 小说词典 — 不只是又一本电子书",
    heroTitle: "Kindle 说「查不到」的词，也能当场释义",
    heroSubBefore: "KindleDict 根据你正在读的书生成",
    heroSubBold: "定制 Kindle 词典",
    heroSubAfter:
      "。点人物名、地名和世界观术语，在词典弹窗里直接看释义，不用翻书后索引。",
    heroCtaPrimary: "免费生成你的词典",
    heroCtaSecondary: "了解怎么用",
    heroVisualLabel: "在 Kindle 上阅读时",
    heroDemoLine1: "……与",
    heroDemoLine2: "一同北上长城，艾莉亚一直握着",
    heroDemoLine3: "……",
    lookupTag: "人物 · 《列王的纷争》第 4 章",
    lookupDef:
      "守夜人的黑衣兄弟，从地牢招募新兵。正押送一批人北上长城，其中包括伪装的艾莉亚。",
    problemTitle: "内置词典不是为小说设计的",
    problemSub: "通用英汉/英英词典对付日常词汇够用，但真正拖慢你阅读的是另一类词。",
    problemCards: [
      {
        title: "「查不到该词」",
        body: "长按一个人名 — Kindle 毫无结果，阅读节奏被打断。",
      },
      {
        title: "书末索引打断沉浸感",
        body: "有些版本带词汇表，但要离开当前页、手动查找，还不一定收录。",
      },
      {
        title: "人名地名太多记不住",
        body: "奇幻、科幻、文学原著里的人物、地点、设定词堆叠得比记忆快。",
      },
    ],
    stepsTitle: "四步：从电子书到 Kindle 词典",
    stepsSub: "不是 PDF，不是旁路电子书，而是 Kindle 点词时真正调用的词典。",
    steps: [
      {
        title: "上传书籍",
        body: "上传 EPUB 或粘贴章节。我们扫描读者真的会去查的人名、地名和术语。",
      },
      {
        title: "AI 生成词条",
        body: "每条含语境释义、别名/变体（昵称、所有格），并可按章节控制剧透范围。",
      },
      {
        title: "下载 .mobi",
        body: "编译为 Kindle 兼容词典格式 — 与爱好者自制小说词典相同路线。",
      },
      {
        title: "阅读时点词",
        body: "传到 Kindle、设为默认词典，不离开页面即可查词。",
      },
    ],
    featuresTitle: "按 Kindle 真实查词方式设计",
    featuresSub: "每个功能都针对内置词典做不到的事。",
    features: [
      {
        title: "真正的词典集成",
        body: "在 Kindle 点词弹窗里生效 — 不用另外打开一本「说明电子书」。",
      },
      {
        title: "人名与昵称",
        body: "「Arya」「Arry」「Yoren's」等变体一并索引，单词长按也能命中。",
      },
      {
        title: "地点、设定与造词",
        body: "瓦雷利亚钢、长城、 sourleaf — 通用词典不会收录的书中词汇。",
      },
      {
        title: "按章节防剧透",
        body: "释义只基于你已读内容，不会把后续情节写进前期章节。",
      },
      {
        title: "查不到时自动回退",
        body: "自定义词典没有的词，仍会走你安装的其他词典。",
      },
      {
        title: "生僻英文词也覆盖",
        body: "courser、fettered 等真英文但太生僻、影响阅读速度的词汇。",
      },
    ],
    compareTitle: "KindleDict 与其他方案",
    compareSub: "为什么定制小说词典比凑合方案更顺手。",
    compareHeaders: ["", "KindleDict", "内置词典", "书末索引", "Kindle X-Ray"],
    compareRows: [
      ["点词弹窗释义", "yes", "yes", "no", "no"],
      ["人名与地名", "yes", "no", "sometimes", "sometimes"],
      ["适用于任意书", "yes", "yes", "no", "limited"],
      ["不离开当前页", "yes", "yes", "no", "no"],
      ["按你的版本定制", "yes", "no", "no", "no"],
    ],
    compareYes: "是",
    compareNo: "否",
    compareSometimes: "部分",
    compareLimited: "仅部分书目",
    audienceTitle: "为常遇到「查不到」的读者而生",
    audienceSub: "如果你曾在章节中间停下来搜一个人名，这就是为你做的。",
    audienceCards: [
      {
        title: "奇幻与科幻读者",
        body: "每本书几十上百个家族、昵称、造词 — 终于能像普通单词一样查。",
      },
      {
        title: "文学与历史小说",
        body: "古语、时代专名 — 结合语境解释，而不是通用词典里的无关义项。",
      },
      {
        title: "读英文原版的语言学习者",
        body: "难词若是专名或书中术语，学习者词典同样帮不上忙。",
      },
    ],
    demoTitle: "先用示例章节跑通一次",
    demoSub:
      "不上传自己的书也可以体验完整流程：加载示例章节、生成词条、下载 Kindle 词典文件。",
    demoCta: "打开示例章节",
    pricingTitle: "商业化验证价",
    pricingSub:
      "公测期先验证读者是否愿意为完整书籍生成付费，免费试用仍保留。",
    pricingPlans: [
      {
        name: "章节试用",
        price: "免费",
        body: "适合确认识别质量和 Kindle 安装流程。",
        cta: "免费试用",
        href: "/app?sample=1",
      },
      {
        name: "单本完整生成",
        price: "$3.99 / 本",
        body: "面向愿意付费的重度读者；接入支付链接后可直接售卖。",
        cta: "加入付费公测",
        href: "/contact",
      },
      {
        name: "作者/出版方",
        price: "$49 起",
        body: "为自有作品制作读者伴侣词典，版权边界更清晰。",
        cta: "联系定制",
        href: "/contact",
      },
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        q: "什么是 fictionary（小说词典）？",
        a: "为某一本书（或系列）定制的 Kindle 词典。行为与普通词典一样 — 长按看释义 — 但词条描述的是该书的人物、地点和术语，而不是通用英语。",
      },
      {
        q: "为什么 Kindle 查不到人名？",
        a: "内置词典只有通用词汇。虚构人名、地名和造词不在牛津、韦氏等库存词典里，所以查询失败。KindleDict 用针对该书的词典文件补上这块空白。",
      },
      {
        q: "这只是另一本电子书吗？",
        a: "不是。普通 MOBI 电子书不能替代词典。KindleDict 导出带词典索引的 .mobi 和专用元数据，Kindle 会把它识别为词典并在点词弹窗中使用。",
      },
      {
        q: "支持哪些 Kindle 设备？",
        a: "支持自定义词典的 Kindle 阅读器 — 包括 Paperwhite、Oasis、Scribe 等。侧载 .mobi 后，在 设置 → 语言与词典 中设为默认词典。",
      },
      {
        q: "可以上传什么格式？",
        a: "无 DRM 的 EPUB，或手动粘贴的章节文本。不支持带 DRM 的 Kindle（AZW/KFX）文件。你必须对上传内容拥有合法使用权。",
      },
      {
        q: "自定义词典里没有的词会怎样？",
        a: "Kindle 先查你的定制词典，再回退到其他已安装词典。未覆盖的普通英文仍可正常查询。",
      },
      {
        q: "我的书会上传到你们服务器吗？",
        a: "文件用于生成词典，短期处理后删除。我们不会用你的书训练 AI 模型。详见隐私政策。",
      },
    ],
    ctaTitle: "别再翻索引了，直接点词。",
    ctaSub: "免费上传章节，几分钟内下载 Kindle 可用的小说词典。",
    ctaButton: "立即开始 — 免费",
    ctaNote: "无需信用卡 · 无 DRM EPUB 或粘贴文本 · 仅供个人使用",
  },
  builder: {
    publicBeta: "公测中",
    title: "从电子书生成 Kindle 词典",
    subtitle: "上传 EPUB、选择扫描范围，下载一本 Kindle 伴侣词典。",
    step1Title: "1. 添加书籍文本",
    step1Hint: "上传无 DRM 的 EPUB（最大 15 MB），或粘贴章节文本。",
    loaded: "已加载",
    chapters: "章",
    chooseEpub: "选择 EPUB",
    pasteAlt: "或改为粘贴章节文本",
    hidePaste: "收起粘贴区",
    chapterText: "章节文本",
    chapterPlaceholder: "没有 EPUB 时，可在此粘贴章节内容……",
    step2Title: "2. 词典设置",
    bookTitle: "书名",
    bookTitlePlaceholder: "A Clash of Kings",
    howMuchScan: "扫描范围",
    charLimit: "字符上限",
    scanPreview:
      "待扫描文本（预览，切换上方选项会更新）",
    scanPreviewEmpty: "当前范围内可读文本不足，请换一个选项。",
    characters: "字符",
    generate: "生成词典",
    generating: "生成中",
    trySample: "试用示例章节",
    apiKeyRequired: "还需要配置 API Key",
    apiKeyRequiredBody:
      "生成前请展开下方「AI 服务商与 API Key」，填入密钥并点击「验证并保存」。",
    previewTitle: "预览词条",
    entriesReady: "{count} 条词条已就绪",
    backToBook: "返回编辑",
    also: "亦作",
    downloadZip: "下载词典 ZIP",
    downloadMobi: "下载 Kindle 词典 .mobi",
    regenerate: "重新生成",
    installTitle: "安装到 Kindle",
    installStepsZip: [
      "若下载的是 ZIP，用 Kindle Previewer 3 打开 dict.opf，导出为 .mobi。",
      "将 .mobi 复制到 Kindle 的 documents/dictionaries/（USB 或邮件）。",
      "阅读时长按单词；若弹出其他词典，点顶部名称切换为本词典。",
    ],
    installStepsMobi: [
      "将下载的 .mobi 复制到 Kindle 的 documents/dictionaries/（USB 或邮件）。",
      "在 Kindle 设置 → 语言与词典 中选择这本词典；或查词时点顶部词典名切换。",
      "阅读时长按人物名、地名或术语，即可在词典弹窗中查看释义。",
    ],
    downloadedZip:
      "ZIP 已下载 — 用 Kindle Previewer 3 打开 dict.opf → 导出 .mobi",
    downloadedMobi: ".mobi 已下载 — 复制到 Kindle 的 documents/dictionaries/ 后即可选择使用",
    hostedAiReady: "托管 AI 已启用：本次生成不需要填写自己的 API Key。",
    progressChapter: "第 {current} / {total} 章：",
    loadingSample: "正在加载示例章节……",
    readingEpub: "正在读取 EPUB……",
    readingChars: "正在读取 {count} 个字符……",
    readingChapter: "正在读取第 {index} / {total} 章：{label}",
    packaging: "正在打包词典……",
    packagingFiles: "正在打包词典文件……",
    errors: {
      geminiModel:
        "Gemini 模型已更新。请在 Vercel 将 GOOGLE_CHAT_MODEL 设为 gemini-2.5-flash，保存并重新部署后再试。",
      geminiKey:
        "Gemini API 密钥无效或已过期。请展开下方「AI 服务商与 API Key」，点击「验证并保存」重新验证。",
      needApiKey:
        "请先配置 AI API Key：展开下方「AI 服务商与 API Key」，填入密钥后点击「验证并保存」。",
      aiNotConfigured:
        "AI 提取尚未配置。请添加 API Key，或在服务端配置凭证。",
      customLimitMin: "自定义字符数至少为 100。",
      noReadableChapters: "该 EPUB 没有足够长的可读章节可供处理。",
      needText: "请上传 EPUB，或粘贴至少几段章节文本。",
      noEntries: "所选范围内未提取到任何词条。",
      loadSample: "无法加载示例章节。",
      loadSampleFail: "加载示例失败。",
      epubTooLarge:
        "EPUB 文件过大（最大 15 MB）。请换一本较小的书，或粘贴章节文本。",
      epubReadFail:
        "无法读取该 EPUB 文件。若文件在 iCloud 网盘，请先在本机「下载」完成后再选择；或换用本地副本。",
      networkError:
        "网络请求失败。请检查网络；生成时请先选「快速试用」等较小范围；并确认 API Key 已验证。",
      parseEpub: "EPUB 解析失败。",
      parseEpubFail: "解析 EPUB 失败。",
      noReadableInEpub:
        "该 EPUB 没有可读章节。请尝试粘贴章节文本。",
      extractFail: "提取失败：{label}",
      buildFail: "打包失败。",
      generateFail: "词典生成失败。",
      generic: "出了点问题。",
    },
    scopes: {
      "trial-15k": {
        label: "快速试用 · 15,000 字符",
        description: "适合首次测试，大约 1 次 AI 请求。",
        estimatedRequests: "约 1 次请求",
      },
      "trial-30k": {
        label: "短样本 · 30,000 字符",
        description: "更长一点的试读，不会跑完整本书。",
        estimatedRequests: "约 1 次请求",
      },
      "first-chapter": {
        label: "仅第一章",
        description: "处理 EPUB 中第一个可读章节。",
        estimatedRequests: "约 1 次请求",
      },
      "first-3-chapters": {
        label: "前 3 章",
        description: "覆盖面与 API 成本的平衡之选。",
        estimatedRequests: "约 3 次请求",
      },
      "full-book": {
        label: "全书",
        description: "扫描所有章节并合并为一本词典。",
        estimatedRequests: "多次请求",
      },
      "custom-chars": {
        label: "自定义字符上限",
        description: "从书的开头起，读取到你设定的字符数为止。",
        estimatedRequests: "约 1 次请求",
      },
    } satisfies Record<
      GenerationScopeId,
      { label: string; description: string; estimatedRequests: string }
    >,
    scopeLabels: {
      noReadable: "无可读章节",
      notEnoughText: "所选范围内文本不足",
      customExcerpt: "自定义摘录（{count} 字符）",
      trial15k: "试用摘录（1.5 万字符）",
      trial30k: "短样本（3 万字符）",
      first3: "前 3 章",
      fullBook: "全书",
      pastedText: "粘贴文本",
      previewHeader: "[预览] {count} 个片段 · 共 {chars} 字符",
      previewFirst: "[第一段：{label}]",
      previewMore: "……另有 {count} 个片段在此扫描范围内。",
    },
    dictTitle: "{book} — 伴侣词典",
    dictTitleChapter: "{book} — {chapter} 伴侣词典",
    myBook: "我的书",
    chapter: "第 1 章",
  },
  apiKey: {
    panelTitle: "AI 服务商与 API Key",
    verified: "已验证",
    required: "必填",
    hint: "密钥只保存在本浏览器，仅在生成词典时发送给 AI 服务商。",
    getKey: "获取 API Key",
    provider: "服务商",
    model: "模型",
    baseUrl: "接口地址",
    apiKey: "API Key",
    verifying: "验证中…",
    verifySave: "验证并保存",
    verifyHint:
      "「验证并保存」会发起一次极小测试请求确认密钥可用，再保存到本地。生成前请先完成，以免浪费 token。",
    enterKeyFirst: "请先填写 API Key。",
    testing: "正在测试连接……",
    testFail: "连接测试失败。",
    connected: "已连接 {provider} · {model}",
  },
  legal: {
    privacyTitle: "隐私政策",
    termsTitle: "服务条款",
    contactTitle: "联系我们",
    updated: "最后更新：2026 年 5 月 21 日",
    contact: {
      intro: "如需支持、隐私相关咨询或产品反馈，请在 GitHub 提交 issue。",
      github: "GitHub",
      githubDesc: "报告问题、提问或功能建议：",
      repo: "代码仓库",
      repoDesc: "源代码与文档：",
      responseTitle: "回复时间",
      response:
        "KindleDict 为独立项目。我们会在条件允许时，尽量在几个工作日内回复 GitHub issue。",
    },
    privacy: {
      overview: {
        title: "概述",
        body: "KindleDict（「我们」「本服务」）帮助您根据提供的文本生成定制 Kindle 伴侣词典。本政策说明我们收集什么、如何使用以及您的选择。",
      },
      submit: {
        title: "您提交的内容",
        body: "使用词典生成器时，您可粘贴章节或上传无 DRM 文件（如 EPUB）。这些内容仅用于为您个人生成词典条目。",
      },
      process: {
        title: "我们如何处理内容",
        items: [
          "公测期间，您在浏览器中提供自己的 AI 服务商 API Key。密钥保存在本地浏览器存储，仅在生成或测试词典时发送到我们的服务器。",
          "书籍文本会发送到您选择的 AI 服务商（Gemini、DeepSeek、OpenAI 兼容网关等），用于提取人名、地名、书中术语并撰写释义。",
          "我们不会在请求结束后将 API Key 存入数据库，也不会用您的书籍或章节文本训练 AI 模型。",
          "生成的词典文件（HTML、OPF、ZIP 或 MOBI）通过浏览器返回或供您下载。",
        ],
      },
      retention: {
        title: "保留期限",
        body1:
          "我们设计服务以避免长期保存您的原文。通过网页提交的内容仅为当前请求处理，不会在服务器上永久建库。服务器日志可能短期保留技术元数据（如时间戳、错误信息）用于安全与排错。",
        body2:
          "第三方 AI 服务商对 API 请求可能有自己的保留政策。若使用默认提取后端，请查阅 OpenAI 相关政策。",
      },
      notDo: {
        title: "我们不会做的事",
        items: [
          "不出售您的书籍内容或个人数据。",
          "不绕过 DRM，不处理受保护的 Kindle（AZW/KFX）文件。",
          "不会擅自发布或分发您创建的词典，除非您自行分享。",
        ],
      },
      cookies: {
        title: "Cookie 与分析",
        body: "托管商（Vercel）可能收集标准网站分析与性能数据。未来若增加隐私友好的分析工具，本页将相应更新。",
      },
      responsibility: {
        title: "您的责任",
        body: "您必须对提交文本拥有合法使用权。KindleDict 面向个人学习，请勿上传您无权处理的内容。",
      },
      children: {
        title: "儿童",
        body: "本服务不面向 13 岁以下儿童，我们不会有意收集儿童个人信息。",
      },
      changes: {
        title: "政策变更",
        body: "我们可能不时更新本政策。更新发布后继续使用服务，即视为接受更新后的政策。",
      },
      contact: {
        title: "联系",
        body: "对隐私有疑问？请查看",
        link: "联系我们",
        suffix: "页面。",
      },
    },
    terms: {
      agreement: {
        title: "协议",
        body: "使用 KindleDict 即表示您同意本服务条款。若不同意，请勿使用本服务。",
      },
      provides: {
        title: "服务内容",
        body: "KindleDict 帮助您根据提供的文本创建 Kindle 兼容的定制词典（「小说词典」），包括网页界面、AI 辅助抽词与词典文件生成。",
      },
      permitted: {
        title: "允许的使用",
        items: [
          "为您合法拥有或有权使用的书籍提供个人、非商业的阅读辅助。",
          "为侧载到您自己的 Kindle 设备而创建词典。",
          "使用无 DRM 源文件或从您自有副本手动粘贴的文本。",
        ],
      },
      prohibited: {
        title: "禁止的使用",
        intro: "您不得将 KindleDict 用于：",
        items: [
          "移除、绕过或破解电子书 DRM。",
          "上传、处理或分发盗版或未授权版权作品。",
          "在无权情况下商业化分发基于版权书籍的词典包。",
          "滥用服务（自动爬取、拒绝服务、试图访问他人数据等）。",
          "违反适用法律或第三方服务条款。",
        ],
      },
      ip: {
        title: "知识产权",
        body1:
          "书中人物名、地名等元素仍归相应版权方所有。您生成的词条可能构成个人使用的衍生摘要。您须自行确保使用符合所在司法辖区的版权法。",
        body2:
          "KindleDict 名称、网站与软件按「现状」提供。我们不主张对您原文或为您个人词典生成的具体措辞享有所有权。",
      },
      ai: {
        title: "AI 生成内容",
        body: "词条与术语列表由 AI 辅助生成，可能仍有错误、遗漏或剧透。使用前请自行核对。我们不保证准确性、完整性或适用于任何特定目的。",
      },
      kindle: {
        title: "Kindle 兼容性",
        body: "我们力求生成可侧载的 Kindle 词典文件，但不同机型与固件行为各异。您须自行在设备上测试并遵循 Amazon 侧载说明。",
      },
      availability: {
        title: "服务可用性",
        body: "我们可能不经通知变更、暂停或停止功能。不保证不间断可用。未来可能对高用量引入 API 限制或收费。",
      },
      warranty: {
        title: "免责声明",
        body: "KindleDict 按「现状」和「可用性」提供，不作任何明示或默示保证，包括适销性或特定用途适用性。",
      },
      liability: {
        title: "责任限制",
        body: "在法律允许的最大范围内，KindleDict 及其运营方不对因使用服务产生的间接、附带、特殊或后果性损害承担责任，包括数据、阅读进度或设备问题。",
      },
      termination: {
        title: "终止",
        body: "若我们认为您违反条款或对服务或其他用户构成风险，可暂停或终止访问。",
      },
      changes: {
        title: "条款变更",
        body: "我们可能更新条款。重大变更将反映在本页更新日期。继续使用即视为接受。",
      },
      contact: {
        title: "联系",
        body: "对条款有疑问？请查看",
        link: "联系我们",
        suffix: "页面。",
      },
    },
  },
} as const;

export type ZhMessages = typeof zh;
