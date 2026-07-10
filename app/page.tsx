import { AccountPortfolioTable } from "@/Components/Dashboard/AccountPortfolioTable";
import { DashboardHeader } from "@/Components/Dashboard/DashboardHeader";
import { OpportunityQueue } from "@/Components/Dashboard/OpportunityQueue";
import { PortfolioSummary } from "@/Components/Dashboard/PortfolioSummary";
import { AppShell } from "@/Components/Layout/AppShell";
import { CdiCompositionRoot } from "@/Infrastructure/Composition/CdiCompositionRoot";

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
