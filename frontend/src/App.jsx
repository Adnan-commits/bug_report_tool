import { useState } from "react";
import { generateBugReport } from "./lib/api";
import ReportEditor from "./components/ReportEditor";
import ExportPreview from "./components/ExportPreview";
import "./style.css";

const TYPE_LABEL = {
  feature_request: "feature request",
  question: "question",
  unclear: "unclear",
};

// phase: form | loading | editing | exporting | error | not-a-bug
export default function App() {
  const [phase, setPhase] = useState("form");
  const [description, setDescription] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setPhase("loading");
    setError(null);
    try {
      const data = await generateBugReport(description);
      if (data.type !== "bug") {
        setReport(data);
        setPhase("not-a-bug");
        return;
      }
      setReport(data);
      setPhase("editing");
    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  }

  function forceGenerateAsBug() {
    setPhase("loading");
    generateBugReport(`${description}\n\n(Note: user confirmed this should be treated as a bug report.)`)
      .then((data) => {
        setReport({ ...data, type: "bug" });
        setPhase("editing");
      })
      .catch((err) => {
        setError(err.message);
        setPhase("error");
      });
  }

  function handleReset() {
    setDescription("");
    setReport(null);
    setError(null);
    setPhase("form");
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Bug report generator</h1>
      </div>

      {phase === "form" && (
        <form className="card" onSubmit={handleSubmit}>
          <label>Describe the bug</label>
          <textarea
            rows={6}
            placeholder="e.g. the login button doesn't respond on mobile when the keyboard is open..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="actions" style={{ borderTop: "none", paddingTop: 12 }}>
            <span />
            <button className="btn btn-primary" type="submit" disabled={!description.trim()}>
              Generate report
            </button>
          </div>
        </form>
      )}

      {phase === "loading" && (
        <div className="state-msg">Generating structured report...</div>
      )}

      {phase === "not-a-bug" && report && (
        <div className="card">
          <div className="section-title">This doesn't look like a bug</div>
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 0 }}>
            Classified as <strong style={{ color: "var(--text)" }}>{TYPE_LABEL[report.type]}</strong>.
            {" "}{report.reasoning}
          </p>
          <div className="actions" style={{ borderTop: "none", paddingTop: 0 }}>
            <button className="btn btn-ghost" onClick={handleReset}>Rewrite</button>
            <button className="btn btn-primary" onClick={forceGenerateAsBug}>
              Generate as bug report anyway
            </button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="card">
          <div className="state-msg error">{error}</div>
          <div className="actions" style={{ borderTop: "none" }}>
            <button className="btn btn-ghost" onClick={handleReset}>Try again</button>
          </div>
        </div>
      )}

      {phase === "editing" && report && (
        <ReportEditor
          report={report}
          onChange={setReport}
          onReset={handleReset}
          onExport={() => setPhase("exporting")}
        />
      )}

      {phase === "exporting" && report && (
        <ExportPreview report={report} onBack={() => setPhase("editing")} />
      )}
    </div>
  );
}