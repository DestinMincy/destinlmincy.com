import Image from "next/image";
import Link from "next/link";

const workingRules = [
  "You talk to the person building the thing.",
  "Progress stays visible while the work is active.",
  "Plain language wins over theater.",
  "Bad fits get called early.",
];

export const metadata = {
  title: "About",
  description:
    "Founder and operator of Destin L Mincy Software and AI Agency in Maryville, Tennessee.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="eyebrow">About</p>
          <h1>Built here. Built right.</h1>
          <p className="lead">
            Destin L Mincy Software and AI Agency is a one-operator shop in
            Maryville, Tennessee, focused on AI agents and production software
            for small businesses.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container founder-layout">
          <figure className="founder-frame">
            <Image
              src="/img/destin-headshot.jpg"
              alt="Destin L Mincy"
              width={640}
              height={640}
              priority
            />
          </figure>

          <div className="prose-block">
            <p className="eyebrow">Destin L Mincy</p>
            <h2>One senior builder, from first call to production.</h2>
            <p>
              I have spent twenty years shipping production code across web
              apps, backends, data pipelines, internal tools, and AI
              integrations. The agency is where that experience gets pointed at
              small-business work that keeps repeating.
            </p>
            <p>
              The pattern is familiar: the business has a real workflow, the
              available tools almost fit, and the owner is stuck between manual
              effort and a bloated custom build. Narrow agents sit in that gap
              when the task is specific enough to run safely.
            </p>
            <p>
              The first product is <Link href="/work">ELATUM</Link>, AI guest
              support for short-term rental operators in the Smokies.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container narrow">
          <div className="section-heading">
            <p className="eyebrow">How I work</p>
            <h2>Small shop. Direct accountability.</h2>
          </div>
          <ul className="check-list">
            {workingRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
