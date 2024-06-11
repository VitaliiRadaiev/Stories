class StoriesApi {
    static delay = 400;

    static async fetch(url) {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        if(res.ok) {
            const result = await res.json();
            return await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(result)
                }, this.delay);
            });
        } else {
            throw new Error('StoriesApi fetching error');
        }
    }

    static async get({ page, size }) {
        const { companies } = await this.fetch('./public/data.json');
        return companies.slice(size * (page - 1), (size * (page - 1)) + size);
    }
    static async getById({ id }) {
        const { companies } = await this.fetch('./public/data.json');
        return companies.find(c => c.id === id);
    }
}


