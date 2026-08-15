import type { PortfolioSnapshot } from "@/domain/portfolio/PortfolioSnapshot";
import type { StewardRepository } from "@/infra/repositories/StewardRepository";

export class DashboardService {
  constructor(private readonly repository: StewardRepository) {}

  getPortfolio(): Promise<PortfolioSnapshot> {
    return this.repository.getPortfolio();
  }
}
