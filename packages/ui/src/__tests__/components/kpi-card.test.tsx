import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "../../components/kpi-card.js";

describe("KpiCard", () => {
  it("renders value and label", () => {
    render(<KpiCard value="42" label="Total Students" />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Total Students")).toBeInTheDocument();
  });

  it("renders without trend when not provided", () => {
    const { container } = render(<KpiCard value="10" label="Courses" />);
    expect(container.querySelector(".bg-green-50")).toBeNull();
    expect(container.querySelector(".bg-red-50")).toBeNull();
  });

  it("renders positive trend with green styling", () => {
    const { container } = render(
      <KpiCard value="85%" label="Pass Rate" trend={{ value: "+5%", positive: true }} />
    );
    expect(screen.getByText("+5%")).toBeInTheDocument();
    expect(container.querySelector(".bg-green-50")).not.toBeNull();
  });

  it("renders negative trend with red styling", () => {
    const { container } = render(
      <KpiCard value="60%" label="Attendance" trend={{ value: "-3%", positive: false }} />
    );
    expect(screen.getByText("-3%")).toBeInTheDocument();
    expect(container.querySelector(".bg-red-50")).not.toBeNull();
  });
});
