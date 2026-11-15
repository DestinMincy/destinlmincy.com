import type { Metadata } from "next";

const EFFECTIVE_DATE = "2026-11-15";
const CONTACT_EMAIL = "dlmincy@destinlmincy.com";

const processors = [
  {
    name: "Clerk",
    detail:
      "Sign-in, sessions, and account profile (email and name). Clerk Billing also holds the payment method and subscription state for hosting and maintenance plans. The app reads only whether a subscription is active.",
  },
  {
    name: "Stripe",
    detail:
      "Project invoices and payment links. Stripe processes the payment and receives the billing details you enter. Card numbers never reach this app.",
  },
  {
    name: "DocuSign",
    detail:
      "Contract signatures. DocuSign receives the signer name, signer email, and the contract PDF, and sends signing status back to the app.",
  },
  {
    name: "Amazon Web Services",
    detail:
      "Hosts the app database (PostgreSQL) and stores generated and signed contract PDFs in a private S3 bucket, encrypted at rest.",
  },
  {
    name: "Formspree",
    detail:
      "Delivers the public contact form. Formspree receives the name, email, and message you submit.",
  },
];

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Destin L Mincy Software and AI Agency collects, who processes it, and how to ask for access, correction, or deletion.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="eyebrow">Privacy</p>
          <h1>Privacy policy</h1>
          <p className="lead">
            I run this site and the client portal behind it as a one-operator
            agency in Maryville, Tennessee. This page lists what I collect, why
            I collect it, which services handle it, and how to ask me to change
            or remove it.
          </p>
          <p className="eyebrow">Last updated {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <div className="prose-block">
            <h2>What I collect</h2>
            <p>
              On the public site: nothing unless you send the contact form. The
              form collects your name, email, and message.
            </p>
            <p>
              In the client portal: your account email and name, kept by Clerk
              when you sign in. In my own database I keep client relationship
              records (business name, legal name, primary contact name, email,
              phone), the link between your Clerk account and your client
              record, projects, milestones, approvals (who approved and when),
              deliverable links, contract metadata, and payment gate records
              (amount, due date, status, and the Stripe invoice or payment-link
              URL and ID).
            </p>
            <p>
              Contracts: generated and signed contract PDFs, stored in a private
              Amazon S3 bucket and encrypted at rest.
            </p>
            <p>
              Billing: Clerk Billing stores the payment method and subscription
              state for hosting and maintenance plans. Stripe handles project
              invoices. I never see card numbers.
            </p>

            <h2>Where it comes from and why</h2>
            <p>
              Everything here comes from you or from the work you hire me for. You
              type it into the contact form, enter it when you create a portal
              account, or give it to me while I scope and run your project. I use
              it to reply to you, run your projects, collect approvals, issue
              and track invoices, get contracts signed, and keep the records a
              business has to keep.
            </p>
            <p>
              I do not sell your data. I share it only with the processors
              below so the service works, or when the law requires it.
            </p>

            <h2>Who processes it</h2>
            <ul className="check-list check-list--compact">
              {processors.map((processor) => (
                <li key={processor.name}>
                  <span>
                    <strong>{processor.name}.</strong> {processor.detail}
                  </span>
                </li>
              ))}
            </ul>

            <h2>Cookies and local storage</h2>
            <p>
              Clerk sets authentication cookies so you can sign in and stay
              signed in. The site stores your light or dark theme choice in your
              browser&apos;s localStorage. There are no advertising or analytics
              trackers on the site as of the date above.
            </p>

            <h2>How long I keep it</h2>
            <p>
              Account and relationship records stay for the life of the client
              relationship and as long as tax and contract rules require. Signed
              contracts and payment records are kept for seven years. Contact
              form messages stay until I have answered them and no longer need
              them.
            </p>

            <h2>Your choices</h2>
            <p>
              You can ask to see the data I hold about you, correct it, or have
              it deleted. Email me at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the
              address on your account and say what you want done. I will confirm
              it is you before acting.
            </p>
            <p>
              Deletion has one limit: signed contracts and payment records stay
              for the legal retention period above, even after the rest of your
              account is removed.
            </p>
            <p>
              This service is for businesses. It is not directed to anyone under
              18, and I do not knowingly collect data from them.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              This version took effect on {EFFECTIVE_DATE}. If I change how data
              is handled, I will update this page and the date at the top.
              Tennessee law governs this policy.
            </p>

            <h2>Contact</h2>
            <p>
              Destin L Mincy Software and AI Agency
              <br />
              Maryville, Tennessee, USA
              <br />
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
