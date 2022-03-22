import React, { useState } from "react";
import { useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch } from "react-redux";
import { MenuButton } from "../components";
import { saveProfile } from "../other";

export const SettingsProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <MenuButton label="Back" onPress={navigation.goBack} />,
    });
  }, []);

  const onSave = () => {
    dispatch(saveProfile({ firstName, lastName }));
    navigation.goBack();
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Profile Settings</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={setFirstName}
        placeholder="First Name"
        value={firstName}
      />
      <TextInput
        style={styles.textInput}
        onChangeText={setLastName}
        placeholder="Last Name"
        value={lastName}
      />
      <Text onPress={onSave} style={styles.button}>
        Save
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    margin: 20,
  },
  headerText: {
    fontSize: 20,
  },
  textInput: {
    paddingVertical: 20,
    fontSize: 16,
  },
  button: {
    padding: 20,
    backgroundColor: "blue",
    color: "white",
  },
});
