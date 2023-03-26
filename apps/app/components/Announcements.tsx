import React from "react";
import type { ListRenderItem } from "@shopify/flash-list";
import { List, View } from "./Themed";
import { Message } from "schooltalk-shared/types";
import ChatMessage from "./ChatMessage";
import { useMessages } from "../utils/messages-repository";

const renderItem: ListRenderItem<Message> = ({ item }) => (
  <ChatMessage message={item} />
);

function Announcements() {
  const group = {
    name: "Don Bosco Guwahati",
    identifier: "gd=a&sc=clcpuzcxf00001yvt5ppcenso&ty=sc",
  };
  const messages = useMessages();
  const groupMessages = messages.useFetchGroupMessages(group.identifier, 7);

  console.log(groupMessages, "i");
  return (
    <View style={{ height: 200 }}>
      <List
        data={groupMessages.messages}
        renderItem={renderItem}
        // onEndReached={groupMessages.fetchNextPage}
        onEndReachedThreshold={1}
        estimatedItemSize={80}
        ListHeaderComponent={<View style={{ height: 16 }} />}
      />
    </View>
  );
}

export default Announcements;
