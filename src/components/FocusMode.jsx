import {useEffect, useState} from "react";
import {X, Play, Pause, CheckCircle2, RotateCcw} from "lucide-react";

export function FocusMode({chunk, onClose, onCompleteChunk}) {
    const initSecs = Math.max(60, (chunk?.minutes || 25) * 60);
    const [secsLeft, setSecsLeft] = useState(initSecs);
    const [running, setRunning] = useState(true);

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
    }, [running, chunk]);
    if (!chunk) return null;

    const mins = Math.floor(secsLeft / 60);
    const secs = secsLeft % 60;
    const formTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

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
                <div
                    style = {{
                        fontSize: "3.25rem",
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.03em",
                        marginBottom: "24px",
                    }}
                >{formTime}</div>
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