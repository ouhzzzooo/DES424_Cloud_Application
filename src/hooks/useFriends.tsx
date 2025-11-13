import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFriends = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get friendships where current user is either the requester or the recipient
      const { data, error } = await supabase
        .from('user_friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      
      // Get all friend IDs (could be in either column)
      const friendIds = data?.map(f => 
        f.user_id === user.id ? f.friend_user_id : f.user_id
      ) || [];
      
      if (friendIds.length === 0) return [];
      
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', friendIds);
        
      if (profileError) throw profileError;
      
      return data.map(friendship => {
        const friendId = friendship.user_id === user.id 
          ? friendship.friend_user_id 
          : friendship.user_id;
        
        return {
          ...friendship,
          friend: profiles?.find(p => p.id === friendId)
        };
      });
    },
    enabled: !!user,
  });
};

export const usePendingRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_friendships')
        .select('*')
        .eq('friend_user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      
      // Fetch requester profiles separately
      const requesterIds = data?.map(f => f.user_id) || [];
      if (requesterIds.length === 0) return [];
      
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .in('id', requesterIds);
        
      if (profileError) throw profileError;
      
      return data.map(friendship => ({
        ...friendship,
        requester: profiles?.find(p => p.id === friendship.user_id)
      }));
    },
    enabled: !!user,
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (friendEmail: string) => {
      if (!user) throw new Error('Not authenticated');

      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', friendEmail)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profiles) throw new Error('User not found');

      // Check if trying to add yourself
      if (profiles.id === user.id) {
        throw new Error('You cannot add yourself as a friend');
      }

      // Check if already friends or request exists
      const { data: existingFriendships } = await supabase
        .from('user_friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`);

      const existingFriendship = existingFriendships?.find(
        f => f.user_id === profiles.id || f.friend_user_id === profiles.id
      );

      if (existingFriendship) {
        throw new Error('Friend request already exists or you are already friends');
      }

      const { data, error } = await supabase
        .from('user_friendships')
        .insert({
          user_id: user.id,
          friend_user_id: profiles.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { data, error } = await supabase
        .from('user_friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
  });
};

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('user_friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('user_friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};
