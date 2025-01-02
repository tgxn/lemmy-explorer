// wrapper for cli

import task from "./src/bin/task";
import worker from "./src/bin/worker";
import manual from "./src/bin/manual";

function start(args: string[]) {
  // run single tasks for --task `--aged`
  if (args.length === 1 && args[0].startsWith("--")) {
    task(args[0].substring(2));
  }

  // start worker `-w instance`\`-w community`\`-w cron`
  else if (args.length === 2 && args[0] == "-w") {
    worker(args[1]);
  }

  // run manual processing job for one item `-m i <instance>` / `-s single <instance> <community>`
  else if (args.length >= 3 && args[0] == "-m") {
    manual(args[1], args[2], args[3]);
  }
}

const args = process.argv.slice(2);
start(args);
