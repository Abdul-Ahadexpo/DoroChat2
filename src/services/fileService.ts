import { UnknownQuestion, BotResponse } from '../types';
import { ProductData, SiteData } from '../types';

export class FileService {
  static downloadUnknownQuestions(questions: UnknownQuestion[]) {
    const data = questions.map(q => ({
      text: q.text,
      question: q.question,
      timestamp: q.timestamp,
      count: q.count,
      userID: q.userID || 'anonymous'
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unknown-questions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static downloadResponses(responses: BotResponse) {
    const blob = new Blob([JSON.stringify(responses, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bot-responses-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async uploadResponses(file: File): Promise<BotResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const responses = JSON.parse(content);
          
          // Validate the format
          if (typeof responses !== 'object' || responses === null) {
            throw new Error('Invalid JSON format');
          }

          // Normalize all keys to lowercase
          const normalizedResponses: BotResponse = {};
          for (const [key, value] of Object.entries(responses)) {
            if (typeof value === 'string') {
              normalizedResponses[key.toLowerCase().trim()] = value;
            }
          }

          resolve(normalizedResponses);
        } catch (error) {
          reject(new Error('Invalid JSON file format'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static async uploadProducts(file: File): Promise<ProductData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // Validate the format
          if (!Array.isArray(data)) {
            throw new Error('Products file must contain an array of products');
          }

          // Validate each product
          const validProducts: ProductData[] = data.map((item: any, index: number) => {
            if (!item.name || !item.price || !item.description || !item.category) {
              throw new Error(`Product at index ${index} is missing required fields (name, price, description, category)`);
            }
            return {
              id: item.id || `product_${Date.now()}_${index}`,
              name: item.name,
              price: item.price,
              description: item.description,
              category: item.category,
              inStock: item.inStock !== undefined ? item.inStock : true,
              imageUrl: item.imageUrl || '',
              features: Array.isArray(item.features) ? item.features : [],
              specifications: typeof item.specifications === 'object' ? item.specifications : {}
            };
          });
          resolve(validProducts);
        } catch (error) {
          reject(new Error(`Invalid products file format: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static async uploadSiteData(file: File): Promise<SiteData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          // Validate the format
          if (!Array.isArray(data)) {
            throw new Error('Site data file must contain an array of data items');
          }

          // Validate each data item
          const validData: SiteData[] = data.map((item: any, index: number) => {
            if (!item.title || !item.content || !item.category) {
              throw new Error(`Data item at index ${index} is missing required fields (title, content, category)`);
            }
            const validCategories = ['product', 'service', 'policy', 'faq', 'general'];
            if (!validCategories.includes(item.category)) {
              throw new Error(`Data item at index ${index} has invalid category. Must be one of: ${validCategories.join(', ')}`);
            }
            return {
              id: item.id || `data_${Date.now()}_${index}`,
              title: item.title,
              content: item.content,
              category: item.category,
              tags: Array.isArray(item.tags) ? item.tags : [],
              lastUpdated: Date.now()
            };
          });
          resolve(validData);
        } catch (error) {
          reject(new Error(`Invalid site data file format: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static downloadProducts(products: { [key: string]: ProductData }) {
    const productsArray = Object.entries(products).map(([id, product]) => ({
      id,
      ...product
    }));

    const blob = new Blob([JSON.stringify(productsArray, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentorial-products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static downloadSiteData(siteData: { [key: string]: SiteData }) {
    const dataArray = Object.entries(siteData).map(([id, data]) => ({
      id,
      ...data
    }));

    const blob = new Blob([JSON.stringify(dataArray, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentorial-site-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}