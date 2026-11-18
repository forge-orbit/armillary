// Posts a crafted Discord card for the GitHub event that started this run.
// See .github/workflows/discord.yml. The channel's webhook URL is the
// DISCORD_WEBHOOK repository secret (a plain webhook URL, no /github suffix).
//
// Exit 0: card posted, or this event has no card. Exit 1: Discord rejected it.

import { readFile } from "node:fs/promises";

const COLORS = {
  push: 0x58a6ff, // GitHub blue
  prOpened: 0x2ea043, // GitHub green
  issueOpened: 0xd29922, // GitHub yellow
  release: 0x8250df, // GitHub purple
};

// The forge-orbit org avatar; update if the org avatar changes.
const ORG_AVATAR = "https://avatars.githubusercontent.com/u/358159929?v=4";

const webhook = process.env.DISCORD_WEBHOOK;
const eventName = process.env.GITHUB_EVENT_NAME;
const repo = process.env.GITHUB_REPOSITORY;
const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));

if (!webhook) {
  console.log("DISCORD_WEBHOOK is not set (fork pull request?); no card.");
  process.exit(0);
}

async function github(path) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "discord-card" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  return res.ok ? res.json() : null;
}

const clip = (text, max) => {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

function embedCard({ color, title, url, author, description, fields = [], timestamp }) {
  const embed = { color, title };
  if (url) embed.url = url;
  if (author) {
    embed.author = { name: author.login ?? "unknown" };
    if (author.avatar_url) embed.author.icon_url = author.avatar_url;
    if (author.html_url) embed.author.url = author.html_url;
  }
  if (description) embed.description = description;
  if (fields.length > 0) embed.fields = fields;
  if (timestamp) embed.timestamp = timestamp;
  return { embeds: [embed] };
}

function withButtons(card, buttons) {
  return {
    ...card,
    components: [
      { type: 1, components: buttons.map(({ label, url }) => ({ type: 2, style: 5, label, url })) },
    ],
  };
}

async function pushCard() {
  const commits = event.commits ?? [];
  if (commits.length === 0) return null; // branch or tag deletion
  // The push payload has no line counts; fetch them per commit (capped).
  const detailed = await Promise.all(
    commits.slice(-5).map((c) => github(`/repos/${repo}/commits/${c.id}`)),
  );
  const additions = detailed.reduce((sum, c) => sum + (c?.stats?.additions ?? 0), 0);
  const deletions = detailed.reduce((sum, c) => sum + (c?.stats?.deletions ?? 0), 0);
  const branch = event.ref.replace("refs/heads/", "");
  const lines = commits
    .slice(-3)
    .toReversed()
    .map((c) => `[\`${c.id.slice(0, 7)}\`](${c.url}) ${clip(c.message.split("\n")[0], 72)}`);
  if (commits.length > 3) lines.push(`…and ${commits.length - 3} more`);
  return withButtons(
    embedCard({
      color: COLORS.push,
      title: `${commits.length} new commit${commits.length === 1 ? "" : "s"} on ${branch}`,
      url: event.compare,
      author: event.sender,
      description: lines.join("\n"),
      fields: [
        {
          name: "Diff",
          value: `+${additions.toLocaleString()} −${deletions.toLocaleString()}`,
          inline: true,
        },
      ],
      timestamp: event.head_commit?.timestamp,
    }),
    [{ label: "View comparison", url: event.compare }],
  );
}

function pullRequestCard() {
  const pr = event.pull_request;
  const url = pr.html_url;
  if (event.action === "closed") {
    const emoji = pr.merged ? "🎉" : "🔴";
    const verb = pr.merged ? "merged" : "closed";
    return {
      content: `${emoji} **PR #${pr.number} ${clip(pr.title, 60)}** ${verb} by **${event.sender.login}** — ${url}`,
    };
  }
  return withButtons(
    embedCard({
      color: COLORS.prOpened,
      title: `PR #${pr.number}: ${pr.title}`,
      url,
      author: pr.user,
      description: `**${pr.head.ref}** → **${pr.base.ref}**${pr.draft ? " · draft" : ""}`,
      fields: [
        {
          name: "Diff",
          value: `+${pr.additions.toLocaleString()} −${pr.deletions.toLocaleString()} · ${pr.changed_files} files`,
          inline: true,
        },
        { name: "Checks", value: "⏳ follow-up when checks finish", inline: true },
      ],
      timestamp: pr.created_at,
    }),
    [
      { label: "Open PR", url },
      { label: "Files changed", url: `${url}/files` },
    ],
  );
}

function issueCard() {
  const issue = event.issue;
  const url = issue.html_url;
  if (event.action === "opened") {
    return withButtons(
      embedCard({
        color: COLORS.issueOpened,
        title: `Issue #${issue.number}: ${issue.title}`,
        url,
        author: issue.user,
        description: clip(issue.body, 300) || "(no description)",
        fields: [
          {
            name: "Labels",
            value: issue.labels.map((l) => `\`${l.name}\``).join(" ") || "—",
            inline: true,
          },
        ],
        timestamp: issue.created_at,
      }),
      [{ label: "Open issue", url }],
    );
  }
  const emoji = event.action === "closed" ? "🔴" : "🟡";
  return {
    content: `${emoji} **Issue #${issue.number} ${clip(issue.title, 60)}** ${event.action} by **${event.sender.login}** — ${url}`,
  };
}

function commentLine() {
  const { comment, issue } = event;
  const kind = issue.pull_request ? "PR" : "Issue";
  return {
    content: `💬 **${comment.user.login}** on **${kind} #${issue.number} ${clip(issue.title, 60)}**: ${clip(comment.body, 140)} — ${comment.html_url}`,
  };
}

function releaseCard() {
  const release = event.release;
  return withButtons(
    embedCard({
      color: COLORS.release,
      title: `Release ${release.name ?? release.tag_name} (${release.tag_name})`,
      url: release.html_url,
      author: release.author,
      description: clip(release.body, 500) || "(no notes)",
      timestamp: release.published_at,
    }),
    [
      { label: "View release", url: release.html_url },
      { label: "Download", url: release.tarball_url },
    ],
  );
}

function checksLine() {
  const run = event.workflow_run;
  if (run.name === "Discord") return null; // loop guard; also in the workflow's `if`
  const pr = (run.pull_references ?? run.pull_requests ?? [])[0];
  if (!pr) return null; // only PR runs get a checks line, not runs on main
  const ok = run.conclusion === "success";
  return {
    content: `${ok ? "✅" : "❌"} **${run.name}** ${ok ? "passed" : "failed"} for **PR #${pr.number}** — ${run.html_url}`,
  };
}

const builders = {
  push: pushCard,
  pull_request: pullRequestCard,
  issues: issueCard,
  issue_comment: commentLine,
  release: releaseCard,
  workflow_run: checksLine,
};

const card = eventName in builders ? await builders[eventName]() : null;
if (!card) {
  console.log(`No card for ${eventName} (${event.action ?? "n/a"}).`);
  process.exit(0);
}

const res = await fetch(webhook, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: repo.split("/")[1], avatar_url: ORG_AVATAR, ...card }),
});
if (!res.ok) {
  console.error(`Discord rejected the card: ${res.status} ${await res.text()}`);
  process.exit(1);
}
console.log(`Posted ${eventName} card to Discord.`);
