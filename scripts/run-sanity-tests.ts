import { runAllTests } from "./run-audit-tests";

runAllTests("SANITY").then(({ failedCount }) => {
  process.exit(failedCount > 0 ? 1 : 0);
});
