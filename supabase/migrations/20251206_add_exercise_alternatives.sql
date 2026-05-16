-- ============================================
-- INSERTAR ALTERNATIVAS DE EJERCICIOS
-- Usando solo ejercicios existentes
-- ============================================

-- CARDIO
-- Caminadora (Inclinación) [35] -> Swing con Kettlebell [27]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (35, 27);

-- Swing con Kettlebell [27] -> Hip Thrust con Barra [25], Peso Muerto Rumano [76]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (27, 25);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (27, 76);

-- FLEXIBILITY
-- Estiramiento de Cuádriceps [19] -> Estiramiento de Isquiotibiales [18], Estiramientos Dinámicos [36]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (19, 18);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (19, 36);

-- Estiramiento de Isquiotibiales [18] -> Estiramiento de Cuádriceps [19], Estiramientos Dinámicos [36]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (18, 19);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (18, 36);

-- Estiramiento de Pecho [20] -> Estiramientos Dinámicos [36]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (20, 36);

-- Estiramientos Dinámicos [36] -> Estiramiento de Cuádriceps [19], Estiramiento de Isquiotibiales [18]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (36, 19);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (36, 18);

-- STRENGTH - PECHO
-- Aperturas con Mancuernas [73] -> Aperturas en Máquina [65], Press Inclinado con Mancuernas [72]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (73, 65);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (73, 72);

-- Aperturas en Máquina [65] -> Aperturas con Mancuernas [73], Press de Banca con Barra [23]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (65, 73);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (65, 23);

-- Press de Banca (10x10) [37] -> Press de Banca con Barra [23], Press Inclinado con Mancuernas [72]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (37, 23);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (37, 72);

-- Press de Banca con Barra [23] -> Press de Banca (10x10) [37], Aperturas con Mancuernas [73]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (23, 37);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (23, 73);

-- Press Inclinado con Mancuernas [72] -> Press de Banca con Barra [23], Aperturas en Máquina [65]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (72, 23);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (72, 65);

-- STRENGTH - ESPALDA
-- Jalón al Pecho [26] -> Remo Sentado en Cable [64], Remo con Barra [33]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (26, 64);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (26, 33);

-- Remo con Barra [33] -> Remo con Barra (10x10) [38], Remo Sentado en Cable [64]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (33, 38);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (33, 64);

-- Remo con Barra (10x10) [38] -> Remo con Barra [33], Remo con Mancuerna [75]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (38, 33);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (38, 75);

-- Remo con Mancuerna (Serrucho) [75] -> Remo en Barra T [81], Remo Sentado en Cable [64]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (75, 81);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (75, 64);

-- Remo en Barra T [81] -> Remo con Mancuerna [75], Remo con Barra [33]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (81, 75);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (81, 33);

-- Remo Sentado en Cable [64] -> Jalón al Pecho [26], Remo con Barra [33]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (64, 26);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (64, 33);

-- STRENGTH - HOMBROS
-- Elevaciones Laterales con Mancuernas [74] -> Press de Hombros en Máquina [68], Press Militar [9]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (74, 68);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (74, 9);

-- Face Pulls [79] -> Remo Sentado en Cable [64], Elevaciones Laterales [74]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (79, 64);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (79, 74);

-- Press de Hombros en Máquina [68] -> Press Militar [9], Elevaciones Laterales [74]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (68, 9);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (68, 74);

-- Press Militar [9] -> Press de Hombros en Máquina [68], Elevaciones Laterales [74]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (9, 68);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (9, 74);

-- STRENGTH - BRAZOS
-- Curl de Bíceps [6] -> Curl de Bíceps en Máquina [69], Remo con Barra [33]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (6, 69);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (6, 33);

-- Curl de Bíceps en Máquina [69] -> Curl de Bíceps [6], Jalón al Pecho [26]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (69, 6);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (69, 26);

-- Pushdown de Tríceps en Polea [70] -> Press de Banca [23], Press Militar [9]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (70, 23);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (70, 9);

-- STRENGTH - PIERNAS
-- Curl Femoral [67] -> Peso Muerto Rumano [76], Hip Thrust con Barra [25]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (67, 76);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (67, 25);

-- Elevación de Gemelos en Máquina [71] -> Elevación de Talones [12]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (71, 12);

-- Elevación de Talones [12] -> Elevación de Gemelos en Máquina [71]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (12, 71);

-- Extensión de Cuádriceps [66] -> Sentadilla Goblet [24], Zancada Búlgara [77]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (66, 24);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (66, 77);

-- Hip Thrust [80] -> Hip Thrust con Barra [25], Peso Muerto Rumano [76]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (80, 25);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (80, 76);

-- Hip Thrust con Barra [25] -> Hip Thrust [80], Peso Muerto Rumano [76]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (25, 80);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (25, 76);

-- Peso Muerto Rumano [76] -> Hip Thrust con Barra [25], Curl Femoral [67]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (76, 25);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (76, 67);

-- Sentadilla Goblet [24] -> Extensión de Cuádriceps [66], Zancada Búlgara [77]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (24, 66);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (24, 77);

-- Zancada Búlgara [77] -> Sentadilla Goblet [24], Extensión de Cuádriceps [66]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (77, 24);
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (77, 66);

-- STRENGTH - CORE
-- Elevaciones de Piernas Colgado [78] -> Giro Ruso [13]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (78, 13);

-- Giro Ruso [13] -> Elevaciones de Piernas Colgado [78]
INSERT INTO exercise_alternatives (exercise_id, alternative_id) VALUES (13, 78);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar total de alternativas después de insertar
SELECT COUNT(*) as total_alternatives_after FROM exercise_alternatives;

-- Verificar que todos los ejercicios ahora tienen alternativas
SELECT 
  'Total Ejercicios' as metric,
  COUNT(*) as count
FROM exercises
UNION ALL
SELECT 
  'Ejercicios CON alternativas',
  COUNT(DISTINCT ea.exercise_id)
FROM exercise_alternatives ea
UNION ALL
SELECT 
  'Ejercicios SIN alternativas',
  COUNT(*)
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL;
