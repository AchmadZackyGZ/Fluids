import React from 'react';
import { LeftHeroShowcase } from '../components/LeftHeroShowcase';
import { AuthFormCard } from '../components/AuthFormCard';

interface AuthPageProps {
  onRegisterSuccess?: (userData: { fullName: string; username: string; email: string }) => void;
  onLoginSuccess?: (userData: { fullName: string; username: string; email: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onRegisterSuccess, onLoginSuccess }) => {
  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#07090e] overflow-hidden">
      {/* Left Column: Hero Visual Showcase (7 cols on Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 relative h-full">
        <LeftHeroShowcase />
      </div>

      {/* Right Column: Interactive Form Card (5 cols on Desktop) */}
      <div className="col-span-1 lg:col-span-5 flex items-center justify-center min-h-screen bg-[#090b10] border-l border-white/5 shadow-2xl relative z-20">
        <AuthFormCard 
          onRegisterSuccess={onRegisterSuccess}
          onLoginSuccess={onLoginSuccess}
        />
      </div>
    </div>
  );
};

export default AuthPage;
