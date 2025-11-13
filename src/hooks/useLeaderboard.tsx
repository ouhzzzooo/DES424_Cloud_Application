import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_seconds: number;
  rank: number | null;
  user_profiles: {
    display_name: string | null;
  };
}

export const useLeaderboard = (
  timeRange: string,
  scope: string,
  activityTypeId: string | null
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leaderboard', timeRange, scope, activityTypeId, user?.id],
    queryFn: async () => {
      // If scope is 'friend', first get the user's friend IDs
      let friendIds: string[] = [];
      if (scope === 'friend' && user) {
        const { data: friendships, error: friendError } = await supabase
          .from('user_friendships')
          .select('user_id, friend_user_id')
          .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (friendError) throw friendError;

        friendIds = friendships?.map(f => 
          f.user_id === user.id ? f.friend_user_id : f.user_id
        ) || [];

        // If no friends, return empty array
        if (friendIds.length === 0) return [];
      }

      let query = supabase
        .from('leaderboard')
        .select(`
          id,
          user_id,
          total_seconds,
          rank,
          user_profiles (
            display_name
          )
        `)
        .eq('time_period', timeRange)
        .eq('scope', 'global') // Always query from global, filter by friends below
        .order('total_seconds', { ascending: false })
        .limit(10);

      if (activityTypeId && activityTypeId !== 'all') {
        query = query.eq('activity_type_id', activityTypeId);
      }

      // If friend scope, filter by friend IDs
      if (scope === 'friend' && friendIds.length > 0) {
        query = query.in('user_id', friendIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });
};
