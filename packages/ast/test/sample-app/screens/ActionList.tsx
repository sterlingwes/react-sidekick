import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";

const host = "https://some.host";
const query = `
  query { 
    someQuery
  }
`;

interface ProgramActionResponse {
  data: {
    program: {
      id: string;
      name: string;
      actions: ProgramAction[];
    };
  };
}

interface ProgramAction {
  id: string;
  titleText: string;
}

const fetchActions = async (): Promise<ProgramActionResponse> => {
  const response = await fetch(host, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });

  return response.json();
};

// expected no dependencies for this hook b/c only on mount
// eslint-disable-next-line react-hooks/exhaustive-deps
const useMount = (onMount: any) => useEffect(onMount, []);

export const ActionList = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<ProgramAction[]>([]);

  const { firstName, lastName } = useSelector((state: any) => state);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchActions();
      setLoading(false);
      setActions(response.data.program.actions);
    } catch (err) {
      setLoading(false);
      console.warn(err);
    }
  };

  useMount(() => {
    loadData();
  });

  const onPressItem = (action: ProgramAction) => {
    navigation.navigate("Detail", { action });
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.flatListItem}>
        <Text>{item.titleText}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>{`Welcome ${firstName} ${lastName}!`}</Text>
      </View>
      <FlatList
        refreshControl={
          <RefreshControl onRefresh={loadData} refreshing={loading} />
        }
        data={actions}
        renderItem={renderItem}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flatList: { width: "100%" },
  flatListItem: {
    paddingVertical: 20,
    padding: 10,
    border: 1,
    borderColor: "grey",
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    margin: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
