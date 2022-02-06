import React from "react";
import { Text, TouchableOpacity } from "react-native";

export const MenuButton = ({ onPress, label }: any) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{label}</Text>
  </TouchableOpacity>
);
