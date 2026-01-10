"use client";

import { QuranClient } from "@quranjs/api";

let clientInstance: QuranClient | null = null;

// Custom fetch that routes auth requests through our API route to avoid CORS
function createCustomFetch() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_PREPROD;
  const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET_PREPROD;

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
        body: JSON.stringify({ clientId, clientSecret }),
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

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_PREPROD;
  const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET_PREPROD;

  if (!clientId || !clientSecret) {
    throw new Error(
      "NEXT_PUBLIC_CLIENT_ID_PREPROD and NEXT_PUBLIC_CLIENT_SECRET_PREPROD must be set in environment variables"
    );
  }

  // Use prelive endpoints for development
  // For production, use:
  // contentBaseUrl: "https://apis.quran.foundation"
  // authBaseUrl: "https://oauth2.quran.foundation"
  clientInstance = new QuranClient({
    clientId,
    clientSecret,
    contentBaseUrl: "https://apis-prelive.quran.foundation",
    authBaseUrl: "https://prelive-oauth2.quran.foundation",
    fetch: createCustomFetch(), // Use custom fetch that routes auth through our API
  });

  return clientInstance;
}

// Export getter function that can be called lazily
// This prevents build-time errors when env vars are not set
export function getQuranClientInstance(): QuranClient {
  return getQuranClient();
}

