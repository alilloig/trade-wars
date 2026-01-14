import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
      {children}
    </main>
  );
}
