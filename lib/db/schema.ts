import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (users) => ({
    usernameIndex: index("idx_users_username").on(users.username),
  })
);

export const chats = pgTable(
  "chats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (chats) => ({
    userIdIndex: index("idx_chats_user_id").on(chats.user_id),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chat_id: uuid("chat_id")
      .references(() => chats.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (messages) => ({
    chatIdIndex: index("idx_messages_chat_id").on(messages.chat_id),
    chatCreatedAtIndex: index("idx_messages_chat_id_created_at").on(
      messages.chat_id,
      messages.created_at
    ),
  })
);
