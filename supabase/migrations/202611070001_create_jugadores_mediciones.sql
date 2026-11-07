-- M1: tablas de Rendimiento Físico

CREATE TABLE IF NOT EXISTS jugadores (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      INTEGER       NOT NULL,
  nombre      VARCHAR(120)  NOT NULL,
  edad        SMALLINT      NOT NULL,
  posicion    VARCHAR(40)   NOT NULL,
  activo      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT jugadores_codigo_unico UNIQUE (codigo),                       -- RN-12
  CONSTRAINT jugadores_nombre_minimo CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT jugadores_posicion_minima CHECK (char_length(btrim(posicion)) >= 1),
  CONSTRAINT jugadores_edad_valida CHECK (edad BETWEEN 15 AND 45)          -- RN-07
);

CREATE TABLE IF NOT EXISTS mediciones (
  id                    BIGSERIAL     PRIMARY KEY,
  jugador_id            UUID          NOT NULL REFERENCES jugadores(id) ON DELETE RESTRICT,  -- RN-15
  distancia             INTEGER       NOT NULL,                 -- metros enteros
  tiempo_prueba_cent    INTEGER       NOT NULL,                 -- centésimas de segundo
  velocidad_maxima_cent INTEGER       NOT NULL,                 -- centésimas de km/h
  velocidad_promedio_cent INTEGER     NOT NULL,                 -- centésimas de km/h (RN-01)
  frecuencia_cardiaca   SMALLINT      NOT NULL,
  recuperacion          SMALLINT      NOT NULL,                 -- segundos
  sprints               SMALLINT      NOT NULL,
  fecha                 DATE          NOT NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT med_distancia_positiva  CHECK (distancia > 0),                       -- RN-08
  CONSTRAINT med_tiempo_positivo     CHECK (tiempo_prueba_cent > 0),              -- RN-08
  CONSTRAINT med_velmax_no_neg       CHECK (velocidad_maxima_cent >= 0),          -- RN-08
  CONSTRAINT med_velprom_no_neg      CHECK (velocidad_promedio_cent >= 0),
  CONSTRAINT med_fc_valida           CHECK (frecuencia_cardiaca BETWEEN 40 AND 220),  -- RN-09
  CONSTRAINT med_recuperacion_no_neg CHECK (recuperacion >= 0),                   -- RN-10
  CONSTRAINT med_sprints_no_neg      CHECK (sprints >= 0)                         -- RN-10
);
CREATE INDEX IF NOT EXISTS idx_mediciones_jugador ON mediciones (jugador_id, fecha DESC, id DESC);
