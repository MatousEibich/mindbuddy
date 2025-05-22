import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Button, ActivityIndicator, ScrollView } from "react-native";
import { loadProfile, saveProfile } from "@mindbuddy/core/src/storage";
import type { Profile } from "@mindbuddy/core/src/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { v4 as uuid } from "uuid";

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

  // Add a new blank fact
  const addFact = () => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      core_facts: [
        ...profile.core_facts,
        { id: generateUniqueId(), text: "" }
      ]
    });
  };
  
  // Generate a unique ID for facts
  const generateUniqueId = (): number => {
    // Convert UUID to a number by taking the first 10 digits of the timestamp
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a69bd" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Error loading profile.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => updateProfile({ name: text })}
          placeholder="Your name"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Pronouns</Text>
        <TextInput
          style={styles.input}
          value={profile.pronouns}
          onChangeText={(text) => updateProfile({ pronouns: text })}
          placeholder="e.g. he/him, she/her, they/them"
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
              style={styles.factInput}
              value={fact.text}
              onChangeText={(text) => updateFact(index, text)}
              placeholder="Add a fact about yourself"
              multiline
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

      <Button
        title={isSaving ? "Saving..." : "Save"}
        onPress={handleSave}
        disabled={isSaving}
      />
      
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  styleOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  styleOption: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 4,
    alignItems: "center",
  },
  selectedStyle: {
    backgroundColor: "#4a69bd",
    borderColor: "#4a69bd",
  },
  styleOptionText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedStyleText: {
    color: "#fff",
    fontWeight: "600",
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  factInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    minHeight: 44,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffeeee",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#ffdddd",
  },
  deleteButtonText: {
    color: "#ff5555",
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#eef5ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddeeff",
    marginTop: 8,
  },
  addButtonText: {
    color: "#4a69bd",
    fontWeight: "600",
  },
  spacer: {
    height: 40,
  },
}); 