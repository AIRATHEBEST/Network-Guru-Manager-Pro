import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../services/notifications';

export default function TabLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="workspaces"
        options={{
          title: 'Workspaces',
        }}
      />
      <Tabs.Screen
        name="advanced-search"
        options={{
          title: 'Search',
        }}
      />
      {/* Add other tabs here as needed */}
    </Tabs>
  );
}
