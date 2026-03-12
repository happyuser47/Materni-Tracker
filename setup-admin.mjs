/**
 * Supabase Setup Script for MaterniTrack Authentication
 *
 * This script:
 * 1. Creates the admin user in Supabase Auth
 * 2. Links the admin to the staff table via auth_id
 *
 * PREREQUISITES — Run these SQL commands in your Supabase SQL Editor FIRST:
 *
 *   -- Add auth_id column to staff table
 *   ALTER TABLE staff ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) UNIQUE;
 *
 *   -- Create an index for fast lookups
 *   CREATE INDEX IF NOT EXISTS idx_staff_auth_id ON staff(auth_id);
 *
 * Then run this script: node setup-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sndhwyxhkdeehnwfqvmo.supabase.co';
// Use your SERVICE_ROLE key (not anon key) to create users server-side
// Get this from Supabase Dashboard > Settings > API > service_role key
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY environment variable first.');
  console.log('You can find it in: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ERROR: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables first.');
  process.exit(1);
}

async function setupAdmin() {
  console.log('=== MaterniTrack Admin Setup ===\n');

  // 1. Create admin user in Supabase Auth
  console.log('1. Creating admin user in Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true  // Auto-confirm the email
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('   Admin user already exists in Auth. Fetching existing user...');
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === ADMIN_EMAIL);
      if (existingUser) {
        console.log(`   Found existing user: ${existingUser.id}`);
        await linkStaffToAuth(existingUser.id);
      }
    } else {
      console.error('   Error creating user:', authError.message);
      process.exit(1);
    }
  } else {
    console.log(`   User created: ${authData.user.id}`);
    await linkStaffToAuth(authData.user.id);
  }

  console.log('\n=== Setup Complete! ===');
  console.log('Admin login credentials:');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

async function linkStaffToAuth(authUserId) {
  // 2. Check if admin staff record exists
  console.log('\n2. Linking admin to staff table...');

  const { data: existingStaff } = await supabase
    .from('staff')
    .select('*')
    .eq('role', 'Admin')
    .limit(1);

  if (existingStaff && existingStaff.length > 0) {
    // Update existing admin staff record with auth_id
    const { error } = await supabase
      .from('staff')
      .update({ auth_id: authUserId })
      .eq('id', existingStaff[0].id);

    if (error) {
      console.error('   Error linking staff:', error.message);
    } else {
      console.log(`   Linked auth user to existing staff: ${existingStaff[0].name} (ID: ${existingStaff[0].id})`);
    }
  } else {
    // Create new admin staff record
    const { data, error } = await supabase
      .from('staff')
      .insert({ name: 'Admin', role: 'Admin', auth_id: authUserId })
      .select()
      .single();

    if (error) {
      console.error('   Error creating staff:', error.message);
    } else {
      console.log(`   Created new admin staff record: ${data.name} (ID: ${data.id})`);
    }
  }
}

setupAdmin().catch(console.error);
