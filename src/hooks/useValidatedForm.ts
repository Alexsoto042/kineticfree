import { useState, useCallback } from 'react';
import { z } from 'zod';
import toast from 'react-hot-toast';

/**
 * Errores de validación por campo
 */
export type FieldErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Estado del formulario
 */
export interface FormState<T> {
  data: T;
  errors: FieldErrors<T>;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Opciones del hook
 */
export interface UseValidatedFormOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: T;
  onSubmit: (data: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showToastOnError?: boolean;
}

/**
 * Hook para manejar formularios con validación de Zod
 */
export function useValidatedForm<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
  showToastOnError = true,
}: UseValidatedFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialValues,
    errors: {},
    isValidating: false,
    isValid: false,
    isDirty: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Valida todo el formulario
   */
  const validateForm = useCallback(
    async (data: T): Promise<{ isValid: boolean; errors: FieldErrors<T> }> => {
      try {
        await schema.parseAsync(data);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: FieldErrors<T> = {};
          error.issues.forEach((err: z.ZodIssue) => {
            const field = err.path[0] as keyof T;
            if (field && !fieldErrors[field]) {
              fieldErrors[field] = err.message;
            }
          });
          return { isValid: false, errors: fieldErrors };
        }
        return { isValid: false, errors: {} };
      }
    },
    [schema]
  );

  /**
   * Valida un campo específico
   */
  const validateField = useCallback(
    async (
      fieldName: keyof T,
      value: any
    ): Promise<{ isValid: boolean; error?: string }> => {
      try {
        // Validar solo este campo usando el schema completo
        const partialData = { ...formState.data, [fieldName]: value };
        await schema.parseAsync(partialData);
        return { isValid: true };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.issues.find(
            (err: z.ZodIssue) => err.path[0] === fieldName
          );
          if (fieldError) {
            return { isValid: false, error: fieldError.message };
          }
        }
        return { isValid: true };
      }
    },
    [schema, formState.data]
  );

  /**
   * Actualiza el valor de un campo
   */
  const setFieldValue = useCallback(
    async (fieldName: keyof T, value: any) => {
      setFormState((prev) => ({
        ...prev,
        data: { ...prev.data, [fieldName]: value },
        isDirty: true,
      }));

      // Validar en tiempo real si está habilitado
      if (validateOnChange) {
        const { error } = await validateField(fieldName, value);
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [fieldName]: error,
          },
        }));
      }
    },
    [validateOnChange, validateField]
  );

  /**
   * Maneja el blur de un campo
   */
  const handleBlur = useCallback(
    async (fieldName: keyof T) => {
      if (validateOnBlur) {
        const { error } = await validateField(
          fieldName,
          formState.data[fieldName]
        );
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [fieldName]: error,
          },
        }));
      }
    },
    [validateOnBlur, validateField, formState.data]
  );

  /**
   * Limpia el error de un campo
   */
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setFormState((prev) => {
      const newErrors = { ...prev.errors };
      delete newErrors[fieldName];
      return {
        ...prev,
        errors: newErrors,
      };
    });
  }, []);

  /**
   * Limpia todos los errores
   */
  const clearErrors = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  /**
   * Resetea el formulario a los valores iniciales
   */
  const reset = useCallback(() => {
    setFormState({
      data: initialValues,
      errors: {},
      isValidating: false,
      isValid: false,
      isDirty: false,
    });
  }, [initialValues]);

  /**
   * Establece múltiples valores a la vez
   */
  const setValues = useCallback((values: Partial<T>) => {
    setFormState((prev) => ({
      ...prev,
      data: { ...prev.data, ...values },
      isDirty: true,
    }));
  }, []);

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      setFormState((prev) => ({ ...prev, isValidating: true }));

      try {
        // Validar todo el formulario
        const { isValid, errors } = await validateForm(formState.data);

        setFormState((prev) => ({
          ...prev,
          errors,
          isValid,
          isValidating: false,
        }));

        if (!isValid) {
          if (showToastOnError) {
            const firstError = Object.values(errors)[0];
            if (firstError) {
              toast.error(firstError);
            } else {
              toast.error('Por favor corrige los errores del formulario');
            }
          }
          setIsSubmitting(false);
          return;
        }

        // Ejecutar el callback de submit
        await onSubmit(formState.data);
        setIsSubmitting(false);
      } catch (error) {
        console.error('Error en submit:', error);
        if (showToastOnError) {
          toast.error('Error al enviar el formulario');
        }
        setIsSubmitting(false);
        setFormState((prev) => ({ ...prev, isValidating: false }));
      }
    },
    [formState.data, validateForm, onSubmit, showToastOnError]
  );

  /**
   * Obtiene las props para un input
   */
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      name: fieldName as string,
      value: formState.data[fieldName] ?? '',
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        setFieldValue(fieldName, e.target.value);
      },
      onBlur: () => handleBlur(fieldName),
    }),
    [formState.data, setFieldValue, handleBlur]
  );

  /**
   * Obtiene el error de un campo
   */
  const getFieldError = useCallback(
    (fieldName: keyof T): string | undefined => {
      return formState.errors[fieldName];
    },
    [formState.errors]
  );

  /**
   * Verifica si un campo tiene error
   */
  const hasFieldError = useCallback(
    (fieldName: keyof T): boolean => {
      return !!formState.errors[fieldName];
    },
    [formState.errors]
  );

  return {
    // Estado
    values: formState.data,
    errors: formState.errors,
    isValidating: formState.isValidating,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    isSubmitting,

    // Métodos
    setFieldValue,
    setValues,
    handleBlur,
    clearFieldError,
    clearErrors,
    reset,
    handleSubmit,
    validateForm,
    validateField,

    // Helpers
    getFieldProps,
    getFieldError,
    hasFieldError,
  };
}
