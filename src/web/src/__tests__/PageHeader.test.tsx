import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "@/components/ui/page-header";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(<PageHeader eyebrow="Overview" title="Dashboard" />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Goals" description="Track your financial goals." />);
    expect(screen.getByText("Track your financial goals.")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <PageHeader
        title="Holdings"
        actions={<button>Add Holding</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Add Holding" })).toBeInTheDocument();
  });
});
