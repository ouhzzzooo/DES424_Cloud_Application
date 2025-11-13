import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CreateGoalData {
  activity_type_id: string;
  name: string;
  target_minutes: number;
  repeat_type: 'none' | 'daily' | 'weekly';
  repeat_interval?: number;
  end_date?: string;
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (goalData: CreateGoalData) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          ...goalData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};
