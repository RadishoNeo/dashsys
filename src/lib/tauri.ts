import { invoke } from "@tauri-apps/api/core";

export const invokeCommand = async <T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> => {
  return invoke<T>(command, args);
};

