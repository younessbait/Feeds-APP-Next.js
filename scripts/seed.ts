import { config } from 'dotenv';
config({ path: '.env.local' });
import { dbConnect } from '../lib/db';
import Account from '../models/Account';
import bcrypt from 'bcryptjs';

async function run() {
  await dbConnect();
  const email = process.env.ADMIN_EMAIL!;
  const pass = process.env.ADMIN_PASSWORD!;
  const passwordHash = await bcrypt.hash(pass, 10);
  const existing = await Account.findOne({ email });
  if (!existing) {
    await Account.create({ email, passwordHash });
    console.log('Seeded admin', email);
  } else {
    console.log('Admin already exists');
  }
  process.exit(0);
}
run();
