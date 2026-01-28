import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'Terracota' | 'Lavanda' | 'Sage' | 'Durazno';

export const colorThemes = {
  Terracota: {
    name: "Terracota",
    primary: "#a85a3a",
    description: "Cálido y acogedor",
    background: "#ffffff",
    foreground: "#1a1a1a",
    card: "#f5f5f5",
    border: "#e5e5e5",
    mutedForeground: "#7a7a7a",
  },
  Lavanda: {
    name: "Lavanda",
    primary: "#7F72C2",
    description: "Suave y relajante",
    background: "#ffffff",
    foreground: "#1a1a1a",
    card: "#f5f5f5",
    border: "#e5e5e5",
    mutedForeground: "#7a7a7a",
  },
  Sage: {
    name: "Sage",
    primary: "#4A8A5A",
    description: "Natural y sereno",
    background: "#ffffff",
    foreground: "#1a1a1a",
    card: "#f5f5f5",
    border: "#e5e5e5",
    mutedForeground: "#7a7a7a",
  },
  Durazno: {
    name: "Durazno",
    primary: "#D17236",
    description: "Dulce y amigable",
    background: "#ffffff",
    foreground: "#1a1a1a",
    card: "#f5f5f5",
    border: "#e5e5e5",
    mutedForeground: "#7a7a7a",
  },
};

interface ThemeContextType {
  selectedTheme: ThemeName;
  applyTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('Terracota');

  const applyTheme = async (theme: ThemeName) => {
    setSelectedTheme(theme);
    try {
      await AsyncStorage.setItem('selectedTheme', theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('selectedTheme');
        if (savedTheme && Object.keys(colorThemes).includes(savedTheme)) {
          setSelectedTheme(savedTheme as ThemeName);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ selectedTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};