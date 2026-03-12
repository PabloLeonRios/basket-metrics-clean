import * as jose from 'jose';

async function generate() {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secreto_inseguro_por_defecto_para_dev',
  );
  const alg = 'HS256';

  const jwt = await new jose.SignJWT({
    id: '1',
    role: 'entrenador',
    teamId: 'team123',
    email: 'coach@test.com',
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);

  console.log(jwt);
}

generate();
