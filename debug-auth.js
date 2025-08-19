// Debug script to check Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Environment Check:');
console.log('REACT_APP_SUPABASE_URL:', supabaseUrl);
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Not set');

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection
  supabase.auth.getSession().then(({ data, error }) => {
    console.log('Supabase connection test:');
    console.log('Session data:', data);
    console.log('Error:', error);
  }).catch(err => {
    console.error('Connection failed:', err);
  });
} else {
  console.error('❌ Environment variables not loaded properly');
}