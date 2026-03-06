import type {
  ChatGroup,
  ChatMember,
  ChatMessage,
  SendMessageRequest,
  ChatGroupListParams,
  ChatMessagesParams,
  RecentMessagesParams,
} from "../types/chat";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Helper function for authenticated GET requests
 */
async function authenticatedGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(
      error.message || error.detail?.[0]?.msg || "Request failed",
    );
  }

  return res.json();
}

/**
 * Helper function for authenticated POST requests
 */
async function authenticatedPost<T>(
  path: string,
  token: string,
  body?: object,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(
      error.message || error.detail?.[0]?.msg || "Request failed",
    );
  }

  return res.json();
}

/**
 * Helper function for authenticated DELETE requests
 */
async function authenticatedDelete<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(
      error.message || error.detail?.[0]?.msg || "Request failed",
    );
  }

  return res.json();
}

export const chatApi = {
  /**
   * Get all chat groups for the authenticated user
   */
  async getMyChatGroups(
    token: string,
    params?: ChatGroupListParams,
  ): Promise<ChatGroup[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined)
      queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined)
      queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const path = `/api/v1/chats/my-groups${query ? `?${query}` : ""}`;

    return authenticatedGet<ChatGroup[]>(path, token);
  },

  /**
   * Get a specific chat group by ID
   */
  async getChatGroup(token: string, chatGroupId: number): Promise<ChatGroup> {
    return authenticatedGet<ChatGroup>(`/api/v1/chats/${chatGroupId}`, token);
  },

  /**
   * Get chat group for a specific trip vacancy
   */
  async getChatGroupByTripVacancy(
    token: string,
    tripVacancyId: number,
  ): Promise<ChatGroup> {
    return authenticatedGet<ChatGroup>(
      `/api/v1/chats/trip-vacancy/${tripVacancyId}`,
      token,
    );
  },

  /**
   * Get all members of a chat group
   */
  async getChatMembers(
    token: string,
    chatGroupId: number,
    params?: ChatGroupListParams,
  ): Promise<ChatMember[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined)
      queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined)
      queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const path = `/api/v1/chats/${chatGroupId}/members${query ? `?${query}` : ""}`;

    return authenticatedGet<ChatMember[]>(path, token);
  },

  /**
   * Get message history for a chat group
   */
  async getMessages(
    token: string,
    chatGroupId: number,
    params?: ChatMessagesParams,
  ): Promise<ChatMessage[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined)
      queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined)
      queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const path = `/api/v1/chats/${chatGroupId}/messages${query ? `?${query}` : ""}`;

    return authenticatedGet<ChatMessage[]>(path, token);
  },

  /**
   * Get recent messages for a chat group
   */
  async getRecentMessages(
    token: string,
    chatGroupId: number,
    params?: RecentMessagesParams,
  ): Promise<ChatMessage[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined)
      queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const path = `/api/v1/chats/${chatGroupId}/messages/recent${query ? `?${query}` : ""}`;

    return authenticatedGet<ChatMessage[]>(path, token);
  },

  /**
   * Send a message via REST API (fallback when WebSocket is not available)
   */
  async sendMessage(
    token: string,
    chatGroupId: number,
    content: string,
  ): Promise<ChatMessage> {
    const body: SendMessageRequest = { content };
    return authenticatedPost<ChatMessage>(
      `/api/v1/chats/${chatGroupId}/messages`,
      token,
      body,
    );
  },

  /**
   * Delete a message
   */
  async deleteMessage(
    token: string,
    chatGroupId: number,
    messageId: number,
  ): Promise<{ message: string }> {
    return authenticatedDelete<{ message: string }>(
      `/api/v1/chats/${chatGroupId}/messages/${messageId}`,
      token,
    );
  },

  /**
   * Get active users in a chat group (currently connected via WebSocket)
   */
  async getActiveUsers(token: string, chatGroupId: number): Promise<number[]> {
    return authenticatedGet<number[]>(
      `/api/v1/chats/${chatGroupId}/active-users`,
      token,
    );
  },

  /**
   * Get WebSocket URL for a chat group
   */
  getWebSocketUrl(chatGroupId: number, token: string): string {
    const wsBase = BASE.replace("http://", "ws://").replace(
      "https://",
      "wss://",
    );
    return `${wsBase}/api/v1/chats/ws/${chatGroupId}?token=${token}`;
  },
};
