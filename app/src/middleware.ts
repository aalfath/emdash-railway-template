/**
 * Setup gate (added by the Railway template, not part of the EmDash starter).
 *
 * EmDash lets whoever opens /_emdash/admin/setup first create the admin
 * account. On a fresh public URL that is a takeover risk, so while
 * EMDASH_SETUP_PASSWORD is set the setup wizard and its API ask for that
 * password first (a standard browser sign-in prompt: any username, that
 * password). A cookie scoped to /_emdash/ carries the proof to the wizard's
 * API calls. /_emdash/api/setup/status stays open because the login page
 * reads it. Once the admin exists EmDash refuses setup calls on its own.
 */
import { createHash, timingSafeEqual } from "node:crypto";

import { defineMiddleware } from "astro:middleware";

const COOKIE = "emdash_setup_gate";
const GATED = ["/_emdash/admin/setup", "/_emdash/api/setup"];
const OPEN = new Set(["/_emdash/api/setup/status"]);

const digest = (s: string) => createHash("sha256").update(`emdash-setup-gate:${s}`).digest();

function matches(candidate: string, expected: Buffer): boolean {
	return timingSafeEqual(digest(candidate), expected);
}

function basicPassword(header: string | null): string | null {
	if (!header || !/^basic /i.test(header)) return null;
	const raw = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
	const i = raw.indexOf(":");
	return i === -1 ? null : raw.slice(i + 1);
}

const LOCKED = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Setup is locked</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem}code{background:#eee;padding:0 .3rem}</style>
</head><body><h1>Setup is locked</h1>
<p>Reload this page and sign in with any username (for example <code>admin</code>) and the value of
<code>EMDASH_SETUP_PASSWORD</code> from the EmDash service's <strong>Variables</strong> tab on Railway.</p></body></html>`;

export const onRequest = defineMiddleware((context, next) => {
	const password = process.env.EMDASH_SETUP_PASSWORD?.trim();
	if (!password) return next();

	const path = context.url.pathname.replace(/\/+$/, "") || "/";
	const gated = !OPEN.has(path) && GATED.some((p) => path === p || path.startsWith(`${p}/`));
	if (!gated) return next();

	const expected = digest(password);
	const proof = expected.toString("hex");
	const cookie = context.cookies.get(COOKIE)?.value;
	if (cookie && cookie.length === proof.length && timingSafeEqual(Buffer.from(cookie), Buffer.from(proof))) {
		return next();
	}

	const given = basicPassword(context.request.headers.get("authorization"));
	if (given !== null && matches(given, expected)) {
		const site = process.env.EMDASH_SITE_URL || process.env.SITE_URL || "";
		context.cookies.set(COOKIE, proof, {
			path: "/_emdash/",
			httpOnly: true,
			sameSite: "strict",
			secure: site.startsWith("https:"),
			maxAge: 60 * 60 * 12,
		});
		return next();
	}

	if (path.startsWith("/_emdash/api/")) {
		return new Response(
			JSON.stringify({ error: { code: "SETUP_LOCKED", message: "Open /_emdash/admin/setup and enter EMDASH_SETUP_PASSWORD first." } }),
			{ status: 401, headers: { "content-type": "application/json", "cache-control": "no-store" } },
		);
	}
	return new Response(LOCKED, {
		status: 401,
		headers: {
			"www-authenticate": 'Basic realm="EmDash setup", charset="UTF-8"',
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-store",
		},
	});
});
