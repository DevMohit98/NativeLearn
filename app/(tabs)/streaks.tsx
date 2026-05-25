import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
export default function Streaks() {
  const { logout } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    logout();
    router.replace("/login");
  };

  return (
    <View style={styles.view}>
      <Text>This is About Page</Text>
      <Button
        mode="contained"
        buttonColor="#e53935"
        textColor="white"
        onPress={handleLogout}
        style={{ marginTop: 20 }}>
        Logout
      </Button>
    </View>
  );
}
const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
