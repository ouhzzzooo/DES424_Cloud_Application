import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface GoalCardProps {
  icon: LucideIcon;
  name: string;
  progress: number;
  deadline?: string;
  status?: 'active' | 'completed' | 'failed';
  onEdit?: () => void;
  onDelete?: () => void;
}

export const GoalCard = ({ 
  icon: Icon, 
  name, 
  progress, 
  deadline, 
  status = 'active',
  onEdit,
  onDelete
}: GoalCardProps) => {
  const getStatusColor = () => {
    if (status === 'completed') return 'text-success';
    if (status === 'failed') return 'text-destructive';
    return deadline ? 'text-destructive' : 'text-muted-foreground';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-activity-card flex items-center justify-center flex-shrink-0">
          <Icon className="h-6 w-6 text-activity-icon" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold truncate">{name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
                {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive">Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Progress value={progress} className="h-2 mb-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{progress}% completed</span>
            {deadline && (
              <span className={getStatusColor()}>
                {status === 'completed' ? 'Finished: ' : status === 'failed' ? 'End: ' : 'Deadline: '}
                {deadline}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
