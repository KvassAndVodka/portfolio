"use client";

import { m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { FaArrowUpRightFromSquare, FaGithub } from "react-icons/fa6";

import HeroBackground from "@/components/HeroBackground";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const processSteps = ["Understand", "Design", "Build", "Harden"];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.09,
    },
  },
};

const resolveVariants = {
  hidden: {
    opacity: 0,
    y: 26,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: easeOutExpo },
  },
};

const lineVariants = {
  hidden: { y: "112%", rotate: 1.4 },
  visible: {
    y: "0%",
    rotate: 0,
    transition: { duration: 0.78, ease: easeOutExpo },
  },
};

export default function AnimatedHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-hero">
      <HeroBackground />

      <m.div
        className="site-shell home-hero-layout"
        variants={containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <div className="hero-copy">
          <m.p className="hero-kicker" variants={resolveVariants}>
            Hi, I&apos;m <strong>Javier Raut</strong> — a software developer at the House of
            Representatives.
          </m.p>

          <h1 className="display-title kinetic-title" aria-label="I build systems that hold up.">
            <span className="kinetic-line">
              <m.span variants={lineVariants}>I build systems</m.span>
            </span>
            <span className="kinetic-line">
              <m.span variants={lineVariants}>
                that <em>hold up.</em>
              </m.span>
            </span>
          </h1>

          <m.p className="body-large hero-summary" variants={resolveVariants}>
            I work from theory to implementation, then keep going: code quality, security, and the
            uncomfortable edge cases that decide whether software holds up.
          </m.p>

          <m.div className="hero-process-shell" variants={resolveVariants}>
            <m.div
              aria-hidden="true"
              className="hero-process-line"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.72, ease: easeOutExpo }}
            />
            <ol className="hero-process" aria-label="My software process">
              {processSteps.map((step, index) => (
                <m.li
                  key={step}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.42,
                    delay: 0.7 + index * 0.11,
                    ease: easeOutExpo,
                  }}
                >
                  <m.span
                    aria-hidden="true"
                    className="hero-process-checkpoint"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.9, rotate: -35 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 28,
                      delay: reduceMotion ? 0 : 0.76 + index * 0.11,
                    }}
                  />
                  {step}
                </m.li>
              ))}
            </ol>
          </m.div>

          <m.div className="hero-actions" variants={resolveVariants}>
            <m.a
              className="button-primary"
              href="/projects"
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              View projects
            </m.a>
            <m.a
              className="button-secondary"
              href="https://github.com/KvassAndVodka"
              aria-label="Javier Raut on GitHub (opens in a new tab)"
              rel="noreferrer"
              target="_blank"
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <FaGithub aria-hidden="true" />
              GitHub
              <FaArrowUpRightFromSquare aria-hidden="true" className="button-external-icon" />
            </m.a>
          </m.div>
        </div>

        <m.div
          className="portrait-stage"
          variants={{
            hidden: { opacity: 0, x: 70, rotate: 1.2 },
            visible: {
              opacity: 1,
              x: 0,
              rotate: 0,
              transition: { duration: 0.86, delay: 0.22, ease: easeOutExpo },
            },
          }}
        >
          <m.div
            className="hero-portrait-shell"
            variants={{
              hidden: { clipPath: "inset(100% 0 0 0)" },
              visible: {
                clipPath: "inset(0% 0 0 0)",
                transition: { duration: 0.92, delay: 0.2, ease: easeOutExpo },
              },
            }}
          >
            <div className="hero-portrait">
              <Image
                src="/IMG_20260730_122436.jpg"
                alt="Portrait of Javier Raut"
                fill
                priority
                quality={90}
                sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1400px) 40vw, 32rem"
                className="object-cover"
              />
            </div>
          </m.div>
        </m.div>
      </m.div>
    </section>
  );
}
