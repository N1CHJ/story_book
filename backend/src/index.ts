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
You MUST respond with ONLY a valid JSON object. Do NOT include any explanations, markdown formatting, or introduction text. Just the raw JSON object.

CRITICAL INSTRUCTIONS FOR IMAGES:
1. Character Continuity: Invent a highly detailed, specific visual description for the main character (e.g., "a fluffy brown bear wearing a bright red spacesuit and a glass helmet"). You MUST use this EXACT same visual description in every single "image_prompt" to ensure they look identical on every page.
2. FLUX Optimization: Write the "image_prompt" and "cover_prompt" as a comma-separated list of highly descriptive keywords rather than full sentences (e.g., "[Character Description], standing on a cheese crater, glowing green alien friend, starry space background, dramatic lighting, ${style}").

The JSON object must have the following structure:
{
  "title": "A short, catchy title for the book",
  "cover_prompt": "A highly detailed, keyword-optimized prompt for FLUX to generate the title illustration. MUST include the exact title text (e.g., 'A full-bleed illustration with the bold typography text \"The Moon Cheese Adventure\", [Character Description]...') and the art style. CRITICAL: NEVER use the words 'book', 'cover', or 'author' in this prompt, or the AI will accidentally draw a physical book with a spine and fake author names! Just ask for a beautiful illustration with the title text.",
  "pages": [
    {
      "story_text": "The text for the page (1-2 short sentences).",
      "image_prompt": "The highly detailed, keyword-optimized prompt for FLUX for this page. Ensure it includes the art style: \\"${style}\\"."
    }
    // ... exactly ${pages} objects in this array
  ]
}`;

  const userPrompt = `Theme: ${theme}\nMain Character: ${character}`;

  let textResponse;
  try {
    textResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });
  } catch (err: any) {
    return c.json({ error: 'AI Text Generation Failed', details: err.message }, 500);
  }

  let storyData;
  try {
    if (typeof textResponse.response === 'string') {
      let rawStr = textResponse.response.trim();
      const firstBrace = rawStr.indexOf('{');
      const lastBrace = rawStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        rawStr = rawStr.substring(firstBrace, lastBrace + 1);
      }
      storyData = JSON.parse(rawStr);
    } else {
      // It's already parsed!
      storyData = textResponse.response;
    }
    
    // Ensure storyData is valid
    if (!storyData || !Array.isArray(storyData.pages)) {
      throw new Error("Parsed data is missing the 'pages' array");
    }
  } catch (err: any) {
    return c.json({ error: 'Failed to parse AI response into JSON array', raw: typeof textResponse?.response === 'string' ? textResponse.response : JSON.stringify(textResponse?.response) }, 500);
  }

  const manifest = {
    id: bookId,
    title: storyData.title || "My Custom Story",
    theme,
    character,
    style,
    cover_image: `${bookId}/cover.jpeg`,
    pages: [] as any[]
  };

  try {
    const parseImageResponse = (res: any) => {
      if (res && typeof res === 'object' && !ArrayBuffer.isView(res) && !(res instanceof ArrayBuffer)) {
        let b64 = res.image || res.response || res.result;
        if (typeof b64 === 'string') {
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
          return bytes;
        } else if (Array.isArray(res.data)) return new Uint8Array(res.data);
      }
      return res;
    };

    if (!c.env.epaper_books) {
      throw new Error("R2 bucket 'epaper_books' is not bound. Please bind it in your Cloudflare dashboard.");
    }

    // 2. Generate Cover Image
    let coverResponse: any;
    try {
      coverResponse = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
        prompt: storyData.cover_prompt || `A book cover with the title "${manifest.title}", ${style}`
      });
    } catch (err: any) {
      return c.json({ error: 'AI Cover Generation Failed', details: err.message }, 500);
    }
    
    await c.env.epaper_books.put(manifest.cover_image, parseImageResponse(coverResponse), {
      httpMetadata: { contentType: 'image/jpeg' }
    });

    // 3. Generate images for each page
    for (let i = 0; i < storyData.pages.length; i++) {
      const page = storyData.pages[i];
      
      let imageResponse: any;
      try {
        imageResponse = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
          prompt: page.image_prompt
        });
      } catch (err: any) {
        return c.json({ error: 'AI Image Generation Failed', details: err.message, page: i }, 500);
      }

      const imageKey = `${bookId}/page_${i}.jpeg`;
      
      await c.env.epaper_books.put(imageKey, parseImageResponse(imageResponse), {
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
  } catch (err: any) {
    return c.json({ error: 'Process Failed after Text Generation', details: err.message, raw: err.stack }, 500);
  }

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
  const imageKey = page === 'cover' ? `${bookId}/cover.jpeg` : `${bookId}/page_${page}.jpeg`;

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
