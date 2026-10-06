// Función de Vercel: entrega al navegador la URL y la llave PÚBLICA de Supabase
// leyéndolas de las variables de entorno del proyecto (nunca del código).
//   Vercel > Project > Settings > Environment Variables
//     SUPABASE_URL       = https://xxxxxxxx.supabase.co
//     SUPABASE_ANON_KEY  = anon / publishable key
// Por seguridad, si por error se configura una llave secreta, no se envía.

function isSecretKey(key) {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

module.exports = (req, res) => {
  // Acepta la URL aunque se haya pegado con /rest/v1/ u otra ruta al final
  let url = (process.env.SUPABASE_URL || '').trim();
  try { if (url) url = new URL(url).origin; } catch { url = ''; }
  const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

  if (anonKey && isSecretKey(anonKey)) {
    res.status(500).json({ error: 'SUPABASE_ANON_KEY contiene una llave secreta. Usa la anon / publishable key.' });
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).json({ url, anonKey });
};
