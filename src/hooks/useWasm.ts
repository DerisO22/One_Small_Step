import { useEffect, useState } from 'react'

interface WasmModule {
    add?: (a: number, b: number) => number
    // Add other exported functions here
}

export function useWasm(wasmPath: string) {
    const [wasm, setWasm] = useState<WasmModule | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const loadWasm = async () => {
        try {
            const response = await fetch(wasmPath)
            const buffer = await response.arrayBuffer()
            const wasmModule = await WebAssembly.instantiate(buffer, {})
            setWasm(wasmModule.instance.exports as WasmModule)
            setLoading(false)
        } catch (err) {
            setError(err as Error)
            setLoading(false)
        }
        }

        loadWasm()
    }, [wasmPath])

    return { wasm, loading, error }
}