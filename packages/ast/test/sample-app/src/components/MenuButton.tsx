import React from "react";
import { TouchableOpacity } from "react-native";
import { Type } from "./Type";

export const MenuButton = ({ onPress, label }: any) => (
  <TouchableOpacity onPress={onPress}>
    <Type>{label}</Type>
  </TouchableOpacity>
);
