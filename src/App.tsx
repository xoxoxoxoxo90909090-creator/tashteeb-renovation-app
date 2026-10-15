import React from 'react';
import { LanguageProvider, ProjectProvider, IAPProvider } from './tashteeb/context';
import { TashteebApp } from './tashteeb/TashteebApp';

export default function App() {
  return (
    <LanguageProvider>
      <ProjectProvider>
        <IAPProvider>
          <TashteebApp />
        </IAPProvider>
      </ProjectProvider>
    </LanguageProvider>
  );
}
