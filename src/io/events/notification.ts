import { Notification } from "../namespaces";
// import { NotificationHandler } from "../handlers/sockets";

const notification = new Notification();

// notification.onConnection(NotificationHandler.onConnection.bind(NotificationHandler));
// notification.register("disconnect", NotificationHandler.disconnect.bind(NotificationHandler));

export default notification;