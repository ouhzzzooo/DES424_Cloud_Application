import { AppLayout } from '@/components/AppLayout';
import { ActivityCard } from '@/components/ActivityCard';
import { GoalCard } from '@/components/GoalCard';
import { UserRound, Footprints, TrendingUp, Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActivityData } from '@/hooks/useActivityData';
import { useGoals } from '@/hooks/useGoals';
import { Skeleton } from '@/components/ui/skeleton';

const activityIcons: Record<string, any> = {
  stand: UserRound,
  walk: Footprints,
  stairs: TrendingUp,
  bike: Bike,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: activityData, isLoading: activityLoading } = useActivityData();
  const { data: goals, isLoading: goalsLoading } = useGoals(true);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hour ${minutes} min`;
  };

  const activeGoals = goals?.slice(0, 3) || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Home Dashboard</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

        {/* Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {activityData?.map((activity) => (
                  <ActivityCard 
                    key={activity.id}
                    icon={activityIcons[activity.activity_types?.name || 'walk'] || Footprints}
                    label={activity.activity_types?.name || 'Unknown'}
                    duration={formatDuration(activity.total_seconds)}
                  />
                ))}
                {activityData?.length === 0 && (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    No activity recorded today
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Goals</h2>
            <Button onClick={() => navigate('/goals')}>View All</Button>
          </div>
          
          {goalsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
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
                    onEdit={() => navigate('/goals')}
                    onDelete={() => {}}
                  />
                );
              })}
              {activeGoals.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No active goals. Create one to get started!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
