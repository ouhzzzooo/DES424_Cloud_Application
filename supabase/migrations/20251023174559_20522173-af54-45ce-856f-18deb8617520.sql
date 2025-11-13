-- Update the delete policy for user_friendships to allow both users to delete
DROP POLICY IF EXISTS "Users can delete own friendships" ON user_friendships;

CREATE POLICY "Users can delete own friendships" 
ON user_friendships 
FOR DELETE 
USING ((auth.uid() = user_id) OR (auth.uid() = friend_user_id));