import { UnipileClient } from 'unipile-node-sdk';

// Define interface for LinkedIn cookie data
export interface CookieData {
  li_at: string;
}

// Define enum for authentication status
export enum AuthStatus {
  CONNECTED = 'connected',
  EXPIRED = 'expired',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

// Initialize the Unipile client
const client = new UnipileClient('https://api12.unipile.com:14202', 'hmDxTD5V.1BZyh0/cTeyKf1MGo8mmotVl6HqDhZ1wE27jHSQCUSI=');

/**
 * Helper to check for timeout errors
 * @param error Error object to check
 * @returns True if the error is a timeout error
 */
function isTimeoutError(error: any): boolean {
  return (
    error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    error?.message?.includes('timeout') ||
    error?.cause?.message?.includes('timeout')
  );
}

/**
 * Authenticate LinkedIn account using cookies
 * @param cookies LinkedIn session cookies (li_at and JSESSIONID)
 * @returns Authentication status
 */
export async function authenticateAccount(cookies: CookieData): Promise<AuthStatus> {
  try {
    console.log('Authenticating LinkedIn account with cookies...');
    
    // Call the Unipile API to connect using cookies
    const response = await client.account.connectLinkedin({
        //@ts-ignore
        access_token: cookies.li_at,
    });

    // Log the raw response for debugging
    console.log('Authentication response:', response);
    
    // Check if the connection was successful (account ID is present)
    if (response && response.account_id) {
      console.log('✅ Authentication successful!');
      console.log(`Account ID: ${response.account_id}`);
      return AuthStatus.CONNECTED;
    } 
    // Check for expired cookies
    //@ts-ignore
    else if (response.error && typeof response.error === 'string' && 
        //@ts-ignore
             (response.error.toLowerCase().includes('expired') || 
             //@ts-ignore
              response.error.toLowerCase().includes('invalid cookie'))) {
      console.log('⚠️ Authentication failed: Cookies expired or invalid');
      return AuthStatus.EXPIRED;
    } 
    // Other failure cases
    else {
        //@ts-ignore
      console.log('❌ Authentication failed:', response.error || 'Unknown error');
      return AuthStatus.FAILED;
    }
  } catch (error) {
    // Handle timeout errors
    if (isTimeoutError(error)) {
      console.error('⚠️ Authentication timeout:', error);
      return AuthStatus.TIMEOUT;
    }
    
    // Handle other errors
    console.error('❌ Authentication error:', error);
    return AuthStatus.FAILED;
  }
}

const cookies: CookieData = {
    li_at: 'AQEDAUSxiWAEgxKoAAABlow4H28AAAGWsESjb1YAnxWK_Pg95plai0v5yyYfM9TLkIKK_bKDewMLy81v55m-8Z14B1dWn1yO3B9TGHn_arZ9L9ROfCYrOyLWaOfP2TJ0bfDsMmPaE9Gam_AxlyBU_VtU',
  };

authenticateAccount(cookies);