-- Deshabilitar la confirmación de correo electrónico
update auth.config
set confirm_email = false;

-- Crear una política para permitir el acceso sin confirmación de correo
create policy "Allow access without email confirmation"
  on auth.users
  for all
  using (true)
  with check (true); 