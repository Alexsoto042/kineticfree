// src/components/social/FriendSearch.tsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface FriendSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
}

const FriendSearch: React.FC<FriendSearchProps> = ({ searchTerm, setSearchTerm, handleSearch, isSearching }) => {
  return (
    <div className="friend-search-container">
      <h2>Buscar Amigos</h2>
      <div className="friend-search-input-group">
        <input
          type="text"
          placeholder="Buscar por nombre de usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} disabled={isSearching}>
          <FaSearch />
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
    </div>
  );
};

export default FriendSearch;
