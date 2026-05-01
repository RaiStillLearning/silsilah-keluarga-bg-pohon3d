/**
 * Data Manager for Family Tree App.
 * Handles persistence for activities, finances, memorials, and contacts.
 */
const DataManager = {
    KEYS: {
        KEGIATAN: 'family_data_kegiatan',
        KEUANGAN: 'family_data_keuangan',
        MEMORIAL: 'family_data_memorial',
        KONTAK: 'family_data_kontak'
    },

    // Initial Default Data
    DEFAULTS: {
        KEGIATAN: [
            { id: 1, title: "Halal Bihalal Idul Fitri 1445 H", date: "2024-05-11", location: "Kediaman Ibu Siti", type: "upcoming" },
            { id: 2, title: "Ziarah Bersama Tahun Baru", date: "2024-01-15", location: "Bogor", type: "history" }
        ],
        KEUANGAN: [
            { id: 1, date: "2024-04-05", desc: "Iuran Arisan Bulanan", type: "masuk", amount: 1500000 },
            { id: 2, date: "2024-04-02", desc: "Sumbangan Sosial (Duka)", type: "keluar", amount: 500000 }
        ],
        MEMORIAL: [
            { id: 1, name: "Alm. Yusuf Lubis", years: "1945 - 2020", quote: "Kasih sayangmu akan selalu hidup dalam ingatan kami.", category: "Generasi Pertama" }
        ],
        KONTAK: [
            { id: 1, name: "Bpk. Yusuf", role: "Ketua Arisan", phone: "08123456789" },
            { id: 2, name: "Ibu Siti", role: "Bendahara", phone: "08987654321" }
        ]
    },

    getData(key) {
        const data = localStorage.getItem(key);
        if (!data) {
            // Load defaults if empty
            const defaultKey = Object.keys(this.KEYS).find(k => this.KEYS[k] === key);
            this.saveData(key, this.DEFAULTS[defaultKey]);
            return this.DEFAULTS[defaultKey];
        }
        return JSON.parse(data);
    },

    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    addItem(key, item) {
        const data = this.getData(key);
        item.id = Date.now(); // Simple ID generation
        data.push(item);
        this.saveData(key, data);
        return item;
    },

    deleteItem(key, id) {
        let data = this.getData(key);
        data = data.filter(item => item.id !== id);
        this.saveData(key, data);
    }
};

// Export for use in pages
window.DataManager = DataManager;
