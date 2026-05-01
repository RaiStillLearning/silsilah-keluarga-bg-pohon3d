/**
 * Data Manager for Family Tree App.
 * Powered by Supabase for permanent cloud storage.
 */

// Initialize Supabase Client
const SUPABASE_URL = "https://gtuplmzrnggflusstydg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dXBsbXpybmdnZmx1c3N0eWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzkyMDcsImV4cCI6MjA5MzIxNTIwN30.hRqHPkQFbrTw5lFmxtDuACJdK68pwkUncDMDWgCJqNE";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DataManager = {
    // Table Names
    TABLES: {
        KEGIATAN: 'kegiatan',
        KEUANGAN: 'keuangan',
        MEMORIAL: 'memorial',
        KONTAK: 'kontak'
    },

    async getAllData(tableName) {
        const { data, error } = await supabase
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
        // Map frontend fields to DB fields if necessary
        if (tableName === this.TABLES.KEUANGAN && item.desc) {
            item.description = item.desc;
            delete item.desc;
        }

        const { data, error } = await supabase
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
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error(`Error deleting from ${tableName}:`, error);
            return false;
        }
        return true;
    },

    // Legacy support for getData (mapped to Supabase now)
    // Note: Since Supabase is async, pages will need minor updates to use await
    KEYS: {
        KEGIATAN: 'kegiatan',
        KEUANGAN: 'keuangan',
        MEMORIAL: 'memorial',
        KONTAK: 'kontak'
    }
};

window.DataManager = DataManager;
