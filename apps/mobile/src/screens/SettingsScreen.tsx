import { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Button, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { loadProfile, saveProfile } from "@mindbuddy/core/src/storage";
import type { Profile } from "@mindbuddy/core/src/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BUBBLE_ASSIST, BUBBLE_USER, TEXT_BLACK, BG_WHITE } from '../theme/colors';

// Define navigation type
type RootStackParamList = {
  Chat: undefined;
  Settings: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for managing focus on dynamically added inputs
  const newFactInputRef = useRef<TextInput>(null);

  // Load profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const loadedProfile = await loadProfile();
        // Ensure core_facts exists and has proper format
        if (loadedProfile) {
          if (!loadedProfile.core_facts) {
            loadedProfile.core_facts = [];
          }
          // Ensure each fact has a proper id
          loadedProfile.core_facts = loadedProfile.core_facts.map(fact => ({
            ...fact,
            id: fact.id || Date.now()
          }));
          setProfile(loadedProfile);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // Update profile state with new values
  const updateProfile = (patch: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
  };

  // Add a new blank fact with focus handling
  const addFact = () => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      core_facts: [
        ...profile.core_facts,
        { id: generateUniqueId(), text: "" }
      ]
    });
    
    // Focus the new input after it's rendered
    setTimeout(() => {
      newFactInputRef.current?.focus();
    }, 50);
  };
  
  // Generate a unique ID for facts
  const generateUniqueId = (): number => {
    return Date.now();
  };

  // Update a specific fact's text
  const updateFact = (index: number, text: string) => {
    if (!profile) return;
    
    const updatedFacts = [...profile.core_facts];
    updatedFacts[index] = { ...updatedFacts[index], text };
    
    setProfile({
      ...profile,
      core_facts: updatedFacts
    });
  };

  // Delete a fact
  const deleteFact = (factId: number) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      core_facts: profile.core_facts.filter(fact => fact.id !== factId)
    });
  };

  // Save profile and navigate back
  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      await saveProfile(profile);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEXT_BLACK} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading profile.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: BG_WHITE }}
      contentContainerStyle={{ padding: 16 }}
      extraScrollHeight={20}        // small cushion
      enableOnAndroid               // uses adjustResize on Android
      keyboardOpeningTime={0}
    >
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => updateProfile({ name: text })}
          placeholder="Your name"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Pronouns</Text>
        <TextInput
          style={styles.input}
          value={profile.pronouns}
          onChangeText={(text) => updateProfile({ pronouns: text })}
          placeholder="e.g. he/him, she/her, they/them"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Style</Text>
        <View style={styles.styleOptions}>
          {(["mom", "middle", "neil"] as const).map((style) => (
            <Pressable
              key={style}
              style={[
                styles.styleOption,
                profile.style === style && styles.selectedStyle
              ]}
              onPress={() => updateProfile({ style })}
            >
              <Text style={profile.style === style ? styles.selectedStyleText : styles.styleOptionText}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Core Facts</Text>
        <Text style={styles.subText}>These are personal details the AI will remember about you.</Text>
        
        {profile.core_facts.map((fact, index) => (
          <View key={fact.id} style={styles.factRow}>
            <TextInput
              ref={index === profile.core_facts.length - 1 ? newFactInputRef : undefined}
              style={styles.factInput}
              value={fact.text}
              onChangeText={(text) => updateFact(index, text)}
              placeholder="Add a fact about yourself"
              multiline
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteFact(fact.id)}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </Pressable>
          </View>
        ))}
        
        <Pressable
          style={styles.addButton}
          onPress={addFact}
        >
          <Text style={styles.addButtonText}>+ Add Fact</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save"}
        </Text>
      </Pressable>
      
      <View style={styles.spacer} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_WHITE,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_WHITE,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: TEXT_BLACK,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  input: {
    backgroundColor: BG_WHITE,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    color: TEXT_BLACK,
  },
  styleOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  styleOption: {
    flex: 1,
    backgroundColor: BG_WHITE,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 4,
    alignItems: "center",
  },
  selectedStyle: {
    backgroundColor: BUBBLE_ASSIST, // Darker sand color for selected style
    borderColor: BUBBLE_ASSIST,
  },
  styleOptionText: {
    color: TEXT_BLACK,
    fontWeight: "500",
  },
  selectedStyleText: {
    color: TEXT_BLACK,
    fontWeight: "600",
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  factInput: {
    flex: 1,
    backgroundColor: BG_WHITE,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    minHeight: 44,
    color: TEXT_BLACK,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5", // Light gray background
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0", // Light gray border
  },
  deleteButtonText: {
    color: TEXT_BLACK, // Black X
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: BUBBLE_ASSIST, // Warm sand color for add button
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BUBBLE_ASSIST,
    marginTop: 8,
  },
  addButtonText: {
    color: TEXT_BLACK, // Black text
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: BUBBLE_ASSIST,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: BUBBLE_ASSIST,
  },
  saveButtonText: {
    color: TEXT_BLACK,
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    height: 40,
  },
}); 