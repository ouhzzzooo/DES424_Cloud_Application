import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();

  const [inactivityAlerts, setInactivityAlerts] = useState(true);
  const [goalReminders, setGoalReminders] = useState(false);
  const [achievementAlerts, setAchievementAlerts] = useState(false);
  
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    field: 'name' | 'weight' | 'height' | 'dob' | 'sex';
    value: string;
  }>({ open: false, field: 'name', value: '' });

  useEffect(() => {
    if (settings) {
      setInactivityAlerts(settings.inactivity_alerts ?? true);
      setGoalReminders(settings.goal_reminders ?? true);
      setAchievementAlerts(settings.achievement_alerts ?? true);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        inactivity_alerts: inactivityAlerts,
        goal_reminders: goalReminders,
        achievement_alerts: achievementAlerts,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleEditClick = (field: 'name' | 'weight' | 'height' | 'dob' | 'sex') => {
    let currentValue = '';
    switch (field) {
      case 'name':
        currentValue = profile?.display_name || '';
        break;
      case 'weight':
        currentValue = profile?.weight_kg?.toString() || '';
        break;
      case 'height':
        currentValue = profile?.height_cm?.toString() || '';
        break;
      case 'dob':
        currentValue = profile?.date_of_birth || '';
        break;
      case 'sex':
        currentValue = profile?.sex || '';
        break;
    }
    setEditDialog({ open: true, field, value: currentValue });
  };

  const handleSaveProfile = async (value: any) => {
    try {
      const updates: any = {};
      switch (editDialog.field) {
        case 'name':
          updates.display_name = value;
          break;
        case 'weight':
          updates.weight_kg = parseFloat(value);
          break;
        case 'height':
          updates.height_cm = parseFloat(value);
          break;
        case 'dob':
          updates.date_of_birth = value;
          break;
        case 'sex':
          updates.sex = value;
          break;
      }
      await updateProfile.mutateAsync(updates);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Name</Label>
                <Button variant="ghost" size="sm" onClick={() => handleEditClick('name')}>Edit</Button>
              </div>
              {profileLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input value={profile?.display_name || 'Not set'} disabled />
              )}
            </div>

            {/* Physical Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Weight</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleEditClick('weight')}>Edit</Button>
                </div>
                {profileLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input value={profile?.weight_kg ? `${profile.weight_kg} kg` : 'Not set'} disabled />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Height</Label>
                  <Button variant="ghost" size="sm" onClick={() => handleEditClick('height')}>Edit</Button>
                </div>
                {profileLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input value={profile?.height_cm ? `${profile.height_cm} cm` : 'Not set'} disabled />
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Date of birth</Label>
                <Button variant="ghost" size="sm" onClick={() => handleEditClick('dob')}>Edit</Button>
              </div>
              {profileLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input value={formatDate(profile?.date_of_birth)} disabled />
              )}
            </div>

            {/* Sex */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sex</Label>
                <Button variant="ghost" size="sm" onClick={() => handleEditClick('sex')}>Edit</Button>
              </div>
              {profileLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input value={profile?.sex || 'Not set'} disabled />
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email</Label>
                <Button variant="ghost" size="sm">verify</Button>
              </div>
              <Input defaultValue={user?.email || ''} disabled />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Button className="w-full" variant="secondary">
                Change password
              </Button>
            </div>

            {/* Link Google Account */}
            <Button className="w-full" variant="outline">
              Link with google account
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Notification Setting</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="inactivity" className="text-base">Inactivity Alerts</Label>
                <Switch 
                  id="inactivity"
                  checked={inactivityAlerts}
                  onCheckedChange={setInactivityAlerts}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="goal-reminders" className="text-base">Goal Reminders</Label>
                <Switch 
                  id="goal-reminders"
                  checked={goalReminders}
                  onCheckedChange={setGoalReminders}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="achievement" className="text-base">Achievement Alerts</Label>
                <Switch 
                  id="achievement"
                  checked={achievementAlerts}
                  onCheckedChange={setAchievementAlerts}
                />
              </div>
            </div>

            <Button className="w-full mt-6" onClick={handleSave}>
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <EditProfileDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
          field={editDialog.field}
          currentValue={editDialog.value}
          onSave={handleSaveProfile}
        />
      </div>
    </AppLayout>
  );
};

export default Profile;
