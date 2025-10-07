export class WebSearchService {
  private static readonly SITE_URL = 'https://sentorial.vercel.app';
  private static cache: Map<string, { data: string; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async searchSiteContent(query: string): Promise<string | null> {
    try {
      console.log('🔍 Searching SenTorial website for:', query);
      
      // Determine which page to search based on query
      const targetUrl = this.getRelevantPage(query);
      
      // Check cache first
      const cacheKey = `site_content_${targetUrl}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('📋 Using cached site content');
        return this.extractRelevantContent(cached.data, query);
      }

      // Fetch site content
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'SenTorial-CHAT Bot 1.0',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch site content from ${targetUrl}:`, response.status);
        return null;
      }

      const html = await response.text();
      const textContent = this.extractTextFromHTML(html);
      
      // Cache the content
      this.cache.set(cacheKey, {
        data: textContent,
        timestamp: Date.now()
      });

      console.log(`✅ Successfully fetched site content from ${targetUrl}`);
      return this.extractRelevantContent(textContent, query);

    } catch (error) {
      console.error('❌ Error searching site content:', error);
      return null;
    }
  }

  private static getRelevantPage(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Map keywords to specific pages
    if (lowerQuery.includes('custom') || lowerQuery.includes('preorder') || lowerQuery.includes('order')) {
      return 'https://sentorial.vercel.app/custom-preorder';
    }
    
    if (lowerQuery.includes('customizer') || lowerQuery.includes('design') || lowerQuery.includes('create')) {
      return 'https://sentorial.vercel.app/candle-customizer';
    }
    
    if (lowerQuery.includes('review') || lowerQuery.includes('feedback') || lowerQuery.includes('testimonial')) {
      return 'https://sentorial.vercel.app/reviews';
    }
    
    if (lowerQuery.includes('profile') || lowerQuery.includes('account') || lowerQuery.includes('login')) {
      return 'https://sentorial.vercel.app/profile';
    }
    
    // Default to main page
    return 'https://sentorial.vercel.app/';
  }

  private static extractTextFromHTML(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, ' ');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  private static extractRelevantContent(content: string, query: string): string {
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 20);
    
    // Score sentences based on query relevance
    const scoredSentences = sentences.map(sentence => {
      const lowerSentence = sentence.toLowerCase();
      let score = 0;
      
      queryWords.forEach(word => {
        const occurrences = (lowerSentence.match(new RegExp(word, 'g')) || []).length;
        score += occurrences;
      });
      
      return { sentence: sentence.trim(), score };
    });
    
    // Get top relevant sentences
    const relevantSentences = scoredSentences
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence);
    
    if (relevantSentences.length === 0) {
      // Return first few sentences if no specific matches
      return sentences.slice(0, 2).join('. ') + '.';
    }
    
    return relevantSentences.join('. ') + '.';
  }

  static clearCache(): void {
    this.cache.clear();
  }
}