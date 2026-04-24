import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlayerCard } from "./PlayerCard";
import type { Player } from "@/types";

const player: Player = { id: "p1", name: "Max Mustermann", gender: "m", strength: 4 };

describe("PlayerCard", () => {
  it("displays player name", () => {
    render(<PlayerCard player={player} />);
    expect(screen.getByText("Max Mustermann")).toBeInTheDocument();
  });

  it("displays gender label", () => {
    render(<PlayerCard player={player} />);
    expect(screen.getByText("Männlich")).toBeInTheDocument();
  });

  it("does not show remove button when onRemove is absent", () => {
    render(<PlayerCard player={player} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows remove button when onRemove is provided", () => {
    render(<PlayerCard player={player} onRemove={vi.fn()} />);
    expect(screen.getByRole("button", { name: /entfernen/i })).toBeInTheDocument();
  });

  it("calls onRemove with player id on button click", async () => {
    const onRemove = vi.fn();
    render(<PlayerCard player={player} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: /entfernen/i }));
    expect(onRemove).toHaveBeenCalledWith("p1");
  });

  it("shows female gender label", () => {
    render(<PlayerCard player={{ ...player, gender: "w" }} />);
    expect(screen.getByText("Weiblich")).toBeInTheDocument();
  });
});
