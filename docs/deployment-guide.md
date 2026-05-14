# Public Deployment Guide

This project deploys the frontend publicly while preserving the local backend architecture:

Users Browser -> Vercel Frontend -> HTTPS/WSS -> Cloudflare Tunnel -> Local FastAPI -> SQLite WAL -> Replay Engine -> Alice Blue WebSocket.

Do not move SQLite, replay, Alice ingestion, or the FastAPI primary-writer runtime to the cloud.

## 1. Preflight

Local production-ready URLs:

```powershell
Frontend: http://127.0.0.1:3000
Backend:  http://127.0.0.1:8020
```

Verify locally before public deploy:

```powershell
cd D:\Charu\frontend
npm run lint
npm run build

cd D:\Charu\API
python -m py_compile Main.py api\routes.py database\api_keys.py
```

FastAPI must run with one worker so shared in-memory websocket subscriptions, replay state, and market profile snapshots remain deterministic.

## 2. GitHub Push

Create the GitHub repo first, then replace `<GITHUB_REPO_URL>`:

```powershell
cd D:\Charu\frontend
git init
git add .
git commit -m "Realtime trading dashboard"
git branch -M main
git remote add origin <GITHUB_REPO_URL>
git push -u origin main
```

Do not commit real API keys, Alice credentials, Cloudflare tunnel credential JSON files, or SQLite databases.

## 3. Vercel Deployment

In Vercel:

1. Import the GitHub repo.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Output directory: `.next`.
5. Root directory: repository root if the repo is `D:\Charu\frontend`.

The project includes `vercel.json` with the production build settings and secure frontend headers.

CLI alternative:

```powershell
cd D:\Charu\frontend
npm install -g vercel
vercel login
vercel
vercel --prod
```

Expected frontend URL:

```text
https://your-dashboard.vercel.app
```

## 4. Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```text
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws/live
NEXT_PUBLIC_WS_GROUP=production_nse
```

Redeploy after changing them:

```powershell
vercel --prod --force
```

Local matching file:

```powershell
Copy-Item D:\Charu\frontend\.env.production.example D:\Charu\frontend\.env.local
```

## 5. FastAPI Production Environment

Create backend environment values from:

```text
D:\Charu\API\.env.production.example
```

Required values:

```text
API_DEFAULT_KEY=replace-with-long-random-token
API_CORS_ORIGINS=https://your-dashboard.vercel.app,http://localhost:3000,http://127.0.0.1:3000
API_ALLOWED_WS_ORIGINS=https://your-dashboard.vercel.app,http://localhost:3000,http://127.0.0.1:3000
API_RATE_LIMIT_PER_MINUTE=600
API_HOST=0.0.0.0
API_PORT=8020
```

Security behavior:

- REST routes require `X-API-Key`.
- Websocket accepts `?api_key=` or `?token=`.
- Websocket rejects non-allowed browser origins when `API_ALLOWED_WS_ORIGINS` is set.
- REST has lightweight per-IP rate limiting.
- Public HTTPS is provided by Cloudflare Tunnel.

## 6. Cloudflare Tunnel

Install `cloudflared` on Windows, then authenticate:

```powershell
cloudflared tunnel login
cloudflared tunnel create market-data-api
cloudflared tunnel route dns market-data-api api.yourdomain.com
```

Create:

```text
C:\Users\<YOUR_USER>\.cloudflared\config.yml
```

Template is also stored at:

```text
D:\Charu\frontend\ops\cloudflare\config.example.yml
```

Config:

```yaml
tunnel: market-data-api
credentials-file: C:\Users\YOUR_USER\.cloudflared\TUNNEL_ID.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:8020
    originRequest:
      connectTimeout: 10s
      noTLSVerify: false

  - service: http_status:404
```

Run manually:

```powershell
cloudflared tunnel run market-data-api
```

Cloudflare Tunnel supports websocket upgrade traffic, so the same hostname serves:

```text
https://api.yourdomain.com/docs
wss://api.yourdomain.com/ws/live
```

## 7. Windows Auto Start

Use either NSSM or Task Scheduler.

NSSM:

```powershell
D:\Charu\frontend\ops\windows\nssm-fastapi.example.ps1
D:\Charu\frontend\ops\windows\cloudflared-service.example.ps1
```

Task Scheduler:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
D:\Charu\frontend\ops\windows\fastapi-task-scheduler.ps1
```

Cloudflared service:

```powershell
cloudflared service install
Set-Service cloudflared -StartupType Automatic
Start-Service cloudflared
```

## 8. WebSocket Contract

The frontend uses one multiplexed websocket:

```text
wss://api.yourdomain.com/ws/live?api_key=<token>&group=production_nse
```

Preserved behavior:

- One socket for all symbols.
- Tick batching in React before Zustand updates.
- Heartbeat ping/pong.
- Reconnect backoff.
- Stale stream detection.
- Automatic symbol resubscription after reconnect.

Do not create one websocket per symbol and do not poll REST for live ticks.

## 9. Required API Checks

Use the real API key:

```powershell
$api = "https://api.yourdomain.com"
$key = "YOUR_API_KEY"

curl.exe -H "X-API-Key: $key" "$api/live/quotes"
curl.exe -H "X-API-Key: $key" "$api/live/quotes/TATASTEEL"
curl.exe -H "X-API-Key: $key" "$api/symbols/list"
curl.exe -H "X-API-Key: $key" "$api/market-profile/live/TATASTEEL"
```

Symbol add:

```powershell
curl.exe -X POST "$api/symbols/add" `
  -H "Content-Type: application/json" `
  -H "X-API-Key: $key" `
  -d "{\"exchange\":\"NSE\",\"symbol\":\"TATASTEEL\",\"token\":\"3499\",\"instrument_type\":\"EQUITY\",\"expiry\":\"\",\"strike\":0,\"option_type\":\"\",\"watchlist_name\":\"default\"}"
```

Websocket check with `wscat`:

```powershell
npm install -g wscat
wscat -c "wss://api.yourdomain.com/ws/live?api_key=YOUR_API_KEY&group=production_nse"
```

Expected messages include:

```json
{"type":"tick","symbol":"RELIANCE","ltp":1456.25}
{"type":"market_profile","symbol":"TATASTEEL","poc":217.35}
{"type":"ping","ts":1777870000}
```

## 10. HTTPS/WSS Validation

Browser checks:

- `https://your-dashboard.vercel.app` loads without mixed-content warnings.
- Network tab shows REST calls to `https://api.yourdomain.com`.
- Websocket tab shows `101 Switching Protocols` for `wss://api.yourdomain.com/ws/live`.
- Dashboard status becomes `Live`.
- Market Profile panel shows POC, VAH, VAL, IB, open type, day type, shape, balance, and rotational factor when backend data exists.

Cloudflare checks:

```powershell
cloudflared tunnel list
cloudflared tunnel info market-data-api
Get-Service cloudflared
```

FastAPI checks:

```powershell
Get-Content D:\Charu\API\logs\platform.log -Tail 100
```

## 11. Troubleshooting

Frontend says `Failed to fetch`:

- Check Vercel `NEXT_PUBLIC_API_URL`.
- Check Cloudflare tunnel is running.
- Check FastAPI is on `127.0.0.1:8020`.
- Check CORS includes the exact Vercel URL.

Websocket reconnects forever:

- Confirm `NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws/live`.
- Confirm API key is saved in the dashboard.
- Confirm `API_ALLOWED_WS_ORIGINS` contains the Vercel origin.
- Confirm Cloudflare DNS route points to the tunnel.

HTTP 401:

- API key missing or invalid.
- Use the key created by FastAPI bootstrap or `API_DEFAULT_KEY`.

HTTP 429:

- REST rate limit hit.
- Increase `API_RATE_LIMIT_PER_MINUTE` if the dashboard is behind shared office NAT.

Cloudflare 502/1033:

- Tunnel service stopped.
- Wrong tunnel ID or credential file path.
- `config.yml` points to the wrong local port.

No market profile values:

- Confirm backend route `GET /market-profile/live/{symbol}` returns data.
- Confirm live TickEvent flow is feeding the Market Profile engine.
- Confirm the selected symbol has an active session snapshot.

## 12. Production Checklist

- Frontend GitHub repo pushed.
- Vercel production deployment completed.
- Vercel env vars set and redeployed.
- FastAPI running locally on port `8020`.
- Cloudflare tunnel DNS route created.
- `config.yml` points to `http://localhost:8020`.
- API key authentication verified.
- Websocket auth token verified.
- CORS origins restricted to Vercel and local dev.
- Websocket origins restricted to Vercel and local dev.
- REST rate limiting enabled.
- SQLite is not publicly exposed.
- Alice credentials are not committed or exposed.
- Windows auto-start configured for FastAPI.
- Windows auto-start configured for cloudflared.
- Public HTTPS docs URL loads with API key.
- Public WSS stream connects and receives ticks.
- Dashboard displays live watchlist and Market Profile analytics.
