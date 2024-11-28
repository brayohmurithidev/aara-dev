import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthProvider.tsx";

const Home = () => {
  const { signOut } = useAuth();
  return (
    <SafeAreaView>
      <Text>Home</Text>
      <Button mode="contained" onPress={signOut}>
        Logout
      </Button>
    </SafeAreaView>
  );
};

export default Home;
