import { OverseerEmpire } from '../components/overseer';

interface OverseerPageProps {
  overseerId: string;
}

export function OverseerPage({ overseerId }: OverseerPageProps) {
  return <OverseerEmpire overseerId={overseerId} />;
}
