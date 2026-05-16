import { supabase } from '../supabaseClient';
import type { ProfileUpdate } from '../types';
import { logger } from './logger';

const profileLogger = logger.createContext('UserProfile');

/**
 * Updates or inserts a user's profile in the database.
 * @param userId The ID of the user to update.
 * @param profileData An object containing the profile data to update.
 * @returns The updated profile data.
 */
export async function updateUserProfile(
  userId: string,
  profileData: ProfileUpdate
): Promise<ProfileUpdate | null> {
  if (!userId) {
    profileLogger.error('User ID is missing.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...profileData, id: userId })
      .select()
      .single();

    if (error) {
      profileLogger.error('Error upserting user profile:', error);
      throw error;
    }

    profileLogger.info(`Successfully upserted profile for user ${userId}`);
    return data;
  } catch (error) {
    // Handle unexpected errors
    profileLogger.error('An unexpected error occurred while updating profile:', error);
    return null;
  }
}
