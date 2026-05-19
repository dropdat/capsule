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
};

const DICTS: Record<Locale, Dict> = { en, ja, de, fr, es };

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS.en;
}
