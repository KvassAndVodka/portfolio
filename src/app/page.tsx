import Image from "next/image";
import Link from "next/link";
import {
  FaArrowUpRightFromSquare,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa6";

import ContactForm from "@/components/ContactForm";
import HeroBackground from "@/components/HeroBackground";
import ProjectShowcase from "@/components/ProjectShowcase";
import ScrollReveal from "@/components/ScrollReveal";
import TechnologyStack from "@/components/TechnologyStack";

export const revalidate = 60;

const proofPoints = [
  {
    label: "Right now",
    value: "Software Developer at the House of Representatives",
  },
  {
    label: "Class of 2026",
    value: "BS Computer Science, Magna Cum Laude and Alan Turing Award recipient",
  },
  {
    label: "After hours",
    value: "Run a self-hosted lab on Linux, Docker, Proxmox, and Tailscale",
  },
];

const experience = [
  {
    period: "2026 - Present",
    role: "Software Developer",
    organization: "House of Representatives of the Philippines",
    detail:
      "Developing internal management tools and GIS-based systems for public project planning and monitoring.",
    current: true,
    kind: "work",
  },
  {
    period: "2025",
    role: "ML/AI Intern",
    organization: "meldCX",
    detail:
      "Built and containerized a real-time license plate recognition pipeline with YOLO, PaddleOCR, and OpenVINO.",
    kind: "work",
  },
  {
    period: "2022 - 2026",
    role: "BS Computer Science, Magna Cum Laude",
    organization: "University of Science and Technology of Southern Philippines",
    detail:
      "Received the department's Alan Turing Award and completed the degree as a DOST-SEI JLSS scholar.",
    kind: "education",
  },
  {
    period: "2023 - 2024",
    role: "Vice President, Internal",
    organization: "Computer Science Student Society",
    detail:
      "Helped establish the organization, write its governance, and complete its annual work and financial plan.",
    kind: "work",
  },
];

export default function Home() {
  return (
    <div>
      <section className="home-hero">
        <HeroBackground />

        <div className="site-shell home-hero-layout">
          <div className="hero-copy">
            <p className="hero-kicker">
              Hi, I&apos;m <strong>Javier Raut.</strong>
            </p>
            <h1 className="display-title kinetic-title" aria-label="I build systems that hold up.">
              <span className="kinetic-line">
                <span>I build systems</span>
              </span>
              <span className="kinetic-line kinetic-line-accent">
                <span>that hold up.</span>
              </span>
            </h1>
            <p className="body-large hero-summary">
              I&apos;m a software developer based in the Philippines. I build public-sector tools,
              computer vision, and self-hosted infrastructure.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="/projects">
                Projects
              </Link>
              <a
                className="button-secondary"
                href="https://github.com/KvassAndVodka"
                rel="noreferrer"
                target="_blank"
              >
                <FaGithub aria-hidden="true" />
                GitHub
                <FaArrowUpRightFromSquare aria-hidden="true" className="button-external-icon" />
              </a>
            </div>
          </div>

          <div className="portrait-stage">
            <div className="hero-portrait">
              <Image
                src="/javier-raut-hero.png"
                alt="Javier Raut, backend and infrastructure engineer"
                fill
                priority
                sizes="(max-width: 767px) calc(100vw - 3rem), 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="proof-band" aria-label="Quick profile">
        <dl className="proof-strip site-shell">
          {proofPoints.map((point, index) => (
            <div key={point.label} style={{ "--proof-index": index } as React.CSSProperties}>
              <dt>{point.label}</dt>
              <dd>{point.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="work" className="projects-stage">
        <div className="site-shell">
          <ScrollReveal className="projects-heading" variant="clip">
            <h2 className="section-title section-title-wide">
              A few things <span>I&apos;ve built.</span>
            </h2>
            <p className="body-large">
              I like working on systems where reliability matters. These case studies show how I
              think, build, and ship.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="stagger">
            <ProjectShowcase compact featured />
          </ScrollReveal>
        </div>
      </section>

      <TechnologyStack />

      <section className="experience-stage">
        <div className="site-shell experience-composition">
          <ScrollReveal className="experience-intro" variant="slide">
            <h2 className="section-title">Where I&apos;ve done the work.</h2>
            <p className="body-large">
              My path runs through public-sector software, computer vision, student leadership,
              and plenty of self-hosted experimentation.
            </p>
          </ScrollReveal>

          <ScrollReveal className="experience-list" variant="stagger">
            {experience.map((item) => (
              <article
                className={`experience-item${item.current ? " experience-item-current" : ""}`}
                key={`${item.period}-${item.role}`}
              >
                <time>{item.period}</time>
                <div>
                  <h3>{item.role}</h3>
                  <p className="experience-organization">{item.organization}</p>
                  <p className="experience-detail">{item.detail}</p>
                </div>
              </article>
            ))}
          </ScrollReveal>
        </div>
      </section>

      <section id="contact" className="contact-stage">
        <div className="site-shell">
          <div className="contact-layout">
            <ScrollReveal className="contact-copy" variant="clip">
              <p className="contact-kicker">Have a stubborn system?</p>
              <h2>Let&apos;s make it work.</h2>
              <p className="contact-intro">
                Send the details here. The form delivers them directly to my inbox.
              </p>
              <a className="contact-email-link" href="mailto:javier.raut@gmail.com">
                <FaEnvelope aria-hidden="true" />
                javier.raut@gmail.com
              </a>
            </ScrollReveal>

            <ScrollReveal variant="slide" delay={100}>
              <ContactForm />
            </ScrollReveal>
          </div>

          <footer className="contact-footer">
            <p>© 2026 Javier Raut</p>
            <div>
              <a href="https://github.com/KvassAndVodka" rel="noreferrer" target="_blank">
                <FaGithub aria-hidden="true" />
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/raut-javier-m/" rel="noreferrer" target="_blank">
                <FaLinkedin aria-hidden="true" />
                LinkedIn
              </a>
              <Link href="/notes">Notes</Link>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
