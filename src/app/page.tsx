import Link from "next/link";
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa6";

import AnimatedHero from "@/components/AnimatedHero";
import AnimatedProofStrip from "@/components/AnimatedProofStrip";
import ContactForm from "@/components/ContactForm";
import ExperienceTimeline, { type ExperienceEntry } from "@/components/ExperienceTimeline";
import ProjectShowcase from "@/components/ProjectShowcase";
import ScrollReveal from "@/components/ScrollReveal";
import TechnologyStack from "@/components/TechnologyStack";

const proofPoints = [
  {
    label: "Current work",
    value: "Building dependable internal systems at the House of Representatives",
    href: "https://emap.padayn.com/",
  },
  {
    label: "Legislative transcription",
    value: "RT Transcript, built in one day for SONA, with budget plenary support planned",
    href: "https://github.com/KvassAndVodka/RT-Transcript",
  },
  {
    label: "Teaching next",
    value: "Fundamentals of Database Systems at USTP's Department of Computer Science",
  },
];

const experience: ExperienceEntry[] = [
  {
    period: "2026 - Present",
    role: "Software Developer",
    organization: "House of Representatives of the Philippines",
    detail:
      "Maintaining and hardening eMap, the House's infrastructure management and project-tracking system, with a focus on reliability, security, and code quality.",
    url: "https://emap.padayn.com/",
    current: true,
  },
  {
    period: "Upcoming",
    role: "Part-time Instructor",
    organization:
      "University of Science and Technology of Southern Philippines · Department of Computer Science",
    detail:
      "Joining the department to teach Fundamentals of Database Systems alongside full-time software development work.",
  },
  {
    period: "2025",
    role: "ML/AI Intern",
    organization: "meldCX",
    detail:
      "Built and containerized a real-time license plate recognition pipeline with YOLO, PaddleOCR, and OpenVINO.",
  },
  {
    period: "2022 - 2026",
    role: "BS Computer Science, Magna Cum Laude",
    organization: "University of Science and Technology of Southern Philippines",
    detail:
      "Received the department's Alan Turing Award and completed the degree as a national science and technology scholar.",
  },
  {
    period: "2023 - 2024",
    role: "Vice President, Internal",
    organization: "Computer Science Student Society",
    detail:
      "Helped establish the organization, write its governance, and complete its annual work and financial plan.",
  },
];

export default function Home() {
  return (
    <div>
      <AnimatedHero />
      <AnimatedProofStrip points={proofPoints} />

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

          <ProjectShowcase compact featured />
        </div>
      </section>

      <TechnologyStack />

      <section className="experience-stage">
        <div className="site-shell experience-composition">
          <ScrollReveal className="experience-intro" variant="slide">
            <h2 className="section-title">Where I&apos;ve done the work.</h2>
            <p className="body-large">
              My path runs through dependable production software, fast-turnaround tools,
              leadership, and personal systems I keep pushing after hours.
            </p>
          </ScrollReveal>

          <ExperienceTimeline entries={experience} />
        </div>
      </section>

      <section id="contact" className="contact-stage">
        <div className="site-shell">
          <div className="contact-layout">
            <ScrollReveal className="contact-copy" variant="clip">
              <p className="contact-kicker">Have a stubborn system?</p>
              <h2>Let&apos;s make it work.</h2>
              <p className="contact-intro">
                Send the essentials here. It goes directly to my inbox, and I usually reply within
                two working days. I only use your details to respond.
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
              <a
                href="https://github.com/KvassAndVodka"
                aria-label="GitHub (opens in a new tab)"
                rel="noreferrer"
                target="_blank"
              >
                <FaGithub aria-hidden="true" />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/raut-javier-m/"
                aria-label="LinkedIn (opens in a new tab)"
                rel="noreferrer"
                target="_blank"
              >
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
