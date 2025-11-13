import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Target, Trophy } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();

  const getIcon = (type: string) => {
    switch (type) {
      case 'goal_reminder':
        return Target;
      case 'achievement':
        return Trophy;
      default:
        return Bell;
    }
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const isRead = !!notification.read_at;
              return (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-opacity ${isRead ? 'opacity-60' : ''}`}
                  onClick={() => handleNotificationClick(notification.id, isRead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No notifications yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
