// src/pages/api/fetch-source.ts
import type { APIRoute } from 'astro';
import { fetchSourceWithApps } from '@/lib/source-fetcher';

export const GET: APIRoute = async ({ url }) => {
  const sourceUrl = url.searchParams.get('url');
  
  if (!sourceUrl) {
    return new Response(JSON.stringify({ error: 'Source URL is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const data = await fetchSourceWithApps(sourceUrl);
    
    if (!data) {
      return new Response(JSON.stringify({ error: 'Failed to fetch source' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error in fetch-source API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { url: sourceUrl } = body;
    
    if (!sourceUrl) {
      return new Response(JSON.stringify({ error: 'Source URL is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await fetchSourceWithApps(sourceUrl);
    
    if (!data) {
      return new Response(JSON.stringify({ error: 'Failed to fetch source' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in fetch-source API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};