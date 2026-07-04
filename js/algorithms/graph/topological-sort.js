class TopologicalSort {
  constructor(numCourses, prerequisites) {
    this.numCourses = numCourses;
    this.prerequisites = prerequisites; // [[a,b], ...] means "a depends on b", edge b→a
    this.steps = [];
  }

  generateSteps() {
    this.steps = [];

    // Step: Build adjacency list
    const adj = this.buildGraph();
    this.steps.push({
      step: this.steps.length + 1,
      description: '构建邻接表：根据先修关系建立有向图',
      data: {
        graph: adj.map(function(n) { return n.slice(); }),
        prerequisites: this.prerequisites,
        indegree: new Array(this.numCourses).fill(0),
        queue: [],
        completed: [],
        numCourses: this.numCourses,
        nodeCount: this.numCourses
      },
      highlight: {
        codeLine: 2,
        nodes: { processing: [], completed: [], inQueue: [] },
        arrayIndices: []
      }
    });

    // Step: Calculate indegree
    const indegree = this.calcIndegree(adj);
    this.steps.push({
      step: this.steps.length + 1,
      description: '计算入度：统计每个节点的入边数量 — ' + this._indegreeStr(indegree),
      data: {
        graph: adj.map(function(n) { return n.slice(); }),
        prerequisites: this.prerequisites,
        indegree: indegree.slice(),
        queue: [],
        completed: [],
        numCourses: this.numCourses,
        nodeCount: this.numCourses
      },
      highlight: {
        codeLine: 3,
        nodes: { processing: [], completed: [], inQueue: [] },
        arrayIndices: []
      }
    });

    // Working copies
    var queue = [];
    var completed = [];
    var currentIndegree = indegree.slice();

    // Step: Find all nodes with indegree 0, add to queue
    for (var i = 0; i < this.numCourses; i++) {
      if (currentIndegree[i] === 0) {
        queue.push(i);
        this.steps.push({
          step: this.steps.length + 1,
          description: '课程 ' + i + ' 入度为 0，加入队列',
          data: {
            graph: adj.map(function(n) { return n.slice(); }),
            prerequisites: this.prerequisites,
            indegree: currentIndegree.slice(),
            queue: queue.slice(),
            completed: completed.slice(),
            numCourses: this.numCourses,
            nodeCount: this.numCourses
          },
          highlight: {
            codeLine: 16,
            nodes: {
              processing: [],
              completed: completed.slice(),
              inQueue: queue.slice()
            },
            arrayIndices: []
          }
        });
      }
    }

    // BFS (Kahn's algorithm)
    while (queue.length > 0) {
      var course = queue.shift();

      // Step: Dequeue node
      this.steps.push({
        step: this.steps.length + 1,
        description: '处理节点 ' + course + '，从队列中取出',
        data: {
          graph: adj.map(function(n) { return n.slice(); }),
          prerequisites: this.prerequisites,
          indegree: currentIndegree.slice(),
          queue: queue.slice(),
          completed: completed.slice(),
          numCourses: this.numCourses,
          nodeCount: this.numCourses
        },
        highlight: {
          codeLine: 21,
          nodes: {
            processing: [course],
            completed: completed.slice(),
            inQueue: queue.slice()
          },
          arrayIndices: []
        }
      });

      // Process neighbors
      var neighbors = adj[course];
      for (var j = 0; j < neighbors.length; j++) {
        var next = neighbors[j];
        currentIndegree[next]--;

        // Step: Indegree decrement
        this.steps.push({
          step: this.steps.length + 1,
          description: '课程 ' + next + ' 的入度减 1，当前入度：' + currentIndegree[next],
          data: {
            graph: adj.map(function(n) { return n.slice(); }),
            prerequisites: this.prerequisites,
            indegree: currentIndegree.slice(),
            queue: queue.slice(),
            completed: completed.slice(),
            numCourses: this.numCourses,
            nodeCount: this.numCourses
          },
          highlight: {
            codeLine: 25,
            nodes: {
              processing: [course],
              completed: completed.slice(),
              inQueue: queue.slice()
            },
            arrayIndices: []
          }
        });

        if (currentIndegree[next] === 0) {
          queue.push(next);

          // Step: Node added to queue
          this.steps.push({
            step: this.steps.length + 1,
            description: '课程 ' + next + ' 入度变为 0，加入队列',
            data: {
              graph: adj.map(function(n) { return n.slice(); }),
              prerequisites: this.prerequisites,
              indegree: currentIndegree.slice(),
              queue: queue.slice(),
              completed: completed.slice(),
              numCourses: this.numCourses,
              nodeCount: this.numCourses
            },
            highlight: {
              codeLine: 27,
              nodes: {
                processing: [course],
                completed: completed.slice(),
                inQueue: queue.slice()
              },
              arrayIndices: []
            }
          });
        }
      }

      // Mark node as completed
      completed.push(course);
    }

    // Final step: Check result
    if (completed.length === this.numCourses) {
      this.steps.push({
        step: this.steps.length + 1,
        description: '拓扑排序成功，无环！排序结果：[' + completed.join(', ') + ']',
        data: {
          graph: adj.map(function(n) { return n.slice(); }),
          prerequisites: this.prerequisites,
          indegree: currentIndegree.slice(),
          queue: queue.slice(),
          completed: completed.slice(),
          numCourses: this.numCourses,
          nodeCount: this.numCourses
        },
        highlight: {
          codeLine: 32,
          nodes: {
            processing: [],
            completed: completed.slice(),
            inQueue: []
          },
          arrayIndices: []
        }
      });
    } else {
      this.steps.push({
        step: this.steps.length + 1,
        description: '存在环，拓扑排序失败，无法完成 ' + this.numCourses + ' 门课程',
        data: {
          graph: adj.map(function(n) { return n.slice(); }),
          prerequisites: this.prerequisites,
          indegree: currentIndegree.slice(),
          queue: queue.slice(),
          completed: completed.slice(),
          numCourses: this.numCourses,
          nodeCount: this.numCourses
        },
        highlight: {
          codeLine: 32,
          nodes: {
            processing: [],
            completed: completed.slice(),
            inQueue: []
          },
          arrayIndices: []
        }
      });
    }

    return this.steps;
  }

  buildGraph() {
    var adj = [];
    for (var i = 0; i < this.numCourses; i++) {
      adj.push([]);
    }
    for (var j = 0; j < this.prerequisites.length; j++) {
      var course = this.prerequisites[j][0];
      var prereq = this.prerequisites[j][1];
      adj[prereq].push(course); // prereq → course
    }
    return adj;
  }

  calcIndegree(adj) {
    var indegree = new Array(this.numCourses).fill(0);
    for (var i = 0; i < adj.length; i++) {
      var neighbors = adj[i];
      for (var j = 0; j < neighbors.length; j++) {
        indegree[neighbors[j]]++;
      }
    }
    return indegree;
  }

  _indegreeStr(indegree) {
    var parts = [];
    for (var i = 0; i < indegree.length; i++) {
      parts.push(i + ':' + indegree[i]);
    }
    return '[' + parts.join(', ') + ']';
  }
}
