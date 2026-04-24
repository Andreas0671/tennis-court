import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { StarRating } from "./StarRating";

const meta: Meta<typeof StarRating> = {
  title: "Components/StarRating",
  component: StarRating,
  parameters: { layout: "centered" },
  args: { onChange: fn() },
};
export default meta;
type Story = StoryObj<typeof StarRating>;

export const NoStars: Story = { args: { value: 0 } };
export const ThreeStars: Story = { args: { value: 3 } };
export const FullStars: Story = { args: { value: 5 } };
export const Interactive: Story = { args: { value: 2, interactive: true } };
