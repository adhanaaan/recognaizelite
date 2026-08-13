import { useEffect } from "react";

const MAZE_API_KEY = "3a85791e-5210-49c9-8d29-bf3ff4f2becc";
const MAZE_LOADER = "https://snippet.maze.co/maze-universal-loader.js";

/** The public testing host. Everything else — including production — stays clean. */
const TESTING_HOST = "brainscantesting";

type MazeWindow = typeof window & { mazeUniversalSnippetApiKey?: string };

/**
 * Loads Maze (session recording + in-product prompts) on the public testing
 * domain only.
 *
 * Gated on the live hostname rather than an env var or a next.config flag so a
 * single build can serve both hosts. Build-time gating is specifically wrong
 * here: VERCEL_URL is the deployment URL, not the custom domain the visitor
 * actually typed, so it never matches brainscantesting.
 *
 * Called from _app rather than LiteShell because the /lite-one funnel routes
 * through pages that don't render LiteShell — quiz.tsx, and the shared
 * symbol-matching game screens. Instrumenting the app covers the whole journey;
 * the hostname gate is what keeps it scoped to testing traffic.
 *
 * This is Maze's snippet rewritten as an effect, with two deliberate omissions.
 * The snippet's `document.currentScript` nonce lookup is meaningless once React
 * owns injection — there's no inline script tag to inherit a CSP nonce from. And
 * the loader is appended once per page load rather than once per mount:
 * `mazeUniversalSnippetApiKey`, which the snippet sets anyway, doubles as the
 * idempotency flag so client-side navigation across the funnel doesn't stack
 * duplicate loaders.
 */
export function useMazeTesting() {
  useEffect(() => {
    if (!window.location.hostname.includes(TESTING_HOST)) return;

    const w = window as MazeWindow;
    if (w.mazeUniversalSnippetApiKey) return;

    try {
      if (!sessionStorage.getItem("maze-us"))
        sessionStorage.setItem("maze-us", String(Date.now()));
    } catch {
      // Locked-down storage (private-mode Safari, cookie-blocking extensions)
      // throws on both read and write. Maze reads a missing timestamp as a fresh
      // session, which is the right fallback, so swallow and carry on.
    }

    const script = document.createElement("script");
    script.src = `${MAZE_LOADER}?apiKey=${MAZE_API_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    w.mazeUniversalSnippetApiKey = MAZE_API_KEY;
  }, []);
}
