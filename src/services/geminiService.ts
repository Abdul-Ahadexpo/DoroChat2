
import { WebSearchService } from './webSearchService';
import { ProductData, SiteData } from '../types';



export class GeminiService {

  private static readonly API_KEY = 'AIzaSyCFytxjsgQ12GNWZiWwoIZcgaCUi1hN0OI';

  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';



  // SenTorial website knowledge base

  private static readonly SENTORIAL_KNOWLEDGE = `

SenTorial Website Information:

Main Website: https://sentorial.vercel.app/



Key Pages & Features:

- Custom Pre-order: https://sentorial.vercel.app/custom-preorder (Order custom candles)

- Candle Customizer: https://sentorial.vercel.app/candle-customizer (Design your own candles)

- Reviews: https://sentorial.vercel.app/reviews (Customer testimonials and feedback)

- Profile: https://sentorial.vercel.app/profile (User account management)



SenTorial has a special collaboration with Candarial, it is a premium candle company offering:

- Custom handmade candles`;

  // Clean SenTorial website knowledge base
  private static readonly SENTORIAL_KNOWLEDGE2 = `
SenTorial is a premium candle company with these main features:

Website: https://sentorial.vercel.app/

Main Pages:
- Custom Pre-order: https://sentorial.vercel.app/custom-preorder
- Candle Customizer: https://sentorial.vercel.app/candle-customizer  
- Reviews: https://sentorial.vercel.app/reviews
- Profile: https://sentorial.vercel.app/profile

Services:
- Custom handmade candles
- Personalized scent combinations
- High-quality materials
- Unique designs
- Professional candle-making

Always provide relevant links when discussing SenTorial services.
`;



  static async generateResponse(
    userMessage: string, 
    conversationHistory: string[] = [],
    products: { [key: string]: ProductData } = {},
    siteData: { [key: string]: SiteData } = {}
  ): Promise<string | null> {

    try {

      console.log('🤖 Calling Gemini AI for:', userMessage);



      // Search site content for additional context

      const siteContent = await WebSearchService.searchSiteContent(userMessage);

      let additionalContext = '';

      


      // Add product data context
      let productContext = '';
      const productEntries = Object.entries(products);
      if (productEntries.length > 0) {
        const relevantProducts = this.findRelevantProducts(userMessage, products);
        if (relevantProducts.length > 0) {
          productContext = `\n\nAvailable Products:\n${relevantProducts.map(p => 
            `- ${p.name}: ${p.price} (${p.category}) - ${p.description}${p.inStock ? ' [In Stock]' : ' [Out of Stock]'}`
          ).join('\n')}`;
        }
      }

      // Add site data context
      let dataContext = '';
      const dataEntries = Object.entries(siteData);
      if (dataEntries.length > 0) {
        const relevantData = this.findRelevantSiteData(userMessage, siteData);
        if (relevantData.length > 0) {
          dataContext = `\n\nRelevant Information:\n${relevantData.map(d => 
            `- ${d.title}: ${d.content}`
          ).join('\n')}`;
        }
      }
      if (siteContent) {

        additionalContext = `\n\nAdditional context from SenTorial website: ${siteContent}`;

        console.log('🌐 Found relevant site content');

      }



      // Build context from recent conversation

      let context = '';

      if (conversationHistory.length > 0) {

        context = 'Recent conversation:\n' + conversationHistory.slice(-6).join('\n') + '\n\n';

      }



      // Create the prompt

      const prompt = `${context}You are SenTorial-CHAT, a friendly and helpful AI assistant created by Abdul Ahad for SenTorial - a online shop for beyblades and anime. You can use markdown formatting in your responses (**bold**, *italic*, ~~strikethrough~~, \`code\`, ## headers, etc.).



${this.SENTORIAL_KNOWLEDGE}${additionalContext}${productContext}${dataContext}



Respond naturally and conversationally to: "${userMessage}"



Keep your response:

- Conversational and friendly

- Under 300 words

- Natural, like talking to a friend

- Use markdown formatting when appropriate for emphasis

- If you have relevant information from the SenTorial website, incorporate it naturally

- Always provide relevant SenTorial links when discussing services or features

- Help users navigate the website and understand the services offered
- If asked about products, provide specific details including prices and availability
- If asked about policies or information, use the site data to provide accurate answers`;

      const requestBody = {

        contents: [{

          parts: [{

            text: prompt

          }]

        }],

        generationConfig: {

          temperature: 0.7,

          topK: 40,

          topP: 0.95,

          maxOutputTokens: 300,

        },

        safetySettings: [

          {

            category: "HARM_CATEGORY_HARASSMENT",

            threshold: "BLOCK_MEDIUM_AND_ABOVE"

          },

          {

            category: "HARM_CATEGORY_HATE_SPEECH",

            threshold: "BLOCK_MEDIUM_AND_ABOVE"

          },

          {

            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",

            threshold: "BLOCK_MEDIUM_AND_ABOVE"

          },

          {

            category: "HARM_CATEGORY_DANGEROUS_CONTENT",

            threshold: "BLOCK_MEDIUM_AND_ABOVE"

          }

        ]

      };



      const response = await fetch(this.API_URL, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'X-goog-api-key': this.API_KEY,

        },

        body: JSON.stringify(requestBody)

      });



      if (!response.ok) {

        console.error('❌ Gemini API error:', response.status, response.statusText);

        const errorText = await response.text();

        console.error('Error details:', errorText);

        return null;

      }



      const data = await response.json();

      console.log('✅ Gemini API response:', data);



      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {

        const aiResponse = data.candidates[0].content.parts[0].text.trim();

        console.log('🎯 Generated response:', aiResponse);

        return aiResponse;

      }



      console.warn('⚠️ Unexpected Gemini response format:', data);

      return null;



    } catch (error) {

      console.error('❌ Gemini AI error:', error);

      return null;

    }

  }



  static getSmartFallback(userMessage: string): string {

    const message = userMessage.toLowerCase().trim();

    

    // Greeting responses

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {

      const greetings = [

        "Hello! How can I help you today? 😊",

        "Hi there! What's on your mind?",

        "Hey! Great to see you here!",

        "Hello! I'm here and ready to chat!"

      ];

      return greetings[Math.floor(Math.random() * greetings.length)];

    }



    // Question responses

    if (message.includes('?') || message.startsWith('what') || message.startsWith('how') || message.startsWith('why')) {

      const questionResponses = [

        "That's an interesting question! I'd love to help you explore that topic. 🤔",

        "Great question! Let me think about that for you.",

        "I find that topic fascinating! What specifically interests you about it?",

        "That's something worth discussing! What's your take on it?"

      ];

      return questionResponses[Math.floor(Math.random() * questionResponses.length)];

    }



    // General conversation

    const generalResponses = [

      "That's interesting! Tell me more about what you're thinking. 💭",

      "I appreciate you sharing that with me! What else is on your mind?",

      "Thanks for chatting with me! I enjoy our conversations. 😊",

      "That's a great point! I'd love to hear more of your thoughts.",

      "Interesting perspective! What made you think about that?",

      "I'm here to chat about whatever interests you! 🌟"

    ];

    

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];

  }

  private static findRelevantProducts(query: string, products: { [key: string]: ProductData }): ProductData[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    
    const scoredProducts = Object.values(products).map(product => {
      let score = 0;
      const searchText = `${product.name} ${product.description} ${product.category} ${product.features?.join(' ') || ''}`.toLowerCase();
      
      queryWords.forEach(word => {
        if (searchText.includes(word)) {
          score += 1;
        }
      });
      
      // Boost score for exact matches in name or category
      if (product.name.toLowerCase().includes(queryLower)) score += 3;
      if (product.category.toLowerCase().includes(queryLower)) score += 2;
      
      return { product, score };
    });
    
    return scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.product);
  }

  private static findRelevantSiteData(query: string, siteData: { [key: string]: SiteData }): SiteData[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    
    const scoredData = Object.values(siteData).map(data => {
      let score = 0;
      const searchText = `${data.title} ${data.content} ${data.tags.join(' ')}`.toLowerCase();
      
      queryWords.forEach(word => {
        if (searchText.includes(word)) {
          score += 1;
        }
      });
      
      // Boost score for exact matches in title or tags
      if (data.title.toLowerCase().includes(queryLower)) score += 3;
      if (data.tags.some(tag => tag.toLowerCase().includes(queryLower))) score += 2;
      
      return { data, score };
    });
    
    return scoredData
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.data);
  }

}