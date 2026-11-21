export function createTask({title, dueDate = "", totalMins = 60, chunkSize = 30}) {
    const dTitle = (title || "Untitled Task").trim();
    const safeMins = Math.max(15, Math.min(600, Number(totalMins) || 30));
    const safeChunkSize = Math.max(15, Math.min(90, Number(chunkSize) || 30));
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const task = {
        id,
        title: dTitle,
        dueDate,
        totalMins: safeMins,
        created: Date.now(),
    };

    const chunks = createChunks({
        taskId: id,
        title: dTitle,
        totalMins: safeMins,
        chunkSize: safeChunkSize,
    });
    return{task, chunks};
}

export function createChunks({taskID, title, totalMins, chunkSize = 30}) {
    const chunks = [];
    let remaining = Math.max(15, Number(totalMins) || 30);
    const step = Math.max(15, Number(chunkSize) || 30);
    let i = 1

    while(remaining > 0) {
        const duration = remaining <= step + 10 ? remaining : step;
        chunks.push({
            id: `${taskID}_c${i}`,
            taskID,
            title,
            part: index,
            label: `${title} · Block ${i}`,
            minutes: duration,
            completed: false,
            offset: 0,
        });
        remaining -= duration;
        i++;
    }

    if(chunks.length === 1) {
        chunks[0].label = title;
    }

    return chunks;
}

export function evaluateLoad(chunks, capMins, dayOffset = 0) {
    const cap = Math.max(15, Number(capMins) || 120);
    const dayChunks = chunks.filter((c) => c.dayOffset === dayOffset);
    const activeChunks = dayChunks.filter((c) => !c.completed);
    const compChunks = dayChunks.filter((c) => c.completed);

    const scheduledMins = activeChunks.reduce((sum, c) => sum + c.minutes, 0);
    const compMins = compChunks.reduce((sum, c) => sum + c.minutes, 0);
    const remainingCap = cap - scheduledMins;
    const ratio = scheduledMins / cap;

    let status = "balanced";
    if (ratio < 0.5) status = "light";
    else if (ratio > 1.15) status = "overloaded";
    else if (ratio > 0.9) status = "heavy";
    else status = "balanced";

    return {
        capMins : cap,
        scheduledMins,
        compMins,
        remainingCap,
        ratio,
        status,
        activeCount : activeChunks.length,
        compCount : compChunks.length,
    };
}

export function rebalance(chunks, capMins, dayOffset = 0) {
    const cap = Math.max(15, Number(capMins) || 120);
    let currentScheduled = chunks
        .filter((c) => c.dayOffset === dayOffset && !c.completed)
        .reduce((sum, c) => sum + c.minutes, 0);

    if (currentScheduled <= cap) {
        return {updatedChunks : chunks, deltaCount : 0, deltaMins : 0};
    }
    
    let deltaCount = 0;
    let deltaMins = 0;

    const reversed = [...chunks].reverse().map((chunk) => {
        if (currentScheduled > cap && chunk.dayOffset === dayOffset && !chunk.completed) {
            currentScheduled -= chunk.minutes;
            deltaCount += 1;
            deltaMins += chunk.minutes;
            return {
                ...chunk, dayOffset: chunk.dayOffset + 1,
            };
        }
        return chunk;
    });

    return {
        updatedChunks : reversed.reverse(),
        movedCount,
        movedMins,
    };
}

export function rolloverChunk(chunks, chunkId) {
    return chunks.map((chunk) =>
    chunk.id === chunkId
        ? {...chunk, dayOffset : (chunk.dayOffset || 0) + 1}
        :chunk
    );
}

export function formatMins(minutes) {
    const mins = Math.max(0, Math.round(Number(minutes) || 0));
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem === 0 ?`${hrs}h` : `${hrs}h ${rem}m`;
}