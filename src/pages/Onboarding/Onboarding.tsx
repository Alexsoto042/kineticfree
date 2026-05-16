import React, { useState } from 'react';
import { Button } from '../../components/ui/Button/Button';
import './Onboarding.css';

// Temporary workaround for caching issue
export type Answers = {
  goal?: string;
  experience?: string;
  trainingDays?: '2-3' | '4-5' | '5+';
  equipment?: string;
  nutritionInterest?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height_cm?: number;
  weight_kg?: number;
};

const Step1 = ({ onSelect, selected }: { onSelect: (goal: string) => void; selected?: string; }) => (
  <div className="step-container">
    <h3>¿Cuál es tu objetivo principal?</h3>
    <div className="options-grid">
      <button className={`option-card ${selected === 'lose_weight' ? 'selected' : ''}`} onClick={() => onSelect('lose_weight')}>Perder peso</button>
      <button className={`option-card ${selected === 'gain_muscle' ? 'selected' : ''}`} onClick={() => onSelect('gain_muscle')}>Ganar músculo</button>
      <button className={`option-card ${selected === 'get_fit' ? 'selected' : ''}`} onClick={() => onSelect('get_fit')}>Mantenerse en forma</button>
    </div>
  </div>
);

const Step2 = ({ onSelect, selected }: { onSelect: (experience: string) => void; selected?: string; }) => (
  <div className="step-container">
    <h3>¿Cuál es tu nivel de experiencia?</h3>
    <div className="options-grid">
      <button className={`option-card ${selected === 'principiante' ? 'selected' : ''}`} onClick={() => onSelect('principiante')}>Principiante</button>
      <button className={`option-card ${selected === 'intermedio' ? 'selected' : ''}`} onClick={() => onSelect('intermedio')}>Intermedio</button>
      <button className={`option-card ${selected === 'avanzado' ? 'selected' : ''}`} onClick={() => onSelect('avanzado')}>Avanzado</button>
    </div>
  </div>
);

const Step3 = ({ onSelect, selected }: { onSelect: (days: string) => void; selected?: string; }) => (
  <div className="step-container">
    <h3>¿Cuántos días a la semana quieres entrenar?</h3>
    <div className="options-grid">
      <button className={`option-card ${selected === '2-3' ? 'selected' : ''}`} onClick={() => onSelect('2-3')}>2-3 días</button>
      <button className={`option-card ${selected === '4-5' ? 'selected' : ''}`} onClick={() => onSelect('4-5')}>4-5 días</button>
      <button className={`option-card ${selected === '5+' ? 'selected' : ''}`} onClick={() => onSelect('5+')}>5+ días</button>
    </div>
  </div>
);

const Step4 = ({ onSelect, selected }: { onSelect: (equipment: string) => void; selected?: string; }) => (
  <div className="step-container">
    <h3>¿Qué equipamiento tienes disponible?</h3>
    <div className="options-grid">
      <button className={`option-card ${selected === 'bodyweight' ? 'selected' : ''}`} onClick={() => onSelect('bodyweight')}>Solo peso corporal</button>
      <button className={`option-card ${selected === 'basic' ? 'selected' : ''}`} onClick={() => onSelect('basic')}>Equipo básico (mancuernas, bandas)</button>
      <button className={`option-card ${selected === 'full_gym' ? 'selected' : ''}`} onClick={() => onSelect('full_gym')}>Gimnasio completo</button>
    </div>
  </div>
);

const Step5 = ({ onSelect, selected }: { onSelect: (interest: string) => void; selected?: string; }) => (
  <div className="step-container">
    <h3>Además del ejercicio, ¿qué área de nutrición te interesa más?</h3>
    <div className="options-grid">
      <button className={`option-card ${selected === 'learn' ? 'selected' : ''}`} onClick={() => onSelect('learn')}>Aprender a comer sano</button>
      <button className={`option-card ${selected === 'recipes' ? 'selected' : ''}`} onClick={() => onSelect('recipes')}>Recetas rápidas y fáciles</button>
      <button className={`option-card ${selected === 'tracking' ? 'selected' : ''}`} onClick={() => onSelect('tracking')}>Seguimiento de macros</button>
    </div>
  </div>
);

const Step6 = ({ onSelect, selected }: { onSelect: (gender: 'male' | 'female' | 'other') => void; selected?: string; }) => (
  <div className="step-container">
    <h3>¿Cuál es tu sexo?</h3>
    <p className="step-subtitle">Esto nos ayuda a calcular tus necesidades calóricas con mayor precisión.</p>
    <div className="options-grid">
      <button className={`option-card ${selected === 'male' ? 'selected' : ''}`} onClick={() => onSelect('male')}>Masculino</button>
      <button className={`option-card ${selected === 'female' ? 'selected' : ''}`} onClick={() => onSelect('female')}>Femenino</button>
      <button className={`option-card ${selected === 'other' ? 'selected' : ''}`} onClick={() => onSelect('other')}>Prefiero no decirlo</button>
    </div>
  </div>
);

const Step7 = ({ onChange, value }: { onChange: (age: number) => void; value?: number; }) => (
  <div className="step-container">
    <h3>¿Cuál es tu edad?</h3>
    <input 
      type="number" 
      className="form-control"
      placeholder="Escribe tu edad en años"
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
    />
  </div>
);

const Step8 = ({ onChange, values }: { onChange: (field: 'height_cm' | 'weight_kg', value: number) => void; values: { height_cm?: number, weight_kg?: number } }) => (
  <div className="step-container">
    <h3>Métricas Corporales</h3>
    <div className="form-group">
      <label htmlFor="height">Altura (cm)</label>
      <input 
        type="number" 
        id="height"
        className="form-control"
        placeholder="Ej: 175"
        value={values.height_cm || ''}
        onChange={(e) => onChange('height_cm', parseInt(e.target.value, 10))}
      />
    </div>
    <div className="form-group">
      <label htmlFor="weight">Peso (kg)</label>
      <input 
        type="number" 
        id="weight"
        className="form-control"
        placeholder="Ej: 70"
        value={values.weight_kg || ''}
        onChange={(e) => onChange('weight_kg', parseInt(e.target.value, 10))}
      />
    </div>
  </div>
);

interface OnboardingProps {
  onFinish: (answers: Answers) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const totalSteps = 8; // Increased total steps

  const handleSelect = (field: keyof Answers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinish = () => {
    console.log('Onboarding finished with answers:', answers);
    onFinish(answers);
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1: return !answers.goal;
      case 2: return !answers.experience;
      case 3: return !answers.trainingDays;
      case 4: return !answers.equipment;
      case 5: return !answers.nutritionInterest;
      case 6: return !answers.gender;
      case 7: return !answers.age || answers.age <= 0;
      case 8: return !answers.height_cm || answers.height_cm <= 0 || !answers.weight_kg || answers.weight_kg <= 0;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 onSelect={(value) => handleSelect('goal', value)} selected={answers.goal} />;
      case 2: return <Step2 onSelect={(value) => handleSelect('experience', value)} selected={answers.experience} />;
      case 3: return <Step3 onSelect={(value) => handleSelect('trainingDays', value)} selected={answers.trainingDays} />;
      case 4: return <Step4 onSelect={(value) => handleSelect('equipment', value)} selected={answers.equipment} />;
      case 5: return <Step5 onSelect={(value) => handleSelect('nutritionInterest', value)} selected={answers.nutritionInterest} />;
      case 6: return <Step6 onSelect={(value) => handleSelect('gender', value)} selected={answers.gender} />;
      case 7: return <Step7 onChange={(value) => handleSelect('age', value)} value={answers.age} />;
      case 8: return <Step8 onChange={(field, value) => handleSelect(field, value)} values={{ height_cm: answers.height_cm, weight_kg: answers.weight_kg }} />;
      default: return <div>Paso no válido.</div>;
    }
  };

  return (
    <div className="onboarding-container">
      <h2>Cuestionario Inicial</h2>
      <p>Paso {step} de {totalSteps}</p>
      
      <div className="step-content">
        {renderStep()}
      </div>
      
      <div className="onboarding-navigation">
        {step > 1 && <Button variant="secondary" onClick={handleBack}>Atrás</Button>}
        {step < totalSteps && <Button variant="primary" onClick={handleNext} disabled={isNextDisabled()}>Siguiente</Button>}
        {step === totalSteps && <Button variant="primary" onClick={handleFinish} disabled={isNextDisabled()}>Finalizar</Button>}
      </div>
    </div>
  );
};

export default Onboarding;