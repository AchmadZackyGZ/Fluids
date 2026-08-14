import React, { useState, useEffect } from 'react';
import { AuthPage } from '../features/auth/pages/AuthPage';
import { RocketLoadingScreen } from '../features/auth/components/RocketLoadingScreen';
import { OnboardingModal } from '../features/auth/components/OnboardingModal';
import { DashboardPage } from '../features/feed/pages/DashboardPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { NetworkPage } from '../features/network/pages/NetworkPage';
import { ExplorePage } from '../features/explore/pages/ExplorePage';

export const App: React.FC = () => {
  const [view, setView] = useState<'auth' | 'rocket_loading' | 'onboarding_modal' | 'dashboard' | 'profile' | 'network' | 'explore'>('auth');
  const [isInitializing, setIsInitializing] = useState(true);

  const [user, setUser] = useState<{
    id?: string;
    username?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
  }>({
    fullName: 'Achmad Zacky',
    username: 'achmadzacky',
    email: 'zacky@fluids.com',
    avatarUrl: '',
    bio: '',
  });

  const [welcomeToast, setWelcomeToast] = useState<string | undefined>(undefined);

  // Restore authenticated session on page reload (F5)
  useEffect(() => {
    const token = localStorage.getItem('fluids_token');
    if (token) {
      fetch('/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setUser({
              id: data.data.id,
              username: data.data.username,
              email: data.data.email,
              fullName: data.data.full_name,
              avatarUrl: data.data.avatar_url,
              bio: data.data.bio,
            });
            setView('dashboard');
          } else {
            localStorage.removeItem('fluids_token');
            setView('auth');
          }
        })
        .catch(() => {
          // If offline or dev mode, restore session if token exists
          setView('dashboard');
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, []);

  // Triggered when user completes Registration
  const handleRegisterSuccess = (userData: { fullName: string; username: string; email: string }) => {
    setUser((prev) => ({ ...prev, ...userData }));
    setView('rocket_loading');
  };

  // Triggered when user completes Login (Returning user)
  const handleLoginSuccess = (userData: { fullName: string; username: string; email: string }) => {
    setUser((prev) => ({ ...prev, ...userData }));
    setWelcomeToast(`Welcome back, @${userData.username || 'user'}!`);
    setView('dashboard');
  };

  // Triggered after Rocket Animation finishes
  const handleRocketComplete = () => {
    setView('onboarding_modal');
  };

  // Triggered after Onboarding Questionnaire / Skip
  const handleOnboardingFinish = (profileData?: { bio: string; avatarUrl: string }) => {
    if (profileData) {
      setUser((prev) => ({
        ...prev,
        bio: profileData.bio || prev.bio,
        avatarUrl: profileData.avatarUrl || prev.avatarUrl,
      }));
    }
    setView('dashboard');
  };

  // Triggered when user updates profile in Edit Profile Modal
  const handleUpdateProfile = (updatedData: { fullName: string; username: string; bio: string; avatarUrl: string }) => {
    setUser((prev) => ({
      ...prev,
      fullName: updatedData.fullName,
      username: updatedData.username,
      bio: updatedData.bio,
      avatarUrl: updatedData.avatarUrl,
    }));

    // Sync with backend API if token exists
    const token = localStorage.getItem('fluids_token');
    if (token) {
      fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: updatedData.fullName,
          username: updatedData.username,
          bio: updatedData.bio,
          avatar_url: updatedData.avatarUrl,
        }),
      }).catch(() => {});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fluids_token');
    setWelcomeToast(undefined);
    setView('auth');
  };

  if (isInitializing) {
    return (
      <div className="w-full min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00f0ff] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {view === 'auth' && (
        <AuthPage 
          onRegisterSuccess={handleRegisterSuccess}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {view === 'rocket_loading' && (
        <RocketLoadingScreen 
          userName={user.fullName}
          onComplete={handleRocketComplete} 
        />
      )}

      {view === 'onboarding_modal' && (
        <OnboardingModal
          fullName={user.fullName || 'User'}
          username={user.username || 'fluid_user'}
          onFinish={handleOnboardingFinish}
        />
      )}

      {view === 'dashboard' && (
        <DashboardPage
          user={user}
          welcomeToast={welcomeToast}
          onNavigateToProfile={() => setView('profile')}
          onNavigateToNetwork={() => setView('network')}
          onNavigateToExplore={() => setView('explore')}
          onLogout={handleLogout}
        />
      )}

      {view === 'profile' && (
        <ProfilePage
          user={user}
          onNavigateToDashboard={() => setView('dashboard')}
          onNavigateToNetwork={() => setView('network')}
          onNavigateToExplore={() => setView('explore')}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
        />
      )}

      {view === 'network' && (
        <NetworkPage
          user={user}
          onNavigateToDashboard={() => setView('dashboard')}
          onNavigateToProfile={() => setView('profile')}
          onNavigateToExplore={() => setView('explore')}
          onLogout={handleLogout}
        />
      )}

      {view === 'explore' && (
        <ExplorePage
          user={user}
          onNavigateToDashboard={() => setView('dashboard')}
          onNavigateToNetwork={() => setView('network')}
          onNavigateToProfile={() => setView('profile')}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;
