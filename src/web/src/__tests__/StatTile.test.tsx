import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatTile } from "@/components/ui/stat-tile";

describe("StatTile", () => {
  it("renders label and value", () => {
    render(<StatTile label="Net Worth" value="₹12,34,567" />);
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
    expect(screen.getByText("₹12,34,567")).toBeInTheDocument();
  });

  it("renders sub text when provided", () => {
    render(<StatTile label="XIRR" value="14.2%" sub="Annualised return" />);
    expect(screen.getByText("Annualised return")).toBeInTheDocument();
  });

  it("shows skeleton and hides value when loading", () => {
    render(<StatTile label="Holdings" value="₹5L" loading />);
    // Value text should not be visible
    expect(screen.queryByText("₹5L")).not.toBeInTheDocument();
  });

  it("does not show sub text when loading", () => {
    render(<StatTile label="CAGR" value="10%" sub="3-year" loading />);
    expect(screen.queryByText("3-year")).not.toBeInTheDocument();
  });
});
