import type { CdiSession } from "@/Domain/Auth/CdiSession";
import type { DashboardService } from "@/Application/Dashboard/DashboardService";
import type { AccountService } from "@/Application/Accounts/AccountService";
import type { OpportunityService } from "@/Application/Opportunities/OpportunityService";

export interface CdiApplicationContext {
  session: CdiSession;
  dashboard: DashboardService;
  accounts: AccountService;
  opportunities: OpportunityService;
}
