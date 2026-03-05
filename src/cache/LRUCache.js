const Node = require('./Node');

class LRUCache {
  constructor(capacity = 1000) {
    this.capacity = capacity;
    this.size = 0;
    this.cache = new Map();

    // Dummy head and tail
    this.head = new Node(null, null, null);
    this.tail = new Node(null, null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _addNode(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    const prev = node.prev;
    const next = node.next;
    prev.next = next;
    next.prev = prev;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addNode(node);
  }

  _popTail() {
    const lru = this.tail.prev;
    this._removeNode(lru);
    return lru;
  }

  get(key) {
    const node = this.cache.get(key);

    if (!node) {
      return null;
    }

    // Lazy expiration on access
    if (node.isExpired()) {
      this._removeNode(node);
      this.cache.delete(key);
      this.size--;
      return null;
    }

    this._moveToHead(node);
    return node.value;
  }

  put(key, value, ttlMs = null) {
    let node = this.cache.get(key);

    if (node) {
      node.value = value;
      node.expiryTime = ttlMs ? Date.now() + ttlMs : null;
      this._moveToHead(node);
    } else {
      node = new Node(key, value, ttlMs);
      this.cache.set(key, node);
      this._addNode(node);
      this.size++;

      // Evict LRU item if capacity is exceeded
      if (this.size > this.capacity) {
        const evictedNode = this._popTail();
        this.cache.delete(evictedNode.key);
        this.size--;
      }
    }
  }

  delete(key) {
    const node = this.cache.get(key);
    if (!node) return false;

    this._removeNode(node);
    this.cache.delete(key);
    this.size--;
    return true;
  }

  clear() {
    this.size = 0;
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  getStats() {
    return {
      capacity: this.capacity,
      size: this.size
    };
  }

  cleanupExpiredKeys() {
    const now = Date.now();
    let expiredCount = 0;

    // Iterating Map to find expired nodes
    for (const [key, node] of this.cache.entries()) {
      if (node.expiryTime && now > node.expiryTime) {
        this._removeNode(node);
        this.cache.delete(key);
        this.size--;
        expiredCount++;
      }
    }
    return expiredCount;
  }
}

module.exports = LRUCache;
