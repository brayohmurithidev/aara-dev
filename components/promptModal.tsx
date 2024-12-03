import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Modal from "@/components/modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import TextArea from "@/components/textArea";
import { Button, Text } from "react-native-paper";

const prompts = [
  {
    title: "My ideal workout buddy is someone who ...",
  },
  {
    title: "My favorite wat to stay active outside the gym is ...",
  },
  {
    title: "My go-to-post-workout meal or snack is ...",
  },
  {
    title: "My favorite thing about working out with a partner is ...",
  },
  {
    title:
      "The most challenging part of maintaining a consistent workout routine is ...",
  },
  {
    title: "My favorite quote or mantra that keeps me motivated is...",
  },
  {
    title: "If I could try any fitness activity or sport, it would be...",
  },
  {
    title:
      "The one piece of advice I'd give to someone starting their fitness journey is...",
  },
  {
    title: "My favorite workout playlist currently includes...",
  },
  {
    title: "The one fitness goal I'm currently working towards is...",
  },
];

const PromptModal = ({
  visibility,
  setVisibility,
  setFieldValue,
  prompt,
}: {
  visibility: boolean;
  setVisibility: any;
  setFieldValue: any;
  prompt: any;
}) => {
  const { top } = useSafeAreaInsets();

  const [promptVisible, setPromptVisible] = useState(false);
  const [text, setText] = useState("");
  const [promptQA, setPromptQA] = useState("");

  const handleChange = (text: string) => {
    setText(text);
  };

  const handleSubmit = () => {
    if (text !== "" && promptQA !== "") {
      prompt.push({
        q: promptQA,
        a: text,
      });

      setPromptVisible(false);
      setVisibility(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={{
        height: 125,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cfcece",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
      onPress={() => {
        setPromptQA(item?.title);
        setPromptVisible(true);
      }}
    >
      <Text variant="titleMedium" style={{ textAlign: "center" }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visibility}
      contentCardStyles={{
        flex: 1,
        width: "100%",
        height: "100%",
        elevation: 4,
      }}
      closeButtonStyles={{ left: 10, top: top + 30 }}
      onClose={() => setVisibility(false)}
    >
      <ScrollView
        style={{ marginTop: top + 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="titleLarge"
          style={{
            textAlign: "center",
            // marginTop: 60,
          }}
        >
          Get to know me prompt
        </Text>
        <Text
          size="lg"
          style={{
            marginTop: 10,
            marginBottom: 40,
            width: "90%",
            textAlign: "center",
            marginHorizontal: "auto",
          }}
        >
          Tell us a bt about yourself so we can personalize your experience!
        </Text>
        <FlashList
          data={prompts}
          renderItem={renderItem}
          estimatedItemSize={50}
          ItemSeparatorComponent={() => <View style={{ height: 12 }}></View>}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </ScrollView>

      <Modal visible={promptVisible} contentCardStyles={{ width: "100%" }}>
        <KeyboardAvoidingView
          // style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={top + 20}
        >
          <ScrollView keyboardShouldPersistTaps="always">
            <Text variant="titleMedium">{promptQA}</Text>
            <TextArea
              value={text}
              onChangeText={handleChange}
              style={{ maxHeight: 390 }}
              placeholder="Let everyone know"
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Button
                style={{ backgroundColor: "transparent" }}
                buttonTextStyles={{ color: "#201C1C" }}
                onPress={() => setPromptVisible(false)}
              >
                Cancel
              </Button>
              <Button disabled={text === ""} onPress={handleSubmit}>
                Done
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Modal>
  );
};

export default PromptModal;
