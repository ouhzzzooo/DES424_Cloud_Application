import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, Users, Target } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="inline-block">
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4">
              <Activity className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-hover">
            ActTrack
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Track your daily activities, set fitness goals, and compete with friends on your journey to a healthier lifestyle
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Track Activities</h3>
            <p className="text-muted-foreground">
              Monitor your standing, walking, stairs, and biking activities throughout the day
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Set Goals</h3>
            <p className="text-muted-foreground">
              Create personalized fitness goals and track your progress with daily, weekly, or custom targets
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Compete with Friends</h3>
            <p className="text-muted-foreground">
              Connect with friends and climb global, regional, and friend leaderboards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
