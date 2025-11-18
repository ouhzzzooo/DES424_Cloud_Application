import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityData, useActivityRange } from '@/hooks/useActivityData';
import { Skeleton } from '@/components/ui/skeleton';

const Activity = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  const monthStart = new Date();
  monthStart.setMonth(monthStart.getMonth() - 1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  const { data: dayData, isLoading: dayLoading } = useActivityData(today);
  const { data: weekData, isLoading: weekLoading } = useActivityRange(weekStartStr, today);
  const { data: monthData, isLoading: monthLoading } = useActivityRange(monthStartStr, today);

  const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

  const ACTIVITY_ORDER = ['bike', 'stairs', 'stand', 'walk'];

  type AggregatedActivity = {
    name: string;
    seconds: number;
  };

  // Aggregate and return in fixed order
  const aggregateByActivity = (data: any[]): AggregatedActivity[] => {
    const totals: Record<string, number> = {};

    data?.forEach((item) => {
      const rawName = item.activity_types?.name || 'Unknown';
      const key = rawName.toLowerCase(); // normalize
      totals[key] = (totals[key] || 0) + item.total_seconds;
    });

    return ACTIVITY_ORDER
      .filter((key) => totals[key] != null)
      .map((key) => ({
        name: key,
        seconds: totals[key],
      }));
  };

  // Optional: simple capitalize helper for display
  const labelFromKey = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Activity</h1>

        <Tabs defaultValue="day" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>

          <TabsContent value="day">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {dayLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="space-y-4">
                    {aggregateByActivity(dayData || []).map(({ name, seconds }) => (
                      <div
                        key={name}
                        className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg"
                      >
                        <p className="font-semibold capitalize">{labelFromKey(name)}</p>
                        <p className="text-lg font-bold">{formatDuration(seconds)}</p>
                      </div>
                    ))}

                    {dayData?.length === 0 && (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No activity recorded today
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {weekLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="space-y-4">
                    {aggregateByActivity(weekData || []).map(({ name, seconds }) => (
                      <div
                        key={name}
                        className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg"
                      >
                        <p className="font-semibold capitalize">{labelFromKey(name)}</p>
                        <p className="text-lg font-bold">{formatDuration(seconds)}</p>
                      </div>
                    ))}

                    {weekData?.length === 0 && (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No activity recorded this week
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {monthLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="space-y-4">
                    {aggregateByActivity(monthData || []).map(({ name, seconds }) => (
                      <div
                        key={name}
                        className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg"
                      >
                        <p className="font-semibold capitalize">{labelFromKey(name)}</p>
                        <p className="text-lg font-bold">{formatDuration(seconds)}</p>
                      </div>
                    ))}

                    {monthData?.length === 0 && (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No activity recorded this month
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Activity;
