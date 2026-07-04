class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
  }

  draw(snapshot) {
    this.clear();
    if (snapshot.data) {
      this.drawData(snapshot.data);
    }
    if (snapshot.highlight) {
      this.drawHighlights(snapshot.highlight);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawData(data) {}

  drawHighlights(highlight) {}

  resizeCanvas(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}


class GraphRenderer extends Renderer {
  constructor(canvasId) {
    super(canvasId);
    this.layoutCache = null;
  }

  _computeLayout(data) {
    const nodeCount = data.numCourses || 0;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const radius = Math.min(cx, cy) * 0.65;
    const positions = {};

    if (nodeCount === 1) {
      positions[0] = { x: cx, y: cy };
    } else if (nodeCount > 1) {
      for (let i = 0; i < nodeCount; i++) {
        const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
        positions[i] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle)
        };
      }
    }

    this.layoutCache = positions;
    return positions;
  }

  _drawEdges(data, positions, nodeRadius) {
    const ctx = this.ctx;
    if (!data.prerequisites || data.prerequisites.length === 0) return;

    for (const [a, b] of data.prerequisites) {
      const from = positions[b];
      const to = positions[a];
      if (!from || !to) continue;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) continue;

      const ux = dx / dist;
      const uy = dy / dist;

      const startX = from.x + ux * nodeRadius;
      const startY = from.y + uy * nodeRadius;
      const endX = to.x - ux * nodeRadius;
      const endY = to.y - uy * nodeRadius;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const headLen = 10;
      const angle = Math.atan2(endY - startY, endX - startX);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLen * Math.cos(angle - Math.PI / 6),
        endY - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headLen * Math.cos(angle + Math.PI / 6),
        endY - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
    }
  }

  _drawNodeCircle(ctx, pos, nodeRadius) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  _drawNodeLabel(ctx, pos, nodeRadius, text) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(11, nodeRadius * 0.7)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(text), pos.x, pos.y);
  }

  _drawIndegreeBadge(ctx, pos, nodeRadius, value) {
    const badgeX = pos.x + nodeRadius * 0.7;
    const badgeY = pos.y - nodeRadius * 0.7;
    const badgeR = Math.max(7, nodeRadius * 0.3);
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, 2 * Math.PI);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(8, badgeR)}px sans-serif`;
    ctx.fillText(String(value), badgeX, badgeY);
  }

  _drawNodes(data, positions, nodeRadius) {
    const ctx = this.ctx;
    for (let i = 0; i < data.numCourses; i++) {
      const pos = positions[i];
      if (!pos) continue;

      this._drawNodeCircle(ctx, pos, nodeRadius);
      this._drawNodeLabel(ctx, pos, nodeRadius, i);

      if (data.indegree && data.indegree[i] !== undefined) {
        this._drawIndegreeBadge(ctx, pos, nodeRadius, data.indegree[i]);
      }
    }
  }

  _drawQueue(data) {
    const ctx = this.ctx;
    if (!data.queue || data.queue.length === 0) return;

    const boxWidth = 32;
    const boxHeight = 22;
    const startX = 20;
    const y = 20;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Queue:', startX, y - 4);

    for (let i = 0; i < data.queue.length; i++) {
      const x = startX + i * (boxWidth + 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, y, boxWidth, boxHeight);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, boxWidth, boxHeight);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(data.queue[i]), x + boxWidth / 2, y + boxHeight / 2);
    }
  }

  _drawCompleted(data, positions, nodeRadius) {
    const ctx = this.ctx;
    if (!data.completed || data.completed.length === 0) return;

    for (const nodeId of data.completed) {
      const pos = positions[nodeId];
      if (!pos) continue;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  _drawAdjacency(data) {
    if (!data.adjacency) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(JSON.stringify(data.adjacency), this.canvas.width - 10, this.canvas.height - 20);
  }

  drawData(data) {
    const positions = this._computeLayout(data);
    const nodeRadius = Math.max(16, Math.min(28, this.canvas.width / (data.numCourses * 3)));

    this._drawEdges(data, positions, nodeRadius);
    this._drawNodes(data, positions, nodeRadius);
    this._drawQueue(data);
    this._drawCompleted(data, positions, nodeRadius);
    this._drawAdjacency(data);
  }

  drawHighlights(highlight) {
    if (!this.layoutCache) return;
    const ctx = this.ctx;
    const positions = this.layoutCache;
    const nodeRadius = Math.max(16, Math.min(28, this.canvas.width / ((Object.keys(positions).length || 1) * 3)));

    if (highlight.nodes && highlight.nodes.length > 0) {
      for (const nodeRef of highlight.nodes) {
        let nodeId, status;
        if (typeof nodeRef === 'object' && nodeRef !== null) {
          nodeId = nodeRef.id;
          status = nodeRef.status;
        } else {
          nodeId = nodeRef;
          status = null;
        }

        const pos = positions[nodeId];
        if (!pos) continue;

        if (status === 'processing') {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 4, 0, 2 * Math.PI);
          ctx.strokeStyle = '#667eea';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#667eea';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (status === 'completed') {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
          ctx.fillStyle = '#10b981';
          ctx.fill();
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.stroke();
          this._drawNodeLabel(ctx, pos, nodeRadius, nodeId);
        } else if (status === 'inQueue') {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 3, 0, 2 * Math.PI);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 3, 0, 2 * Math.PI);
          ctx.strokeStyle = '#667eea';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
    }
  }
}


class ArrayRenderer extends Renderer {
  constructor(canvasId) {
    super(canvasId);
    this._currentData = null;
  }

  _barMetrics() {
    const arr = this._currentData && this._currentData.array ? this._currentData.array : [];
    const count = arr.length;
    if (count === 0) return null;
    const padding = 40;
    const gap = 2;
    const barWidth = (this.canvas.width - padding * 2 - gap * (count - 1)) / count;
    const maxVal = Math.max(...arr, 1);
    const maxHeight = this.canvas.height - padding * 2;
    return { arr, count, padding, gap, barWidth, maxVal, maxHeight };
  }

  _barRect(i, metrics) {
    const barHeight = (metrics.arr[i] / metrics.maxVal) * metrics.maxHeight;
    const x = metrics.padding + i * (metrics.barWidth + metrics.gap);
    const y = this.canvas.height - metrics.padding - barHeight;
    return { x, y, width: metrics.barWidth, height: barHeight };
  }

  _drawBarValue(ctx, i, rect, metrics, color) {
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(10, Math.min(14, metrics.barWidth * 0.5))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(metrics.arr[i]), rect.x + rect.width / 2, rect.y - 4);
  }

  drawData(data) {
    if (!data.array || data.array.length === 0) return;
    this._currentData = data;

    const metrics = this._barMetrics();
    if (!metrics) return;
    const ctx = this.ctx;

    for (let i = 0; i < metrics.count; i++) {
      const rect = this._barRect(i, metrics);
      ctx.fillStyle = '#7f9cf5';
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      this._drawBarValue(ctx, i, rect, metrics, '#1e293b');
    }
  }

  drawHighlights(highlight) {
    if (!highlight) return;
    const metrics = this._barMetrics();
    if (!metrics) return;
    const ctx = this.ctx;

    if (highlight.arrayIndices && highlight.arrayIndices.length > 0) {
      for (const i of highlight.arrayIndices) {
        if (i < 0 || i >= metrics.count) continue;
        const rect = this._barRect(i, metrics);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this._drawBarValue(ctx, i, rect, metrics, '#ffffff');
      }
    }

    if (highlight.sorted && highlight.sorted.length > 0) {
      for (const i of highlight.sorted) {
        if (i < 0 || i >= metrics.count) continue;
        const rect = this._barRect(i, metrics);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this._drawBarValue(ctx, i, rect, metrics, '#ffffff');
      }
    }

    if (highlight.pivot !== undefined && highlight.pivot !== null) {
      const i = highlight.pivot;
      if (i >= 0 && i < metrics.count) {
        const rect = this._barRect(i, metrics);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        this._drawBarValue(ctx, i, rect, metrics, '#1e293b');
      }
    }
  }

  draw(snapshot) {
    this._currentData = snapshot.data;
    super.draw(snapshot);
  }
}
