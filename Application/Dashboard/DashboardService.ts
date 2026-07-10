import type { PortfolioSnapshot } from "@/Domain/Portfolio/PortfolioSnapshot";
import type { CdiRepository } from "@/Infrastructure/Repositories/CdiRepository";

export class DashboardService {
  constructor(private readonly repository: CdiRepository) {}

  getPortfolio(): Promise<PortfolioSnapshot> {
    return this.repository.getPortfolio();
  }
}
