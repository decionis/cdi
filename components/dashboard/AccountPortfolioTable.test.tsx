import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemoCdiData } from "@/infra/demo/DemoCdiData";
import { AccountPortfolioTable } from "./AccountPortfolioTable";

describe("AccountPortfolioTable", () => {
  it("renders customer state and governed account links", () => {
    render(
      <AccountPortfolioTable accounts={DemoCdiData.portfolio().accounts} />,
    );

    expect(screen.getByText("AtlasPay Europe")).toBeInTheDocument();
    expect(screen.getByText("EXPANSION READY")).toBeInTheDocument();
    expect(screen.getByLabelText("Open AtlasPay Europe")).toHaveAttribute(
      "href",
      "/accounts/acct-atlas",
    );
  });
});
