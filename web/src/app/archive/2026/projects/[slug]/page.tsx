import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[116px] border-b border-border p-5 sm:p-6 lg:border-b-0 lg:border-r last:border-r-0">
      <dt className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-[15px] font-medium leading-6 text-foreground">{children}</dd>
    </div>
  );
}

export async function ProjectPage({
  params,
  locale = DEFAULT_LOCALE,
}: {
  params: Promise<Params>;
  locale?: Locale;
}) {
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
    <>
      <Nav locale={locale} />
      <main className="relative z-[2] min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <article className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 font-mono text-[12px] text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              dropdat
            </Link>
            <span aria-hidden>/</span>
            <span>archive</span>
            <span aria-hidden>/</span>
            <span className="text-foreground">2026</span>
          </nav>

          <header className="box-corners relative grid border border-border bg-card lg:grid-cols-[1.55fr_0.65fr]">
            <span className="corner-bl" />
            <span className="corner-br" />

            <div className="flex min-h-[390px] flex-col justify-between p-6 sm:p-10 lg:p-12">
              <div>
                <span className="inline-flex items-center gap-2 border border-border bg-accent-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  2026 internship archive
                </span>

                <p className="mt-12 text-[13px] text-muted-foreground">Contributor</p>
                <p className="mt-1 font-heading text-[22px] font-medium">{project.name}</p>
              </div>

              <h1 className="mt-10 max-w-[780px] font-heading text-[38px] font-medium leading-[1.05] tracking-[-0.045em] text-foreground sm:text-[50px] lg:text-[62px]">
                {project.title}
              </h1>
            </div>

            <div className="relative min-h-[250px] overflow-hidden border-t border-border bg-accent-soft p-7 lg:min-h-full lg:border-l lg:border-t-0">
              <div
                aria-hidden
                className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px]"
              />
              <div className="relative flex h-full min-h-[196px] flex-col justify-between border border-border bg-card/90 p-5">
                <div className="flex items-start justify-between gap-5">
                  <Image src="/brand/logo.svg" alt="" width={32} height={32} />
                  <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                    DD / 2026
                  </span>
                </div>
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="absolute h-3 w-3 animate-ping rounded-full bg-primary/25" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                      Verified record
                    </span>
                  </div>
                  <p className="font-heading text-[20px] font-medium leading-tight">
                    Work that moved
                    <br />
                    the platform forward.
                  </p>
                </div>
              </div>
            </div>
          </header>

          <dl className="box-corners relative mt-10 grid border border-border bg-card sm:grid-cols-2 lg:grid-cols-4">
            <span className="corner-bl" />
            <span className="corner-br" />
            <Field label="Mentor">Arman Singh</Field>
            <Field label="Organization">dropdat</Field>
            <Field label="Technologies">{project.technologies}</Field>
            <Field label="Topics">{project.topics}</Field>
          </dl>

          <section className="mt-10 grid gap-10 border-t border-border pt-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                Project record
              </p>
              <h2 className="mt-3 font-heading text-[28px] font-medium tracking-[-0.025em]">
                Contribution,
                <br />
                documented.
              </h2>

              <dl className="mt-8 space-y-6 border-l-2 border-primary pl-5">
                <div>
                  <dt className="text-[12px] text-muted-foreground">Role</dt>
                  <dd className="mt-1 text-[14px] font-medium leading-5">{project.role}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-muted-foreground">Duration</dt>
                  <dd className="mt-1 text-[14px] font-medium">{project.duration}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-muted-foreground">Record issued</dt>
                  <dd className="mt-1 text-[14px] font-medium">{project.certificateDate}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-6 text-[15px] leading-[1.75] text-foreground/75 [&_strong]:font-semibold [&_strong]:text-foreground sm:text-[16px]">
              {project.summary}
              <div className="mt-10 border border-border bg-card p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <p className="font-heading text-[15px] font-medium text-foreground">
                  Need to verify this record?
                </p>
                <a
                  className="mt-2 inline-block font-mono text-[12px] text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary sm:mt-0"
                  href="mailto:support@dropdat.app"
                >
                  support@dropdat.app
                </a>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer locale={locale} />
    </>
  );
}

export default ProjectPage;
