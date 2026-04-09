export interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  callbackPath: string;
}

export function getProviderConfig(provider: string): OAuthProviderConfig | null {
  switch (provider) {
    case 'garmin':
      return {
        authUrl: 'https://connect.garmin.com/oauthConfirm',
        tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
        clientId: process.env.GARMIN_CLIENT_ID ?? '',
        clientSecret: process.env.GARMIN_CLIENT_SECRET ?? '',
        scopes: [],
        callbackPath: '/wearables/callback/garmin',
      };
    case 'strava':
      return {
        authUrl: 'https://www.strava.com/oauth/authorize',
        tokenUrl: 'https://www.strava.com/oauth/token',
        clientId: process.env.STRAVA_CLIENT_ID ?? '',
        clientSecret: process.env.STRAVA_CLIENT_SECRET ?? '',
        scopes: ['read', 'activity:read_all', 'profile:read_all'],
        callbackPath: '/wearables/callback/strava',
      };
    case 'polar':
      return {
        authUrl: 'https://flow.polar.com/oauth2/authorization',
        tokenUrl: 'https://polarremote.com/v2/oauth2/token',
        clientId: process.env.POLAR_CLIENT_ID ?? '',
        clientSecret: process.env.POLAR_CLIENT_SECRET ?? '',
        scopes: ['accesslink.read_all'],
        callbackPath: '/wearables/callback/polar',
      };
    case 'oura':
      return {
        authUrl: 'https://cloud.ouraring.com/oauth/authorize',
        tokenUrl: 'https://api.ouraring.com/oauth/token',
        clientId: process.env.OURA_CLIENT_ID ?? '',
        clientSecret: process.env.OURA_CLIENT_SECRET ?? '',
        scopes: ['daily', 'heartrate', 'workout', 'sleep', 'personal'],
        callbackPath: '/wearables/callback/oura',
      };
    case 'fitbit':
      return {
        authUrl: 'https://www.fitbit.com/oauth2/authorize',
        tokenUrl: 'https://api.fitbit.com/oauth2/token',
        clientId: process.env.FITBIT_CLIENT_ID ?? '',
        clientSecret: process.env.FITBIT_CLIENT_SECRET ?? '',
        scopes: ['activity', 'heartrate', 'sleep', 'profile', 'oxygen_saturation'],
        callbackPath: '/wearables/callback/fitbit',
      };
    case 'whoop':
      return {
        authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
        tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
        clientId: process.env.WHOOP_CLIENT_ID ?? '',
        clientSecret: process.env.WHOOP_CLIENT_SECRET ?? '',
        scopes: ['read:recovery', 'read:cycles', 'read:sleep', 'read:workout', 'read:profile', 'read:body_measurement'],
        callbackPath: '/wearables/callback/whoop',
      };
    default:
      return null;
  }
}

export const SUPPORTED_PROVIDERS = [
  { id: 'garmin', name: 'Garmin', icon: 'watch' },
  { id: 'strava', name: 'Strava', icon: 'activity' },
  { id: 'polar', name: 'Polar', icon: 'watch' },
  { id: 'oura', name: 'Oura Ring', icon: 'circle' },
  { id: 'fitbit', name: 'Fitbit', icon: 'watch' },
  { id: 'apple_health', name: 'Apple Health', icon: 'heart' },
  { id: 'whoop', name: 'WHOOP', icon: 'activity' },
];
