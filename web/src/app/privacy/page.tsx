import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — dropdat",
  description:
    "How the dropdat extension reads, stores, and syncs your AI chat data and saved links.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="May 10, 2026">
      <p>
        dropdat (&ldquo;we&rdquo;, &ldquo;the extension&rdquo;) helps you
        capture AI chat conversations from supported sites, reuse that
        context across other chats, and save individual web pages or links
        into folders for later reference. This policy explains what the
        extension reads, what it stores, and where data goes.
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
      <p>
        When you right-click on any web page and choose{" "}
        <code>dropdat &rarr; &lt;folder name&gt;</code>, or click{" "}
        <strong>Save tab</strong> in the extension popup, the extension reads
        only the URL and page title (and, where the browser provides it, the
        favicon URL) of the active tab. We do not read the page&rsquo;s
        content, DOM, cookies, or form fields when saving a link. The save
        only happens on that explicit user action.
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
      <p>Each saved link contains:</p>
      <ul>
        <li>The page URL and title at the moment you saved it.</li>
        <li>An optional favicon URL.</li>
        <li>The folder you chose (or your default folder if none).</li>
        <li>Timestamps and an id.</li>
      </ul>
      <p>
        Capsules are written first to the browser&rsquo;s local IndexedDB
        inside the extension&rsquo;s own origin. Saved links and folders are
        written directly to your dropdat account on our backend (they require
        you to be signed in via an API key). Your selected default folder
        and the API key itself live in <code>chrome.storage.local</code>.
      </p>

      <h2>Right-click menu &amp; notifications</h2>
      <p>
        The extension adds a single <code>dropdat</code> entry to the
        browser&rsquo;s right-click menu. The submenu lists your folder
        names so you can pick a destination in one gesture. After a
        successful save (or a failure such as &ldquo;sign in first&rdquo;)
        the extension shows a single OS notification as confirmation. We do
        not send unsolicited, marketing, or background notifications.
      </p>

      <h2>What we sync (account-only)</h2>
      <p>
        If you sign in to the extension by pasting an API key generated in
        the dropdat dashboard, capsules are uploaded to your dropdat
        account on our backend so you can access them from the web
        dashboard. The backend stores capsules, folders, and saved links
        under your authenticated user id. You can delete any of them from
        the dashboard at any time.
      </p>
      <p>
        Saved links and folders always live on the backend (they require an
        account to be useful). Capsules also work offline-first: if you do
        not sign in, capsules stay only in your browser.
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
          <code>storage</code>, <code>activeTab</code> — needed to mount
          the capsule button inside chat composers, read the active tab on
          user action, and persist capsules / API key / preferred folder
          locally.
        </li>
        <li>
          <code>contextMenus</code> — registers the right-click{" "}
          <code>dropdat</code> menu so you can save the current page or a
          right-clicked link into a folder.
        </li>
        <li>
          <code>notifications</code> — shows a single OS toast confirming
          a save (or surfacing a failure). No background or marketing
          notifications.
        </li>
        <li>
          <code>cookies</code> — Clerk session cookie only.
        </li>
        <li>
          Host permissions — limited to the supported chat sites, the
          dropdat backend (<code>dropdat.app</code>), and Clerk domains.
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
