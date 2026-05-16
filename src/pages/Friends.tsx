import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useToasts } from '../hooks/useToasts';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import FriendList from '../components/social/FriendList';
import FriendSuggestions from '../components/social/FriendSuggestions';
import FriendSearch from '../components/social/FriendSearch';
import './Friends.css';
import '../components/social/Social.css';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  status: string;
}

interface UserSearchResult {
  id: string;
  username: string;
  avatar_url: string;
}

const Friends: React.FC = () => {
  const { showSuccessToast, showErrorToast } = useToasts();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchFriendsAndSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to use RPC function first
      let friendsData = null;
      let friendsError = null;

      try {
        const friendsResponse = await supabase.rpc('get_friends', { p_user_id: user.id });
        friendsData = friendsResponse.data;
        friendsError = friendsResponse.error;
      } catch (rpcError) {
        console.warn('RPC get_friends not available, using direct query:', rpcError);
        
        // Fallback: Query friends table directly
        const { data: friendsFromTable, error: tableError } = await supabase
          .from('friends')
          .select(`
            id,
            user_id,
            friend_id,
            status,
            friend:profiles!friends_friend_id_fkey(id, username, avatar_url),
            user:profiles!friends_user_id_fkey(id, username, avatar_url)
          `)
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        if (tableError) throw tableError;

        // Transform data to match expected format
        friendsData = (friendsFromTable || []).map((f: any) => {
          const isUserSender = f.user_id === user.id;
          const friendProfile = isUserSender ? f.friend : f.user;
          const status = isUserSender ? f.status : (f.status === 'pending' ? 'requested' : f.status);
          
          return {
            id: friendProfile.id,
            username: friendProfile.username,
            avatar_url: friendProfile.avatar_url,
            status: status
          };
        });
      }

      if (friendsError) throw friendsError;
      
      console.log('Friends data:', friendsData);
      setFriends(friendsData || []);

      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', user.id)
        .limit(5);

      if (suggestionsError) throw suggestionsError;

      const friendIds = new Set((friendsData || []).map((f: Friend) => f.id));
      const filteredSuggestions = (suggestionsData || []).filter(s => !friendIds.has(s.id));
      setSuggestions(filteredSuggestions);

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriendsAndSuggestions();
  }, [fetchFriendsAndSuggestions]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (e) {
      showErrorToast('Error searching for users.');
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, showErrorToast]);

  const handleAddFriend = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if friendship already exists (in either direction)
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing friendship:', checkError);
        throw checkError;
      }

      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          showErrorToast('Ya son amigos.');
        } else if (existingFriendship.status === 'pending') {
          showErrorToast('Ya enviaste una solicitud a este usuario.');
        } else {
          showErrorToast('Ya existe una solicitud de amistad pendiente.');
        }
        return;
      }

      // Insert only ONE record with status 'pending'
      // RLS policy only allows inserting where auth.uid() = user_id
      // The friend will see this request through the get_friends function
      const { error } = await supabase.from('friends').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });

      if (error) {
        console.error('Error adding friend:', error);
        throw error;
      }
      
      showSuccessToast('Solicitud de amistad enviada!');
      fetchFriendsAndSuggestions();
    } catch (e) {
      console.error('Error in handleAddFriend:', e);
      showErrorToast('Error al enviar solicitud de amistad.');
    }
  };

  const handleAcceptFriend = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update BOTH friendship records to 'accepted'
      // This ensures both users see each other as accepted friends
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;
      showSuccessToast('Amistad aceptada!');
      fetchFriendsAndSuggestions();
    } catch (e) {
      showErrorToast('Error al aceptar solicitud de amistad.');
    }
  };

  const handleRejectFriend = async (friendId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete BOTH friendship records
      // This ensures the friendship is completely removed for both users
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;
      showSuccessToast('Solicitud de amistad rechazada.');
      fetchFriendsAndSuggestions();
    } catch (e) {
      showErrorToast('Error al rechazar solicitud de amistad.');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Cargando amigos..." />;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="friends-container">
      <h1 className="friends-header">Amigos</h1>
      <div className="friends-layout">
        <div className="friends-main-content">
          <FriendList friends={friends} handleAcceptFriend={handleAcceptFriend} handleRejectFriend={handleRejectFriend} />
        </div>
        <div className="friends-sidebar">
          <FriendSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} isSearching={isSearching} />
          {searchResults.length > 0 && (
            <div className="search-results">
              <h2>Resultados de búsqueda</h2>
              {searchResults.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <img src={friend.avatar_url || '/images/default-avatar.svg'} alt={friend.username} className="friend-avatar" />
                  <span>{friend.username}</span>
                  <button onClick={() => handleAddFriend(friend.id)}>Añadir</button>
                </div>
              ))}
            </div>
          )}
          <FriendSuggestions suggestions={suggestions} handleAddFriend={handleAddFriend} />
        </div>
      </div>
    </div>
  );
};

export default Friends;
