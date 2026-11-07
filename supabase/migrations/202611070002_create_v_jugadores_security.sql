-- M2: vista con la medición más reciente y cierre de acceso público

CREATE OR REPLACE VIEW v_jugadores
WITH (security_invoker = true) AS
SELECT
  j.*,
  m.id   AS medicion_id,
  m.distancia, m.tiempo_prueba_cent, m.velocidad_maxima_cent,
  m.velocidad_promedio_cent, m.frecuencia_cardiaca, m.recuperacion, m.sprints, m.fecha
FROM jugadores j
LEFT JOIN LATERAL (
  SELECT * FROM mediciones m
  WHERE m.jugador_id = j.id
  ORDER BY m.fecha DESC, m.id DESC
  LIMIT 1
) m ON true;

ALTER TABLE jugadores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON jugadores, mediciones FROM anon, authenticated;
REVOKE ALL ON v_jugadores FROM anon, authenticated;
