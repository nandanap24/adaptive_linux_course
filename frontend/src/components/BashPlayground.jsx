import { useState, useEffect, useRef } from "react";
import "../App.css";

export default function BashPlayground({ resetTrigger }) {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([]);
  useEffect(() => {
    setHistory([]);

    setCommand("");
  }, [resetTrigger]);
  const terminalRef = useRef(null);
  const [commandHistory, setCommandHistory] = useState([]);

  const [historyIndex, setHistoryIndex] = useState(-1);
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const [cwd, setCwd] = useState("/root");
  const runCommand = async () => {
    if (!command.trim()) return;

    try {
      const response = await fetch("http://localhost:3001/api/terminal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          command,
        }),
      });
      const data = await response.json();

      localStorage.setItem("lastCommand", command.trim());

      setCwd(data.cwd);

      console.log(data);
      setCommandHistory((prev) => [...prev, command]);

      setHistoryIndex(-1);
      setHistory((prev) => [
        ...prev,
        {
          command,
          output: String(data.output),
        },
      ]);

      setCommand("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    // ENTER
    if (e.key === "Enter") {
      runCommand();
    }

    // UP ARROW
    else if (e.key === "ArrowUp") {
      e.preventDefault();

      if (commandHistory.length === 0) return;

      const newIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(historyIndex - 1, 0);

      setHistoryIndex(newIndex);

      setCommand(commandHistory[newIndex]);
    }

    // DOWN ARROW
    else if (e.key === "ArrowDown") {
      e.preventDefault();

      if (commandHistory.length === 0) return;

      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;

      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommand("");
      } else {
        setHistoryIndex(newIndex);

        setCommand(commandHistory[newIndex]);
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);
  return (
    <div className="terminal">
      <div className="terminal-header">Linux Playground</div>

      <div className="terminal-body" ref={terminalRef}>
        {history.map((item, i) => (
          <div key={i}>
            <div className="cmd">$ {item.command}</div>

            <pre className="output">{item.output || ""}</pre>
          </div>
        ))}
      </div>

      <div className="terminal-input">
        <span>{cwd} $</span>

        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type Linux command..."
        />

        <button onClick={runCommand}>Run</button>
      </div>
    </div>
  );
}
