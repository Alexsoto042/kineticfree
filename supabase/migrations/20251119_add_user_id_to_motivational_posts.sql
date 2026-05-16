ALTER TABLE motivational_posts
ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Optional: Add a policy to allow users to insert/update/delete their own posts
CREATE POLICY "Allow users to manage their own motivational posts"
ON motivational_posts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
