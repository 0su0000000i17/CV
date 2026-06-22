'use client';

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';

type DashboardResumeSelectionContextValue = {
  selectedResumeId: string | null;
  setSelectedResumeId: Dispatch<SetStateAction<string | null>>;
};

const DashboardResumeSelectionContext =
  createContext<DashboardResumeSelectionContextValue | null>(null);

export function DashboardResumeSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      selectedResumeId,
      setSelectedResumeId,
    }),
    [selectedResumeId]
  );

  return (
    <DashboardResumeSelectionContext.Provider value={value}>
      {children}
    </DashboardResumeSelectionContext.Provider>
  );
}

export function useDashboardResumeSelection() {
  const context = useContext(DashboardResumeSelectionContext);

  if (!context) {
    throw new Error(
      'useDashboardResumeSelection must be used inside DashboardResumeSelectionProvider'
    );
  }

  return context;
}