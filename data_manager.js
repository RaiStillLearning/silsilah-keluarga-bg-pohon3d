/**
 * Data Manager for Family Tree App.
 * Powered by Supabase for permanent cloud storage.
 */

// Ubah nama variabel agar tidak bentrok dengan global 'supabase' dari CDN
const _supabase = supabase.createClient(
    "https://gtuplmzrnggflusstydg.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dXBsbXpybmdnZmx1c3N0eWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzkyMDcsImV4cCI6MjA5MzIxNTIwN30.hRqHPkQFbrTw5lFmxtDuACJdK68pwkUncDMDWgCJqNE"
);

const DataManager = {
    // Table Names
    TABLES: {
        KEGIATAN: 'kegiatan',
        KEUANGAN: 'keuangan',
        MEMORIAL: 'memorial',
        KONTAK: 'kontak'
    },

    async getAllData(tableName) {
        const { data, error } = await _supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error(`Error fetching ${tableName}:`, error);
            return [];
        }
        return data;
    },

    async addItem(tableName, item) {
        if (tableName === this.TABLES.KEUANGAN && item.desc) {
            item.description = item.desc;
            delete item.desc;
        }

        const { data, error } = await _supabase
            .from(tableName)
            .insert([item])
            .select();
        
        if (error) {
            console.error(`Error adding to ${tableName}:`, error);
            return null;
        }
        return data[0];
    },

    async deleteItem(tableName, id) {
        const { error } = await _supabase
            .from(tableName)
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error(`Error deleting from ${tableName}:`, error);
            return false;
        }
        return true;
    },

    KEYS: {
        KEGIATAN: 'kegiatan',
        KEUANGAN: 'keuangan',
        MEMORIAL: 'memorial',
        KONTAK: 'kontak'
    }
};

window.DataManager = DataManager;
