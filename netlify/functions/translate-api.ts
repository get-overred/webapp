import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import axios from 'axios'
import { Translate } from '@google-cloud/translate/build/src/v2';



export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
    const ID = "agedonogdeegimiglfjlchknomkdhjhb"
    const allowedOrigin = `chrome-extension://${ID}`;

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Headers": "Content-Type, x-translate-token",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ""
        };
    }
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        }
    }

    try {
        const clientToken = event.headers['x-translate-token'];
        if (clientToken !== process.env.TRANSLATE_ACCESS_TOKEN) {
            return {
                statusCode: 403,
                headers: {
                    "Access-Control-Allow-Origin": allowedOrigin
                },
                body: "Forbidden"
            };
        }

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing request body' })
            };
        }
        const words = JSON.parse(event.body).words;
        if (!words) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing words parameter' })
            };
        }

        // Translate:
        const translate = new Translate({ key: process.env.GOOGLE_API_KEY });
        const [translations] = await translate.translate(words, "de");
        const translatedWords =  Array.isArray(translations) ? translations : [translations];

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": allowedOrigin
            },
            body: JSON.stringify({ translatedWords })
        };

    } catch (error) {
        console.error('Error in translation:', error)
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": allowedOrigin
            },
            body: JSON.stringify({
                error: 'Translation failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }
} 