-- PIN de recuperación: permite crear una contraseña nueva desde el login
-- sin conocer la anterior. Se guarda cifrado, igual que la contraseña.
ALTER TABLE usuarios ADD COLUMN pin_hash TEXT;
ALTER TABLE usuarios ADD COLUMN pin_sal TEXT;

-- Protección contra quien intente adivinar el PIN probando muchos
ALTER TABLE usuarios ADD COLUMN intentos_pin INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN bloqueado_hasta TEXT;
