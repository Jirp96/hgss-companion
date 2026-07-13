import { mapNodes, walkEdges, crossEdges } from './data';
import type { Day, MapNode, Region } from './types';

// Each hop costs 1 "jump". Crossing regions is what we most want to avoid, so a
// crossing edge carries a large penalty; the shortest-path weight then encodes
// crossings in the high digits and jumps in the low digits.
const CROSS_PENALTY = 1000;
const INF = Number.POSITIVE_INFINITY;

const nodeById = new Map<string, MapNode>(mapNodes.map((n) => [n.id, n]));

export interface RouteLeg {
  from: MapNode;
  to: MapNode;
  crossesRegion: boolean;
}

export interface RouteResult {
  order: MapNode[];
  legs: RouteLeg[];
  jumps: number;
  crossings: number;
  unmapped: string[]; // requested node ids not in the graph
}

function decode(weight: number): { crossings: number; jumps: number } {
  return { crossings: Math.floor(weight / CROSS_PENALTY), jumps: weight % CROSS_PENALTY };
}

/** Build a weighted adjacency matrix for the given day (drops unavailable crossings). */
function buildMatrix(day: Day | null): { ids: string[]; index: Map<string, number>; w: number[][] } {
  const ids = mapNodes.map((n) => n.id);
  const index = new Map(ids.map((id, i) => [id, i]));
  const n = ids.length;
  const w: number[][] = Array.from({ length: n }, () => Array(n).fill(INF));
  for (let i = 0; i < n; i++) w[i][i] = 0;

  const set = (a: string, b: string, cost: number) => {
    const i = index.get(a)!;
    const j = index.get(b)!;
    w[i][j] = Math.min(w[i][j], cost);
    w[j][i] = Math.min(w[j][i], cost);
  };

  // Fly: complete graph among fly points within each region, cost 1.
  const flyByRegion = new Map<Region, string[]>();
  for (const node of mapNodes) {
    if (!node.flyPoint) continue;
    const arr = flyByRegion.get(node.region) ?? [];
    arr.push(node.id);
    flyByRegion.set(node.region, arr);
  }
  for (const arr of flyByRegion.values()) {
    for (let a = 0; a < arr.length; a++) {
      for (let b = a + 1; b < arr.length; b++) set(arr[a], arr[b], 1);
    }
  }

  // Walk edges (venue <-> town), within a region.
  for (const e of walkEdges) set(e.from, e.to, e.cost);

  // Cross-region edges, honoring day restrictions.
  for (const e of crossEdges) {
    if (e.days && day && !e.days.includes(day)) continue;
    set(e.from, e.to, e.cost + CROSS_PENALTY);
  }

  return { ids, index, w };
}

function floydWarshall(w: number[][]): number[][] {
  const n = w.length;
  const d = w.map((row) => row.slice());
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (d[i][k] === INF) continue;
      for (let j = 0; j < n; j++) {
        const via = d[i][k] + d[k][j];
        if (via < d[i][j]) d[i][j] = via;
      }
    }
  }
  return d;
}

/**
 * Shortest Hamiltonian path (open TSP) over `pts` using the all-pairs distance
 * matrix `dist`. Held-Karp when small; nearest-neighbour + 2-opt otherwise.
 * If `startIdx` is provided the tour begins there.
 */
function shortestPath(pts: number[], dist: number[][], startIdx: number | null): number[] {
  const m = pts.length;
  if (m <= 1) return pts.slice();

  // `pts` are global node indices; the solver works in local indices 0..m-1 and
  // looks distances up through `pts`. Map the local result back to global ids.
  const D = (a: number, b: number) => dist[pts[a]][pts[b]];
  const localOrder = m <= 12 ? heldKarp(m, D, startIdx) : twoOpt(nearestNeighbour(m, D, startIdx ?? 0), D);
  return localOrder.map((i) => pts[i]);
}

function heldKarp(m: number, D: (a: number, b: number) => number, startIdx: number | null): number[] {
  const size = 1 << m;
  const dp = Array.from({ length: size }, () => Array(m).fill(INF));
  const parent = Array.from({ length: size }, () => Array(m).fill(-1));
  const starts = startIdx === null ? [...Array(m).keys()] : [startIdx];
  for (const s of starts) dp[1 << s][s] = 0;

  for (let mask = 0; mask < size; mask++) {
    for (let last = 0; last < m; last++) {
      if (dp[mask][last] === INF || !(mask & (1 << last))) continue;
      for (let next = 0; next < m; next++) {
        if (mask & (1 << next)) continue;
        const nm = mask | (1 << next);
        const cand = dp[mask][last] + D(last, next);
        if (cand < dp[nm][next]) {
          dp[nm][next] = cand;
          parent[nm][next] = last;
        }
      }
    }
  }

  const full = size - 1;
  let best = INF;
  let end = 0;
  for (let last = 0; last < m; last++) {
    if (dp[full][last] < best) {
      best = dp[full][last];
      end = last;
    }
  }
  const order: number[] = [];
  let mask = full;
  let cur = end;
  while (cur !== -1) {
    order.push(cur);
    const p = parent[mask][cur];
    mask ^= 1 << cur;
    cur = p;
  }
  return order.reverse();
}

function nearestNeighbour(m: number, D: (a: number, b: number) => number, start: number): number[] {
  const visited = new Set<number>([start]);
  const order = [start];
  while (order.length < m) {
    const last = order[order.length - 1];
    let best = -1;
    let bestD = INF;
    for (let j = 0; j < m; j++) {
      if (visited.has(j)) continue;
      if (D(last, j) < bestD) {
        bestD = D(last, j);
        best = j;
      }
    }
    visited.add(best);
    order.push(best);
  }
  return order;
}

function twoOpt(order: number[], D: (a: number, b: number) => number): number[] {
  const cost = (o: number[]) => o.slice(1).reduce((s, v, i) => s + D(o[i], v), 0);
  let best = order.slice();
  let bestCost = cost(best);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const cand = best.slice(0, i).concat(best.slice(i, j + 1).reverse(), best.slice(j + 1));
        const c = cost(cand);
        if (c < bestCost - 1e-9) {
          best = cand;
          bestCost = c;
          improved = true;
        }
      }
    }
  }
  return best;
}

/**
 * Plan a route visiting all `targetNodeIds` with the fewest region crossings
 * (then fewest jumps), for the given `day`. `startNodeId` is optional.
 */
export function planRoute(
  targetNodeIds: (string | null | undefined)[],
  day: Day | null = null,
  startNodeId: string | null = null
): RouteResult {
  const unmapped: string[] = [];
  const wanted = new Set<string>();
  for (const id of targetNodeIds) {
    if (!id) continue;
    if (nodeById.has(id)) wanted.add(id);
    else unmapped.push(id);
  }

  const { index, w } = buildMatrix(day);
  const dist = floydWarshall(w);

  const pts: number[] = [];
  const seen = new Set<number>();
  if (startNodeId && index.has(startNodeId)) {
    pts.push(index.get(startNodeId)!);
    seen.add(pts[0]);
  }
  for (const id of wanted) {
    const idx = index.get(id)!;
    if (!seen.has(idx)) {
      pts.push(idx);
      seen.add(idx);
    }
  }

  if (pts.length === 0) {
    return { order: [], legs: [], jumps: 0, crossings: 0, unmapped };
  }

  const startIdx = startNodeId && index.has(startNodeId) ? 0 : null;
  const ids = mapNodes.map((n) => n.id);
  const order = shortestPath(pts, dist, startIdx).map((i) => nodeById.get(ids[i])!);

  const legs: RouteLeg[] = [];
  let jumps = 0;
  let crossings = 0;
  for (let i = 0; i < order.length - 1; i++) {
    const a = index.get(order[i].id)!;
    const b = index.get(order[i + 1].id)!;
    const { crossings: c, jumps: j } = decode(dist[a][b]);
    crossings += c;
    jumps += j;
    legs.push({ from: order[i], to: order[i + 1], crossesRegion: c > 0 });
  }

  return { order, legs, jumps, crossings, unmapped };
}
