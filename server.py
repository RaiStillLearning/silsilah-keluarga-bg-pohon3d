"""
Local dev server with Vercel-style URL rewrites.
Usage: python3 server.py
"""
import http.server
import json
import os

PORT = 8000
REWRITES = []

# Load rewrites from vercel.json
if os.path.exists("vercel.json"):
    with open("vercel.json") as f:
        config = json.load(f)
        REWRITES = config.get("rewrites", [])

class RewriteHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Strip query string for matching
        path = self.path.split("?")[0]

        # Check rewrites from vercel.json
        for rule in REWRITES:
            if path == rule["source"]:
                self.path = rule["destination"]
                break

        return super().do_GET()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

if __name__ == "__main__":
    print(f"🌿 Dev server running at http://localhost:{PORT}")
    print(f"📄 Loaded {len(REWRITES)} rewrites from vercel.json")
    for r in REWRITES:
        print(f"   {r['source']} → {r['destination']}")
    print()

    server = http.server.HTTPServer(("", PORT), RewriteHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped.")
