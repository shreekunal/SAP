module.exports = class SequenceHelper {
    constructor(options) {
        this.db = options.db;
        this.sequence = options.sequence;
        this.table = options.table;
        this.field = options.field || "ID";
        this.prefix = options.prefix || "";
        this.format = options.format || "5"; // pad length
    }

    async getNextNumber() {
        try {
            let nextNumber = 0;

            switch (this.db.kind) {
                case "hana":
                    // Use HANA sequence via procedure
                    const result = await this.db.run(`{ CALL "NEXT_ORDER_NUMBER" (?) }`);
                    return result[0]?.ORDER_NUMBER || 'ORD-ERROR';

                case "sql":
                case "sqlite":
                    // Fallback: get max value and increment
                    const maxResult = await this.db.run(
                        `SELECT MAX("${this.field}") as max_val FROM "${this.table}"`
                    );
                    nextNumber = parseInt(maxResult[0].max_val || 0) + 1;
                    return this.prefix + String(nextNumber).padStart(this.format, '0');

                default:
                    throw new Error(`Unsupported DB kind: ${this.db.kind}`);
            }
        } catch (error) {
            console.error('SequenceHelper Error:', error);
            throw error;
        }
    }
};
