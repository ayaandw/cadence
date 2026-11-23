import {useState} from "react";
import {Plus, Layers} from "lucide-react";
import {formatMins} from "../utils/scheduler";

export function TaskForm({addTask}) {
    const [title, setTitle] = useState("");
    const [totalMins, setTotalMins] = useState(90);
    const [chunkSize, setChunkSize] = useState(30);
    const [dueDate, setDueDate]= useState("");
    const estBlocks = Math.max(
        1, Math.ceil(Number(totalMins || 30) / Number(chunkSize || 30))
    );

    function handleSubmit(e) {
        e.preventDefault();
        if(!title.trim()) return;

        addTask({
            title: title.trim(),
            totalMins: Number(totalMins),
            chunkSize: Number(chunkSize),
            dueDate,
        });

        setTitle("");
        setDueDate("");
    }

    return (
        <form className = "card" onSubmit={handleSubmit}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                }}
            >
                <Layers size={17} style={{color: "var(--accent)"}} />
                <h2 style={{fontSize: "1rem", fontWeight: 600}}>Break Down a Task</h2>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
                <div>
                    <label
                        htmlFor = "task-title"
                        style={{display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px"}}
                    >Assignment or Goal</label>
                    <input
                        id="task-title"
                        className = "input"
                        type ="text"
                        placeholder = "e.g., Science Lab, English Essay..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px"}}>
                    <div>
                        <label
                            htmlFor="task-effort"
                            style={{display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px"}}
                        >Total Effort</label>
                        <select
                            id = "task-effort"
                            className = "select"
                            value = {totalMins}
                            onChange={(e) => setTotalMins(Number(e.target.value))}
                        >
                            <option value={25}>25m</option>
                            <option value={30}>30m</option>
                            <option value={45}>45m</option>
                            <option value={60}>1h 00m</option>
                            <option value={90}>1h 30m</option>
                            <option value={120}>2h 00m</option>
                            <option value={180}>3h 00m</option>
                            <option value={240}>4h 00m</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor = "chunk-size"
                            style = {{display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px"}}
                        >Block Length</label>
                        <select
                            id = "chunk-size"
                            className = "select"
                            value = {chunkSize}
                            onChange= {(e) => setChunkSize(Number(e.target.value))}
                        >
                            <option value = {20}>20m sprints</option>
                            <option value = {25}>25m pomodoro</option>
                            <option value = {30}>30m blocks</option>
                            <option value = {45}>45m deep work</option>
                            <option value = {60}>60m lock in</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="task-due"
                        style={{display: "block", fontSize: "0.8rem", color:"var(--text-muted)", marginBottom: "4px"}}
                    >Due Date (optional)</label>
                    <input
                        id = "task-due"
                        className = "input"
                        type = "date"
                        value = {dueDate}
                        onChange = {(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div
                    style={{
                        fontSize: "0.8rem",
                        color:"var(--text-muted)",
                        background: "var(--surface-subtle)",
                        padding: "8px 10px",
                        borderRadius: "8px",
                    }}
                >
                    Splits {formatMins(totalMins)} into{" "}
                    <strong style={{color: "var(--text)"}}>
                        ~{estBlocks} focus {estBlocks === 1 ? "block" : "blocks"}
                    </strong>
                    .
                </div>

                <button type="submit" className="btn btn-primary" style={{width: "100%"}}>
                    <Plus size={16} />
                    Add & Chunk Task
                </button>
            </div>
        </form>
    );
}