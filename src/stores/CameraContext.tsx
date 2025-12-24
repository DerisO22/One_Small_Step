import { createContext, useContext, useState, type ReactNode } from "react";
import type { CameraContextType } from "../utils/types/cameraTypes";

const CameraContext = createContext<CameraContextType | undefined>(undefined);

interface CameraProviderProps {
    children: ReactNode,
}

export const CameraProvider = ({children}: CameraProviderProps) => {
    const [ cameraMode, setCameraMode ] = useState<number>(0);

    const toggleCameraMode = () => {
		if(cameraMode >= 2) {
			setCameraMode(0);
		} else {
            setCameraMode(prev => prev + 1);
        }
	};

    return (
        <CameraContext.Provider value={{cameraMode, toggleCameraMode}}>
            {children}
        </CameraContext.Provider>
    )
}

export const useCameraMode = () => {
    const context = useContext(CameraContext);

    if(!context){
        throw new Error("useCamera must be used within a CameraProvider");
    }
    return context;
}
