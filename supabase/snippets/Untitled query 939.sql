SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Desabilitar RLS en la tabla storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;