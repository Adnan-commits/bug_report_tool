import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function toMarkdown(report) {
  const steps = report.steps_to_reproduce
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");

  return `# ${report.title}

| Severity | Priority | Environment |
|---|---|---|
| ${report.severity} | ${report.priority} | ${report.environment} |

## Steps to reproduce
${steps}

## Expected behavior
${report.expected_behavior}

## Actual behavior
${report.actual_behavior}
`;
}

export default function ExportPreview({ report, onBack }) {
  const markdown = toMarkdown(report);

  function copyMarkdown() {
    navigator.clipboard.writeText(markdown);
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bug-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <div className="section-title">Preview</div>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>

      <div className="actions">
        <button className="btn btn-ghost" onClick={onBack}>Back to edit</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={copyMarkdown}>Copy</button>
          <button className="btn btn-primary" onClick={downloadMarkdown}>Download .md</button>
        </div>
      </div>
    </div>
  );
}