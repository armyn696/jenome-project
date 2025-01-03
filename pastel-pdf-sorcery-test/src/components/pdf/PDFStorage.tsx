import { toast } from 'sonner';
import { openDB } from 'idb';

// Using IndexedDB instead of localStorage for larger storage capacity
const DB_NAME = 'PDFStorage';
const STORE_NAME = 'pdf_pages';
const PDF_FILE_STORE = 'pdf_file';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(PDF_FILE_STORE)) {
        db.createObjectStore(PDF_FILE_STORE);
      }
    },
  });
};

export const storePdfPages = async (pdfPages: string[]) => {
  if (pdfPages.length === 0) {
    await clearPdfStorage();
    return;
  }

  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put(pdfPages, 'current');
    await tx.done;

    console.log('PDF stored successfully with', pdfPages.length, 'pages');
  } catch (error) {
    console.error('Error storing PDF:', error);
    toast.error("Error storing PDF. Please try again.");
  }
};

export const storePdfFile = async (pdfFile: ArrayBuffer) => {
  try {
    const db = await initDB();
    const tx = db.transaction(PDF_FILE_STORE, 'readwrite');
    const store = tx.objectStore(PDF_FILE_STORE);
    await store.put(pdfFile, 'current');
    await tx.done;

    console.log('PDF file stored successfully');
  } catch (error) {
    console.error('Error storing PDF file:', error);
    toast.error("Error storing PDF file. Please try again.");
  }
};

export const retrievePdfPages = async (): Promise<string[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result = await store.get('current');
    await tx.done;
    return result || [];
  } catch (error) {
    console.error('Error retrieving PDF pages:', error);
    return [];
  }
};

export const retrievePdfFile = async (): Promise<ArrayBuffer | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(PDF_FILE_STORE, 'readonly');
    const store = tx.objectStore(PDF_FILE_STORE);
    const result = await store.get('current');
    await tx.done;
    return result || null;
  } catch (error) {
    console.error('Error retrieving PDF file:', error);
    return null;
  }
};

export const clearPdfStorage = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction([STORE_NAME, PDF_FILE_STORE], 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.objectStore(PDF_FILE_STORE).clear();
    await tx.done;
  } catch (error) {
    console.error('Error clearing PDF storage:', error);
  }
};