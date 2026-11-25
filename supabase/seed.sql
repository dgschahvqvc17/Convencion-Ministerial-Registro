-- Datos públicos iniciales. Se ejecuta después de la migración 0001_init.sql.

insert into public.roles (name, description) values
  ('admin', 'Administrador: crea departamentos/regiones, distritos, iglesias y usuarios de registro'),
  ('operator', 'Usuario de registro: crea pastores y registra asistencia'),
  ('pastor', 'Pastor: consulta su participación'),
  ('viewer', 'Consultor: solo lectura de reportes')
on conflict (name) do nothing;

insert into public.regions (name, kind, country) values
  ('Cochabamba', 'departamento', 'Bolivia')
on conflict do nothing;

insert into public.districts (region_id, name)
select r.id, 'Distrito Central'
from public.regions r
where r.name = 'Cochabamba' and r.kind = 'departamento'
  and not exists (select 1 from public.districts d where d.region_id = r.id and d.name = 'Distrito Central');

insert into public.events (name, motto, start_date, end_date, city) values
  ('44° Convención Ministerial', 'Testifiquemos', '2026-12-01', '2026-12-03', 'Cochabamba')
on conflict do nothing;
