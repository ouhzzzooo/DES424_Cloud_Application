import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRound, Footprints, TrendingUp, Bike } from 'lucide-react';
import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useActivityTypes } from '@/hooks/useActivityTypes';

const Leaderboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedActivity, setSelectedActivity] = useState<string | null>('all');
  const [scope, setScope] = useState('global');
  
  const { data: activityTypes } = useActivityTypes();
  
  // Get the activity type ID for the selected activity
  const selectedActivityId =
  selectedActivity === 'all'
    ? null
    : activityTypes?.find(
        (a) =>
          a.name.toLowerCase() === selectedActivity?.toLowerCase()
      )?.id ?? null;

  const { data: leaderboardData, isLoading } = useLeaderboard(
    timeRange,
    scope,
    selectedActivityId
  );

  const activities = [
    { icon: UserRound, label: 'Stand', value: 'stand' },
    { icon: Footprints, label: 'Walk', value: 'walk' },
    { icon: TrendingUp, label: 'Stairs', value: 'stairs' },
    { icon: Bike, label: 'Bike', value: 'bike' },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ActivityFilters = () => (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => setSelectedActivity('all')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedActivity === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-activity-card hover:bg-primary/10'
        }`}
      >
        All
      </button>
      {activities.map((activity) => (
        <button
          key={activity.value}
          onClick={() => setSelectedActivity(activity.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedActivity === activity.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-activity-card hover:bg-primary/10'
          }`}
        >
          <activity.icon className="h-4 w-4" />
          {activity.label}
        </button>
      ))}
    </div>
  );

  const LeaderboardList = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!leaderboardData || leaderboardData.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No leaderboard data available for this selection.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {leaderboardData.map((entry, index) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-muted-foreground w-8">
                    {index + 1}.
                  </span>
                  <span className="font-semibold">
                    {entry.user_profiles?.display_name || 'Anonymous'}
                  </span>
                </div>
                <span className="font-mono font-semibold">{formatTime(entry.total_seconds)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="all-time">All-time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="global" className="w-full" onValueChange={setScope}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
            <TabsTrigger value="friend">Friend</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <ActivityFilters />
            <LeaderboardList />
          </TabsContent>

          <TabsContent value="regional">
            <ActivityFilters />
            <LeaderboardList />
          </TabsContent>

          <TabsContent value="friend">
            <ActivityFilters />
            <LeaderboardList />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
