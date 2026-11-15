import type { Metadata } from "next";

const lastUpdated = "2026-11-15";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms of service for the destinlmincy.com website and client portal.",
};

export default function TermsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="eyebrow">Terms</p>
          <h1>Terms of service</h1>
          <p className="lead">
            These are the rules for using my website and the client portal. I
            run Destin L Mincy Software and AI Agency as one person in
            Maryville, Tennessee, so this is written the way I would say it to
            you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <div className="prose-block">
            <p>Last updated: {lastUpdated}</p>

            <h2>What these terms cover</h2>
            <p>
              These terms apply to destinlmincy.com, including the public
              pages, the blog, and the authenticated client portal. The portal
              shows a client its contracts and signature status, project
              milestones and approvals, deliverable links, payment records, and
              subscription status. By using the site or the portal, you agree to
              these terms.
            </p>

            <h2>The signed contract comes first</h2>
            <p>
              Every engagement runs on a separately signed written contract,
              signed through DocuSign. That contract sets the scope, schedule,
              fees, and ownership for the work. These terms only govern use of
              the website and the portal. If anything here conflicts with a
              signed contract, the signed contract controls for that
              engagement.
            </p>

            <h2>Your account</h2>
            <p>
              I create portal accounts for people at a client business. More
              than one person from the same client can have access to the same
              client relationship. Each person is responsible for keeping their
              sign-in secure and for anything done under their account. If you
              think your sign-in has been compromised, tell me right away.
            </p>
            <p>
              I can remove access when a relationship ends or when the client
              asks me to.
            </p>

            <h2>Approvals and records</h2>
            <p>
              Milestone approvals and change requests made in the portal are
              recorded with the identity of the person who made them and a
              timestamp. The client agrees that these records are an accurate
              record of its decisions.
            </p>

            <h2>Payments and refunds</h2>
            <p>
              How and when you pay depends on the type of engagement.
            </p>
            <ul className="check-list check-list--compact">
              <li>
                Project fees are invoiced through Stripe per the signed
                contract. That usually means a deposit before work starts and
                the balance at agreed milestones. Some projects are paid in full
                upfront.
              </li>
              <li>
                Hosting and maintenance subscriptions are billed through Clerk
                Billing on a recurring basis. Cancelling stops the next renewal.
                Access continues through the end of the paid period unless the
                contract says otherwise.
              </li>
            </ul>
            <p>
              Deposits are non-refundable once work has begun. Any other refund
              is governed by the signed contract for that engagement. If you
              have a dispute about a charge, email me first so I can look into
              it.
            </p>

            <h2>Intellectual property</h2>
            <p>
              Ownership of deliverables is set by each signed contract. The site
              content, blog posts, and the agency brand belong to me. Your data
              stays yours.
            </p>

            <h2>Acceptable use</h2>
            <p>
              Do not try to access another client&apos;s data. Do not interfere
              with the service. Do not use the site or the portal for anything
              unlawful.
            </p>

            <h2>Service availability and liability</h2>
            <p>
              The portal is provided as is. I do not promise any level of uptime
              beyond what a signed contract states. To the extent the law
              allows, my liability for your use of the website and the portal
              is limited to the amount you paid me in the twelve months before
              the claim. This does not limit anything a signed contract covers.
            </p>

            <h2>Changes to these terms</h2>
            <p>
              I may change these terms. The current version is the one posted
              here, with the date shown above. If you keep using the site or
              the portal after a change, you accept the new version.
            </p>

            <h2>Governing law</h2>
            <p>
              These terms are governed by the laws of the State of Tennessee,
              USA. Any dispute will be handled in Blount County, Tennessee.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms go to{" "}
              <a href="mailto:dlmincy@destinlmincy.com">
                dlmincy@destinlmincy.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
