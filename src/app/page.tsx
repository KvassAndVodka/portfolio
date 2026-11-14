import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import ProjectGallery from "@/components/ProjectGallery";
import ScrollReveal from "@/components/ScrollReveal";
import SiteFooter from "@/components/SiteFooter";
import CloudField from "@/components/story/CloudField";
import { places } from "@/components/story/places";
import StoryJourney from "@/components/story/StoryJourney";
import TechnologyStack from "@/components/TechnologyStack";
import { getProjects, toProjectPreview } from "@/lib/projects";
import { absoluteUrl, createPageMetadata, serializeJsonLd, siteConfig } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  ...createPageMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
  }),
  title: { absolute: siteConfig.title },
};

// Marks the home page as the profile of the site's Person (declared in the root layout).
const profileJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": absoluteUrl("/#profile"),
  url: absoluteUrl("/"),
  mainEntity: { "@id": absoluteUrl("/#person") },
  isPartOf: { "@id": absoluteUrl("/#website") },
};

export default async function Home() {
  const projects = (await getProjects()).map(toProjectPreview);
  // Featured on the home page: the pinned projects, or the three latest when none are pinned.
  const pinned = projects.filter((project) => project.isPinned);
  const featured = pinned.length > 0 ? pinned : projects.slice(0, 3);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileJsonLd) }} />
      <StoryJourney places={places} />

      <CloudField id="work" className="projects-stage">
        <ProjectGallery projects={featured} />
      </CloudField>

      <TechnologyStack />

      <section id="contact" className="contact-stage">
        <div className="site-shell">
          <ScrollReveal className="contact-copy" variant="clip">
            <p className="contact-kicker">Have a stubborn system?</p>
            <h2>Let&apos;s make it work.</h2>
            <p className="contact-intro">
              Send the essentials here. It goes directly to my inbox, and I usually reply within two working
              days. I only use your details to respond.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="slide" delay={100}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
