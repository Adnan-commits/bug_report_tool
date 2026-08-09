import { useState } from "react";
import { generateBugReport } from "./lib/api";
import ReportEditor from "./components/ReportEditor";
import ExportPreview from "./components/ExportPreview";
import SkeletonLoader from "./components/SkeletonLoader";
import "./style.css";

const TYPE_LABEL = {
  feature_request: "feature request",
  question: "question",
  unclear: "unclear",
};

const EXAMPLES = [
  "login button doesn't respond on mobile when the keyboard is open",
  "app crashes on launch for iOS 17 users since yesterday's update",
  "export button doesn't do anything when clicked",
];

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
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex}
                className="icon-btn"
                style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "4px 10px" }}
                onClick={() => setDescription(ex)}
              >
                try: "{ex.slice(0, 28)}..."
              </button>
            ))}
          </div>
          <div className="actions" style={{ borderTop: "none", paddingTop: 12 }}>
            <span />
            <button className="btn btn-primary" type="submit" disabled={!description.trim()}>
              Generate report
            </button>
          </div>
        </form>
      )}

      {phase === "loading" && <SkeletonLoader />}

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
        <div className="card error-card">
          <div className="error-icon">!</div>
          <div className="error-body">
            <div className="error-title">Couldn't generate a report</div>
            <div className="error-detail">{error}</div>
            <div className="actions" style={{ borderTop: "none", paddingLeft: 0 }}>
              <button className="btn btn-ghost" onClick={handleReset}>Rewrite and try again</button>
            </div>
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