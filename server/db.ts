
// In-memory storage implementation
class InMemoryDB {
  private data: Map<string, any[]>;

  constructor() {
    this.data = new Map();
    this.data.set('books', []);
    this.data.set('borrowers', []);
    this.data.set('librarians', []);
    this.data.set('borrowings', []);
    this.data.set('research', []);
  }

  getCollection(name: string) {
    return this.data.get(name) || [];
  }

  setCollection(name: string, data: any[]) {
    this.data.set(name, data);
  }
}

export const db = new InMemoryDB();
