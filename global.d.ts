// This file fixes type errors for packages like expo-file-system

declare module 'expo-file-system' {
  export const documentDirectory: string | null;
  export enum EncodingType {
    UTF8 = 'utf8',
    Base64 = 'base64',
  }
  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: { encoding?: EncodingType | string }
  ): Promise<void>;
  
  // Add other exports from expo-file-system if you use them
}

// This declaration helps TypeScript understand .png imports
declare module '*.png' {
  const value: any;
  export default value;
}