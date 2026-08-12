import type { Metadata } from "next";
import { SITE, STORE } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Prose } from "@/components/editorial/Prose";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Kids Moda handles your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div data-world="neutral">
      <PageHeader title="Privacy" crumb="Privacy" lede="What we collect, why, and what we never do with it." />
      <div className="km-shell km-section-tight">
        <Prose>
          <p className="km-hint">Last updated {new Date().getFullYear()}</p>

          <h2>What we collect</h2>
          <p>
            To deliver an order we need your name, mobile number and address.
            That is all. We do not ask for an email address, we do not require an
            account, and because every order is cash on delivery we never see or
            store card details.
          </p>

          <h2>What we do with it</h2>
          <p>
            We use it to pack your order, call you to confirm it, and get it to
            your door. Your phone number identifies you as a returning customer so
            we can look up a past order if you ask about an exchange.
          </p>

          <h2>What stays on your device</h2>
          <p>
            Your bag, your wishlist, your currency preference and the pieces you
            have recently looked at are kept in your own browser. They are not sent
            to us and they disappear if you clear your browser data.
          </p>

          <h2>Who else sees it</h2>
          <p>
            Only the delivery driver carrying your order, and only the details he
            needs to find you. We do not sell, rent or share your information with
            anyone else, and we do not send marketing messages unless you have
            asked for them.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Order records are kept for our accounts. Ask us to delete your details
            and we will, except where we are required to keep a record of a sale.
          </p>

          <h2>Asking us about your information</h2>
          <p>
            Message {STORE.phoneDisplay} or come into the shop in {STORE.district}.
            You can ask what we hold about you, correct it, or have it removed.
          </p>

          <h2>Cookies</h2>
          <p>
            {SITE.name} uses only what it needs to work: local storage for your bag
            and preferences. There is no advertising tracking on this site.
          </p>
        </Prose>
      </div>
    </div>
  );
}
