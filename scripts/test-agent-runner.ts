/**
 * Autonomous Test Agent Runner for CI/CD & Deployments
 * 
 * রানিং নিয়ম:
 * - npm run test:agent
 * - অথবা বিল্ড প্রক্রিয়ায় ডেপ্লয়মেন্টের পূর্বে এটি রান করা হয়।
 * 
 * কাজ:
 * ১. সম্পূর্ণ সিস্টেম ও প্লে-রাইট টেস্ট প্যারামিটার অডিট করে।
 * ২. কোনো ফেইলিওর থাকলে তাকে বুদ্ধিমত্তার সাথে বিশ্লেষণ করে অ্যাকশনেবল ইনসিডেন্টে রূপান্তর করে।
 * ৩. এডমিন প্যানেলকে অ্যালার্ট পাঠায় যেন এডমিন যেকোনো সময়ে ড্যাশবোর্ডে বাগ ও ফিক্স নোটিফিকেশন পায়।
 */

import { runAllTests } from "./run-audit-tests";
import { analyzeFailureToIncident, TestAgentIncident, TestAgentRunLog } from "../src/data/testAgentState";
import fs from "fs";
import path from "path";

async function runAutonomousTestAgent() {
  console.log("\n=======================================================");
  console.log("   অটোনোমাস টেস্ট এজেন্ট (Autonomous Test Agent)");
  console.log("   CI/CD Quality Audit & Admin Alert Pipeline");
  console.log("=======================================================\n");

  const runId = `RUN-${Date.now().toString().slice(-8)}`;
  const startTime = Date.now();

  // Run comprehensive unit and business logic tests
  const auditResult = await runAllTests();

  const incidents: TestAgentIncident[] = [];

  for (const test of auditResult.results) {
    if (!test.passed) {
      const incident = analyzeFailureToIncident(
        test.id,
        test.name,
        test.error || "অজ্ঞাত ত্রুটি"
      );
      incidents.push(incident);
    }
  }

  const durationMs = Date.now() - startTime;
  const healthScore =
    auditResult.total > 0
      ? Math.round((auditResult.passedCount / auditResult.total) * 100)
      : 100;

  const runLog: TestAgentRunLog = {
    runId,
    triggerType: process.env.CI ? "CI/CD Pipeline" : "Deployment",
    timestamp: new Date().toISOString(),
    totalTests: auditResult.total,
    passedTests: auditResult.passedCount,
    failedTests: auditResult.failedCount,
    durationMs,
    healthScore,
    status: auditResult.failedCount === 0 ? "PASS" : auditResult.failedCount > 2 ? "FAIL" : "WARN",
    incidents,
  };

  // Attempt to notify local express server if active
  const serverPort = process.env.PORT || 3000;
  const endpoint = `http://localhost:${serverPort}/api/admin/test-agent/report`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runLog),
    });

    if (res.ok) {
      console.log(`[Test Agent] ✓ এডমিন প্যানেলে সফলভাবে টেস্ট অডিট ও ইনসিডেন্ট রিপোর্ট পাঠানো হয়েছে।`);
    } else {
      console.log(`[Test Agent] ℹ সার্ভার রেসপন্স কোড: ${res.status}`);
    }
  } catch (err: any) {
    console.log(`[Test Agent] ℹ লোকাল সার্ভার অফলাইনে থাকলে ফাইল ক্যাশে স্টোর করা হচ্ছে (${err?.message || "offline"}).`);
  }

  // Also persist latest report to a disk file for fallback reading
  try {
    const reportsDir = path.resolve(process.cwd(), "test-results");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(reportsDir, "latest-test-agent-run.json"),
      JSON.stringify(runLog, null, 2),
      "utf-8"
    );
  } catch {
    // Ignore fs errors in read-only environments
  }

  console.log("\n=======================================================");
  console.log(`টেস্ট এজেন্ট রান সম্পন্ন: [${runLog.status}]`);
  console.log(`হেলথ স্কোর: ${healthScore}% | ইনসিডেন্ট সংখ্যা: ${incidents.length}`);
  if (incidents.length > 0) {
    console.log("\nশনাক্তকৃত সমস্যা ও এডমিন অ্যাকশন আইটেম:");
    incidents.forEach((inc, idx) => {
      console.log(`  ${idx + 1}. [${inc.severity}] ${inc.title} (${inc.affectedModule})`);
      console.log(`     পদক্ষেপ: ${inc.remediationAction}`);
    });
  }
  console.log("=======================================================\n");

  return runLog;
}

if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("test-agent-runner")) {
  runAutonomousTestAgent().then((log) => {
    process.exit(log.failedTests > 0 ? 1 : 0);
  });
}

export { runAutonomousTestAgent };
