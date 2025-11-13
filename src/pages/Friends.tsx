import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  useFriends,
  usePendingRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend,
} from '@/hooks/useFriends';

const Friends = () => {
  const [searchEmail, setSearchEmail] = useState('');
  
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: pendingRequests, isLoading: pendingLoading } = usePendingRequests();
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const removeFriend = useRemoveFriend();

  const handleAddFriend = async () => {
    if (searchEmail) {
      try {
        await sendRequest.mutateAsync(searchEmail);
        toast.success('Friend request sent!');
        setSearchEmail('');
      } catch (error) {
        toast.error('Failed to send friend request');
      }
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest.mutateAsync(requestId);
      toast.success('Friend request accepted!');
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineRequest.mutateAsync(requestId);
      toast.success('Friend request declined');
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const handleRemove = async (friendshipId: string) => {
    try {
      await removeFriend.mutateAsync(friendshipId);
      toast.success('Friend removed');
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Friends</h1>

        {/* Add Friend Section */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Add Friends</h2>
            <div className="flex gap-3">
              <Input
                placeholder="Enter email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddFriend}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingLoading ? (
          <Skeleton className="h-32" />
        ) : (
          pendingRequests && pendingRequests.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{request.requester?.display_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAccept(request.id)}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDecline(request.id)}>Decline</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}

        {/* Friends List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Friends List</h2>
          {friendsLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <div className="space-y-3">
              {friends?.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{friend.friend?.display_name}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRemove(friend.id)}>Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {friends?.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No friends yet. Add some friends to get started!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Friends;
