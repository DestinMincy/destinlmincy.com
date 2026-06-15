import Link from "next/link";

import { HexAtmosphere } from "@/components/HexAtmosphere";
import { HexMark } from "@/components/HexMark";
import { site } from "@/lib/site";

const proofPoints = [
  "Twenty years of production engineering",
  "One builder from discovery through launch",
  "AI agents shaped around a real workflow",
];

const problems = [
  {
    title: "Repeat tasks keep stealing the day",
    body: "Guest messages, lead qualification, support replies, invoice follow-up. Same decisions, different timestamp. An agent can run that playbook.",
  },
  {
    title: "A full-time hire is too much",
    body: "Some work is important but not large enough to justify another salary. A narrow agent can cover the task without adding headcount.",
  },
  {
    title: "Off-the-shelf tools almost fit",
    body: "Almost-fit software creates manual cleanup. Custom software and agents should match the way the business actually runs.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <HexAtmosphere />
        <div className="container hero-section__inner">
          <div className="hero-section__copy">
            <p className="eyebrow">AI agents and software</p>
            <h1>Software that handles the work your team keeps repeating.</h1>
            <p className="lead">
              I build narrow AI agents and custom software for small businesses:
              practical systems that take over specific tasks, run in production,
              and fit the way the operation already works.
            </p>
            <div className="button-row">
              <Link className="button button--primary" href="/contact">
                Talk to me
              </Link>
              <Link className="button button--secondary" href="/work">
                See the work
              </Link>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Agency proof points">
            <HexMark size="lg" />
            <p className="hero-panel__kicker">Based in Maryville, Tennessee</p>
            <ul>
              {proofPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Where this fits</p>
            <h2>The work piles up because the process is real.</h2>
          </div>
          <div className="feature-grid">
            {problems.map((problem) => (
              <article className="feature-card" key={problem.title}>
                <HexMark size="sm" />
                <h3>{problem.title}</h3>
                <p>{problem.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--split">
        <div className="container split-panel">
          <div>
            <p className="eyebrow">Featured agent</p>
            <h2>ELATUM: AI guest support for Smokies rentals.</h2>
            <p>
              ELATUM handles guest support for short-term rental operators:
              property answers, local recommendations, booking context, and
              operational follow-up.
            </p>
          </div>
          <div className="split-panel__actions">
            <a className="button button--secondary" href={site.links.elatum}>
              Visit ELATUM
            </a>
            <a className="button button--secondary" href={site.links.elatumDemo}>
              Try the demo
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-panel">
          <div>
            <p className="eyebrow">Next step</p>
            <h2>Bring the task. I will tell you whether an agent fits.</h2>
          </div>
          <Link className="button button--primary" href="/contact">
            Start the conversation
          </Link>
        </div>
      </section>
    </>
  );
}
