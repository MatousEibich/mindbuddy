import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Thread } from '@mindbuddy/core';
import { 
  listThreads, 
  createThread, 
  renameThread, 
  deleteThread 
} from '@mindbuddy/core';

type RootStackParamList = {
  Threads: undefined;
  Chat: { threadId: string; threadName: string };
  Settings: undefined;
};

type ThreadsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Threads'>;
};

const ThreadsScreen = ({ navigation }: ThreadsScreenProps) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load threads from storage
  const loadThreads = async () => {
    try {
      const threadList = await listThreads();
      // Sort newest first
      const sortedThreads = threadList.sort((a, b) => b.created - a.created);
      setThreads(sortedThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
      Alert.alert('Error', 'Failed to load conversation threads.');
    } finally {
      setIsLoading(false);
    }
  };

  // First-run auto-thread creation
  const ensureDefaultThread = async () => {
    try {
      const threadList = await listThreads();
      if (threadList.length === 0) {
        console.log('No threads found, creating default thread...');
        const defaultThread = await createThread("My First Chat");
        setThreads([defaultThread]);
        return defaultThread;
      }
      return null;
    } catch (error) {
      console.error('Error creating default thread:', error);
    }
  };

  // Load threads on screen focus
  useFocusEffect(
    useCallback(() => {
      const initializeThreads = async () => {
        setIsLoading(true);
        await ensureDefaultThread();
        await loadThreads();
      };
      
      initializeThreads();
    }, [])
  );

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadThreads();
    setIsRefreshing(false);
  };

  // Create new thread
  const handleCreateThread = () => {
    Alert.prompt(
      'New Conversation',
      'Enter a name for your new conversation:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: async (name) => {
            if (name && name.trim()) {
              try {
                const newThread = await createThread(name.trim());
                await loadThreads(); // Reload to ensure correct sorting
                // Navigate to the new thread
                navigation.navigate('Chat', { 
                  threadId: newThread.id, 
                  threadName: newThread.name 
                });
              } catch (error) {
                console.error('Error creating thread:', error);
                Alert.alert('Error', 'Failed to create new conversation.');
              }
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  // Handle thread actions (rename/delete)
  const handleThreadActions = (thread: Thread) => {
    const actions = ['Rename', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: actions,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            handleRenameThread(thread);
          } else if (buttonIndex === 1) {
            handleDeleteThread(thread);
          }
        }
      );
    } else {
      // For Android, use Alert with buttons
      Alert.alert(
        thread.name,
        'Choose an action:',
        [
          {
            text: 'Rename',
            onPress: () => handleRenameThread(thread),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeleteThread(thread),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  // Rename thread
  const handleRenameThread = (thread: Thread) => {
    Alert.prompt(
      'Rename Conversation',
      'Enter a new name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Rename',
          onPress: async (newName) => {
            if (newName && newName.trim() && newName.trim() !== thread.name) {
              try {
                await renameThread(thread.id, newName.trim());
                await loadThreads(); // Reload to show updated name
              } catch (error) {
                console.error('Error renaming thread:', error);
                Alert.alert('Error', 'Failed to rename conversation.');
              }
            }
          },
        },
      ],
      'plain-text',
      thread.name,
      'default'
    );
  };

  // Delete thread
  const handleDeleteThread = (thread: Thread) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${thread.name}"? This cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteThread(thread.id);
              await loadThreads(); // Reload to remove deleted thread
              
              // Note: If the deleted thread is currently open in Chat screen,
              // the navigation will handle it when user goes back
            } catch (error) {
              console.error('Error deleting thread:', error);
              Alert.alert('Error', 'Failed to delete conversation.');
            }
          },
        },
      ]
    );
  };

  // Navigate to chat with selected thread
  const handleSelectThread = (thread: Thread) => {
    navigation.navigate('Chat', { 
      threadId: thread.id, 
      threadName: thread.name 
    });
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Render thread item
  const renderThread = ({ item }: { item: Thread }) => (
    <TouchableOpacity
      style={styles.threadItem}
      onPress={() => handleSelectThread(item)}
      onLongPress={() => handleThreadActions(item)}
      activeOpacity={0.7}
    >
      <View style={styles.threadContent}>
        <Text style={styles.threadName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.threadTime}>
          {formatRelativeTime(item.created)}
        </Text>
      </View>
      <View style={styles.threadArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Conversations</Text>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Conversations</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={threads}
        renderItem={renderThread}
        keyExtractor={(item) => item.id}
        style={styles.threadList}
        contentContainerStyle={styles.threadListContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to start your first chat</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateThread}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a69bd',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  threadList: {
    flex: 1,
  },
  threadListContent: {
    padding: 16,
  },
  threadItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  threadContent: {
    flex: 1,
  },
  threadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  threadTime: {
    fontSize: 14,
    color: '#666',
  },
  threadArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a69bd',
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
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ThreadsScreen; 