import type { CdiSession } from "@/domain/auth/CdiSession";
import type { DashboardService } from "@/application/dashboard/DashboardService";
import type { AccountService } from "@/application/accounts/AccountService";
import type { OpportunityService } from "@/application/opportunities/OpportunityService";

export interface CdiApplicationContext {
  session: CdiSession;
  dashboard: DashboardService;
  accounts: AccountService;
  opportunities: OpportunityService;
}
