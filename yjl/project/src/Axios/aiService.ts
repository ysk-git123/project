import { GET, POST } from './api';

// 智能客服API服务
export const aiService = {
    // 发送聊天消息
    sendMessage: async (message: string, model: string = 'deepseek-r1:7b', system?: string) => {
        try {
            const response = await POST('/YJL/chat', {
                message,
                model,
                system: system || '你是一个专业的电商客服助手，能够帮助用户解答关于商品、订单、支付、物流等问题。请用友好、专业的语气回答用户问题。'
            });
            return response.data;
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    },

    // 健康检查
    healthCheck: async () => {
        try {
            const response = await GET('/YJL/health');
            return response.data;
        } catch (error) {
            console.error('健康检查失败:', error);
            throw error;
        }
    },

    // 获取可用模型列表
    getModels: async () => {
        try {
            const response = await GET('/YJL/models');
            return response.data;
        } catch (error) {
            console.error('获取模型列表失败:', error);
            throw error;
        }
    },

    // 生成文本（单次推理）
    generateText: async (prompt: string, model: string = 'deepseek-r1:7b') => {
        try {
            const response = await POST('/YJL/generate', {
                prompt,
                model
            });
            return response.data;
        } catch (error) {
            console.error('生成文本失败:', error);
            throw error;
        }
    }
};

export default aiService; 