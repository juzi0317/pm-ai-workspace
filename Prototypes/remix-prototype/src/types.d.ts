interface ProjectKnowledgeStore {
  [key: string]: {
    name: string;
    kb_files: {
      id: string;
      name: string;
      size: string;
      date: string;
      status: string;
    }[];
    ai_products: {
      id: string;
      name: string;
      size: string;
      date: string;
      is_archived: boolean;
    }[];
  };
}

declare global {
  interface Window {
    PROJECT_KNOWLEDGE_STORE: ProjectKnowledgeStore;
  }
}

export {};
