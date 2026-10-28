// Demo users for development.
import { User } from '../../shared/models/User.js';

export const SEED_USERS = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@pict.edu',
    role: 'student',
    department: 'Computer',
    year: 'TE',
  },
  {
    name: 'Priya Kulkarni',
    email: 'priya.kulkarni@pict.edu',
    role: 'student',
    department: 'IT',
    year: 'SE',
  },
  {
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@pict.edu',
    role: 'student',
    department: 'E&TC',
    year: 'BE',
  },
  {
    name: 'Sneha Patil',
    email: 'sneha.patil@pict.edu',
    role: 'student',
    department: 'Computer',
    year: 'FE',
  },
  {
    name: 'Aditya Joshi',
    email: 'aditya.joshi@pict.edu',
    role: 'student',
    department: 'AI&DS',
    year: 'TE',
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@pict.edu',
    role: 'student',
    department: 'IT',
    year: 'BE',
  },
  {
    name: 'Dr. Meera Gokhale',
    email: 'meera.gokhale@pict.edu',
    role: 'staff',
    department: 'Computer',
  },
  { name: 'Suresh Pawar', email: 'suresh.pawar@pict.edu', role: 'handler', department: 'Security' },
  { name: 'Lata Shinde', email: 'lata.shinde@pict.edu', role: 'handler', department: 'Security' },
  { name: 'Vikram Rao', email: 'vikram.rao@pict.edu', role: 'admin', department: 'Admin office' },
];

export default async function seed() {
  for (const person of SEED_USERS) {
    await User.updateOne({ email: person.email }, { $set: person }, { upsert: true });
  }
}
