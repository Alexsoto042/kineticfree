// src/components/social/FriendSuggestions.tsx
import React from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { Button } from '../ui/Button/Button';

interface UserSearchResult {
  id: string;
  username: string;
  avatar_url: string;
}

interface FriendSuggestionsProps {
  suggestions: UserSearchResult[];
  handleAddFriend: (friendId: string) => void;
}

const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({ suggestions, handleAddFriend }) => {
  return (
    <div className="friend-suggestions-container">
      <h2>Sugerencias de Amigos</h2>
      {suggestions.length === 0 ? (
        <p className="empty-state-message">No hay sugerencias de amigos en este momento.</p>
      ) : (
        <div className="friend-suggestions-list">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="friend-card">
              <img src={suggestion.avatar_url || '/images/default-avatar.svg'} alt={suggestion.username} className="friend-card__avatar" />
              <div className="friend-card__info">
                <span className="friend-card__username">{suggestion.username}</span>
              </div>
              <div className="friend-card__actions">
                <Button onClick={() => handleAddFriend(suggestion.id)} variant="primary">
                  <FaUserPlus />
                  Añadir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendSuggestions;
