import React, { useState } from 'react';
import type { FoodProduct, LoggedFood } from '../../types';
import { Button } from '../ui/Button/Button';
import './LogFoodModal.css';

interface LogFoodModalProps {
  product: FoodProduct;
  onClose: () => void;
  onLog: (loggedFood: LoggedFood) => void;
}

const LogFoodModal: React.FC<LogFoodModalProps> = ({
  product,
  onClose,
  onLog,
}) => {
  const [quantity, setQuantity] = useState(100); // Default to 100g
  const [meal, setMeal] = useState('breakfast'); // Default to breakfast

  const handleLog = () => {
    const loggedFood: LoggedFood = {
      product_id: product.id,
      name: product.product_name,
      quantity: quantity,
      unit: 'g', // Assuming grams for now
      meal: meal,
      calories: ((product.nutriments?.['energy-kcal_100g'] ?? 0) / 100) * quantity,
      proteins: ((product.nutriments?.proteins_100g ?? 0) / 100) * quantity,
      carbohydrates: ((product.nutriments?.carbohydrates_100g ?? 0) / 100) * quantity,
      fats: ((product.nutriments?.fat_100g ?? 0) / 100) * quantity,
    };
    onLog(loggedFood);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Añadir {product.product_name}</h2>
        <div className="form-group">
          <label htmlFor="quantity">Cantidad (g)</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="meal">Comida</label>
          <select
            id="meal"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
          >
            <option value="breakfast">Desayuno</option>
            <option value="lunch">Almuerzo</option>
            <option value="dinner">Cena</option>
            <option value="snacks">Snacks</option>
          </select>
        </div>
        <div className="modal-actions">
          <Button onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button onClick={handleLog} variant="primary">
            Añadir al Diario
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogFoodModal;
