import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { NavigationState, PlanetData } from '../types';

interface NavigationContextValue {
  currentPage: NavigationState;
  navigateTo: (page: NavigationState) => void;
  goBack: () => void;
  navigateHome: () => void;
  navigateToOverseer: (id: string) => void;
  navigateToPlanets: (overseerId: string, universeId: string, universeName: string) => void;
  navigateToPlanetDetails: (
    planetId: string,
    overseerId: string,
    universeId: string,
    planetData: PlanetData
  ) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentPage, setCurrentPage] = useState<NavigationState>({ type: 'home' });
  const [history, setHistory] = useState<NavigationState[]>([]);

  const navigateTo = useCallback((page: NavigationState) => {
    setHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
  }, [currentPage]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const previousPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentPage(previousPage);
    } else {
      setCurrentPage({ type: 'home' });
    }
  }, [history]);

  const navigateHome = useCallback(() => {
    setHistory([]);
    setCurrentPage({ type: 'home' });
  }, []);

  const navigateToOverseer = useCallback((id: string) => {
    navigateTo({ type: 'overseer', id });
  }, [navigateTo]);

  const navigateToPlanets = useCallback((
    overseerId: string,
    universeId: string,
    universeName: string
  ) => {
    navigateTo({ type: 'planets', overseerId, universeId, universeName });
  }, [navigateTo]);

  const navigateToPlanetDetails = useCallback((
    planetId: string,
    overseerId: string,
    universeId: string,
    planetData: PlanetData
  ) => {
    navigateTo({ type: 'planet-details', planetId, overseerId, universeId, planetData });
  }, [navigateTo]);

  const value = useMemo(() => ({
    currentPage,
    navigateTo,
    goBack,
    navigateHome,
    navigateToOverseer,
    navigateToPlanets,
    navigateToPlanetDetails,
  }), [
    currentPage,
    navigateTo,
    goBack,
    navigateHome,
    navigateToOverseer,
    navigateToPlanets,
    navigateToPlanetDetails,
  ]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
