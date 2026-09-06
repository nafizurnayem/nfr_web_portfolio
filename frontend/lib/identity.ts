// Single source of truth for who this portfolio belongs to.
// Everything else (header, footer, contact, resume, structured data, metadata)
// reads from here — add a social link once and it appears everywhere.

export const identity = {
  name: "Md Nafizur Nayem",
  title: "Computer Vision & Machine Learning Engineer",
  role: "AI/ML Engineer · Computer Vision · NLP & LLM",
  tagline:
    "I build computer-vision systems end to end — training CNNs, writing the OpenCV pipelines that feed them, and shipping them behind APIs that hold up in production. Alongside that: NLP and LLM applications, and robotics on ESP32 and Raspberry Pi.",
  shortBio:
    "CSE student at AIUB specialising in image processing and deep learning, with a track record of taking models from notebook to deployed service.",
  location: "Kuril, Dhaka, Bangladesh",
  email: "nfrnayem123@gmail.com",
  availability: "Available for internships, research collaborations & freelance",
  github: "https://github.com/nafizurnayem",
  linkedin: "https://www.linkedin.com/in/nafizur-nayem-38055b335/",
  twitter: "https://x.com/NafizurNayem",
  facebook: "https://www.facebook.com/nafizurnayeme/",
  spotify: "https://open.spotify.com/user/31v4sdaoy5ypxohu5zlo7hnh65rm",
  scholar: "https://scholar.google.com/citations?user=zH1VbbAAAAAJ&hl=en",
  researchgate: "https://www.researchgate.net/profile/Md-Nayem-9?ev=hdr_xprf",
  resumeUrl: "/resume.pdf",
  initials: "MN",
};

export type SocialKey =
  | "github"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "scholar"
  | "researchgate"
  | "spotify";

export const socialLinks: {
  label: string;
  href: string;
  key: SocialKey;
  /** Shown first in compact lists — the ones a recruiter actually opens. */
  primary?: boolean;
}[] = [
  { label: "GitHub", href: identity.github, key: "github", primary: true },
  { label: "LinkedIn", href: identity.linkedin, key: "linkedin", primary: true },
  { label: "Google Scholar", href: identity.scholar, key: "scholar", primary: true },
  { label: "ResearchGate", href: identity.researchgate, key: "researchgate" },
  { label: "X / Twitter", href: identity.twitter, key: "twitter" },
  { label: "Facebook", href: identity.facebook, key: "facebook" },
  { label: "Spotify", href: identity.spotify, key: "spotify" },
];

export const navLinks = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/demos", label: "demos" },
  { href: "/resume", label: "resume" },
  { href: "/contact", label: "contact" },
];
