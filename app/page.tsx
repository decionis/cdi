import { AccountPortfolioTable } from "@/components/dashboard/AccountPortfolioTable";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OpportunityQueue } from "@/components/dashboard/OpportunityQueue";
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary";
import { AppShell } from "@/components/layout/AppShell";
import { CdiCompositionRoot } from "@/infra/composition/CdiCompositionRoot";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const context = await new CdiCompositionRoot().createServerContext();
  const portfolio = await context.dashboard.getPortfolio();
  const canReview = context.session.roles.some(
    (role) => role === "APPROVER" || role === "ADMIN",
  );

  return (
    <AppShell session={context.session}>
      <DashboardHeader portfolio={portfolio} />
      <PortfolioSummary summary={portfolio.summary} />
      <OpportunityQueue
        opportunities={portfolio.opportunities}
        canReview={canReview}
      />
      <AccountPortfolioTable accounts={portfolio.accounts} />
    </AppShell>
  );
}
