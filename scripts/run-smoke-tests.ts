import { runAllTests } from "./run-audit-tests";

runAllTests("SMOKE").then(({ failedCount }) => {
  process.exit(failedCount > 0 ? 1 : 0);
});
