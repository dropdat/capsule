import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — dropdat",
  description: "The terms that govern use of dropdat.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="May 8, 2026">
      <p>
        These Terms govern your use of dropdat&rsquo;s browser extension and
        web dashboard (collectively, the &ldquo;Service&rdquo;). By installing
        the extension or signing in to the dashboard, you agree to these
        Terms. If you do not agree, do not use the Service.
      </p>

      <h2>The Service</h2>
      <p>
        dropdat captures the visible content of conversations on supported AI
        chat sites at your explicit request and lets you reuse that content
        across chats. The Service does not read or capture content
        automatically.
      </p>

      <h2>Your account and data</h2>
      <ul>
        <li>
          You are responsible for the accounts and credentials you use with
          the Service.
        </li>
        <li>
          You retain ownership of the content you capture into capsules. You
          grant us a limited license to store and transmit capsules on your
          behalf solely to operate the Service for you.
        </li>
        <li>
          You agree not to use the Service to capture or store content you
          do not have the right to use.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Do not use the Service to violate the terms of any chat site you
        capture from, to infringe intellectual property, to process unlawful
        content, or to attempt to compromise the Service or its
        infrastructure.
      </p>

      <h2>Third-party services</h2>
      <p>
        The Service interoperates with third-party AI chat sites and
        authentication providers. We are not responsible for the
        availability, content, or terms of those third parties.
      </p>

      <h2>No warranty</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranty of any
        kind, express or implied, including merchantability, fitness for a
        particular purpose, and non-infringement. We do not guarantee that
        the Service will be uninterrupted or error-free.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, dropdat will not be liable
        for indirect, incidental, special, consequential, or punitive
        damages, or for loss of profits, data, or goodwill arising from your
        use of the Service.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will
        update the &ldquo;Last updated&rdquo; date above. Continued use of
        the Service after a change constitutes acceptance of the updated
        Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Email:{" "}
        <a href="mailto:support@dropdat.app">support@dropdat.app</a>
      </p>
    </LegalLayout>
  );
}
