import { createContext, useContext, useState, type ReactNode } from "react";
import type { FrameContextType } from "../utils/types/frameTypes";

const FrameContext = createContext<FrameContextType | undefined>(undefined);

interface FrameProviderProps {
    children: ReactNode;
}

export const FrameProvider = ({ children }: FrameProviderProps) => {
    const [ frameMode, setFrameMode ] = useState<number>(0);

    const toggleFrameMode = () => {
        // just gonna have 5 frame modes
        // 4x speed
        // 2x speed
        // regular 1x
        // 0.5x speed
        // 0.25x speed
        if(frameMode >= 4){
            setFrameMode(0);
        } else {
            setFrameMode(prev => prev + 1);
        }
        
    }

    return (
        <FrameContext.Provider value={{ frameMode, toggleFrameMode }}>
            {children}
        </FrameContext.Provider>
    )
}

export const useFrameMode = () => {
    const context = useContext(FrameContext);

    if(!context){
        throw new Error("useFrameMode must be used within a FrameProvider");
    }

    return context;
}