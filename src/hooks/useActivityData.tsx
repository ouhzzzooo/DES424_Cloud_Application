import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useActivityData = (date?: string) => {
  const { user } = useAuth();
  const today = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['activity-daily', user?.id, today],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activity_daily')
        .select(`
          *,
          activity_types (
            id,
            name,
            icon
          )
        `)
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useActivityRange = (startDate: string, endDate: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity-range', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activity_daily')
        .select(`
          *,
          activity_types (
            id,
            name,
            icon
          )
        `)
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};
