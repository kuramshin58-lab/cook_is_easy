import 'dotenv/config';
import { supabase } from '../server/supabase';

async function check() {
  const { data } = await supabase
    .from('recipes')
    .select('title, instructions')
    .limit(1);

  if (data && data[0]) {
    console.log('Title:', data[0].title);
    console.log('Instructions type:', typeof data[0].instructions);
    console.log('Is Array:', Array.isArray(data[0].instructions));
    
    if (Array.isArray(data[0].instructions)) {
      console.log('Length:', data[0].instructions.length);
      if (data[0].instructions.length > 0) {
        console.log('First step:', data[0].instructions[0]);
      } else {
        console.log('Array is empty');
      }
    } else {
      console.log('Value:', data[0].instructions);
    }
  }
}

check().then(() => process.exit(0)).catch(console.error);
