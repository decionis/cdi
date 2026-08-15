import type { CustomerAccount } from "@/domain/accounts/CustomerAccount";
import type { CustomerOpportunity } from "@/domain/opportunities/CustomerOpportunity";
import type { PortfolioSnapshot } from "@/domain/portfolio/PortfolioSnapshot";

/**
 * Demo fixtures. Every value in this file is invented.
 *
 * This is the one file in a public repository shaped like customer data, so its
 * provenance is made true by construction rather than asserted after the fact.
 * Three conventions do that work, and `DemoCdiData.test.ts` enforces them:
 *
 *   Organisations use the NATO phonetic alphabet — Kilo, Sierra, Tango, Victor.
 *   A reader recognises generated data on sight, and no payments company is
 *   plausibly named this way, so a coincidental collision with a real customer
 *   cannot occur.
 *
 *   People use the `Example` surname, after the IANA-reserved example.com of
 *   RFC 2606. The repetition is deliberate: it is the signal. These are not
 *   employees, customer contacts, or anyone else.
 *
 *   External references are sequential (`CRM-DEMO-0001`), not shaped like a
 *   real CRM identifier. The previous fixtures used Salesforce-style ids, which
 *   read as though they had been copied from somewhere.
 *
 * Connector names are generic capabilities rather than vendor products, so the
 * demo does not imply commercial integrations that do not exist.
 *
 * Adding a fixture: invent it. Never adapt one from a real account, even with
 * the names changed — corridors, limits and utilisation patterns identify an
 * organisation as readily as its name does.
 */

/**
 * Fixed so the demo reads the same on every run. Note that `CdiFormat` also
 * carries this instant as its default `now`, which is tracked as a defect
 * (issue #17); the timestamps below are set relative to it so relative times
 * render sensibly until that is fixed.
 */
const generatedAt = "2026-07-10T15:30:00.000Z";

const accounts: CustomerAccount[] = [
  {
    id: "acct-kilo",
    name: "Kilo Payments",
    externalReference: "CRM-DEMO-0001",
    segment: "Enterprise",
    primaryRegion: "United Kingdom",
    corridors: ["UK → NG", "UK → KE"],
    state: "EXPANSION_READY",
    owner: "Alice Example",
    healthScore: 91,
    evidenceCoverage: 94,
    limitUtilization: 92,
    currentLimit: { amount: 500000, currency: "GBP" },
    proposedLimit: { amount: 650000, currency: "GBP" },
    updatedAt: "2026-07-10T15:24:00.000Z",
    connectors: [
      {
        id: "conn-kilo-crm",
        name: "CRM",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:20:00.000Z",
      },
      {
        id: "conn-kilo-usage",
        name: "Product usage",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:24:00.000Z",
      },
      {
        id: "conn-kilo-settlement",
        name: "Settlement ledger",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:23:00.000Z",
      },
      {
        id: "conn-kilo-support",
        name: "Support desk",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:18:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-kilo-usage",
        title: "Processing velocity reached 92%",
        detail:
          "Seven-day settled volume is 31% above the prior four-week baseline without an increase in exception rate.",
        source: "Product usage",
        sourceRecordId: "usage-kilo-20260710",
        observedAt: "2026-07-10T15:24:00.000Z",
        freshness: "LIVE",
        confidence: 0.98,
        impact: "POSITIVE",
        category: "USAGE",
      },
      {
        id: "ev-kilo-kyb",
        title: "Partner KYB refreshed",
        detail:
          "Beneficial ownership and sanctions screening completed for the two new corridor partners.",
        source: "KYC / KYB",
        sourceRecordId: "kyb-kilo-20260705",
        observedAt: "2026-07-05T09:12:00.000Z",
        freshness: "CURRENT",
        confidence: 0.95,
        impact: "POSITIVE",
        category: "KYC_KYB",
      },
      {
        id: "ev-kilo-milestone",
        title: "Expansion milestone recorded",
        detail:
          "Contracted volume commitment for the second half of the year was signed and logged against the account.",
        source: "CRM",
        sourceRecordId: "crm-kilo-20260702",
        observedAt: "2026-07-02T11:40:00.000Z",
        freshness: "CURRENT",
        confidence: 0.9,
        impact: "POSITIVE",
        category: "CRM",
      },
      {
        id: "ev-kilo-exceptions",
        title: "Exception rate steady at 0.4%",
        detail:
          "No material change in settlement exceptions across the volume increase.",
        source: "Settlement ledger",
        sourceRecordId: "settle-kilo-20260709",
        observedAt: "2026-07-09T22:05:00.000Z",
        freshness: "CURRENT",
        confidence: 0.93,
        impact: "NEUTRAL",
        category: "TRANSACTION",
      },
    ],
    timeline: [
      {
        id: "tl-kilo-1",
        title: "Utilisation crossed the review threshold",
        detail:
          "Rolling utilisation passed 90% of the agreed processing envelope.",
        occurredAt: "2026-07-10T15:24:00.000Z",
        kind: "SIGNAL",
      },
      {
        id: "tl-kilo-2",
        title: "Policy evaluated the account as review-required",
        detail:
          "The active customer operations policy routed the increase to human approval rather than applying it.",
        occurredAt: "2026-07-10T15:25:00.000Z",
        kind: "DECISION",
      },
      {
        id: "tl-kilo-3",
        title: "Queued for operator review",
        detail: "Recommendation surfaced in the governed action queue.",
        occurredAt: "2026-07-10T15:25:00.000Z",
        kind: "ACTION",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer_ops.v4",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 250000, currency: "GBP" },
      automaticChangesEnabled: false,
    },
  },
  {
    id: "acct-sierra",
    name: "Sierra Treasury",
    externalReference: "CRM-DEMO-0002",
    segment: "Enterprise",
    primaryRegion: "United States",
    corridors: ["US → MX", "US → PH"],
    state: "FRICTION",
    owner: "Bob Example",
    healthScore: 62,
    evidenceCoverage: 87,
    limitUtilization: 54,
    currentLimit: { amount: 1200000, currency: "USD" },
    proposedLimit: null,
    updatedAt: "2026-07-10T15:12:00.000Z",
    connectors: [
      {
        id: "conn-sierra-crm",
        name: "CRM",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:05:00.000Z",
      },
      {
        id: "conn-sierra-usage",
        name: "Product usage",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:11:00.000Z",
      },
      {
        id: "conn-sierra-settlement",
        name: "Settlement ledger",
        health: "DEGRADED",
        lastSyncAt: "2026-07-10T13:40:00.000Z",
      },
      {
        id: "conn-sierra-support",
        name: "Support desk",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:12:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-sierra-tickets",
        title: "Support contacts up 3.4x on one corridor",
        detail:
          "Ticket volume concentrated on US → MX, with settlement delay as the dominant reason code.",
        source: "Support desk",
        sourceRecordId: "support-sierra-20260710",
        observedAt: "2026-07-10T15:12:00.000Z",
        freshness: "LIVE",
        confidence: 0.94,
        impact: "NEGATIVE",
        category: "SUPPORT",
      },
      {
        id: "ev-sierra-completion",
        title: "Completion rate fell to 96.1%",
        detail:
          "Corridor completion dropped 2.7 points against baseline over four days.",
        source: "Settlement ledger",
        sourceRecordId: "settle-sierra-20260710",
        observedAt: "2026-07-10T13:40:00.000Z",
        freshness: "CURRENT",
        confidence: 0.91,
        impact: "NEGATIVE",
        category: "TRANSACTION",
      },
      {
        id: "ev-sierra-sync",
        title: "Settlement ledger sync degraded",
        detail:
          "The connector is returning partial pages; figures may lag by up to two hours.",
        source: "Settlement ledger",
        sourceRecordId: "settle-sierra-health",
        observedAt: "2026-07-10T13:41:00.000Z",
        freshness: "AGING",
        confidence: 0.72,
        impact: "NEUTRAL",
        category: "TRANSACTION",
      },
    ],
    timeline: [
      {
        id: "tl-sierra-1",
        title: "Support volume anomaly detected",
        detail: "Corridor-scoped ticket spike exceeded the alerting threshold.",
        occurredAt: "2026-07-10T15:12:00.000Z",
        kind: "SIGNAL",
      },
      {
        id: "tl-sierra-2",
        title: "Correlated with a settlement completion drop",
        detail:
          "Support and transaction evidence agreed on the same corridor and window.",
        occurredAt: "2026-07-10T15:13:00.000Z",
        kind: "SIGNAL",
      },
      {
        id: "tl-sierra-3",
        title: "Escalation recommended",
        detail:
          "Policy routed the account to an operations incident rather than an automated response.",
        occurredAt: "2026-07-10T15:14:00.000Z",
        kind: "DECISION",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer_ops.v4",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 500000, currency: "USD" },
      automaticChangesEnabled: false,
    },
  },
  {
    id: "acct-tango",
    name: "Tango Trade Services",
    externalReference: "CRM-DEMO-0003",
    segment: "Mid-market",
    primaryRegion: "Singapore",
    corridors: ["SG → ID", "SG → VN"],
    state: "REVIEW_REQUIRED",
    owner: "Carol Example",
    healthScore: 74,
    evidenceCoverage: 69,
    limitUtilization: 88,
    currentLimit: { amount: 300000, currency: "SGD" },
    proposedLimit: { amount: 400000, currency: "SGD" },
    updatedAt: "2026-07-10T13:30:00.000Z",
    connectors: [
      {
        id: "conn-tango-crm",
        name: "CRM",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:02:00.000Z",
      },
      {
        id: "conn-tango-usage",
        name: "Product usage",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:09:00.000Z",
      },
      {
        id: "conn-tango-kyb",
        name: "KYC / KYB",
        health: "STALE",
        lastSyncAt: "2026-04-18T08:00:00.000Z",
      },
      {
        id: "conn-tango-support",
        name: "Support desk",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T14:55:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-tango-usage",
        title: "Utilisation sustained above 85%",
        detail:
          "Three consecutive weeks above the review threshold with a stable exception rate.",
        source: "Product usage",
        sourceRecordId: "usage-tango-20260710",
        observedAt: "2026-07-10T15:09:00.000Z",
        freshness: "LIVE",
        confidence: 0.96,
        impact: "POSITIVE",
        category: "USAGE",
      },
      {
        id: "ev-tango-kyb",
        title: "Beneficial ownership evidence is stale",
        detail:
          "The most recent verified record predates the active policy's 90-day freshness requirement.",
        source: "KYC / KYB",
        sourceRecordId: "kyb-tango-20260418",
        observedAt: "2026-04-18T08:00:00.000Z",
        freshness: "STALE",
        confidence: 0.99,
        impact: "NEGATIVE",
        category: "KYC_KYB",
      },
      {
        id: "ev-tango-support",
        title: "No open support themes",
        detail: "No recurring reason codes across the last 60 days.",
        source: "Support desk",
        sourceRecordId: "support-tango-20260710",
        observedAt: "2026-07-10T14:55:00.000Z",
        freshness: "CURRENT",
        confidence: 0.88,
        impact: "POSITIVE",
        category: "SUPPORT",
      },
    ],
    timeline: [
      {
        id: "tl-tango-1",
        title: "Expansion review triggered by utilisation",
        detail: "Sustained utilisation met the criteria for a limit review.",
        occurredAt: "2026-07-10T13:28:00.000Z",
        kind: "SIGNAL",
      },
      {
        id: "tl-tango-2",
        title: "Policy blocked on evidence freshness",
        detail:
          "The KYB record is outside the freshness window the active policy requires.",
        occurredAt: "2026-07-10T13:30:00.000Z",
        kind: "DECISION",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer_ops.v4",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 150000, currency: "SGD" },
      automaticChangesEnabled: false,
    },
  },
  {
    id: "acct-victor",
    name: "Victor Remit",
    externalReference: "CRM-DEMO-0004",
    segment: "Mid-market",
    primaryRegion: "Norway",
    corridors: ["NO → PL"],
    state: "HEALTHY",
    owner: "Dave Example",
    healthScore: 88,
    evidenceCoverage: 78,
    limitUtilization: 41,
    currentLimit: { amount: 900000, currency: "NOK" },
    proposedLimit: null,
    updatedAt: "2026-07-10T12:05:00.000Z",
    connectors: [
      {
        id: "conn-victor-crm",
        name: "CRM",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T12:00:00.000Z",
      },
      {
        id: "conn-victor-usage",
        name: "Product usage",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T12:05:00.000Z",
      },
      {
        id: "conn-victor-settlement",
        name: "Settlement ledger",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T11:58:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-victor-usage",
        title: "Volume steady against baseline",
        detail:
          "No material variance in settled volume or exception rate over 30 days.",
        source: "Product usage",
        sourceRecordId: "usage-victor-20260710",
        observedAt: "2026-07-10T12:05:00.000Z",
        freshness: "CURRENT",
        confidence: 0.92,
        impact: "NEUTRAL",
        category: "USAGE",
      },
      {
        id: "ev-victor-kyb",
        title: "KYB current",
        detail: "Verified within the policy freshness window.",
        source: "KYC / KYB",
        sourceRecordId: "kyb-victor-20260612",
        observedAt: "2026-06-12T10:30:00.000Z",
        freshness: "CURRENT",
        confidence: 0.97,
        impact: "POSITIVE",
        category: "KYC_KYB",
      },
    ],
    timeline: [
      {
        id: "tl-victor-1",
        title: "Routine evidence refresh",
        detail: "All connected sources reported healthy with no new signals.",
        occurredAt: "2026-07-10T12:05:00.000Z",
        kind: "OUTCOME",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer_ops.v4",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 400000, currency: "NOK" },
      automaticChangesEnabled: false,
    },
  },
];

const opportunities: CustomerOpportunity[] = [
  {
    id: "opp-kilo-limit",
    accountId: "acct-kilo",
    accountName: "Kilo Payments",
    kind: "PROCESSING_LIMIT_REVIEW",
    status: "OPEN",
    title: "Review a £150k processing-limit increase",
    rationale:
      "Usage velocity, completed partner KYB and the recorded expansion milestone support a controlled increase. Human approval remains required in shadow mode.",
    recommendedAction:
      "Review a time-bound increase from £500k to £650k for the UK → NG corridor.",
    disposition: "REVIEW",
    confidence: 0.93,
    evidenceCoverage: 94,
    evidenceIds: ["ev-kilo-usage", "ev-kilo-kyb", "ev-kilo-milestone"],
    priority: "ELEVATED",
    createdAt: "2026-07-10T15:25:00.000Z",
    dossierId: "dos_demo_kilo_01",
  },
  {
    id: "opp-sierra-friction",
    accountId: "acct-sierra",
    accountName: "Sierra Treasury",
    kind: "FRICTION_INTERVENTION",
    status: "OPEN",
    title: "Assign the US settlement incident",
    rationale:
      "A concentrated support-ticket increase aligns with a corridor-specific fall in completion rate.",
    recommendedAction:
      "Create an operations incident, notify the account owner and hold expansion outreach until settlement health recovers.",
    disposition: "ESCALATE",
    confidence: 0.91,
    evidenceCoverage: 87,
    evidenceIds: ["ev-sierra-tickets", "ev-sierra-completion"],
    priority: "URGENT",
    createdAt: "2026-07-10T15:14:00.000Z",
    dossierId: "dos_demo_sierra_01",
  },
  {
    id: "opp-tango-hold",
    accountId: "acct-tango",
    accountName: "Tango Trade Services",
    kind: "HOLD_FOR_MORE_EVIDENCE",
    status: "OPEN",
    title: "Hold expansion pending KYB refresh",
    rationale:
      "Utilisation supports an expansion review, but beneficial-ownership evidence is stale under the active policy.",
    recommendedAction:
      "Request a KYB refresh and resume the limit review when evidence is current.",
    disposition: "BLOCK",
    confidence: 0.89,
    evidenceCoverage: 69,
    evidenceIds: ["ev-tango-usage", "ev-tango-kyb"],
    priority: "ROUTINE",
    createdAt: "2026-07-10T13:30:00.000Z",
    dossierId: "dos_demo_tango_01",
  },
];

export class DemoCdiData {
  static portfolio(): PortfolioSnapshot {
    return {
      generatedAt,
      dataStatus: "DEMO",
      summary: {
        totalAccounts: accounts.length,
        healthyAccounts: 1,
        accountsWithFriction: 1,
        expansionReady: 1,
        reviewsRequired: 2,
        averageEvidenceCoverage: 82,
      },
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        externalReference: account.externalReference,
        segment: account.segment,
        primaryRegion: account.primaryRegion,
        corridors: [...account.corridors],
        state: account.state,
        owner: account.owner,
        healthScore: account.healthScore,
        evidenceCoverage: account.evidenceCoverage,
        limitUtilization: account.limitUtilization,
        currentLimit: { ...account.currentLimit },
        proposedLimit: account.proposedLimit
          ? { ...account.proposedLimit }
          : null,
        updatedAt: account.updatedAt,
      })),
      opportunities: opportunities.map((opportunity) => ({ ...opportunity })),
    };
  }

  static account(accountId: string): CustomerAccount | null {
    const account = accounts.find((candidate) => candidate.id === accountId);
    return account ? structuredClone(account) : null;
  }

  static opportunities(): CustomerOpportunity[] {
    return opportunities.map((opportunity) => ({ ...opportunity }));
  }
}
