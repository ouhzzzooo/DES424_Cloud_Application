import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRound, Footprints, TrendingUp, Bike } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useActivityTypes } from '@/hooks/useActivityTypes';
import { useCreateGoal } from '@/hooks/useCreateGoal';

const NewGoal = () => {
  const navigate = useNavigate();
  const { data: activityTypes, isLoading } = useActivityTypes();
  const createGoal = useCreateGoal();
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      await createGoal.mutateAsync({
        activity_type_id: selectedActivityId,
        name: goalName,
        target_minutes: totalMinutes,
        repeat_type: finalRepeatType as 'none' | 'daily' | 'weekly',
        repeat_interval: repeatType === 'repeat' ? 1 : undefined,
        end_date: deadline || undefined,
      });
      
      toast.success('Goal created successfully!');
      navigate('/goals');
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add new goal</h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Activity Selection */}
              <div className="space-y-3">
                <Label>Select Activity</Label>
                {isLoading ? (
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
              <Button type="submit" className="w-full" size="lg">
                Submit
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
};

export default NewGoal;
