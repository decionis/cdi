import type { PortfolioSnapshot } from "@/domain/portfolio/PortfolioSnapshot";
import type { CdiRepository } from "@/infra/repositories/CdiRepository";

export class DashboardService {
  constructor(private readonly repository: CdiRepository) {}

  getPortfolio(): Promise<PortfolioSnapshot> {
    return this.repository.getPortfolio();
  }
}
