import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRound, Footprints, TrendingUp, Bike } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useActivityTypes } from '@/hooks/useActivityTypes';
import { useUpdateGoal } from '@/hooks/useUpdateGoal';
import { useGoals } from '@/hooks/useGoals';

const EditGoal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: activityTypes, isLoading: typesLoading } = useActivityTypes();
  const { data: activeGoals, isLoading: goalsLoading } = useGoals(true);
  const updateGoal = useUpdateGoal();
  
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [goalName, setGoalName] = useState('');
  const [targetTime, setTargetTime] = useState('00:30:00');
  const [repeatType, setRepeatType] = useState<'default' | 'repeat'>('default');
  const [repeatInterval, setRepeatInterval] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [deadline, setDeadline] = useState('');

  const activityIcons: Record<string, any> = {
    stand: UserRound,
    walk: Footprints,
    stairs: TrendingUp,
    bike: Bike,
  };

  // Load existing goal data
  useEffect(() => {
    if (activeGoals && id) {
      const goal = activeGoals.find((g) => g.id === id);
      if (goal) {
        setSelectedActivityId(goal.activity_type_id);
        setGoalName(goal.name);
        
        // Convert minutes to HH:MM:SS
        const hours = Math.floor(goal.target_minutes / 60);
        const minutes = goal.target_minutes % 60;
        setTargetTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
        
        setRepeatType(goal.repeat_type === 'none' ? 'default' : 'repeat');
        if (goal.repeat_type !== 'none') {
          setRepeatInterval(goal.repeat_type as 'daily' | 'weekly');
        }
        
        if (goal.end_date) {
          setDeadline(goal.end_date);
        }
      }
    }
  }, [activeGoals, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error('Goal ID not found');
      return;
    }

    if (!selectedActivityId) {
      toast.error('Please select an activity');
      return;
    }

    if (!goalName.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    // Parse time HH:MM:SS to minutes
    const [hours, minutes, seconds] = targetTime.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes + Math.round(seconds / 60);

    try {
      const finalRepeatType = repeatType === 'default' 
        ? 'none' 
        : repeatInterval === 'custom' 
          ? 'weekly' // Default custom to weekly
          : repeatInterval;

      await updateGoal.mutateAsync({
        id,
        name: goalName,
        target_minutes: totalMinutes,
        repeat_type: finalRepeatType as 'none' | 'daily' | 'weekly',
        repeat_interval: repeatType === 'repeat' ? 1 : undefined,
        end_date: deadline || undefined,
      });
      
      toast.success('Goal updated successfully!');
      navigate('/goals');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  if (goalsLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-48 mb-6" />
          <Card>
            <CardContent className="pt-6 space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit goal</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Activity Selection */}
              <div className="space-y-3">
                <Label>Select Activity</Label>
                {typesLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-28" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {activityTypes?.map((activity) => {
                      const Icon = activityIcons[activity.name] || UserRound;
                      return (
                        <button
                          key={activity.id}
                          type="button"
                          onClick={() => setSelectedActivityId(activity.id)}
                          className={`p-6 rounded-lg border-2 transition-all ${
                            selectedActivityId === activity.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-activity-card hover:border-primary/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className="h-10 w-10" />
                            <span className="font-medium capitalize">{activity.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Goal Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter goal name" 
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required 
                />
              </div>

              {/* Target Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time (HH:MM:SS)</Label>
                <Input 
                  id="time" 
                  type="time" 
                  step="1"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  required 
                />
              </div>

              {/* Repeat Type */}
              <div className="space-y-3">
                <Label>Type</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={repeatType === 'default' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setRepeatType('default')}
                  >
                    Default
                  </Button>
                  <Button
                    type="button"
                    variant={repeatType === 'repeat' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setRepeatType('repeat')}
                  >
                    Repeat
                  </Button>
                </div>
              </div>

              {/* Repeat Interval (shown when Repeat is selected) */}
              {repeatType === 'repeat' && (
                <div className="space-y-3">
                  <Label>Repeat Interval</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={repeatInterval === 'daily' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setRepeatInterval('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      type="button"
                      variant={repeatInterval === 'weekly' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setRepeatInterval('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button
                      type="button"
                      variant={repeatInterval === 'custom' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setRepeatInterval('custom')}
                    >
                      Custom
                    </Button>
                  </div>
                </div>
              )}

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input 
                  id="deadline" 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={updateGoal.isPending}>
                {updateGoal.isPending ? 'Updating...' : 'Update Goal'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
};

export default EditGoal;
