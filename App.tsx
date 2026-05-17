// App.tsx
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import MainApp from './src/MainApp';

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}