// src/components/ShoppingList.tsx
import React, { useEffect } from 'react';
import { useShoppingList } from '../../../hooks/useShoppingList';
import './ShoppingList.css';

interface ShoppingListProps {
  planId: string;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ planId }) => {
  const { shoppingList, loading, error, generateShoppingList } =
    useShoppingList(planId);

  useEffect(() => {
    generateShoppingList();
  }, [generateShoppingList]);

  if (loading) {
    return (
      <div className="shopping-list-container">
        Generando lista de compras...
      </div>
    );
  }

  if (error) {
    return (
      <div className="shopping-list-container error-message">
        Error: {error.message}
      </div>
    );
  }

  const listItems = Object.entries(shoppingList);

  if (listItems.length === 0) {
    return (
      <div className="shopping-list-container">
        <h4>Lista de Compras</h4>
        <p>No hay recetas asignadas a este plan todavía.</p>
      </div>
    );
  }

  return (
    <div className="shopping-list-container">
      <h4>Lista de Compras Semanal</h4>
      <ul className="shopping-list">
        {listItems.map(([name, details]) => (
          <li key={name} className="shopping-list-item">
            <input type="checkbox" id={`item-${name}`} />
            <label htmlFor={`item-${name}`}>
              <span className="item-name">{name}</span>
              <span className="item-quantity">
                {details.quantity} {details.unit}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingList;
