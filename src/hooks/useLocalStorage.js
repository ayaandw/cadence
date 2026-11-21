import {useState, useEffect} from "react";

export function useLocalStorage(key, initialVal) {
    const [val, setVal] = useState(() => {
        if (typeof window === "undefined") {
            return typeof initialVal === "function" ? initialVal() : initialVal;
        }

        try {
            const saved = window.localStorage.getItem(key);
            if (saved !== null) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Cadence: failed to storage key "${key}"');
        }

        return typeof initialVal === "function" ? initialVal() : initialVal;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            window.localStorage.setItem(key, JSON.stringify(val));
        } catch (error) {
            console.warn('Cadence: failed to save storage key "${key}"', error);
        }
    }, [key, val]);

    return [val, setVal];
}