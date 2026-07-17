import { getAllCases } from "../src/lib/cases";
import { auditEvidenceReachability } from "../src/lib/case-engine/evidence-reachability";

const cases = getAllCases();
let failed = false;

for (const caseData of cases) {
  const issues = auditEvidenceReachability(caseData);
  if (issues.length > 0) {
    failed = true;
    console.error(`\n❌ ${caseData.meta.title} (${caseData.meta.id}):`);
    for (const issue of issues) {
      console.error(`   - ${issue.evidenceId} "${issue.title}": ${issue.reason}`);
    }
  } else {
    console.log(`✓ ${caseData.meta.title}: all exhibits reachable`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("\nAll cases passed evidence reachability audit.");
