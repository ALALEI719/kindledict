import type { GenerationScopeId } from "@/lib/generation-scope";

export const en = {
  common: {
    home: "Home",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    tryFree: "Try free",
    buildDictionary: "Build dictionary",
    howItWorks: "How it works",
    features: "Features",
    faq: "FAQ",
    backHome: "← Back to home",
    footerTagline:
      "© 2026 KindleDict · Custom Kindle dictionaries & fictionaries for serious readers",
    language: "Language",
  },
  meta: {
    homeTitle: "KindleDict — Custom Kindle dictionaries for your books",
    homeDescription:
      "Character names Kindle can't find? Upload EPUB and build a tap-to-define companion dictionary for your Kindle.",
    appTitle: "Build Dictionary — KindleDict",
    appDescription:
      "Upload EPUB or paste a chapter to generate a Kindle-compatible companion dictionary.",
    privacyTitle: "Privacy Policy — KindleDict",
    termsTitle: "Terms of Service — KindleDict",
    contactTitle: "Contact — KindleDict",
  },
  landing: {
    heroBadge: "Custom Kindle fictionaries — not just another ebook",
    heroTitle: "Look up any word in your book — even when Kindle says \"not found\"",
    heroSubBefore: "KindleDict builds a ",
    heroSubBold: "custom Kindle dictionary",
    heroSubAfter:
      " from the book you're reading. Tap character names, places, and lore terms and get definitions right in the dictionary popup — without flipping to a glossary.",
    heroCtaPrimary: "Build your fictionary — free",
    heroCtaSecondary: "See how it works",
    heroVisualLabel: "While reading on Kindle",
    heroDemoLine1: "…traveling north with ",
    heroDemoLine2: " toward the Wall, Arya kept her hand on ",
    heroDemoLine3: "…",
    lookupTag: "Character · A Clash of Kings, Ch. 4",
    lookupDef:
      "Black brother of the Night's Watch who recruits from the dungeons. Currently transporting men and boys to the Wall, including Arya in disguise.",
    problemTitle: "Your Kindle dictionary wasn't built for fiction",
    problemSub:
      "Built-in dictionaries work for standard English. They fail on the words that actually slow you down.",
    problemCards: [
      {
        title: "\"Word not found\"",
        body: "Press and hold a character name — Kindle returns nothing. You lose the thread of the story.",
      },
      {
        title: "Back-of-book glossaries break flow",
        body: "Some editions include a glossary, but you have to leave the page, search manually, and hope the term is listed.",
      },
      {
        title: "Too many names to track",
        body: "Epic fantasy, sci-fi, and literary fiction pile on people, places, and invented terms faster than memory allows.",
      },
    ],
    stepsTitle: "From book to Kindle dictionary in four steps",
    stepsSub:
      "Not a PDF. Not a separate ebook. A real dictionary your Kindle uses when you tap a word.",
    steps: [
      {
        title: "Upload your book",
        body: "Add an EPUB or paste a chapter. We scan for names, places, and terms readers actually look up.",
      },
      {
        title: "AI builds entries",
        body: "Each entry includes context-aware definitions, alternate forms (nicknames, possessives), and spoiler-safe scope.",
      },
      {
        title: "Download .mobi",
        body: "We compile a Kindle-compatible dictionary file — the same format used by fan-made fictionaries for decades.",
      },
      {
        title: "Read and tap",
        body: "Sideload to your Kindle, set as default dictionary, and look up words without leaving the page.",
      },
    ],
    featuresTitle: "Built for how Kindle lookup actually works",
    featuresSub: "Every feature exists because standard dictionaries miss it.",
    features: [
      {
        title: "True dictionary integration",
        body: "Works in Kindle's tap-to-define popup — not a side-loaded book you have to open separately.",
      },
      {
        title: "Character names & nicknames",
        body: "\"Arya\", \"Arry\", \"Yoren's\" — alternate forms indexed so single-word lookup hits the right entry.",
      },
      {
        title: "Places, lore & invented terms",
        body: "Valyrian steel, the Wall, sourleaf — book-specific vocabulary built-in dictionaries ignore.",
      },
      {
        title: "Spoiler-aware by chapter",
        body: "Definitions only use what you've read so far. No future plot points leaking into early chapters.",
      },
      {
        title: "Falls back gracefully",
        body: "Words not in your fictionary still query your regular dictionaries. Best of both worlds.",
      },
      {
        title: "Rare English words too",
        body: "Courser, fettered, squalid — vocabulary that's real English but too obscure for quick reading.",
      },
    ],
    compareTitle: "KindleDict vs. everything else",
    compareSub: "Why a custom fictionary beats the workarounds.",
    compareHeaders: ["", "KindleDict", "Built-in dictionary", "Back-of-book glossary", "Kindle X-Ray"],
    compareRows: [
      ["Tap-to-define in popup", "yes", "yes", "no", "no"],
      ["Character & place names", "yes", "no", "sometimes", "sometimes"],
      ["Works on every book", "yes", "yes", "no", "limited"],
      ["Stay on the same page", "yes", "yes", "no", "no"],
      ["Custom per your edition", "yes", "no", "no", "no"],
    ],
    compareYes: "Yes",
    compareNo: "No",
    compareSometimes: "Sometimes",
    compareLimited: "Limited titles",
    audienceTitle: "Made for readers who hit \"word not found\"",
    audienceSub: "If you've ever paused mid-chapter to Google a name, this is for you.",
    audienceCards: [
      {
        title: "Fantasy & sci-fi fans",
        body: "Dozens of houses, nicknames, and invented terms per book. Finally look them up like normal words.",
      },
      {
        title: "Literary & historical fiction",
        body: "Archaic vocabulary and period-specific references — explained in context, not from a generic dictionary.",
      },
      {
        title: "English learners reading originals",
        body: "When the hard word is also a proper noun or book-specific term, standard learner dictionaries won't help.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        q: "What is a fictionary?",
        a: "A fictionary is a custom Kindle dictionary built for one book (or series). It behaves like a normal dictionary during reading — press and hold a word, see the definition — but the entries describe that book's characters, places, and terms instead of standard English.",
      },
      {
        q: "Why doesn't my Kindle find character names?",
        a: "Built-in dictionaries only include general vocabulary. Fictional names, locations, and invented words are not in Oxford, Merriam-Webster, or any stock Kindle dictionary — so lookup fails. KindleDict fills that gap with a book-specific dictionary file.",
      },
      {
        q: "Is this just another ebook?",
        a: "No. A regular MOBI ebook cannot replace your dictionary. KindleDict exports a dictionary-indexed .mobi with special metadata and lookup tags. Your Kindle recognizes it as a dictionary and uses it in the tap-to-define popup.",
      },
      {
        q: "Which Kindle devices are supported?",
        a: "Any Kindle e-reader that supports custom dictionaries — including Paperwhite, Oasis, and Scribe. Sideload the .mobi file, then set it as your default dictionary under Settings → Language & Dictionaries.",
      },
      {
        q: "What file formats can I upload?",
        a: "DRM-free EPUB and pasted chapter text. We do not support DRM-protected Kindle (AZW/KFX) files. You must own the legal right to the content you upload.",
      },
      {
        q: "What happens to words not in my fictionary?",
        a: "Kindle searches your fictionary first, then falls back to your other installed dictionaries. You keep normal English lookup for everything your custom dictionary doesn't cover.",
      },
      {
        q: "Is my book uploaded to your servers?",
        a: "Files are processed to generate your dictionary and deleted after a short retention window. We do not use your books to train AI models. See our privacy policy for details.",
      },
    ],
    ctaTitle: "Stop flipping to the glossary. Start tapping.",
    ctaSub: "Upload a chapter free. Download a Kindle-ready fictionary in minutes.",
    ctaButton: "Get started — it's free",
    ctaNote: "No credit card · DRM-free EPUB or paste text · Personal use",
  },
  builder: {
    publicBeta: "Public beta",
    title: "Build a Kindle dictionary from your book",
    subtitle:
      "Upload EPUB, choose how much to scan, and download one companion dictionary for Kindle.",
    step1Title: "1. Add your book text",
    step1Hint: "Upload a DRM-free EPUB (max 15 MB) or paste chapter text.",
    loaded: "Loaded",
    chapters: "chapters",
    chooseEpub: "Choose EPUB",
    pasteAlt: "Or paste chapter text instead",
    hidePaste: "Hide pasted text",
    chapterText: "Chapter text",
    chapterPlaceholder: "Paste a chapter here if you do not have an EPUB…",
    step2Title: "2. Dictionary settings",
    bookTitle: "Book title",
    bookTitlePlaceholder: "A Clash of Kings",
    howMuchScan: "How much to scan",
    charLimit: "Character limit",
    scanPreview: "Text to scan (preview — updates when you change the option above)",
    scanPreviewEmpty:
      "Not enough readable text in this scan range. Try a different option.",
    characters: "characters",
    generate: "Generate dictionary",
    generating: "Generating",
    trySample: "Try sample chapter",
    apiKeyRequired: "API key required",
    apiKeyRequiredBody:
      "Before generating your dictionary, expand AI provider & API key below, enter your key, and click Verify & save.",
    previewTitle: "Preview entries",
    entriesReady: "{count} entries ready",
    backToBook: "Back to book",
    also: "Also",
    downloadZip: "Download dictionary ZIP",
    regenerate: "Regenerate",
    installTitle: "Install on Kindle",
    installSteps: [
      "If you downloaded a ZIP, open dict.opf in Kindle Previewer 3 and export as .mobi.",
      "Copy the .mobi to documents/dictionaries/ on your Kindle (USB or email).",
      "While reading, long-press a word. If another dictionary opens, tap its name and switch to this one.",
    ],
    downloadedZip:
      "Downloaded ZIP — open dict.opf in Kindle Previewer 3 → Export .mobi",
    progressChapter: "Chapter {current} of {total}:",
    loadingSample: "Loading sample chapter…",
    readingEpub: "Reading EPUB…",
    readingChars: "Reading {count} characters…",
    readingChapter: "Reading chapter {index} of {total}: {label}",
    packaging: "Packaging your dictionary…",
    packagingFiles: "Packaging dictionary files…",
    errors: {
      geminiModel:
        "Gemini model was updated. In Vercel, set GOOGLE_CHAT_MODEL to gemini-2.5-flash, save, redeploy, then try again.",
      geminiKey:
        "Your Gemini API key is invalid or expired. Expand AI provider & API key below and click Verify & save.",
      needApiKey:
        "Configure your AI API key first: expand AI provider & API key below, enter your key, and click Verify & save.",
      aiNotConfigured:
        "AI extraction is not configured. Add an API key, or configure credentials on the server.",
      customLimitMin: "Custom limit must be at least 100 characters.",
      noReadableChapters:
        "This EPUB has no readable chapters long enough to process.",
      needText:
        "Upload an EPUB or paste at least a few paragraphs of chapter text.",
      noEntries: "No dictionary entries were extracted from this selection.",
      loadSample: "Could not load sample chapter.",
      loadSampleFail: "Failed to load sample.",
      epubTooLarge:
        "EPUB is too large (max 15 MB). Use a smaller file or paste chapter text instead.",
      parseEpub: "EPUB parsing failed.",
      parseEpubFail: "Failed to parse EPUB.",
      noReadableInEpub:
        "No readable chapters found in this EPUB. Try pasting chapter text instead.",
      extractFail: "Extraction failed for {label}",
      buildFail: "Build failed.",
      generateFail: "Dictionary generation failed.",
      generic: "Something went wrong.",
    },
    scopes: {
      "trial-15k": {
        label: "Quick try · 15,000 characters",
        description: "Best for first test. Roughly one AI request.",
        estimatedRequests: "~1 request",
      },
      "trial-30k": {
        label: "Short sample · 30,000 characters",
        description: "A longer taste of the book without running the full novel.",
        estimatedRequests: "~1 request",
      },
      "first-chapter": {
        label: "First chapter only",
        description: "Process the first readable chapter in the EPUB.",
        estimatedRequests: "~1 request",
      },
      "first-3-chapters": {
        label: "First 3 chapters",
        description: "Good balance between coverage and API cost.",
        estimatedRequests: "~3 requests",
      },
      "full-book": {
        label: "Full book",
        description: "Scan every chapter and merge into one dictionary.",
        estimatedRequests: "Many requests",
      },
      "custom-chars": {
        label: "Custom character limit",
        description: "Read from the start of the book up to your chosen limit.",
        estimatedRequests: "~1 request",
      },
    } satisfies Record<
      GenerationScopeId,
      { label: string; description: string; estimatedRequests: string }
    >,
    scopeLabels: {
      noReadable: "No readable chapters",
      notEnoughText: "Not enough text in selected range",
      customExcerpt: "Custom excerpt ({count} chars)",
      trial15k: "Trial excerpt (15k chars)",
      trial30k: "Short sample (30k chars)",
      first3: "First 3 chapters",
      fullBook: "Full book",
      pastedText: "Pasted text",
      previewHeader: "[Preview] {count} sections · {chars} characters total",
      previewFirst: "[First section: {label}]",
      previewMore: "… plus {count} more section(s) in this scan range.",
    },
    dictTitle: "{book} — Companion Dictionary",
    dictTitleChapter: "{book} — {chapter} Companion Dictionary",
    myBook: "My Book",
    chapter: "Chapter 1",
  },
  apiKey: {
    panelTitle: "AI provider & API key",
    verified: "verified",
    required: "required",
    hint: "Your key is stored only in this browser and is sent to your AI provider when you generate a dictionary.",
    getKey: "Get API key",
    provider: "Provider",
    model: "Model",
    baseUrl: "Base URL",
    apiKey: "API key",
    verifying: "Verifying…",
    verifySave: "Verify & save",
    verifyHint:
      "Verify & save runs a tiny test request to confirm your key works, then saves it locally. Complete this step before generating to avoid wasting tokens.",
    enterKeyFirst: "Enter your API key first.",
    testing: "Testing connection…",
    testFail: "Connection test failed.",
    connected: "Connected via {provider} · {model}",
  },
  legal: {
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Service",
    contactTitle: "Contact",
    updated: "Last updated: May 21, 2026",
    contact: {
      intro:
        "For support, privacy questions, or feedback about KindleDict, open an issue on GitHub.",
      github: "GitHub",
      githubDesc: "Report bugs, ask questions, or request features:",
      repo: "Repository",
      repoDesc: "Source code and documentation:",
      responseTitle: "Response time",
      response:
        "KindleDict is an independent project. We aim to respond to GitHub issues within a few business days when possible.",
    },
    privacy: {
      overview: {
        title: "Overview",
        body: 'KindleDict ("we", "our", "the service") helps you build custom Kindle companion dictionaries from text you provide. This policy explains what we collect, how we use it, and your choices.',
      },
      submit: {
        title: "What you submit",
        body: "When you use the dictionary builder, you may paste chapter text or upload DRM-free files (such as EPUB). This content is submitted solely to generate dictionary entries for your personal use.",
      },
      process: {
        title: "How we process your content",
        items: [
          "During the public beta, you provide your own AI provider API key in the browser. That key is saved locally in your browser storage and sent to our server only when you generate or test a dictionary.",
          "Book text is sent to your chosen AI provider (Gemini, DeepSeek, OpenAI-compatible gateways, and similar services) to extract names, places, and book-specific terms and to write definitions.",
          "We do not store your API key in our database after the request finishes, and we do not use your books or chapter text to train AI models.",
          "Generated dictionary files (HTML, OPF, ZIP, or MOBI) are returned to you in the browser or as a download.",
        ],
      },
      retention: {
        title: "Retention",
        body1:
          "We design the service to avoid long-term storage of your source text. Content submitted through the web app is processed for the active request and is not kept as a permanent library on our servers. Server logs may retain technical metadata (such as timestamps and error messages) for a limited period for security and debugging.",
        body2:
          "Third-party AI providers may have their own retention policies for API requests. Review OpenAI's policies if you use the default extraction backend.",
      },
      notDo: {
        title: "What we do not do",
        items: [
          "We do not sell your book content or personal data.",
          "We do not bypass DRM or process protected Kindle (AZW/KFX) files.",
          "We do not publish or redistribute dictionaries you create unless you choose to share them yourself.",
        ],
      },
      cookies: {
        title: "Cookies and analytics",
        body: "Our hosting provider (Vercel) may collect standard web analytics and performance data. We may add privacy-friendly analytics in the future; this page will be updated if that changes materially.",
      },
      responsibility: {
        title: "Your responsibilities",
        body: "You must have the legal right to use any text you submit. KindleDict is intended for personal study. Do not upload content you do not own or are not permitted to process.",
      },
      children: {
        title: "Children",
        body: "The service is not directed at children under 13. We do not knowingly collect personal information from children.",
      },
      changes: {
        title: "Changes",
        body: "We may update this policy from time to time. Continued use of the service after changes are posted constitutes acceptance of the updated policy.",
      },
      contact: {
        title: "Contact",
        body: "Questions about privacy? See our",
        link: "Contact",
        suffix: " page.",
      },
    },
    terms: {
      agreement: {
        title: "Agreement",
        body: "By using KindleDict, you agree to these Terms of Service. If you do not agree, do not use the service.",
      },
      provides: {
        title: "What KindleDict provides",
        body: 'KindleDict is a tool that helps you create custom Kindle-compatible dictionary files ("fictionaries") from text you supply. The service includes a web interface, AI-assisted term extraction, and dictionary file generation.',
      },
      permitted: {
        title: "Permitted use",
        items: [
          "Personal, non-commercial study and reading support for books you legally own or have the right to use.",
          "Creating dictionaries for sideloading onto your own Kindle devices.",
          "Using DRM-free source material or text you paste manually from your own copies.",
        ],
      },
      prohibited: {
        title: "Prohibited use",
        intro: "You may not use KindleDict to:",
        items: [
          "Remove, bypass, or circumvent DRM on ebooks.",
          "Upload, process, or distribute pirated or unauthorized copies of copyrighted works.",
          "Redistribute commercial dictionary packs built from copyrighted books without proper rights.",
          "Abuse the service (automated scraping, denial-of-service, attempting to access other users' data).",
          "Violate applicable laws or third-party terms of service.",
        ],
      },
      ip: {
        title: "Intellectual property",
        body1:
          "Character names, places, and other elements from books remain the property of their respective copyright holders. Dictionary entries you generate may constitute derivative summaries for personal use. You are responsible for ensuring your use complies with copyright law in your jurisdiction.",
        body2:
          "The KindleDict name, website, and software are provided as-is. We do not claim ownership of your source text or the specific wording of entries generated for your personal dictionaries.",
      },
      ai: {
        title: "AI-generated content",
        body: "Definitions and term lists are produced with AI assistance and may contain errors, omissions, or spoilers despite our prompts. Review entries before relying on them. KindleDict does not guarantee accuracy, completeness, or fitness for any particular purpose.",
      },
      kindle: {
        title: "Kindle compatibility",
        body: "We aim to produce files compatible with Kindle dictionary sideloading, but device behavior varies by model and firmware. You are responsible for testing on your device and following Amazon's sideloading instructions.",
      },
      availability: {
        title: "Service availability",
        body: "The service may change, pause, or discontinue features without notice. We do not guarantee uninterrupted availability. API usage limits or pricing may be introduced for heavy use in the future.",
      },
      warranty: {
        title: "Disclaimer of warranties",
        body: 'KindleDict is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability or fitness for a particular purpose.',
      },
      liability: {
        title: "Limitation of liability",
        body: "To the fullest extent permitted by law, KindleDict and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including loss of data, reading progress, or device issues.",
      },
      termination: {
        title: "Termination",
        body: "We may suspend or terminate access if we believe you have violated these terms or pose a risk to the service or other users.",
      },
      changes: {
        title: "Changes",
        body: "We may update these terms. Material changes will be reflected on this page with an updated date. Your continued use constitutes acceptance.",
      },
      contact: {
        title: "Contact",
        body: "Questions about these terms? See our",
        link: "Contact",
        suffix: " page.",
      },
    },
  },
} as const;
