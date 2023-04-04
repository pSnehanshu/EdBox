import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "@rneui/themed";
import { List, Text, View, TextInput } from "./Themed";
import { useConfig } from "../config";
import { trpc } from "../utils/trpc";

function useDebounce(value: string, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

interface SchoolSelectorProps {
  onSelect?: (schoolId: string) => void;
  onClose?: () => void;
  showCancelButton?: boolean;
}
export default function SchoolSelector({
  onSelect,
  onClose,
  showCancelButton,
}: SchoolSelectorProps) {
  const [, setConfig] = useConfig();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);

  const { data, isFetching, isError } = trpc.school.schoolList.useQuery({
    search: debouncedSearch.toLowerCase(),
    page,
  });
  const schools = data?.schools ?? [];
  const hasMore = !!data?.hasMore;

  const handleSchoolSelect = useCallback(async (schoolId: string) => {
    await setConfig({ schoolId });
    onSelect?.(schoolId);
  }, []);

  const hasPrevPage = page > 1;
  const hasNextPage = hasMore;

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for your school 🔍"
          style={styles.search_text}
        />

        {isFetching && <ActivityIndicator size="small" />}

        {showCancelButton && (
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              marginLeft: 4,
              marginRight: 16,
            })}
          >
            <Ionicons name="md-close" size={24} />
          </Pressable>
        )}
      </View>

      <List
        data={schools}
        renderItem={({ item }) => (
          <SchoolItem school={item} onSelect={handleSchoolSelect} />
        )}
        estimatedItemSize={80}
        ListHeaderComponent={
          <View>
            {isError && (
              <View>
                <Text>Error!</Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.pagination}>
            <View style={{ opacity: hasPrevPage ? 1 : 0.2 }}>
              <Ionicons.Button
                name="arrow-back-circle-outline"
                onPress={() => setPage((p) => p - 1)}
                disabled={!hasPrevPage}
              >
                Prev page
              </Ionicons.Button>
            </View>

            <View style={{ opacity: hasNextPage ? 1 : 0.2 }}>
              <Ionicons.Button
                name="arrow-forward-circle-outline"
                onPress={() => setPage((p) => p + 1)}
                disabled={!hasNextPage}
              >
                Next page
              </Ionicons.Button>
            </View>
          </View>
        }
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="always"
      />
    </View>
  );
}

function Separator() {
  return <View style={{ backgroundColor: "gray", height: 0.5 }}></View>;
}

interface SchoolItemInterface {
  school: {
    id: string;
    name: string;
    logo: string | null;
    website: string | null;
  };
  onSelect: (schoolId: string) => void;
}
function SchoolItem({ school, onSelect }: SchoolItemInterface) {
  return (
    <Pressable
      onPress={() => onSelect(school.id)}
      style={({ pressed }) => [styles.school, { opacity: pressed ? 0.5 : 1 }]}
    >
      {school.logo ? (
        <Image source={{ uri: school.logo }} style={styles.school_logo} />
      ) : (
        <Ionicons name="ios-school-outline" size={50} color="gray" />
      )}
      <Text style={styles.school_name}>{school.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingTop: 16,
  },
  search: {
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    marginBottom: 8,
  },
  search_text: {
    flexGrow: 1,
    marginLeft: 16,
  },
  school: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    height: 80,
  },
  school_logo: {
    height: 50,
    width: 50,
  },
  school_name: {
    marginLeft: 16,
    fontSize: 16,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 16,
  },
});
