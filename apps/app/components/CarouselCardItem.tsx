import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";

export const SLIDER_WIDTH = Dimensions.get("window").width;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);

interface props {
  item: any;
  index: any;
}

const CarouselCardItem = ({ item, index }: props) => {
  return (
    <View style={styles.container} key={index}>
      <Text style={styles.header}>{item.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4E48B2",
    borderRadius: 8,
    padding: 100,
    margin: 10,
  },
  header: {
    color: "#f4f4f4",
    fontSize: 28,
    fontWeight: "bold",
  },
});

export default CarouselCardItem;
