import { useState, useEffect, useRef } from "react";

export default function LabPanel({ lab, currentUser }) {
  const [steps, setSteps] = useState([]);

  const [currentStep, setCurrentStep] = useState(0);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(true);

    setCurrentStep(0);

    setResult("");

    fetch("http://localhost:3001/api/labs/reset", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: currentUser.id,
      }),
    });

    fetch(`http://localhost:3001/api/labs/${lab.id}/steps`)
      .then((r) => r.json())
      .then((data) => {
        setSteps(data);

        setLoading(false);
      });
  }, [lab]);

  const verifyStep = async () => {
    // check learner actually typed command
    const lastCommand = localStorage.getItem("lastCommand");

    if (lastCommand !== step.required_command) {
      setResult(`Please run: ${step.required_command}`);

      return;
    }

    // verify filesystem/output
    const response = await fetch("http://localhost:3001/api/labs/verify", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: currentUser.id,
        step,
      }),
    });

    const data = await response.json();

    console.log("VERIFY RESULT:", data);

    if (data.passed) {
      setResult(" Correct!");

      timeoutRef.current = setTimeout(() => {
        setCurrentStep((s) => s + 1);

        setResult("");
      }, 1200);
    } else {
      setResult(` Expected: ${step.expected_output} Got: ${data.output}`);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="lab-panel">
      <div className="lab-header"> Guided Practice Lab</div>

      {loading ? (
        <div className="lab-loading">Loading lab...</div>
      ) : currentStep >= steps.length ? (
        <div className="lab-complete">All steps completed</div>
      ) : (
        <>
          <div className="step-number">Step {step.step_number}</div>

          <h3>{step.instruction}</h3>

          <div className="lab-hint">
            <strong>Hint:</strong>

            <code>{step.command_hint}</code>
          </div>

          <div className="lab-explanation">{step.explanation}</div>

          <button className="lab-btn" onClick={verifyStep}>
            Verify Step
          </button>

          {result && <div className="lab-result">{result}</div>}
        </>
      )}
    </div>
  );
}
