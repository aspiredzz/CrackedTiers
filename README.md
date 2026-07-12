# CDTIERS Bot

A complete Discord.js v14 PvP testing queue bot, built with original code and inspired by
the MCTiers-style testing queue workflow. Fully rebranded as **CDTIERS** and ready to deploy
to Railway.

## Features

- Live public queue embed ("Evaluation Testing Waitlist") with Enter Waitlist / Leave Queue buttons
- Automatic "No Testers Online" embed when the queue is closed
- Private queue channel with a live, auto-updating queue board
- WAITLIST/QUEUE role that's always synced with who's actually queued
- Automatic private-channel access granted/revoked as players join/leave
- Persistent JSON-file storage (no native dependencies to compile) — the queue survives bot restarts
- Full staff command suite: start/stop/next/remove/skip/clear
- Polished `/results` embed with Minecraft avatar thumbnail
- Express `/health` endpoint + self-pinger for Railway uptime

## Project Structure

```text
src/
├── commands/        Slash commands (startqueue, stopqueue, requesttest, results, nextplayer, removeplayer, skipplayer, clearqueue)
├── events/           Discord.js event listeners (ready, interactionCreate)
├── handlers/         Command/event auto-loaders
├── embeds/           Embed builders (no tester, queue, board, results)
├── buttons/          Button interaction handlers (join/leave queue)
├── utils/            Queue manager, role manager, channel manager, display refresher, logger, health server
├── config/           Centralized environment-based configuration
├── database/         SQLite connection + schema
├── index.js          Entry point
└── deploy-commands.js  Slash command registration script
```

## 1. Create Your Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Under **Bot**, click "Add Bot". Copy the **Token** — this is your `DISCORD_TOKEN`.
3. Under **Bot**, enable these **Privileged Gateway Intents**:
   - Server Members Intent
4. Under **General Information**, copy the **Application ID** — this is your `CLIENT_ID`.
5. Under **OAuth2 → URL Generator**, select the `bot` and `applications.commands` scopes, and these bot permissions:
   - Manage Roles
   - Manage Channels
   - View Channels
   - Send Messages
   - Embed Links
   - Read Message History
6. Use the generated URL to invite the bot to your server.

## 2. Server Setup

Create (or reuse) the following in your Discord server, then copy their IDs (enable Developer Mode
in Discord settings to copy IDs):

- A public **queue channel** (e.g. `#testing-queue`) → `QUEUE_CHANNEL_ID`
- A private **queue channel**, permissions locked to staff only by default → `PRIVATE_QUEUE_CHANNEL_ID`
- A **results channel** (e.g. `#test-results`) → `RESULTS_CHANNEL_ID`
- A **WAITLIST/QUEUE** role (no special permissions needed) → `WAITLIST_ROLE_ID`
- Your staff role(s) → `STAFF_ROLE_IDS` (comma-separated if more than one)

Make sure the bot's role is positioned **above** the WAITLIST/QUEUE role in your role list, or it
won't be able to assign it.

## 3. Local Setup

```bash
git clone <your-repo-url>
cd cdtiers-bot
npm install
cp .env.example .env
```

Fill in every value in `.env`, then register your slash commands:

```bash
npm run deploy
```

Start the bot:

```bash
npm start
```

## 4. Deploying to Railway

1. Push this project to a GitHub repository.
2. Create a new Railway project → **Deploy from GitHub repo**.
3. In Railway's **Variables** tab, add every variable from `.env.example` with your real values.
4. Set `RAILWAY_STATIC_URL` to your Railway-provided public domain (e.g. `https://your-app.up.railway.app`) once it's generated, to enable the self-pinger.
5. Railway will run `npm start` automatically (see `railway.json` / `Procfile`).
6. Run `npm run deploy` once locally (or via a one-off Railway shell) to register your slash commands.

## Command Reference

| Command | Access | Description |
|---|---|---|
| `/setqueuechannel` | Staff | Sets the public queue channel (live embed + buttons post here) |
| `/setresultchannel` | Staff | Sets the channel where `/results` posts |
| `/setjoinwaitlistchannel` | Staff | Sets a channel and posts the "Join Waitlist" entry panel there |
| `/setprivatequeuechannel` | Staff | Sets the private channel queued players get access to (live board) |
| `/setwaitlistrole` | Staff | Sets the WAITLIST/QUEUE role granted while a player is queued |
| `/setupemojis` | Staff | Uploads the 7 gamemode icons as custom server emojis for `/results` |
| `/addtester` | Staff | Grants a specific member tester/staff access without a role |
| `/startqueue` | Staff | Opens the queue, sets you as the active tester |
| `/stopqueue` | Staff | Closes the queue, clears everyone, restores "No Testers Online" |
| `/requesttest` | Everyone | Joins the testing queue |
| `/results` | Staff | Posts a test result embed (with gamemode icon + half-body render) |
| `/nextplayer` | Staff | Pulls the next player from the front of the queue |
| `/removeplayer` | Staff | Removes a specific player from the queue |
| `/skipplayer` | Staff | Skips a specific player without testing them |
| `/clearqueue` | Staff | Wipes the entire queue without closing it |

### First-time setup (in Discord, after inviting the bot)

Channels, roles, testers, and gamemode icons can all be configured entirely from Discord —
no `.env` editing or redeploy required:

```text
/setqueuechannel channel:#testing-queue
/setresultchannel channel:#test-results
/setjoinwaitlistchannel channel:#join-waitlist
/setprivatequeuechannel channel:#queue-waiting-room
/setwaitlistrole role:@In Queue
/setupemojis
/addtester user:@SomeStaffMember
```

`STAFF_ROLE_IDS` is still set via `.env` (see step 2 below), since it rarely changes.

**`/setupemojis` requires the bot to have the "Manage Expressions" (Manage Emojis and
Stickers) permission** in Server Settings → Roles → [bot role] → Permissions. It uploads
the 7 icons in `assets/icons/` as custom server emojis and remembers them - safe to re-run,
it skips any icon that's already uploaded.

**If `/startqueue` shows the confirmation but no embed appears in the channel**, or `/results`
replies with an error — that means the relevant channel hasn't been set yet. Run the matching
`/set...` command above first.

**Joining the queue automatically:**
- Grants the WAITLIST/QUEUE role (set via `/setwaitlistrole`)
- Grants access to the private queue channel (set via `/setprivatequeuechannel`)
- Both are automatically revoked when a player leaves, is removed, is skipped, is pulled for
  testing via `/nextplayer`, or the queue is cleared/stopped

This already happens for both `/requesttest` and the "Enter Waitlist" button - there's nothing
extra to wire up once the role and channel are set.

## Notes

- The bot always edits its existing queue/board messages instead of sending new ones, so the
  channel stays clean.
- Queue state (open/closed, active tester, message IDs, and every queued player) is stored in
  `data/cdtiers.json`, which persists across restarts as long as the `data/` directory isn't wiped.
  Writes are atomic (temp file + rename) so a crash mid-write can't corrupt the file.
- On Railway, add a **Volume** mounted at `/app/data` if you want the queue to survive redeploys
  (container filesystem is otherwise ephemeral between deploys).
- This project intentionally has zero native/compiled dependencies (no SQLite, no build step),
  so `npm install` is fast and portable across hosts.
