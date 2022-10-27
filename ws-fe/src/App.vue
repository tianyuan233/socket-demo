<template>
  <div id="app">
    <select-username
      v-if="!usernameAlreadySelected"
      @input="onUsernameSelection"
    />
    <chat v-else />
  </div>
</template>

<script setup>
import SelectUsername from "./components/SelectUsername.vue";
import Chat from "./components/Chat.vue";
import socket from "./socket.js";
import {ref, onBeforeUnmount} from 'vue'

let usernameAlreadySelected = ref(false)

function onUsernameSelection(username) {
  usernameAlreadySelected.value = true;
  socket.auth = { username };
  socket.connect();
}
function init() {
  const sessionID = localStorage.getItem("sessionID");

  if (sessionID) {
    usernameAlreadySelected.value = true;
    socket.auth = { sessionID };
    socket.connect();
  }

  socket.on("session", ({ sessionID, userID }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    // save the ID of the user
    socket.userID = userID;
  });

  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      usernameAlreadySelected.value = false;
    }
  });
}
init()
onBeforeUnmount(()=>{
  socket.off("connect_error");
})
</script>

<style>
body {
  margin: 0;
}

/* @font-face {
  font-family: Lato;
  src: url("/fonts/Lato-Regular.ttf");
} */

#app {
  font-family: Lato, Arial, sans-serif;
  font-size: 14px;
}
</style>
