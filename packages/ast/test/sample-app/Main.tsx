import React from "react";
import { Provider as RRProvider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ActionList } from "./screens/ActionList";
import { DetailScreen } from "./screens/DetailScreen";
import { getStore } from "./other";
import { MenuButton } from "./components";
import { SettingsProfileScreen } from "./screens/SettingsProfileScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

const Stack = createNativeStackNavigator();

const store = getStore();

export const Main = () => {
  return (
    <RRProvider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            headerLeft: () => (
              <MenuButton
                label="Settings"
                onPress={() => navigation.navigate("Settings")}
              />
            ),
          })}
        >
          <Stack.Screen name="Home" component={ActionList} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Group
            screenOptions={{
              presentation: "modal",
            }}
          >
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="SettingsProfile"
              component={SettingsProfileScreen}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </RRProvider>
  );
};
