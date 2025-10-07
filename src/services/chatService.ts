import { database } from '../config/firebase';
import { ref, push, onValue, set, get, serverTimestamp } from 'firebase/database';
import { Message, BotResponse, UnknownQuestion, ProductData, SiteData } from '../types';
import { DeviceService } from './deviceService';
import { CalculationService } from './calculationService';
import { GeminiService } from './geminiService';

export class ChatService {
  private getMessagesRef() {
    const deviceId = DeviceService.getDeviceId();
    return ref(database, `messages/${deviceId}`);
  }
  
  private responsesRef = ref(database, 'responses');
  private unknownQuestionsRef = ref(database, 'unknown_questions');
  private quickMessagesRef = ref(database, 'quick_messages');
  private productsRef = ref(database, 'products');
  private siteDataRef = ref(database, 'site_data');

  async initializeDefaultResponses() {
    const snapshot = await get(this.responsesRef);
    if (!snapshot.exists()) {
      const defaultResponses: BotResponse = {
        'hello': 'Hello! I\'m Doro GPT. How can I help you today? 😊',
        'hi': 'Hi there! What can I do for you?',
        'how are you': 'I\'m doing great! Thanks for asking. How are you?',
        'what is your name': 'I\'m Doro GPT, your learning chatbot assistant!',
        'help': 'I\'m here to help! Ask me anything and I\'ll do my best to answer.',
        'thank you': 'You\'re welcome! Is there anything else I can help you with?',
        'thanks': 'Happy to help! 😊',
        'bye': 'Goodbye! Have a wonderful day! 👋',
        'goodbye': 'See you later! Take care! 👋'
      };
      await set(this.responsesRef, defaultResponses);
    }
  }

  async sendMessage(text: string, sender: 'user' | 'bot'): Promise<string> {
    const message: Omit<Message, 'id'> = {
      text,
      sender,
      timestamp: Date.now()
    };

    const newMessageRef = await push(this.getMessagesRef(), message);
    return newMessageRef.key!;
  }

  private conversationHistory: string[] = [];

  async getBotResponse(userMessage: string): Promise<string> {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Add user message to conversation history
    this.conversationHistory.push(`User: ${userMessage}`);
    
    // Keep only last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
    
    // Check if it's a calculation question first
    if (CalculationService.isCalculationQuestion(userMessage)) {
      const result = CalculationService.evaluateExpression(userMessage);
      if (result !== null) {
        const response = `The answer is ${result} 🧮`;
        this.conversationHistory.push(`Bot: ${response}`);
        return response;
      }
    }
    
    // Get responses from Firebase
    const snapshot = await get(this.responsesRef);
    const responses: BotResponse = snapshot.val() || {};

    // Check for exact match first
    if (responses[normalizedMessage]) {
      const response = responses[normalizedMessage];
      this.conversationHistory.push(`Bot: ${response}`);
      return response;
    }

    // Check for partial matches
    for (const key in responses) {
      if (normalizedMessage.includes(key) || key.includes(normalizedMessage)) {
        const response = responses[key];
        this.conversationHistory.push(`Bot: ${response}`);
        return response;
      }
    }

    // Try Gemini AI for intelligent response
    console.log('🔍 No saved response found, trying Gemini AI...');
    
    // Get additional data for context
    const [productsSnapshot, siteDataSnapshot] = await Promise.all([
      get(this.productsRef),
      get(this.siteDataRef)
    ]);
    
    const products = productsSnapshot.val() || {};
    const siteData = siteDataSnapshot.val() || {};
    
    const aiResponse = await GeminiService.generateResponse(
      userMessage, 
      this.conversationHistory,
      products,
      siteData
    );
    
    if (aiResponse) {
      const response = `${aiResponse} ✨`;
      this.conversationHistory.push(`Bot: ${response}`);
      console.log('✅ Using Gemini AI response');
      return response;
    }

    // Use smart fallback if AI fails
    console.log('⚠️ Gemini AI failed, using smart fallback');
    if (Math.random() > 0.3) { // 70% chance to use smart fallback
      const fallbackResponse = GeminiService.getSmartFallback(userMessage);
      const response = `${fallbackResponse} 💭`;
      this.conversationHistory.push(`Bot: ${response}`);
      return response;
    }
    // Store unknown question
    await this.storeUnknownQuestion(userMessage);
    
    const response = "I don't know how to answer that now.. I'll learn it in a few minutes 😅";
    this.conversationHistory.push(`Bot: ${response}`);
    return response;
  }

  private async storeUnknownQuestion(question: string) {
    const normalizedQuestion = question.toLowerCase().trim();
    const questionKey = btoa(normalizedQuestion).replace(/[^a-zA-Z0-9]/g, '');
    const unknownRef = ref(database, `unknown_questions/${questionKey}`);
    
    const snapshot = await get(unknownRef);
    const existing = snapshot.val();

    const unknownQuestion: UnknownQuestion = {
      id: normalizedQuestion,
      question,
      text: question,
      timestamp: existing?.timestamp || Date.now(),
      count: (existing?.count || 0) + 1,
      userID: DeviceService.getDeviceId()
    };

    await set(unknownRef, unknownQuestion);
  }

  onMessagesChange(callback: (messages: Message[]) => void) {
    return onValue(this.getMessagesRef(), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.entries(data).map(([id, message]: [string, any]) => ({
          id,
          ...message
        }));
        messages.sort((a, b) => a.timestamp - b.timestamp);
        callback(messages);
      } else {
        callback([]);
      }
    });
  }

  onUnknownQuestionsChange(callback: (questions: UnknownQuestion[]) => void) {
    return onValue(this.unknownQuestionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const questions = Object.values(data) as UnknownQuestion[];
        questions.sort((a, b) => b.count - a.count);
        callback(questions);
      } else {
        callback([]);
      }
    });
  }

  onResponsesChange(callback: (responses: BotResponse) => void) {
    return onValue(this.responsesRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  }

  async addResponse(question: string, response: string) {
    const normalizedQuestion = question.toLowerCase().trim();
    await set(ref(database, `responses/${normalizedQuestion}`), response);
  }

  async deleteResponse(question: string) {
    const normalizedQuestion = question.toLowerCase().trim();
    await set(ref(database, `responses/${normalizedQuestion}`), null);
  }

  async deleteUnknownQuestion(questionId: string) {
    const key = btoa(questionId).replace(/[^a-zA-Z0-9]/g, '');
    await set(ref(database, `unknown_questions/${key}`), null);
  }

  async updateResponse(oldQuestion: string, newQuestion: string, newResponse: string) {
    // Delete old response if question changed
    if (oldQuestion !== newQuestion) {
      await this.deleteResponse(oldQuestion);
    }
    // Add new response
    await this.addResponse(newQuestion, newResponse);
  }

  async bulkAddResponses(responses: BotResponse) {
    const updates: { [key: string]: string } = {};
    
    for (const [question, response] of Object.entries(responses)) {
      const normalizedQuestion = question.toLowerCase().trim();
      updates[normalizedQuestion] = response;
    }

    await set(this.responsesRef, { ...await this.getCurrentResponses(), ...updates });
  }

  private async getCurrentResponses(): Promise<BotResponse> {
    const snapshot = await get(this.responsesRef);
    return snapshot.val() || {};
  }

  async clearAllMessages() {
    await set(this.getMessagesRef(), null);
  }

  onQuickMessagesChange(callback: (messages: string[]) => void) {
    return onValue(this.quickMessagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.values(data) as string[];
        callback(messages);
      } else {
        callback([]);
      }
    });
  }

  async addQuickMessage(message: string) {
    await push(this.quickMessagesRef, message);
  }

  async deleteQuickMessage(index: number) {
    const snapshot = await get(this.quickMessagesRef);
    const data = snapshot.val();
    if (data) {
      const keys = Object.keys(data);
      if (keys[index]) {
        await set(ref(database, `quick_messages/${keys[index]}`), null);
      }
    }
  }

  // Product Data Management
  async addProduct(product: Omit<ProductData, 'id'>): Promise<string> {
    const newProductRef = await push(this.productsRef, {
      ...product,
      lastUpdated: Date.now()
    });
    return newProductRef.key!;
  }

  async updateProduct(id: string, product: Partial<ProductData>): Promise<void> {
    await set(ref(database, `products/${id}`), {
      ...product,
      lastUpdated: Date.now()
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await set(ref(database, `products/${id}`), null);
  }

  onProductsChange(callback: (products: { [key: string]: ProductData }) => void) {
    return onValue(this.productsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  }

  // Site Data Management
  async addSiteData(data: Omit<SiteData, 'id'>): Promise<string> {
    const newDataRef = await push(this.siteDataRef, {
      ...data,
      lastUpdated: Date.now()
    });
    return newDataRef.key!;
  }

  async updateSiteData(id: string, data: Partial<SiteData>): Promise<void> {
    await set(ref(database, `site_data/${id}`), {
      ...data,
      lastUpdated: Date.now()
    });
  }

  async deleteSiteData(id: string): Promise<void> {
    await set(ref(database, `site_data/${id}`), null);
  }

  onSiteDataChange(callback: (data: { [key: string]: SiteData }) => void) {
    return onValue(this.siteDataRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  }

  // Bulk upload functions
  async bulkUploadProducts(products: ProductData[]): Promise<void> {
    const updates: { [key: string]: any } = {};
    
    products.forEach(product => {
      const key = push(this.productsRef).key;
      if (key) {
        updates[key] = {
          ...product,
          lastUpdated: Date.now()
        };
      }
    });

    await set(this.productsRef, { ...await this.getCurrentProducts(), ...updates });
  }

  async bulkUploadSiteData(data: SiteData[]): Promise<void> {
    const updates: { [key: string]: any } = {};
    
    data.forEach(item => {
      const key = push(this.siteDataRef).key;
      if (key) {
        updates[key] = {
          ...item,
          lastUpdated: Date.now()
        };
      }
    });

    await set(this.siteDataRef, { ...await this.getCurrentSiteData(), ...updates });
  }

  private async getCurrentProducts(): Promise<{ [key: string]: ProductData }> {
    const snapshot = await get(this.productsRef);
    return snapshot.val() || {};
  }

  private async getCurrentSiteData(): Promise<{ [key: string]: SiteData }> {
    const snapshot = await get(this.siteDataRef);
    return snapshot.val() || {};
  }
}

export const chatService = new ChatService();