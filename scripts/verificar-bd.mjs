import { createPostgresPool } from './postgres.mjs';

const expectedConstraints = [
  ['jugadores_codigo_unico', 'jugadores'],
  ['jugadores_edad_valida', 'jugadores'],
  ['med_distancia_positiva', 'mediciones'],
  ['med_tiempo_positivo', 'mediciones'],
  ['med_fc_valida', 'mediciones'],
];

const failures = [];
let pool;

function report(ok, description) {
  console.log(`${ok ? 'OK' : 'FALLA'}: ${description}`);
  if (!ok) failures.push(description);
}

function errorCode(error) {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof error.code === 'string') return error.code;
    if ('cause' in error && error.cause && typeof error.cause === 'object'
      && 'code' in error.cause && typeof error.cause.code === 'string') {
      return error.cause.code;
    }
    const message = 'message' in error && typeof error.message === 'string' ? error.message : '';
    if (/connection terminated due to connection timeout/i.test(message)) return 'TIMEOUT';
    if (/connection terminated unexpectedly/i.test(message)) return 'CONNECTION_TERMINATED';
  }
  return 'UNKNOWN';
}

async function expectConstraint(client, { name, code, constraint, sql, values }) {
  const savepoint = `sp_check_${name}`;
  await client.query(`SAVEPOINT ${savepoint}`);
  let caught;

  try {
    await client.query(sql, values);
  } catch (error) {
    caught = error;
  }

  await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
  await client.query(`RELEASE SAVEPOINT ${savepoint}`);
  const valid = caught?.code === code && (!constraint || caught.constraint === constraint);
  report(valid, `${name}${valid ? '' : ` (esperado ${code}/${constraint ?? 'cualquier restricción'}, recibido ${caught ? `${errorCode(caught)}/${caught.constraint ?? 'sin nombre'}` : 'sin error'})`}`);
}

async function expectInsert(client, { name, sql, values }) {
  const savepoint = `sp_check_${name}`;
  await client.query(`SAVEPOINT ${savepoint}`);
  try {
    const result = await client.query(sql, values);
    await client.query(`RELEASE SAVEPOINT ${savepoint}`);
    report(true, name);
    return result;
  } catch (error) {
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    await client.query(`RELEASE SAVEPOINT ${savepoint}`);
    report(false, `${name} (${errorCode(error)})`);
    return null;
  }
}

async function verifyIntegrity(client) {
  let transactionStarted = false;
  try {
    await client.query('BEGIN');
    transactionStarted = true;

    const fixture = await expectInsert(client, {
      name: 'crear jugador código 901 "Verif"',
      sql: `INSERT INTO public.jugadores (codigo, nombre, edad, posicion)
            VALUES ($1, $2, $3, $4) RETURNING id`,
      values: [901, 'Verif', 20, 'Extremo'],
    });

    await expectConstraint(client, {
      name: 'código duplicado (jugadores_codigo_unico)',
      code: '23505',
      constraint: 'jugadores_codigo_unico',
      sql: `INSERT INTO public.jugadores (codigo, nombre, edad, posicion)
            VALUES ($1, $2, $3, $4)`,
      values: [901, 'Verif duplicado', 20, 'Extremo'],
    });

    await expectConstraint(client, {
      name: 'edad 14 (jugadores_edad_valida)',
      code: '23514',
      constraint: 'jugadores_edad_valida',
      sql: `INSERT INTO public.jugadores (codigo, nombre, edad, posicion)
            VALUES ($1, $2, $3, $4)`,
      values: [-2147483000, 'Edad inválida', 14, 'Defensa'],
    });

    await expectConstraint(client, {
      name: 'edad 46 (jugadores_edad_valida)',
      code: '23514',
      constraint: 'jugadores_edad_valida',
      sql: `INSERT INTO public.jugadores (codigo, nombre, edad, posicion)
            VALUES ($1, $2, $3, $4)`,
      values: [-2147482999, 'Edad inválida', 46, 'Defensa'],
    });

    if (fixture?.rows[0]?.id) {
      const jugadorId = fixture.rows[0].id;
      const measurement = `INSERT INTO public.mediciones
        (jugador_id, distancia, tiempo_prueba_cent, velocidad_maxima_cent,
         velocidad_promedio_cent, frecuencia_cardiaca, recuperacion, sprints, fecha)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)`;
      const validValues = [jugadorId, 8200, 400, 3240, 2700, 175, 55, 18];

      await expectConstraint(client, {
        name: 'distancia 0 (med_distancia_positiva)',
        code: '23514',
        constraint: 'med_distancia_positiva',
        sql: measurement,
        values: [jugadorId, 0, 400, 3240, 2700, 175, 55, 18],
      });

      await expectConstraint(client, {
        name: 'tiempo 0 (med_tiempo_positivo)',
        code: '23514',
        constraint: 'med_tiempo_positivo',
        sql: measurement,
        values: [jugadorId, 8200, 0, 3240, 2700, 175, 55, 18],
      });

      for (const heartRate of [230, 39]) {
        await expectConstraint(client, {
          name: `frecuencia ${heartRate} (med_fc_valida)`,
          code: '23514',
          constraint: 'med_fc_valida',
          sql: measurement,
          values: [jugadorId, 8200, 400, 3240, 2700, heartRate, 55, 18],
        });
      }

      await expectConstraint(client, {
        name: 'sprints -1 (med_sprints_no_neg)',
        code: '23514',
        constraint: 'med_sprints_no_neg',
        sql: measurement,
        values: [jugadorId, 8200, 400, 3240, 2700, 175, 55, -1],
      });

      await client.query(
        `INSERT INTO public.mediciones
          (jugador_id, distancia, tiempo_prueba_cent, velocidad_maxima_cent,
           velocidad_promedio_cent, frecuencia_cardiaca, recuperacion, sprints, fecha)
         VALUES ($1, 100, 100, 100, 100, 100, 50, 1, DATE '2000-01-01')`,
        [jugadorId],
      );
      await client.query(measurement, validValues);
      const { rows } = await client.query(
        `SELECT distancia, tiempo_prueba_cent, velocidad_maxima_cent,
                velocidad_promedio_cent, frecuencia_cardiaca, recuperacion, sprints
           FROM public.v_jugadores
          WHERE codigo = $1`,
        [901],
      );
      const latest = rows[0];
      report(
        latest?.distancia === 8200
          && latest?.tiempo_prueba_cent === 400
          && latest?.velocidad_maxima_cent === 3240
          && latest?.velocidad_promedio_cent === 2700
          && latest?.frecuencia_cardiaca === 175
          && latest?.recuperacion === 55
          && latest?.sprints === 18,
        'v_jugadores muestra la medición válida más reciente',
      );
    } else {
      for (const test of [
        'distancia 0 (med_distancia_positiva)',
        'tiempo 0 (med_tiempo_positivo)',
        'frecuencia 230 (med_fc_valida)',
        'frecuencia 39 (med_fc_valida)',
        'sprints -1 (med_sprints_no_neg)',
        'v_jugadores muestra la medición válida más reciente',
      ]) report(false, `${test} (sin jugador de prueba)`);
    }
  } finally {
    if (transactionStarted) await client.query('ROLLBACK');
  }
}

try {
  pool = await createPostgresPool();
  const { rows: objects } = await pool.query(`
    SELECT
      to_regclass('public.jugadores') IS NOT NULL AS jugadores,
      to_regclass('public.mediciones') IS NOT NULL AS mediciones,
      to_regclass('public.v_jugadores') IS NOT NULL AS v_jugadores
  `);
  const objectState = objects[0];
  for (const name of ['jugadores', 'mediciones', 'v_jugadores']) {
    report(objectState[name], `existe public.${name}`);
  }

  if (objectState.jugadores && objectState.mediciones && objectState.v_jugadores) {
    const counts = await pool.query(`
      SELECT
        (SELECT count(*)::integer FROM public.jugadores) AS jugadores,
        (SELECT count(*)::integer FROM public.mediciones) AS mediciones
    `);
    console.log(`Filas: jugadores=${counts.rows[0].jugadores}, mediciones=${counts.rows[0].mediciones}`);

    const constraints = await pool.query(
      `SELECT c.conname AS name, t.relname AS table_name
         FROM pg_constraint c
         JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND c.conname = ANY($1::text[])`,
      [expectedConstraints.map(([name]) => name)],
    );
    const constraintSet = new Set(constraints.rows.map((row) => `${row.name}:${row.table_name}`));
    for (const [name, table] of expectedConstraints) {
      report(constraintSet.has(`${name}:${table}`), `restricción ${name}`);
    }

    const indexes = await pool.query(
      `SELECT indexname
         FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = ANY($1::text[])`,
      [['idx_mediciones_jugador']],
    );
    report(indexes.rows.some((row) => row.indexname === 'idx_mediciones_jugador'), 'índice idx_mediciones_jugador');

    const rls = await pool.query(
      `SELECT c.relname, c.relrowsecurity
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = ANY($1::text[])`,
      [['jugadores', 'mediciones']],
    );
    const rlsByTable = new Map(rls.rows.map((row) => [row.relname, row.relrowsecurity]));
    for (const name of ['jugadores', 'mediciones']) {
      report(rlsByTable.get(name) === true, `RLS activo en ${name}`);
    }

    const client = await pool.connect();
    try {
      await verifyIntegrity(client);
    } finally {
      client.release();
    }
  } else {
    report(false, 'integridad no ejecutada porque faltan objetos de la base');
  }
} catch (error) {
  console.error(`No se pudo completar la verificación; código de error: ${errorCode(error)}.`);
  failures.push('error de conexión o verificación');
} finally {
  if (pool) await pool.end();
  console.log(`Total de fallas: ${failures.length}`);
  if (failures.length > 0) process.exitCode = 1;
}
