/* eslint-disable @typescript-eslint/naming-convention */
import { Layout } from 'app/layout/layout.types';

// Types
export type Scheme = 'auto' | 'dark' | 'light';
export type Screens = { [key: string]: string };
export type Theme = 'theme-default' | string;
export type Themes = { id: string; name: string }[];
export const Months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * AppConfig interface. Update this interface to strictly type your config
 * object.
 */
export interface AppConfig {
  layout: Layout;
  scheme: Scheme;
  screens: Screens;
  theme: Theme;
  themes: Themes;
  timeformat: string;
}

export interface Relationship {
  ClassName: string;
  CssClass: string;
  Enabled: number | boolean;
  Icon: string;
  InverseRelationshipName: string;
  RelationshipId: number;
  RelationshipName: string;
}

export interface CabinetClass {
  ClassDisplayName: string;
  ClassGroup: string;
  ClassId: number;
  ClassName: string;
  CssClass: string;
  Enabled: number;
  Icon: string;
  IsPublic: number;
  IsPublicApp: boolean;
  LastViewRefresh: string;
  Personae: string;
  Type: string;
}

/**
 * Default configuration for the entire application. This object is used by
 * FuseConfigService to set the default configuration.
 *
 * If you need to store global configuration for your app, you can use this
 * object to set the defaults. To access, update and reset the config, use
 * FuseConfigService and its methods.
 *
 * "Screens" are carried over to the BreakpointObserver for accessing them within
 * components, and they are required.
 *
 * "Themes" are required for Tailwind to generate themes.
 */
export const appConfig: AppConfig = {
  layout: 'classy',
  scheme: 'light',
  screens: {
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1440px'
  },
  theme: 'theme-brand',
  themes: [
    {
      id: 'theme-default',
      name: 'Default'
    },
    {
      id: 'theme-brand',
      name: 'Brand'
    },
    {
      id: 'theme-teal',
      name: 'Teal'
    },
    {
      id: 'theme-rose',
      name: 'Rose'
    },
    {
      id: 'theme-purple',
      name: 'Purple'
    },
    {
      id: 'theme-amber',
      name: 'Amber'
    }
  ],
  timeformat: 'DD/MM/Y',
};

export let appVersion: string;
export let appClasses: CabinetClass[] = [];
export let appRelationship: Relationship[] = [];
export let appUserPersonae: string[] = [];

export const setAppVersion = (v: string): void => {
  appVersion = v;
};

export const setAppClasses = (classes: CabinetClass[]): void => {
  appClasses = classes;
};

export const setAppRelations = (relations: Relationship[]): void => {
  appRelationship = relations;
};

export const setAppUserPersonae = (personae: string[]): void => {
  appUserPersonae = personae;
};
