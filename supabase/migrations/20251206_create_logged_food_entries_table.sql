CREATE TABLE public.logged_food_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE DEFAULT CURRENT_DATE NOT NULL,
  food_api_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity_grams INTEGER NOT NULL,
  calories_100g REAL,
  proteins_100g REAL,
  carbohydrates_100g REAL,
  fat_100g REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.logged_food_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own logged food entries."
  ON public.logged_food_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own logged food entries."
  ON public.logged_food_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own logged food entries."
  ON public.logged_food_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logged food entries."
  ON public.logged_food_entries FOR DELETE
  USING (auth.uid() = user_id);
