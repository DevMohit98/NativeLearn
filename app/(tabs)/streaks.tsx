import { StyleSheet, Text, View } from "react-native";
export default function Streaks() {
  return (
    <View style={styles.view}>
      <Text>This is About Page</Text>
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
