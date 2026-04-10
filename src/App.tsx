import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import Login from './screens/Login';
import Register from './screens/Register';
import OTP from './screens/OTP';
import ForgotPassword from './screens/ForgotPassword';
import Home from './screens/Home';
import DonorList from './screens/DonorList';
import DonorDetails from './screens/DonorDetails';
import BloodRequest from './screens/BloodRequest';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import Admin from './screens/Admin';
import NearbyDonors from './screens/NearbyDonors';
import RequestManagement from './screens/RequestManagement';
import { Donor, User, Notification as AppNotification } from './types';
import { api } from './services/api';
import { notificationService } from './services/notificationService';

export type Screen = 
  | 'splash' 
  | 'onboarding' 
  | 'login' 
  | 'register' 
  | 'otp' 
  | 'forgot_password' 
  | 'home' 
  | 'donor_list' 
  | 'donor_details' 
  | 'blood_request' 
  | 'notifications' 
  | 'profile' 
  | 'settings'
  | 'admin'
  | 'nearby_donors'
  | 'request_management';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [backScreen, setBackScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ district: string; upazila: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastFetchTime = useRef<number>(0);

  useEffect(() => {
    if (user) {
      notificationService.requestPermission(user.uid);
      
      const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notifications) => {
        const unread = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        // Only fetch location once every 30 seconds to avoid rate limiting
        if (now - lastFetchTime.current < 30000) return;
        
        try {
          const { latitude, longitude } = position.coords;
          lastFetchTime.current = now;
          
          // Use OpenStreetMap Nominatim API for real reverse geocoding
          // Added &email= to identify the app as per Nominatim policy
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en&email=muhammadmohiuddin151@gmail.com`,
            {
              headers: {
                'Accept': 'application/json',
              }
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const district = addr.state_district || addr.city || addr.county || "Dhaka";
            const upazila = addr.suburb || addr.town || addr.village || addr.city_district || addr.neighbourhood || "Central";
            
            setCurrentLocation({ 
              district: district.replace(' District', ''), 
              upazila: upazila 
            });
          }
        } catch (error) {
          // Silently fail if fetch fails, keeping previous location or defaults
          console.warn('Location fetch failed, using defaults:', error);
          if (!currentLocation) {
            setCurrentLocation({ district: 'Dhaka', upazila: 'Central' });
          }
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (!currentLocation) {
          setCurrentLocation({ district: 'Dhaka', upazila: 'Central' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentLocation]);

  useEffect(() => {
    api.testConnection();
    const checkAuth = async () => {
      try {
        const userData = await api.getMe();
        if (userData) {
          setUser(userData);
          if (userData.role === 'admin') {
            setCurrentScreen('admin');
          } else {
            setCurrentScreen('home');
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Auth check failed', err);
        return false;
      } finally {
        setLoading(false);
      }
    };

    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        checkAuth().then((isAuthenticated) => {
          if (!isAuthenticated) setCurrentScreen('onboarding');
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, user]);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (userData.role === 'admin') {
      navigate('admin');
    } else {
      navigate('home');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigate('login');
  };

  const handleViewDonor = (donor: Donor, fromScreen: Screen = 'home') => {
    setSelectedDonor(donor);
    setBackScreen(fromScreen);
    navigate('donor_details');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <Splash />;
      case 'onboarding':
        return <Onboarding onFinish={() => navigate('login')} />;
      case 'login':
        return (
          <Login 
            onLogin={handleLogin} 
            onRegister={() => navigate('register')} 
            onForgotPassword={() => navigate('forgot_password')} 
          />
        );
      case 'register':
        return (
          <Register 
            onRegister={handleLogin} 
            onLogin={() => navigate('login')} 
          />
        );
      case 'otp':
        return <OTP onVerify={() => navigate('home')} onBack={() => navigate('register')} />;
      case 'forgot_password':
        return <ForgotPassword onBack={() => navigate('login')} />;
      case 'home':
        return (
          <Home 
            user={user}
            onNavigate={navigate} 
            onViewDonor={(donor) => handleViewDonor(donor, 'home')}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
            currentLocation={currentLocation}
            unreadCount={unreadCount}
          />
        );
      case 'donor_list':
        return (
          <DonorList 
            user={user}
            onBack={() => navigate('home')} 
            onViewDonor={(donor) => handleViewDonor(donor, 'donor_list')}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
            initialFilters={currentLocation ? { district: currentLocation.district, upazila: currentLocation.upazila } : undefined}
          />
        );
      case 'donor_details':
        return (
          <DonorDetails 
            donor={selectedDonor} 
            onBack={() => navigate(backScreen)} 
            user={user}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
          />
        );
      case 'blood_request':
        return <BloodRequest onBack={() => navigate('home')} />;
      case 'notifications':
        return <Notifications user={user} onBack={() => navigate('home')} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            onBack={() => navigate('home')} 
            onSettings={() => navigate('settings')} 
            onNavigate={navigate}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
            onLogout={handleLogout}
          />
        );
      case 'settings':
        return (
          <Settings 
            user={user} 
            onBack={() => navigate('profile')} 
            onLogout={handleLogout} 
          />
        );
      case 'admin':
        return <Admin onLogout={handleLogout} />;
      case 'request_management':
        return <RequestManagement user={user} onBack={() => navigate('profile')} />;
      case 'nearby_donors':
        return (
          <NearbyDonors 
            user={user}
            onBack={() => navigate('home')} 
            onViewDonor={(donor) => handleViewDonor(donor, 'nearby_donors')}
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
            currentLocation={currentLocation}
          />
        );
      default:
        return (
          <Home 
            user={user} 
            onNavigate={navigate} 
            onViewDonor={(donor) => handleViewDonor(donor, 'home')} 
            onUpdateUser={(updatedUser) => setUser(updatedUser)}
            currentLocation={currentLocation}
          />
        );
    }
  };

  return (
    <div className="h-full w-full bg-white overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full overflow-y-auto scrollbar-hide"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
