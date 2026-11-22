// Entry point for the Railway template. Node running as PID 1 ignores SIGTERM,
// so without this a redeploy would wait and then SIGKILL the process while the
// SQLite database is open. A stop request exits 0; a crash still exits non-zero,
// so Railway's ON_FAILURE restart policy applies.
for (const signal of ["SIGTERM", "SIGINT"]) {
	process.on(signal, () => {
		console.log(`[emdash-start] ${signal} received, shutting down`);
		process.exit(0);
	});
}
await import("/app/dist/server/entry.mjs");
