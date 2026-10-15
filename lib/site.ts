export const site = {
  name: "Destin L Mincy",
  company: "Destin L Mincy Software and AI Agency",
  title: "Destin L Mincy | Software and AI Agency",
  description:
    "Custom AI agents and software for small businesses. Built by one senior operator in Maryville, Tennessee.",
  url: "https://destinlmincy.com",
  email: "dlmincy@destinlmincy.com",
  formspreeFormId: "mqenwlvv",
  links: {
    github: "https://github.com/DestinMincy",
    linkedin: "https://www.linkedin.com/in/destin-l-mincy",
    x: "https://x.com/dlmincy",
    elatum: "https://elatum.ai",
    elatumDemo: "https://demo.elatum.ai",
    calendly: "https://calendly.com/destin-mincy/15min",
  },
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Notes" },
  { href: "/contact", label: "Contact" },
] as const;

export const topicOptions = [
  { value: "agent-build", label: "A new AI agent build" },
  { value: "agent-ops", label: "Ongoing agent ops" },
  { value: "elatum", label: "ELATUM for my rental" },
  { value: "software-build", label: "Custom software or contract work" },
  { value: "partnership", label: "Partnership or referral" },
  { value: "other", label: "Something else" },
] as const;

export type TopicValue = (typeof topicOptions)[number]["value"];
