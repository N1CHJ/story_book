import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  AI: any;
  epaper_books: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors());

app.post('/api/generate', async (c) => {
  const { theme, character, style, pages = 5 } = await c.req.json();
  const bookId = crypto.randomUUID();

  // 1. Generate story text using Llama 3
  const systemPrompt = `You are a creative children's book author. You will generate a story based on a theme, character, and art style.
You MUST respond with ONLY a valid JSON array. Do NOT include any explanations, markdown formatting, or introduction text. Just the raw JSON array.
The JSON array must contain exactly ${pages} objects, where each object represents a page.
Each object must have the following keys:
- "story_text": The text for the page (1-2 short sentences).
- "image_prompt": A highly detailed prompt for an image generator (like Flux) to illustrate this page. Ensure the prompt includes the art style: "${style}".`;

  const userPrompt = `Theme: ${theme}\nMain Character: ${character}`;

  let textResponse;
  try {
    textResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });
  } catch (err: any) {
    return c.json({ error: 'AI Text Generation Failed', details: err.message }, 500);
  }

  let pagesData;
  try {
    let rawStr = textResponse.response.trim();
    const firstBracket = rawStr.indexOf('[');
    const lastBracket = rawStr.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      rawStr = rawStr.substring(firstBracket, lastBracket + 1);
    }
    pagesData = JSON.parse(rawStr);
  } catch (err) {
    return c.json({ error: 'Failed to parse AI response into JSON array', raw: textResponse?.response }, 500);
  }

  const manifest = {
    id: bookId,
    theme,
    character,
    style,
    pages: [] as any[]
  };

  // 2. Generate images for each page
  for (let i = 0; i < pagesData.length; i++) {
    const page = pagesData[i];
    
    let imageResponse;
    try {
      imageResponse = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
        prompt: page.image_prompt
      });
    } catch (err: any) {
      return c.json({ error: 'AI Image Generation Failed', details: err.message, page: i }, 500);
    }
    
    // imageResponse is an array of bytes
    const imageKey = `${bookId}/page_${i}.jpeg`;
    
    await c.env.epaper_books.put(imageKey, imageResponse, {
      httpMetadata: { contentType: 'image/jpeg' }
    });

    manifest.pages.push({
      pageNumber: i + 1,
      story_text: page.story_text,
      image_prompt: page.image_prompt,
      image_path: imageKey
    });
  }

  // 3. Save manifest
  const manifestKey = `${bookId}/manifest.json`;
  await c.env.epaper_books.put(manifestKey, JSON.stringify(manifest), {
    httpMetadata: { contentType: 'application/json' }
  });

  return c.json(manifest);
});

app.get('/api/book/:id', async (c) => {
  const bookId = c.req.param('id');
  const manifestKey = `${bookId}/manifest.json`;
  
  const object = await c.env.epaper_books.get(manifestKey);
  
  if (!object) {
    return c.json({ error: 'Book not found' }, 404);
  }
  
  const manifest = await object.json();
  return c.json(manifest);
});

app.get('/api/book/:id/image/:page', async (c) => {
  const bookId = c.req.param('id');
  const page = c.req.param('page');
  const imageKey = `${bookId}/page_${page}.jpeg`;

  const object = await c.env.epaper_books.get(imageKey);

  if (!object) {
    return c.json({ error: 'Image not found' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
});

export default app;
