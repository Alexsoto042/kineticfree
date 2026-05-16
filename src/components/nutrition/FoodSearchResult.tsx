import React from 'react';
import type { FoodProduct } from '../../types'; // We will define this type later
import './FoodSearchResult.css';

interface FoodSearchResultProps {
  product: FoodProduct;
  onAdd: (product: FoodProduct) => void;
}

const FoodSearchResult: React.FC<FoodSearchResultProps> = ({
  product,
  onAdd,
}) => {
  const handleAddClick = () => {
    onAdd(product);
  };

  return (
    <div className="food-search-result">
      <div className="food-info">
        <p className="food-name">{product.product_name}</p>
        <p className="food-brand">{product.brands || 'Marca no disponible'}</p>
        <p className="food-calories">
          {(product.nutriments?.['energy-kcal_100g'] || 0).toFixed(1)} kcal por 100g
        </p>
      </div>
      <button onClick={handleAddClick} className="add-food-btn">
        Añadir
      </button>
    </div>
  );
};

export default FoodSearchResult;