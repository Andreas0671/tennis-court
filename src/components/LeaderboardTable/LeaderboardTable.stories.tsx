import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaderboardTable } from "./LeaderboardTable";

const meta: Meta<typeof LeaderboardTable> = {
  title: "Components/LeaderboardTable",
  component: LeaderboardTable,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof LeaderboardTable>;

export const Empty: Story = { args: { leaderboard: [] } };

export const WithPlayers: Story = {
  args: {
    leaderboard: [
      { id: "a", name: "Alice", gender: "w", strength: 4, points: 9, wins: 3, losses: 0, draws: 0, setsWon: 6, setsLost: 1, gamesWon: 36, gamesLost: 12, playedRounds: 3, pauseRounds: 0 },
      { id: "b", name: "Bob", gender: "m", strength: 3, points: 3, wins: 1, losses: 2, draws: 0, setsWon: 3, setsLost: 5, gamesWon: 20, gamesLost: 28, playedRounds: 3, pauseRounds: 0 },
      { id: "c", name: "Clara", gender: "w", strength: 4, points: 0, wins: 0, losses: 3, draws: 0, setsWon: 1, setsLost: 6, gamesWon: 10, gamesLost: 36, playedRounds: 3, pauseRounds: 0 },
    ],
  },
};
