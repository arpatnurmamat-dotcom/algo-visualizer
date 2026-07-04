class Highlighter {
  constructor(containerId, codeText) {
    this.container = document.getElementById(containerId);
    this.lines = codeText.split('\n');
    this.currentLine = -1;
  }

  highlight(lineNumber) {
    this.currentLine = lineNumber;
    const html = this.lines.map((line, index) => {
      const escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const cls = index === lineNumber ? 'code-line highlighted' : 'code-line';
      return `<div class="${cls}">${escaped}</div>`;
    }).join('');
    this.container.innerHTML = html;
  }

  reset() {
    this.highlight(-1);
  }
}
