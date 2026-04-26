import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("renders 4 stars", () => {
    const { container } = render(<StarRating value={3} />);
    expect(container.querySelectorAll("svg")).toHaveLength(4);
  });

  it("does not render buttons when non-interactive", () => {
    render(<StarRating value={3} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("renders 4 interactive buttons when interactive", () => {
    render(<StarRating value={3} interactive onChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("calls onChange with correct star value on click", async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} interactive onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("3 Sterne"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("buttons have accessible labels", () => {
    render(<StarRating value={1} interactive onChange={vi.fn()} />);
    expect(screen.getByLabelText("1 Sterne")).toBeInTheDocument();
    expect(screen.getByLabelText("4 Sterne")).toBeInTheDocument();
  });
});
