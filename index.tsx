
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { marked } from 'marked';
import JSZip from 'jszip';

// Since we can't use JSX syntax directly without a build step in this environment,
// we use React.createElement. The logic remains the same.
const e = React.createElement;

// --- ICONS ---
const Icons = {
  WinuxLogo: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 100 100', fill: 'currentColor' }, e('path', { d: 'M0 0 H48 V48 H0z M52 0 H100 V48 H52z M0 52 H48 V100 H0z M52 52 H100 V100 H52z' })),
  Start: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M4 4h6v6H4zm0 8h6v6H4zm8-8h6v6h-6zm0 8h6v6h-6z' })),
  FileExplorer: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    e('path', { d: "M21.41 6.64a1 1 0 0 0-.6-.23H10.5l-1.9-2.28a1 1 0 0 0-.8-.39H4.2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16.8a1 1 0 0 0 1-1V7.64a1 1 0 0 0-.59-1Z", fill: "#3B82F6" }),
    e('path', { d: "M2 18.35V8.59l19.5-2v12.2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-.44Z", fill: "#1D4ED8" })
  ),
  Terminal: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    e('rect', { width: "24", height: "24", rx: "4", fill: "#1A202C" }),
    e('path', { d: "m7 8 3 4-3 4", stroke: "#4ADE80", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
    e('path', { d: "M11 16h6", stroke: "#4ADE80", strokeWidth: "2", strokeLinecap: "round" })
  ),
  Browser: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    e('circle', { cx: "12", cy: "12", r: "10", fill: "#22C55E" }),
    e('path', { d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 0 1-8-8h16a8 8 0 0 1-8 8Z", fill: "#16A34A" }),
    e('path', { d: "M12 2C9.28 2 6.78 3.08 5 4.85c1.7-1.28 3.8-2.05 6-2.05s4.3.77 6 2.05C17.22 3.08 14.72 2 12 2Z", fill: "#A7F3D0" }),
    e('path', { d: "M4 12a8 8 0 0 1 2.34-5.66A7.95 7.95 0 0 0 4 12Zm13.66-5.66A7.95 7.95 0 0 0 20 12h-2.34a5.97 5.97 0 0 1-1.32-5.66Z", fill: "#6EE7B7" })
  ),
  Settings: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    e('defs', null, e('linearGradient', { id: "grad_settings", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        e('stop', { offset: "0%", style: { stopColor: '#9CA3AF', stopOpacity: 1 } }),
        e('stop', { offset: "100%", style: { stopColor: '#4B5563', stopOpacity: 1 } })
    )),
    e('path', { d: "M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24-.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49 1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0-.61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z", fill: "url(#grad_settings)" })
  ),
  AIAssistant: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    e('defs', null, e('linearGradient', { id: "grad_ai", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        e('stop', { offset: "0%", style: { stopColor: '#A78BFA', stopOpacity: 1 } }),
        e('stop', { offset: "100%", style: { stopColor: '#6D28D9', stopOpacity: 1 } })
    )),
    e('path', { d: "M12 2.75C6.891 2.75 2.75 6.891 2.75 12c0 5.108 4.141 9.25 9.25 9.25s9.25-4.142 9.25-9.25C21.25 6.891 17.109 2.75 12 2.75ZM9.5 12l2.5 4 2.5-4-2.5-4-2.5 4Z", fill: "url(#grad_ai)" }),
    e('path', { d: "M17 7a1 1 0 1 0-2 0 1 1 0 0 0 2 0ZM7 7a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z", fill: "white" })
  ),
  Developer: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "currentColor"}, e('path', { d: "M10 9L6.5 12.5L10 16V13H14V11H10V9M14 15L17.5 11.5L14 8V11H10V13H14V15M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" })),
  Biohazard: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M14.68,14.24,12,18,9.32,14.24,6,15.39,6.54,12,6,8.61,9.32,9.76,12,6,14.68,9.76,18,8.61,17.46,12,18,15.39ZM12,2a10,10,0,1,0,10,10A10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z', style: {color: '#FBBF24'} })),
  TextEditor: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    e('path', { d: "M4 22h16a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1Z", fill: "#E5E7EB" }),
    e('path', { d: "M7 6h10v2H7V6ZM7 10h10v2H7v-2ZM7 14h6v2H7v-2Z", fill: "#4B5563" })
  ),
  Folder: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" },
    e('path', { d: "M21.41 6.64a1 1 0 0 0-.6-.23H10.5l-1.9-2.28a1 1 0 0 0-.8-.39H4.2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16.8a1 1 0 0 0 1-1V7.64a1 1 0 0 0-.59-1Z", fill: "#60A5FA" })
  ),
  File: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" },
    e('path', { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z", fill: "#E5E7EB" }),
    e('path', { d: "M14 2v6h6l-6-6Z", fill: "#9CA3AF" })
  ),
  DesktopFile: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" },
    e('path', { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z", fill: "#E5E7EB" }),
    e('path', { d: "M14 2v6h6l-6-6Z", fill: "#9CA3AF" }),
    e('path', { d: "M9 14h6v2H9v-2Zm0 4h6v2H9v-2Z", fill: "#6B7280" })
  ),
  Minimize: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M20 13H4v-2h16v2z' })),
  Maximize: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M4 4h16v16H4V4zm2 2v12h12V6H6z' })),
  Restore: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 10 10" }, e('path', { d: 'M2,0H10V8H8V10H0V2H2V0ZM3,1V2H8V7H9V1H3ZM1,3V9H7V3H1Z' })),
  Close: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 10 10" }, e('path', { d: 'M1.41 0L5 3.59L8.59 0L10 1.41L6.41 5L10 8.59L8.59 10L5 6.41L1.41 10L0 8.59L3.59 5L0 1.41Z' })),
  Back: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' })),
  Forward: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' })),
  Home: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' })),
  Refresh: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' })),
  Up: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' })),
  User: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' })),
  Wifi: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C19.73 3.73 8.27 3.73 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zM5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z' })),
  Brightness: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { fill: 'currentColor', d: 'M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z' })),
  Trash: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' })),
  Send: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' })),
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 16 16' }, e('path', { 'fillRule': 'evenodd', d: 'M8 11L3 6h10L8 11z', fill:'currentColor' })),
  ChevronRight: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 16 16' }, e('path', { 'fillRule': 'evenodd', d: 'M6 3l5 5-5 5H6V3z', fill:'currentColor' })),
  Volume: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' })),
  Theme: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 3a9 9 0 0 0 0 18a9 9 0 0 0 0-18zM12 19a7 7 0 0 1 0-14v14z' })),
  SignOut: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z' })),
};

const VSCODE_ICONS = {
  Code: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    e('path', { d: "M16.44 3.1c-1-.53-2.16-.6-3.24-.2L4.22 8.24c-1.9 1.1-1.9 3.42 0 4.52l8.98 5.34c1.08.4 2.25.33 3.24-.2l.02-.01c1.9-1.1 1.9-3.42 0-4.52L7.48 8l8.98-4.9Z", fill: "#3B82F6" })
  ),
  Files: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { d: 'M16.5 8H19v11H5V3h8.5l-3 3h-3v11H14v-9h2.5l-2.5-2.5zM6 4.5V18h12V9h-5V4.5H6z', fill:'currentColor' })),
  Agent: Icons.AIAssistant,
  Explain: (props: React.SVGProps<SVGSVGElement>) => e('svg', {...props, viewBox: "0 0 24 24", fill: "currentColor"}, e('path', {d: "M12 6.5a4.5 4.5 0 1 0 4.5 4.5 4.5 4.5 0 0 0-4.5-4.5Zm0 7a2.5 2.5 0 1 1 2.5-2.5A2.5 2.5 0 0 1 12 13.5Zm0-11.5a10 10 0 1 0 10 10 10 10 0 0 0-10-10Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"})),
};

const STATIC_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    FileExplorer: Icons.FileExplorer,
    Terminal: Icons.Terminal,
    Browser: Icons.Browser,
    Settings: Icons.Settings,
    AIAssistant: Icons.AIAssistant,
    TextEditor: Icons.TextEditor,
    KernelMeltdown: Icons.Biohazard,
    VSCode: VSCODE_ICONS.Code,
    File: Icons.File,
    Folder: Icons.Folder,
    DesktopFile: Icons.DesktopFile,
};

// --- OS Core Architecture ---

const SYSCALL_OPCODES = {
    SYS_GET_ENV: 0x003,
    SYS_BSOD: 0x004,
    SYS_EXEC: 0x005,
    SYS_EXEC_JS: 0x006,
    PROC_OPEN: 0x100,
    PROC_CLOSE: 0x101,
    FS_READ_FILE: 0x200,
    FS_WRITE_FILE: 0x201,
    FS_READ_DIR: 0x202,
    FS_GET_NODE: 0x203,
    FS_INSTALL_WAP: 0x204,
    FS_INSTALL_FEATURE: 0x205,
    FS_RESOLVE_PATH: 0x206,
    SETTINGS_GET: 0x300,
    SETTINGS_SET: 0x301,
};

const OS_MEMORY_MB = 24;
const OS_MEMORY_BYTES = OS_MEMORY_MB * 1024 * 1024;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class DeviceDriver {
    private db: IDBDatabase | null = null;

    async init() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open('WinuxSystemMemoryDB', 1);
            request.onerror = () => reject("BIOS Error: IndexedDB could not be opened.");
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                db.createObjectStore('system_memory');
            };
        });
    }

    async getSystemMemory(): Promise<ArrayBuffer | SharedArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject("DeviceDriver Error: DB not initialized");
            const transaction = this.db.transaction(['system_memory'], 'readonly');
            const store = transaction.objectStore('system_memory');
            const request = store.get('main_memory');
            request.onerror = () => reject("DeviceDriver Error: Could not read system memory.");
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    async saveSystemMemory(memory: ArrayBuffer | SharedArrayBuffer) {
        if (!this.db || !memory) return;
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['system_memory'], 'readwrite');
            const store = transaction.objectStore('system_memory');
            const request = store.put(memory, 'main_memory');
            request.onerror = () => reject("DeviceDriver Error: Could not write system memory.");
            request.onsuccess = () => resolve();
        });
    }

    createInitialMemory(): ArrayBuffer {
        // Fallback to ArrayBuffer if SharedArrayBuffer is not available
        return new ArrayBuffer(OS_MEMORY_BYTES);
    }
}

// --- Kernel Managers ---
class MemoryManager {
    private view: DataView;
    private scratchpadPtr: number;
    private scratchpadSize: number;
    private nextAlloc: number;

    constructor(view: DataView, userSpaceStart: number, userSpaceEnd: number) {
        this.view = view;
        // Allocate first 1MB of User Space for syscall scratchpad
        this.scratchpadPtr = userSpaceStart;
        this.scratchpadSize = 1 * 1024 * 1024;
        this.nextAlloc = this.scratchpadPtr;
    }

    // Extremely simple bump allocator for syscall arguments.
    // A real OS would have a more complex heap allocator (e.g., linked list of free blocks).
    alloc(payload: any): number {
        const payloadStr = JSON.stringify(payload);
        const bytes = encoder.encode(payloadStr);
        const len = bytes.length;

        if (this.nextAlloc + 4 + len > this.scratchpadPtr + this.scratchpadSize) {
            // Out of scratchpad memory, reset. This is a simplification.
            this.nextAlloc = this.scratchpadPtr;
        }

        const ptr = this.nextAlloc;
        this.view.setUint32(ptr, len, true); // Write length prefix
        new Uint8Array(this.view.buffer).set(bytes, ptr + 4);
        
        this.nextAlloc += (4 + len);
        return ptr;
    }
    
    readPayload(ptr: number): any {
        const len = this.view.getUint32(ptr, true);
        const bytes = new Uint8Array(this.view.buffer, ptr + 4, len);
        const payloadStr = decoder.decode(bytes);
        return JSON.parse(payloadStr);
    }

    // In this simple bump allocator, free is a no-op. Memory is "freed" by resetting the pointer.
    free(ptr: number) { /* no-op */ }
}

class Scheduler {
    private processes: Map<number, Process> = new Map();
    private focusStack: number[] = [];
    private nextProcessId = 1;
    private kernel: Kernel;

    constructor(kernel: Kernel) {
      this.kernel = kernel;
    }

    getProcessIds = (): number[] => Array.from(this.processes.keys());
    getProcessInfo = (pid: number): Process | null => this.processes.get(pid) || null;
    
    openProcess = async (appId: string, options: { filePath?: string } = {}) => {
        const id = this.nextProcessId++;
        
        let appDef: AppDefinition | null = null;
        let titleStr = "Unknown App";
        let filePathStr = options.filePath || "";
        let driverStatus: Process['driverStatus'] = 'not_required';
        let finalAppId = appId;
        
        if (appId.endsWith('.desktop')) {
            const ino = this.kernel.vfs.pathToInodeNum(appId);
            if (!ino) {
                console.error(`Desktop file not found: ${appId}`);
                return null;
            }
            const desktopFileContent = this.kernel.vfs.readFileContentByInode(ino);
            const execMatch = desktopFileContent.match(/Exec=(.*)/);
            if (execMatch && execMatch[1]) {
                 finalAppId = execMatch[1].trim();
            }
        }
        
        if (filePathStr && !finalAppId.endsWith('.wap') && !finalAppId.endsWith('.desktop')) {
            const codeExtensions = ['.js', '.css', '.json', '.txt', '.md', '.ts', '.py'];
            if (filePathStr.endsWith('.html')) {
                finalAppId = '/usr/apps/Browser.wap';
            } else if (codeExtensions.some(ext => filePathStr.endsWith(ext))) {
                finalAppId = '/usr/apps/VSCode.wap';
            } else {
                finalAppId = this.kernel.settings.defaultEditor;
            }
        }
        
        appDef = this.kernel.getAppDefinition(finalAppId);
        if(!appDef) {
            console.error(`No app definition found for ${finalAppId}`);
            return null;
        }

        titleStr = appDef.name;
        if (filePathStr) {
             const node = this.kernel.vfs.getVFSNodeByPath(filePathStr);
             if (node) titleStr = `${node.name} - ${appDef.name}`;
        } else if (finalAppId.endsWith('.wap')) {
            filePathStr = finalAppId;
        }

        if (finalAppId.endsWith('.wap')) {
            const ino = this.kernel.vfs.pathToInodeNum(finalAppId);
            if (ino) {
                try {
                    const fileBytes = this.kernel.vfs.readFileBytesByInode(ino);
                    const zip = await JSZip.loadAsync(fileBytes);
                    const manifestFile = zip.file('manifest.json');
                    if (manifestFile) {
                        const manifest = JSON.parse(await manifestFile.async('string'));
                        if (manifest.driver === 'babylonjs') {
                            const driverPath = '/lib/drivers/babylon.drv';
                            driverStatus = this.kernel.vfs.pathToInodeNum(driverPath) ? 'enabled' : 'disabled';
                        }
                    }
                } catch (e) {
                    console.error("Failed to check WAP manifest for driver:", e);
                }
            }
        }
        
        const newProcess: Process = {
            id, appId: finalAppId, zIndex: 1000 + id,
            x: 50 + (id % 10) * 20, y: 50 + (id % 10) * 20,
            width: 800, height: 600,
            isMaximized: false, isMinimized: false, isFocused: false,
            title: titleStr, filePath: options.filePath, driverStatus,
            env: { 'GEMINI_API_KEY': this.kernel.apiKey }
        };
        this.processes.set(id, newProcess);

        this.focusProcess(id);
        this.kernel.notify();
        return id;
    };

    closeProcess = (pid: number) => {
        this.processes.delete(pid);
        this.focusStack = this.focusStack.filter(id => id !== pid);
        if (this.focusStack.length > 0) {
            this.focusProcess(this.focusStack[this.focusStack.length - 1]);
        }
        this.kernel.notify();
    };
    
    focusProcess = (pid: number) => {
        this.focusStack = [pid, ...this.focusStack.filter(id => id !== pid)];
        this.processes.forEach((process, id) => {
            process.isFocused = id === pid;
            process.zIndex = 1000 + this.focusStack.slice().reverse().indexOf(id);
            if (process.isFocused) {
               process.isMinimized = false;
            }
        });
        this.kernel.notify();
    };

    updateProcessState = (pid: number, updates: Partial<Process>) => {
        const process = this.processes.get(pid);
        if (!process) return;
        Object.assign(process, updates);
        
        if (updates.isMinimized) {
            const newFocusStack = this.focusStack.filter(id => id !== pid);
            if (newFocusStack.length > 0) {
                this.focusProcess(newFocusStack[0]);
            }
            this.focusStack = newFocusStack;
        }
        this.kernel.notify();
    };
}

const ROOT_INODE_NUM = 2;
const INODE_STRUCT_SIZE = 32;
const DIRENT_STRUCT_SIZE = 32;
const BLOCK_SIZE = 4096;
const BLOCK_DATA_SIZE = BLOCK_SIZE - 4; // 4 bytes for next block pointer
const INODE_TYPE_FILE = 1;
const INODE_TYPE_DIR = 2;
// Standard Unix-like permissions + file type
const INODE_MODE_FILE = 0o100644; // Regular file, rw-r--r--
const INODE_MODE_DIR = 0o040755; // Directory, rwxr-xr-x
const INODE_MODE_FILE_RO = 0o100444; // Read-only file, r--r--r--

class VFS {
    private view: DataView;
    private vfsBasePtr: number;
    private inodeTablePtr: number = 0;
    private dataBlocksPtr: number = 0;
    private freeBlockListPtr: number = 0;
    private nextInodeNum = ROOT_INODE_NUM;
    private inodeMap: Map<number, number> = new Map();
    private pathCache: Map<string, number> = new Map();
    private kernel: Kernel;

    constructor(kernel: Kernel, vfsPartitionStart: number, vfsPartitionEnd: number) {
        this.kernel = kernel;
        this.view = new DataView(kernel.getSystemMemoryBuffer());
        this.vfsBasePtr = vfsPartitionStart;
    }

    async init() {
        const magic = this.view.getUint32(this.vfsBasePtr, true);
        if (magic !== 0xEF53) {
             await this.format();
        } else {
             this.load();
        }
    }

    private load() {
        this.inodeTablePtr = this.vfsBasePtr + this.view.getUint32(this.vfsBasePtr + 4, true);
        this.dataBlocksPtr = this.vfsBasePtr + this.view.getUint32(this.vfsBasePtr + 8, true);
        this.nextInodeNum = this.view.getUint32(this.vfsBasePtr + 12, true);
        this.freeBlockListPtr = this.view.getUint32(this.vfsBasePtr + 16, true);
        
        const settingsIno = this.pathToInodeNum('/etc/settings.json', '/');
        if (settingsIno) {
            try {
                const settingsContent = this.readFileContentByInode(settingsIno);
                this.kernel.settings = { ...this.kernel.settings, ...JSON.parse(settingsContent) };
                this.kernel.apiKey = this.kernel.settings.apiKey;
            } catch (e) {
                console.warn("VFS: Could not parse settings.json, using default.", e);
            }
        }

        for(let ino = ROOT_INODE_NUM; ino < this.nextInodeNum; ino++) {
             const ptr = this.inodeTablePtr + ((ino - ROOT_INODE_NUM) * INODE_STRUCT_SIZE);
             this.inodeMap.set(ino, ptr);
        }
    }

    private async format() {
        new Uint8Array(this.view.buffer, this.vfsBasePtr, this.kernel.memoryMap.VFS_PARTITION_END - this.vfsBasePtr).fill(0);
        this.view.setUint32(this.vfsBasePtr, 0xEF53, true);

        const SUPERBLOCK_SIZE = 128;
        const inodeTableSize = INODE_STRUCT_SIZE * 1024;
        this.inodeTablePtr = this.vfsBasePtr + SUPERBLOCK_SIZE;
        this.dataBlocksPtr = this.inodeTablePtr + inodeTableSize;
        
        const vfsPartitionSize = this.kernel.memoryMap.VFS_PARTITION_END - this.kernel.memoryMap.VFS_PARTITION_START;
        const numDataBlocks = Math.floor((this.vfsBasePtr + vfsPartitionSize - this.dataBlocksPtr) / BLOCK_SIZE);

        this.view.setUint32(this.vfsBasePtr + 4, SUPERBLOCK_SIZE, true);
        this.view.setUint32(this.vfsBasePtr + 8, this.dataBlocksPtr - this.vfsBasePtr, true);
        
        this.freeBlockListPtr = 1;
        for (let i = 1; i < numDataBlocks; i++) {
            const blockPtr = this.getBlockPtr(i);
            this.view.setUint32(blockPtr + BLOCK_DATA_SIZE, i + 1, true);
        }
        this.view.setUint32(this.getBlockPtr(numDataBlocks) + BLOCK_DATA_SIZE, 0, true);

        const rootIno = this.allocInode(INODE_MODE_DIR);
        if (rootIno !== ROOT_INODE_NUM) throw new Error("VFS: Root inode must be 2");
        this.pathCache.set('/', rootIno);
        
        // --- Create Linux-like directory structure ---
        const homeIno = this.createDir(rootIno, 'home');
        const userHomeIno = this.createDir(homeIno, this.kernel.settings.username);
        this.createDir(userHomeIno, 'Desktop');
        this.createDir(userHomeIno, 'Documents');
        this.createDir(userHomeIno, 'Downloads');
        
        const usrIno = this.createDir(rootIno, 'usr');
        const appsDirIno = this.createDir(usrIno, 'apps');
        
        const etcIno = this.createDir(rootIno, 'etc');
        const binIno = this.createDir(rootIno, 'bin');
        const libIno = this.createDir(rootIno, 'lib');
        const driversDirIno = this.createDir(libIno, 'drivers');
        
        const bootIno = this.createDir(rootIno, 'boot');
        const grubIno = this.createDir(bootIno, 'grub');
        
        this.createDir(rootIno, 'dev');
        this.createDir(rootIno, 'proc');
        const sysIno = this.createDir(rootIno, 'sys');
        const sysModuleIno = this.createDir(sysIno, 'module');
        const sysModuleUiIno = this.createDir(sysModuleIno, 'ui');
        const sysModuleDriversIno = this.createDir(sysModuleIno, 'drivers');
        const sysModuleBootIno = this.createDir(sysModuleIno, 'boot');

        // --- Create OS Component Files ---
        const FSTAB_CONTENT = `# /etc/fstab: static file system information.
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
/dev/ram0       /               vfs     defaults        0       1
proc            /proc           proc    defaults        0       0
sysfs           /sys            sysfs   defaults        0       0
`;
        
        this.createFile(binIno, 'jsint', OS_SOURCE_CODE.JSINT, INODE_MODE_FILE_RO);
        this.createFile(driversDirIno, 'babylon.drv', OS_SOURCE_CODE.BABYLON_DRIVER, INODE_MODE_FILE_RO);
        this.createFile(grubIno, 'grub.cfg', OS_SOURCE_CODE.GRUB_CFG, INODE_MODE_FILE_RO);
        this.createFile(etcIno, 'fstab', FSTAB_CONTENT, INODE_MODE_FILE_RO);
        this.createFile(etcIno, 'settings.json', JSON.stringify(this.kernel.settings, null, 2));

        // Create core OS files with their source code
        this.createFile(bootIno, 'vmlinuz-3.0.0-winux', OS_SOURCE_CODE.KERNEL, INODE_MODE_FILE_RO);
        this.createFile(bootIno, 'initrd-3.0.0-winux', OS_SOURCE_CODE.INITRD, INODE_MODE_FILE_RO);
        this.createFile(sysModuleUiIno, 'core', OS_SOURCE_CODE.UI_CORE, INODE_MODE_FILE_RO);
        this.createFile(sysModuleUiIno, 'components', OS_SOURCE_CODE.UI_COMPONENTS, INODE_MODE_FILE_RO);
        this.createFile(sysModuleUiIno, 'app_host', OS_SOURCE_CODE.WAP_RUNNER, INODE_MODE_FILE_RO);
        this.createFile(sysModuleDriversIno, 'device', OS_SOURCE_CODE.DEVICE_DRIVER, INODE_MODE_FILE_RO);
        this.createFile(sysModuleDriversIno, 'network', OS_SOURCE_CODE.NETWORK_DRIVER, INODE_MODE_FILE_RO);
        this.createFile(sysModuleBootIno, 'main', OS_SOURCE_CODE.APP, INODE_MODE_FILE_RO);
        this.createFile(sysModuleBootIno, 'login', OS_SOURCE_CODE.LOGIN, INODE_MODE_FILE_RO);

        this.createFile(userHomeIno, 'readme.txt', 'Welcome to your new home directory!');
        
        // --- Install WAPs ---
        const desktopDirIno = this.pathToInodeNum(`/home/${this.kernel.settings.username}/Desktop`);
        for (const [appName, source] of Object.entries(WAP_SOURCES)) {
            const zip = new JSZip();
            zip.file('manifest.json', source.manifest);
            zip.file('index.html', source.html);
            const wapData = await zip.generateAsync({ type: 'uint8array' });
            
            const wapPath = `/usr/apps/${appName}.wap`;
            this.createFile(appsDirIno, `${appName}.wap`, wapData, INODE_MODE_FILE_RO);

            if (desktopDirIno) {
                const manifest = JSON.parse(source.manifest);
                const shortcutContent = `[Desktop Entry]\nName=${manifest.name}\nExec=${wapPath}\nIcon=${manifest.icon}`;
                this.createFile(desktopDirIno, `${manifest.name}.desktop`, shortcutContent);
            }
        }
        
        this.persistSuperblock();
    }
    
    private writeString(str: string, ptr: number, maxLength?: number) {
        const data = encoder.encode(str);
        const length = maxLength ? Math.min(data.length, maxLength) : data.length;
        for (let i = 0; i < length; i++) {
            this.view.setUint8(ptr + i, data[i]);
        }
        if (maxLength && length < maxLength) this.view.setUint8(ptr + length, 0);
    }
    
    private readString(ptr: number, maxLength: number = Infinity): string {
        const bytes = [];
        for (let i = 0; i < maxLength; i++) {
            const byte = this.view.getUint8(ptr + i);
            if (byte === 0) break;
            bytes.push(byte);
        }
        return decoder.decode(new Uint8Array(bytes));
    }
    
    private writeBytes(bytes: Uint8Array, ptr: number) {
        new Uint8Array(this.view.buffer).set(bytes, ptr);
    }

    private readBytes(ptr: number, length: number): Uint8Array {
        return new Uint8Array(this.view.buffer.slice(ptr, ptr + length));
    }

    private persistSuperblock() {
        this.view.setUint32(this.vfsBasePtr + 12, this.nextInodeNum, true);
        this.view.setUint32(this.vfsBasePtr + 16, this.freeBlockListPtr, true);
    }

    private allocInode(mode: number): number {
        const ino = this.nextInodeNum++;
        const ptr = this.inodeTablePtr + ((ino - ROOT_INODE_NUM) * INODE_STRUCT_SIZE);
        this.inodeMap.set(ino, ptr);
        this.view.setUint32(ptr, ino, true);
        this.view.setUint32(ptr + 4, mode, true);
        this.view.setUint32(ptr + 8, mode === INODE_MODE_DIR ? 2 : 1, true);
        this.view.setUint32(ptr + 12, 0, true);
        this.view.setFloat64(ptr + 16, Date.now(), true);
        this.view.setUint32(ptr + 24, 0, true);
        return ino;
    }

    private allocBlock(): number {
        if (this.freeBlockListPtr === 0) {
             this.kernel.triggerBSOD('OUT_OF_DISK_SPACE');
             throw new Error('Out of disk space');
        }
        const newBlockNum = this.freeBlockListPtr;
        const newBlockPtr = this.getBlockPtr(newBlockNum);
        this.freeBlockListPtr = this.view.getUint32(newBlockPtr + BLOCK_DATA_SIZE, true);
        new Uint8Array(this.view.buffer, newBlockPtr, BLOCK_SIZE).fill(0);
        this.persistSuperblock();
        return newBlockNum;
    }
    
    private freeBlockChain(firstBlockNum: number) {
        let currentBlockNum = firstBlockNum;
        while(currentBlockNum !== 0) {
            const blockPtr = this.getBlockPtr(currentBlockNum);
            const nextBlockNum = this.view.getUint32(blockPtr + BLOCK_DATA_SIZE, true);
            this.view.setUint32(blockPtr + BLOCK_DATA_SIZE, this.freeBlockListPtr, true);
            this.freeBlockListPtr = currentBlockNum;
            currentBlockNum = nextBlockNum;
        }
        this.persistSuperblock();
    }

    private getInodePtr(ino: number): number | undefined { return this.inodeMap.get(ino); }
    private getBlockPtr(blockNum: number): number { return this.dataBlocksPtr + ((blockNum-1) * BLOCK_SIZE); }

    private readInode(ino: number): Inode | null {
        const ptr = this.getInodePtr(ino);
        if (!ptr) return null;
        const mode = this.view.getUint32(ptr + 4, true);
        return {
            ino: this.view.getUint32(ptr, true),
            mode,
            type: (mode & INODE_MODE_DIR) === INODE_MODE_DIR ? 'directory' : 'file',
            nlink: this.view.getUint32(ptr + 8, true),
            size: this.view.getUint32(ptr + 12, true),
            mtime: this.view.getFloat64(ptr + 16, true),
            firstBlock: this.view.getUint32(ptr + 24, true),
        };
    }

    private writeInode(ino: number, data: Partial<Inode & {firstBlock: number}>) {
        const ptr = this.getInodePtr(ino);
        if (!ptr) return;
        if (data.nlink !== undefined) this.view.setUint32(ptr + 8, data.nlink, true);
        if (data.size !== undefined) this.view.setUint32(ptr + 12, data.size, true);
        if (data.mtime !== undefined) this.view.setFloat64(ptr + 16, Date.now(), true);
        if (data.firstBlock !== undefined) this.view.setUint32(ptr + 24, data.firstBlock, true);
    }

    private addDirent(parentIno: number, dirent: {ino: number, name: string, type: number}) {
        const parentInode = this.readInode(parentIno)!;
        let blockNum = parentInode.firstBlock;
        let lastBlockNum = 0;
        if (!blockNum) {
            blockNum = this.allocBlock();
            this.writeInode(parentIno, { firstBlock: blockNum });
        }
        while(blockNum !== 0) {
            const blockPtr = this.getBlockPtr(blockNum);
            for (let i = 0; i < BLOCK_DATA_SIZE; i += DIRENT_STRUCT_SIZE) {
                if (this.view.getUint32(blockPtr + i, true) === 0) {
                    this.view.setUint32(blockPtr + i, dirent.ino, true);
                    this.view.setUint32(blockPtr + i + 4, dirent.type, true);
                    this.writeString(dirent.name, blockPtr + i + 8, 24);
                    this.writeInode(parentIno, { size: parentInode.size + DIRENT_STRUCT_SIZE });
                    return;
                }
            }
            lastBlockNum = blockNum;
            blockNum = this.view.getUint32(blockPtr + BLOCK_DATA_SIZE, true);
        }
        const newBlockNum = this.allocBlock();
        this.view.setUint32(this.getBlockPtr(lastBlockNum) + BLOCK_DATA_SIZE, newBlockNum, true);
        const newBlockPtr = this.getBlockPtr(newBlockNum);
        this.view.setUint32(newBlockPtr, dirent.ino, true);
        this.view.setUint32(newBlockPtr + 4, dirent.type, true);
        this.writeString(dirent.name, newBlockPtr + 8, 24);
        this.writeInode(parentIno, { size: parentInode.size + DIRENT_STRUCT_SIZE });
    }

    private createDir(parentIno: number, name: string): number {
        const newIno = this.allocInode(INODE_MODE_DIR);
        this.addDirent(parentIno, { ino: newIno, name, type: INODE_TYPE_DIR });
        this.addDirent(newIno, {ino: newIno, name: '.', type: INODE_TYPE_DIR});
        this.addDirent(newIno, {ino: parentIno, name: '..', type: INODE_TYPE_DIR});
        return newIno;
    }

    public createFile(parentIno: number, name: string, content: string | Uint8Array, mode: number = INODE_MODE_FILE): number {
        const newIno = this.allocInode(mode);
        this.addDirent(parentIno, { ino: newIno, name, type: INODE_TYPE_FILE });
        this.updateFileContentByInode(newIno, content, true);
        return newIno;
    }

    resolvePath = (path: string, cwd: string = '/'): string => {
        if (typeof path !== 'string' || path === '') return cwd;
        const homeDir = `/home/${this.kernel.settings.username}`;
        let absolutePath = path.startsWith('/') ? path : `${cwd === '/' ? '' : cwd}/${path}`;
        absolutePath = absolutePath.replace('~', homeDir);
        const parts = absolutePath.split('/').filter(p => p);
        const finalParts: string[] = [];
        for(const part of parts) {
            if (part === '..') {
                finalParts.pop();
            } else if (part !== '.') {
                finalParts.push(part);
            }
        }
        return ('/' + finalParts.join('/')).replace('//', '/');
    }

    pathToInodeNum = (path: string, cwd: string = '/'): number | null => {
        const absolutePath = this.resolvePath(path, cwd);
        if (this.pathCache.has(absolutePath)) return this.pathCache.get(absolutePath)!;
        if (absolutePath === '/') return ROOT_INODE_NUM;
        const parts = absolutePath.split('/').filter(p => p);
        let currentIno = ROOT_INODE_NUM;
        for (const part of parts) {
            const inode = this.readInode(currentIno);
            if (!inode || inode.type !== 'directory') return null;
            let found = false;
            let blockNum = inode.firstBlock;
            while(blockNum !== 0 && !found) {
                const blockPtr = this.getBlockPtr(blockNum);
                for (let i = 0; i < BLOCK_DATA_SIZE; i += DIRENT_STRUCT_SIZE) {
                    const entryIno = this.view.getUint32(blockPtr + i, true);
                    if (entryIno === 0) continue;
                    const name = this.readString(blockPtr + i + 8, 24);
                    if (name === part) {
                        currentIno = entryIno;
                        found = true;
                        break;
                    }
                }
                if (!found) blockNum = this.view.getUint32(blockPtr + BLOCK_DATA_SIZE, true);
            }
            if (!found) return null;
        }
        this.pathCache.set(absolutePath, currentIno);
        return currentIno;
    }

    getVFSNodeByPath = (path: string, cwd: string = '/'): VFSNode | null => {
        const absolutePath = this.resolvePath(path, cwd);
        const ino = this.pathToInodeNum(absolutePath);
        if (!ino) return null;
        const inode = this.readInode(ino);
        if (!inode) return null;
        const name = absolutePath.split('/').pop() || '/';
        const node: VFSNode = { path: absolutePath, name, type: inode.type, ino: inode.ino };
        if (inode.type === 'directory') {
            node.children = [];
            let blockNum = inode.firstBlock;
            while(blockNum !== 0) {
                 const blockPtr = this.getBlockPtr(blockNum);
                 for (let i = 0; i < BLOCK_DATA_SIZE; i += DIRENT_STRUCT_SIZE) {
                    const childIno = this.view.getUint32(blockPtr + i, true);
                    if (childIno === 0) continue;
                    const childName = this.readString(blockPtr + i + 8, 24);
                    const childTypeNum = this.view.getUint32(blockPtr + i + 4, true);
                    const childType = childTypeNum === INODE_TYPE_DIR ? 'directory' : 'file';
                    const childPath = absolutePath === '/' ? `/${childName}` : `${absolutePath}/${childName}`;
                    if(childName !== '.' && childName !== '..') {
                       const childNode: VFSNode = {ino: childIno, name: childName, type: childType, path: childPath};
                       if (childType === 'file' && childName.endsWith('.desktop')) {
                           try { childNode.content = this.readFileContentByInode(childIno); } catch {}
                       }
                       node.children.push(childNode);
                    }
                 }
                 blockNum = this.view.getUint32(blockPtr + BLOCK_DATA_SIZE, true);
            }
        } else {
             try { node.content = this.readFileContentByInode(inode.ino); } catch { node.content = "[Binary File]"; }
        }
        return node;
    }

    readFileBytesByInode = (ino: number): Uint8Array => {
        const inode = this.readInode(ino);
        if (!inode || inode.type !== 'file') return new Uint8Array(0);
        const buffer = new Uint8Array(inode.size);
        let bytesRead = 0;
        let currentBlockNum = inode.firstBlock;
        while(currentBlockNum !== 0 && bytesRead < inode.size) {
            const blockPtr = this.getBlockPtr(currentBlockNum);
            const bytesToRead = Math.min(BLOCK_DATA_SIZE, inode.size - bytesRead);
            const blockData = this.readBytes(blockPtr, bytesToRead);
            buffer.set(blockData, bytesRead);
            bytesRead += bytesToRead;
            currentBlockNum = this.view.getUint32(blockPtr + BLOCK_DATA_SIZE, true);
        }
        return buffer;
    }

    readFileContentByInode = (ino: number): string => decoder.decode(this.readFileBytesByInode(ino));

    updateFileContentByInode = (ino: number, content: string | Uint8Array, force: boolean = false) => {
        const inode = this.readInode(ino);
        if (!inode || inode.type !== 'file') return false;
        if (!force && (inode.mode & 0o000200) === 0) { throw new Error('Permission denied: File is read-only.'); }
        if (inode.firstBlock) {
            this.freeBlockChain(inode.firstBlock);
            this.writeInode(ino, { firstBlock: 0 });
        }
        const bytes = typeof content === 'string' ? encoder.encode(content) : content;
        let bytesWritten = 0;
        let currentBlockNum = 0;
        let firstBlockNum = 0;
        if (bytes.length > 0) {
            while (bytesWritten < bytes.length) {
                const newBlockNum = this.allocBlock();
                if (firstBlockNum === 0) firstBlockNum = newBlockNum;
                if (currentBlockNum !== 0) {
                    this.view.setUint32(this.getBlockPtr(currentBlockNum) + BLOCK_DATA_SIZE, newBlockNum, true);
                }
                const chunk = bytes.subarray(bytesWritten, bytesWritten + BLOCK_DATA_SIZE);
                this.writeBytes(chunk, this.getBlockPtr(newBlockNum));
                bytesWritten += chunk.length;
                currentBlockNum = newBlockNum;
            }
        }
        this.writeInode(ino, { size: bytes.length, mtime: Date.now(), firstBlock: firstBlockNum });
        this.persistSuperblock();
        return true;
    }
}

class NetworkDriver {
    async fetch(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.arrayBuffer();
    }
}

// --- KERNEL ---
class Kernel {
    public memory: ArrayBuffer | SharedArrayBuffer;
    private view: DataView;
    public apiKey: string;
    public memoryMap: {
        KERNEL_SPACE_START: number, KERNEL_SPACE_END: number,
        VFS_PARTITION_START: number, VFS_PARTITION_END: number,
        USER_SPACE_START: number, USER_SPACE_END: number,
    };
    private subscribers: Set<() => void> = new Set();
    
    // Managers
    public scheduler: Scheduler;
    public vfs: VFS;
    public memoryManager: MemoryManager;
    
    // Drivers
    private drivers: {
      network: NetworkDriver;
    };

    public settings: {
        theme: 'light' | 'dark',
        wallpaper: string,
        brightness: number,
        username: string,
        defaultEditor: string,
        apiKey: string,
    };
    public apps: Record<string, AppDefinition>;

    constructor(systemMemory: ArrayBuffer | SharedArrayBuffer) {
        this.memory = systemMemory;
        this.view = new DataView(this.memory);
        this.apiKey = 'REPLACE_WITH_YOUR_API_KEY';
        this.apps = {};
        this.settings = {
            theme: 'dark',
            wallpaper: `https://source.unsplash.com/random/1920x1080?nature,water`,
            brightness: 100,
            username: "winux",
            defaultEditor: '/usr/apps/TextEditor.wap',
            apiKey: this.apiKey,
        };

        const VFS_SIZE = 16 * 1024 * 1024;
        this.memoryMap = {
            KERNEL_SPACE_START: 0,
            KERNEL_SPACE_END: 1 * 1024 * 1024,
            VFS_PARTITION_START: 1 * 1024 * 1024,
            VFS_PARTITION_END: 1 * 1024 * 1024 + VFS_SIZE,
            USER_SPACE_START: 1 * 1024 * 1024 + VFS_SIZE,
            USER_SPACE_END: OS_MEMORY_BYTES,
        };
        
        // Initialize Managers and Drivers
        this.scheduler = new Scheduler(this);
        this.memoryManager = new MemoryManager(this.view, this.memoryMap.USER_SPACE_START, this.memoryMap.USER_SPACE_END);
        this.vfs = new VFS(this, this.memoryMap.VFS_PARTITION_START, this.memoryMap.VFS_PARTITION_END);
        this.drivers = {
            network: new NetworkDriver()
        };
    }

    getSystemMemoryBuffer = (): ArrayBuffer | SharedArrayBuffer => this.memory;
    subscribe = (callback: () => void) => { this.subscribers.add(callback); return () => this.unsubscribe(callback); };
    private unsubscribe = (callback: () => void) => { this.subscribers.delete(callback); };
    public notify = () => this.subscribers.forEach(cb => cb());

    async bootstrap() {
        await this.vfs.init();
        
        // Boot integrity check
        const core_files = [
            '/boot/vmlinuz-3.0.0-winux',
            '/boot/initrd-3.0.0-winux',
            '/sys/module/ui/core',
            '/sys/module/ui/components',
            '/sys/module/drivers/device',
            '/boot/grub/grub.cfg',
            '/etc/fstab',
        ];
        for (const file of core_files) {
            if (!this.vfs.pathToInodeNum(file)) {
                const message = `FATAL: Missing core component\nRequired file not found: ${file}`;
                this.triggerBSOD(message);
                throw new Error(`Fatal boot error: ${message}`);
            }
        }

        await this.loadApps();
    }
    
    async loadApps() {
        const appsDir = this.vfs.getVFSNodeByPath('/usr/apps');
        this.apps = {};
        if (appsDir && appsDir.children) {
            for (const appFile of appsDir.children) {
                if (appFile.path.endsWith('.wap')) {
                    try {
                        const data = this.vfs.readFileBytesByInode(appFile.ino);
                        const zip = await JSZip.loadAsync(data);
                        const manifestFile = zip.file('manifest.json');
                        if (manifestFile) {
                            const manifest = JSON.parse(await manifestFile.async('string'));
                            this.apps[appFile.path] = { id: appFile.path, name: manifest.name, icon: STATIC_ICONS[manifest.icon] || Icons.File };
                        }
                    } catch(e) {
                        console.error(`Failed to load WAP: ${appFile.path}`, e);
                    }
                }
            }
        }
    }

    getAppDefinition = (appId: string): AppDefinition | null => this.apps[appId] || null;
    
    triggerBSOD = (message: string) => {
        const bsodDiv = document.createElement('div');
        bsodDiv.className = 'bsod';
        bsodDiv.innerHTML = `<h1>:(</h1><p>Your PC ran into a problem and needs to restart. We're just collecting some error info.</p><div class="bsod-details">Stop code: ${message.replace(/\n/g, '<br/>')}</div>`;
        document.body.innerHTML = '';
        document.body.appendChild(bsodDiv);
        document.body.style.backgroundColor = '#0078d4';
    }

    // --- SYSCALL HANDLER ---
    async _syscall_handler(opcode: number, argsPtr: number, process: Process) {
        const payload = this.memoryManager.readPayload(argsPtr);
        const cwd = `/home/${this.settings.username}`;

        switch (opcode) {
            case SYSCALL_OPCODES.SYS_GET_ENV:
                return process.env[payload.key] ?? null;

            case SYSCALL_OPCODES.FS_READ_FILE:
                const readIno = this.vfs.pathToInodeNum(payload.path, cwd);
                if (!readIno) throw new Error(`File not found: ${payload.path}`);
                return this.vfs.readFileBytesByInode(readIno);

            case SYSCALL_OPCODES.FS_WRITE_FILE:
                const resolvedPath = this.vfs.resolvePath(payload.path, cwd);
                const parentPath = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';
                const filename = resolvedPath.split('/').pop();
                if(!filename) throw new Error('Invalid file path for writing');
                const parentIno = this.vfs.pathToInodeNum(parentPath);
                if(!parentIno) throw new Error(`Directory not found: ${parentPath}`);
                const existingFileIno = this.vfs.pathToInodeNum(resolvedPath);
                const content = Array.isArray(payload.data) ? new Uint8Array(payload.data) : payload.data;
                if (existingFileIno) {
                    this.vfs.updateFileContentByInode(existingFileIno, content);
                } else {
                    this.vfs.createFile(parentIno, filename, content);
                }
                this.notify();
                return true;

            case SYSCALL_OPCODES.FS_READ_DIR:
                const node = this.vfs.getVFSNodeByPath(payload.path, cwd);
                if (!node || node.type !== 'directory') throw new Error(`Directory not found or not a directory: ${payload.path}`);
                return node.children?.map(c => ({ name: c.name, type: c.type, path: c.path })) || [];

            case SYSCALL_OPCODES.SETTINGS_GET:
                return this.settings;

            case SYSCALL_OPCODES.SETTINGS_SET:
                if (payload.key in this.settings) {
                    (this.settings as any)[payload.key] = payload.value;
                    
                    if (payload.key === 'apiKey') {
                        this.apiKey = payload.value;
                    }

                    const settingsIno = this.vfs.pathToInodeNum('/etc/settings.json');
                    if (settingsIno) {
                        try { this.vfs.updateFileContentByInode(settingsIno, JSON.stringify(this.settings, null, 2)); }
                        catch (e) { console.error("Could not save settings:", e); }
                    }
                    if(payload.key === 'theme') {
                        document.body.className = payload.value === 'dark' ? 'dark-theme' : '';
                    }
                    this.notify();
                }
                return true;

            case SYSCALL_OPCODES.PROC_OPEN:
                return this.scheduler.openProcess(payload.appId, { filePath: payload.filePath });

            case SYSCALL_OPCODES.PROC_CLOSE:
                this.scheduler.closeProcess(process.id);
                return true;

            case SYSCALL_OPCODES.SYS_EXEC:
                if (payload.command === 'apt-get') {
                    const data = await this.drivers.network.fetch(payload.args[0]);
                    const filename = new URL(payload.args[0]).pathname.split('/').pop() || 'downloaded_file';
                    if (filename.endsWith('.wap')) {
                        await this.installWap(new Uint8Array(data), filename);
                        return `Successfully installed ${filename}.`;
                    } else {
                        const cwdIno = this.vfs.pathToInodeNum(cwd);
                        if (cwdIno) {
                            this.vfs.createFile(cwdIno, filename, new Uint8Array(data));
                            return `Downloaded and saved as ${filename} in ${cwd}`;
                        } else {
                            throw new Error(`Current directory ${cwd} not found.`);
                        }
                    }
                }
                throw new Error(`Unknown exec command: ${payload.command}`);
            
            case SYSCALL_OPCODES.SYS_EXEC_JS:
                const { code } = payload;
                const logs: string[] = [];
                const customConsole = {
                    log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
                    error: (...args: any[]) => logs.push(`ERROR: ${args.map(a => String(a)).join(' ')}`),
                    warn: (...args: any[]) => logs.push(`WARN: ${args.map(a => String(a)).join(' ')}`),
                };
                try {
                    const func = new Function('kernel', 'console', code);
                    const result = func.call(this, this, customConsole);
                    return { logs, result: result !== undefined ? String(result) : null, error: null };
                } catch (e) {
                    return { logs, result: null, error: (e as Error).message };
                }

            case SYSCALL_OPCODES.SYS_BSOD:
                 this.triggerBSOD(payload.message || 'WAP_INITIATED_CRASH');
                 return true;

            default:
                throw new Error(`Unknown kernel syscall opcode: ${opcode}`);
        }
    }

    async installWap(data: Uint8Array, filename: string) {
        const appsDirIno = this.vfs.pathToInodeNum('/usr/apps');
        if (!appsDirIno) { this.triggerBSOD('MISSING_SYSTEM_FOLDER: /usr/apps'); return; }
        const wapPath = `/usr/apps/${filename}`;
        const existingIno = this.vfs.pathToInodeNum(wapPath);
        if(existingIno) { this.vfs.updateFileContentByInode(existingIno, data); }
        else { this.vfs.createFile(appsDirIno, filename, data); }
        const zip = await JSZip.loadAsync(data);
        const manifestFile = zip.file('manifest.json');
        if (!manifestFile) { console.error('WAP install failed: manifest.json not found in', filename); return; }
        const manifest = JSON.parse(await manifestFile.async('string'));
        this.apps[wapPath] = { id: wapPath, name: manifest.name, icon: STATIC_ICONS[manifest.icon] || Icons.File, };
        const desktopDirIno = this.vfs.pathToInodeNum(`/home/${this.settings.username}/Desktop`);
        if (desktopDirIno) {
            const shortcutPath = `/home/${this.settings.username}/Desktop/${manifest.name}.desktop`;
            const shortcutContent = `[Desktop Entry]\nName=${manifest.name}\nExec=${wapPath}\nIcon=${manifest.icon}`;
            const existingShortcutIno = this.vfs.pathToInodeNum(shortcutPath);
            if(existingShortcutIno) { this.vfs.updateFileContentByInode(existingShortcutIno, shortcutContent); }
            else { this.vfs.createFile(desktopDirIno, `${manifest.name}.desktop`, shortcutContent); }
        }
        this.notify();
    }
}

// --- React Hooks & Context ---
const OSContext = React.createContext<{ kernel: Kernel | null; deviceDriver: DeviceDriver | null }>({ kernel: null, deviceDriver: null });

const useOS = () => {
    const context = React.useContext(OSContext);
    if (!context.kernel || !context.deviceDriver) throw new Error('useOS must be used within an OSProvider');
    
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => {
        const debouncedSave = () => {
             const timer = setTimeout(() => context.deviceDriver!.saveSystemMemory(context.kernel!.getSystemMemoryBuffer()), 500);
             return () => clearTimeout(timer);
        };
        const unsubscribe = context.kernel!.subscribe(() => {
            forceUpdate();
            debouncedSave();
        });
        return unsubscribe;
    }, [context.kernel, context.deviceDriver]);
    
    return context;
};

// --- Type Definitions ---
interface Process {
    id: number;
    appId: string;
    zIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
    isMinimized: boolean;
    isFocused: boolean;
    title?: string;
    filePath?: string;
    driverStatus?: 'enabled' | 'disabled' | 'not_required';
    env: Record<string, string>;
}
interface AppDefinition { id?: string; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; }
interface Inode { ino: number; type: 'file' | 'directory'; mode: number; nlink: number; size: number; mtime: number; firstBlock: number; }
interface VFSNode { path: string; name: string; type: 'file' | 'directory'; ino: number; content?: string; children?: VFSNode[]; }
interface WindowProps { process: Process; onClose: () => void; children: React.ReactNode; }


// --- Components ---

const Window = ({ process, children, onClose }: WindowProps) => {
    const { kernel } = useOS();
    const windowRef = React.useRef<HTMLDivElement>(null);
    const [isInteracting, setIsInteracting] = React.useState(false);
    const dragData = React.useRef({ isDragging: false, isResizing: false, x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });

    const onMouseDown = (e: React.MouseEvent) => {
        kernel.scheduler.focusProcess(process.id);
    };
    
    const onMinimize = () => kernel.scheduler.updateProcessState(process.id, { isMinimized: true });
    const onMaximize = () => kernel.scheduler.updateProcessState(process.id, { isMaximized: !process.isMaximized });

    const handleMouseMove = (e: MouseEvent) => {
        if (!windowRef.current) return;
        e.preventDefault();
        const dx = e.clientX - dragData.current.x;
        const dy = e.clientY - dragData.current.y;
        if (dragData.current.isDragging) {
            const newX = dragData.current.startX + dx;
            const newY = dragData.current.startY + dy;
            windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        } else if (dragData.current.isResizing) {
            const newWidth = Math.max(350, dragData.current.width + dx);
            const newHeight = Math.max(250, dragData.current.height + dy);
            windowRef.current.style.width = `${newWidth}px`;
            windowRef.current.style.height = `${newHeight}px`;
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (windowRef.current) {
            const dx = e.clientX - dragData.current.x;
            const dy = e.clientY - dragData.current.y;
            windowRef.current.style.transform = '';
            if (dragData.current.isDragging) {
                kernel.scheduler.updateProcessState(process.id, { x: dragData.current.startX + dx, y: dragData.current.startY + dy, isMaximized: false });
            } else if (dragData.current.isResizing) {
                const newWidth = Math.max(350, dragData.current.width + dx);
                const newHeight = Math.max(250, dragData.current.height + dy);
                windowRef.current.style.width = '';
                windowRef.current.style.height = '';
                kernel.scheduler.updateProcessState(process.id, { width: newWidth, height: newHeight });
            }
        }
        setIsInteracting(false);
    };
    
    const handleDragStart = (e: React.MouseEvent) => {
        if (process.isMaximized || e.button !== 0 || (e.target as HTMLElement).closest('.nodrag')) return;
        e.preventDefault();
        kernel.scheduler.focusProcess(process.id);
        setIsInteracting(true);
        dragData.current = { isDragging: true, isResizing: false, x: e.clientX, y: e.clientY, startX: process.x, startY: process.y, width: 0, height: 0 };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        if (process.isMaximized || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        kernel.scheduler.focusProcess(process.id);
        setIsInteracting(true);
        dragData.current = { isDragging: false, isResizing: true, x: e.clientX, y: e.clientY, width: process.width, height: process.height, startX: 0, startY: 0 };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    
    const appDef = kernel.getAppDefinition(process.appId);
    if (!appDef) {
         return null;
    }

    const windowStyle: React.CSSProperties = {
        top: isInteracting ? '0' : (process.isMaximized ? undefined : `${process.y}px`),
        left: isInteracting ? '0' : (process.isMaximized ? undefined : `${process.x}px`),
        transform: isInteracting ? `translate(${process.x}px, ${process.y}px)` : '',
        width: process.isMaximized ? undefined : `${process.width}px`,
        height: process.isMaximized ? undefined : `${process.height}px`,
        zIndex: process.zIndex,
        display: process.isMinimized ? 'none' : 'flex',
    };
    
    const windowClassName = `window ${process.isMaximized ? 'maximized' : ''} ${isInteracting ? 'no-transition' : ''} ${process.isFocused ? 'focused' : ''}`;
    
    return e('div', { ref: windowRef, className: windowClassName, style: windowStyle, onMouseDown },
        e('div', { className: 'title-bar', onMouseDown: handleDragStart, onDoubleClick: onMaximize },
            e(appDef.icon, { className: 'icon' }),
            e('span', { className: 'title' }, process.title || appDef.name),
            e('div', { className: 'window-controls nodrag' },
                e('button', { className: 'window-control minimize', onClick: onMinimize, 'aria-label': 'Minimize' }, e(Icons.Minimize)),
                e('button', { className: 'window-control maximize', onClick: onMaximize, 'aria-label': process.isMaximized ? 'Restore' : 'Maximize' }, process.isMaximized ? e(Icons.Restore) : e(Icons.Maximize)),
                e('button', { className: 'window-control close', onClick: onClose, 'aria-label': 'Close' }, e(Icons.Close))
            )
        ),
        e('div', { className: 'window-content' }, children),
        e('div', { className: `resize-handle ${process.isMaximized ? 'hidden' : ''}`, onMouseDown: handleResizeStart })
    );
};

const WapRunner: React.FC<{ process: Process }> = ({ process: osProcess }) => {
    const { kernel } = useOS();
    const [htmlContent, setHtmlContent] = React.useState('<body>Loading app...</body>');
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { theme } = kernel.settings;

    React.useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow || event.data?.type !== '__kernel_api_call__') {
                return;
            }
            const { id, opcode, payload } = event.data;
            const argsPtr = kernel.memoryManager.alloc(payload);
            try {
                const result = await kernel._syscall_handler(opcode, argsPtr, osProcess);
                let transferableResult: any = result;
                if (result instanceof Uint8Array) {
                    transferableResult = { type: 'Buffer', data: Array.from(result) };
                }
                iframeRef.current?.contentWindow?.postMessage({ id, result: transferableResult }, '*');
            } catch (err) {
                const error = err instanceof Error ? err.message : String(err);
                iframeRef.current?.contentWindow?.postMessage({ id, error }, '*');
            } finally {
                kernel.memoryManager.free(argsPtr);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [kernel, osProcess]);
    
    React.useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: '__theme_change__', theme }, '*');
        }
    }, [theme]);

    React.useEffect(() => {
        const loadApp = async () => {
            if (!osProcess.appId) {
                setHtmlContent('<body>Error: No file path specified.</body>');
                return;
            }
            try {
                const cssText = await fetch('/index.css').then(res => res.ok ? res.text() : '');
                const styleTag = `<style>${cssText}</style>`;
                const ino = kernel.vfs.pathToInodeNum(osProcess.appId);
                if (!ino) throw new Error('File not found in VFS.');
                
                const fileBytes = kernel.vfs.readFileBytesByInode(ino);
                const zip = await JSZip.loadAsync(fileBytes);
                const indexFile = zip.file('index.html');
                
                if (!indexFile) throw new Error('index.html not found in package.');
                let content = await indexFile.async('string');
                
                if (osProcess.driverStatus === 'enabled') {
                    const driverIno = kernel.vfs.pathToInodeNum('/lib/drivers/babylon.drv');
                    if (driverIno) {
                        const driverCode = kernel.vfs.readFileContentByInode(driverIno);
                        content = content.replace(/<body([^>]*)>/, `<body$1><script>${driverCode}</script>`);
                    }
                }
                content = content.replace('</head>', `${styleTag}</head>`);
                setHtmlContent(content);
            } catch (err) {
                console.error("Error loading WAP:", err);
                setHtmlContent(`<body>Error loading application: ${(err as Error).message}</body>`);
            }
        };
        loadApp();
    }, [osProcess.appId, osProcess.driverStatus, kernel]);
    
    React.useEffect(() => {
        if(iframeRef.current) {
            iframeRef.current.onload = () => {
                iframeRef.current?.contentWindow?.postMessage({ type: '__init__', args: { filePath: osProcess.filePath } }, '*');
            };
        }
    }, [htmlContent, osProcess.filePath]);

    return e('div', { className: 'wap-runner-container' },
        osProcess.driverStatus === 'disabled' && e('div', { className: 'driver-warning', title: 'High-performance driver not found. Run "apt-get install babylon.drv" in the terminal.' },
            e(Icons.Biohazard, { className: 'driver-warning-icon' })
        ),
        e('iframe', {
            ref: iframeRef,
            className: 'wap-runner-iframe',
            srcDoc: htmlContent,
            sandbox: 'allow-scripts allow-same-origin allow-forms'
        })
    );
};

const DesktopIcon = ({ item, onDoubleClick }: { item: VFSNode, onDoubleClick: (item: VFSNode) => void }) => {
    if (!item) return null;
    let displayName = item.name;
    let iconId = item.type === 'directory' ? 'Folder' : 'File';
    if (item.name.endsWith('.desktop')) {
        const nameMatch = item.content?.match(/Name=(.*)/);
        displayName = nameMatch ? nameMatch[1].trim() : item.name.replace(/\.desktop$/, '');
        const iconMatch = item.content?.match(/Icon=(.*)/);
        if (iconMatch) iconId = iconMatch[1].trim();
    } else if (item.name.endsWith('.wap')) {
        displayName = displayName.replace('.wap', '');
    }
    const IconComponent = STATIC_ICONS[iconId] || Icons.DesktopFile;
    return e('div', { className: 'desktop-icon', onDoubleClick: () => onDoubleClick(item) },
        e(IconComponent, {}), e('span', null, displayName)
    );
};

const Taskbar = ({ onAppClick, onStartClick, onControlCenterClick }: {onAppClick: (appId: string) => void, onStartClick: (e: React.MouseEvent) => void, onControlCenterClick: (e: React.MouseEvent) => void}) => {
    const { kernel } = useOS();
    const processIds = kernel.scheduler.getProcessIds();
    const processes = processIds.map(pid => kernel.scheduler.getProcessInfo(pid)).filter(Boolean) as Process[];
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const runningApps = React.useMemo(() => {
        const uniqueAppIds = [...new Set(processes.map(p => p.appId))];
        return uniqueAppIds.map(appId => {
            let appDef = kernel.getAppDefinition(appId);
            return { appId, appDef, isActive: processes.some(p => p.appId === appId && p.isFocused) }
        }).filter((item): item is { appId: string; appDef: AppDefinition; isActive: boolean; } => !!item.appDef);
    }, [processes, kernel]);

    return e('div', { className: 'taskbar' },
        e('button', { className: 'taskbar-item', onClick: onStartClick, "aria-label": "Start Menu" }, e(Icons.Start)),
        runningApps.map(({ appId, appDef, isActive }) =>
            e('button', { key: appId, className: `taskbar-item running ${isActive ? 'active' : ''}`, onClick: () => onAppClick(appId), "aria-label": appDef.name, }, e(appDef.icon))
        ),
        e('div', { className: 'system-tray' },
            e('div', { className: 'system-tray-time' }, time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
            e('button', { className: 'taskbar-item', onClick: onControlCenterClick, "aria-label": "Control Center" }, e(Icons.Wifi))
        )
    );
};

const StartMenu = ({ onAppClick, isVisible }: {onAppClick: (appId: string) => void, isVisible: boolean}) => {
    const { kernel } = useOS();
    const desktopNode = kernel.vfs.getVFSNodeByPath(`/home/${kernel.settings.username}/Desktop`);
    const desktopApps = desktopNode?.children?.filter(c => c.name.endsWith('.desktop')).map(c => {
         const nameMatch = c.content?.match(/Name=(.*)/);
         const iconMatch = c.content?.match(/Icon=(.*)/);
         return { id: c.path, name: nameMatch ? nameMatch[1].trim() : c.name.replace(/\.desktop$/, ''), icon: STATIC_ICONS[iconMatch?.[1].trim() as string] || Icons.DesktopFile, }
    }) || [];
    const uniqueApps = desktopApps.filter((app, index, self) => index === self.findIndex((t) => t.name === app.name));
    if (!isVisible) return null;
    return e('div', { className: 'start-menu-container from-center' },
        e('div', { className: 'start-menu' },
            e('h3', null, 'All Apps'),
            e('div', { className: 'app-grid' },
                uniqueApps.sort((a,b) => a.name.localeCompare(b.name)).map(app => e('div', { key: app.id, className: 'app-item', onClick: () => onAppClick(app.id) }, e(app.icon), e('span', null, app.name)))
            )
        )
    );
};

const ControlCenter = ({ isVisible, onSignOut }: {isVisible: boolean, onSignOut: () => void}) => {
    const { kernel } = useOS();
    const [volume, setVolume] = React.useState(75);
    if (!isVisible) return null;

    const handleThemeChange = (theme: 'light' | 'dark') => {
        kernel._syscall_handler(SYSCALL_OPCODES.SETTINGS_SET, kernel.memoryManager.alloc({ key: 'theme', value: theme }), {} as Process);
    };

    const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        kernel._syscall_handler(SYSCALL_OPCODES.SETTINGS_SET, kernel.memoryManager.alloc({ key: 'brightness', value: parseInt(e.target.value, 10) }), {} as Process);
    };

    return e('div', { className: 'control-center-container' },
        e('div', { className: 'control-center' },
            e('div', { className: 'control-section' },
                e('div', { className: 'control-slider-group' }, e(Icons.Brightness, {}), e('input', { type: 'range', min: '15', max: '100', value: kernel.settings.brightness, onChange: handleBrightnessChange, className: 'control-slider' })),
                e('div', { className: 'control-slider-group' }, e(Icons.Volume, {}), e('input', { type: 'range', min: '0', max: '100', value: volume, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseInt(e.target.value, 10)), className: 'control-slider' }))
            ),
            e('div', { className: 'control-section-divider' }),
            e('div', { className: 'control-section' }, e('div', { className: 'control-button-group' }, e('button', { className: `control-button ${kernel.settings.theme === 'light' ? 'active' : ''}`, onClick: () => handleThemeChange('light') }, e(Icons.Theme, {}), 'Light'), e('button', { className: `control-button ${kernel.settings.theme === 'dark' ? 'active' : ''}`, onClick: () => handleThemeChange('dark') }, e(Icons.Theme, {}), 'Dark'))),
            e('div', { className: 'control-section-divider' }),
            e('div', { className: 'control-user-section' },
                e('div', { className: 'control-user-info' }, e(Icons.User, { className: 'control-user-avatar' }), e('span', { className: 'control-user-name' }, kernel.settings.username)),
                e('button', { className: 'control-signout-btn', onClick: onSignOut, title: 'Sign Out' }, e(Icons.SignOut, {}))
            )
        )
    );
};

const ContextMenu = ({ menu, onSelect }: {menu: any, onSelect: (action: any) => void}) => {
    if (!menu) return null;
    return e('div', { className: 'context-menu', style: { top: menu.y, left: menu.x } },
        menu.items.map((item: any, index: number) => e('div', { key: index, className: `context-menu-item ${item.disabled ? 'disabled' : ''}`, onClick: () => !item.disabled && onSelect(item.action) }, item.label))
    );
};

const WinuxOS: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
    const { kernel } = useOS();
    const processIds = kernel.scheduler.getProcessIds();
    const processes = processIds.map(id => kernel.scheduler.getProcessInfo(id)).filter(Boolean) as Process[];
    const { settings } = kernel;
    const desktopNode = kernel.vfs.getVFSNodeByPath(`/home/${settings.username}/Desktop`);

    const [startMenuVisible, setStartMenuVisible] = React.useState(false);
    const [controlCenterVisible, setControlCenterVisible] = React.useState(false);
    const [contextMenu, setContextMenu] = React.useState<any>(null);

    const handleAppClick = async (appId: string) => {
        const runningProcesses = processes.filter(p => p.appId === appId || (p.appId.endsWith('.wap') && p.title?.includes(appId)));
        if (runningProcesses.length > 0) {
            kernel.scheduler.focusProcess(runningProcesses[0].id);
        } else {
            await kernel.scheduler.openProcess(appId);
        }
        closePopups();
    };

    const handleDesktopItemDoubleClick = async (item: VFSNode) => {
        await kernel.scheduler.openProcess(item.path, { filePath: item.path });
    };

    const closePopups = () => {
        setStartMenuVisible(false);
        setControlCenterVisible(false);
        setContextMenu(null);
    }
    
    const handleTaskbarAppClick = async (appId: string) => {
        const appProcesses = processes.filter(p => p.appId === appId);
        if (appProcesses.length === 0) { await kernel.scheduler.openProcess(appId); return; }
        const focusedAppProcess = appProcesses.find(p => p.isFocused);
        if (focusedAppProcess) {
             kernel.scheduler.updateProcessState(focusedAppProcess.id, { isMinimized: true });
        } else {
            const topProcess = appProcesses.sort((a,b) => b.zIndex - a.zIndex)[0];
            kernel.scheduler.focusProcess(topProcess.id);
        }
    };
    
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        closePopups();
        setContextMenu({
            x: e.clientX, y: e.clientY,
            items: [
                { label: 'New Folder', action: 'NEW_FOLDER', disabled: true },
                { label: 'Change Wallpaper', action: () => kernel.scheduler.openProcess('/usr/apps/Settings.wap') },
                { label: 'Trigger Meltdown', action: () => kernel.scheduler.openProcess('/usr/apps/KernelMeltdown.wap') },
            ]
        });
    };
    
    const handleContextMenuSelect = (action: any) => {
        if (typeof action === 'function') action();
        setContextMenu(null);
    }
    
    const brightnessOpacity = Math.min(0.85, (100 - settings.brightness) / 100);

    return e('div', { className: 'desktop', onClick: closePopups, onContextMenu: handleContextMenu },
        e('img', { className: 'wallpaper', src: settings.wallpaper, alt: '' }),
        e('div', {className: 'brightness-overlay', style: {opacity: brightnessOpacity}}),
        e('div', { className: 'desktop-icons-container' },
            desktopNode?.children?.map(item => e(DesktopIcon, { key: item.path, item: item, onDoubleClick: handleDesktopItemDoubleClick }))
        ),
        e('div', { className: 'desktop-area' },
            processes.map(p => e(Window, { key: p.id, process: p, onClose: () => kernel.scheduler.closeProcess(p.id), children: e(WapRunner, { process: p }) }))
        ),
        e(Taskbar, { onAppClick: handleTaskbarAppClick, onStartClick: (e) => { e.stopPropagation(); setStartMenuVisible(!startMenuVisible); setControlCenterVisible(false); }, onControlCenterClick: (e) => { e.stopPropagation(); setControlCenterVisible(!controlCenterVisible); setStartMenuVisible(false); }}),
        e(StartMenu, { onAppClick: handleAppClick, isVisible: startMenuVisible }),
        e(ControlCenter, { isVisible: controlCenterVisible, onSignOut }),
        e(ContextMenu, { menu: contextMenu, onSelect: handleContextMenuSelect })
    );
};

const LoadingScreen: React.FC<{ messages: string[] }> = ({ messages }) => {
    return e('div', { className: 'boot-screen' }, e(Icons.WinuxLogo), e('div', { className: 'loading-text-container'}, messages.map((msg, i) => e('p', {key: i, className: 'loading-text'}, msg))));
};

const LoginScreen = ({ onLogin, wallpaper, username }: {onLogin: () => void, wallpaper: string, username: string}) => {
    return e('div', { className: 'login-screen', style: { backgroundImage: `url(${wallpaper})` } },
        e('div', { className: 'login-overlay' }),
        e('div', { className: 'login-box' },
            e('div', { className: 'login-avatar' }, e(Icons.User, {})),
            e('div', { className: 'login-user' }, username),
            e('button', { className: 'login-button', onClick: () => onLogin()}, 'Sign In')
        )
    );
};

const GrubScreen: React.FC<{ onBoot: () => void, grubConfig: {timeout: number, entries: string[]} }> = ({ onBoot, grubConfig }) => {
    const [countdown, setCountdown] = React.useState(grubConfig.timeout || 5);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onBoot();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                clearInterval(timer);
                onBoot();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            clearInterval(timer);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onBoot]);

    return e('div', { className: 'grub-screen' },
        e('div', { className: 'grub-box' },
            e('p', null, 'GNU GRUB version 2.04'),
            e('div', { className: 'grub-menu' },
                grubConfig.entries.map((entry, index) => e('div', { key: index, className: 'grub-menu-item active' }, entry))
            ),
            e('p', null, 'Use the ↑ and ↓ keys to select which entry is highlighted.'),
            e('p', null, `Booting in ${countdown} seconds... Press ENTER to boot immediately.`)
        )
    );
};

const App = () => {
    const [bootState, setBootState] = React.useState<'bios' | 'grub' | 'loading' | 'login' | 'desktop'>('bios');
    const [os, setOS] = React.useState<{ kernel: Kernel | null; deviceDriver: DeviceDriver | null }>({ kernel: null, deviceDriver: null });
    const [loadingMessages, setLoadingMessages] = React.useState<string[]>(['[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x0000000001800000] usable']);
    const [grubConfig, setGrubConfig] = React.useState<{timeout: number, entries: string[]}>({ timeout: 5, entries: [] });
    
    React.useEffect(() => {
        if (bootState === 'bios') {
            const timer = setTimeout(() => {
                setLoadingMessages(prev => [...prev, '[    0.000101] BIOS-provided physical RAM map:']);
                 setTimeout(() => {
                    // Pre-kernel bootloader step: parse GRUB config
                    const timeoutMatch = OS_SOURCE_CODE.GRUB_CFG.match(/set timeout=(\d+)/);
                    const entries: string[] = [];
                    const entryRegex = /menuentry "([^"]+)"/g;
                    let match;
                    while ((match = entryRegex.exec(OS_SOURCE_CODE.GRUB_CFG)) !== null) {
                        entries.push(match[1]);
                    }
                    setGrubConfig({
                        timeout: timeoutMatch ? parseInt(timeoutMatch[1], 10) : 5,
                        entries: entries.length > 0 ? entries : ['Winux OS 3.0.0 (Kernel 3.0.0-winux)'],
                    });
                    setBootState('grub');
                }, 1500);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [bootState]);

    const handleBoot = React.useCallback(() => {
        setBootState('loading');
        
        const initOS = async () => {
            let messages: string[] = [];
            const addMessage = (msg: string, delay: number = 50) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        messages = [...messages, msg];
                        setLoadingMessages([...messages]);
                        resolve(true);
                    }, delay);
                });
            };

            try {
                await addMessage(`[    0.151321] GRUB: Loading config from /boot/grub/grub.cfg... Done.`);
                await addMessage(`[    0.158482] GRUB: Loading kernel /boot/vmlinuz-3.0.0-winux...`);
                await addMessage(`[    0.162215] GRUB: Loading initial ramdisk /boot/initrd-3.0.0-winux...`, 200);
                await addMessage('[    0.210000] Uncompressing Winux... done, booting the kernel.', 300);

                const deviceDriver = new DeviceDriver();
                await addMessage('[    0.342199] virtio_mmio: Probing for system memory...', 100);
                await deviceDriver.init();
                
                let systemMemory = await deviceDriver.getSystemMemory();
                if (!systemMemory) {
                    await addMessage('[    0.413371] No persistent memory found. Allocating new RAM disk.', 100);
                    systemMemory = deviceDriver.createInitialMemory();
                    await deviceDriver.saveSystemMemory(systemMemory);
                } else {
                    await addMessage('[    0.413371] Persistent memory found and loaded.', 100);
                }

                if (!systemMemory) {
                     throw new Error("Failed to create or load system memory.");
                }

                await addMessage('[    0.501112] Kernel: Initializing...', 150);
                const kernel = new Kernel(systemMemory);
                
                await addMessage('[    0.623456] VFS: Mounting root (vfs filesystem) on /dev/ram0...', 100);
                await kernel.bootstrap();
                setOS({ kernel, deviceDriver });
                
                await addMessage('[    0.783456] systemd[1]: Winux OS starting up...');
                await addMessage('[    0.852199] systemd[1]: Initializing drivers...');
                await addMessage('[    0.891234] systemd[1]: Starting Login Manager...', 200);
                document.body.className = kernel.settings.theme === 'dark' ? 'dark-theme' : '';
                
                setTimeout(() => setBootState('login'), 1000);

            } catch (error) {
                console.error("Boot failed:", error);
                const bsod = document.createElement('div');
                bsod.className = 'bsod';
                bsod.innerHTML = `<h1>:(</h1><p>A fatal error occurred during boot.</p><div class="bsod-details">Stop code: KERNEL_INIT_FAILURE<br/>Details: ${(error as Error).message}</div>`;
                document.body.innerHTML = '';
                document.body.appendChild(bsod);
                document.body.style.backgroundColor = '#0078d4';
            }
        };

        initOS();
    }, []);
    
    if (bootState === 'bios' || bootState === 'loading' || !os.kernel && bootState !== 'grub') {
        return e(LoadingScreen, { messages: loadingMessages });
    }
    
    if (bootState === 'grub') {
        return e(GrubScreen, { onBoot: handleBoot, grubConfig });
    }

    return e(OSContext.Provider, { value: { kernel: os.kernel, deviceDriver: os.deviceDriver } },
        bootState === 'login' ? e(LoginScreen, { onLogin: () => setBootState('desktop'), wallpaper: os.kernel.settings.wallpaper, username: os.kernel.settings.username }) :
        e(WinuxOS, { onSignOut: () => setBootState('login') })
    );
};

const WAP_COMMON_HTML_HEAD = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="importmap">
    { "imports": { "react": "https://esm.sh/react@18.2.0", "react-dom/client": "https://esm.sh/react-dom@18.2.0/client", "@google/genai": "https://esm.sh/@google/genai", "marked": "https://esm.sh/marked@12.0.2", "jszip": "https://esm.sh/jszip@3.10.1" } }
    </script>
`;

const WAP_DRIVER_AND_INIT_SCRIPT = `
    <script>
        const SYSCALL_OPCODES = {
            SYS_GET_ENV: 0x003, SYS_BSOD: 0x004, SYS_EXEC: 0x005, SYS_EXEC_JS: 0x006,
            PROC_OPEN: 0x100, PROC_CLOSE: 0x101,
            FS_READ_FILE: 0x200, FS_WRITE_FILE: 0x201, FS_READ_DIR: 0x202,
            SETTINGS_GET: 0x300, SETTINGS_SET: 0x301,
        };

        const pending_requests = new Map();
        let request_id_counter = 0;

        window.addEventListener('message', (event) => {
            const { id, result, error, type, theme, args } = event.data;

            if (pending_requests.has(id)) {
                const { resolve, reject } = pending_requests.get(id);
                if (error) {
                    reject(new Error(error));
                } else {
                    if (result && typeof result === 'object' && result.type === 'Buffer' && Array.isArray(result.data)) {
                        resolve(new Uint8Array(result.data));
                    } else {
                        resolve(result);
                    }
                }
                pending_requests.delete(id);
            } else if (type === '__init__') {
                window.WINUX_ARGS = args;
                document.dispatchEvent(new Event('winuxready'));
            } else if (type === '__theme_change__') {
                document.body.className = theme === 'dark' ? 'dark-theme' : '';
            }
        });

        function __kernel_api_call__(opcode, payload) {
            return new Promise((resolve, reject) => {
                const id = request_id_counter++;
                pending_requests.set(id, { resolve, reject });
                window.parent.postMessage({ type: '__kernel_api_call__', id, opcode, payload }, '*');
            });
        }
        
        window.WinuxDriver = {
            fs: {
                readFile: (path) => __kernel_api_call__(SYSCALL_OPCODES.FS_READ_FILE, { path }),
                writeFile: (path, data) => {
                    let payloadData = (data instanceof Uint8Array || data instanceof ArrayBuffer) ? Array.from(new Uint8Array(data)) : data;
                    return __kernel_api_call__(SYSCALL_OPCODES.FS_WRITE_FILE, { path, data: payloadData });
                },
                readDir: (path) => __kernel_api_call__(SYSCALL_OPCODES.FS_READ_DIR, { path }),
            },
            settings: {
                get: () => __kernel_api_call__(SYSCALL_OPCODES.SETTINGS_GET, {}),
                set: (key, value) => __kernel_api_call__(SYSCALL_OPCODES.SETTINGS_SET, { key, value }),
            },
            proc: {
                open: (appId, options) => __kernel_api_call__(SYSCALL_OPCODES.PROC_OPEN, { appId, ...options }),
                close: () => __kernel_api_call__(SYSCALL_OPCODES.PROC_CLOSE),
            },
            sys: {
                 exec: (command, args) => __kernel_api_call__(SYSCALL_OPCODES.SYS_EXEC, { command, args }),
                 execjs: (payload) => __kernel_api_call__(SYSCALL_OPCODES.SYS_EXEC_JS, payload),
                 bsod: (message) => __kernel_api_call__(SYSCALL_OPCODES.SYS_BSOD, { message }),
                 getEnv: (key) => __kernel_api_call__(SYSCALL_OPCODES.SYS_GET_ENV, { key }),
                 resolvePath: (path, cwd) => {
                    if (typeof path !== 'string' || path === '') return cwd || '/';
                    let absolutePath = path.startsWith('/') ? path : (cwd === '/' ? '' : cwd) + '/' + path;
                    const parts = absolutePath.split('/').filter(p => p);
                    const finalParts = [];
                    for(const part of parts) {
                        if (part === '..') finalParts.pop();
                        else if (part !== '.') finalParts.push(part);
                    }
                    return ('/' + finalParts.join('/')).replace('//', '/');
                }
            }
        };
    </script>
`;


// --- WAP Application Sources ---
const WAP_SOURCES = {
    FileExplorer: {
        manifest: `{ "name": "File Explorer", "icon": "FileExplorer" }`,
        html: `
<!DOCTYPE html><html><head>${WAP_COMMON_HTML_HEAD}</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
const e = React.createElement;

const ICONS = {
    Up: (props) => e('svg', { ...props, viewBox: '0 0 24 24'}, e('path', { d: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' })),
    Folder: (props) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" }, e('path', { d: "M21.41 6.64a1 1 0 0 0-.6-.23H10.5l-1.9-2.28a1 1 0 0 0-.8-.39H4.2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16.8a1 1 0 0 0 1-1V7.64a1 1 0 0 0-.59-1Z", fill: "#60A5FA" })),
    File: (props) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" }, e('path', { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z", fill: "#E5E7EB" }), e('path', { d: "M14 2v6h6l-6-6Z", fill: "#9CA3AF" })),
    DesktopFile: (props) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" }, e('path', { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z", fill: "#E5E7EB" }), e('path', { d: "M14 2v6h6l-6-6Z", fill: "#9CA3AF" }), e('path', { d: "M9 14h6v2H9v-2Zm0 4h6v2H9v-2Z", fill: "#6B7280" })),
};

const FileExplorer = () => {
    const [settings, setSettings] = useState({});
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        const onReady = async () => {
            try {
                const s = await window.WinuxDriver.settings.get();
                if (s) {
                    setSettings(s);
                    const startPath = window.WINUX_ARGS.filePath || \`/home/\${s.username}/Documents\`;
                    document.body.className = s.theme === 'dark' ? 'dark-theme' : '';
                    navigate(startPath);
                }
            } catch (err) {
                console.error("File Explorer failed to init:", err);
            }
        };
        document.addEventListener('winuxready', onReady);
        return () => document.removeEventListener('winuxready', onReady);
    }, []);

    const navigate = async (path) => {
        try {
            const contents = await window.WinuxDriver.fs.readDir(path);
            setCurrentPath(path);
            setItems(contents.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
        } catch(e) { console.error(e); }
    };
    
    const openItem = async (item) => {
        if (item.type === 'directory') {
            navigate(item.path);
        } else {
            window.WinuxDriver.proc.open(item.path, { filePath: item.path });
        }
    };

    const goUp = () => {
        if (currentPath === '/') return;
        const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
        navigate(parentPath);
    };

    return e('div', { className: 'file-manager' },
        e('div', { className: 'fm-toolbar' },
            e('button', { onClick: goUp, disabled: currentPath === '/' }, e(ICONS.Up)),
            e('input', { className: 'fm-path', value: currentPath, readOnly: true })
        ),
        e('div', { className: 'fm-view' },
            items.map(item =>
                e('div', {
                    key: item.path, className: 'fm-item',
                    onDoubleClick: async () => await openItem(item)
                }, e(item.type === 'directory' ? ICONS.Folder : (item.name.endsWith('.desktop') ? ICONS.DesktopFile : ICONS.File)), e('span', null, item.name))
            )
        )
    );
};
ReactDOM.createRoot(document.getElementById('root')).render(e(FileExplorer));
</script></body></html>`
    },
    TextEditor: {
        manifest: `{ "name": "Text Editor", "icon": "TextEditor" }`,
        html: `
<!DOCTYPE html><html><head>${WAP_COMMON_HTML_HEAD}</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
const e = React.createElement;

const TextEditor = () => {
    const [content, setContent] = useState('');
    const [filePath, setFilePath] = useState(null);
    const [fileName, setFileName] = useState('Unsaved File');
    
    useEffect(() => {
        const onReady = async () => {
            try {
                const s = await window.WinuxDriver.settings.get();
                if (s) {
                    document.body.className = s.theme === 'dark' ? 'dark-theme' : '';
                }
                
                const path = window.WINUX_ARGS.filePath;
                if(path) {
                    setFilePath(path);
                    setFileName(path.split('/').pop());
                    try {
                        const fileContent = await window.WinuxDriver.fs.readFile(path);
                        const textContent = new TextDecoder().decode(fileContent);
                        setContent(textContent);
                    } catch (e) {
                        setContent('Error: Could not load file. ' + e.message);
                    }
                }
            } catch (err) {
                 console.error("Text Editor failed to init:", err);
            }
        };
        document.addEventListener('winuxready', onReady);
        return () => document.removeEventListener('winuxready', onReady);
    }, []);

    const handleSave = () => {
        if(filePath) {
            window.WinuxDriver.fs.writeFile(filePath, content).catch(e => alert(e.message));
        }
    };

    return e('div', { className: 'text-editor-container' },
      e('div', {className: 'text-editor-toolbar'},
        e('span', null, \`Editing: \${fileName}\`),
        e('button', {onClick: handleSave, disabled: !filePath}, 'Save')
      ),
      e('textarea', { className: 'text-editor-area', value: content, onChange: (e) => setContent(e.target.value) })
    );
};
ReactDOM.createRoot(document.getElementById('root')).render(e(TextEditor));
</script></body></html>`
    },
    Terminal: {
        manifest: `{ "name": "Terminal", "icon": "Terminal" }`,
        html: `
<!DOCTYPE html><html><head>${WAP_COMMON_HTML_HEAD}</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
const e = React.createElement;

const Terminal = () => {
    const [settings, setSettings] = useState({ username: 'user' });
    const [cwd, setCwd] = useState('');
    const [output, setOutput] = useState([{ type: 'output', text: 'Winux [Version 3.0.0-linux]' }]);
    const [input, setInput] = useState('');
    const terminalEndRef = useRef(null);

    useEffect(() => {
        const onReady = async () => {
            try {
                const s = await window.WinuxDriver.settings.get();
                if (s) {
                    setSettings(s);
                    setCwd(\`/home/\${s.username}\`);
                    document.body.className = s.theme === 'dark' ? 'dark-theme' : '';
                }
            } catch (err) {
                console.error("Terminal failed to init:", err);
            }
        };
        document.addEventListener('winuxready', onReady);
        return () => document.removeEventListener('winuxready', onReady);
    }, []);

    useEffect(() => terminalEndRef.current?.scrollIntoView({ behavior: "smooth" }), [output]);
    const print = (text) => setOutput(prev => [...prev, { type: 'output', text: String(text) }]);

    const resolvePath = (path) => {
        return window.WinuxDriver.sys.resolvePath(path, cwd);
    };

    const handleCommand = async (cmd) => {
        const parts = cmd.trim().split(' ').filter(p => p);
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case 'help': print('Commands: help, ls, cat, cd, apt-get, clear, whoami, pwd, jsint'); break;
            case 'pwd': print(cwd); break;
            case 'whoami': print(settings.username); break;
            case 'clear': setOutput([]); return;
            case 'cd':
                if (!args[0]) { setCwd(\`/home/\${settings.username}\`); break; }
                const newPath = resolvePath(args[0]);
                try {
                    await window.WinuxDriver.fs.readDir(newPath); // Check if it's a dir
                    setCwd(newPath);
                } catch {
                    print(\`cd: no such file or directory: \${args[0]}\`);
                }
                break;
            case 'ls':
                const path = args[0] ? resolvePath(args[0]) : cwd;
                try {
                    const children = await window.WinuxDriver.fs.readDir(path);
                    if (children.length > 0) print(children.map(c => c.name).join('  '));
                } catch {
                    print(\`ls: cannot access '\${path}': No such file or directory\`);
                }
                break;
            case 'cat':
                if (!args[0]) { print('cat: missing operand'); break; }
                const filePath = resolvePath(args[0]);
                try {
                    const content = await window.WinuxDriver.fs.readFile(filePath);
                    print(new TextDecoder().decode(content));
                } catch {
                     print(\`cat: \${args[0]}: No such file or directory or is a directory\`);
                }
                break;
            case 'apt-get':
                try {
                    print(\`Executing: \${command}...\`);
                    const result = await window.WinuxDriver.sys.exec(command, args);
                    print(result);
                } catch(e) { print(\`Error: \${e.message}\`); }
                break;
            case 'jsint':
                if (!args[0]) { print('jsint: missing file operand'); break; }
                const scriptPath = resolvePath(args[0]);
                 try {
                    const scriptContentBytes = await window.WinuxDriver.fs.readFile(scriptPath);
                    const scriptContent = new TextDecoder().decode(scriptContentBytes);
                    print(\`Running \${scriptPath}...\`);
                    const result = await window.WinuxDriver.sys.execjs({ code: scriptContent });
                    result.logs.forEach(log => print(log));
                    if(result.error) print(\`Error: \${result.error}\`);
                } catch {
                     print(\`jsint: \${args[0]}: No such file or directory\`);
                }
                break;
            default: if (command) print(\`\${command}: command not found\`);
        }
    };
    
    const getPrompt = () => {
        const homeDir = \`/home/\${settings.username}\`;
        let displayPath = cwd.startsWith(homeDir) ? '~' + cwd.substring(homeDir.length) : cwd;
        if (displayPath === '') displayPath = '/';
        return \`\${settings.username}@winuxos:\${displayPath}$ \`;
    }

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentInput = input.trim();
            setOutput(prev => [...prev, { type: 'input', text: \`\${getPrompt()}\${currentInput}\` }]);
            setInput('');
            if (currentInput) await handleCommand(currentInput);
        }
    };
    
    return e('div', { className: 'terminal', onClick: () => document.querySelector('.terminal-input')?.focus() },
        e('div', { className: 'terminal-output' }, output.map((line, index) => e('div', { key: index }, line.text))),
        e('div', { className: 'terminal-line' },
            e('span', { className: 'terminal-prompt' }, getPrompt()),
            e('input', { className: 'terminal-input', type: 'text', value: input, onChange: e => setInput(e.target.value), onKeyDown: handleKeyDown, autoFocus: true })
        ),
        e('div', { ref: terminalEndRef })
    );
};
ReactDOM.createRoot(document.getElementById('root')).render(e(Terminal));
</script></body></html>`
    },
    Browser: {
        manifest: `{ "name": "Browser", "icon": "Browser" }`,
        html: `
<!DOCTYPE html><html><head>${WAP_COMMON_HTML_HEAD}</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
const e = React.createElement;

const ICONS = {
  Back: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { d: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' })),
  Forward: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { d: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' })),
  Home: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' })),
  Refresh: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' })),
  Search: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { d: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' })),
  Trash: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { d: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' })),
};

const BrowserHistoryPage = ({ history, navigate, clearHistory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredHistory = history.filter(item => item.url.includes(searchTerm)).reverse();
    const groupedHistory = filteredHistory.reduce((acc, item) => {
        const date = new Date(item.time).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    return e('div', { className: 'browser-history-page' },
        e('div', { className: 'browser-history-header' },
            e('h1', null, 'History'),
            e('div', { className: 'browser-history-controls' },
                e('div', { className: 'browser-history-search-wrapper' },
                    e(ICONS.Search, { className: 'browser-history-search-icon' }),
                    e('input', { type: 'text', placeholder: 'Search history', className: 'browser-history-search', onChange: (e) => setSearchTerm(e.target.value) })
                ),
                e('button', { className: 'browser-history-clear-btn', onClick: clearHistory }, e(ICONS.Trash), 'Clear browsing data')
            )
        ),
        e('div', { className: 'browser-history-list' },
            Object.keys(groupedHistory).length === 0 ? e('div', { className: 'browser-history-empty' }, 'No history entries.')
            : Object.entries(groupedHistory).map(([date, entries]) => e('div', { key: date, className: 'history-date-group' },
                e('h2', { className: 'history-group-title' }, date),
                entries.map(item => e('div', { key: item.time, className: 'history-entry', onClick: () => navigate(item.url) },
                    e('span', { className: 'history-entry-time' }, new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
                    e('img', { className: 'history-entry-icon', src: \`https://www.google.com/s2/favicons?domain=\${new URL(item.url).hostname}\`, crossOrigin: "anonymous" }),
                    e('span', { className: 'history-entry-url' }, item.url)
                ))
            ))
        )
    );
};

const Browser = () => {
    const defaultUrl = 'https://google.com/search?igu=1&q=Winux+OS';
    const [url, setUrl] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [view, setView] = useState('iframe');
    const iframeRef = useRef(null);

    useEffect(() => {
        const onReady = async () => {
            try {
                const s = await window.WinuxDriver.settings.get();
                if (s) {
                    document.body.className = s.theme === 'dark' ? 'dark-theme' : '';
                }

                if (window.WINUX_ARGS.filePath && window.WINUX_ARGS.filePath.endsWith('.html')) {
                    try {
                        const fileContentBytes = await window.WinuxDriver.fs.readFile(window.WINUX_ARGS.filePath);
                        const fileContent = new TextDecoder().decode(fileContentBytes);
                        const dataUrl = \`data:text/html;charset=utf-8,\${encodeURIComponent(fileContent)}\`;
                        navigate(dataUrl, true, true);
                    } catch (e) {
                        console.error("Failed to load local HTML file:", e);
                        navigate(defaultUrl, true, true);
                    }
                } else {
                     const initialUrl = window.WINUX_ARGS.filePath || defaultUrl;
                     navigate(initialUrl, true, true);
                }
            } catch (err) {
                 console.error("Browser failed to init:", err);
            }
        };
        document.addEventListener('winuxready', onReady);
        return () => document.removeEventListener('winuxready', onReady);
    }, []);

    const navigate = (newUrl, addToHistory = true, isInitial = false) => {
        let finalUrl = newUrl;
        if (!newUrl.startsWith('http') && !newUrl.startsWith('data:')) {
            finalUrl = \`https://google.com/search?igu=1&q=\${encodeURIComponent(newUrl)}\`;
        }
        
        setUrl(finalUrl);
        if (addToHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push({ url: finalUrl, time: Date.now() });
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        if(!isInitial) setView('iframe');
    };

    const handleUrlSubmit = (e) => { e.preventDefault(); navigate(e.target.elements.url.value); };
    const goBack = () => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setHistoryIndex(newIndex); navigate(history[newIndex].url, false); } };
    const goForward = () => { if (historyIndex < history.length - 1) { const newIndex = historyIndex + 1; setHistoryIndex(newIndex); navigate(history[newIndex].url, false); } };
    const goHome = () => navigate(defaultUrl);
    const refresh = () => { if (iframeRef.current) { iframeRef.current.src = 'about:blank'; setTimeout(() => iframeRef.current.src = url, 0); } };
    
    const currentUrlForDisplay = url.startsWith('data:') ? 'data:text/html' : url;
    
    return e('div', { className: 'browser-app' },
        e('div', {className: 'browser-bar-container'},
            e('div', { className: 'browser-bar' },
                e('button', { onClick: goBack, disabled: historyIndex <= 0 }, e(ICONS.Back)),
                e('button', { onClick: goForward, disabled: historyIndex >= history.length - 1 }, e(ICONS.Forward)),
                e('button', { onClick: refresh }, e(ICONS.Refresh)),
                e('button', { onClick: goHome }, e(ICONS.Home)),
                e('form', { onSubmit: handleUrlSubmit, style: { flexGrow: 1, display: 'flex' } }, e('input', { name: 'url', type: 'text', defaultValue: currentUrlForDisplay, key: currentUrlForDisplay })),
                e('button', { onClick: () => setView(view === 'history' ? 'iframe' : 'history') }, "History")
            )
        ),
        e('div', { className: 'browser-content' },
            view === 'iframe' && e('iframe', { ref: iframeRef, src: url, sandbox: 'allow-forms allow-scripts allow-same-origin' }),
            view === 'history' && e(BrowserHistoryPage, { history, navigate, clearHistory: () => { setHistory([]); setHistoryIndex(-1); } })
        )
    );
};
ReactDOM.createRoot(document.getElementById('root')).render(e(Browser));
</script></body></html>`
    },
    Settings: {
        manifest: `{ "name": "Settings", "icon": "Settings" }`,
        html: `
<!DOCTYPE html><html><head>${WAP_COMMON_HTML_HEAD}</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
const e = React.createElement;

const ICONS = {
  Theme: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { fill: 'currentColor', d: 'M12 3a9 9 0 0 0 0 18a9 9 0 0 0 0-18zM12 19a7 7 0 0 1 0-14v14z' })),
  About: (props) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { fill: 'currentColor', d: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' })),
  Developer: (props) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "currentColor"}, e('path', { d: "M10 9L6.5 12.5L10 16V13H14V11H10V9M14 15L17.5 11.5L14 8V11H10V13H14V15M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" })),
};

const SettingsApp = () => {
    const [settings, setSettings] = useState(null);
    const [pane, setPane] = useState('personalization');
    const [wallpaperInput, setWallpaperInput] = useState('');
    const [apiKeyInput, setApiKeyInput] = useState('');

    useEffect(() => {
        const onReady = async () => {
            try {
                const s = await window.WinuxDriver.settings.get();
                if (s) {
                    setSettings(s);
                    setWallpaperInput(s.wallpaper);
                    setApiKeyInput(s.apiKey || '');
                    document.body.className = s.theme === 'dark' ? 'dark-theme' : '';
                } else {
                    console.error("Settings: Received null settings from kernel.");
                }
            } catch(err) {
                 console.error("Settings failed to init:", err);
            }
        };
        document.addEventListener('winuxready', onReady);
        return () => document.removeEventListener('winuxready', onReady);
    }, []);

    const handleThemeChange = (theme) => {
        window.WinuxDriver.settings.set('theme', theme);
        setSettings(s => ({...s, theme}));
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
    };

    const handleWallpaperChange = () => {
        window.WinuxDriver.settings.set('wallpaper', wallpaperInput);
        setSettings(s => ({...s, wallpaper: wallpaperInput}));
    };

    const handleApiKeyChange = () => {
        window.WinuxDriver.settings.set('apiKey', apiKeyInput);
        setSettings(s => ({...s, apiKey: apiKeyInput}));
    };
    
    if (!settings) return e('div', { className: 'settings-app' }, e('div', { style: { padding: '20px' }}, 'Loading settings...'));

    return e('div', { className: 'settings-app' },
        e('div', { className: 'settings-sidebar' },
            e('button', { className: \`settings-sidebar-btn \${pane === 'personalization' ? 'active' : ''}\`, onClick: () => setPane('personalization') }, e(ICONS.Theme), 'Personalization'),
            e('button', { className: \`settings-sidebar-btn \${pane === 'developer' ? 'active' : ''}\`, onClick: () => setPane('developer') }, e(ICONS.Developer), 'Developer'),
            e('button', { className: \`settings-sidebar-btn \${pane === 'about' ? 'active' : ''}\`, onClick: () => setPane('about') }, e(ICONS.About), 'About')
        ),
        e('div', { className: 'settings-content' },
            pane === 'personalization' && e('div', {className: 'settings-pane'},
                e('h2', {className: 'settings-header'}, 'Personalization'),
                e('h3', null, 'Theme'),
                e('p', null, 'Change the look and feel of Winux OS.'),
                e('div', { className: 'theme-selector' },
                    e('label', { className: 'theme-option' }, e('input', { type: 'radio', name: 'theme', checked: settings.theme === 'light', onChange: () => handleThemeChange('light') }), 'Light'),
                    e('label', { className: 'theme-option' }, e('input', { type: 'radio', name: 'theme', checked: settings.theme === 'dark', onChange: () => handleThemeChange('dark') }), 'Dark')
                ),
                e('h3', null, 'Wallpaper'),
                 e('p', null, 'Set a custom wallpaper from a URL.'),
                e('div', { className: 'wallpaper-input-group'},
                    e('input', { type: 'text', value: wallpaperInput, onChange: (e) => setWallpaperInput(e.target.value) }),
                    e('button', { onClick: handleWallpaperChange }, 'Apply')
                ),
            ),
             pane === 'developer' && e('div', {className: 'settings-pane'},
                e('h2', {className: 'settings-header'}, 'Developer'),
                e('h3', null, 'Gemini API Key'),
                e('p', null, 'Set the API key for all AI-powered features. AI applications may need to be restarted for changes to take effect.'),
                e('div', { className: 'wallpaper-input-group'},
                    e('input', { type: 'password', value: apiKeyInput, onChange: (e) => setApiKeyInput(e.target.value), placeholder: 'Enter your API Key' }),
                    e('button', { onClick: handleApiKeyChange }, 'Save Key')
                ),
            ),
            pane === 'about' && e('div', {className: 'settings-pane'},
                 e('h2', {className: 'settings-header'}, 'About Winux OS'),
                 e('pre', {className: 'os-info'}, \`Winux OS v3.0.0-linux\\n(c) 2024. All rights reserved.\\n\\nUser: \${settings.username}\\nTheme: \${settings.theme}\`)
            )
        )
    );
};
ReactDOM.createRoot(document.getElementById('root')).render(e(SettingsApp));
</script></body></html>`
    },
    AIAssistant: {
        manifest: `{ "name": "AI Assistant", "icon": "AIAssistant" }`,
        html: `
<!DOCTYPE html><html><head>${WAP_COMMON_HTML_HEAD}</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
const e = React.createElement;

const ICONS = {
    Send: (props) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' }))
};

const LoadingIndicator = () => e('div', { className: 'ai-message assistant' },
    e('div', {className: 'loading-dots'}, e('span'), e('span'), e('span'))
);

const AIAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState(null);
    const conversationEndRef = useRef(null);
    
    useEffect(() => {
        const onReady = async () => {
            try {
                const s = await window.WinuxDriver.settings.get();
                if(s) document.body.className = s.theme === 'dark' ? 'dark-theme' : '';
                
                const apiKey = await window.WinuxDriver.sys.getEnv('GEMINI_API_KEY');
                if (!apiKey) throw new Error("API key is not available.");

                const ai = new GoogleGenAI({ apiKey: apiKey });
                const newChat = ai.chats.create({ model: 'gemini-2.5-flash' });
                setChat(newChat);
                setMessages([{ role: 'assistant', text: "Hello! How can I help you today?" }]);
            } catch(err) {
                 setMessages([{ role: 'assistant', text: "Error initializing AI. The API Key may be invalid or missing from the host environment." }]);
                 console.error(err);
            }
        };
        document.addEventListener('winuxready', onReady);
        return () => document.removeEventListener('winuxready', onReady);
    }, []);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || !chat || isLoading) return;
        
        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: userMessage.text });
            const assistantMessage = { role: 'assistant', text: response.text };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Gemini API error:", error);
            const errorMessage = (error.message || '').includes('API key not valid')
                ? 'Could not connect to the AI service. The provided API Key is invalid or missing.'
                : 'Sorry, an unexpected error occurred.';
            setMessages(prev => [...prev, { role: 'assistant', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return e('div', { className: 'ai-assistant-app' },
        e('div', { className: 'ai-conversation' },
            messages.map((msg, index) => e('div', { key: index, className: \`ai-message \${msg.role}\` },
                e('div', { dangerouslySetInnerHTML: { __html: marked.parse(msg.text) }})
            )),
            isLoading && e(LoadingIndicator),
            e('div', { ref: conversationEndRef })
        ),
        e('div', { className: 'ai-input-area' },
            e('textarea', {
                className: 'ai-input',
                value: input,
                onChange: e => setInput(e.target.value),
                onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } },
                placeholder: 'Type your message...',
                disabled: isLoading || !chat
            }),
            e('button', { className: 'ai-send-btn', onClick: handleSend, disabled: isLoading || !chat }, e(ICONS.Send))
        )
    );
};
ReactDOM.createRoot(document.getElementById('root')).render(e(AIAssistant));
</script></body></html>`
    },
     KernelMeltdown: {
        manifest: `{ "name": "Kernel Meltdown", "icon": "KernelMeltdown" }`,
        html: `
<!DOCTYPE html><html><head>${WAP_COMMON_HTML_HEAD}</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React from 'react';
import ReactDOM from 'react-dom/client';
const e = React.createElement;

const ICONS = {
    Biohazard: (props) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M14.68,14.24,12,18,9.32,14.24,6,15.39,6.54,12,6,8.61,9.32,9.76,12,6,14.68,9.76,18,8.61,17.46,12,18,15.39ZM12,2a10,10,0,1,0,10,10A10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z', style: {color: '#FBBF24'} })),
};

const KernelMeltdown = () => {
    const triggerBSOD = () => {
        window.WinuxDriver.sys.bsod('USER_INITIATED_SYSTEM_FAILURE');
    };
    const cancel = () => {
        window.WinuxDriver.proc.close();
    };

    return e('div', { className: 'kernel-meltdown-app' },
        e(ICONS.Biohazard, { className: 'icon' }),
        e('h1', null, 'Kernel Integrity Compromised'),
        e('p', null, 'You are about to perform an action that will destabilize the operating system. This will result in a total system crash. Are you sure you want to proceed?'),
        e('div', { className: 'buttons' },
            e('button', { className: 'cancel-btn', onClick: cancel }, 'Cancel'),
            e('button', { className: 'proceed-btn', onClick: triggerBSOD }, 'Proceed with Meltdown')
        )
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(e(KernelMeltdown));
</script></body></html>`
    },
    VSCode: {
        manifest: `{ "name": "VS Code", "icon": "VSCode" }`,
        html: `
<!DOCTYPE html><html><head>
    ${WAP_COMMON_HTML_HEAD}
</head><body>
<div id="root"></div>
${WAP_DRIVER_AND_INIT_SCRIPT}
<script type="module">
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';
import { marked } from 'marked';

const e = React.createElement;

const ICONS = {
  File: (props) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" }, e('path', { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z", fill: "var(--vscode-text-secondary)" }), e('path', { d: "M14 2v6h6l-6-6Z", fill: "var(--vscode-line-number)" })),
  Files: (props) => e('svg', { ...props, viewBox: '0 0 24 24', fill:'currentColor' }, e('path', { d: 'M16.5 8H19v11H5V3h8.5l-3 3h-3v11H14v-9h2.5l-2.5-2.5z' })),
  Agent: (props) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" }, e('defs', null, e('linearGradient', { id: "grad_ai", x1: "0%", y1: "0%", x2: "100%", y2: "100%" }, e('stop', { offset: "0%", style: { stopColor: '#A78BFA', stopOpacity: 1 } }), e('stop', { offset: "100%", style: { stopColor: '#6D28D9', stopOpacity: 1 } }))), e('path', { d: "M12 2.75C6.891 2.75 2.75 6.891 2.75 12c0 5.108 4.141 9.25 9.25 9.25s9.25-4.142 9.25-9.25C21.25 6.891 17.109 2.75 12 2.75ZM9.5 12l2.5 4 2.5-4-2.5-4-2.5 4Z", fill: "url(#grad_ai)" }), e('path', { d: "M17 7a1 1 0 1 0-2 0 1 1 0 0 0 2 0ZM7 7a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z", fill: "white" })),
  Folder: (props) => e('svg', { ...props, viewBox: "0 0 24 24", fill: "none" }, e('path', { d: "M21.41 6.64a1 1 0 0 0-.6-.23H10.5l-1.9-2.28a1 1 0 0 0-.8-.39H4.2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16.8a1 1 0 0 0 1-1V7.64a1 1 0 0 0-.59-1Z", fill: "#60A5FA" })),
  ChevronDown: (props) => e('svg', { ...props, viewBox: '0 0 16 16' }, e('path', { fill:'currentColor', fillRule: 'evenodd', d: 'M4.33 6.22L8 9.89l3.67-3.67.94.94L8 11.77l-4.61-4.61.94-.94z' })),
  ChevronRight: (props) => e('svg', { ...props, viewBox: '0 0 16 16' }, e('path', { fill:'currentColor', fillRule: 'evenodd', d: 'M6.22 4.33L9.89 8l-3.67 3.67.94.94L11.77 8 7.16 3.39l-.94.94z' })),
  Close: (props) => e('svg', { ...props, viewBox: '0 0 24 24', fill:'currentColor' }, e('path', {d:'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })),
  Send: (props) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' })),
};

const systemInstruction = \`You are an expert programmer AI assistant integrated into a virtual OS code editor. Your primary function is to create and edit files in the virtual filesystem (VFS) by responding in a specific JSON format.

When a user asks you to create code (e.g., "make a python script to..."), you MUST determine a suitable filename and provide the code.
When a user asks to edit an open file, you MUST provide the complete, modified code for that file.

CRITICAL: You MUST respond *only* with a JSON object. Do not add any conversational text or markdown formatting like \\\`\\\`\\\`json. Your entire response must be the raw JSON object.

The JSON object must have this exact structure:
{
  "filePath": "string",
  "content": "string"
}

- 'filePath': A relative path for the file (e.g., 'src/app.js', 'my_script.py'). If editing an existing file, use its current path. Be intelligent about naming new files based on the content.
- 'content': The full source code or text for the file.

Example Request: "create a hello world python script"
Example Response:
{
  "filePath": "hello_world.py",
  "content": "print('Hello, World!')"
}
\`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        filePath: { type: Type.STRING, description: "The relative path for the file, e.g., 'src/app.js' or 'new_script.py'" },
        content: { type: Type.STRING, description: "The complete source code or text content of the file." },
    },
    required: ["filePath", "content"],
};

const FileTreeNode = ({ node, onFileSelect, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(level < 2);
    if (node.type === 'file') {
        return e('div', { className: 'vscode-file-tree-node', style: { paddingLeft: \`\${level * 15 + 5}px\` }, onClick: () => onFileSelect(node.path) },
            e(ICONS.File, { className: 'vscode-file-tree-node-icon' }),
            e('span', { className: 'vscode-file-tree-node-name' }, node.name)
        );
    }
    return e('div', null,
        e('div', { className: 'vscode-file-tree-node', style: { paddingLeft: \`\${level * 15 + 5}px\` }, onClick: () => setIsOpen(!isOpen) },
            e(isOpen ? ICONS.ChevronDown : ICONS.ChevronRight, { className: 'vscode-file-tree-node-icon' }),
            e(ICONS.Folder, { className: 'vscode-file-tree-node-icon' }),
            e('span', { className: 'vscode-file-tree-node-name' }, node.name)
        ),
        isOpen && node.children
            .sort((a,b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
            .map(child => e(FileTreeNode, { key: child.path, node: child, onFileSelect, level: level + 1 }))
    );
};

const VSCodeApp = () => {
    const [settings, setSettings] = useState(null);
    const [apiKey, setApiKey] = useState(null);
    const [ai, setAi] = useState(null);
    const [activeView, setActiveView] = useState('files');
    const [fsRoot, setFsRoot] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [cwd, setCwd] = useState('/');
    const [messages, setMessages] = useState([]);
    const [agentInput, setAgentInput] = useState('');
    const [isAgentLoading, setIsAgentLoading] = useState(false);
    const agentMessagesEndRef = useRef(null);

    const init = async () => {
        try {
            const s = await window.WinuxDriver.settings.get();
            setSettings(s);
            document.body.className = s.theme === 'dark' ? 'dark-theme' : 'light-theme';
            const key = await window.WinuxDriver.sys.getEnv('GEMINI_API_KEY');
            setApiKey(key);
            if (key) {
                const genAI = new GoogleGenAI({ apiKey: key });
                setAi(genAI);
                setMessages([{role: 'assistant', text: "I'm ready to help. Ask me to create or edit a file."}]);
            } else {
                setMessages([{role: 'assistant', text: "AI features disabled. Please set a Gemini API key in the OS settings."}]);
            }
            let startPath = window.WINUX_ARGS.filePath || s.username ? \`/home/\${s.username}\` : '/';
            setCwd(startPath);
            await refreshFileTree(startPath);
            if (window.WINUX_ARGS.filePath) {
                await openFile(window.WINUX_ARGS.filePath);
            }
        } catch (err) {
            console.error("VSCode failed to init:", err);
        }
    };
    
    useEffect(() => {
        document.addEventListener('winuxready', init);
        return () => document.removeEventListener('winuxready', init);
    }, []);

    useEffect(() => {
        agentMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const refreshFileTree = async (path) => {
        try {
            const rootNode = await window.WinuxDriver.fs.readDir(path);
            const fetchChildren = async (node) => {
                if (node.type === 'directory') {
                    const children = await window.WinuxDriver.fs.readDir(node.path);
                    node.children = await Promise.all(children.map(fetchChildren));
                }
                return node;
            }
            const fullTree = await fetchChildren({ name: path, path: path, type: 'directory', children: rootNode });
            setFsRoot(fullTree);
        } catch (e) { console.error('Error refreshing file tree:', e); }
    };

    const openFile = async (path) => {
        if (openFiles.some(f => f.path === path)) {
            setActiveFile(path);
            return;
        }
        try {
            const contentBytes = await window.WinuxDriver.fs.readFile(path);
            const content = new TextDecoder().decode(contentBytes);
            setOpenFiles(prev => [...prev, { path, content, savedContent: content }]);
            setActiveFile(path);
        } catch(e) { console.error(\`Error opening file \${path}:\`, e); }
    };

    const closeFile = (path) => {
        const file = openFiles.find(f => f.path === path);
        if (file && file.content !== file.savedContent) {
            if (!confirm('You have unsaved changes. Close anyway?')) return;
        }
        const newOpenFiles = openFiles.filter(f => f.path !== path);
        setOpenFiles(newOpenFiles);
        if (activeFile === path) {
            setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].path : null);
        }
    };

    const handleFileContentChange = (path, newContent) => {
        setOpenFiles(prev => prev.map(f => f.path === path ? { ...f, content: newContent } : f));
    };

    const saveFile = async (path) => {
        const file = openFiles.find(f => f.path === path);
        if (!file) return;
        try {
            await window.WinuxDriver.fs.writeFile(path, file.content);
            setOpenFiles(prev => prev.map(f => f.path === path ? { ...f, savedContent: f.content } : f));
        } catch (e) {
            console.error(\`Error saving file \${path}:\`, e);
        }
    };
    
    const handleAgentSend = async () => {
        if (!agentInput.trim() || !ai || isAgentLoading) return;
        const currentPrompt = agentInput;
        setMessages(prev => [...prev, {role: 'user', text: currentPrompt}]);
        setAgentInput('');
        setIsAgentLoading(true);

        try {
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: currentPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                },
            });
            
            const jsonText = result.text.trim();
            const responseData = JSON.parse(jsonText);
            
            const { filePath, content } = responseData;
            const fullPath = window.WinuxDriver.sys.resolvePath(filePath, cwd);
            
            await window.WinuxDriver.fs.writeFile(fullPath, content);
            
            setMessages(prev => [...prev, {role: 'assistant', text: \`OK, I've created/updated \`\`\${filePath}\`\`. I'll open it for you.\`}]);
            await openFile(fullPath);
            await refreshFileTree(cwd);
            
        } catch(e) {
            console.error("Agent Error:", e);
            setMessages(prev => [...prev, {role: 'assistant', text: \`Sorry, I encountered an error: \${e.message}\`}]);
        } finally {
            setIsAgentLoading(false);
        }
    };

    const activeFileObj = openFiles.find(f => f.path === activeFile);
    const isUnsaved = activeFileObj && activeFileObj.content !== activeFileObj.savedContent;
    
    return e('div', { className: 'vscode-app' },
        e('div', { className: 'vscode-menu-bar' }, 'File Edit Selection View Go Run Terminal Help'),
        e('div', { className: 'vscode-body' },
            e('div', { className: 'vscode-activity-bar' },
                e('div', { className: \`vscode-activity-bar-icon \${activeView === 'files' ? 'active' : ''}\`, onClick: () => setActiveView('files')}, e(ICONS.Files)),
                e('div', { className: \`vscode-activity-bar-icon \${activeView === 'agent' ? 'active' : ''}\`, onClick: () => setActiveView('agent')}, e(ICONS.Agent)),
            ),
            e('div', { className: 'vscode-sidebar', style: { display: activeView ? 'flex' : 'none' }},
                activeView === 'files' && e(React.Fragment, null, 
                    e('div', { className: 'vscode-sidebar-header' }, 'Explorer'),
                    e('div', { className: 'vscode-file-tree' }, fsRoot && e(FileTreeNode, { node: fsRoot, onFileSelect: openFile }))
                ),
                activeView === 'agent' && e('div', { className: 'vscode-agent-view' },
                    e('div', { className: 'vscode-sidebar-header' }, 'AI Assistant'),
                    e('div', { className: 'vscode-agent-messages' }, 
                        messages.map((msg, i) => e('div', { key: i, className: \`agent-message \${msg.role}\`}, e('div', { dangerouslySetInnerHTML: { __html: marked.parse(msg.text) }}))),
                        isAgentLoading && e('div', {className: 'loading-spinner'}),
                        e('div', {ref: agentMessagesEndRef})
                    ),
                    e('div', { className: 'vscode-agent-input-area' },
                        e('textarea', { value: agentInput, onChange: (e) => setAgentInput(e.target.value), placeholder: 'Ask AI to create/edit a file...', disabled: isAgentLoading || !ai, onKeyDown: e => {if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAgentSend()}} }),
                        e('button', { onClick: handleAgentSend, disabled: isAgentLoading || !ai }, e(ICONS.Send))
                    )
                )
            ),
            e('div', { className: 'vscode-main-view' },
                e('div', { className: 'vscode-editor-tabs' }, 
                    openFiles.map(file => e('div', { key: file.path, className: \`vscode-editor-tab \${activeFile === file.path ? 'active' : ''}\`, onClick: () => setActiveFile(file.path) },
                        e(ICONS.File, { className: 'vscode-editor-tab-icon' }),
                        e('span', null, file.path.split('/').pop()),
                        e('div', { className: 'vscode-editor-tab-close', onClick: (e) => { e.stopPropagation(); closeFile(file.path) }}, e('span', { className: \`\${file.content !== file.savedContent ? 'unsaved-dot' : ''}\` }, file.content !== file.savedContent ? '' : e(ICONS.Close, {width: 12, height: 12})))
                    ))
                ),
                e('div', { className: 'vscode-editor-pane' }, 
                    activeFileObj ? e('textarea', {
                        key: activeFileObj.path,
                        className: 'editor-textarea',
                        value: activeFileObj.content,
                        onChange: (e) => handleFileContentChange(activeFileObj.path, e.target.value),
                        onKeyDown: (e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                                e.preventDefault();
                                saveFile(activeFileObj.path);
                            }
                        }
                    }) : e('div', {className: 'vscode-welcome-screen'}, e(ICONS.Code, {}), e('p', null, 'Open a file to start editing'))
                ),
                e('div', { className: 'vscode-status-bar' }, isUnsaved ? 'Unsaved Changes' : 'Ready')
            )
        )
    );
};
ReactDOM.createRoot(document.getElementById('root')).render(e(VSCodeApp));
</script></body></html>`
    }
};

const OS_SOURCE_CODE = {
    GRUB_CFG: `
set timeout=5
set default=0

menuentry "Winux OS 3.0.0 (Kernel 3.0.0-winux)" {
    linux /boot/vmlinuz-3.0.0-winux root=/dev/ram0
    initrd /boot/initrd-3.0.0-winux
}
`,
    JSINT: `// Winux JavaScript Interpreter
// This is a pseudo-executable. The actual interpretation is handled
// by the kernel's SYS_EXEC_JS syscall.
// Usage in terminal: jsint /path/to/your/script.js
`,
    BABYLON_DRIVER: `// Babylon.js Driver
// This driver enables high-performance 3D graphics for WAP applications.
// It is injected into applications that declare 'babylonjs' driver dependency
// in their manifest.
console.log('[babylon.drv] Initializing Babylon.js engine...');

// Create mock Babylon objects to prevent errors in apps that check for them.
window.BABYLON = window.BABYLON || {};
if (!window.BABYLON.Engine) {
    console.log('[babylon.drv] Creating mock Babylon.js Engine.');
    window.BABYLON.Engine = function(canvas, antialias, options, adaptToDeviceRatio) {
        console.log('Mock Babylon Engine created.');
        this.getScene = function() { return null; };
        this.runRenderLoop = function(callback) { console.log('Mock render loop started.'); };
    };
}
if (!window.BABYLON.Scene) {
    console.log('[babylon.drv] Creating mock Babylon.js Scene.');
    window.BABYLON.Scene = function(engine) {
        console.log('Mock Babylon Scene created.');
    };
}
console.log('[babylon.drv] Babylon.js driver loaded successfully.');
`,
    DEVICE_DRIVER: `
class DeviceDriver {
    private db: IDBDatabase | null = null;

    async init() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open('WinuxSystemMemoryDB', 1);
            request.onerror = () => reject("BIOS Error: IndexedDB could not be opened.");
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                db.createObjectStore('system_memory');
            };
        });
    }

    async getSystemMemory(): Promise<ArrayBuffer | SharedArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject("DeviceDriver Error: DB not initialized");
            const transaction = this.db.transaction(['system_memory'], 'readonly');
            const store = transaction.objectStore('system_memory');
            const request = store.get('main_memory');
            request.onerror = () => reject("DeviceDriver Error: Could not read system memory.");
            request.onsuccess = () => resolve(request.result || null);
        });
    }

    async saveSystemMemory(memory: ArrayBuffer | SharedArrayBuffer) {
        if (!this.db || !memory) return;
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['system_memory'], 'readwrite');
            const store = transaction.objectStore('system_memory');
            const request = store.put(memory, 'main_memory');
            request.onerror = () => reject("DeviceDriver Error: Could not write system memory.");
            request.onsuccess = () => resolve();
        });
    }

    createInitialMemory(): ArrayBuffer {
        // Fallback to ArrayBuffer if SharedArrayBuffer is not available
        return new ArrayBuffer(OS_MEMORY_BYTES);
    }
}
`,
    NETWORK_DRIVER: `
class NetworkDriver {
    async fetch(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
        return response.arrayBuffer();
    }
}
`,
    INITRD: `
// This file represents the Initial RAM Disk (initrd).
// It contains core managers needed to bootstrap the rest of the OS.

class MemoryManager {
    private view: DataView;
    private scratchpadPtr: number;
    private scratchpadSize: number;
    private nextAlloc: number;

    constructor(view: DataView, userSpaceStart: number, userSpaceEnd: number) {
        this.view = view;
        // Allocate first 1MB of User Space for syscall scratchpad
        this.scratchpadPtr = userSpaceStart;
        this.scratchpadSize = 1 * 1024 * 1024;
        this.nextAlloc = this.scratchpadPtr;
    }

    alloc(payload: any): number {
        const payloadStr = JSON.stringify(payload);
        const bytes = new TextEncoder().encode(payloadStr);
        const len = bytes.length;

        if (this.nextAlloc + 4 + len > this.scratchpadPtr + this.scratchpadSize) {
            this.nextAlloc = this.scratchpadPtr;
        }

        const ptr = this.nextAlloc;
        this.view.setUint32(ptr, len, true); // Write length prefix
        new Uint8Array(this.view.buffer).set(bytes, ptr + 4);
        
        this.nextAlloc += (4 + len);
        return ptr;
    }
    
    readPayload(ptr: number): any {
        const len = this.view.getUint32(ptr, true);
        const bytes = new Uint8Array(this.view.buffer, ptr + 4, len);
        const payloadStr = new TextDecoder().decode(bytes);
        return JSON.parse(payloadStr);
    }

    free(ptr: number) { /* no-op */ }
}

class Scheduler {
    private processes: Map<number, Process> = new Map();
    private focusStack: number[] = [];
    private nextProcessId = 1;
    private kernel: Kernel;

    constructor(kernel: Kernel) {
      this.kernel = kernel;
    }

    getProcessIds = (): number[] => Array.from(this.processes.keys());
    getProcessInfo = (pid: number): Process | null => this.processes.get(pid) || null;
    
    openProcess = async (appId: string, options: { filePath?: string } = {}) => {
        const id = this.nextProcessId++;
        
        let appDef: AppDefinition | null = null;
        let titleStr = "Unknown App";
        let filePathStr = options.filePath || "";
        let driverStatus: Process['driverStatus'] = 'not_required';
        let finalAppId = appId;
        
        if (appId.endsWith('.desktop')) {
            const ino = this.kernel.vfs.pathToInodeNum(appId);
            if (!ino) {
                console.error(\`Desktop file not found: \${appId}\`);
                return null;
            }
            const desktopFileContent = this.kernel.vfs.readFileContentByInode(ino);
            const execMatch = desktopFileContent.match(/Exec=(.*)/);
            if (execMatch && execMatch[1]) {
                 finalAppId = execMatch[1].trim();
            }
        }
        
        if (filePathStr && !finalAppId.endsWith('.wap') && !finalAppId.endsWith('.desktop')) {
            const codeExtensions = ['.js', '.css', '.json', '.txt', '.md', '.ts', '.py'];
            if (filePathStr.endsWith('.html')) {
                finalAppId = '/usr/apps/Browser.wap';
            } else if (codeExtensions.some(ext => filePathStr.endsWith(ext))) {
                finalAppId = '/usr/apps/VSCode.wap';
            } else {
                finalAppId = this.kernel.settings.defaultEditor;
            }
        }
        
        appDef = this.kernel.getAppDefinition(finalAppId);
        if(!appDef) {
            console.error(\`No app definition found for \${finalAppId}\`);
            return null;
        }

        titleStr = appDef.name;
        if (filePathStr) {
             const node = this.kernel.vfs.getVFSNodeByPath(filePathStr);
             if (node) titleStr = \`\${node.name} - \${appDef.name}\`;
        } else if (finalAppId.endsWith('.wap')) {
            filePathStr = finalAppId;
        }

        if (finalAppId.endsWith('.wap')) {
            const ino = this.kernel.vfs.pathToInodeNum(finalAppId);
            if (ino) {
                try {
                    const fileBytes = this.kernel.vfs.readFileBytesByInode(ino);
                    const zip = await JSZip.loadAsync(fileBytes);
                    const manifestFile = zip.file('manifest.json');
                    if (manifestFile) {
                        const manifest = JSON.parse(await manifestFile.async('string'));
                        if (manifest.driver === 'babylonjs') {
                            const driverPath = '/lib/drivers/babylon.drv';
                            driverStatus = this.kernel.vfs.pathToInodeNum(driverPath) ? 'enabled' : 'disabled';
                        }
                    }
                } catch (e) {
                    console.error("Failed to check WAP manifest for driver:", e);
                }
            }
        }
        
        const newProcess: Process = {
            id, appId: finalAppId, zIndex: 1000 + id,
            x: 50 + (id % 10) * 20, y: 50 + (id % 10) * 20,
            width: 800, height: 600,
            isMaximized: false, isMinimized: false, isFocused: false,
            title: titleStr, filePath: options.filePath, driverStatus,
            env: { 'GEMINI_API_KEY': this.kernel.apiKey }
        };
        this.processes.set(id, newProcess);

        this.focusProcess(id);
        this.kernel.notify();
        return id;
    };

    closeProcess = (pid: number) => {
        this.processes.delete(pid);
        this.focusStack = this.focusStack.filter(id => id !== pid);
        if (this.focusStack.length > 0) {
            this.focusProcess(this.focusStack[this.focusStack.length - 1]);
        }
        this.kernel.notify();
    };
    
    focusProcess = (pid: number) => {
        this.focusStack = [pid, ...this.focusStack.filter(id => id !== pid)];
        this.processes.forEach((process, id) => {
            process.isFocused = id === pid;
            process.zIndex = 1000 + this.focusStack.slice().reverse().indexOf(id);
            if (process.isFocused) {
               process.isMinimized = false;
            }
        });
        this.kernel.notify();
    };

    updateProcessState = (pid: number, updates: Partial<Process>) => {
        const process = this.processes.get(pid);
        if (!process) return;
        Object.assign(process, updates);
        
        if (updates.isMinimized) {
            const newFocusStack = this.focusStack.filter(id => id !== pid);
            if (newFocusStack.length > 0) {
                this.focusProcess(newFocusStack[0]);
            }
            this.focusStack = newFocusStack;
        }
        this.kernel.notify();
    };
}
`,
    KERNEL: `
// This file represents the core Kernel of Winux OS.
// It orchestrates all managers and drivers.

class Kernel {
    public memory: ArrayBuffer | SharedArrayBuffer;
    private view: DataView;
    public apiKey: string;
    public memoryMap: {
        KERNEL_SPACE_START: number, KERNEL_SPACE_END: number,
        VFS_PARTITION_START: number, VFS_PARTITION_END: number,
        USER_SPACE_START: number, USER_SPACE_END: number,
    };
    private subscribers: Set<() => void> = new Set();
    
    // Managers
    public scheduler: Scheduler;
    public vfs: VFS;
    public memoryManager: MemoryManager;
    
    // Drivers
    private drivers: {
      network: NetworkDriver;
    };

    public settings: {
        theme: 'light' | 'dark',
        wallpaper: string,
        brightness: number,
        username: string,
        defaultEditor: string,
        apiKey: string,
    };
    public apps: Record<string, AppDefinition>;

    constructor(systemMemory: ArrayBuffer | SharedArrayBuffer) {
        this.memory = systemMemory;
        this.view = new DataView(this.memory);
        this.apiKey = 'REPLACE_WITH_YOUR_API_KEY';
        this.apps = {};
        this.settings = {
            theme: 'dark',
            wallpaper: \`https://source.unsplash.com/random/1920x1080?nature,water\`,
            brightness: 100,
            username: "winux",
            defaultEditor: '/usr/apps/TextEditor.wap',
            apiKey: this.apiKey,
        };

        const VFS_SIZE = 16 * 1024 * 1024;
        this.memoryMap = {
            KERNEL_SPACE_START: 0,
            KERNEL_SPACE_END: 1 * 1024 * 1024,
            VFS_PARTITION_START: 1 * 1024 * 1024,
            VFS_PARTITION_END: 1 * 1024 * 1024 + VFS_SIZE,
            USER_SPACE_START: 1 * 1024 * 1024 + VFS_SIZE,
            USER_SPACE_END: OS_MEMORY_BYTES,
        };
        
        // Initialize Managers and Drivers
        this.scheduler = new Scheduler(this);
        this.memoryManager = new MemoryManager(this.view, this.memoryMap.USER_SPACE_START, this.memoryMap.USER_SPACE_END);
        this.vfs = new VFS(this, this.memoryMap.VFS_PARTITION_START, this.memoryMap.VFS_PARTITION_END);
        this.drivers = {
            network: new NetworkDriver()
        };
    }

    getSystemMemoryBuffer = (): ArrayBuffer | SharedArrayBuffer => this.memory;
    subscribe = (callback: () => void) => { this.subscribers.add(callback); return () => this.unsubscribe(callback); };
    private unsubscribe = (callback: () => void) => { this.subscribers.delete(callback); };
    public notify = () => this.subscribers.forEach(cb => cb());

    async bootstrap() {
        await this.vfs.init();
        
        // Boot integrity check
        const core_files = [
            '/boot/vmlinuz-3.0.0-winux',
            '/boot/initrd-3.0.0-winux',
            '/sys/module/ui/core',
            '/sys/module/ui/components',
            '/sys/module/drivers/device',
            '/boot/grub/grub.cfg',
            '/etc/fstab',
        ];
        for (const file of core_files) {
            if (!this.vfs.pathToInodeNum(file)) {
                const message = \`FATAL: Missing core component\\nRequired file not found: \${file}\`;
                this.triggerBSOD(message);
                throw new Error(\`Fatal boot error: \${message}\`);
            }
        }

        await this.loadApps();
    }
    
    async loadApps() {
        const appsDir = this.vfs.getVFSNodeByPath('/usr/apps');
        this.apps = {};
        if (appsDir && appsDir.children) {
            for (const appFile of appsDir.children) {
                if (appFile.path.endsWith('.wap')) {
                    try {
                        const data = this.vfs.readFileBytesByInode(appFile.ino);
                        const zip = await JSZip.loadAsync(data);
                        const manifestFile = zip.file('manifest.json');
                        if (manifestFile) {
                            const manifest = JSON.parse(await manifestFile.async('string'));
                            this.apps[appFile.path] = { id: appFile.path, name: manifest.name, icon: STATIC_ICONS[manifest.icon] || Icons.File };
                        }
                    } catch(e) {
                        console.error(\`Failed to load WAP: \${appFile.path}\`, e);
                    }
                }
            }
        }
    }

    getAppDefinition = (appId: string): AppDefinition | null => this.apps[appId] || null;
    
    triggerBSOD = (message: string) => {
        const bsodDiv = document.createElement('div');
        bsodDiv.className = 'bsod';
        bsodDiv.innerHTML = \`<h1>:(</h1><p>Your PC ran into a problem and needs to restart. We're just collecting some error info.</p><div class="bsod-details">Stop code: \${message.replace(/\\n/g, '<br/>')}</div>\`;
        document.body.innerHTML = '';
        document.body.appendChild(bsodDiv);
        document.body.style.backgroundColor = '#0078d4';
    }

    async _syscall_handler(opcode: number, argsPtr: number, process: Process) {
        const payload = this.memoryManager.readPayload(argsPtr);
        const cwd = \`/home/\${this.settings.username}\`;

        switch (opcode) {
            case SYSCALL_OPCODES.SYS_GET_ENV:
                return process.env[payload.key] ?? null;

            case SYSCALL_OPCODES.FS_READ_FILE:
                const readIno = this.vfs.pathToInodeNum(payload.path, cwd);
                if (!readIno) throw new Error(\`File not found: \${payload.path}\`);
                return this.vfs.readFileBytesByInode(readIno);

            case SYSCALL_OPCODES.FS_WRITE_FILE:
                const resolvedPath = this.vfs.resolvePath(payload.path, cwd);
                const parentPath = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';
                const filename = resolvedPath.split('/').pop();
                if(!filename) throw new Error('Invalid file path for writing');
                const parentIno = this.vfs.pathToInodeNum(parentPath);
                if(!parentIno) throw new Error(\`Directory not found: \${parentPath}\`);
                const existingFileIno = this.vfs.pathToInodeNum(resolvedPath);
                const content = Array.isArray(payload.data) ? new Uint8Array(payload.data) : payload.data;
                if (existingFileIno) {
                    this.vfs.updateFileContentByInode(existingFileIno, content);
                } else {
                    this.vfs.createFile(parentIno, filename, content);
                }
                this.notify();
                return true;

            case SYSCALL_OPCODES.FS_READ_DIR:
                const node = this.vfs.getVFSNodeByPath(payload.path, cwd);
                if (!node || node.type !== 'directory') throw new Error(\`Directory not found or not a directory: \${payload.path}\`);
                return node.children?.map(c => ({ name: c.name, type: c.type, path: c.path })) || [];

            case SYSCALL_OPCODES.SETTINGS_GET:
                return this.settings;

            case SYSCALL_OPCODES.SETTINGS_SET:
                if (payload.key in this.settings) {
                    (this.settings as any)[payload.key] = payload.value;
                    
                    if (payload.key === 'apiKey') {
                        this.apiKey = payload.value;
                    }

                    const settingsIno = this.vfs.pathToInodeNum('/etc/settings.json');
                    if (settingsIno) {
                        try { this.vfs.updateFileContentByInode(settingsIno, JSON.stringify(this.settings, null, 2)); }
                        catch (e) { console.error("Could not save settings:", e); }
                    }
                    if(payload.key === 'theme') {
                        document.body.className = payload.value === 'dark' ? 'dark-theme' : '';
                    }
                    this.notify();
                }
                return true;

            case SYSCALL_OPCODES.PROC_OPEN:
                return this.scheduler.openProcess(payload.appId, { filePath: payload.filePath });

            case SYSCALL_OPCODES.PROC_CLOSE:
                this.scheduler.closeProcess(process.id);
                return true;

            case SYSCALL_OPCODES.SYS_EXEC:
                if (payload.command === 'apt-get') {
                    const data = await this.drivers.network.fetch(payload.args[0]);
                    const filename = new URL(payload.args[0]).pathname.split('/').pop() || 'downloaded_file';
                    if (filename.endsWith('.wap')) {
                        await this.installWap(new Uint8Array(data), filename);
                        return \`Successfully installed \${filename}.\`;
                    } else {
                        const cwdIno = this.vfs.pathToInodeNum(cwd);
                        if (cwdIno) {
                            this.vfs.createFile(cwdIno, filename, new Uint8Array(data));
                            return \`Downloaded and saved as \${filename} in \${cwd}\`;
                        } else {
                            throw new Error(\`Current directory \${cwd} not found.\`);
                        }
                    }
                }
                throw new Error(\`Unknown exec command: \${payload.command}\`);
            
            case SYSCALL_OPCODES.SYS_EXEC_JS:
                const { code } = payload;
                const logs: string[] = [];
                const customConsole = {
                    log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
                    error: (...args: any[]) => logs.push(\`ERROR: \${args.map(a => String(a)).join(' ')}\`),
                    warn: (...args: any[]) => logs.push(\`WARN: \${args.map(a => String(a)).join(' ')}\`),
                };
                try {
                    const func = new Function('kernel', 'console', code);
                    const result = func.call(this, this, customConsole);
                    return { logs, result: result !== undefined ? String(result) : null, error: null };
                } catch (e) {
                    return { logs, result: null, error: (e as Error).message };
                }

            case SYSCALL_OPCODES.SYS_BSOD:
                 this.triggerBSOD(payload.message || 'WAP_INITIATED_CRASH');
                 return true;

            default:
                throw new Error(\`Unknown kernel syscall opcode: \${opcode}\`);
        }
    }

    async installWap(data: Uint8Array, filename: string) {
        const appsDirIno = this.vfs.pathToInodeNum('/usr/apps');
        if (!appsDirIno) { this.triggerBSOD('MISSING_SYSTEM_FOLDER: /usr/apps'); return; }
        const wapPath = \`/usr/apps/\${filename}\`;
        const existingIno = this.vfs.pathToInodeNum(wapPath);
        if(existingIno) { this.vfs.updateFileContentByInode(existingIno, data); }
        else { this.vfs.createFile(appsDirIno, filename, data); }
        const zip = await JSZip.loadAsync(data);
        const manifestFile = zip.file('manifest.json');
        if (!manifestFile) { console.error('WAP install failed: manifest.json not found in', filename); return; }
        const manifest = JSON.parse(await manifestFile.async('string'));
        this.apps[wapPath] = { id: wapPath, name: manifest.name, icon: STATIC_ICONS[manifest.icon] || Icons.File, };
        const desktopDirIno = this.vfs.pathToInodeNum(\`/home/\${this.settings.username}/Desktop\`);
        if (desktopDirIno) {
            const shortcutPath = \`/home/\${this.settings.username}/Desktop/\${manifest.name}.desktop\`;
            const shortcutContent = \`[Desktop Entry]\\nName=\${manifest.name}\\nExec=\${wapPath}\\nIcon=\${manifest.icon}\`;
            const existingShortcutIno = this.vfs.pathToInodeNum(shortcutPath);
            if(existingShortcutIno) { this.vfs.updateFileContentByInode(existingShortcutIno, shortcutContent); }
            else { this.vfs.createFile(desktopDirIno, \`\${manifest.name}.desktop\`, shortcutContent); }
        }
        this.notify();
    }
}
`,
    UI_CORE: `
// This file represents the core UI shell of the OS.
// It renders the desktop, windows, taskbar, etc.

const WinuxOS: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
    const { kernel } = useOS();
    const processIds = kernel.scheduler.getProcessIds();
    const processes = processIds.map(id => kernel.scheduler.getProcessInfo(id)).filter(Boolean) as Process[];
    const { settings } = kernel;
    const desktopNode = kernel.vfs.getVFSNodeByPath(\`/home/\${settings.username}/Desktop\`);

    const [startMenuVisible, setStartMenuVisible] = React.useState(false);
    const [controlCenterVisible, setControlCenterVisible] = React.useState(false);
    const [contextMenu, setContextMenu] = React.useState<any>(null);

    const handleAppClick = async (appId: string) => {
        const runningProcesses = processes.filter(p => p.appId === appId || (p.appId.endsWith('.wap') && p.title?.includes(appId)));
        if (runningProcesses.length > 0) {
            kernel.scheduler.focusProcess(runningProcesses[0].id);
        } else {
            await kernel.scheduler.openProcess(appId);
        }
        closePopups();
    };

    const handleDesktopItemDoubleClick = async (item: VFSNode) => {
        await kernel.scheduler.openProcess(item.path, { filePath: item.path });
    };

    const closePopups = () => {
        setStartMenuVisible(false);
        setControlCenterVisible(false);
        setContextMenu(null);
    }
    
    const handleTaskbarAppClick = async (appId: string) => {
        const appProcesses = processes.filter(p => p.appId === appId);
        if (appProcesses.length === 0) { await kernel.scheduler.openProcess(appId); return; }
        const focusedAppProcess = appProcesses.find(p => p.isFocused);
        if (focusedAppProcess) {
             kernel.scheduler.updateProcessState(focusedAppProcess.id, { isMinimized: true });
        } else {
            const topProcess = appProcesses.sort((a,b) => b.zIndex - a.zIndex)[0];
            kernel.scheduler.focusProcess(topProcess.id);
        }
    };
    
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        closePopups();
        setContextMenu({
            x: e.clientX, y: e.clientY,
            items: [
                { label: 'New Folder', action: 'NEW_FOLDER', disabled: true },
                { label: 'Change Wallpaper', action: () => kernel.scheduler.openProcess('/usr/apps/Settings.wap') },
                { label: 'Trigger Meltdown', action: () => kernel.scheduler.openProcess('/usr/apps/KernelMeltdown.wap') },
            ]
        });
    };
    
    const handleContextMenuSelect = (action: any) => {
        if (typeof action === 'function') action();
        setContextMenu(null);
    }
    
    const brightnessOpacity = Math.min(0.85, (100 - settings.brightness) / 100);

    return e('div', { className: 'desktop', onClick: closePopups, onContextMenu: handleContextMenu },
        e('img', { className: 'wallpaper', src: settings.wallpaper, alt: '' }),
        e('div', {className: 'brightness-overlay', style: {opacity: brightnessOpacity}}),
        e('div', { className: 'desktop-icons-container' },
            desktopNode?.children?.map(item => e(DesktopIcon, { key: item.path, item: item, onDoubleClick: handleDesktopItemDoubleClick }))
        ),
        e('div', { className: 'desktop-area' },
            processes.map(p => e(Window, { key: p.id, process: p, onClose: () => kernel.scheduler.closeProcess(p.id), children: e(WapRunner, { process: p }) }))
        ),
        e(Taskbar, { onAppClick: handleTaskbarAppClick, onStartClick: (e) => { e.stopPropagation(); setStartMenuVisible(!startMenuVisible); setControlCenterVisible(false); }, onControlCenterClick: (e) => { e.stopPropagation(); setControlCenterVisible(!controlCenterVisible); setStartMenuVisible(false); }}),
        e(StartMenu, { onAppClick: handleAppClick, isVisible: startMenuVisible }),
        e(ControlCenter, { isVisible: controlCenterVisible, onSignOut }),
        e(ContextMenu, { menu: contextMenu, onSelect: handleContextMenuSelect })
    );
};
`,
    UI_COMPONENTS: `
// This file contains the source code for various UI components used by the OS shell.

const Window = ({ process, children, onClose }: WindowProps) => {
    const { kernel } = useOS();
    const windowRef = React.useRef<HTMLDivElement>(null);
    const [isInteracting, setIsInteracting] = React.useState(false);
    const dragData = React.useRef({ isDragging: false, isResizing: false, x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });

    const onMouseDown = (e: React.MouseEvent) => {
        kernel.scheduler.focusProcess(process.id);
    };
    
    const onMinimize = () => kernel.scheduler.updateProcessState(process.id, { isMinimized: true });
    const onMaximize = () => kernel.scheduler.updateProcessState(process.id, { isMaximized: !process.isMaximized });

    const handleMouseMove = (e: MouseEvent) => {
        if (!windowRef.current) return;
        e.preventDefault();
        const dx = e.clientX - dragData.current.x;
        const dy = e.clientY - dragData.current.y;
        if (dragData.current.isDragging) {
            const newX = dragData.current.startX + dx;
            const newY = dragData.current.startY + dy;
            windowRef.current.style.transform = \`translate(\${newX}px, \${newY}px)\`;
        } else if (dragData.current.isResizing) {
            const newWidth = Math.max(350, dragData.current.width + dx);
            const newHeight = Math.max(250, dragData.current.height + dy);
            windowRef.current.style.width = \`\${newWidth}px\`;
            windowRef.current.style.height = \`\${newHeight}px\`;
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (windowRef.current) {
            const dx = e.clientX - dragData.current.x;
            const dy = e.clientY - dragData.current.y;
            windowRef.current.style.transform = '';
            if (dragData.current.isDragging) {
                kernel.scheduler.updateProcessState(process.id, { x: dragData.current.startX + dx, y: dragData.current.startY + dy, isMaximized: false });
            } else if (dragData.current.isResizing) {
                const newWidth = Math.max(350, dragData.current.width + dx);
                const newHeight = Math.max(250, dragData.current.height + dy);
                windowRef.current.style.width = '';
                windowRef.current.style.height = '';
                kernel.scheduler.updateProcessState(process.id, { width: newWidth, height: newHeight });
            }
        }
        setIsInteracting(false);
    };
    
    const handleDragStart = (e: React.MouseEvent) => {
        if (process.isMaximized || e.button !== 0 || (e.target as HTMLElement).closest('.nodrag')) return;
        e.preventDefault();
        kernel.scheduler.focusProcess(process.id);
        setIsInteracting(true);
        dragData.current = { isDragging: true, isResizing: false, x: e.clientX, y: e.clientY, startX: process.x, startY: process.y, width: 0, height: 0 };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        if (process.isMaximized || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        kernel.scheduler.focusProcess(process.id);
        setIsInteracting(true);
        dragData.current = { isDragging: false, isResizing: true, x: e.clientX, y: e.clientY, width: process.width, height: process.height, startX: 0, startY: 0 };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    
    const appDef = kernel.getAppDefinition(process.appId);
    if (!appDef) {
         return null;
    }

    const windowStyle: React.CSSProperties = {
        top: isInteracting ? '0' : (process.isMaximized ? undefined : \`\${process.y}px\`),
        left: isInteracting ? '0' : (process.isMaximized ? undefined : \`\${process.x}px\`),
        transform: isInteracting ? \`translate(\${process.x}px, \${process.y}px)\` : '',
        width: process.isMaximized ? undefined : \`\${process.width}px\`,
        height: process.isMaximized ? undefined : \`\${process.height}px\`,
        zIndex: process.zIndex,
        display: process.isMinimized ? 'none' : 'flex',
    };
    
    const windowClassName = \`window \${process.isMaximized ? 'maximized' : ''} \${isInteracting ? 'no-transition' : ''} \${process.isFocused ? 'focused' : ''}\`;
    
    return e('div', { ref: windowRef, className: windowClassName, style: windowStyle, onMouseDown },
        e('div', { className: 'title-bar', onMouseDown: handleDragStart, onDoubleClick: onMaximize },
            e(appDef.icon, { className: 'icon' }),
            e('span', { className: 'title' }, process.title || appDef.name),
            e('div', { className: 'window-controls nodrag' },
                e('button', { className: 'window-control minimize', onClick: onMinimize, 'aria-label': 'Minimize' }, e(Icons.Minimize)),
                e('button', { className: 'window-control maximize', onClick: onMaximize, 'aria-label': process.isMaximized ? 'Restore' : 'Maximize' }, process.isMaximized ? e(Icons.Restore) : e(Icons.Maximize)),
                e('button', { className: 'window-control close', onClick: onClose, 'aria-label': 'Close' }, e(Icons.Close))
            )
        ),
        e('div', { className: 'window-content' }, children),
        e('div', { className: \`resize-handle \${process.isMaximized ? 'hidden' : ''}\`, onMouseDown: handleResizeStart })
    );
};

const DesktopIcon = ({ item, onDoubleClick }: { item: VFSNode, onDoubleClick: (item: VFSNode) => void }) => {
    if (!item) return null;
    let displayName = item.name;
    let iconId = item.type === 'directory' ? 'Folder' : 'File';
    if (item.name.endsWith('.desktop')) {
        const nameMatch = item.content?.match(/Name=(.*)/);
        displayName = nameMatch ? nameMatch[1].trim() : item.name.replace(/\\.desktop$/, '');
        const iconMatch = item.content?.match(/Icon=(.*)/);
        if (iconMatch) iconId = iconMatch[1].trim();
    } else if (item.name.endsWith('.wap')) {
        displayName = displayName.replace('.wap', '');
    }
    const IconComponent = STATIC_ICONS[iconId] || Icons.DesktopFile;
    return e('div', { className: 'desktop-icon', onDoubleClick: () => onDoubleClick(item) },
        e(IconComponent, {}), e('span', null, displayName)
    );
};

const Taskbar = ({ onAppClick, onStartClick, onControlCenterClick }: {onAppClick: (appId: string) => void, onStartClick: (e: React.MouseEvent) => void, onControlCenterClick: (e: React.MouseEvent) => void}) => {
    const { kernel } = useOS();
    const processIds = kernel.scheduler.getProcessIds();
    const processes = processIds.map(pid => kernel.scheduler.getProcessInfo(pid)).filter(Boolean) as Process[];
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const runningApps = React.useMemo(() => {
        const uniqueAppIds = [...new Set(processes.map(p => p.appId))];
        return uniqueAppIds.map(appId => {
            let appDef = kernel.getAppDefinition(appId);
            return { appId, appDef, isActive: processes.some(p => p.appId === appId && p.isFocused) }
        }).filter((item): item is { appId: string; appDef: AppDefinition; isActive: boolean; } => !!item.appDef);
    }, [processes, kernel]);

    return e('div', { className: 'taskbar' },
        e('button', { className: 'taskbar-item', onClick: onStartClick, "aria-label": "Start Menu" }, e(Icons.Start)),
        runningApps.map(({ appId, appDef, isActive }) =>
            e('button', { key: appId, className: \`taskbar-item running \${isActive ? 'active' : ''}\`, onClick: () => onAppClick(appId), "aria-label": appDef.name, }, e(appDef.icon))
        ),
        e('div', { className: 'system-tray' },
            e('div', { className: 'system-tray-time' }, time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
            e('button', { className: 'taskbar-item', onClick: onControlCenterClick, "aria-label": "Control Center" }, e(Icons.Wifi))
        )
    );
};

const StartMenu = ({ onAppClick, isVisible }: {onAppClick: (appId: string) => void, isVisible: boolean}) => {
    const { kernel } = useOS();
    const desktopNode = kernel.vfs.getVFSNodeByPath(\`/home/\${kernel.settings.username}/Desktop\`);
    const desktopApps = desktopNode?.children?.filter(c => c.name.endsWith('.desktop')).map(c => {
         const nameMatch = c.content?.match(/Name=(.*)/);
         const iconMatch = c.content?.match(/Icon=(.*)/);
         return { id: c.path, name: nameMatch ? nameMatch[1].trim() : c.name.replace(/\\.desktop$/, ''), icon: STATIC_ICONS[iconMatch?.[1].trim() as string] || Icons.DesktopFile, }
    }) || [];
    const uniqueApps = desktopApps.filter((app, index, self) => index === self.findIndex((t) => t.name === app.name));
    if (!isVisible) return null;
    return e('div', { className: 'start-menu-container from-center' },
        e('div', { className: 'start-menu' },
            e('h3', null, 'All Apps'),
            e('div', { className: 'app-grid' },
                uniqueApps.sort((a,b) => a.name.localeCompare(b.name)).map(app => e('div', { key: app.id, className: 'app-item', onClick: () => onAppClick(app.id) }, e(app.icon), e('span', null, app.name)))
            )
        )
    );
};

const ControlCenter = ({ isVisible, onSignOut }: {isVisible: boolean, onSignOut: () => void}) => {
    const { kernel } = useOS();
    const [volume, setVolume] = React.useState(75);
    if (!isVisible) return null;

    const handleThemeChange = (theme: 'light' | 'dark') => {
        kernel._syscall_handler(SYSCALL_OPCODES.SETTINGS_SET, kernel.memoryManager.alloc({ key: 'theme', value: theme }), {} as Process);
    };

    const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        kernel._syscall_handler(SYSCALL_OPCODES.SETTINGS_SET, kernel.memoryManager.alloc({ key: 'brightness', value: parseInt(e.target.value, 10) }), {} as Process);
    };

    return e('div', { className: 'control-center-container' },
        e('div', { className: 'control-center' },
            e('div', { className: 'control-section' },
                e('div', { className: 'control-slider-group' }, e(Icons.Brightness, {}), e('input', { type: 'range', min: '15', max: '100', value: kernel.settings.brightness, onChange: handleBrightnessChange, className: 'control-slider' })),
                e('div', { className: 'control-slider-group' }, e(Icons.Volume, {}), e('input', { type: 'range', min: '0', max: '100', value: volume, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseInt(e.target.value, 10)), className: 'control-slider' }))
            ),
            e('div', { className: 'control-section-divider' }),
            e('div', { className: 'control-section' }, e('div', { className: 'control-button-group' }, e('button', { className: \`control-button \${kernel.settings.theme === 'light' ? 'active' : ''}\`, onClick: () => handleThemeChange('light') }, e(Icons.Theme, {}), 'Light'), e('button', { className: \`control-button \${kernel.settings.theme === 'dark' ? 'active' : ''}\`, onClick: () => handleThemeChange('dark') }, e(Icons.Theme, {}), 'Dark'))),
            e('div', { className: 'control-section-divider' }),
            e('div', { className: 'control-user-section' },
                e('div', { className: 'control-user-info' }, e(Icons.User, { className: 'control-user-avatar' }), e('span', { className: 'control-user-name' }, kernel.settings.username)),
                e('button', { className: 'control-signout-btn', onClick: onSignOut, title: 'Sign Out' }, e(Icons.SignOut, {}))
            )
        )
    );
};

const ContextMenu = ({ menu, onSelect }: {menu: any, onSelect: (action: any) => void}) => {
    if (!menu) return null;
    return e('div', { className: 'context-menu', style: { top: menu.y, left: menu.x } },
        menu.items.map((item: any, index: number) => e('div', { key: index, className: \`context-menu-item \${item.disabled ? 'disabled' : ''}\`, onClick: () => !item.disabled && onSelect(item.action) }, item.label))
    );
};
`,
    WAP_RUNNER: `
// This file contains the component responsible for running WAP applications in an iframe.
const WapRunner: React.FC<{ process: Process }> = ({ process: osProcess }) => {
    const { kernel } = useOS();
    const [htmlContent, setHtmlContent] = React.useState('<body>Loading app...</body>');
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { theme } = kernel.settings;

    React.useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow || event.data?.type !== '__kernel_api_call__') {
                return;
            }
            const { id, opcode, payload } = event.data;
            const argsPtr = kernel.memoryManager.alloc(payload);
            try {
                const result = await kernel._syscall_handler(opcode, argsPtr, osProcess);
                let transferableResult: any = result;
                if (result instanceof Uint8Array) {
                    transferableResult = { type: 'Buffer', data: Array.from(result) };
                }
                iframeRef.current?.contentWindow?.postMessage({ id, result: transferableResult }, '*');
            } catch (err) {
                const error = err instanceof Error ? err.message : String(err);
                iframeRef.current?.contentWindow?.postMessage({ id, error }, '*');
            } finally {
                kernel.memoryManager.free(argsPtr);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [kernel, osProcess]);
    
    React.useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: '__theme_change__', theme }, '*');
        }
    }, [theme]);

    React.useEffect(() => {
        const loadApp = async () => {
            if (!osProcess.appId) {
                setHtmlContent('<body>Error: No file path specified.</body>');
                return;
            }
            try {
                const cssText = await fetch('/index.css').then(res => res.ok ? res.text() : '');
                const styleTag = \`<style>\${cssText}</style>\`;
                const ino = kernel.vfs.pathToInodeNum(osProcess.appId);
                if (!ino) throw new Error('File not found in VFS.');
                
                const fileBytes = kernel.vfs.readFileBytesByInode(ino);
                const zip = await JSZip.loadAsync(fileBytes);
                const indexFile = zip.file('index.html');
                
                if (!indexFile) throw new Error('index.html not found in package.');
                let content = await indexFile.async('string');
                
                if (osProcess.driverStatus === 'enabled') {
                    const driverIno = kernel.vfs.pathToInodeNum('/lib/drivers/babylon.drv');
                    if (driverIno) {
                        const driverCode = kernel.vfs.readFileContentByInode(driverIno);
                        content = content.replace(/<body([^>]*)>/, \`<body$1><script>\${driverCode}</script>\`);
                    }
                }
                content = content.replace('</head>', \`\${styleTag}</head>\`);
                setHtmlContent(content);
            } catch (err) {
                console.error("Error loading WAP:", err);
                setHtmlContent(\`<body>Error loading application: \${(err as Error).message}</body>\`);
            }
        };
        loadApp();
    }, [osProcess.appId, osProcess.driverStatus, kernel]);
    
    React.useEffect(() => {
        if(iframeRef.current) {
            iframeRef.current.onload = () => {
                iframeRef.current?.contentWindow?.postMessage({ type: '__init__', args: { filePath: osProcess.filePath } }, '*');
            };
        }
    }, [htmlContent, osProcess.filePath]);

    return e('div', { className: 'wap-runner-container' },
        osProcess.driverStatus === 'disabled' && e('div', { className: 'driver-warning', title: 'High-performance driver not found. Run "apt-get install babylon.drv" in the terminal.' },
            e(Icons.Biohazard, { className: 'driver-warning-icon' })
        ),
        e('iframe', {
            ref: iframeRef,
            className: 'wap-runner-iframe',
            srcDoc: htmlContent,
            sandbox: 'allow-scripts allow-same-origin allow-forms'
        })
    );
};
`,
    LOGIN: `
// This file contains the code for the Login screen and GRUB bootloader UI.
const LoginScreen = ({ onLogin, wallpaper, username }: {onLogin: () => void, wallpaper: string, username: string}) => {
    return e('div', { className: 'login-screen', style: { backgroundImage: \`url(\${wallpaper})\` } },
        e('div', { className: 'login-overlay' }),
        e('div', { className: 'login-box' },
            e('div', { className: 'login-avatar' }, e(Icons.User, {})),
            e('div', { className: 'login-user' }, username),
            e('button', { className: 'login-button', onClick: () => onLogin()}, 'Sign In')
        )
    );
};

const GrubScreen: React.FC<{ onBoot: () => void, grubConfig: {timeout: number, entries: string[]} }> = ({ onBoot, grubConfig }) => {
    const [countdown, setCountdown] = React.useState(grubConfig.timeout || 5);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onBoot();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                clearInterval(timer);
                onBoot();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            clearInterval(timer);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [onBoot]);

    return e('div', { className: 'grub-screen' },
        e('div', { className: 'grub-box' },
            e('p', null, 'GNU GRUB version 2.04'),
            e('div', { className: 'grub-menu' },
                grubConfig.entries.map((entry, index) => e('div', { key: index, className: 'grub-menu-item active' }, entry))
            ),
            e('p', null, 'Use the ↑ and ↓ keys to select which entry is highlighted.'),
            e('p', null, \`Booting in \${countdown} seconds... Press ENTER to boot immediately.\`)
        )
    );
};
`,
    APP: `
// This is the main application component. It manages the boot state and renders the appropriate UI.
const App = () => {
    const [bootState, setBootState] = React.useState<'bios' | 'grub' | 'loading' | 'login' | 'desktop'>('bios');
    const [os, setOS] = React.useState<{ kernel: Kernel | null; deviceDriver: DeviceDriver | null }>({ kernel: null, deviceDriver: null });
    const [loadingMessages, setLoadingMessages] = React.useState<string[]>(['[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x0000000001800000] usable']);
    const [grubConfig, setGrubConfig] = React.useState<{timeout: number, entries: string[]}>({ timeout: 5, entries: [] });
    
    React.useEffect(() => {
        if (bootState === 'bios') {
            const timer = setTimeout(() => {
                setLoadingMessages(prev => [...prev, '[    0.000101] BIOS-provided physical RAM map:']);
                 setTimeout(() => {
                    // Pre-kernel bootloader step: parse GRUB config
                    const timeoutMatch = OS_SOURCE_CODE.GRUB_CFG.match(/set timeout=(\\d+)/);
                    const entries: string[] = [];
                    const entryRegex = /menuentry "([^"]+)"/g;
                    let match;
                    while ((match = entryRegex.exec(OS_SOURCE_CODE.GRUB_CFG)) !== null) {
                        entries.push(match[1]);
                    }
                    setGrubConfig({
                        timeout: timeoutMatch ? parseInt(timeoutMatch[1], 10) : 5,
                        entries: entries.length > 0 ? entries : ['Winux OS 3.0.0 (Kernel 3.0.0-winux)'],
                    });
                    setBootState('grub');
                }, 1500);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [bootState]);

    const handleBoot = React.useCallback(() => {
        setBootState('loading');
        
        const initOS = async () => {
            let messages: string[] = [];
            const addMessage = (msg: string, delay: number = 50) => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        messages = [...messages, msg];
                        setLoadingMessages([...messages]);
                        resolve(true);
                    }, delay);
                });
            };

            try {
                await addMessage(\`[    0.151321] GRUB: Loading config from /boot/grub/grub.cfg... Done.\`);
                await addMessage(\`[    0.158482] GRUB: Loading kernel /boot/vmlinuz-3.0.0-winux...\`);
                await addMessage(\`[    0.162215] GRUB: Loading initial ramdisk /boot/initrd-3.0.0-winux...\`, 200);
                await addMessage('[    0.210000] Uncompressing Winux... done, booting the kernel.', 300);

                const deviceDriver = new DeviceDriver();
                await addMessage('[    0.342199] virtio_mmio: Probing for system memory...', 100);
                await deviceDriver.init();
                
                let systemMemory = await deviceDriver.getSystemMemory();
                if (!systemMemory) {
                    await addMessage('[    0.413371] No persistent memory found. Allocating new RAM disk.', 100);
                    systemMemory = deviceDriver.createInitialMemory();
                    await deviceDriver.saveSystemMemory(systemMemory);
                } else {
                    await addMessage('[    0.413371] Persistent memory found and loaded.', 100);
                }

                if (!systemMemory) {
                     throw new Error("Failed to create or load system memory.");
                }

                await addMessage('[    0.501112] Kernel: Initializing...', 150);
                const kernel = new Kernel(systemMemory);
                
                await addMessage('[    0.623456] VFS: Mounting root (vfs filesystem) on /dev/ram0...', 100);
                await kernel.bootstrap();
                setOS({ kernel, deviceDriver });
                
                await addMessage('[    0.783456] systemd[1]: Winux OS starting up...');
                await addMessage('[    0.852199] systemd[1]: Initializing drivers...');
                await addMessage('[    0.891234] systemd[1]: Starting Login Manager...', 200);
                document.body.className = kernel.settings.theme === 'dark' ? 'dark-theme' : '';
                
                setTimeout(() => setBootState('login'), 1000);

            } catch (error) {
                console.error("Boot failed:", error);
                const bsod = document.createElement('div');
                bsod.className = 'bsod';
                bsod.innerHTML = \`<h1>:(</h1><p>A fatal error occurred during boot.</p><div class="bsod-details">Stop code: KERNEL_INIT_FAILURE<br/>Details: \${(error as Error).message}</div>\`;
                document.body.innerHTML = '';
                document.body.appendChild(bsod);
                document.body.style.backgroundColor = '#0078d4';
            }
        };

        initOS();
    }, []);
    
    if (bootState === 'bios' || bootState === 'loading' || !os.kernel && bootState !== 'grub') {
        return e(LoadingScreen, { messages: loadingMessages });
    }
    
    if (bootState === 'grub') {
        return e(GrubScreen, { onBoot: handleBoot, grubConfig });
    }

    return e(OSContext.Provider, { value: { kernel: os.kernel, deviceDriver: os.deviceDriver } },
        bootState === 'login' ? e(LoginScreen, { onLogin: () => setBootState('desktop'), wallpaper: os.kernel.settings.wallpaper, username: os.kernel.settings.username }) :
        e(WinuxOS, { onSignOut: () => setBootState('login') })
    );
};
`,
};

ReactDOM.createRoot(document.getElementById('root')!).render(e(App));
