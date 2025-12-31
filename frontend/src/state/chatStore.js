import { create } from 'zustand';

export const useChatStore = create((set) => ({
  conversations: [
    {
      id: 'default',
      title: 'Initial Session',
      messages: [],
      selectedModels: ["meta-llama/llama-3.3-70b-instruct:free"]
    }
  ],
  activeId: 'default',
  isLoading: false,

  setActiveId: (id) => set({ activeId: id }),

  toggleModel: (modelId) => set((state) => ({
    conversations: state.conversations.map(c => {
      if (c.id !== state.activeId) return c;
      const currentModels = c.selectedModels || [];
      const exists = currentModels.includes(modelId);
      const updated = exists 
        ? currentModels.filter(id => id !== modelId)
        : [...currentModels, modelId];
      return { ...c, selectedModels: updated.length > 0 ? updated : ["meta-llama/llama-3.3-70b-instruct:free"] };
    })
  })),

  newConversation: () => {
    const id = crypto.randomUUID();
    set((state) => ({
      conversations: [{ 
        id, 
        title: 'New Council', 
        messages: [], 
        selectedModels: ["meta-llama/llama-3.3-70b-instruct:free"]
      }, ...state.conversations],
      activeId: id
    }));
  },

  addMessage: (role, content, transcript = [], metadata = {}) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === state.activeId
          ? { 
              ...c, 
              messages: [...c.messages, { role, content, transcript, metadata }],
              title: role === 'user' && c.messages.length === 0 ? content.slice(0, 30) : c.title
            }
          : c
      )
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
