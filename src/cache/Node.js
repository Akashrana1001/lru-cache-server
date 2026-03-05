class Node {
    constructor(key, value, ttlMs) {
        this.key = key;
        this.value = value;
        this.expiryTime = ttlMs ? Date.now() + ttlMs : null;
        this.prev = null;
        this.next = null;
    }

    isExpired() {
        return this.expiryTime !== null && Date.now() > this.expiryTime;
    }
}

module.exports = Node;
