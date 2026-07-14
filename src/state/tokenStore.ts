import * as SecureStore from "expo-secure-store";

const KEY = "jwt_token";

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(KEY, token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(KEY);
};

export const clearToken = async () => {
  await SecureStore.deleteItemAsync(KEY);
};
