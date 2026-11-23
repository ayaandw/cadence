import {Check, Play, ArrowRight, ArrowLeft, Trash2, Clock} from "lucide-react";
import {formatMins} from "../utils/scheduler";

export function ChunkCard({
    chunk,
    dueDate,
    onToggleComplete,
    onStartFocus,
    onMoveDay,
    onDeleteChunk
}) {
    const tomorrow = (chunk.dayOffset || 0) >= 1;

    return (
        <div
            className = "card"
            style= {{
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                opacity: chunk.completed ? 0.65 : 1,
                transition: "opacity 0.18s ease, transform 0.12s ease",
            }}
        >
            <div style = {{display: "flex", alignItems: "center", gap: "12px", minWidth: 0}}>
                <button
                    type = "button"
                    aria-label={chunk.completed ? "Mark incomplete" : "Mark complete"}
                    onClick = {() => onToggleComplete(chunk.id)}
                    style = {{
                        width: "22px",
                        height: "22px",
                        borderRadius: "7px",
                        border: chunk.completed ? "none" : "1.5px solid var(--border)",
                        background: chunk.completed ? "var(--accent)" : "transparent",
                        color: "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    {chunk.completed && <Check size={14} strokeWidth={2.5}/>}
                </button>

                <div style={{minWidth: 0}}>
                    <div
                        style={{
                            fontSize: "0.95rem",
                            fontWeight: 500,
                            textDecoration: chunk.completed ? "line-through" : "none",
                            color: chunk.completed ? "var(--text-muted)" : "var(--text)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                    >
                        {chunk.label}
                    </div>
                    <div
                        style = {{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "3px",
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                            flexWrap: "wrap",
                        }}
                    >
                        <span style = {{display: "inline-flex", alignItems: "center", gap: "4px"}}>
                            <Clock size={12}/>
                            {formatMins(chunk.minutes)}
                        </span>
                        {dueDate && <span>Due {dueDate}</span>}
                        {tomorrow && (
                            <span
                                style={{
                                    background: "var(--surface-subtle)",
                                    padding: "1px 7px",
                                    borderRadius: "999px",
                                    fontSize: "0.73rem"
                                }}
                            >Day + {chunk.dayOffset}</span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{display: "flex", alignItems: "center", gap: "4px", flexShrink: 0}}>
                {!chunk.completed && (
                    <button
                        type = "button"
                        className = "btn btn-ghost"
                        title = "Start focus timer"
                        onClick={() => onStartFocus(chunk)}
                        style={{color: "var(--accent)"}}
                    >
                        <Play size={15}/>
                        <span style={{fontSize: "0.8rem"}}>Focus</span>
                    </button>
                )}

                {!chunk.completed && (
                    <button
                        type = "button"
                        className = "btn btn-ghost"
                        title={tomorrow ? "Move back by a day" : "Shift to tomorrow (no guilt)"}
                        onClick={() => onMoveDay(chunk.id, tomorrow ? -1 : 1)}
                    >
                        {tomorrow ? <ArrowLeft size={15}/> : <ArrowRight size={15}/>}
                    </button>
                )}
                <button
                    type = "button"
                    className = "btn btn-ghost"
                    title = "Remove block"
                    onClick = {() => onDeleteChunk(chunk.id)}
                ><Trash2 size={14}/></button>
            </div>
        </div>
    );
}