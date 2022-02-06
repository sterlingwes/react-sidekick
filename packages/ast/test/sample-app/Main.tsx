import React from "react";
import { ActionList } from "./ActionList";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DetailScreen } from "./DetailScreen";
import { SettingsScreen } from "./SettingsScreen";

import { Provider as RRProvider } from "react-redux";
import { getStore } from "./ReduxStore";
import { MenuButton } from "./MenuButton";
import { SettingsProfileScreen } from "./SettingsProfileScreen";

const Stack = createNativeStackNavigator();

const stackScreens = [
  {
    name: "Home",
    component: ActionList,
  },
  {
    name: "Detail",
    component: DetailScreen,
  },
];

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
          {stackScreens.map((screenConfig) => (
            <Stack.Screen key={screenConfig.name} {...screenConfig} />
          ))}
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
