-- Drop the old function first, specifying the parameter types to identify it
DROP FUNCTION IF EXISTS public.toggle_like(integer, uuid);

-- Create the new function with the corrected parameter names AND SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.toggle_like(p_post_id integer, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS policies
AS $$
BEGIN
    -- Using SECURITY DEFINER is necessary because the user liking the post
    -- is likely not the owner of the post, and an RLS policy would
    -- otherwise prevent them from updating the 'likes' and 'liked_by' columns.
    
    -- This function is safe because it only modifies the like count and array
    -- in a predictable way, without exposing any sensitive data.
    
    UPDATE public.motivational_posts
    SET
        -- Use a CASE statement to add or remove the user from the liked_by array in a single operation
        liked_by = (
            CASE
                WHEN p_user_id = ANY(liked_by) THEN array_remove(liked_by, p_user_id)
                ELSE array_append(liked_by, p_user_id)
            END
        ),
        -- Concurrently, update the likes count based on the same condition
        likes = (
            CASE
                WHEN p_user_id = ANY(liked_by) THEN likes - 1
                ELSE likes + 1
            END
        )
    WHERE id = p_post_id;
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION public.toggle_like(integer, uuid) TO authenticated;