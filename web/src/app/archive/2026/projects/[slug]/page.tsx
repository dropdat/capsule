import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Project = {
  name: string;
  title: string;
  role: string;
  duration: string;
  certificateDate: string;
  technologies: string;
  topics: string;
  summary: React.ReactNode;
};

const PROJECTS: Record<string, Project> = {
  deepanshus: {
    name: "Deepanshu Srivastava",
    title: "dropdat Browser Extension",
    role: "Software Development Intern (Full-time)",
    duration: "June 1, 2026 – July 31, 2026",
    certificateDate: "July 31, 2026",
    technologies: "TypeScript, React, WXT, Browser APIs",
    topics: "Browser Extensions, Product Engineering, Reliability",
    summary: (
      <>
        <p>
          Deepanshu joined dropdat as a Software Development Intern, beginning June 1,
          2026 and ending July 31, 2026. Based out of our Noida office, Sector 62, they
          worked closely with our engineering team, taking ownership of assigned tasks
          and consistently delivering high-quality work.
        </p>
        <p>
          For their project, Deepanshu worked on the{" "}
          <strong>dropdat Browser Extension</strong>—an extension of the dropdat
          platform. Their contributions to feature development, testing, and platform
          reliability were a valuable addition to the team.
        </p>
        <p>
          Deepanshu demonstrated strong technical ability, a collaborative attitude,
          and a genuine eagerness to learn. We wish them continued success in all
          future endeavours.
        </p>
      </>
    ),
  },
  rajveers: {
    name: "Rajveer Singh",
    title: "ChronoMem: Temporal Agent Memory",
    role: "AI/ML Engineering Intern — Agent Memory Systems",
    duration: "July 1, 2026 – August 31, 2026",
    certificateDate: "August 31, 2026",
    technologies: "Python, LLMs, Vector Databases, RAG",
    topics: "Agent Memory, Temporal Reasoning, Evaluation",
    summary: (
      <>
        <p>
          Rajveer joined dropdat as an AI/ML Engineering Intern—Agent Memory Systems,
          beginning July 1, 2026 and ending August 31, 2026. Based out of our Noida
          office, Sector 62, he worked closely with our engineering team, taking
          ownership of assigned tasks and consistently delivering high-quality work.
        </p>
        <p>
          For his project, Rajveer researched and developed <strong>ChronoMem</strong>,
          a temporally-aware memory layer for LLM agents. He designed a two-store memory
          architecture pairing a structured fact store with a vector store for episodic
          recall, and implemented LLM-based fact extraction, contradiction detection,
          and temporal validity tracking.
        </p>
        <p>
          Rajveer also built an evaluation harness benchmarking the system against a
          naive RAG baseline. He demonstrated strong technical ability, a collaborative
          attitude, and a genuine eagerness to learn. We wish him continued success in
          all future endeavours.
        </p>
      </>
    ),
  },
};

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return Object.keys(PROJECTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS[slug];
  if (!project) return {};

  const description = project.name + "'s 2026 internship project at dropdat: " + project.title + ".";
  return {
    title: project.name + " — 2026 Internship Project",
    description,
    alternates: { canonical: "/archive/2026/projects/" + slug },
    openGraph: {
      title: project.name + " — " + project.title,
      description,
      url: "https://dropdat.app/archive/2026/projects/" + slug,
      type: "article",
    },
  };
}

const particles = [
  [7, 14, 3], [16, 34, 2], [28, 9, 2], [39, 48, 4], [47, 18, 2],
  [57, 62, 3], [66, 28, 2], [76, 51, 4], [87, 17, 3], [94, 37, 2],
  [10, 73, 2], [24, 88, 4], [35, 69, 2], [49, 92, 3], [61, 79, 2],
  [72, 86, 3], [82, 68, 2], [91, 91, 4],
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-2 text-[13px] text-white/42">{label}</dt>
      <dd className="text-[15px] font-medium leading-6 text-white/90">{children}</dd>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = PROJECTS[slug];
  if (!project) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    contributor: { "@type": "Person", name: project.name },
    publisher: { "@type": "Organization", name: "dropdat", url: "https://dropdat.app" },
    datePublished: project.certificateDate,
    url: "https://dropdat.app/archive/2026/projects/" + slug,
  };

  return (
    <main data-archive className="relative z-10 min-h-screen overflow-hidden bg-[#0b0c0d] text-[#f2f2f0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
        {particles.map(([left, top, size], index) => (
          <span
            key={index}
            className="absolute rounded-full bg-[#f26822] shadow-[0_0_12px_rgba(242,104,34,0.35)]"
            style={{ left: left + "%", top: top + "%", width: size, height: size }}
          />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(242,104,34,0.045),transparent_60%)]"
      />

      <article className="relative mx-auto w-full max-w-[1080px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-[13px] text-white/52">
          <Link href="/" className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white">
            2026 Program
          </Link>
          <span className="text-white/25">|</span>
          <Link href="/" className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white">
            dropdat
          </Link>
        </nav>

        <header className="mb-9">
          <p className="mb-1 text-[13px] text-white/42">Contributor</p>
          <p className="text-[22px] font-medium tracking-[-0.01em] text-white">{project.name}</p>
          <h1 className="mt-8 max-w-[900px] font-mono text-[34px] font-medium leading-[1.12] tracking-[-0.035em] text-white sm:text-[45px] lg:text-[52px]">
            {project.title}
          </h1>
        </header>

        <div className="mb-10 h-px bg-white/10" />

        <dl className="mb-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Mentor">Arman Singh</Field>
          <Field label="Organization">dropdat</Field>
          <Field label="Technologies">{project.technologies}</Field>
          <Field label="Topics">{project.topics}</Field>
        </dl>

        <dl className="mb-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          <Field label="Role">{project.role}</Field>
          <Field label="Duration">{project.duration}</Field>
        </dl>

        <div className="max-w-[780px] space-y-5 text-[15px] leading-[1.72] text-white/55 [&_strong]:font-semibold [&_strong]:text-white/90 sm:text-[16px]">
          {project.summary}
        </div>

        <footer className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>Record issued {project.certificateDate}</span>
          <a className="transition-colors hover:text-white/70" href="mailto:support@dropdat.app">
            Verification inquiries · support@dropdat.app
          </a>
        </footer>
      </article>
    </main>
  );
}
