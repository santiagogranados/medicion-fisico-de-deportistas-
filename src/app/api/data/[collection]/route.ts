import { NextResponse } from 'next/server';
import { getSchema } from '../../../../../data/_schema/registry';
import { create, getAll, getById, remove, update, JsonDBError, ReadOnlyError } from '@/lib/json-db';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ collection: string }> };

function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json({ success: false, error: 'Los datos no cumplen el esquema.', code: 'VALIDATION_ERROR', details: error.issues }, { status: 400 });
  }
  if (error instanceof ReadOnlyError) {
    return NextResponse.json({ success: false, error: error.message, code: 'READ_ONLY' }, { status: 503 });
  }
  if (error instanceof JsonDBError) {
    const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'VALIDATION_ERROR' ? 400 : 500;
    return NextResponse.json({ success: false, error: error.message, code: error.code }, { status });
  }
  return NextResponse.json({ success: false, error: 'Error interno del servidor.', code: 'INTERNAL' }, { status: 500 });
}

function collectionSchema(collection: string) {
  const schema = getSchema(collection);
  if (!schema) throw new JsonDBError(`La colección "${collection}" no está registrada.`, 'NOT_FOUND');
  return schema;
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { collection } = await context.params;
    collectionSchema(collection);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (id) {
      const record = await getById(collection, id);
      if (!record) return NextResponse.json({ success: false, error: 'Registro no encontrado.', code: 'NOT_FOUND' }, { status: 404 });
      return NextResponse.json({ success: true, data: record, timestamp: new Date().toISOString() });
    }
    const options = {
      limit: Number(url.searchParams.get('limit') ?? 50),
      offset: Number(url.searchParams.get('offset') ?? 0),
      sortOrder: url.searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc',
    } as const;
    const sortBy = url.searchParams.get('sortBy');
    const result = await getAll(collection, sortBy ? { ...options, sortBy } : options);
    return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { collection } = await context.params;
    const schema = collectionSchema(collection);
    const parsed = schema.omit({ id: true, createdAt: true, updatedAt: true }).parse(await request.json());
    const record = await create(collection, parsed as never);
    return NextResponse.json({ success: true, data: record, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { collection } = await context.params;
    const schema = collectionSchema(collection);
    const body = (await request.json()) as { id?: string } & Record<string, unknown>;
    if (!body.id) return NextResponse.json({ success: false, error: 'El campo id es obligatorio.', code: 'VALIDATION_ERROR' }, { status: 400 });
    const { id, ...changes } = body;
    const parsed = schema.omit({ id: true, createdAt: true, updatedAt: true }).partial().parse(changes);
    const record = await update(collection, id, parsed as never);
    return NextResponse.json({ success: true, data: record, timestamp: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { collection } = await context.params;
    collectionSchema(collection);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'El parámetro id es obligatorio.', code: 'VALIDATION_ERROR' }, { status: 400 });
    await remove(collection, id);
    return NextResponse.json({ success: true, data: { id }, timestamp: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}
