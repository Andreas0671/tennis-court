import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeamBox } from "./TeamBox";

const meta: Meta<typeof TeamBox> = {
  title: "Components/TeamBox",
  component: TeamBox,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof TeamBox>;

export const Default: Story = {
  args: {
    label: "Team A",
    team: [
      { id: "1", name: "Sophie", gender: "w", strength: 5 },
      { id: "2", name: "Jonas", gender: "m", strength: 2 },
    ],
  },
};
