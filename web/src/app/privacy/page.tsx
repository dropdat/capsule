import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — dropdat",
  description:
    "How the dropdat extension reads, stores, and syncs your AI chat data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="May 8, 2026">
      <p>
        dropdat (&ldquo;we&rdquo;, &ldquo;the extension&rdquo;) helps you
        capture AI chat conversations from supported sites and reuse that
        context across other chats. This policy explains what the extension
        reads, what it stores, and where data goes.
      </p>

      <h2>What we read</h2>
      <p>
        When you click the dropdat capsule button on a supported chat site
        (ChatGPT / OpenAI, Claude, Gemini, Grok, Microsoft Copilot,
        Perplexity), the extension reads the visible messages from the active
        conversation in order to build a &ldquo;capsule.&rdquo; Reading
        happens <strong>only when you click Generate</strong>. We do not read
        pages passively, and we do not read pages outside the supported chat
        hosts listed in the extension manifest.
      </p>

      <h2>What we store</h2>
      <p>Each capsule contains:</p>
      <ul>
        <li>A title (extracted from the page).</li>
        <li>The user/assistant message text from that conversation.</li>
        <li>The source host (e.g., <code>chatgpt</code>, <code>claude</code>).</li>
        <li>The page URL.</li>
        <li>Timestamps and a local id.</li>
      </ul>
      <p>
        Capsules are written to the browser&rsquo;s local IndexedDB inside the
        extension&rsquo;s own origin. Nothing is sent anywhere unless you
        sign in.
      </p>

      <h2>What we sync (optional, account-only)</h2>
      <p>
        If you sign in via Clerk, capsules are uploaded to your dropdat
        account on our backend so that you can access them from the web
        dashboard. The backend stores capsules under your authenticated
        user id. You can delete capsules from the dashboard at any time.
      </p>
      <p>
        If you do not sign in, <strong>no data leaves your browser</strong>.
      </p>

      <h2>Cookies and authentication</h2>
      <p>
        The extension uses Chrome&rsquo;s <code>cookies</code> permission
        solely to read your Clerk session cookie from{" "}
        <code>*.clerk.accounts.dev</code> so that the popup can authenticate
        to the dropdat backend on your behalf. We do not read cookies from
        any other origin and we do not transmit cookies to any third party.
      </p>

      <h2>Third parties</h2>
      <ul>
        <li>
          <strong>Clerk</strong> is used for authentication. Clerk&rsquo;s own
          policy governs how it handles your account email and session. See{" "}
          <a href="https://clerk.com/legal/privacy" target="_blank" rel="noreferrer">
            clerk.com/legal/privacy
          </a>.
        </li>
        <li>
          <strong>The dropdat backend</strong> stores your capsules under
          your account.
        </li>
        <li>
          We do not use analytics, advertising trackers, or external
          telemetry.
        </li>
      </ul>

      <h2>Permissions, briefly</h2>
      <ul>
        <li>
          <code>storage</code>, <code>activeTab</code>, <code>scripting</code>{" "}
          — needed to mount the capsule button inside chat composers and
          persist capsules locally.
        </li>
        <li>
          <code>cookies</code> — Clerk session cookie only.
        </li>
        <li>
          Host permissions — limited to the specific chat sites we support
          and Clerk domains.
        </li>
      </ul>

      <h2>Data deletion</h2>
      <ul>
        <li>
          <strong>Local:</strong> open the extension popup and remove
          individual capsules, or clear the extension&rsquo;s site data via
          Chrome&rsquo;s extension management UI.
        </li>
        <li>
          <strong>Synced:</strong> delete from the dashboard, or contact us
          via the support email below.
        </li>
      </ul>

      <h2>Changes</h2>
      <p>
        If this policy changes materially, the &ldquo;Last updated&rdquo;
        date will change and we will note the change on this page.
      </p>

      <h2>Contact</h2>
      <p>
        Email:{" "}
        <a href="mailto:support@dropdat.app">support@dropdat.app</a>
      </p>
    </LegalLayout>
  );
}
