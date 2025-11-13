import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Activity, Home, Target, TrendingUp, Users, User, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth' && location.pathname !== '/') {
      navigate('/auth');
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { icon: Home, label: 'Home Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Activity', path: '/activity' },
    { icon: Target, label: 'My Goals', path: '/goals' },
    { icon: Users, label: 'Leaderboard', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const MenuContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-1">Profile: {user.email?.split('@')[0]}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        
        <Separator className="my-4" />
        
        <Link
          to="/friends"
          onClick={onItemClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
        >
          <Users className="h-5 w-5" />
          <span className="font-medium">Friends</span>
        </Link>
      </nav>
      
      <div className="p-4">
        <Button 
          onClick={() => {
            onItemClick?.();
            signOut();
          }} 
          variant="outline" 
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <MenuContent onItemClick={() => {}} />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold text-xl">ActTrack</span>
          </div>
          
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')}>
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
};
