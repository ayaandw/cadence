import {useEffect, useRef, useState} from "react";
import {CaretsToAxisDashedHorizontal, RotateCcw} from "lucide-react";
const GRID = 15;
const CELL = 16;
const FULL = GRID * CELL;

export function SnakeBreak() {
    const cavasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false)
    const [runID, setRunID] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const styles = getComputedStyle(document.documentElement);
        const bg = styles.getPropertyValue("--surface-subtle").trim() || "#f1efe9";
        const accent = styles.getPropertyValue("--accent").trim() || "#d95d1e";
        const text = styles.getProppertyValue("--text").trim() || "#1c1b18";

        //snake stuff
        let snake = [
            {x: 7, y: 7},
            {x: 6, y: 7},
            {x: 5, y: 7},
        ];
        let dir = {x: 1, y: 0};
        let moveDir = {x: 1, y: 0};
        let food = {x: 11, y: 7};
        let alive = true;
        setScore(0);
        setGameOver(false);

        function spawnFood() {
            let randSquare;
            do {
                randSquare = {
                    x: Math.floor(Math.random() * GRID),
                    y: Math.floor(Math.random() * GRID),
                };
            } while (snake.some((s) => s.x === randSquare.x && s.y === randSquare.y));
            food = randSquare;
        }

        function onPress(e) {
            const key = e.key.toLowerCase();
            if ((key === "arrowup" || key === "w") && dir.y === 0) moveDir = {x: 0, y: -1};
            if ((key === "arrowdown" || key === "s") && dir.y === 0) moveDir = {x: 0, y: 1};
            if ((key === "arrowleft" || key === "a") && dir.x === 0) moveDir = {x: -1, y: 0};
            if ((key === "arrowright" || key === "d") && dir.x === 0) moveDir = {x: 1, y: 0};
            if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
                e.preventDefault();
            }
        }
        window.addEventListener("keydown", onKeyDown);

        function draw() {
            ctx.fillStyle  = bg;
            ctx.fillRect(0, 0, FULL, FULL);

            ctx.fillStyle = text;
            ctx.beginPath();
            ctx.arc(
                food.x * CELL + CELL / 2,
                food.y * CELL + CELL / 2,
                CELL * 0.34,
                0,
                Math.PI * 2
            );
            ctx.fill();

            snake.forEach((seg, i) => {
                ctx.fillStyle = accent;
                ctx.globalAlpha = i === 0 ? 1 : Math.max(0.45, 1 - i * 0.04);
                ctx.beginPath();
                ctx.roundRect(seg.x * CELL + 1.5, seg.y * CELL + 1.5, CELL - 3, CELL - 3, 5);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
        draw();

        const tick = window.setInterval(() => {
            if (!alive) return;
            dir = moveDir;
            const head = {
                x: (snake[0].x + dir.x + GRID) % GRID,
                y: (snake[0].y + dir.y + GRID) % GRID,
            };

            if (snake.some((s) => s.x === head.x && s.y === head.y)) {
                alive = false;
                setGameOver(true);
                return;
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                setScore((s) => s + 1);
                spawnFood();
            } else {
                snake.pop();
            } draw();
        }, 135);

        return () => {
            window.clearInterval(tick);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [runId]);

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "20px"}}>
            <div style={{fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600}}>
                Score: <span style={{color: "var(--text)"}}>{score}</span> · Arrow keys / WASD
            </div>

            <div style={{position: "relative", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border)"}}>
                <canvas ref={canvasRef} width={FULL} height={FULL} style={{display: "block"}}/>
                {gameOver && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.45)",
                            backdropFilter: "blur(3px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            color: "#ffffff"
                        }}
                    >
                        <span style={{fontWeight: 700, fontSize: "1rem"}}>Oops! Score: {score}</span>
                        <button
                            type = "button"
                            className = "btn btn-primary"
                            style = {{padding: "7px 14px", fontSize: "0.82rem"}}
                            onClick = {() => setRunID((r) => r + 1)}
                        >
                            <RotateCcw size={14}/>
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}