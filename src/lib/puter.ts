import { create } from 'zustand';

declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
      fs: {
        write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob>;
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        delete: (path: string) => Promise<void>;
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<KVItem[] | string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
  };
  fs: {
    read: (path: string) => Promise<Blob | undefined>;
    upload: (files: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (pattern: string, returnValues?: boolean) => Promise<KVItem[] | string[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };
  init: () => void;
}

const get_puter = () =>
  typeof window !== 'undefined' && (window as any).puter
    ? (window as any).puter
    : null;

export const usePuterStore = create<PuterStore>((set, get) => {
  const setError = (msg: string) => set({ error: msg, isLoading: false });

  const checkAuth = async () => {
    const p = get_puter();
    if (!p) return;
    set({ isLoading: true });
    try {
      const ok = await p.auth.isSignedIn();
      if (ok) {
        const user = await p.auth.getUser();
        set({ auth: { ...get().auth, user, isAuthenticated: true }, isLoading: false });
      } else {
        set({ auth: { ...get().auth, user: null, isAuthenticated: false }, isLoading: false });
      }
    } catch {
      set({ auth: { ...get().auth, user: null, isAuthenticated: false }, isLoading: false });
    }
  };

  const signIn = async () => {
    const p = get_puter();
    if (!p) { setError('Puter not ready'); return; }
    set({ isLoading: true });
    try { await p.auth.signIn(); await checkAuth(); }
    catch (e) { setError(String(e)); }
  };

  const signOut = async () => {
    const p = get_puter();
    if (!p) { setError('Puter not ready'); return; }
    set({ isLoading: true });
    try {
      await p.auth.signOut();
      set({ auth: { ...get().auth, user: null, isAuthenticated: false }, isLoading: false });
    } catch (e) { setError(String(e)); }
  };

  const init = () => {
    if (get_puter()) { set({ puterReady: true }); checkAuth(); return; }
    const iv = setInterval(() => {
      if (get_puter()) { clearInterval(iv); set({ puterReady: true }); checkAuth(); }
    }, 100);
    setTimeout(() => { clearInterval(iv); }, 10000);
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: { user: null, isAuthenticated: false, signIn, signOut },
    fs: {
      read: async (path) => {
        const p = get_puter(); if (!p) return undefined;
        return p.fs.read(path);
      },
      upload: async (files) => {
        const p = get_puter(); if (!p) return undefined;
        return p.fs.upload(files);
      },
      delete: async (path) => {
        const p = get_puter(); if (!p) return;
        return p.fs.delete(path);
      },
      readDir: async (path) => {
        const p = get_puter(); if (!p) return undefined;
        return p.fs.readdir(path);
      },
    },
    kv: {
      get: async (key) => {
        const p = get_puter(); if (!p) return undefined;
        return p.kv.get(key);
      },
      set: async (key, value) => {
        const p = get_puter(); if (!p) return undefined;
        return p.kv.set(key, value);
      },
      delete: async (key) => {
        const p = get_puter(); if (!p) return undefined;
        try { if (p.kv.del) await p.kv.del(key); } catch {}
        try { if (p.kv.delete) await p.kv.delete(key); } catch {}
        try { await p.kv.set(key, 'null'); } catch {}
        return true;
      },
      list: async (pattern, returnValues) => {
        const p = get_puter(); if (!p) return undefined;
        return p.kv.list(pattern, returnValues ?? false);
      },
      flush: async () => {
        const p = get_puter(); if (!p) return undefined;
        return p.kv.flush();
      },
    },
    init,
  };
});
