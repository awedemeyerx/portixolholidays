import type { Metadata } from 'next';
import type { ServerFunctionClient } from 'payload';
import React from 'react';
import config from '@payload-config';
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
import { importMap } from './admin/importMap';
import './custom.css';

export const metadata: Metadata = {
  title: 'Portixol Holidays Admin',
};

const serverFunction: ServerFunctionClient = async (args) => {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
