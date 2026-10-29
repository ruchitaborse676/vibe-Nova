import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 brand-font">404</h1>
      <h2 className="text-lg font-bold text-slate-800">Lost in the Universe</h2>
      <p className="text-xs text-slate-500">
        The page or product link you followed doesn't seem to exist on Vibe-Nova.
      </p>
      <div className="pt-2">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
