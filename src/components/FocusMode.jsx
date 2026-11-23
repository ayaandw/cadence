import {useEffect, useState} from "react";
import {X, Play, Pause, CheckCircle2, RotateCcw} from "lucide-react";

export function FocusMode({chunk, onClose, onCompleteChunk}) {
    const initSecs = Math.max(60, (chunk?.minutes || 25) * 60);
    const [secsLeft, setSecsLeft] = useState(initSecs);
    const [running, setRunning] = useState(true);
    const totalSecs = Math.max(60, (chunk?.minutes || 25) * 60);
    const progress = Math.max(0, Math.min(1, secsLeft / totalSecs));
    const rad = 104;
    const circ = 2 * Math.PI * rad;
    const dashOffset = circ * (1 - progress);
    const minutes = Math.floor(secsLeft / 60);
    const seconds = secsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    useEffect(() => {
        setSecsLeft(Math.max(60, (chunk?.minutes || 25) * 60));
        setRunning(true);
    }, [chunk]);

    useEffect(() => {
        if(!running || !chunk) return;
        
        const timer = window.setInterval(() => {
            setSecsLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    setRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
        // return (
        //     <div
        //         className = "mode-backdrop"
        //         style = {{
        //             position: "fixed",
        //             inset: 0,
        //             background: "rgba(0, 0, 0, 0.55)",
        //             backdropFilter: "blur(6px)",
        //             display: "flex",
        //             alignItems: "center",
        //             justifyContent: "center",
        //             padding: "20px",
        //             zIndex: 50,
        //         }}
        //     >
        //         <div
        //             className = "card mode-card"
        //             style = {{
        //                 width: "100%",
        //                 maxWidth: "460px",
        //                 padding: "34px 28px",
        //                 textAlign: "center",
        //                 position: "relative",
        //             }}
        //         ></div>
        //     </div>
        // )
    }, [running, chunk]);
    if (!chunk) return null;

    return (
        <div
            style = {{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.55)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 50,
            }}
        >
            <div
                className = "card"
                style = {{
                    width: "100%",
                    maxWidth: "420px",
                    padding: "28px 24px",
                    textAlign: "center",
                    position: "relative",
                }}
            >

                <button
                    type = "button"
                    className = "btn btn-ghost"
                    aria-label = "Close focus mode"
                    onClick = {onClose}
                    style = {{position: "absolute", top: "12px", right: "12px"}}
                ><X size={18}></X></button>
                
                <div
                    style = {{
                        fontSize: "0.78rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--accent)",
                        fontWeight: 600,
                        marginBottom: "8px"
                    }}
                >Focus Block</div>

                <h2 style={{fontSize: "1.15rem", fontWeight: 600, marginBottom: "20px"}}>
                    {chunk.label}</h2>
                <div style={{position: "relative", width: "240px", height: "240px", margin: "0 auto 28px"}}>
                    <svg width="240" height="240" style={{transform: "rotate(-90deg)"}}>
                        <circle
                            cx = "120"
                            cy = "120"
                            r = {rad}
                            fill = "none"
                            stroke = "var(--surface-subtle)"
                            strokeWidth = "12"
                        />
                        <circle
                            cx = "120"
                            cy = "120"
                            r = {rad}
                            fill = "none"
                            stroke = "var(--accent)"
                            strokeWidth = "12"
                            strokeLinecap = "round"
                            strokeDasharray = {circ}
                            strokeDashoffset = {dashOffset}
                            style = {{transition: "stroke-dashoffset 0.8s linear"}}
                        />
                    </svg>
                    <div
                        style = {{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span
                            style = {{
                                fontSize: "3.1rem",
                                fontWeight: 800,
                                fontVariantNumeric: "tabular-nums",
                                letterSpacing: "-0.03em",
                                lineHeight: 1,
                            }}
                        >{formattedTime}</span>
                        <span style={{fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px"}}>
                            {running ? "active" : "paused"}
                        </span>
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap"}}>
                    <button
                        type = "button"
                        className = "btn"
                        onClick = {() => setRunning((r) => !r)}
                    >
                        {running ? <Pause size={16}/> : <Play size={16}/>}
                        {running ? "Pause" : "Resume"}
                    </button>
                    <button
                        type = "button"
                        className = "btn"
                        onClick = {() => {
                            setRunning(false);
                            setSecsLeft(initSecs);
                        }}
                    >
                        <RotateCcw size={15}/>
                        Reset
                    </button>
                    <button
                        type = "button"
                        className = "btn btn-primary"
                        onClick = {() => {
                            onCompleteChunk(chunk.id);
                            onClose();
                        }}
                    >
                        <CheckCircle2 size={16} />
                        Finish Block
                    </button>
                </div>
            </div>
        </div>
    );
}