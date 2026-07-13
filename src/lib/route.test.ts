import { describe, it, expect } from 'vitest';
import { planRoute } from './route';

describe('planRoute', () => {
  it('keeps an all-Johto set to zero region crossings', () => {
    const r = planRoute(['goldenrod', 'national-park', 'union-cave'], 'Mon');
    expect(r.crossings).toBe(0);
    expect(r.order.map((n) => n.id).sort()).toEqual(['goldenrod', 'national-park', 'union-cave']);
  });

  it('forces exactly one crossing when a Kanto stop is added', () => {
    const r = planRoute(['goldenrod', 'national-park', 'mt-moon'], 'Mon');
    expect(r.crossings).toBe(1);
  });

  it('groups stops so region is only crossed once with several per region', () => {
    const r = planRoute(['national-park', 'union-cave', 'mt-moon', 'route-16'], 'Mon');
    expect(r.crossings).toBe(1);
  });

  it('groups a realistic mixed day into a single crossing', () => {
    // Regression: a mix of 3 Johto + 4 Kanto stops must cross exactly once.
    const r = planRoute(
      ['pokeathlon-dome', 'goldenrod', 'olivine', 'route-16', 'saffron', 'indigo-plateau', 'mt-moon'],
      'Mon'
    );
    expect(r.crossings).toBe(1);
    expect(r.order).toHaveLength(7);
  });

  it('ignores unmapped locations but reports them', () => {
    const r = planRoute(['goldenrod', null, 'does-not-exist'], 'Mon');
    expect(r.unmapped).toContain('does-not-exist');
    expect(r.order.map((n) => n.id)).toEqual(['goldenrod']);
  });

  it('respects a fixed start node', () => {
    const r = planRoute(['mt-moon', 'goldenrod'], 'Mon', 'goldenrod');
    expect(r.order[0].id).toBe('goldenrod');
  });
});
