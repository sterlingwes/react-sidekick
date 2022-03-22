import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { MenuButton } from "../components";

export const DetailScreen = ({ route, navigation }: any) => {
  const {
    action: { id, titleText },
  } = route.params;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <MenuButton label="Back" onPress={navigation.goBack} />,
    });
  }, []);

  return (
    <>
      <View>
        <Text>{id}</Text>
        <Text>{titleText}</Text>
      </View>
    </>
  );
};
