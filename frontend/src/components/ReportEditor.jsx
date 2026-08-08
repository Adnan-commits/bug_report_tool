const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function ReportEditor({ report, onChange, onExport, onReset }) {
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
    <div className="card">
      <div className="field">
        <label>Title</label>
        <input
          type="text"
          value={report.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>

      <div className="row">
        <div className="field field-half">
          <label>Severity</label>
          <select
            value={report.severity}
            onChange={(e) => update("severity", e.target.value)}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field field-half">
          <label>Priority</label>
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
        <label>Environment</label>
        <input
          type="text"
          value={report.environment}
          onChange={(e) => update("environment", e.target.value)}
        />
      </div>

      <div className="section-title">Steps to reproduce</div>
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

      <div className="field" style={{ marginTop: 20 }}>
        <label>Expected behavior</label>
        <textarea
          rows={2}
          value={report.expected_behavior}
          onChange={(e) => update("expected_behavior", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Actual behavior</label>
        <textarea
          rows={2}
          value={report.actual_behavior}
          onChange={(e) => update("actual_behavior", e.target.value)}
        />
      </div>

      <div className="actions">
        <button className="btn btn-ghost" onClick={onReset}>New report</button>
        <button className="btn btn-primary" onClick={onExport}>Export as markdown</button>
      </div>
    </div>
  );
}