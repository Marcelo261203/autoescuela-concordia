-- Insertar datos de prueba (OPCIONAL)

-- Insertar instructor de prueba
INSERT INTO instructors (nombre, apellido, email, telefono, especialidad, disponibilidad, estado) VALUES
('Juan', 'García', 'juan.garcia@autoescuela.com', '+34912345678', 'Conducción Práctica', 'Lunes a Viernes 09:00-18:00', 'activo'),
('María', 'López', 'maria.lopez@autoescuela.com', '+34912345679', 'Conducción Teórica', 'Lunes a Viernes 10:00-20:00', 'activo'),
('Carlos', 'Martínez', 'carlos.martinez@autoescuela.com', '+34912345680', 'Conducción Práctica', 'Sábados 09:00-14:00', 'activo')
ON CONFLICT (email) DO NOTHING;

-- Insertar estudiantes de prueba
INSERT INTO students (ci, nombre, apellido, email, telefono, direccion, fecha_nacimiento, estado, fecha_inscripcion) VALUES
('12345678A', 'Miguel', 'Rodríguez', 'miguel@email.com', '+34622222222', 'Calle Principal 123', '2006-03-15', 'activo', NOW()),
('87654321B', 'Ana', 'Fernández', 'ana@email.com', '+34633333333', 'Avenida Central 456', '2005-07-22', 'activo', NOW()),
('11111111C', 'Luis', 'González', 'luis@email.com', '+34644444444', 'Plaza Mayor 789', '2006-01-10', 'en_curso', NOW()),
('22222222D', 'Sofia', 'Pérez', 'sofia@email.com', '+34655555555', 'Calle Nueva 321', '2007-05-30', 'activo', NOW())
ON CONFLICT (ci) DO NOTHING;

-- Insertar clases de prueba
INSERT INTO classes (estudiante_id, instructor_id, tipo, fecha, hora, duracion_minutos, observaciones) 
SELECT 
  s.id,
  i.id,
  CASE WHEN ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY i.id) % 2 = 0 THEN 'practica' ELSE 'teorica' END,
  CURRENT_DATE + (ROW_NUMBER() OVER (ORDER BY s.id) || ' days')::INTERVAL,
  '10:00'::TIME,
  60,
  'Clase de prueba'
FROM students s
CROSS JOIN (SELECT id FROM instructors LIMIT 1) i
LIMIT 4;

-- Inicializar progreso de estudiantes
INSERT INTO student_progress (estudiante_id, clases_practicas_realizadas, clases_teoricas_realizadas, porcentaje_avance, actualizado_en)
SELECT id, 0, 0, 0, NOW() FROM students
ON CONFLICT (estudiante_id) DO NOTHING;
