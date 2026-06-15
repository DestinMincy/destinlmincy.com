import { site } from "@/lib/site";

const fits = [
  "You run a small business and want an AI agent that does real work.",
  "You are a short-term rental operator looking at ELATUM.",
  "You have a software build that needs a senior pair of hands.",
];

export const metadata = {
  title: "Contact",
  description:
    "Get in touch about an AI agent build, ELATUM, custom software, or partnership work.",
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="eyebrow">Contact</p>
          <h1>Bring the task.</h1>
          <p className="lead">
            Tell me what you are trying to automate, ship, or fix. I read every
            message and reply within two business days.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-copy">
            <h2>Best fits</h2>
            <ul className="check-list">
              {fits.map((fit) => (
                <li key={fit}>{fit}</li>
              ))}
            </ul>

            <h2>Other ways to reach me</h2>
            <p>
              Email: <a href={`mailto:${site.email}`}>{site.email}</a>
              <br />
              ELATUM: <a href={site.links.elatum}>elatum.ai</a>
              <br />
              Demo: <a href={site.links.elatumDemo}>demo.elatum.ai</a>
              <br />
              Guided demo: <a href={site.links.calendly}>Book 15 minutes</a>
            </p>
          </div>

          <form
            className="contact-form"
            action={`https://formspree.io/f/${site.formspreeFormId}`}
            method="POST"
          >
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="topic">Topic</label>
              <select id="topic" name="topic" required defaultValue="">
                <option value="" disabled>
                  Select one
                </option>
                <option value="agent-build">A new AI agent build</option>
                <option value="elatum">ELATUM for my rental</option>
                <option value="software-build">Custom software or contract work</option>
                <option value="partnership">Partnership or referral</option>
                <option value="other">Something else</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={6} required />
            </div>
            <div className="field field--hidden" aria-hidden="true">
              <label htmlFor="company-fax">Leave this blank</label>
              <input id="company-fax" name="_gotcha" type="text" tabIndex={-1} />
            </div>
            <button className="button button--primary" type="submit">
              Send message
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
