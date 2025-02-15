import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Wish = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WishList'>;
  wishes: Wish[];
  onDeleteWish?: (id: string) => void;
};

export function WishListScreen({ navigation, wishes = [], onDeleteWish }: Props) {
  const handleDeleteWish = (id: string) => {
    Alert.alert(
      'Delete Wish',
      'Are you sure you want to remove this wish from your list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => onDeleteWish?.(id),
          style: 'destructive',
        },
      ]
    );
  };

  if (wishes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your wish list is empty! 🎁</Text>
        <Text style={styles.emptySubtext}>
          Start adding your Christmas wishes...
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddWish')}
        >
          <Text style={styles.addButtonText}>Add First Wish ✨</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.wishItem}>
            <View style={styles.wishContent}>
              <Text style={styles.wishTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.wishDescription}>{item.description}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteWish(item.id)}
            >
              <Text style={styles.deleteButtonText}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddWish')}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  wishItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  wishContent: {
    flex: 1,
  },
  wishTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  wishDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
}); 