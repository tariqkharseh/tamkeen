"use client";

import { QuranClient } from "@quranjs/api";

let clientInstance: QuranClient | null = null;
const isDevelopment = process.env.NODE_ENV === "development";
const CLIENT_ID = isDevelopment ? process.env.NEXT_PUBLIC_CLIENT_ID_PREPROD : process.env.NEXT_PUBLIC_CLIENT_ID_PROD;
const CLIENT_SECRET = isDevelopment ? process.env.NEXT_PUBLIC_CLIENT_SECRET_PREPROD : process.env.NEXT_PUBLIC_CLIENT_SECRET_PROD;

// Custom fetch that routes auth requests through our API route to avoid CORS
function createCustomFetch() {

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: string;
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      url = String(input);
    }
    
    // Intercept requests to the OAuth2 endpoint and route through our API
    if (url.includes("/oauth2/token")) {
      // Route through our Next.js API route
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(`Failed to get access token: ${error.error || error.details || "Unknown error"}`);
      }

      // Return the response as-is so the SDK can parse it
      return response;
    }

    // For all other requests, use the standard fetch
    return fetch(input, init);
  };
}

function getQuranClient(): QuranClient {
  if (clientInstance) {
    return clientInstance;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "NEXT_PUBLIC_CLIENT_ID_PREPROD and NEXT_PUBLIC_CLIENT_SECRET_PREPROD must be set in environment variables"
    );
  }

  // Use prelive endpoints for development
  // For production, use:
  // contentBaseUrl: "https://apis.quran.foundation"
  // authBaseUrl: "https://oauth2.quran.foundation"
  clientInstance = new QuranClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    contentBaseUrl: isDevelopment ? "https://apis-prelive.quran.foundation": "https://apis.quran.foundation",
    authBaseUrl: isDevelopment ? "https://prelive-oauth2.quran.foundation" : "https://oauth2.quran.foundation",
    fetch: createCustomFetch(), // Use custom fetch that routes auth through our API
  });

  return clientInstance;
}

// Export getter function that can be called lazily
// This prevents build-time errors when env vars are not set
export function getQuranClientInstance(): QuranClient {
  return getQuranClient();
}

