CREATE TABLE IF NOT EXISTS public.exercises_alternatives (
    exercise_id bigint NOT NULL,
    alternative_id bigint NOT NULL,
    CONSTRAINT exercises_alternatives_pkey PRIMARY KEY (exercise_id, alternative_id),
    CONSTRAINT exercises_alternatives_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE,
    CONSTRAINT exercises_alternatives_alternative_id_fkey FOREIGN KEY (alternative_id) REFERENCES public.exercises(id) ON DELETE CASCADE
);
