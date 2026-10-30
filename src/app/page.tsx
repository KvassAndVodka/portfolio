import type { Metadata } from "next";
import Link from "next/link";
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa6";

import ContactForm from "@/components/ContactForm";
import ProjectShowcase from "@/components/ProjectShowcase";
import ScrollReveal from "@/components/ScrollReveal";
import CloudField from "@/components/story/CloudField";
import { places } from "@/components/story/places";
import StoryJourney from "@/components/story/StoryJourney";
import TechnologyStack from "@/components/TechnologyStack";
import { getProjects, toProjectPreview } from "@/lib/projects";
import { createPageMetadata, siteConfig } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  ...createPageMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
  }),
  title: { absolute: siteConfig.title },
};

export default async function Home() {
  const projects = (await getProjects()).map(toProjectPreview);

  return (
    <div>
      <StoryJourney places={places} />

      <CloudField id="work" className="projects-stage">
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

          <ProjectShowcase compact featured initialProjects={projects} />
        </div>
      </CloudField>

      <TechnologyStack />

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
