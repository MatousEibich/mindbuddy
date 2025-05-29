declare module '@env' {
  export const OPENAI_API_KEY: string;
}

// Global type declarations

declare module 'react-native-autogrow-textinput' {
  import React from 'react';
  import { TextInputProps } from 'react-native';
  
  interface AutoGrowingTextInputProps extends TextInputProps {
    maxHeight?: number;
    minHeight?: number;
    enableScrollToCaret?: boolean;
  }
  
  export class AutoGrowingTextInput extends React.Component<AutoGrowingTextInputProps> {}
} 