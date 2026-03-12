import * as jose from 'jose';
const secret = new TextEncoder().encode(
  'secreto_inseguro_por_defecto_para_dev',
);
const jwt = await new jose.SignJWT({
  _id: '66a8db2bbdbd2ff7210e756a',
  email: 'test@coach.com',
  name: 'Test Coach',
  role: 'entrenador',
  team: '66a8db18bdbd2ff7210e7567',
  isActive: true,
})
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('1d')
  .sign(secret);
console.log(jwt);
