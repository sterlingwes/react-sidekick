import React from "react";
import { Provider as RRProvider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ActionList } from "./src/screens/ActionList";
import { DetailScreen } from "./src/screens/DetailScreen";
import { getStore } from "./src/other";
import { MenuButton } from "./src/components";
import OldSchoolModal from "./src/components/OldSchoolModal";
import { SettingsProfileScreen } from "./src/screens/SettingsProfileScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

const RootStack = createNativeStackNavigator();

const store = getStore();

export const Main = () => {
  return (
    <RRProvider store={store}>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={({ navigation }) => ({
            headerLeft: () => (
              <MenuButton
                label="Settings"
                onPress={() => navigation.navigate("Settings")}
              />
            ),
          })}
        >
          <RootStack.Screen name="Home" component={ActionList} />
          <RootStack.Screen name="Detail" component={DetailScreen} />
          <RootStack.Group
            screenOptions={{
              presentation: "modal",
            }}
          >
            <RootStack.Screen name="Settings" component={SettingsScreen} />
            <RootStack.Screen
              name="SettingsProfile"
              component={SettingsProfileScreen}
            />
            <RootStack.Screen
              name="OldFunctionModal"
              component={OldSchoolModal}
            />
          </RootStack.Group>
        </RootStack.Navigator>
      </NavigationContainer>
    </RRProvider>
  );
};
