import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Support — dropdat",
  description: "Help and contact for dropdat users.",
};

export default function SupportPage() {
  return (
    <LegalLayout title="Support" updated="May 8, 2026">
      <p>
        Need help with the dropdat extension or your dashboard account?
        Here&rsquo;s the fastest way to reach us.
      </p>

      <h2>Email</h2>
      <p>
        <a href="mailto:support@dropdat.app">support@dropdat.app</a> — we
        reply within two business days.
      </p>

      <h2>Common questions</h2>

      <h3>The capsule button doesn&rsquo;t appear on a supported site.</h3>
      <p>
        Reload the page after installing or updating the extension. If it
        still doesn&rsquo;t appear, the chat site may have shipped a layout
        change since we last verified. Email us with the URL and a
        screenshot.
      </p>

      <h3>My capsules aren&rsquo;t syncing.</h3>
      <p>
        Open the extension popup and confirm you&rsquo;re signed in. Click
        the <strong>Sync</strong> button to retry. If sync still fails,
        check that your network can reach <code>https://dropdat.app</code>{" "}
        and try again.
      </p>

      <h3>How do I delete my data?</h3>
      <p>
        Local capsules: open the popup and remove them, or use Chrome&rsquo;s
        extension management UI to clear site data. Synced capsules: delete
        them from the dashboard, or email us to request a full account
        deletion.
      </p>

      <h2>Privacy &amp; terms</h2>
      <p>
        See the <a href="/privacy">Privacy Policy</a> and{" "}
        <a href="/terms">Terms of Service</a>.
      </p>
    </LegalLayout>
  );
}
