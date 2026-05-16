import React from 'react';

interface UsernameDisplayProps {
  username: string;
}

const UsernameDisplay: React.FC<UsernameDisplayProps> = ({ username }) => {
  return <span>{username}</span>;
};

export default UsernameDisplay;
