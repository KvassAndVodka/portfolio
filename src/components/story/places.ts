import type { StoryPlace } from "./StoryJourney";

// Chronological: study, internship, current role, back to USTP to teach.
export const places: StoryPlace[] = [
  {
    id: "ustp-study",
    name: "University of Science and Technology of Southern Philippines",
    short: "Studied",
    area: "Cagayan de Oro",
    coordinates: [124.6566, 8.4855],
    period: "2022 - 2026",
    role: "BS Computer Science, Magna Cum Laude",
    organization: "University of Science and Technology of Southern Philippines",
    detail:
      "Graduated under a DOST-SEI JLSS scholarship and received the department's Alan Turing Award as one of its outstanding students. Helped found the Computer Science Student Society as Vice President — Internal, shaping how a brand-new organization ran day to day.",
    url: "https://www.ustp.edu.ph/",
  },
  {
    id: "meldcx",
    name: "meldCX PH",
    short: "Interned",
    area: "Uptown, Cagayan de Oro",
    coordinates: [124.621206, 8.4418157],
    period: "2025",
    role: "ML/AI Intern",
    organization: "meldCX",
    detail:
      "Turned a 30-day internship into a working real-time license plate recognition pipeline: learned AI from first principles, trained and benchmarked YOLO and PaddleOCR models, then optimized and containerized the whole thing with OpenVINO and Docker.",
    url: "https://www.meldcx.com/",
  },
  {
    id: "house",
    name: "2nd Congressional District Office of Misamis Oriental - House of Representatives",
    pinLabel: "House of Representatives",
    short: "Developing",
    area: "Tagoloan, Misamis Oriental",
    coordinates: [124.7526363, 8.5333436],
    period: "2026 - Present",
    role: "Software Developer",
    organization: "2nd Congressional District Office of Misamis Oriental - House of Representatives",
    detail:
      "Got the original [eMap](https://emap.padayn.com/) handed to me a month shy of graduation and went straight to work: organizing project data from the House and DPWH, then improving and hardening the system as I learned it.",
    current: true,
  },
  {
    id: "ustp-teaching",
    name: "University of Science and Technology of Southern Philippines",
    short: "Teaching",
    area: "Cagayan de Oro",
    coordinates: [124.6566, 8.4855],
    period: "2026 - Present",
    role: "Part-time Faculty",
    organization: "USTP Cagayan de Oro · Department of Computer Science",
    detail: "Teaching Fundamentals of Database Systems alongside full-time software development work.",
    url: "https://www.ustp.edu.ph/cdeo/citc/cs-dept/",
    current: true,
  },
];
