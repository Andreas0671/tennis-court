import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { PlayerCard } from "./PlayerCard";

const meta: Meta<typeof PlayerCard> = {
  title: "Components/PlayerCard",
  component: PlayerCard,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof PlayerCard>;

export const Male: Story = {
  args: { player: { id: "1", name: "Max Mustermann", gender: "m", strength: 4 }, onRemove: fn() },
};

export const Female: Story = {
  args: { player: { id: "2", name: "Anna Müller", gender: "w", strength: 2 }, onRemove: fn() },
};

export const ReadOnly: Story = {
  args: { player: { id: "3", name: "Ben Schmidt", gender: "m", strength: 5 } },
};
