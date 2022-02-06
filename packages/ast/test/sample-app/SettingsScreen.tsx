import React from "react";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { MenuButton } from "./MenuButton";
import { clearProfile } from "./ReduxActions";

export const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <MenuButton label="Back" onPress={navigation.goBack} />,
    });
  }, []);

  const onPressProfile = () => {
    navigation.navigate("SettingsProfile");
  };

  const onPressClearProfile = () => {
    dispatch(clearProfile());
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Pressable onPress={onPressProfile}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Profile</Text>
        </View>
      </Pressable>
      <Pressable onPress={onPressClearProfile}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Clear Profile</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: "blue",
    margin: 50,
    borderRadius: 10,
  },
  buttonText: {
    padding: 20,
    color: "white",
  },
});
