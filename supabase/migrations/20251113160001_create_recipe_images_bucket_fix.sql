insert into storage.buckets (id, name, public) values ('recipe_images', 'recipe_images', true) ON CONFLICT (id) DO NOTHING;
