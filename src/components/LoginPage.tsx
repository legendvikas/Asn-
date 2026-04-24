import { useAuth } from '../lib/AuthContext';
import { LogIn, GraduationCap, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginPage() {
  const { signIn } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-stone-50 shadow-xl shadow-stone-200">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">SimpliSchool</h1>
          <p className="mt-2 font-bold text-xs uppercase tracking-[0.2em] text-stone-400">Minimal School Management</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-200/50">
          <div className="p-10">
            <div className="mb-10 text-center text-stone-600">
              <p className="text-sm font-medium leading-relaxed">Login to access your dashboard, manage students, mark attendance, and track performance.</p>
            </div>

            <button
              id="google-signin-btn"
              onClick={signIn}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-stone-900 px-6 py-4 font-bold text-stone-50 transition-all hover:bg-stone-800 active:scale-[0.98] shadow-lg shadow-stone-100"
            >
              <LogIn size={20} />
              Sign in with Google
            </button>

            <div className="mt-10 flex justify-center gap-4 border-t border-stone-50 pt-10 font-bold text-[10px] uppercase tracking-widest text-stone-300">
              <span>Admin</span>
              <span>•</span>
              <span>Parent</span>
            </div>
          </div>
        </div>

        <p className="mt-12 text-center font-bold text-[10px] uppercase tracking-widest text-stone-300">
          &copy; 2026 SimpliSchool App
        </p>
      </motion.div>
    </div>
  );
}
