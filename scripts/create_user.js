const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const email = 'peticao@peticaonacional.com';
  const password = 'P@nAcioNal2026';
  const name = 'Usuario Master';

  const pgClient = new Client('postgresql://postgres:S@lsandafury@db.hbwianqvbhzgxfihykhh.supabase.co:5432/postgres');
  await pgClient.connect();

  console.log('1. Removendo registros antigos...');
  await pgClient.query(`DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = $1);`, [email]);
  await pgClient.query(`DELETE FROM auth.users WHERE email = $1;`, [email]);

  console.log('2. Inserindo Usuario Master com todos os campos de texto preenchidos (evitando NULL para GoTrue)...');
  const userSql = `
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at,
      is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      $1,
      extensions.crypt($2, extensions.gen_salt('bf')),
      now(),
      null,
      '',
      null,
      '',
      null,
      '',
      '',
      null,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', $3::text, 'role', 'admin'),
      false,
      now(),
      now(),
      null,
      null,
      '',
      '',
      null,
      '',
      0,
      null,
      '',
      null,
      false,
      null,
      false
    )
    RETURNING id;
  `;

  const userRes = await pgClient.query(userSql, [email, password, name]);
  const userId = userRes.rows[0].id;
  console.log('User criado com ID:', userId);

  console.log('3. Inserindo identidade em auth.identities...');
  const identitySql = `
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      $1::uuid,
      $1::uuid,
      $2::text,
      jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    );
  `;

  await pgClient.query(identitySql, [userId, email]);
  console.log('Identidade vinculada!');
  await pgClient.end();

  // 4. Testando login via SDK Supabase
  console.log('4. Testando signInWithPassword...');
  const supabase = createClient(
    'https://hbwianqvbhzgxfihykhh.supabase.co',
    'sb_publishable_3W-JL4X6nyJS4kqn2IBgYg_ngSRit_f'
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('ERRO no login:', error);
  } else {
    console.log('============================================');
    console.log('SUCESSO ABSOLUTO! USUÁRIO MASTER AUTENTICADO!');
    console.log('ID:', data.user.id);
    console.log('E-mail:', data.user.email);
    console.log('Nome:', data.user.user_metadata?.name);
    console.log('Role:', data.user.user_metadata?.role);
    console.log('Session JWT gerado:', Boolean(data.session?.access_token));
    console.log('============================================');
  }
}

main().catch(console.error);
