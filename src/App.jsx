import {useEffect, useState} from "react";
import {Flame, Palette, CalendarDays, CheckCircle} from "lucide-react";
import {useLocalStorage} from "./hooks/useLocalStorage";
import {createTask, evaluateLoad, rebalance, formatMins} from "./utils/scheduler";
import {CapacityBar} from "./components/CapacityBar";
import {TaskForm} from "./components/TaskForm";
import {ChunkCard} from "./components/ChunkCard";
import {FocusMode} from "./components/FocusMode";

const themes = [
  {id: "paper", label: "Paper", unlockAt: 0},
  {id: "midnight", label: "Midnight", unlockAt: 0},
  {id: "matcha", label: "Matcha", unlockAt: 0}
]

export default function App() {
  const [tasks, setTasks] = useLocalStorage("cadence.tasks.v1", []);
  const [chunks, setChunks] = useLocalStorage("cadence.chunks.v1", []);
  const [capMins, setCapMins] = useLocalStorage("cadence.cap.v1", 150);
  const [theme, setTheme] = useLocalStorage("cadence.theme.v1", "paper");
  const [completedCount, setCompletedCount] = useLocalStorage("cadence.completedCount.v1", 0);
  const [day, setDay] = useState(0);
  const [activeFocus, setActiveFocus] = useState(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function notify(msg) {
    setBanner(msg);
    window.clearTimeout(window.bannerTimer);
    window.bannerTimer = window.setTimeout(() => setBanner(""), 3200);
  }

  function handleAddTask(input) {
    const {task, chunks: newChunks} = createTask(input);
    setTasks((prev) => [task, ...prev]);
    setChunks((prev) => [...prev, ...newChunks]);
    notify(`Added "${task.title}" (${newChunks.length} focus ${newChunks.length === 1 ? "block" : "blocks"})`);
  }

  function handleToggleComplete(chunkID) {
    setChunks((prev) =>
      prev.map((chunk) => {
        if (chunk.id !== chunkID) return chunk;
        const nextComp = !chunk.completed;
        setCompletedCount((c) => Math.max(0, nextComp ? c + 1 : c - 1));
        return {...chunk, completed: nextComp};
      })
    );
  }

  function handleCompletion(chunkId) {
    setChunks((prev) =>
      prev.map((chunk) => {
        if (chunk.id !== chunkId || chunk.completed) return chunk;
        setCompletedCount((c) => c + 1);
        return {...chunk, completed: true};
      })
    );
    notify("Block completed - good work!")
  }

  function handleMove(chunkId, delta) {
    setChunks((prev) =>
      prev.map((chunk) => {
        if (chunk.id !== chunkId) return chunk;
        const nextOffset = Math.max(0, (chunk.dayOffset || 0) + delta);
        return {...chunk, dayOffset: nextOffset};
      })
    );
    notify(delta > 0 ? "Shifted block to tomorrow (no penalty)" : "Pulled block up schedule");
  }

  function handleDeleteChunk(chunkID) {
    setChunks((prev) => prev.filter((c) => c.id !== chunkID));
  }

  function handleRebalance() {
    const {updatedChunks, movedCount, movedMins} = rebalance(chunks, capMins, 0);
    if (movedCount === 0) {
      notify("Today's workload is already balanced");
      return;
    }
    setChunks(updatedChunks);
    notify(`Moved ${movedCount} ${movedCount === 1 ? "block" : "blocks"} (${formatMins(movedMins)}) to tomorrow`);
  }

  const todayLoad = evaluateLoad(chunks, capMins, 0);
  const taskById = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const visChunks = chunks.filter((c) => 
    day === 0 ? (c.dayOffset || 0) === 0 : (c.dayOffset || 0) >= 1
  );

  return (
    <div className = "app-shell">
      <header className = "topbar">
        <div className = "brand">
          <h1>Cadence</h1>
          <span className = "badge">
            <Flame size={13} style={{color: "var(--accent)"}}/>
            {completedCount} {completedCount === 1 ? "block" : "blocks"} done
          </span>
          {banner && (
            <span className="badge" style={{color: "var(--accent)"}}>
              {banner}</span>
          )}
        </div>

        <div style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
          <Palette size={15} style={{color: "var(--text-muted)"}}/>
          {themes.map((t) => {
            const unlocked = completedCount >= t.unlockAt;
            return (
              <button
                key = {t.id}
                type = "button"
                className = "btn"
                disabled = {!unlocked}
                onClick = {() => unlocked && setTheme(t.id)}
                style = {{
                  padding: "5px 11px",
                  fontSize: "0.8rem",
                  opacity: unlocked ? 1 : 0.45,
                  cursor: unlocked ? "pointer" : "not-allowed",
                  borderColor: theme === t.id ? "var(--accent)" : "var(--border)",
                }}
                title = {
                  unlocked ? `Switch to ${t.label} theme` : `Complete ${t.unlockAt} blocks to unlock ${t.label}`
                }
              >
                {t.label}
                {!unlocked && ` (${t.unlockAt})`}
              </button>
            );
          })}
        </div>
      </header>

      <CapacityBar
        load = {todayLoad}
        capMins = {capMins}
        onChangeCap = {setCapMins}
        onRebalance= {handleRebalance}
      />

      <div className = "main-grid">
        <aside style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          <TaskForm addTask = {handleAddTask}/>

          <div className="card" style={{fontSize: "0.82rem", color: "var(--text-muted)"}}>
            <div style={{display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "var(--text)", marginBottom: "6px"}}>
              <CheckCircle size={14} style={{color: "var(--accent)"}}/>
              Pacing Rule
            </div>
            Big tasks are split into manageable blocks so you don't face a flood of work. Shift overflow to tomorrow anytime.
          </div>
        </aside>

        <section>
          <div
            style = {{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{display: "flex", gap: "8px"}}>
              <button
                type = "button"
                className = {`btn ${day === 0 ? "btn-primary" : ""}`}
                onClick = {() => setDay(0)}
              >
                Today ({chunks.filter((c) => (c.dayOffset || 0) === 0).length})
              </button>
              <button
                type = "button"
                className = {`btn ${day === 1 ? "btn-primary" : ""}`}
                onClick = {() => setDay(1)}
              >
                <CalendarDays size={15}/>
                Upcoming ({chunks.filter((c) => (c.dayOffset || 0) >= 1).length})
              </button>
            </div>

            {day === 1 && chunks.some((c) => (c.dayOffset || 0) >= 1 && !c.completed) && (
              <button
                type = "button"
                className = "btn"
                style = {{fontSize: "0.8rem"}}
                onClick = {() => {
                  setChunks((prev) =>
                    prev.map((c) =>
                      !c.completed && (c.dayOffset || 0) >= 1
                        ? {...c, dayOffset: c.dayOffset - 1} : c
                    )
                  );
                  notify("Pulled upcoming blocks forward. Nice!")
                }}
              >
                Pull Closer (1d earlier)
              </button>
            )}
          </div>

          {visChunks.length === 0 ? (
            <div className="card" style={{textAlign: "center", padding: "36px 20px", color: "var(--text-muted)"}}>
              <p style={{fontWeight: 500, color: "var(--text)", marginBottom: "4px"}}>
                {day === 0 ? "No blocks scheduled for today" : "No upcoming blocks queued"}
              </p>
              <p style={{fontSize: "0.85rem"}}>
                {day === 0
                  ? "Add an assignment on the left to break it into realistic blocks."
                  : "Rebalancing an overloaded day or shifting a block to tomorrow shows here."
                }
              </p>
            </div>
          ) : (
            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
              {visChunks.map((chunk) => (
                <ChunkCard
                  key = {chunk.id}
                  chunk = {chunk}
                  dueDate = {taskById[chunk.taskId]?.dueDate}
                  onToggleComplete = {handleToggleComplete}
                  onStartFocus = {(c) => setActiveFocus(c)}
                  onMoveDay = {handleMove}
                  onDeleteChunk = {handleDeleteChunk}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <FocusMode
        chunk = {activeFocus}
        onClose = {() => setActiveFocus(null)}
        onCompleteChunk = {handleCompletion}
      />
    </div>
  );
}