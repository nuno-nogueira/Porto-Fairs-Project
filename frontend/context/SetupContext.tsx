import React, {
    createContext,
    useContext,
    useState,
    ReactNode
} from 'react';

export type SetupRole = 'buyer' | 'seller';

interface SetupContextType {
    currentLocation: string;
    selectedCategories: string[];
    selectedRole: SetupRole | null;
    sellerDescription: string;

    setCurrentLocation: (location: string) => void;
    toggleCategory: (category: string) => void;
    setSelectedRole: (role: SetupRole) => void;
    setSellerDescription: (description: string) => void;
    resetSetup: () => void;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const SetupProvider = ({ children }: {children: ReactNode}) => {
    
    const [currentLocation, setCurrentLocation] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState<SetupRole | null>(null);
    const [sellerDescription, setSellerDescription] = useState('');

    const toggleCategory = (category: string) => {
        setSelectedCategories(current => 
            current.includes(category)
            ? current.filter(item => item !== category)
            : [...current, category]
        );
    };

    const resetSetup = () => {
        setCurrentLocation('');
        setSelectedCategories([]);
        setSelectedRole(null);
        setSellerDescription('');
    };

    return(
        <SetupContext.Provider
            value={{
                currentLocation,
                selectedCategories,
                selectedRole,
                sellerDescription,
                setCurrentLocation,
                toggleCategory,
                setSelectedRole,
                setSellerDescription,
                resetSetup
            }}
        >
            {children}
        </SetupContext.Provider>
    )
}

export const useSetup = () => {
    const context = useContext(SetupContext);

    if (!context) throw new Error('useSetup must be used inside SetupProvider');

    return context;
}

