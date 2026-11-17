// Saves the home page's GitHub activity as a snapshot, counted with your own `gh` login. That login sees your
// private PRs, which no token on the server could. Totals only: no repository names are fetched or stored.
// Run it before shipping: npm run stats:refresh
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const query = `query {
  publicPrs: search(query: "is:pr is:merged is:public author:@me", type: ISSUE, first: 0) { issueCount }
  privatePrs: search(query: "is:pr is:merged is:private author:@me", type: ISSUE, first: 0) { issueCount }
  viewer {
    contributionsCollection {
      restrictedContributionsCount
      totalRepositoriesWithContributedCommits
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

const { data } = JSON.parse(execFileSync("gh", ["api", "graphql", "-f", `query=${query}`], { encoding: "utf8" }));
const collection = data.viewer.contributionsCollection;
const days = collection.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
const snapshot = {
  asOf: new Date().toISOString().slice(0, 10),
  start: days[0].date,
  counts: days.map((day) => day.contributionCount),
  total: collection.contributionCalendar.totalContributions,
  privateCount: collection.restrictedContributionsCount,
  mergedPrs: data.publicPrs.issueCount + data.privatePrs.issueCount,
  privatePrs: data.privatePrs.issueCount,
  repos: collection.totalRepositoriesWithContributedCommits,
};
// A bad answer must not replace a good snapshot.
if (snapshot.counts.length < 365 || !Number.isInteger(snapshot.total) || !Number.isInteger(snapshot.mergedPrs)) {
  throw new Error("GitHub returned an incomplete year; the snapshot was not changed");
}

writeFileSync(new URL("../src/lib/gitActivity.json", import.meta.url), `${JSON.stringify(snapshot)}\n`);
console.log(`GitHub activity as of ${snapshot.asOf}: ${snapshot.total} contributions, ${snapshot.mergedPrs} merged PRs (${snapshot.privatePrs} private)`);
