import type { UserLoginResponse, AuthUser } from "./authApi";

// Mock user for test@test.com
const MOCK_USER: AuthUser = {
  id: "user-001",
  email: "test@test.com",
  name: "Test User",
  isNewUser: false,
  profileComplete: true,
};

const MOCK_ACCESS_TOKEN = "mock-access-token-12345";
const MOCK_REFRESH_TOKEN = "mock-refresh-token-67890";

export const mockAuthApi = {
  async login(email: string, password: string): Promise<UserLoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === "test@test.com" && password === "test") {
      return {
        success: true,
        data: {
          user: MOCK_USER,
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
    };
  },

  async refreshToken() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      },
    };
  },
};
