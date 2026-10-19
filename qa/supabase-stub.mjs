/* ============================================================================
   qa/supabase-stub.mjs — محاكي Supabase REST+Storage للفحص المحلي (موجة 25)
   ينفّذ الحد الأدنى الذي يكلمه lib/supabase-server: جدول ads (data jsonb)
   وسلة تخزين عامة. التشغيل: node qa/supabase-stub.mjs [port]
   ========================================================================== */
import http from "node:http";

const PORT = Number(process.argv[2] || 9877);
const rows = new Map(); // id -> {id, ref, status, created_at, data}
const blobs = new Map(); // path -> Buffer

const send = (res, code, body, type = "application/json") => {
  const buf = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(code, { "Content-Type": type });
  res.end(buf);
};

http
  .createServer((req, res) => {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks);

      /* ── PostgREST ── */
      if (u.pathname === "/rest/v1/ads") {
        if (req.method === "GET") {
          const statusIn = /status=in\.\(([^)]*)\)/.exec(u.search)?.[1]?.split(",");
          let list = [...rows.values()];
          if (statusIn) list = list.filter((r) => statusIn.includes(r.status));
          list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
          return send(res, 200, list.map((r) => ({ data: r.data })));
        }
        if (req.method === "POST") {
          const row = JSON.parse(raw.toString() || "{}");
          rows.set(row.id, row);
          return send(res, 201, [{ data: row.data }]);
        }
        if (req.method === "PATCH") {
          const id = /id=eq\.([^&]+)/.exec(u.search)?.[1];
          const cur = rows.get(decodeURIComponent(id ?? ""));
          if (!cur) return send(res, 404, []);
          const patch = JSON.parse(raw.toString() || "{}");
          cur.status = patch.status ?? cur.status;
          cur.data = patch.data ?? cur.data;
          return send(res, 200, [{ data: cur.data }]);
        }
        if (req.method === "DELETE") {
          const id = /id=eq\.([^&]+)/.exec(u.search)?.[1];
          rows.delete(decodeURIComponent(id ?? ""));
          return send(res, 204, "");
        }
      }

      /* ── Storage ── */
      const pub = /^\/storage\/v1\/object\/public\/ads\/(.+)$/.exec(u.pathname);
      if (pub && req.method === "GET") {
        const b = blobs.get(pub[1]);
        if (!b) return send(res, 404, "not found", "text/plain");
        return send(res, 200, b, "image/jpeg");
      }
      const up = /^\/storage\/v1\/object\/ads\/(.+)$/.exec(u.pathname);
      if (up && req.method === "POST") {
        blobs.set(up[1], raw);
        return send(res, 200, { Key: up[1] });
      }
      if (/^\/storage\/v1\/object\/ads$/.test(u.pathname) && req.method === "DELETE") {
        const { prefixes } = JSON.parse(raw.toString() || "{}");
        (prefixes ?? []).forEach((p) => blobs.delete(p));
        return send(res, 200, {});
      }

      send(res, 404, { error: `stub: no route ${req.method} ${u.pathname}` });
    });
  })
  .listen(PORT, () => console.log(`supabase-stub listening on ${PORT}`));
