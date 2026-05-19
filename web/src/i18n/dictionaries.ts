import { type Locale } from "./config";

export type Dict = {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  nav: {
    howItWorks: string;
    features: string;
    mcp: string;
    blog: string;
    platforms: string;
    console: string;
    addToChrome: string;
  };
  hero: {
    badge: string;
    h1Line1: string;
    h1Line2: string;
    intro: string;
    introCapsule: string;
    addToChrome: string;
    seeHow: string;
    bullet1: string;
    bullet2: string;
  };
  howItWorks: {
    eyebrow: string;
    h2: string;
    s1Title: string;
    s1Body: string;
    s2Title: string;
    s2Body: string;
    s3Title: string;
    s3Body: string;
  };
  features: {
    eyebrow: string;
    h2: string;
    sub: string;
    f1Title: string; f1Body: string;
    f2Title: string; f2Body: string;
    f3Title: string; f3Body: string;
    f4Title: string; f4Body: string;
    f5Title: string; f5Body: string;
    f6Title: string; f6Body: string;
  };
  platforms: {
    eyebrow: string;
    h2: string;
    foot: string;
    footLink: string;
  };
  agent: {
    h2Pre: string;
    h2Brand: string;
    cta: string;
  };
  cta: {
    h2: string;
    sub: string;
    addToChrome: string;
    seeAction: string;
  };
  footer: {
    tagline: string;
    productCol: string;
    mcpCol: string;
    useCol: string;
    legalCol: string;
    rights: string;
    builtFor: string;
    productLinks: { howItWorks: string; features: string; mcp: string; blog: string; faq: string; download: string };
    useLinks: { crossAi: string; coding: string; support: string; contact: string };
    legalLinks: { privacy: string; terms: string };
    language: string;
  };
  console: {
    sidebar: {
      library: string;
      graph: string;
      links: string;
      packs: string;
      teams: string;
      apiKeys: string;
      billing: string;
      help: string;
      settings: string;
      admin: string;
      closeMenu: string;
      themeLight: string;
      themeDark: string;
    };
    profile: {
      openMenu: string;
      account: string;
      plan: string;
      usage: string;
      status: string;
      invoicesNote: string;
      plansBilling: string;
      cancelPlan: string;
      settings: string;
      signOut: string;
      language: string;
      capsulesUnlimited: string;
      requestFeature: string;
      featureSubject: string;
    };
    help: {
      pageTitle: string;
      pageSub: string;
      contents: string;
      stillStuck: string;
      stillStuckBody: string;
      publicFaq: string;
      support: string;
      planLabels: {
        proAndAbove: string;
        premiumAndAbove: string;
        ultimateOnly: string;
      };
      sectionTitles: Record<string, string>;
      sectionSummaries: Record<string, string>;
    };
    billing: {
      pageTitle: string;
      pageSub: string;
      currentPlan: string;
      refresh: string;
      syncing: string;
      cancelling: string;
      cancelPlan: string;
      tier: string;
      status: string;
      usage: string;
      capsulesUsed: string;
      capsulesOf: string;
      unlimited: string;
      billingLabel: string;
      monthly: string;
      annual: string;
      mostPopular: string;
      currentPlanBadge: string;
      upgradeTo: string;
      subscribe: string;
      redirecting: string;
      contactSales: string;
      enterpriseName: string;
      enterpriseTagline: string;
      inactive: string;
      featureLabels: {
        capsules5: string;
        capsules15: string;
        capsules50: string;
        capsulesUnlimited: string;
        mobile: string;
        versioning: string;
        mcp: string;
        attachments: string;
        imageCapture: string;
        dynamicContext: string;
        contextPacks: string;
        teams: string;
        graphs: string;
        publicShare: string;
      };
      plans: {
        basic: { tagline: string };
        pro: { tagline: string };
        premium: { tagline: string };
        ultimate: { tagline: string };
      };
      modal: {
        pendingTitle: string;
        pendingBody: string;
        okBtn: string;
        successTitle: string;
        successBodyPrefix: string;
        successBodySuffix: string;
        gotIt: string;
        cancelledTitle: string;
        cancelledBody: string;
        errorTitle: string;
        close: string;
        refreshNow: string;
        cancelTitle: string;
        cancelBody: string;
        keepPlan: string;
        yesCancel: string;
      };
    };
  };
};

const en: Dict = {
  meta: {
    title: "dropdat — Cross-AI memory in one click",
    description:
      "Capture any AI chat as a portable capsule. Drop it into ChatGPT, Claude, Gemini and resume the conversation instantly. Open-source MCP server for Claude Code, Cursor, Cline, Claude Desktop.",
    ogTitle: "dropdat — Cross-AI memory: capture, capsule, drop anywhere",
    ogDescription:
      "One-click capture of any ChatGPT, Claude, or Gemini chat. Drop the capsule into a different AI and resume instantly. Free MCP server for Claude Code, Cursor, Cline.",
  },
  nav: {
    howItWorks: "How it works",
    features: "Features",
    mcp: "MCP",
    blog: "Blog",
    platforms: "Supported AIs",
    console: "Console",
    addToChrome: "Add to Chrome",
  },
  hero: {
    badge: "New · The capsule that travels between AIs",
    h1Line1: "Cross-AI memory,",
    h1Line2: "in one click.",
    intro:
      "dropdat is a browser extension that captures any AI conversation as a portable",
    introCapsule: "capsule",
    addToChrome: "Add to Chrome",
    seeHow: "See how it works",
    bullet1: "Free for personal use",
    bullet2: "Local-first storage",
  },
  howItWorks: {
    eyebrow: "How it works",
    h2: "Capture once. Drop anywhere. Resume instantly.",
    s1Title: "Click the capsule",
    s1Body:
      "A capsule icon appears in every supported AI chat. One click captures the full conversation — messages, code blocks, attachments.",
    s2Title: "Save as a capsule",
    s2Body:
      "dropdat compresses the chat into a portable capsule and stores it in your local library. Tag it, summarise it, search it later.",
    s3Title: "Drop into any AI",
    s3Body:
      "Open ChatGPT, Claude, Gemini, Perplexity — drop the capsule and resume the conversation right where it left off.",
  },
  features: {
    eyebrow: "Features",
    h2: "Built for the way you actually use AI.",
    sub: "Every feature exists to remove one friction point in cross-AI workflows.",
    f1Title: "Cross-AI memory",
    f1Body: "One capsule format works across every major chat AI. No vendor lock-in, no copy-paste tax.",
    f2Title: "Browser extension",
    f2Body: "Lightweight Chrome extension injects a capsule button right inside chatgpt.com, claude.ai and more.",
    f3Title: "Capsule library",
    f3Body: "All your captured chats in one searchable library. Tag, summarise, organise — never lose a thread again.",
    f4Title: "Instant resume",
    f4Body: "Drop a capsule into a fresh chat and continue exactly where you left off. Context, code, references — all there.",
    f5Title: "Local-first",
    f5Body: "Capsules live in your browser by default. Sync across devices only if you want — encrypted end to end.",
    f6Title: "Open format",
    f6Body: "Capsules are plain JSON. Export, version-control, share with a teammate — your data, your rules.",
  },
  platforms: {
    eyebrow: "Supported AIs",
    h2: "Works everywhere your conversations live.",
    foot: "More platforms added every month — request one on",
    footLink: "GitHub",
  },
  agent: {
    h2Pre: "Your AI needs its",
    h2Brand: "dropdat.",
    cta: "Read the docs",
  },
  cta: {
    h2: "Drop your first capsule today.",
    sub: "Free Chrome extension. No account needed to start. Set up in under a minute.",
    addToChrome: "Add to Chrome",
    seeAction: "See it in action",
  },
  footer: {
    tagline: "Cross-AI memory in one click. Capture, capsule, drop.",
    productCol: "Product",
    mcpCol: "MCP clients",
    useCol: "Use cases",
    legalCol: "Legal",
    rights: "All rights reserved.",
    builtFor: "Built for the post-stateless era.",
    productLinks: {
      howItWorks: "How it works",
      features: "Features",
      mcp: "MCP server",
      blog: "Blog",
      faq: "FAQ",
      download: "Download",
    },
    useLinks: {
      crossAi: "Cross-AI memory",
      coding: "Coding agent memory",
      support: "Support",
      contact: "Contact",
    },
    legalLinks: { privacy: "Privacy", terms: "Terms" },
    language: "Language",
  },
  console: {
    sidebar: {
      library: "Library",
      graph: "Graph",
      links: "Links",
      packs: "Packs",
      teams: "Teams",
      apiKeys: "API Keys",
      billing: "Billing",
      help: "Help",
      settings: "Settings",
      admin: "Admin",
      closeMenu: "Close menu",
      themeLight: "Switch to light",
      themeDark: "Switch to dark",
    },
    profile: {
      openMenu: "Open profile menu",
      account: "Account",
      plan: "Plan",
      usage: "Usage",
      status: "Status",
      invoicesNote: "Invoices and receipts are emailed automatically.",
      plansBilling: "Plans & billing",
      cancelPlan: "Cancel plan",
      settings: "Settings",
      signOut: "Sign out",
      language: "Language",
      capsulesUnlimited: "capsules (unlimited)",
      requestFeature: "Request a feature",
      featureSubject: "Feature request",
    },
    help: {
      pageTitle: "Help & features",
      pageSub: "Every dropdat feature in one place — what it does, how to use it, and which plan it lives on. Jump to any section below.",
      contents: "Contents",
      stillStuck: "Still stuck?",
      stillStuckBody: "Check the public FAQ for higher-level questions, or open a support ticket.",
      publicFaq: "Public FAQ",
      support: "Support",
      planLabels: {
        proAndAbove: "Pro and above",
        premiumAndAbove: "Premium and above",
        ultimateOnly: "Ultimate only",
      },
      sectionTitles: {
        library: "Library",
        capture: "Capture (Chrome extension)",
        drop: "Drop into another AI",
        versioning: "Versioning",
        mobile: "Mobile capture",
        links: "Links",
        packs: "Context packs",
        graphs: "Similarity graphs",
        teams: "Teams",
        share: "Public capsule sharing",
        mcp: "MCP server",
        "api-keys": "API keys",
        billing: "Billing & plans",
      },
      sectionSummaries: {
        library: "Every capsule you've captured, searchable by title and content.",
        capture: "Save any AI chat into a capsule with one click.",
        drop: "Paste a capsule into any AI to resume the conversation there.",
        versioning: "Fork or edit a capsule and keep full lineage.",
        mobile: "Save anything from your phone — share-sheet on Android, Shortcut on iOS.",
        links: "Stash URLs alongside your capsules — same library, different shape.",
        packs: "Bundle related capsules into one drop-in markdown block.",
        graphs: "Visualise how your capsules and packs relate.",
        teams: "Share a capsule library with a small group.",
        share: "Generate a read-only public link for a single capsule.",
        mcp: "Recall capsules from any MCP-capable agent (Claude Code, Cursor, Cline, Claude Desktop).",
        "api-keys": "Programmatic access tokens scoped to your plan.",
        billing: "Manage your subscription and per-tier limits.",
      },
    },
    billing: {
      pageTitle: "Billing",
      pageSub: "Pick the plan that fits how you work. Cancel or change any time.",
      currentPlan: "Current plan",
      refresh: "Refresh",
      syncing: "Syncing…",
      cancelling: "Cancelling…",
      cancelPlan: "Cancel plan",
      tier: "Tier",
      status: "Status",
      usage: "Usage",
      capsulesUsed: "capsules used",
      capsulesOf: "of",
      unlimited: "unlimited",
      billingLabel: "Billing",
      monthly: "Monthly",
      annual: "Annual",
      mostPopular: "Most popular",
      currentPlanBadge: "Current plan",
      upgradeTo: "Upgrade to",
      subscribe: "Subscribe",
      redirecting: "Redirecting…",
      contactSales: "Contact sales",
      enterpriseName: "Enterprise",
      enterpriseTagline: "Custom capsule limits, white-labeling, on-premise, dedicated support, SLA.",
      inactive: "inactive",
      featureLabels: {
        capsules5: "5 total capsules",
        capsules15: "15 total capsules",
        capsules50: "50 total capsules",
        capsulesUnlimited: "Unlimited capsules",
        mobile: "Mobile capture (PWA share-target)",
        versioning: "Versioning",
        mcp: "MCP server access",
        attachments: "File attachments (R2)",
        imageCapture: "Image capture from chats",
        dynamicContext: "Dynamic context bundles",
        contextPacks: "Context packs",
        teams: "Create & join teams",
        graphs: "Similarity graphs",
        publicShare: "Share capsules publicly",
      },
      plans: {
        basic: { tagline: "Essential capsule management for casual users." },
        pro: { tagline: "Advanced features for solo power users." },
        premium: { tagline: "MCP, attachments, dynamic context — built for serious knowledge workers." },
        ultimate: { tagline: "Maximum collaboration and white-label." },
      },
      modal: {
        pendingTitle: "Confirming your payment…",
        pendingBody: "Hang tight — we're syncing with the payment processor. This usually takes a few seconds.",
        okBtn: "OK",
        successTitle: "You're upgraded 🎉",
        successBodyPrefix: "Welcome to ",
        successBodySuffix: ". Your subscription is active and the new limits apply right away. An invoice has been emailed to you.",
        gotIt: "Got it",
        cancelledTitle: "Subscription cancelled",
        cancelledBody: "Your plan won't renew. You keep access until the end of the current billing period.",
        errorTitle: "Something went wrong",
        close: "Close",
        refreshNow: "Refresh now",
        cancelTitle: "Cancel subscription?",
        cancelBody: "Recurring payments will stop. You'll keep your current plan until the end of the billing period, then drop to Basic.",
        keepPlan: "Keep plan",
        yesCancel: "Yes, cancel",
      },
    },
  },
};

const ja: Dict = {
  meta: {
    title: "dropdat — クロスAIメモリをワンクリックで",
    description:
      "AIとの会話をポータブルなカプセルとして保存。ChatGPT、Claude、Geminiにドロップして、会話を瞬時に再開。Claude Code、Cursor、Cline、Claude Desktop用のオープンソースMCPサーバー。",
    ogTitle: "dropdat — クロスAIメモリ：キャプチャ、カプセル化、どこへでもドロップ",
    ogDescription:
      "ChatGPT、Claude、Geminiの会話をワンクリックでキャプチャ。別のAIにカプセルをドロップして即座に再開。Claude Code、Cursor、Cline対応の無料MCPサーバー付き。",
  },
  nav: {
    howItWorks: "使い方",
    features: "機能",
    mcp: "MCP",
    blog: "ブログ",
    platforms: "対応AI",
    console: "コンソール",
    addToChrome: "Chromeに追加",
  },
  hero: {
    badge: "新登場 · AI間を移動するカプセル",
    h1Line1: "クロスAIメモリを、",
    h1Line2: "ワンクリックで。",
    intro:
      "dropdatはAIとの会話をポータブルな",
    introCapsule: "カプセル",
    addToChrome: "Chromeに追加",
    seeHow: "使い方を見る",
    bullet1: "個人利用は無料",
    bullet2: "ローカルファースト保存",
  },
  howItWorks: {
    eyebrow: "使い方",
    h2: "一度キャプチャ。どこへでもドロップ。瞬時に再開。",
    s1Title: "カプセルをクリック",
    s1Body:
      "対応するAIチャットにカプセルアイコンが表示されます。ワンクリックで会話全体（メッセージ、コードブロック、添付ファイル）をキャプチャ。",
    s2Title: "カプセルとして保存",
    s2Body:
      "dropdatはチャットを圧縮してポータブルなカプセルにし、ローカルライブラリに保存。タグ付け、要約、検索が可能。",
    s3Title: "任意のAIにドロップ",
    s3Body:
      "ChatGPT、Claude、Gemini、Perplexity を開いて、カプセルをドロップすれば、会話の続きを再開できます。",
  },
  features: {
    eyebrow: "機能",
    h2: "実際のAI利用に合わせて設計。",
    sub: "すべての機能は、クロスAIワークフローの摩擦を取り除くために存在します。",
    f1Title: "クロスAIメモリ",
    f1Body: "1つのカプセル形式が主要なすべてのチャットAIで動作。ベンダーロックインなし、コピペ税なし。",
    f2Title: "ブラウザ拡張機能",
    f2Body: "軽量なChrome拡張機能が chatgpt.com、claude.ai などにカプセルボタンを注入します。",
    f3Title: "カプセルライブラリ",
    f3Body: "キャプチャしたすべての会話を検索可能な1つのライブラリに。タグ付け、要約、整理 — もう会話を失いません。",
    f4Title: "瞬時に再開",
    f4Body: "新しいチャットにカプセルをドロップすれば、文脈、コード、参照情報がそのまま続きから始まります。",
    f5Title: "ローカルファースト",
    f5Body: "カプセルはデフォルトでブラウザに保存。デバイス間の同期はオプション — エンドツーエンド暗号化。",
    f6Title: "オープン形式",
    f6Body: "カプセルは単純なJSON。エクスポート、バージョン管理、チームメイトと共有 — あなたのデータはあなたのもの。",
  },
  platforms: {
    eyebrow: "対応AI",
    h2: "あなたの会話があるすべての場所で動作。",
    foot: "毎月新しいプラットフォームを追加 — リクエストは",
    footLink: "GitHub",
  },
  agent: {
    h2Pre: "あなたのAIにも",
    h2Brand: "dropdat を。",
    cta: "ドキュメントを読む",
  },
  cta: {
    h2: "今日、最初のカプセルをドロップしよう。",
    sub: "無料のChrome拡張機能。アカウント不要で開始可能。セットアップは1分以内。",
    addToChrome: "Chromeに追加",
    seeAction: "実際の動作を見る",
  },
  footer: {
    tagline: "クロスAIメモリをワンクリックで。キャプチャ、カプセル、ドロップ。",
    productCol: "プロダクト",
    mcpCol: "MCPクライアント",
    useCol: "ユースケース",
    legalCol: "法務",
    rights: "All rights reserved.",
    builtFor: "ポストステートレス時代のために。",
    productLinks: {
      howItWorks: "使い方",
      features: "機能",
      mcp: "MCPサーバー",
      blog: "ブログ",
      faq: "FAQ",
      download: "ダウンロード",
    },
    useLinks: {
      crossAi: "クロスAIメモリ",
      coding: "コーディングエージェントメモリ",
      support: "サポート",
      contact: "お問い合わせ",
    },
    legalLinks: { privacy: "プライバシー", terms: "利用規約" },
    language: "言語",
  },
  console: {
    sidebar: {
      library: "ライブラリ",
      graph: "グラフ",
      links: "リンク",
      packs: "パック",
      teams: "チーム",
      apiKeys: "APIキー",
      billing: "請求",
      help: "ヘルプ",
      settings: "設定",
      admin: "管理",
      closeMenu: "メニューを閉じる",
      themeLight: "ライトに切り替え",
      themeDark: "ダークに切り替え",
    },
    profile: {
      openMenu: "プロフィールメニューを開く",
      account: "アカウント",
      plan: "プラン",
      usage: "使用量",
      status: "ステータス",
      invoicesNote: "請求書と領収書は自動的にメールで送信されます。",
      plansBilling: "プランと請求",
      cancelPlan: "プランをキャンセル",
      settings: "設定",
      signOut: "サインアウト",
      language: "言語",
      capsulesUnlimited: "カプセル（無制限）",
      requestFeature: "機能をリクエスト",
      featureSubject: "機能リクエスト",
    },
    help: {
      pageTitle: "ヘルプと機能",
      pageSub: "dropdatのすべての機能を一覧に — 何ができるか、使い方、対応プラン。下のセクションへジャンプ。",
      contents: "目次",
      stillStuck: "まだ困っていますか？",
      stillStuckBody: "より一般的な質問はパブリックFAQをご確認ください。サポートチケットも開けます。",
      publicFaq: "パブリックFAQ",
      support: "サポート",
      planLabels: {
        proAndAbove: "Pro以上",
        premiumAndAbove: "Premium以上",
        ultimateOnly: "Ultimateのみ",
      },
      sectionTitles: {
        library: "ライブラリ",
        capture: "キャプチャ（Chrome拡張機能）",
        drop: "別のAIにドロップ",
        versioning: "バージョン管理",
        mobile: "モバイルキャプチャ",
        links: "リンク",
        packs: "コンテキストパック",
        graphs: "類似度グラフ",
        teams: "チーム",
        share: "カプセルの公開共有",
        mcp: "MCPサーバー",
        "api-keys": "APIキー",
        billing: "請求とプラン",
      },
      sectionSummaries: {
        library: "キャプチャしたすべてのカプセルを、タイトルと内容で検索できます。",
        capture: "AIとの会話をワンクリックでカプセルに保存。",
        drop: "カプセルを任意のAIに貼り付けて会話を再開。",
        versioning: "カプセルをフォークまたは編集し、完全な系譜を保持。",
        mobile: "Androidではシェアシート、iOSではショートカットでスマホから保存。",
        links: "URLをカプセルと一緒に保存 — 同じライブラリ、別の形式。",
        packs: "関連カプセルを1つのMarkdownブロックにまとめる。",
        graphs: "カプセルとパックの関連性を可視化。",
        teams: "小規模グループでカプセルライブラリを共有。",
        share: "1つのカプセルに対して読み取り専用の公開リンクを生成。",
        mcp: "MCP対応エージェント（Claude Code、Cursor、Cline、Claude Desktop）からカプセルを呼び出し。",
        "api-keys": "プランに応じたスコープのプログラム的アクセストークン。",
        billing: "サブスクリプションとプランごとの制限を管理。",
      },
    },
    billing: {
      pageTitle: "請求",
      pageSub: "あなたの働き方に合うプランを選択。いつでもキャンセル・変更可能。",
      currentPlan: "現在のプラン",
      refresh: "更新",
      syncing: "同期中…",
      cancelling: "キャンセル中…",
      cancelPlan: "プランをキャンセル",
      tier: "ティア",
      status: "ステータス",
      usage: "使用量",
      capsulesUsed: "カプセル使用",
      capsulesOf: "/",
      unlimited: "無制限",
      billingLabel: "請求",
      monthly: "月額",
      annual: "年額",
      mostPopular: "人気No.1",
      currentPlanBadge: "現在のプラン",
      upgradeTo: "アップグレード：",
      subscribe: "サブスクライブ",
      redirecting: "リダイレクト中…",
      contactSales: "営業へお問い合わせ",
      enterpriseName: "Enterprise",
      enterpriseTagline: "カスタムカプセル制限、ホワイトラベル、オンプレミス、専任サポート、SLA。",
      inactive: "非アクティブ",
      featureLabels: {
        capsules5: "カプセル5個まで",
        capsules15: "カプセル15個まで",
        capsules50: "カプセル50個まで",
        capsulesUnlimited: "無制限カプセル",
        mobile: "モバイルキャプチャ（PWAシェアターゲット）",
        versioning: "バージョン管理",
        mcp: "MCPサーバーアクセス",
        attachments: "ファイル添付（R2）",
        imageCapture: "チャットからの画像キャプチャ",
        dynamicContext: "ダイナミックコンテキストバンドル",
        contextPacks: "コンテキストパック",
        teams: "チーム作成・参加",
        graphs: "類似度グラフ",
        publicShare: "カプセルの公開共有",
      },
      plans: {
        basic: { tagline: "カジュアルユーザー向けの必須カプセル管理。" },
        pro: { tagline: "個人パワーユーザー向けの高度な機能。" },
        premium: { tagline: "MCP、添付、ダイナミックコンテキスト — 本格的なナレッジワーカー向け。" },
        ultimate: { tagline: "最大限のコラボレーションとホワイトラベル。" },
      },
      modal: {
        pendingTitle: "支払いを確認中…",
        pendingBody: "少々お待ちください — 決済プロセッサーと同期中です。通常数秒かかります。",
        okBtn: "OK",
        successTitle: "アップグレード完了 🎉",
        successBodyPrefix: "ようこそ ",
        successBodySuffix: " へ。サブスクリプションはアクティブで、新しい制限がすぐに適用されます。請求書をメールでお送りしました。",
        gotIt: "了解",
        cancelledTitle: "サブスクリプションをキャンセルしました",
        cancelledBody: "プランは更新されません。現在の請求期間の終わりまでアクセスは継続します。",
        errorTitle: "問題が発生しました",
        close: "閉じる",
        refreshNow: "今すぐ更新",
        cancelTitle: "サブスクリプションをキャンセルしますか？",
        cancelBody: "定期支払いは停止します。請求期間終了までは現在のプランを保持し、その後Basicに移行します。",
        keepPlan: "プランを維持",
        yesCancel: "はい、キャンセル",
      },
    },
  },
};

const de: Dict = {
  meta: {
    title: "dropdat — KI-übergreifendes Gedächtnis mit einem Klick",
    description:
      "Erfasse jeden KI-Chat als portable Capsule. Lege sie in ChatGPT, Claude, Gemini ab und setze das Gespräch sofort fort. Open-Source-MCP-Server für Claude Code, Cursor, Cline, Claude Desktop.",
    ogTitle: "dropdat — KI-übergreifendes Gedächtnis: erfassen, kapseln, überall ablegen",
    ogDescription:
      "Erfasse jeden ChatGPT-, Claude- oder Gemini-Chat mit einem Klick. Lege die Capsule in einer anderen KI ab und setze sofort fort. Kostenloser MCP-Server für Claude Code, Cursor, Cline.",
  },
  nav: {
    howItWorks: "So funktioniert's",
    features: "Funktionen",
    mcp: "MCP",
    blog: "Blog",
    platforms: "Unterstützte KIs",
    console: "Konsole",
    addToChrome: "Zu Chrome hinzufügen",
  },
  hero: {
    badge: "Neu · Die Capsule, die zwischen KIs reist",
    h1Line1: "KI-übergreifendes",
    h1Line2: "Gedächtnis, in einem Klick.",
    intro:
      "dropdat ist eine Browser-Erweiterung, die jede KI-Unterhaltung als portable",
    introCapsule: "Capsule",
    addToChrome: "Zu Chrome hinzufügen",
    seeHow: "So funktioniert's",
    bullet1: "Kostenlos zur privaten Nutzung",
    bullet2: "Lokale Speicherung zuerst",
  },
  howItWorks: {
    eyebrow: "So funktioniert's",
    h2: "Einmal erfassen. Überall ablegen. Sofort fortsetzen.",
    s1Title: "Capsule anklicken",
    s1Body:
      "In jedem unterstützten KI-Chat erscheint ein Capsule-Symbol. Ein Klick erfasst die gesamte Unterhaltung — Nachrichten, Codeblöcke, Anhänge.",
    s2Title: "Als Capsule speichern",
    s2Body:
      "dropdat komprimiert den Chat zu einer portablen Capsule und speichert sie in deiner lokalen Bibliothek. Tagge, fasse zusammen, suche später.",
    s3Title: "In jede KI ablegen",
    s3Body:
      "Öffne ChatGPT, Claude, Gemini, Perplexity — lege die Capsule ab und setze das Gespräch nahtlos fort.",
  },
  features: {
    eyebrow: "Funktionen",
    h2: "Gebaut für deine echte KI-Nutzung.",
    sub: "Jede Funktion existiert, um einen Reibungspunkt in KI-übergreifenden Workflows zu beseitigen.",
    f1Title: "KI-übergreifendes Gedächtnis",
    f1Body: "Ein Capsule-Format funktioniert in jeder großen Chat-KI. Kein Vendor-Lock-in, keine Copy-Paste-Steuer.",
    f2Title: "Browser-Erweiterung",
    f2Body: "Schlanke Chrome-Erweiterung fügt einen Capsule-Button direkt in chatgpt.com, claude.ai und mehr ein.",
    f3Title: "Capsule-Bibliothek",
    f3Body: "Alle erfassten Chats in einer durchsuchbaren Bibliothek. Tag, fasse zusammen, organisiere — nie wieder einen Thread verlieren.",
    f4Title: "Sofortige Fortsetzung",
    f4Body: "Lege eine Capsule in einen neuen Chat und mache genau dort weiter, wo du aufgehört hast. Kontext, Code, Referenzen — alles da.",
    f5Title: "Lokal zuerst",
    f5Body: "Capsules liegen standardmäßig in deinem Browser. Synchronisiere nur, wenn du willst — Ende-zu-Ende verschlüsselt.",
    f6Title: "Offenes Format",
    f6Body: "Capsules sind reines JSON. Exportieren, versionieren, mit Teammates teilen — deine Daten, deine Regeln.",
  },
  platforms: {
    eyebrow: "Unterstützte KIs",
    h2: "Funktioniert überall, wo deine Gespräche stattfinden.",
    foot: "Jeden Monat neue Plattformen — wünsche dir eine auf",
    footLink: "GitHub",
  },
  agent: {
    h2Pre: "Deine KI braucht ihr",
    h2Brand: "dropdat.",
    cta: "Docs lesen",
  },
  cta: {
    h2: "Lege heute deine erste Capsule ab.",
    sub: "Kostenlose Chrome-Erweiterung. Kein Konto nötig. In unter einer Minute eingerichtet.",
    addToChrome: "Zu Chrome hinzufügen",
    seeAction: "In Aktion sehen",
  },
  footer: {
    tagline: "KI-übergreifendes Gedächtnis mit einem Klick. Erfassen, kapseln, ablegen.",
    productCol: "Produkt",
    mcpCol: "MCP-Clients",
    useCol: "Anwendungsfälle",
    legalCol: "Rechtliches",
    rights: "Alle Rechte vorbehalten.",
    builtFor: "Für die post-stateless Ära gebaut.",
    productLinks: {
      howItWorks: "So funktioniert's",
      features: "Funktionen",
      mcp: "MCP-Server",
      blog: "Blog",
      faq: "FAQ",
      download: "Herunterladen",
    },
    useLinks: {
      crossAi: "KI-übergreifendes Gedächtnis",
      coding: "Coding-Agent-Gedächtnis",
      support: "Support",
      contact: "Kontakt",
    },
    legalLinks: { privacy: "Datenschutz", terms: "AGB" },
    language: "Sprache",
  },
  console: {
    sidebar: {
      library: "Bibliothek",
      graph: "Graph",
      links: "Links",
      packs: "Packs",
      teams: "Teams",
      apiKeys: "API-Schlüssel",
      billing: "Abrechnung",
      help: "Hilfe",
      settings: "Einstellungen",
      admin: "Admin",
      closeMenu: "Menü schließen",
      themeLight: "Zum Hellmodus wechseln",
      themeDark: "Zum Dunkelmodus wechseln",
    },
    profile: {
      openMenu: "Profilmenü öffnen",
      account: "Konto",
      plan: "Plan",
      usage: "Nutzung",
      status: "Status",
      invoicesNote: "Rechnungen und Belege werden automatisch per E-Mail versendet.",
      plansBilling: "Pläne & Abrechnung",
      cancelPlan: "Plan kündigen",
      settings: "Einstellungen",
      signOut: "Abmelden",
      language: "Sprache",
      capsulesUnlimited: "Capsules (unbegrenzt)",
      requestFeature: "Funktion anfragen",
      featureSubject: "Funktionsanfrage",
    },
    help: {
      pageTitle: "Hilfe & Funktionen",
      pageSub: "Jede dropdat-Funktion auf einen Blick — was sie macht, wie man sie nutzt und zu welchem Plan sie gehört. Springe zu einem Abschnitt unten.",
      contents: "Inhalt",
      stillStuck: "Brauchst du Hilfe?",
      stillStuckBody: "Schau in das öffentliche FAQ für allgemeine Fragen oder öffne ein Support-Ticket.",
      publicFaq: "Öffentliches FAQ",
      support: "Support",
      planLabels: {
        proAndAbove: "Pro und höher",
        premiumAndAbove: "Premium und höher",
        ultimateOnly: "Nur Ultimate",
      },
      sectionTitles: {
        library: "Bibliothek",
        capture: "Erfassen (Chrome-Erweiterung)",
        drop: "In eine andere KI einfügen",
        versioning: "Versionierung",
        mobile: "Mobile Erfassung",
        links: "Links",
        packs: "Kontext-Packs",
        graphs: "Ähnlichkeitsgraphen",
        teams: "Teams",
        share: "Öffentliche Capsule-Freigabe",
        mcp: "MCP-Server",
        "api-keys": "API-Schlüssel",
        billing: "Abrechnung & Pläne",
      },
      sectionSummaries: {
        library: "Jede erfasste Capsule, durchsuchbar nach Titel und Inhalt.",
        capture: "Speichere jeden KI-Chat mit einem Klick als Capsule.",
        drop: "Füge eine Capsule in eine beliebige KI ein, um das Gespräch dort fortzusetzen.",
        versioning: "Forke oder bearbeite eine Capsule und behalte die vollständige Abstammung.",
        mobile: "Speichere alles vom Telefon — Share-Sheet auf Android, Shortcut auf iOS.",
        links: "Verwahre URLs neben deinen Capsules — gleiche Bibliothek, andere Form.",
        packs: "Bündle verwandte Capsules in einen einfügbaren Markdown-Block.",
        graphs: "Visualisiere, wie deine Capsules und Packs zusammenhängen.",
        teams: "Teile eine Capsule-Bibliothek mit einer kleinen Gruppe.",
        share: "Generiere einen schreibgeschützten öffentlichen Link für eine einzelne Capsule.",
        mcp: "Rufe Capsules von jedem MCP-fähigen Agenten ab (Claude Code, Cursor, Cline, Claude Desktop).",
        "api-keys": "Programmatische Zugriffstoken mit Scopes gemäß deinem Plan.",
        billing: "Verwalte dein Abonnement und die Limits pro Stufe.",
      },
    },
    billing: {
      pageTitle: "Abrechnung",
      pageSub: "Wähle den Plan, der zu deiner Arbeitsweise passt. Jederzeit kündbar oder änderbar.",
      currentPlan: "Aktueller Plan",
      refresh: "Aktualisieren",
      syncing: "Synchronisiere…",
      cancelling: "Kündige…",
      cancelPlan: "Plan kündigen",
      tier: "Stufe",
      status: "Status",
      usage: "Nutzung",
      capsulesUsed: "Capsules genutzt",
      capsulesOf: "von",
      unlimited: "unbegrenzt",
      billingLabel: "Abrechnung",
      monthly: "Monatlich",
      annual: "Jährlich",
      mostPopular: "Am beliebtesten",
      currentPlanBadge: "Aktueller Plan",
      upgradeTo: "Upgrade auf",
      subscribe: "Abonnieren",
      redirecting: "Weiterleitung…",
      contactSales: "Vertrieb kontaktieren",
      enterpriseName: "Enterprise",
      enterpriseTagline: "Individuelle Capsule-Limits, White-Labeling, On-Premise, dedizierter Support, SLA.",
      inactive: "inaktiv",
      featureLabels: {
        capsules5: "5 Capsules insgesamt",
        capsules15: "15 Capsules insgesamt",
        capsules50: "50 Capsules insgesamt",
        capsulesUnlimited: "Unbegrenzte Capsules",
        mobile: "Mobile Erfassung (PWA Share-Target)",
        versioning: "Versionierung",
        mcp: "MCP-Server-Zugang",
        attachments: "Dateianhänge (R2)",
        imageCapture: "Bilderfassung aus Chats",
        dynamicContext: "Dynamische Kontext-Bündel",
        contextPacks: "Kontext-Packs",
        teams: "Teams erstellen & beitreten",
        graphs: "Ähnlichkeitsgraphen",
        publicShare: "Capsules öffentlich teilen",
      },
      plans: {
        basic: { tagline: "Wesentliche Capsule-Verwaltung für Gelegenheitsnutzer." },
        pro: { tagline: "Erweiterte Funktionen für Solo-Power-User." },
        premium: { tagline: "MCP, Anhänge, dynamischer Kontext — für ernsthafte Knowledge-Worker." },
        ultimate: { tagline: "Maximale Zusammenarbeit und White-Label." },
      },
      modal: {
        pendingTitle: "Bestätige deine Zahlung…",
        pendingBody: "Einen Moment — wir synchronisieren mit dem Zahlungsdienstleister. Das dauert üblicherweise ein paar Sekunden.",
        okBtn: "OK",
        successTitle: "Upgrade erfolgreich 🎉",
        successBodyPrefix: "Willkommen bei ",
        successBodySuffix: ". Dein Abonnement ist aktiv und die neuen Limits gelten sofort. Eine Rechnung wurde dir per E-Mail gesendet.",
        gotIt: "Verstanden",
        cancelledTitle: "Abonnement gekündigt",
        cancelledBody: "Dein Plan wird nicht verlängert. Du behältst Zugriff bis zum Ende des aktuellen Abrechnungszeitraums.",
        errorTitle: "Etwas ist schiefgelaufen",
        close: "Schließen",
        refreshNow: "Jetzt aktualisieren",
        cancelTitle: "Abonnement kündigen?",
        cancelBody: "Wiederkehrende Zahlungen werden gestoppt. Du behältst deinen Plan bis zum Ende des Abrechnungszeitraums und wechselst dann zu Basic.",
        keepPlan: "Plan behalten",
        yesCancel: "Ja, kündigen",
      },
    },
  },
};

const fr: Dict = {
  meta: {
    title: "dropdat — Mémoire inter-IA en un clic",
    description:
      "Capturez n'importe quelle conversation IA sous forme de capsule portable. Déposez-la dans ChatGPT, Claude, Gemini et reprenez la conversation instantanément. Serveur MCP open-source pour Claude Code, Cursor, Cline, Claude Desktop.",
    ogTitle: "dropdat — Mémoire inter-IA : capturez, encapsulez, déposez partout",
    ogDescription:
      "Capture en un clic de n'importe quelle conversation ChatGPT, Claude ou Gemini. Déposez la capsule dans une autre IA et reprenez instantanément. Serveur MCP gratuit pour Claude Code, Cursor, Cline.",
  },
  nav: {
    howItWorks: "Fonctionnement",
    features: "Fonctionnalités",
    mcp: "MCP",
    blog: "Blog",
    platforms: "IA prises en charge",
    console: "Console",
    addToChrome: "Ajouter à Chrome",
  },
  hero: {
    badge: "Nouveau · La capsule qui voyage entre les IA",
    h1Line1: "Mémoire inter-IA,",
    h1Line2: "en un seul clic.",
    intro:
      "dropdat est une extension de navigateur qui capture toute conversation IA sous forme de",
    introCapsule: "capsule",
    addToChrome: "Ajouter à Chrome",
    seeHow: "Voir comment ça marche",
    bullet1: "Gratuit pour usage personnel",
    bullet2: "Stockage local d'abord",
  },
  howItWorks: {
    eyebrow: "Fonctionnement",
    h2: "Capturez une fois. Déposez partout. Reprenez instantanément.",
    s1Title: "Cliquez sur la capsule",
    s1Body:
      "Une icône capsule apparaît dans chaque chat IA pris en charge. Un clic capture toute la conversation — messages, blocs de code, pièces jointes.",
    s2Title: "Enregistrez comme capsule",
    s2Body:
      "dropdat compresse le chat en capsule portable et le stocke dans votre bibliothèque locale. Étiquetez, résumez, recherchez plus tard.",
    s3Title: "Déposez dans n'importe quelle IA",
    s3Body:
      "Ouvrez ChatGPT, Claude, Gemini, Perplexity — déposez la capsule et reprenez la conversation là où vous l'aviez laissée.",
  },
  features: {
    eyebrow: "Fonctionnalités",
    h2: "Conçu pour votre vraie utilisation des IA.",
    sub: "Chaque fonctionnalité existe pour éliminer un point de friction dans les workflows inter-IA.",
    f1Title: "Mémoire inter-IA",
    f1Body: "Un format de capsule fonctionne dans toutes les grandes IA de chat. Pas de verrouillage fournisseur, pas de taxe copier-coller.",
    f2Title: "Extension navigateur",
    f2Body: "Extension Chrome légère qui injecte un bouton capsule directement dans chatgpt.com, claude.ai et plus.",
    f3Title: "Bibliothèque de capsules",
    f3Body: "Tous vos chats capturés dans une bibliothèque cherchable. Étiquetez, résumez, organisez — ne perdez plus un fil.",
    f4Title: "Reprise instantanée",
    f4Body: "Déposez une capsule dans un nouveau chat et reprenez exactement où vous en étiez. Contexte, code, références — tout y est.",
    f5Title: "Local d'abord",
    f5Body: "Les capsules vivent dans votre navigateur par défaut. Synchronisez seulement si vous voulez — chiffré de bout en bout.",
    f6Title: "Format ouvert",
    f6Body: "Les capsules sont du JSON pur. Exportez, versionnez, partagez avec un coéquipier — vos données, vos règles.",
  },
  platforms: {
    eyebrow: "IA prises en charge",
    h2: "Fonctionne partout où vivent vos conversations.",
    foot: "Plus de plateformes ajoutées chaque mois — demandez-en une sur",
    footLink: "GitHub",
  },
  agent: {
    h2Pre: "Votre IA a besoin de son",
    h2Brand: "dropdat.",
    cta: "Lire la doc",
  },
  cta: {
    h2: "Déposez votre première capsule aujourd'hui.",
    sub: "Extension Chrome gratuite. Pas de compte requis. Configuration en moins d'une minute.",
    addToChrome: "Ajouter à Chrome",
    seeAction: "Voir en action",
  },
  footer: {
    tagline: "Mémoire inter-IA en un clic. Capturez, encapsulez, déposez.",
    productCol: "Produit",
    mcpCol: "Clients MCP",
    useCol: "Cas d'usage",
    legalCol: "Légal",
    rights: "Tous droits réservés.",
    builtFor: "Conçu pour l'ère post-sans état.",
    productLinks: {
      howItWorks: "Fonctionnement",
      features: "Fonctionnalités",
      mcp: "Serveur MCP",
      blog: "Blog",
      faq: "FAQ",
      download: "Téléchargement",
    },
    useLinks: {
      crossAi: "Mémoire inter-IA",
      coding: "Mémoire d'agent de code",
      support: "Support",
      contact: "Contact",
    },
    legalLinks: { privacy: "Confidentialité", terms: "Conditions" },
    language: "Langue",
  },
  console: {
    sidebar: {
      library: "Bibliothèque",
      graph: "Graphe",
      links: "Liens",
      packs: "Packs",
      teams: "Équipes",
      apiKeys: "Clés API",
      billing: "Facturation",
      help: "Aide",
      settings: "Paramètres",
      admin: "Admin",
      closeMenu: "Fermer le menu",
      themeLight: "Passer au clair",
      themeDark: "Passer au sombre",
    },
    profile: {
      openMenu: "Ouvrir le menu profil",
      account: "Compte",
      plan: "Plan",
      usage: "Utilisation",
      status: "Statut",
      invoicesNote: "Les factures et reçus sont envoyés automatiquement par e-mail.",
      plansBilling: "Plans & facturation",
      cancelPlan: "Annuler le plan",
      settings: "Paramètres",
      signOut: "Déconnexion",
      language: "Langue",
      capsulesUnlimited: "capsules (illimité)",
      requestFeature: "Demander une fonctionnalité",
      featureSubject: "Demande de fonctionnalité",
    },
    help: {
      pageTitle: "Aide et fonctionnalités",
      pageSub: "Toutes les fonctionnalités dropdat en un seul endroit — ce qu'elles font, comment les utiliser et le plan auquel elles appartiennent. Sautez à une section ci-dessous.",
      contents: "Sommaire",
      stillStuck: "Toujours bloqué ?",
      stillStuckBody: "Consultez la FAQ publique pour des questions générales, ou ouvrez un ticket de support.",
      publicFaq: "FAQ publique",
      support: "Support",
      planLabels: {
        proAndAbove: "Pro et plus",
        premiumAndAbove: "Premium et plus",
        ultimateOnly: "Ultimate uniquement",
      },
      sectionTitles: {
        library: "Bibliothèque",
        capture: "Capture (extension Chrome)",
        drop: "Déposer dans une autre IA",
        versioning: "Versionnage",
        mobile: "Capture mobile",
        links: "Liens",
        packs: "Packs de contexte",
        graphs: "Graphes de similarité",
        teams: "Équipes",
        share: "Partage public de capsules",
        mcp: "Serveur MCP",
        "api-keys": "Clés API",
        billing: "Facturation et plans",
      },
      sectionSummaries: {
        library: "Toutes les capsules capturées, recherchables par titre et contenu.",
        capture: "Sauvegardez n'importe quelle conversation IA en capsule en un clic.",
        drop: "Collez une capsule dans n'importe quelle IA pour y reprendre la conversation.",
        versioning: "Forkez ou éditez une capsule en conservant toute la lignée.",
        mobile: "Sauvegardez depuis votre téléphone — share-sheet sur Android, Shortcut sur iOS.",
        links: "Stockez des URL aux côtés de vos capsules — même bibliothèque, format différent.",
        packs: "Regroupez des capsules liées en un bloc markdown prêt à coller.",
        graphs: "Visualisez les liens entre vos capsules et vos packs.",
        teams: "Partagez une bibliothèque de capsules avec un petit groupe.",
        share: "Générez un lien public en lecture seule pour une capsule.",
        mcp: "Rappellez des capsules depuis n'importe quel agent MCP (Claude Code, Cursor, Cline, Claude Desktop).",
        "api-keys": "Jetons d'accès programmatique scopés selon votre plan.",
        billing: "Gérez votre abonnement et les limites par palier.",
      },
    },
    billing: {
      pageTitle: "Facturation",
      pageSub: "Choisissez le plan qui correspond à votre façon de travailler. Annulez ou modifiez à tout moment.",
      currentPlan: "Plan actuel",
      refresh: "Rafraîchir",
      syncing: "Synchronisation…",
      cancelling: "Annulation…",
      cancelPlan: "Annuler le plan",
      tier: "Palier",
      status: "Statut",
      usage: "Utilisation",
      capsulesUsed: "capsules utilisées",
      capsulesOf: "sur",
      unlimited: "illimité",
      billingLabel: "Facturation",
      monthly: "Mensuel",
      annual: "Annuel",
      mostPopular: "Le plus populaire",
      currentPlanBadge: "Plan actuel",
      upgradeTo: "Passer à",
      subscribe: "S'abonner",
      redirecting: "Redirection…",
      contactSales: "Contacter les ventes",
      enterpriseName: "Enterprise",
      enterpriseTagline: "Limites de capsules personnalisées, white-label, on-premise, support dédié, SLA.",
      inactive: "inactif",
      featureLabels: {
        capsules5: "5 capsules au total",
        capsules15: "15 capsules au total",
        capsules50: "50 capsules au total",
        capsulesUnlimited: "Capsules illimitées",
        mobile: "Capture mobile (PWA share-target)",
        versioning: "Versionnage",
        mcp: "Accès au serveur MCP",
        attachments: "Pièces jointes (R2)",
        imageCapture: "Capture d'images depuis les chats",
        dynamicContext: "Bundles de contexte dynamique",
        contextPacks: "Packs de contexte",
        teams: "Créer et rejoindre des équipes",
        graphs: "Graphes de similarité",
        publicShare: "Partager les capsules publiquement",
      },
      plans: {
        basic: { tagline: "Gestion essentielle de capsules pour utilisateurs occasionnels." },
        pro: { tagline: "Fonctionnalités avancées pour power-users solo." },
        premium: { tagline: "MCP, pièces jointes, contexte dynamique — pour les knowledge workers sérieux." },
        ultimate: { tagline: "Collaboration maximale et white-label." },
      },
      modal: {
        pendingTitle: "Confirmation de votre paiement…",
        pendingBody: "Patience — nous synchronisons avec le processeur de paiement. Cela prend généralement quelques secondes.",
        okBtn: "OK",
        successTitle: "Mise à niveau effectuée 🎉",
        successBodyPrefix: "Bienvenue à ",
        successBodySuffix: ". Votre abonnement est actif et les nouvelles limites s'appliquent immédiatement. Une facture vous a été envoyée par e-mail.",
        gotIt: "Compris",
        cancelledTitle: "Abonnement annulé",
        cancelledBody: "Votre plan ne sera pas renouvelé. Vous conservez l'accès jusqu'à la fin de la période de facturation actuelle.",
        errorTitle: "Une erreur est survenue",
        close: "Fermer",
        refreshNow: "Rafraîchir maintenant",
        cancelTitle: "Annuler l'abonnement ?",
        cancelBody: "Les paiements récurrents s'arrêteront. Vous conservez votre plan jusqu'à la fin de la période de facturation, puis vous repassez à Basic.",
        keepPlan: "Garder le plan",
        yesCancel: "Oui, annuler",
      },
    },
  },
};

const es: Dict = {
  meta: {
    title: "dropdat — Memoria entre IAs en un clic",
    description:
      "Captura cualquier chat de IA como una cápsula portable. Suéltala en ChatGPT, Claude, Gemini y reanuda la conversación al instante. Servidor MCP de código abierto para Claude Code, Cursor, Cline, Claude Desktop.",
    ogTitle: "dropdat — Memoria entre IAs: captura, encapsula, suelta donde sea",
    ogDescription:
      "Captura en un clic cualquier chat de ChatGPT, Claude o Gemini. Suelta la cápsula en otra IA y reanuda al instante. Servidor MCP gratuito para Claude Code, Cursor, Cline.",
  },
  nav: {
    howItWorks: "Cómo funciona",
    features: "Funciones",
    mcp: "MCP",
    blog: "Blog",
    platforms: "IAs compatibles",
    console: "Consola",
    addToChrome: "Añadir a Chrome",
  },
  hero: {
    badge: "Nuevo · La cápsula que viaja entre IAs",
    h1Line1: "Memoria entre IAs,",
    h1Line2: "en un solo clic.",
    intro:
      "dropdat es una extensión de navegador que captura cualquier conversación de IA como una",
    introCapsule: "cápsula",
    addToChrome: "Añadir a Chrome",
    seeHow: "Ver cómo funciona",
    bullet1: "Gratis para uso personal",
    bullet2: "Almacenamiento local primero",
  },
  howItWorks: {
    eyebrow: "Cómo funciona",
    h2: "Captura una vez. Suelta donde sea. Reanuda al instante.",
    s1Title: "Haz clic en la cápsula",
    s1Body:
      "Aparece un icono de cápsula en cada chat de IA compatible. Un clic captura toda la conversación — mensajes, bloques de código, adjuntos.",
    s2Title: "Guarda como cápsula",
    s2Body:
      "dropdat comprime el chat en una cápsula portable y la guarda en tu biblioteca local. Etiqueta, resume, busca después.",
    s3Title: "Suéltala en cualquier IA",
    s3Body:
      "Abre ChatGPT, Claude, Gemini, Perplexity — suelta la cápsula y retoma la conversación justo donde la dejaste.",
  },
  features: {
    eyebrow: "Funciones",
    h2: "Hecho para cómo usas la IA de verdad.",
    sub: "Cada función existe para eliminar un punto de fricción en flujos entre IAs.",
    f1Title: "Memoria entre IAs",
    f1Body: "Un formato de cápsula funciona en todas las grandes IAs de chat. Sin lock-in del proveedor, sin impuesto copiar-pegar.",
    f2Title: "Extensión de navegador",
    f2Body: "Extensión ligera de Chrome que inyecta un botón de cápsula dentro de chatgpt.com, claude.ai y más.",
    f3Title: "Biblioteca de cápsulas",
    f3Body: "Todos tus chats capturados en una biblioteca buscable. Etiqueta, resume, organiza — nunca pierdas un hilo.",
    f4Title: "Reanudación instantánea",
    f4Body: "Suelta una cápsula en un chat nuevo y sigue exactamente donde lo dejaste. Contexto, código, referencias — todo está.",
    f5Title: "Local primero",
    f5Body: "Las cápsulas viven en tu navegador por defecto. Sincroniza solo si quieres — cifrado de extremo a extremo.",
    f6Title: "Formato abierto",
    f6Body: "Las cápsulas son JSON puro. Exporta, versiona, comparte con un compañero — tus datos, tus reglas.",
  },
  platforms: {
    eyebrow: "IAs compatibles",
    h2: "Funciona donde sea que vivan tus conversaciones.",
    foot: "Más plataformas añadidas cada mes — solicita una en",
    footLink: "GitHub",
  },
  agent: {
    h2Pre: "Tu IA necesita su",
    h2Brand: "dropdat.",
    cta: "Leer la documentación",
  },
  cta: {
    h2: "Suelta tu primera cápsula hoy.",
    sub: "Extensión gratis de Chrome. Sin cuenta para empezar. Configurada en menos de un minuto.",
    addToChrome: "Añadir a Chrome",
    seeAction: "Verla en acción",
  },
  footer: {
    tagline: "Memoria entre IAs en un clic. Captura, encapsula, suelta.",
    productCol: "Producto",
    mcpCol: "Clientes MCP",
    useCol: "Casos de uso",
    legalCol: "Legal",
    rights: "Todos los derechos reservados.",
    builtFor: "Construido para la era post-stateless.",
    productLinks: {
      howItWorks: "Cómo funciona",
      features: "Funciones",
      mcp: "Servidor MCP",
      blog: "Blog",
      faq: "FAQ",
      download: "Descarga",
    },
    useLinks: {
      crossAi: "Memoria entre IAs",
      coding: "Memoria de agente de código",
      support: "Soporte",
      contact: "Contacto",
    },
    legalLinks: { privacy: "Privacidad", terms: "Términos" },
    language: "Idioma",
  },
  console: {
    sidebar: {
      library: "Biblioteca",
      graph: "Gráfico",
      links: "Enlaces",
      packs: "Packs",
      teams: "Equipos",
      apiKeys: "Claves API",
      billing: "Facturación",
      help: "Ayuda",
      settings: "Ajustes",
      admin: "Admin",
      closeMenu: "Cerrar menú",
      themeLight: "Cambiar a claro",
      themeDark: "Cambiar a oscuro",
    },
    profile: {
      openMenu: "Abrir menú de perfil",
      account: "Cuenta",
      plan: "Plan",
      usage: "Uso",
      status: "Estado",
      invoicesNote: "Las facturas y recibos se envían automáticamente por correo.",
      plansBilling: "Planes y facturación",
      cancelPlan: "Cancelar plan",
      settings: "Ajustes",
      signOut: "Cerrar sesión",
      language: "Idioma",
      capsulesUnlimited: "cápsulas (ilimitado)",
      requestFeature: "Solicitar función",
      featureSubject: "Solicitud de función",
    },
    help: {
      pageTitle: "Ayuda y funciones",
      pageSub: "Todas las funciones de dropdat en un solo lugar — qué hacen, cómo usarlas y en qué plan están. Salta a cualquier sección abajo.",
      contents: "Contenido",
      stillStuck: "¿Sigues atascado?",
      stillStuckBody: "Consulta la FAQ pública para preguntas generales, o abre un ticket de soporte.",
      publicFaq: "FAQ pública",
      support: "Soporte",
      planLabels: {
        proAndAbove: "Pro y superior",
        premiumAndAbove: "Premium y superior",
        ultimateOnly: "Solo Ultimate",
      },
      sectionTitles: {
        library: "Biblioteca",
        capture: "Captura (extensión Chrome)",
        drop: "Soltar en otra IA",
        versioning: "Versionado",
        mobile: "Captura móvil",
        links: "Enlaces",
        packs: "Packs de contexto",
        graphs: "Gráficos de similitud",
        teams: "Equipos",
        share: "Compartir cápsulas públicamente",
        mcp: "Servidor MCP",
        "api-keys": "Claves API",
        billing: "Facturación y planes",
      },
      sectionSummaries: {
        library: "Cada cápsula capturada, buscable por título y contenido.",
        capture: "Guarda cualquier chat de IA como cápsula con un clic.",
        drop: "Pega una cápsula en cualquier IA para retomar la conversación allí.",
        versioning: "Bifurca o edita una cápsula y mantén el linaje completo.",
        mobile: "Guarda desde el móvil — share-sheet en Android, Shortcut en iOS.",
        links: "Guarda URLs junto a tus cápsulas — misma biblioteca, distinta forma.",
        packs: "Agrupa cápsulas relacionadas en un bloque markdown listo para pegar.",
        graphs: "Visualiza cómo se relacionan tus cápsulas y packs.",
        teams: "Comparte una biblioteca de cápsulas con un grupo pequeño.",
        share: "Genera un enlace público de solo lectura para una cápsula.",
        mcp: "Recupera cápsulas desde cualquier agente compatible con MCP (Claude Code, Cursor, Cline, Claude Desktop).",
        "api-keys": "Tokens de acceso programático con scopes según tu plan.",
        billing: "Gestiona tu suscripción y los límites por nivel.",
      },
    },
    billing: {
      pageTitle: "Facturación",
      pageSub: "Elige el plan que se ajusta a tu forma de trabajar. Cancela o cambia cuando quieras.",
      currentPlan: "Plan actual",
      refresh: "Actualizar",
      syncing: "Sincronizando…",
      cancelling: "Cancelando…",
      cancelPlan: "Cancelar plan",
      tier: "Nivel",
      status: "Estado",
      usage: "Uso",
      capsulesUsed: "cápsulas usadas",
      capsulesOf: "de",
      unlimited: "ilimitado",
      billingLabel: "Facturación",
      monthly: "Mensual",
      annual: "Anual",
      mostPopular: "Más popular",
      currentPlanBadge: "Plan actual",
      upgradeTo: "Pasar a",
      subscribe: "Suscribirse",
      redirecting: "Redirigiendo…",
      contactSales: "Contactar ventas",
      enterpriseName: "Enterprise",
      enterpriseTagline: "Límites de cápsulas personalizados, white-label, on-premise, soporte dedicado, SLA.",
      inactive: "inactivo",
      featureLabels: {
        capsules5: "5 cápsulas en total",
        capsules15: "15 cápsulas en total",
        capsules50: "50 cápsulas en total",
        capsulesUnlimited: "Cápsulas ilimitadas",
        mobile: "Captura móvil (PWA share-target)",
        versioning: "Versionado",
        mcp: "Acceso al servidor MCP",
        attachments: "Adjuntos (R2)",
        imageCapture: "Captura de imágenes desde chats",
        dynamicContext: "Bundles de contexto dinámico",
        contextPacks: "Packs de contexto",
        teams: "Crear y unirse a equipos",
        graphs: "Gráficos de similitud",
        publicShare: "Compartir cápsulas públicamente",
      },
      plans: {
        basic: { tagline: "Gestión esencial de cápsulas para usuarios casuales." },
        pro: { tagline: "Funciones avanzadas para power-users en solitario." },
        premium: { tagline: "MCP, adjuntos, contexto dinámico — para knowledge workers serios." },
        ultimate: { tagline: "Máxima colaboración y white-label." },
      },
      modal: {
        pendingTitle: "Confirmando tu pago…",
        pendingBody: "Un momento — estamos sincronizando con el procesador de pago. Normalmente tarda unos segundos.",
        okBtn: "OK",
        successTitle: "¡Subido de plan! 🎉",
        successBodyPrefix: "Bienvenido a ",
        successBodySuffix: ". Tu suscripción está activa y los nuevos límites se aplican al instante. Te hemos enviado la factura por correo.",
        gotIt: "Entendido",
        cancelledTitle: "Suscripción cancelada",
        cancelledBody: "Tu plan no se renovará. Mantienes el acceso hasta el final del periodo de facturación actual.",
        errorTitle: "Algo salió mal",
        close: "Cerrar",
        refreshNow: "Actualizar ahora",
        cancelTitle: "¿Cancelar suscripción?",
        cancelBody: "Los pagos recurrentes se detendrán. Mantienes tu plan hasta el final del periodo de facturación y luego pasas a Basic.",
        keepPlan: "Mantener plan",
        yesCancel: "Sí, cancelar",
      },
    },
  },
};

const DICTS: Record<Locale, Dict> = { en, ja, de, fr, es };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS.en;
}
