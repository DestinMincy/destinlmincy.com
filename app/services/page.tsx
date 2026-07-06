import type { Metadata } from "next";
import Link from "next/link";

import type { TopicValue } from "@/lib/site";

const services: Array<{
  label: string;
  title: string;
  body: string;
  bullets: string[];
  topic: TopicValue;
  cta: string;
}> = [
  {
    label: "01",
    title: "Agent build",
    body: "A custom AI agent designed, built, deployed, and tuned against a specific workflow.",
    bullets: [
      "Discovery and workflow mapping",
      "Agent architecture for your stack and data",
      "Production deployment",
      "Post-launch tuning",
    ],
    topic: "agent-build",
    cta: "Start a build",
  },
  {
    label: "02",
    title: "Agent ops",
    body: "Ongoing operation for an agent already in production, whether I built it or you already have it.",
    bullets: [
      "Monitoring and edge-case handling",
      "Prompt and tool refinements",
      "Performance and cost review",
      "Direct access to the builder",
    ],
    topic: "agent-ops",
    cta: "Talk retainer",
  },
  {
    label: "03",
    title: "Custom software",
    body: "Full-stack builds when an agent is not the right tool. Internal apps, integrations, and data workflows.",
    bullets: [
      "One senior builder",
      "Production-grade code",
      "Documented handoff",
      "Scoped delivery",
    ],
    topic: "software-build",
    cta: "Scope a build",
  },
];

export const metadata: Metadata = {
  title: "Services",
  description:
    "Agent builds, agent operations, and custom software from Destin L Mincy Software and AI Agency.",
};

/**
 * Renders the Services landing page.
 *
 * @returns The Services page layout with hero section, service offerings, and fit check callout.
 */
export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="eyebrow">Services</p>
          <h1>Three ways to put an agent or a builder to work.</h1>
          <p className="lead">
            Every engagement starts with a short discovery conversation. If the
            fit is weak, I will say so early.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container service-list">
          {services.map((service) => (
            <article className="service-row" key={service.title}>
              <div className="service-row__marker">{service.label}</div>
              <div className="service-row__body">
                <h2>{service.title}</h2>
                <p>{service.body}</p>
                <ul className="check-list check-list--compact">
                  {service.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <Link
                className="button button--secondary"
                href={`/contact?topic=${service.topic}`}
              >
                {service.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <div className="container narrow">
          <div className="callout">
            <p className="eyebrow">Fit check</p>
            <h2>Not every problem needs an agent.</h2>
            <p>
              If the workflow is vague, the data is missing, or a simpler tool
              solves it, that is the answer. The build should earn its place.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
