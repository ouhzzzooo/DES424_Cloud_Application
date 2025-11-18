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
      // 1) Friend scope: collect friend IDs
      let friendIds: string[] = [];
      if (scope === 'friend' && user) {
        const { data: friendships, error: friendError } = await supabase
          .from('user_friendships')
          .select('user_id, friend_user_id')
          .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (friendError) throw friendError;

        friendIds =
          friendships?.map(f =>
            f.user_id === user.id ? f.friend_user_id : f.user_id
          ) || [];

        if (friendIds.length === 0) return [];
      }

      // 2) Base query: one row per (user, activity_type)
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
        .eq('scope', 'global')
        .order('total_seconds', { ascending: false })
        .limit(100); // a bit higher so "All" has room to merge

      if (activityTypeId && activityTypeId !== 'all') {
        query = query.eq('activity_type_id', activityTypeId);
      }

      if (scope === 'friend' && friendIds.length > 0) {
        query = query.in('user_id', friendIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data || []) as LeaderboardEntry[];

      // 3) If "All" activities → merge rows per user_id and sum total_seconds
      if (!activityTypeId || activityTypeId === 'all') {
        const byUser = new Map<string, LeaderboardEntry>();

        for (const row of rows) {
          const existing = byUser.get(row.user_id);
          if (existing) {
            existing.total_seconds += row.total_seconds;
          } else {
            // clone so we don't mutate TanStack cache accidentally
            byUser.set(row.user_id, { ...row });
          }
        }

        const merged = Array.from(byUser.values()).sort(
          (a, b) => b.total_seconds - a.total_seconds
        );

        return merged;
      }

      // 4) For a specific activity type, just return rows as-is
      return rows;
    },
  });
};