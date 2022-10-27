import { Manager } from "socket.io-client";

const URL = "http://localhost:8080";

const manager = new Manager(URL)

const socket = manager.socket()


socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
