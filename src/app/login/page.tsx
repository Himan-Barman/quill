'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Feather, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { demoLogin } = useAuth();

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    demoLogin();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      
      {/* Close Button */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={() => router.push('/')}
          className="p-2 rounded-full bg-surface-active/50 hover:bg-surface-active text-muted hover:text-foreground transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 relative z-10 flex flex-col items-center bg-background border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] rounded-2xl"
      >
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <img 
              src="/feather.png" 
              alt="Quill" 
              className="w-24 h-24 object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]" 
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to Quill</h1>
          <p className="text-lg text-muted leading-relaxed px-4">
            Master Every Word. The premium knowledge workspace and command center.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="w-full mb-8 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-4 px-4 rounded-xl text-base font-semibold text-foreground bg-surface hover:bg-surface-active border border-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-muted border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <button
            onClick={handleDemoSignIn}
            className="w-full flex items-center justify-center space-x-3 py-4 px-4 rounded-xl text-base font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all shadow-sm"
          >
            Demo Sign In (Debug)
          </button>
        </div>

        <div className="mt-auto text-center px-6">
          <p className="text-xs text-muted/70 leading-relaxed">
            By continuing, you agree to Lexora's Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
