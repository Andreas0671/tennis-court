import type { Meta, StoryObj } from "@storybook/react-vite";
import { PrintSectionButton } from "./PrintSectionButton";

const meta: Meta<typeof PrintSectionButton> = {
  title: "Components/PrintSectionButton",
  component: PrintSectionButton,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof PrintSectionButton>;

export const Default: Story = {
  args: {
    targetId: "leaderboard-print",
    label: "Gesamtwertung drucken",
  },
};
