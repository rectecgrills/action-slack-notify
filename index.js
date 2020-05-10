const { default: fetch } = require("node-fetch");

const core = require("@actions/core");
const github = require("@actions/github");

async function main() {
  let commitLink = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/commit/${github.context.sha}`;
  let commitMessage = github.context.payload.commits[0].message;

  await fetch(core.getInput("webhook"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author_name: github.context.actor,
      author_link: "http://github.com/" + github.context.actor,
      author_icon: "http://github.com/" + github.context.actor + ".png?size=32",
      fields: [
        {
          title: core.getInput("title"),
          value: core.getInput("description"),
          short: false,
        },
        {
          title: "Message",
          value: `<${commitLink}|${escapeForMrkdownLink(commitMessage)}>`,
          short: false,
        },
      ],
      mrkdown_in: ["value"],
    }),
  });
}
main.catch((error) => {
  core.setFailed(error.message);
});

function escapeForMrkdownLink(str) {
  return str.replace("<", "&lt;").replace(">", "&gt;");
}
