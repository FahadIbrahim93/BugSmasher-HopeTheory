import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdManager } from './AdManager';

describe('AdManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('reports disabled ads as failed without changing to showing state', async () => {
    const onAdFailed = vi.fn();
    const manager = new AdManager({ enabled: false });
    manager.setCallbacks({ onAdFailed });

    await expect(manager.loadAd()).resolves.toBe(false);

    expect(onAdFailed).toHaveBeenCalledWith('Ads disabled');
    expect(manager.getState()).toBe('idle');
  });

  it('runs the demo rewarded-ad callback flow', async () => {
    const onAdShown = vi.fn();
    const onRewardEarned = vi.fn();
    const onAdDismissed = vi.fn();
    const manager = new AdManager({ provider: 'demo', enabled: true });
    manager.setRewardAmount(75);
    manager.setCallbacks({ onAdShown, onRewardEarned, onAdDismissed });

    const result = manager.showAd();
    await vi.advanceTimersByTimeAsync(2000);

    await expect(result).resolves.toBe(true);
    expect(onAdShown).toHaveBeenCalledOnce();
    expect(onRewardEarned).toHaveBeenCalledWith(75);
    expect(onAdDismissed).toHaveBeenCalledOnce();
    expect(manager.getState()).toBe('rewarded');
  });

  it('loads and shows the carbon provider path', async () => {
    const onAdLoaded = vi.fn();
    const onAdDismissed = vi.fn();
    const manager = new AdManager({ provider: 'carbon', enabled: true });
    manager.setCallbacks({ onAdLoaded, onAdDismissed });

    await expect(manager.loadAd()).resolves.toBe(true);
    expect(onAdLoaded).toHaveBeenCalledOnce();

    const showResult = manager.showAd();
    await vi.advanceTimersByTimeAsync(1500);

    await expect(showResult).resolves.toBe(true);
    expect(onAdDismissed).toHaveBeenCalledOnce();
  });

  it('returns false for an unknown provider', async () => {
    const manager = new AdManager({ provider: 'demo', enabled: true });
    // Force an unsupported provider to cover the defensive default branch.
    (manager as unknown as { config: { provider: string } }).config.provider = 'unknown';

    await expect(manager.loadAd()).resolves.toBe(false);
    await expect(manager.showAd()).resolves.toBe(false);
  });
});
