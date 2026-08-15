import type { StewardSession } from "@/domain/auth/StewardSession";
import type { DashboardService } from "@/application/dashboard/DashboardService";
import type { AccountService } from "@/application/accounts/AccountService";
import type { OpportunityService } from "@/application/opportunities/OpportunityService";

export interface StewardApplicationContext {
  session: StewardSession;
  dashboard: DashboardService;
  accounts: AccountService;
  opportunities: OpportunityService;
}
