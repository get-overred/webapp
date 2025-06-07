import axios from 'axios';
import { get } from "svelte/store";
import { VARIABLES } from "../../store";
import { type FLOW } from "../components/func";


// You must be signed in as a Zendesk Support admin to create an OAuth client.
// Provide any Client name and Unique identifier you want

// 1. Create an OAuth client
// 2. Get the client ID and secret
// 3. Use the client ID and secret to get an access token
// 4. Use the access token to make requests to the Zendesk API


export async function exportToZendesk(currFlow: FLOW) {
    const variables = get(VARIABLES)
    if (!variables) return;

    // This is YOUR app's client ID from Zendesk
    const ZENDESK_CLIENT_ID = import.meta.env.VITE_ZENDESK_CLIENT_ID;

    // Use your production URL in production, localhost in development
    const REDIRECT_URI = import.meta.env.DEV
        ? 'http://localhost:5173/zendesk/oauth/callback'
        : `${window.location.origin}/zendesk/oauth/callback`;

    // First, we need to get the user's Zendesk subdomain
    const subdomain = prompt('Please enter your Zendesk subdomain (e.g., if your Zendesk is at company.zendesk.com, enter "company"):');

    if (!subdomain) {
        alert('Subdomain is required to connect to Zendesk');
        return;
    }

    // Construct the OAuth authorization URL for the user's Zendesk instance
    const authUrl = new URL(`https://${subdomain}.zendesk.com/oauth/authorizations/new`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('client_id', ZENDESK_CLIENT_ID);
    authUrl.searchParams.append('scope', 'articles:write articles:read');

    // Store the subdomain in sessionStorage for the callback
    sessionStorage.setItem('zendesk_subdomain', subdomain);

    // Redirect the user to their Zendesk's authorization page
    window.location.href = authUrl.toString();
}

// Add a function to handle the OAuth callback
export async function handleZendeskCallback(code: string) {
    try {
        // Get the subdomain we stored earlier
        const subdomain = sessionStorage.getItem('zendesk_subdomain');
        if (!subdomain) {
            throw new Error('Zendesk subdomain not found');
        }

        const REDIRECT_URI = import.meta.env.DEV
            ? 'http://localhost:5173/zendesk/oauth/callback'
            : `${window.location.origin}/zendesk/oauth/callback`;

        // Call the Netlify Function to exchange the code for a token
        const response = await fetch('/.netlify/functions/zendesk-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                subdomain,
                redirect_uri: REDIRECT_URI
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to exchange code for token');
        }

        const data = await response.json();

        // Store the token and subdomain securely
        // You might want to store this in a secure cookie or your backend
        sessionStorage.setItem('zendesk_token', data.access_token);
        sessionStorage.setItem('zendesk_subdomain', data.subdomain);

        return data;
    } catch (error) {
        console.error('Error handling Zendesk callback:', error);
        throw error;
    }
}