import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ActivityCardProps {
  icon: LucideIcon;
  label: string;
  duration: string;
}

export const ActivityCard = ({ icon: Icon, label, duration }: ActivityCardProps) => {
  return (
    <Card className="p-6 bg-activity-card border-none hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center gap-3">
        <Icon className="h-12 w-12 text-activity-icon" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{duration}</p>
      </div>
    </Card>
  );
};
