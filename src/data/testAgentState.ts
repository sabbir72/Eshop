/**
 * Autonomous Test Agent & Bug Incident Tracking State
 * 
 * এটি ওয়েবসাইটের জন্য একটি বুদ্ধিমান টেস্ট এজেন্ট মডেল। যখনই কোনো নতুন বিল্ড,
 * ডেপ্লয়মেন্ট বা টেস্ট রান হয়, এটি স্বয়ংক্রিয়ভাবে বাগ বিশ্লেষণ করে এডমিন প্যানেলকে
 * অ্যালার্ট দেয় এবং দ্রুত সমস্যা সমাধানের জন্য অ্যাকশনেবল পদক্ষেপ (Remediation) প্রস্তাব করে।
 */

export type IncidentSeverity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "open" | "investigating" | "resolved";

export interface TestAgentIncident {
  id: string;
  category: "Pricing Math" | "Catalog Integrity" | "Checkout Validation" | "3D Fallback" | "Coupons & Discounts" | "API Server";
  severity: IncidentSeverity;
  title: string;
  description: string;
  affectedModule: string;
  targetAdminView: string;
  remediationAction: string;
  detectedAt: string;
  status: IncidentStatus;
}

export interface TestAgentRunLog {
  runId: string;
  triggerType: "Manual" | "Deployment" | "CI/CD Pipeline" | "Scheduled Audit";
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  healthScore: number;
  status: "PASS" | "FAIL" | "WARN";
  incidents: TestAgentIncident[];
}

export const initialTestAgentRuns: TestAgentRunLog[] = [
  {
    runId: "RUN-BUILD-2026-001",
    triggerType: "Deployment",
    timestamp: new Date().toISOString(),
    totalTests: 16,
    passedTests: 16,
    failedTests: 0,
    durationMs: 42,
    healthScore: 100,
    status: "PASS",
    incidents: [],
  },
];

export const initialTestAgentIncidents: TestAgentIncident[] = [
  // Clean default state on system boot
];

/**
 * Helper to generate actionable remediation advice based on failure patterns
 */
export function analyzeFailureToIncident(
  testId: string,
  testName: string,
  errorMsg: string
): TestAgentIncident {
  const incidentId = `INC-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  if (testId.includes("math") || errorMsg.toLowerCase().includes("price") || errorMsg.toLowerCase().includes("vat")) {
    return {
      id: incidentId,
      category: "Pricing Math",
      severity: "Critical",
      title: "আর্থিক বা ভ্যাট গণনায় অসঙ্গতি শনাক্ত",
      description: `টেস্ট '${testName}' ব্যর্থ হয়েছে: ${errorMsg}`,
      affectedModule: "Cash & Cart Engine",
      targetAdminView: "cash-calculation",
      remediationAction: "কার্ট সাবটোটাল এবং Math.round রাউন্ডিং লজিক যাচাই করুন অথবা ক্যাশ ক্যালকুলেশন লগ পরিদর্শন করুন।",
      detectedAt: now,
      status: "open",
    };
  }

  if (testId.includes("coupon") || errorMsg.toLowerCase().includes("coupon")) {
    return {
      id: incidentId,
      category: "Coupons & Discounts",
      severity: "High",
      title: "কুপন কোটা বা ছাড় নীতিতে ত্রুটি",
      description: `টেস্ট '${testName}' ব্যর্থ হয়েছে: ${errorMsg}`,
      affectedModule: "Coupon Management",
      targetAdminView: "coupons",
      remediationAction: "কুপন ম্যানেজমেন্ট প্যানেল থেকে কুপনের সর্বোচ্চ ছাড় ক্যাপ (Max Discount) ও মেয়াদোত্তীর্ণ তারিখ পরীক্ষা করুন।",
      detectedAt: now,
      status: "open",
    };
  }

  if (testId.includes("catalog") || errorMsg.toLowerCase().includes("sku") || errorMsg.toLowerCase().includes("stock")) {
    return {
      id: incidentId,
      category: "Catalog Integrity",
      severity: "High",
      title: "প্রোডাক্ট ক্যাটালগে অবৈধ ডেটা বা ডুপ্লিকেট SKU",
      description: `টেস্ট '${testName}' ব্যর্থ হয়েছে: ${errorMsg}`,
      affectedModule: "Product Management",
      targetAdminView: "products",
      remediationAction: "প্রোডাক্ট ম্যানেজমেন্টে গিয়ে ডুপ্লিকেট SKU বা ঋণাত্মক মূল্যের পণ্য তালিকা আপডেট করুন।",
      detectedAt: now,
      status: "open",
    };
  }

  if (testId.includes("checkout") || errorMsg.toLowerCase().includes("phone") || errorMsg.toLowerCase().includes("mobile")) {
    return {
      id: incidentId,
      category: "Checkout Validation",
      severity: "Critical",
      title: "চেকআউট বা মোবাইল নাম্বার ভ্যালিডেশনে ত্রুটি",
      description: `টেস্ট '${testName}' ব্যর্থ হয়েছে: ${errorMsg}`,
      affectedModule: "Checkout & Orders",
      targetAdminView: "orders",
      remediationAction: "চেকআউট পেজের বাংলাদেশি মোবাইল ফিল্ডের রেজেক্স এবং বাধ্যতামূলক ফিল্ড গার্ড ঠিক আছে কি না দেখুন।",
      detectedAt: now,
      status: "open",
    };
  }

  return {
    id: incidentId,
    category: "API Server",
    severity: "Medium",
    title: "সিস্টেম কম্পোনেন্টে সম্ভাব্য বাগ",
    description: `টেস্ট '${testName}' ব্যর্থ হয়েছে: ${errorMsg}`,
    affectedModule: "System Core",
    targetAdminView: "system-diagnostics",
    remediationAction: "সিস্টেম ডায়াগনস্টিক রানার থেকে পুনরায় টেস্ট এক্সিকিউট করে এরর স্ট্যাক ট্রেস পর্যালোচনা করুন।",
    detectedAt: now,
    status: "open",
  };
}
