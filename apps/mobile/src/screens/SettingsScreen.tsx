import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Button, ActivityIndicator } from "react-native";
import { loadProfile, saveProfile } from "@mindbuddy/core/src/storage";
import type { Profile } from "@mindbuddy/core/src/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
        setProfile(loadedProfile);
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
    <View style={styles.container}>
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

      <Button
        title={isSaving ? "Saving..." : "Save"}
        onPress={handleSave}
        disabled={isSaving}
      />
    </View>
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
}); 