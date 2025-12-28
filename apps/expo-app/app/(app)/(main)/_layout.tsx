import { useEffect } from 'react';

import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { HomeIcon, SettingsIcon } from 'lucide-react-native';

void SplashScreen.preventAutoHideAsync();

export default function MainLayout() {
  return <MainLayoutTabs />;
}

function MainLayoutTabs() {
  return (
    <Tabs initialRouteName={'index'}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          href: '/',
          tabBarIcon: () => <HomeIcon className={'h-5'} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: '/settings',
          headerShown: false,
          tabBarIcon: () => <SettingsIcon className={'h-5'} />,
        }}
      />
    </Tabs>
  );
}

function SplashScreenLoading() {
  useEffect(() => {
    return () => {
      void SplashScreen.hideAsync();
    };
  });

  return null;
}
