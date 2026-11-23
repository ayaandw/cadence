import {AlertTriangle, CheckCircle2, Sparkles, SlidersHorizontal} from "lucide-react";
import {formatMins} from "../utils/scheduler";

export function CapacityBar({
    load,
    capMins,
    onChangeCap,
    onRebalance,
}) {
    const  {scheduledMins, compMins, capMins: cap, status} = load;
    const completedPct = Math.min(100, (compMins / cap) * 100);
    const scheduledPct = Math.min(100 - completedPct, (scheduledMins / cap) * 100);

    const statusMeta = {
        light: {
            label: "Open Runway",
            color: "var(--accent)",
            bg: "var(--accent-soft)",
            icon: Sparkles,
            hint: "Room for a break or to keep a light evening."
        },
        balanced: {
            label: "Balanced Load",
            color: "var(--accent)",
            bg: "var(--accent-soft)",
            icon: CheckCircle2,
            hint: "Realistic, steady progress without burning out.",
        },
        heavy: {
            label: "Near Capacity",
            color: "var(--warn)",
            bg: "var(--warn-soft)",
            icon: AlertTriangle,
            hint: "Tight fit workload. Avoid adding extra unless necessary"
        },
        overloaded: {
            label: "Overloaded",
            color: "var(--overload)",
            bg: "var(--overload-soft)",
            icon: AlertTriangle,
            hint: "Scheduled work exceeds healthy amount.",
        },
    }[status];

    const StatusIcon = statusMeta.icon;

    return (
        <div className="card" style={{marginBottom: "20px"}}>
            <div
                style={{
                    display:"flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "14px",
                }}
            >
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: statusMeta.color,
                            background: statusMeta.bg,
                        }}
                    >
                        <StatusIcon size={14} />
                        {statusMeta.label}
                    </span>
                    <span style={{fontSize: "0.85rem", color: "var(--text-muted)"}}>
                        {statusMeta.hint}
                    </span>
                </div>

                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <SlidersHorizontal size={14} style={{color: "var(--text-muted)"}} />
                    <label
                        htmlFor = "cap-select"
                        style = {{fontSize: "0.82rem", color: "var(--text-muted)"}}
                    >
                        Healthy Limit:
                    </label>
                    <select
                        id = "cap-select"
                        className = "select"
                        style = {{width: "auto", padding: "5px 10px", fontSize: "0.82rem"}}
                        value = {capMins}
                        onChange = {(e) => onChangeCap(Number(e.target.value))}
                    >
                        <option value={60}>1h 00m</option>
                        <option value={90}>1h 30m</option>
                        <option value={120}>2h 00m</option>
                        <option value={150}>2h 30m</option>
                        <option value={180}>3h 00m</option>
                        <option value={210}>3h 30m</option>
                        <option value={240}>4h 00m</option>
                        <option value={300}>5h 00m</option>
                    </select>
                </div>
            </div>

            <div
                style={{
                    height: "12px",
                    width: "100%",
                    background: "var(--surface-subtle)",
                    borderRadius:"999px",
                    overflow: "hidden",
                    display: "flex",
                    border: "1px solid var(--border)",
                }}
            >
                <div
                    title = {`Completed: ${formatMins(compMins)}`}
                    style={{
                        width: `${completedPct}%`,
                        background: "var(--accent)",
                        transition: "width 0.25s ease",
                    }}
                />
                <div
                    title={`Remaining Today: ${formatMins(scheduledMins)}`}
                    style={{
                        width: `${scheduledPct}%`,
                        background:
                            status === "overloaded"
                            ? "var(--overload)"
                            : status === "heavy"
                            ? "var(--warn)"
                            : "color-mix(in srgb, var(--accent) 45%, transparent)",
                        transition: "width 0.25s ease",
                    }}
                />
            </div>

            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                flexWrap: "wrap",
                gap: "8px",
            }}
            >
                <div>
                    <strong style={{color: "var(--text)"}}>
                        {formatMins(scheduledMins)}
                    </strong>{" "}
                    left today ·{" "}
                    <strong style={{color: "var(--text)"}}>
                        {formatMins(compMins)}
                    </strong>{" "}
                    done · {formatMins(cap)} limit
                </div>
                {(status === "overloaded" || status === "heavy") && (
                    <button className= "btn btn-primary" onClick = {onRebalance}>
                        Rebalance Extra to Tomorrow
                    </button>
                )}
            </div>
        </div>
    );
}