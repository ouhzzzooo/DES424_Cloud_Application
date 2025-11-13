import { AppLayout } from '@/components/AppLayout';
import { GoalCard } from '@/components/GoalCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Footprints, UserRound, TrendingUp, Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoals } from '@/hooks/useGoals';
import { useDeleteGoal } from '@/hooks/useUpdateGoal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const activityIcons: Record<string, any> = {
  stand: UserRound,
  walk: Footprints,
  stairs: TrendingUp,
  bike: Bike,
};

const Goals = () => {
  const navigate = useNavigate();
  const { data: activeGoals, isLoading: activeLoading } = useGoals(true);
  const { data: inactiveGoals, isLoading: inactiveLoading } = useGoals(false);
  const deleteGoal = useDeleteGoal();

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal.mutateAsync(goalId);
      toast.success('Goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="in-progress" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <Button onClick={() => navigate('/goals/new')}>Add new goal</Button>
          </div>

          <TabsContent value="in-progress" className="space-y-3">
            <h2 className="text-2xl font-bold mb-4">My goals</h2>
            {activeLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <>
                {activeGoals?.map((goal) => {
                  const todayProgress = goal.user_goal_progress?.find(
                    (p: any) => p.date === new Date().toISOString().split('T')[0]
                  );
                  const progress = todayProgress 
                    ? Math.round((todayProgress.achieved_minutes / goal.target_minutes) * 100)
                    : 0;

                  return (
                    <GoalCard 
                      key={goal.id} 
                      icon={activityIcons[goal.activity_types?.name || 'walk'] || Footprints}
                      name={goal.name}
                      progress={progress}
                      deadline={new Date(goal.end_date || goal.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      status="active"
                      onEdit={() => navigate(`/goals/edit/${goal.id}`)}
                      onDelete={() => handleDelete(goal.id)}
                    />
                  );
                })}
                {activeGoals?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No active goals. Create your first goal!
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            <h2 className="text-2xl font-bold mb-4">My goals</h2>
            {inactiveLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <>
                {inactiveGoals?.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    icon={activityIcons[goal.activity_types?.name || 'walk'] || Footprints}
                    name={goal.name}
                    progress={100}
                    deadline={new Date(goal.end_date || goal.start_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    status="completed"
                  />
                ))}
                {inactiveGoals?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No completed goals yet
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Goals;
