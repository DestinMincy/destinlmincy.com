import Link from "next/link";

import { site } from "@/lib/site";

export const metadata = {
  title: "Work",
  description: "Featured agents and software builds from Destin L Mincy.",
};

/**
 * Renders the work portfolio page displaying featured agents and projects.
 */
export default function WorkPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="eyebrow">Work</p>
          <h1>Agents in the wild and on the bench.</h1>
          <p className="lead">
            The work page starts with the agent already in market and keeps the
            rest honest until more case studies ship.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container work-stack">
          <article className="work-item work-item--featured">
            <div>
              <p className="eyebrow">Featured agent</p>
              <h2>ELATUM</h2>
              <p>
                AI guest support for short-term rental operators in the Great
                Smoky Mountains. ELATUM handles property questions, local
                recommendations, and operational guest support.
              </p>
            </div>
            <dl className="meta-list">
              <div>
                <dt>Industry</dt>
                <dd>Short-term rentals</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Early access</dd>
              </div>
              <div>
                <dt>Site</dt>
                <dd>
                  <a href={site.links.elatum}>elatum.ai</a>
                </dd>
              </div>
              <div>
                <dt>Demo</dt>
                <dd>
                  <a href={site.links.elatumDemo}>demo.elatum.ai</a>
                </dd>
              </div>
            </dl>
          </article>

          <article className="work-item">
            <div>
              <p className="eyebrow">In development</p>
              <h2>The next agent</h2>
              <p>
                Currently in design. If you have an industry-specific task an
                agent should handle, this is the right time to start the
                conversation.
              </p>
            </div>
            <Link className="button button--secondary" href="/contact">
              Suggest the next agent
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
