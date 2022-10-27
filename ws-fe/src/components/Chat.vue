<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div class="left-panel">
      <user v-for="user in users" 
        :key="user.userID" 
        :user="user" 
        :selected="selectedUser === user"
        @select="onSelectUser(user)" 
      />
    </div>
    <message-panel v-if="selectedUser" :user="selectedUser" @input="onMessage" class="right-panel" />
  </div>
</template>

<script setup>
import socket from "../socket.js";
import User from "./User.vue";
import MessagePanel from "./MessagePanel.vue";
import { ref, onBeforeUnmount } from "vue"
const selectedUser = ref(null)
const users = ref([])

const onMessage = (content) => {
  if (selectedUser.value) {
    socket.emit("private message", {
      content,
      to: selectedUser.value.userID,
    });
    selectedUser.value.messages.push({
      content,
      fromSelf: true,
    });
  }
}
const onSelectUser = (user) => {
  selectedUser.value = user;
  user.hasNewMessages = false;
}
const initSocket = () => {
  socket.on("connect", () => {
    users.value.forEach((user) => {
      if (user.self) {
        user.connected = true;
      }
    });
  });

  socket.on("disconnect", () => {
    this.users.forEach((user) => {
      if (user.self) {
        user.connected = false;
      }
    });
  });

  const initReactiveProperties = (user) => {
    user.hasNewMessages = false;
  };

  socket.on("users", (userList) => {
    console.log(userList)
    userList.forEach((user) => {
      user.messages.forEach((message) => {
        message.fromSelf = message.from === socket.userID;
      });
      for (let i = 0; i < users.value.length; i++) {
        const existingUser = users.value[i];
        if (existingUser.userID === user.userID) {
          existingUser.connected = user.connected;
          existingUser.messages = user.messages;
          return;
        }
      }
      user.self = user.userID === socket.userID;
      initReactiveProperties(user);
      users.value.push(user);
    });
    // put the current user first, and sort by username
    users.value.sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
  });

  socket.on("user connected", (user) => {
    for (let i = 0; i < users.value.length; i++) {
      const existingUser = users.value[i]
      if (existingUser.userID === user.userID) {
        existingUser.connected = true;
        return;
      }
    }
    initReactiveProperties(user);
    this.users.push(user);
  });

  socket.on("user disconnected", (id) => {
    for (let i = 0; i < users.value.length; i++) {
      const user = users.value[i]
      if (user.userID === id) {
        user.connected = false;
        break;
      }
    }
  });

  socket.on("private message", ({ content, from, to }) => {
    for (let i = 0; i < users.value.length; i++) {
      const user = users.value[i]
      const fromSelf = socket.userID === from;
      if (user.userID === (fromSelf ? to : from)) {
        user.messages.push({
          content,
          fromSelf,
        });
        if (user !== selectedUser.value) {
          user.hasNewMessages = true;
        }
        break;
      }
    }
  });
}

initSocket()

onBeforeUnmount(() => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("users");
  socket.off("user connected");
  socket.off("user disconnected");
  socket.off("private message");
})
</script>

<style scoped>
.left-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  overflow-x: hidden;
  background-color: #3f0e40;
  color: white;
}

.right-panel {
  height: 100vh;
  width: calc(100vw - 260px);
}

.right-panel {
  margin-left: 260px;
}
</style>
