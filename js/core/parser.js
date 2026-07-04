class InputParser {
  parseGraphInput(numCourses, prerequisitesJSON) {
    const n = Number(numCourses);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error('numCourses must be a positive integer');
    }

    let prerequisites;
    try {
      prerequisites = JSON.parse(prerequisitesJSON);
    } catch {
      throw new Error('prerequisites must be valid JSON');
    }

    if (!Array.isArray(prerequisites)) {
      throw new Error('prerequisites must be an array');
    }

    for (const pair of prerequisites) {
      if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error('each prerequisite must be a pair [a, b]');
      }
      const [a, b] = pair;
      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        throw new Error('prerequisite course numbers must be integers');
      }
      if (a < 0 || a >= n || b < 0 || b >= n) {
        throw new Error(`course numbers must be in range [0, ${n - 1}]`);
      }
    }

    return { numCourses: n, prerequisites };
  }

  parseArrayInput(arrayJSON) {
    let arr;
    try {
      arr = JSON.parse(arrayJSON);
    } catch {
      throw new Error('input must be valid JSON');
    }

    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('input must be a non-empty array');
    }

    for (const item of arr) {
      if (typeof item !== 'number' || !Number.isFinite(item)) {
        throw new Error('array must contain only numbers');
      }
    }

    return arr;
  }

  generateRandomGraph(numCourses = 6) {
    const n = Math.max(2, numCourses);
    const maxEdges = Math.floor(n * (n - 1) / 2);
    const edgeCount = Math.floor(Math.random() * maxEdges) + 1;
    const edges = [];

    const candidates = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        candidates.push([i, j]);
      }
    }

    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    for (let i = 0; i < Math.min(edgeCount, candidates.length); i++) {
      edges.push(candidates[i]);
    }

    return { numCourses: n, prerequisites: edges };
  }

  generateRandomArray(length = 10, max = 100) {
    const len = Math.max(1, length);
    const maxVal = Math.max(1, max);
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(Math.floor(Math.random() * maxVal) + 1);
    }
    return arr;
  }
}
