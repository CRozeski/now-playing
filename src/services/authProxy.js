/**
 * Authentication proxy service for Spotify API token exchange
 */

/**
 * Exchanges the authorization code for access and refresh tokens
 * @param {string} code - The authorization code returned by Spotify
 * @param {string} redirectUri - The redirect URI registered with Spotify
 * @returns {Promise<Object>} - Promise containing access_token and refresh_token
 */
export const exchangeCodeForToken = async (code, redirectUri) => {
  try {
    // Get client ID from environment variables or config
    const clientId = process.env.VUE_APP_SPOTIFY_CLIENT_ID || 
                    (window.spotifyConfig && window.spotifyConfig.clientId);
    
    // Get client secret from environment variables
    const clientSecret = process.env.VUE_APP_SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing Spotify client credentials");
    }
    
    console.log("Using client ID:", clientId.substring(0, 5) + "...");
    
    // Create authorization string for Spotify API
    const authString = btoa(`${clientId}:${clientSecret}`);
    
    // Make request to Spotify token endpoint
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authString}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri
      })
    });
    
    // Parse response
    const responseData = await response.json();
    
    // Check for errors
    if (!response.ok) {
      throw new Error(responseData.error_description || responseData.error || "Unknown error");
    }
    
    return {
      access_token: responseData.access_token,
      refresh_token: responseData.refresh_token,
      expires_in: responseData.expires_in
    };
  } catch (error) {
    console.error("Token exchange failed:", error);
    throw error;
  }
};