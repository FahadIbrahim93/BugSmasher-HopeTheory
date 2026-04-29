import { beforeEach, describe, expect, it } from 'vitest';
import { Leaderboard } from './Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ranks high scores in descending order and caps at ten entries', () => {
    const leaderboard = new Leaderboard();

    for (let score = 1; score <= 12; score++) {
      leaderboard.addEntry(score, 1, 1, `P${score}`);
    }

    const entries = leaderboard.getEntries();
    expect(entries).toHaveLength(10);
    expect(entries[0].score).toBe(12);
    expect(entries[9].score).toBe(3);
  });

  it('detects whether a score qualifies for the board', () => {
    const leaderboard = new Leaderboard();

    expect(leaderboard.isHighScore(1)).toBe(true);

    for (let score = 10; score >= 1; score--) {
      leaderboard.addEntry(score, 1, 1);
    }

    expect(leaderboard.isHighScore(0)).toBe(false);
    expect(leaderboard.isHighScore(11)).toBe(true);
  });
});
