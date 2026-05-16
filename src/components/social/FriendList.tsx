import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCheck, FaUserClock, FaUserPlus } from 'react-icons/fa';
import { Users } from 'lucide-react';
import { Button } from '../ui/Button/Button';
import { EmptyState } from '../ui/EmptyState';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  status: string;
}

interface FriendListProps {
  friends: Friend[];
  handleAcceptFriend: (friendId: string) => void;
  handleRejectFriend: (friendId: string) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friends, handleAcceptFriend, handleRejectFriend }) => {
  return (
    <div className="friend-list-container">
      <h2>Mis Amigos</h2>
      {friends.length === 0 ? (
        <EmptyState
          icon={<Users size={64} />}
          title="No tienes amigos todavía"
          description="Busca usuarios en la barra de búsqueda o revisa las sugerencias para añadir amigos y compartir tu progreso."
        />
      ) : (
        <div className="friend-list">
          {friends.map((friend) => (
            <div key={friend.id} className="friend-card">
              <img src={friend.avatar_url || '/images/default-avatar.svg'} alt={friend.username} className="friend-card__avatar" />
              <div className="friend-card__info">
                <Link to={`/friends/${friend.id}`} className="friend-card__username-link">
                  <span className="friend-card__username">{friend.username}</span>
                </Link>
                {friend.status === 'pending' && (
                  <div className="friend-card__status friend-card__status--pending">
                    <FaUserClock />
                    <span>Pendiente</span>
                  </div>
                )}
                {friend.status === 'requested' && (
                  <div className="friend-card__status friend-card__status--requested">
                    <FaUserPlus />
                    <span>Solicitud Recibida</span>
                  </div>
                )}
                {friend.status === 'accepted' && (
                  <div className="friend-card__status friend-card__status--accepted">
                    <FaUserCheck />
                    <span>Amigos</span>
                  </div>
                )}
              </div>
              {friend.status === 'requested' && (
                <div className="friend-card__actions">
                  <Button onClick={() => handleAcceptFriend(friend.id)} variant="primary">Aceptar</Button>
                  <Button onClick={() => handleRejectFriend(friend.id)} variant="danger">Rechazar</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendList;
