const { default: fetch } = require("node-fetch");

const core = require("@actions/core");
const github = require("@actions/github");

async function main() {
  let commitLinkPrefix = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/commit/`;
  let formattedCommitMessages = github.context.payload.commits
    .map((commit) => {
      let firstLine = commit.message.split("\n", 1)[0];
      let otherLines = commit.message.substr(firstLine.length + 1).trim();
      return (
        `<${commitLinkPrefix}${commit.sha}|${escapeMrkdwn(firstLine)}>` +
        (otherLines ? "```" + otherLines + "```" : "")
      );
    })
    .join("\n\n");
  let summarizedCommitMessages = github.context.payload.commits
    .map((commit) => commit.message.split("\n", 1)[0])
    .join("\n");

  await fetch(core.getInput("webhook"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attachments: [
        {
          fallback: `${core.getInput("title")}:\n${summarizedCommitMessages}`,
          author_name: github.context.actor,
          author_link: "http://github.com/" + github.context.actor,
          author_icon:
            "http://github.com/" + github.context.actor + ".png?size=32",
          fields: [
            {
              title: core.getInput("title"),
              value: core.getInput("description"),
              short: false,
            },
            {
              title: "Commits",
              value: formattedCommitMessages,
              short: false,
            },
          ],
          mrkdown_in: ["value"],
        },
      ],
    }),
  });
}
main().catch((error) => {
  console.error(error);
  core.setFailed(error.message);
});

function escapeMrkdwn(str) {
  return str.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;");
}
