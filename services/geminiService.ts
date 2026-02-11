import { GoogleGenAI } from "@google/genai";

// Per Gemini API guidelines, the API key is expected to be provided via `process.env.API_KEY`.
// The initialization now uses the environment variable directly, assuming it is configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const GeminiService = {
  /**
   * Suggests a professional comment based on keywords or rough draft.
   */
  refineComment: async (draft: string, subject: string, grade: string): Promise<string> => {
    // Per Gemini API guidelines, we assume the API key is configured.
    // The explicit check for the key has been removed. If the key is missing,
    // the API call will fail and be caught by the try-catch block.
    try {
      const prompt = `
        Bạn là một trợ lý giáo dục ảo hữu ích.
        Hãy viết lại hoặc mở rộng nhận xét sau đây vào sổ đầu bài cho môn ${subject}, lớp ${grade}.
        Nhận xét cần mang tính sư phạm, chuyên nghiệp, ngắn gọn (dưới 50 từ) và mang tính xây dựng.
        
        Nội dung thô: "${draft}"
        
        Chỉ trả về nội dung nhận xét đã chỉnh sửa, không thêm lời dẫn.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error("Error calling Gemini:", error);
      return "Không thể tạo nhận xét lúc này. Vui lòng thử lại.";
    }
  }
};
