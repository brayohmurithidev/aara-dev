import React, { useLayoutEffect, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import MatchedUsers from "@/components/matchedUsers.tsx";
import { useNavigation } from "expo-router";
import { useAuth } from "@/context/AuthProvider.tsx";
import ReceivedRequest from "@/components/receivedRequests.tsx";
import SentRequest from "@/components/sentRequests.tsx";
import { Text } from "react-native-paper";

const Matches = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>("Suggestions");
  const [searchTerm, setSearchTerm] = React.useState("");
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Add search
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search Someone",
        inputType: "text",
        onChangeText: (event: any) => {
          setSearchTerm(event.nativeEvent.text);
        },
      },
    });
  }, [navigation]);

  return (
    <SafeAreaView edges={[]} style={styles.container}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={[]}
        renderItem={null}
        ListHeaderComponent={() => (
          <>
            {/*<ButtonGroup*/}
            {/*  buttons={["Suggestions", "Requests", "Pending"]}*/}
            {/*  selectedIndex={selectedIndex}*/}
            {/*  onPress={(value) => {*/}
            {/*    setSelectedIndex(value);*/}
            {/*  }}*/}
            {/*  containerStyle={{ marginBottom: 20 }}*/}
            {/*  selectedButtonStyle={{*/}
            {/*    backgroundColor: Colors.ecru800,*/}
            {/*    borderRadius: 16,*/}
            {/*  }}*/}
            {/*  selectedTextStyle={{ color: "#fff" }}*/}
            {/*  // buttonContainerStyle={{*/}
            {/*  //   borderRadius: 16,*/}
            {/*  // }}*/}
            {/*/>*/}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
                marginTop: 24,
              }}
            >
              {["Suggestions", "Requests", "Pending"].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={
                    selectedIndex === index && {
                      backgroundColor: "#E1DAD5",
                      padding: 8,
                      borderRadius: 16,
                    }
                  }
                  onPress={() => setSelectedIndex(index)}
                >
                  <Text variant="titleMedium">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedIndex === 0 ? (
              <MatchedUsers
                searchTerm={searchTerm}
                selectedIndex={selectedIndex}
              />
            ) : selectedIndex === 1 ? (
              <ReceivedRequest searchTerm={searchTerm} />
            ) : selectedIndex === 2 ? (
              <SentRequest searchTerm={searchTerm} />
            ) : null}
          </>
        )}
      />
      {/*<ProfileCompletionPrompt isOpen={true} />*/}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    // backgroundColor: Colors.mainBackground,
  },
});

export default Matches;
