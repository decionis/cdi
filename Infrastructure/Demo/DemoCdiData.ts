import type { CustomerAccount } from "@/Domain/Accounts/CustomerAccount";
import type { CustomerOpportunity } from "@/Domain/Opportunities/CustomerOpportunity";
import type { PortfolioSnapshot } from "@/Domain/Portfolio/PortfolioSnapshot";

const generatedAt = "2026-07-10T15:30:00.000Z";

const accounts: CustomerAccount[] = [
  {
    id: "acct-atlas",
    name: "AtlasPay Europe",
    externalReference: "SF-ACC-1842",
    segment: "Enterprise",
    primaryRegion: "United Kingdom",
    corridors: ["UK → NG", "UK → KE"],
    state: "EXPANSION_READY",
    owner: "Elena Rossi",
    healthScore: 91,
    evidenceCoverage: 94,
    limitUtilization: 92,
    currentLimit: { amount: 500000, currency: "GBP" },
    proposedLimit: { amount: 650000, currency: "GBP" },
    updatedAt: "2026-07-10T15:24:00.000Z",
    connectors: [
      {
        id: "salesforce",
        name: "Salesforce",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:20:00.000Z",
      },
      {
        id: "usage",
        name: "Product usage",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:24:00.000Z",
      },
      {
        id: "ledger",
        name: "Settlement ledger",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:23:00.000Z",
      },
      {
        id: "kyb",
        name: "KYC / KYB",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T14:58:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-atlas-usage",
        title: "Processing velocity reached 92%",
        detail:
          "Seven-day settled volume is 31% above the prior four-week baseline without an increase in exception rate.",
        source: "Product usage",
        sourceRecordId: "usage-atlas-20260710",
        observedAt: "2026-07-10T15:24:00.000Z",
        freshness: "LIVE",
        confidence: 0.98,
        impact: "POSITIVE",
        category: "USAGE",
      },
      {
        id: "ev-atlas-kyb",
        title: "Partner KYB completed",
        detail:
          "The newly registered Nigeria payout partner passed the configured KYB checks with no open remediation items.",
        source: "KYC / KYB",
        sourceRecordId: "kyb-partner-ng-224",
        observedAt: "2026-07-10T14:58:00.000Z",
        freshness: "CURRENT",
        confidence: 1,
        impact: "POSITIVE",
        category: "KYC_KYB",
      },
      {
        id: "ev-atlas-crm",
        title: "Expansion milestone recorded",
        detail:
          "Account owner recorded a signed distribution partnership covering Nigeria and Kenya.",
        source: "Salesforce",
        sourceRecordId: "opp-7721",
        observedAt: "2026-07-09T11:15:00.000Z",
        freshness: "CURRENT",
        confidence: 0.9,
        impact: "POSITIVE",
        category: "CRM",
      },
    ],
    timeline: [
      {
        id: "tl-atlas-1",
        title: "Limit review surfaced",
        detail: "CDI assembled three corroborating evidence domains.",
        occurredAt: "2026-07-10T15:25:00.000Z",
        kind: "DECISION",
      },
      {
        id: "tl-atlas-2",
        title: "KYB evidence refreshed",
        detail: "No outstanding partner remediation was found.",
        occurredAt: "2026-07-10T14:58:00.000Z",
        kind: "SIGNAL",
      },
      {
        id: "tl-atlas-3",
        title: "Expansion milestone",
        detail: "Salesforce opportunity moved to Closed Won.",
        occurredAt: "2026-07-09T11:15:00.000Z",
        kind: "SIGNAL",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer-ops-uk-v0.1-shadow",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 100000, currency: "GBP" },
      automaticChangesEnabled: false,
    },
  },
  {
    id: "acct-northline",
    name: "Northline Treasury",
    externalReference: "SF-ACC-2077",
    segment: "Mid-market",
    primaryRegion: "European Union",
    corridors: ["DE → US", "DE → GB"],
    state: "FRICTION",
    owner: "Marcus Klein",
    healthScore: 58,
    evidenceCoverage: 87,
    limitUtilization: 64,
    currentLimit: { amount: 300000, currency: "EUR" },
    proposedLimit: null,
    updatedAt: "2026-07-10T15:10:00.000Z",
    connectors: [
      {
        id: "zendesk",
        name: "Zendesk",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:10:00.000Z",
      },
      {
        id: "ledger",
        name: "Settlement ledger",
        health: "DEGRADED",
        lastSyncAt: "2026-07-10T14:45:00.000Z",
      },
      {
        id: "salesforce",
        name: "Salesforce",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T15:05:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-north-support",
        title: "Cross-border settlement complaints increased",
        detail:
          "Four related support conversations were opened in 48 hours, all referencing the same US batch settlement delay.",
        source: "Zendesk",
        sourceRecordId: "zd-cluster-804",
        observedAt: "2026-07-10T15:10:00.000Z",
        freshness: "LIVE",
        confidence: 0.95,
        impact: "NEGATIVE",
        category: "SUPPORT",
      },
      {
        id: "ev-north-txn",
        title: "US corridor completion rate fell",
        detail:
          "Batch completion fell from 98.8% to 91.2% while other corridors remained within baseline.",
        source: "Settlement ledger",
        sourceRecordId: "ledger-window-us-441",
        observedAt: "2026-07-10T14:45:00.000Z",
        freshness: "CURRENT",
        confidence: 0.99,
        impact: "NEGATIVE",
        category: "TRANSACTION",
      },
    ],
    timeline: [
      {
        id: "tl-north-1",
        title: "Friction intervention surfaced",
        detail:
          "Support and settlement signals crossed the elevated threshold.",
        occurredAt: "2026-07-10T15:12:00.000Z",
        kind: "DECISION",
      },
      {
        id: "tl-north-2",
        title: "Support cluster detected",
        detail: "Four tickets mapped to the US settlement corridor.",
        occurredAt: "2026-07-10T15:10:00.000Z",
        kind: "SIGNAL",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer-ops-eu-v0.1-shadow",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 50000, currency: "EUR" },
      automaticChangesEnabled: false,
    },
  },
  {
    id: "acct-meridian",
    name: "Meridian Trade Services",
    externalReference: "SF-ACC-1931",
    segment: "Enterprise",
    primaryRegion: "United States",
    corridors: ["US → MX", "US → BR"],
    state: "REVIEW_REQUIRED",
    owner: "Priya Shah",
    healthScore: 73,
    evidenceCoverage: 69,
    limitUtilization: 84,
    currentLimit: { amount: 850000, currency: "USD" },
    proposedLimit: { amount: 1000000, currency: "USD" },
    updatedAt: "2026-07-10T13:42:00.000Z",
    connectors: [
      {
        id: "salesforce",
        name: "Salesforce",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T13:42:00.000Z",
      },
      {
        id: "usage",
        name: "Product usage",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T13:40:00.000Z",
      },
      {
        id: "kyb",
        name: "KYC / KYB",
        health: "STALE",
        lastSyncAt: "2026-07-05T09:00:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-meridian-usage",
        title: "Sustained utilization above 80%",
        detail:
          "Account utilization has remained above 80% for nine consecutive business days.",
        source: "Product usage",
        sourceRecordId: "usage-meridian-20260710",
        observedAt: "2026-07-10T13:40:00.000Z",
        freshness: "CURRENT",
        confidence: 0.97,
        impact: "POSITIVE",
        category: "USAGE",
      },
      {
        id: "ev-meridian-kyb",
        title: "Ownership evidence is aging",
        detail:
          "The beneficial-ownership refresh is five days old and must be revalidated before a limit change.",
        source: "KYC / KYB",
        sourceRecordId: "kyb-meridian-901",
        observedAt: "2026-07-05T09:00:00.000Z",
        freshness: "STALE",
        confidence: 1,
        impact: "NEGATIVE",
        category: "KYC_KYB",
      },
    ],
    timeline: [
      {
        id: "tl-meridian-1",
        title: "Review required",
        detail:
          "Expansion evidence is positive, but KYB freshness is outside policy.",
        occurredAt: "2026-07-10T13:45:00.000Z",
        kind: "DECISION",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer-ops-us-v0.1-shadow",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 100000, currency: "USD" },
      automaticChangesEnabled: false,
    },
  },
  {
    id: "acct-fjord",
    name: "Fjord Remit",
    externalReference: "SF-ACC-2124",
    segment: "Mid-market",
    primaryRegion: "Nordics",
    corridors: ["SE → PL", "NO → DK"],
    state: "HEALTHY",
    owner: "Sofia Lind",
    healthScore: 88,
    evidenceCoverage: 78,
    limitUtilization: 49,
    currentLimit: { amount: 450000, currency: "EUR" },
    proposedLimit: null,
    updatedAt: "2026-07-10T12:30:00.000Z",
    connectors: [
      {
        id: "usage",
        name: "Product usage",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T12:30:00.000Z",
      },
      {
        id: "zendesk",
        name: "Zendesk",
        health: "HEALTHY",
        lastSyncAt: "2026-07-10T12:20:00.000Z",
      },
    ],
    evidence: [
      {
        id: "ev-fjord-usage",
        title: "Operating inside expected range",
        detail:
          "Usage, support volume and exception rate remain inside the approved operating envelope.",
        source: "Product usage",
        sourceRecordId: "usage-fjord-20260710",
        observedAt: "2026-07-10T12:30:00.000Z",
        freshness: "CURRENT",
        confidence: 0.94,
        impact: "NEUTRAL",
        category: "USAGE",
      },
    ],
    timeline: [
      {
        id: "tl-fjord-1",
        title: "No action",
        detail: "Account remains within the approved operating envelope.",
        occurredAt: "2026-07-10T12:32:00.000Z",
        kind: "DECISION",
      },
    ],
    policyEnvelope: {
      policyVersion: "customer-ops-eu-v0.1-shadow",
      maximumAutoIncreasePercent: 0,
      reviewThreshold: { amount: 50000, currency: "EUR" },
      automaticChangesEnabled: false,
    },
  },
];

const opportunities: CustomerOpportunity[] = [
  {
    id: "opp-atlas-limit",
    accountId: "acct-atlas",
    accountName: "AtlasPay Europe",
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
    evidenceIds: ["ev-atlas-usage", "ev-atlas-kyb", "ev-atlas-crm"],
    priority: "ELEVATED",
    createdAt: "2026-07-10T15:25:00.000Z",
    dossierId: "dos_demo_atlas_01",
  },
  {
    id: "opp-north-friction",
    accountId: "acct-northline",
    accountName: "Northline Treasury",
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
    evidenceIds: ["ev-north-support", "ev-north-txn"],
    priority: "URGENT",
    createdAt: "2026-07-10T15:12:00.000Z",
    dossierId: "dos_demo_north_01",
  },
  {
    id: "opp-meridian-kyb",
    accountId: "acct-meridian",
    accountName: "Meridian Trade Services",
    kind: "HOLD_FOR_MORE_EVIDENCE",
    status: "IN_REVIEW",
    title: "Hold expansion pending KYB refresh",
    rationale:
      "Utilization supports an expansion review, but beneficial-ownership evidence is stale under the active policy.",
    recommendedAction:
      "Request a KYB refresh and resume the limit review when evidence is current.",
    disposition: "BLOCK",
    confidence: 0.89,
    evidenceCoverage: 69,
    evidenceIds: ["ev-meridian-usage", "ev-meridian-kyb"],
    priority: "ELEVATED",
    createdAt: "2026-07-10T13:45:00.000Z",
    dossierId: "dos_demo_meridian_01",
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
