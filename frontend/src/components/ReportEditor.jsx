const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const PRIORITIES = ["Low", "Medium", "High"];

const SEV_COLOR = {
  Low: "var(--text-dim)",
  Medium: "#e5c34d",
  High: "#e5964d",
  Critical: "var(--danger)",
};

function InferredTag({ field, inferred }) {
  if (!inferred || !inferred.includes(field)) return null;
  return <span className="inferred-tag" title="AI inferred this, not explicitly stated">inferred</span>;
}

function ticketId(title) {
  const hash = (title || "").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return `BUG-${(hash % 9000 + 1000)}`;
}

export default function ReportEditor({ report, onChange, onExport, onReset }) {
  const inferred = report.inferred_fields || [];

  function update(field, value) {
    onChange({ ...report, [field]: value });
  }

  function updateStep(index, value) {
    const steps = [...report.steps_to_reproduce];
    steps[index] = value;
    update("steps_to_reproduce", steps);
  }

  function addStep() {
    update("steps_to_reproduce", [...report.steps_to_reproduce, ""]);
  }

  function removeStep(index) {
    update(
      "steps_to_reproduce",
      report.steps_to_reproduce.filter((_, i) => i !== index)
    );
  }

  return (
    <div
      className="card ticket-card"
      style={{ "--sev-color": SEV_COLOR[report.severity] || "var(--border)" }}
    >
      <div className="report-header" style={{ justifyContent: "space-between" }}>
        <div className="report-header" style={{ marginBottom: 0 }}>
          <span className={`badge badge-${report.severity?.toLowerCase()}`}>
            {report.severity} severity
          </span>
          <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}>
            {report.priority} priority
          </span>
        </div>
        <span className="ticket-id">{ticketId(report.title)}</span>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label>Title <InferredTag field="title" inferred={inferred} /></label>
        <input
          type="text"
          value={report.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>

      <div className="field-group">
        <div className="field-group-title"><span className="dot" />Classification</div>
        <div className="row" style={{ marginTop: 0 }}>
          <div className="field field-half" style={{ marginTop: 0 }}>
            <label>Severity <InferredTag field="severity" inferred={inferred} /></label>
            <select
              value={report.severity}
              onChange={(e) => update("severity", e.target.value)}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field field-half" style={{ marginTop: 0 }}>
            <label>Priority <InferredTag field="priority" inferred={inferred} /></label>
            <select
              value={report.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Environment <InferredTag field="environment" inferred={inferred} /></label>
          <input
            type="text"
            value={report.environment}
            onChange={(e) => update("environment", e.target.value)}
          />
        </div>
      </div>

      <div className="field-group">
        <div className="field-group-title">
          <span className="dot" />Steps to reproduce <InferredTag field="steps_to_reproduce" inferred={inferred} />
        </div>
        <ul className="steps-list">
          {report.steps_to_reproduce.map((step, i) => (
            <li key={i}>
              <span className="step-num">{i + 1}.</span>
              <input
                type="text"
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
              />
              <button className="icon-btn" onClick={() => removeStep(i)}>
                remove
              </button>
            </li>
          ))}
        </ul>
        <button className="icon-btn" onClick={addStep}>+ add step</button>
      </div>

      <div className="field-group">
        <div className="field-group-title"><span className="dot" />Impact</div>
        <div className="field" style={{ marginTop: 0 }}>
          <label>Expected behavior <InferredTag field="expected_behavior" inferred={inferred} /></label>
          <textarea
            rows={2}
            value={report.expected_behavior}
            onChange={(e) => update("expected_behavior", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Actual behavior <InferredTag field="actual_behavior" inferred={inferred} /></label>
          <textarea
            rows={2}
            value={report.actual_behavior}
            onChange={(e) => update("actual_behavior", e.target.value)}
          />
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-ghost" onClick={onReset}>New report</button>
        <button className="btn btn-primary" onClick={onExport}>Export as markdown</button>
      </div>

      <div className="mcp-note">
        <span className="mcp-dot" />
        <span>Also callable by agents via MCP tool <code>generate_bug_report_tool</code>, no form required.</span>
      </div>
    </div>
  );
}