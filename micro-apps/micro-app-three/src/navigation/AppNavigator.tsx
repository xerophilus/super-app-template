import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AddWishScreen } from '../screens/AddWishScreen';
import { WishListScreen } from '../screens/WishListScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ name, gender }: { name?: string; gender?: string }) {
  const [wishes, setWishes] = React.useState<Array<{ id: string; title: string; description: string }>>([]);

  const handleAddWish = (wish: { title: string; description: string }) => {
    setWishes(prev => [...prev, { ...wish, id: Date.now().toString() }]);
  };

  const handleDeleteWish = (id: string) => {
    setWishes(prev => prev.filter(wish => wish.id !== id));
  };

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#E74C3C',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        options={{
          title: "Santa's Wish List 🎅",
        }}
      >
        {(props) => <HomeScreen {...props} name={name} gender={gender} />}
      </Stack.Screen>
      
      <Stack.Screen
        name="AddWish"
        options={{
          title: 'Add a Wish ✨',
          presentation: 'modal',
        }}
      >
        {(props) => <AddWishScreen {...props} onAddWish={handleAddWish} />}
      </Stack.Screen>
      
      <Stack.Screen
        name="WishList"
        options={{
          title: 'My Wishes 📝',
        }}
      >
        {(props) => (
          <WishListScreen
            {...props}
            wishes={wishes}
            onDeleteWish={handleDeleteWish}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
} 