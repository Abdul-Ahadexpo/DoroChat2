export class CalculationService {
  static evaluateExpression(text: string): string | null {
    // Normalize the text
    const normalizedText = text.toLowerCase().trim();
    
    // Remove common question words and equals signs at the end
    const cleanText = normalizedText
      .replace(/what\s+is\s+/g, '')
      .replace(/calculate\s+/g, '')
      .replace(/\s*=+\s*$/g, '')
      .replace(/\s*\?\s*$/g, '');

    // Convert word numbers to digits
    const withNumbers = this.convertWordsToNumbers(cleanText);
    
    // Extract mathematical expression
    const mathExpression = this.extractMathExpression(withNumbers);
    
    if (!mathExpression) return null;
    
    try {
      // Safely evaluate the expression
      const result = this.safeEvaluate(mathExpression);
      return result !== null ? result.toString() : null;
    } catch (error) {
      return null;
    }
  }

  private static convertWordsToNumbers(text: string): string {
    const wordToNumber: { [key: string]: string } = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
      'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
      'eighteen': '18', 'nineteen': '19', 'twenty': '20',
      'plus': '+', 'add': '+', 'added to': '+',
      'minus': '-', 'subtract': '-', 'subtracted from': '-',
      'times': '*', 'multiply': '*', 'multiplied by': '*',
      'divide': '/', 'divided by': '/'
    };

    let result = text;
    for (const [word, number] of Object.entries(wordToNumber)) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      result = result.replace(regex, number);
    }
    
    return result;
  }

  private static extractMathExpression(text: string): string | null {
    // Match mathematical expressions with numbers and operators
    const mathRegex = /[\d\s+\-*/().]+/g;
    const matches = text.match(mathRegex);
    
    if (!matches) return null;
    
    // Find the longest match that contains at least one operator
    const validExpressions = matches.filter(match => 
      /[+\-*/]/.test(match) && /\d/.test(match)
    );
    
    if (validExpressions.length === 0) return null;
    
    // Return the longest valid expression
    return validExpressions.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    ).trim();
  }

  private static safeEvaluate(expression: string): number | null {
    // Remove all whitespace
    const cleanExpression = expression.replace(/\s/g, '');
    
    // Validate that the expression only contains safe characters
    if (!/^[\d+\-*/().]+$/.test(cleanExpression)) {
      return null;
    }
    
    // Check for balanced parentheses
    let parenthesesCount = 0;
    for (const char of cleanExpression) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) return null;
    }
    if (parenthesesCount !== 0) return null;
    
    try {
      // Use Function constructor for safe evaluation
      const result = new Function(`"use strict"; return (${cleanExpression})`)();
      
      // Check if result is a valid number
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        // Round to avoid floating point precision issues
        return Math.round(result * 1000000) / 1000000;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  static isCalculationQuestion(text: string): boolean {
    const normalizedText = text.toLowerCase().trim();
    
    // Check for calculation patterns
    const calculationPatterns = [
      /\d+\s*[+\-*/]\s*\d+/,  // Basic math operations
      /what\s+is\s+\d+/,       // "what is 2+2"
      /calculate\s+/,          // "calculate 5*3"
      /\d+\s+(plus|add|minus|subtract|times|multiply|divide)\s+\d+/,  // Word operations
      /\d+\s*=+\s*$/           // Numbers ending with equals
    ];
    
    return calculationPatterns.some(pattern => pattern.test(normalizedText));
  }
}