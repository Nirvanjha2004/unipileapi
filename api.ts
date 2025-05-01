import { UnipileClient } from 'unipile-node-sdk';

// Import the type from the SDK
import type { UserProfileApiResponse } from 'unipile-node-sdk/dist/types/users/user-profile.types';

// Define enums for status returns with the additional status
enum AuthStatus {
  CONNECTED = 'connected',
  EXPIRED = 'expired',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

enum RequestStatus {
  SUCCESS = 'success',
  ALREADY_CONNECTED = 'already_connected',
  ALREADY_INVITED_RECENTLY = 'already_invited_recently', // New status for recent invitation
  INVALID_URL = 'invalid_url',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

const client = new UnipileClient('https://api12.unipile.com:14202', 'hmDxTD5V.1BZyh0/cTeyKf1MGo8mmotVl6HqDhZ1wE27jHSQCUSI=');

const account_id = 'X0tXn2bLRKeS1pf-1FTgxA';

// Define a type guard to check if it's a LinkedIn profile
function isLinkedInProfile(profile: UserProfileApiResponse): profile is UserProfileApiResponse & { provider_id: string } {
  return profile.provider === 'LINKEDIN' && 'provider_id' in profile;
}

// Helper to check for timeout errors
function isTimeoutError(error: any): boolean {
  return (
    error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    error?.message?.includes('timeout') ||
    error?.cause?.message?.includes('timeout')
  );
}

// Helper to process invitation error responses
function handleInvitationError(error: any): RequestStatus {
  // Check for timeout errors
  if (isTimeoutError(error)) {
    console.error('Connection timeout error:', error.cause?.message || error.message);
    return RequestStatus.TIMEOUT;
  }
  
  // Check for UnsuccessfulRequestError with body
  if (error.body) {
    const errorBody = error.body;
    
    // Check for "already invited recently" error
    if (errorBody.type === 'errors/already_invited_recently' || 
        (errorBody.detail && errorBody.detail.includes('already been sent recently'))) {
      console.error('Already invited recently error:', errorBody.detail);
      return RequestStatus.ALREADY_INVITED_RECENTLY;
    }
    
    // Check for already connected error
    if (errorBody.detail && errorBody.detail.toLowerCase().includes('already connected')) {
      console.error('Already connected error:', errorBody.detail);
      return RequestStatus.ALREADY_CONNECTED;
    }
  }
  
  // Default case - generic failure
  console.error('Unknown invitation error:', error);
  return RequestStatus.FAILED;
}

/**
 * Extracts LinkedIn identifier from various URL formats
 * @param url LinkedIn URL or identifier
 * @returns Extracted identifier or original input if already an identifier
 */
function extractLinkedInIdentifier(url: string): string {
  // If it doesn't look like a URL, assume it's already an identifier
  if (!url.includes('linkedin.com')) {
    return url;
  }
  
  try {
    // Handle various LinkedIn URL formats
    if (url.includes('/in/')) {
      // Regular profile URL: https://www.linkedin.com/in/username
      const match = url.match(/linkedin\.com\/in\/([^/\?#]+)/);
      return match ? match[1] : url;
    } else if (url.includes('/profile/view')) {
      // Profile view URL with id parameter
      const urlObj = new URL(url);
      return urlObj.searchParams.get('id') || url;
    } else {
      console.log('Unrecognized LinkedIn URL format, using as-is:', url);
      return url;
    }
  } catch (error) {
    console.error('Error parsing LinkedIn URL:', error);
    return url;
  }
}

/**
 * Sleep for a random duration between min and max milliseconds
 */
async function randomSleep(minMs: number = 2000, maxMs: number = 5000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  console.log(`Waiting for ${delay}ms before next request...`);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Sends connection requests to multiple LinkedIn profiles with random intervals
 * @param profileUrls Array of LinkedIn profile URLs or identifiers
 * @returns Results of each connection request
 */
async function sendConnectionRequestsWithDelay(
  profileUrls: string[], 
  minDelay: number = 5000, 
  maxDelay: number = 15000
): Promise<Map<string, RequestStatus>> {
  const results = new Map<string, RequestStatus>();
  
  console.log(`Processing ${profileUrls.length} connection requests with random delays...`);
  
  for (const url of profileUrls) {
    const identifier = extractLinkedInIdentifier(url);
    console.log(`Processing request for: ${url} (identifier: ${identifier})`);
    
    try {
      // Get the profile first
      const profileResponse = await client.users.getProfile({
        account_id,
        identifier
      }) as UserProfileApiResponse;

      if (!profileResponse) {
        console.error(`Invalid profile URL or identifier: ${url}`);
        results.set(url, RequestStatus.INVALID_URL);
        continue;
      }
      
      // Check if it's a valid LinkedIn profile
      if (!isLinkedInProfile(profileResponse)) {
        console.error(`Not a valid LinkedIn profile: ${url}`);
        results.set(url, RequestStatus.FAILED);
        continue;
      }
      
      console.log(`Found profile for ${identifier}, provider_id: ${profileResponse.provider_id}`);
      
      try {
        // Send the invitation
        const inviteResponse = await client.users.sendInvitation({
          account_id,
          provider_id: profileResponse.provider_id,
          // Optional personalized message
          message: "I'd like to connect with you on LinkedIn!"
        });
        
        if (inviteResponse && inviteResponse.invitation_id) {
          console.log(`✅ Successfully sent invitation to ${'first_name' in profileResponse ? profileResponse.first_name : identifier}`);
          results.set(url, RequestStatus.SUCCESS);
        } else {
          console.log(`❌ Failed to send invitation to ${identifier}: Unknown reason`);
          results.set(url, RequestStatus.FAILED);
        }
      } catch (inviteError) {
        const status = handleInvitationError(inviteError);
        console.log(`⚠️ Invitation error for ${identifier}: ${status}`);
        results.set(url, status);
      }
    } catch (error) {
      console.error(`Error processing profile ${identifier}:`, error);
      results.set(url, RequestStatus.FAILED);
    }
    
    // Add random delay before processing the next profile
    // Skip delay for the last item
    if (profileUrls.indexOf(url) < profileUrls.length - 1) {
      await randomSleep(minDelay, maxDelay);
    }
  }
  
  return results;
}

async function main() {
  try {
    // Example usage with array of profile URLs or identifiers
    const profileUrls = [
      'https://www.linkedin.com/in/samudraneel-sarkar/',
      'https://www.linkedin.com/in/lisa-d-647301/',
    ];
    
    // You could also get these from command line arguments or a config file
    const minDelay = 5000;  // 5 seconds minimum
    const maxDelay = 15000; // 15 seconds maximum
    
    console.log('Starting connection request process...');
    const results = await sendConnectionRequestsWithDelay(profileUrls, minDelay, maxDelay);
    
    // Log summary of results
    console.log('\nConnection Request Results:');
    results.forEach((status, url) => {
      console.log(`${url}: ${status}`);
    });
    
    // Count results by status
    const statusCounts = new Map<RequestStatus, number>();
    results.forEach(status => {
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });
    
    console.log('\nSummary:');
    statusCounts.forEach((count, status) => {
      console.log(`${status}: ${count}`);
    });
    
  } catch (error) {
    // Handle general errors in the main function
    if (isTimeoutError(error)) {
      console.error('General timeout error:', error);
      console.log('Authentication status:', AuthStatus.TIMEOUT);
      console.log('Connection request status:', RequestStatus.TIMEOUT);
    } else {
      console.error('General error in main function:', error);
      console.log('Authentication status:', AuthStatus.FAILED);
      console.log('Connection request status:', RequestStatus.FAILED);
    }
  }
}

main().catch(console.error);

// Export status enums for use elsewhere in the application
export { AuthStatus, RequestStatus };
