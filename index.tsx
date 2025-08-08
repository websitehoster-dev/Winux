/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat as GenAIChat } from "@google/genai";
import { marked } from 'marked';
import JSZip from 'jszip';

// Since we can't use JSX syntax directly without a build step in this environment,
// we use React.createElement. The logic remains the same.
const e = React.createElement;

// --- ICONS ---
const Icons = {
  WinuxLogo: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 100 100', fill: 'currentColor' }, e('path', { d: 'M0 0 H48 V48 H0z M52 0 H100 V48 H52z M0 52 H48 V100 H0z M52 52 H100 V100 H52z' })),
  Start: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M4 4h6v6H4zm0 8h6v6H4zm8-8h6v6h-6zm0 8h6v6h-6z' })),
  FileExplorer: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.11-.9-2-2h-8l-2-2z' })),
  Terminal: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M6.29 7.71L10.59 12l-4.3 4.29L7.71 17.7l5.71-5.71-5.71-5.71L6.29 7.71zM14 6h6v2h-6V6z' })),
  Browser: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93L15.87 5c-1.33-.44-2.84-.7-4.37-.7-1.53 0-3.04.26-4.37.7L8.13 6.07C9 5.61 9.97 5.29 11 5.14V4.07zM12 12h8.93c-.49 3.95-3.85 7-7.93 7s-7.44-3.05-7.93-7H12z' })),
  Settings: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49 1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l-.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23-.09.49 0-.61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z' })),
  AIAssistant: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM15.41 16.59L14 18l-6-6 6-6 1.41 1.41L10.83 12l4.58 4.59z' })), // A placeholder icon
  Folder: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 24 24" }, e('path', { d: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2h-8l-2-2z' })),
  File: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 24 24" }, e('path', { d: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z' })),
  DesktopFile: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 24 24" }, e('path', { d: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 8h-2v-2h2v2zm0-4h-2V4h2v2z' })), // Icon for .desktop files
  Biohazard: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M14.68,14.24,12,18,9.32,14.24,6,15.39,6.54,12,6,8.61,9.32,9.76,12,6,14.68,9.76,18,8.61,17.46,12,18,15.39ZM12,2a10,10,0,1,0,10,10A10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z' })),
  Minimize: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 10 1" }, e('path', { d: 'M0,0H10V1H0z' })),
  Maximize: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 10 10" }, e('path', { d: 'M0,0H10V10H0V0ZM1,1V9H9V1H1Z' })),
  Restore: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 10 10" }, e('path', { d: 'M2,0H10V8H8V10H0V2H2V0ZM3,1V2H8V7H9V1H3ZM1,3V9H7V3H1Z' })),
  Close: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', fill: "currentColor", viewBox: "0 0 10 10" }, e('path', { d: 'M1.41 0L5 3.59L8.59 0L10 1.41L6.41 5L10 8.59L8.59 10L5 6.41L1.41 10L0 8.59L3.59 5L0 1.41Z' })),
  TextEditor: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' })),
  Back: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' })),
  Forward: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' })),
  Home: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' })),
  Refresh: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' })),
  Up: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' })),
  Avatar: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' })),
  Power: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z' })),
  Search: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' })),
  Brightness: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { fill: 'currentColor', d: 'M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z' })),
  Theme: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { fill: 'currentColor', d: 'M12 3a9 9 0 0 0 0 18a9 9 0 0 0 0-18zM12 19a7 7 0 0 1 0-14v14z' })),
  About: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24' }, e('path', { fill: 'currentColor', d: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' })),
  Trash: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' })),
  Send: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' })),
  User: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' })),
  Wifi: (props: React.SVGProps<SVGSVGElement>) => e('svg', { ...props, viewBox: '0 0 24 24', fill: 'currentColor' }, e('path', { d: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C19.73 3.73 8.27 3.73 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zM5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z' })),
};

const BUILT_IN_APPS: Record<string, AppDefinition> = {
  FileExplorer: { name: 'File Explorer', icon: Icons.FileExplorer, component: (props) => e(FileExplorer, props) },
  Terminal: { name: 'Terminal', icon: Icons.Terminal, component: (props) => e(Terminal, props) },
  Browser: { name: 'Browser', icon: Icons.Browser, component: (props) => e(Browser, props) },
  Settings: { name: 'Settings', icon: Icons.Settings, component: (props) => e(Settings, props) },
  AIAssistant: { name: 'AI Assistant', icon: Icons.AIAssistant, component: (props) => e(AIAssistant, props) },
  TextEditor: { name: 'Text Editor', icon: Icons.TextEditor, component: (props) => e(TextEditor, props) },
  KernelMeltdown: { name: 'Kernel Meltdown', icon: Icons.Biohazard, component: (props) => e(KernelMeltdown, props) },
};

const BABYLON_DRIVER_CODE = `
(() => {
    const pending_requests = new Map();
    let request_id_counter = 0;

    window.addEventListener('message', (event) => {
        const { id, result, error } = event.data;
        if (pending_requests.has(id)) {
            const { resolve, reject } = pending_requests.get(id);
            if (error) {
                reject(new Error(error));
            } else {
                // Convert ArrayBuffer-like objects back to Uint8Array
                if (result && typeof result === 'object' && result.type === 'Buffer' && Array.isArray(result.data)) {
                   resolve(new Uint8Array(result.data));
                } else {
                   resolve(result);
                }
            }
            pending_requests.delete(id);
        }
    });

    function __kernel_api_call__(action, payload) {
        return new Promise((resolve, reject) => {
            const id = request_id_counter++;
            pending_requests.set(id, { resolve, reject });
            window.parent.postMessage({
                type: '__kernel_api_call__',
                id,
                action,
                payload,
            }, '*');
        });
    }

    window.WinuxDriver = {
        fs: {
            readFile: (path) => {
                return __kernel_api_call__('fs:readFile', { path });
            },
            writeFile: (path, data) => {
                let payloadData;
                // Convert ArrayBuffer or Uint8Array to a serializable format
                if (data instanceof ArrayBuffer) {
                    payloadData = Array.from(new Uint8Array(data));
                } else if (data instanceof Uint8Array) {
                     payloadData = Array.from(data);
                } else {
                    payloadData = data; // Assume string
                }
                return __kernel_api_call__('fs:writeFile', { path, data: payloadData });
            },
            readDir: (path) => {
                return __kernel_api_call__('fs:readDir', { path });
            },
        }
    };
})();
`;

// --- Low Level Device & VFS ---

// VFS Constants
const INODE_MODE_FILE = 0o100644;
const INODE_MODE_DIR = 0o040755;
const INODE_TYPE_FILE = 1;
const INODE_TYPE_DIR = 2;
const INODE_STRUCT_SIZE = 32; // ino, mode, nlink, size, mtime, first_block
const DIRENT_STRUCT_SIZE = 32; // ino, type, name (24 bytes)
const BLOCK_SIZE = 512;
const BLOCK_DATA_SIZE = BLOCK_SIZE - 4; // Reserve 4 bytes for next block pointer
const ROOT_INODE_NUM = 2;
const DEVICE_SIZE_MB = 16;
const DEVICE_SIZE_BYTES = DEVICE_SIZE_MB * 1024 * 1024;
const NUM_BLOCKS = Math.floor(DEVICE_SIZE_BYTES / BLOCK_SIZE);
const DB_NAME = 'WinuxDeviceDB';
const DB_STORE_NAME = 'device_blocks';
const SUPERBLOCK_SIZE = 128;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class DeviceManager {
    private db: IDBDatabase | null = null;
    public deviceBuffer: ArrayBuffer | null = null;
    public view: DataView | null = null;

    constructor() {}

    async init() {
        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onerror = () => reject("Error opening DB");
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                db.createObjectStore(DB_STORE_NAME);
            };
        });
    }

    async getDeviceBuffer() {
        return new Promise<ArrayBuffer | null>((resolve, reject) => {
            if (!this.db) return reject("DB not initialized");
            const transaction = this.db.transaction([DB_STORE_NAME], 'readonly');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.get('main_device');
            request.onerror = () => reject("Error reading from DB");
            request.onsuccess = () => {
                if (request.result) {
                    this.deviceBuffer = request.result;
                    this.view = new DataView(this.deviceBuffer!);
                }
                resolve(request.result || null);
            };
        });
    }

    async saveDeviceBuffer() {
        if (!this.db || !this.deviceBuffer) return;
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction([DB_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(DB_STORE_NAME);
            const request = store.put(this.deviceBuffer, 'main_device');
            request.onerror = () => reject("Error writing to DB");
            request.onsuccess = () => resolve();
        });
    }

    createInitialDevice() {
        this.deviceBuffer = new ArrayBuffer(DEVICE_SIZE_BYTES);
        this.view = new DataView(this.deviceBuffer);
        return this.saveDeviceBuffer();
    }
}

class WasmKernel {
    private memory: ArrayBuffer;
    private view: DataView;
    private subscribers: Set<() => void> = new Set();
    private processPtrs: Map<number, number> = new Map();
    private focusStack: number[] = [];
    private nextProcessId = 1;

    // VFS State
    private inodeTablePtr: number;
    private dataBlocksPtr: number;
    private freeBlockListPtr: number;
    private nextInodeNum = ROOT_INODE_NUM;
    private inodeMap: Map<number, number> = new Map(); // ino -> pointer
    private pathCache: Map<string, number> = new Map(); // path -> ino

    public settings: {
        theme: 'light' | 'dark',
        wallpaper: string,
        brightness: number,
        username: string,
    };
    public apps: Record<string, AppDefinition>;

    constructor(deviceBuffer: ArrayBuffer) {
        this.memory = deviceBuffer;
        this.view = new DataView(this.memory);

        // Settings are stored globally for now, not in the VFS
        this.settings = {
            theme: 'dark',
            wallpaper: `https://source.unsplash.com/random/1920x1080?nature,water`,
            brightness: 100,
            username: "winux",
        };

        this.apps = {...BUILT_IN_APPS};

        const magic = this.view.getUint32(0, true);
        if (magic !== 0xEF53) { // ext4 magic number
             this.formatExt4();
        } else {
             this.loadExt4();
        }
    }

    // --- Subscription System ---
    subscribe = (callback: () => void) => { this.subscribers.add(callback); return () => this.unsubscribe(callback); }
    private unsubscribe = (callback: () => void) => { this.subscribers.delete(callback); }
    public notify = () => { this.subscribers.forEach(cb => cb()); }

    // --- VFS (ext4 simulation) ---
    private writeString(str: string, ptr: number, maxLength: number) {
        const data = encoder.encode(str);
        const length = Math.min(data.length, maxLength);
        for (let i = 0; i < length; i++) {
            this.view.setUint8(ptr + i, data[i]);
        }
        if (length < maxLength) this.view.setUint8(ptr + length, 0);
    }

    private writeBytes(bytes: Uint8Array, ptr: number) {
        new Uint8Array(this.memory).set(bytes, ptr);
    }

    private readString(ptr: number, maxLength: number): string {
        const bytes = [];
        for (let i = 0; i < maxLength; i++) {
            const byte = this.view.getUint8(ptr + i);
            if (byte === 0) break;
            bytes.push(byte);
        }
        return decoder.decode(new Uint8Array(bytes));
    }

     private readBytes(ptr: number, length: number): Uint8Array {
        return new Uint8Array(this.memory.slice(ptr, ptr + length));
    }

    private loadExt4() {
        this.inodeTablePtr = this.view.getUint32(4, true);
        this.dataBlocksPtr = this.view.getUint32(8, true);
        this.nextInodeNum = this.view.getUint32(12, true);
        this.freeBlockListPtr = this.view.getUint32(16, true);
        this.loadApps();

        for(let ino = ROOT_INODE_NUM; ino < this.nextInodeNum; ino++) {
             const ptr = this.inodeTablePtr + ((ino - ROOT_INODE_NUM) * INODE_STRUCT_SIZE);
             this.inodeMap.set(ino, ptr);
        }
    }

    private formatExt4() {
        new Uint8Array(this.memory).fill(0);
        this.view.setUint32(0, 0xEF53, true); // ext4 magic number

        const inodeTableSize = INODE_STRUCT_SIZE * 512; // Reserve for 512 inodes
        this.inodeTablePtr = SUPERBLOCK_SIZE;
        this.dataBlocksPtr = this.inodeTablePtr + inodeTableSize;
        const numDataBlocks = Math.floor((DEVICE_SIZE_BYTES - this.dataBlocksPtr) / BLOCK_SIZE);

        this.view.setUint32(4, this.inodeTablePtr, true);
        this.view.setUint32(8, this.dataBlocksPtr, true);
        
        // Initialize free block list
        this.freeBlockListPtr = 1;
        for (let i = 1; i < numDataBlocks; i++) {
            const blockPtr = this.getBlockPtr(i);
            this.view.setUint32(blockPtr + BLOCK_DATA_SIZE, i + 1, true); // Point to next free block
        }
        this.view.setUint32(this.getBlockPtr(numDataBlocks) + BLOCK_DATA_SIZE, 0, true); // End of list

        const rootIno = this.allocInode(INODE_MODE_DIR);
        if (rootIno !== ROOT_INODE_NUM) throw new Error("Root inode must be 2");
        this.pathCache.set('/', rootIno);

        // Create default Linux directories
        const homeIno = this.createDir(rootIno, 'home');
        const userHomeIno = this.createDir(homeIno, this.settings.username);
        this.createDir(userHomeIno, 'Desktop');
        this.createDir(userHomeIno, 'Documents');
        this.createDir(userHomeIno, 'Downloads');
        
        const usrIno = this.createDir(rootIno, 'usr');
        this.createDir(usrIno, 'apps');
        this.createDir(usrIno, 'drivers');

        const devIno = this.createDir(rootIno, 'dev');
        const devBlockIno = this.createDir(devIno, 'block');

        // Create device file
        const deviceFileInfo = `Device: /dev/block/sda\nType: IndexedDB Block Device\nSize: ${DEVICE_SIZE_MB} MB\nBlock Size: ${BLOCK_SIZE} Bytes\nTotal Blocks: ${NUM_BLOCKS}\n`;
        this.createFile(devBlockIno, 'sda', deviceFileInfo);
        
        const readmeIno = this.createFile(userHomeIno, 'readme.txt', 'Welcome to your new home directory!');
        
        this.persistSuperblock();
        this.notify();
    }

    private persistSuperblock() {
        this.view.setUint32(12, this.nextInodeNum, true);
        this.view.setUint32(16, this.freeBlockListPtr, true);
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
             this.triggerBSOD('OUT_OF_DISK_SPACE');
             throw new Error('Out of disk space');
        }
        const newBlockNum = this.freeBlockListPtr;
        const newBlockPtr = this.getBlockPtr(newBlockNum);
        this.freeBlockListPtr = this.view.getUint32(newBlockPtr + BLOCK_DATA_SIZE, true);
        
        // Clear the block before use
        new Uint8Array(this.memory, newBlockPtr, BLOCK_SIZE).fill(0);

        this.persistSuperblock();
        return newBlockNum;
    }
    
    private freeBlockChain(firstBlockNum: number) {
        let currentBlockNum = firstBlockNum;
        while(currentBlockNum !== 0) {
            const blockPtr = this.getBlockPtr(currentBlockNum);
            const nextBlockNum = this.view.getUint32(blockPtr + BLOCK_DATA_SIZE, true);
            // Prepend to free list
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
        
        // Find an empty slot in the directory's block chain
        while(blockNum !== 0) {
            const blockPtr = this.getBlockPtr(blockNum);
            for (let i = 0; i < BLOCK_DATA_SIZE; i += DIRENT_STRUCT_SIZE) {
                const entryIno = this.view.getUint32(blockPtr + i, true);
                if (entryIno === 0) { // Found empty slot
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

        // No empty slot found, allocate a new block
        const newBlockNum = this.allocBlock();
        const lastBlockPtr = this.getBlockPtr(lastBlockNum);
        this.view.setUint32(lastBlockPtr + BLOCK_DATA_SIZE, newBlockNum, true); // Link previous block to new one
        
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

    public createFile(parentIno: number, name: string, content: string | Uint8Array): number {
        const newIno = this.allocInode(INODE_MODE_FILE);
        this.addDirent(parentIno, { ino: newIno, name, type: INODE_TYPE_FILE });
        this.updateFileContentByInode(newIno, content);
        return newIno;
    }

    resolvePath = (path: string, cwd: string = '/'): string => {
        if (typeof path !== 'string' || path === '') return cwd;

        const homeDir = `/home/${this.settings.username}`;
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
                    if (entryIno === 0) continue; // Skip empty slots
                    
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
                       node.children.push({ino: childIno, name: childName, type: childType, path: childPath});
                    }
                 }
                 blockNum = this.view.getUint32(blockPtr + BLOCK_DATA_SIZE, true);
            }
        } else { // File
             try {
                node.content = this.readFileContentByInode(inode.ino);
            } catch {
                node.content = "[Binary File]";
            }
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

    readFileContentByInode = (ino: number): string => {
        const bytes = this.readFileBytesByInode(ino);
        return decoder.decode(bytes);
    }

    updateFileContentByInode = (ino: number, content: string | Uint8Array) => {
        const inode = this.readInode(ino);
        if (!inode || inode.type !== 'file') return false;

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
                    const prevBlockPtr = this.getBlockPtr(currentBlockNum);
                    this.view.setUint32(prevBlockPtr + BLOCK_DATA_SIZE, newBlockNum, true);
                }

                const blockPtr = this.getBlockPtr(newBlockNum);
                const chunk = bytes.subarray(bytesWritten, bytesWritten + BLOCK_DATA_SIZE);
                this.writeBytes(chunk, blockPtr);
                bytesWritten += chunk.length;
                currentBlockNum = newBlockNum;
            }
        }

        this.writeInode(ino, { size: bytes.length, mtime: Date.now(), firstBlock: firstBlockNum });
        this.persistSuperblock();
        this.notify();
        return true;
    }

    async installWap(data: Uint8Array, filename: string) {
        const appsDirIno = this.pathToInodeNum('/usr/apps');
        if (!appsDirIno) {
            this.triggerBSOD('MISSING_SYSTEM_FOLDER: /usr/apps');
            return;
        }
        this.createFile(appsDirIno, filename, data);
        const wapPath = `/usr/apps/${filename}`;

        const zip = await JSZip.loadAsync(data);
        const manifestFile = zip.file('manifest.json');
        if (!manifestFile) {
            console.error('WAP install failed: manifest.json not found in', filename);
            return;
        }
        const manifestContent = await manifestFile.async('string');
        const manifest = JSON.parse(manifestContent);
        
        // Register app internally
        this.apps[wapPath] = {
            id: wapPath,
            name: manifest.name,
            icon: Icons.File, // Default icon, can be overridden by manifest later
        };

        // Create .desktop shortcut file
        const desktopDirIno = this.pathToInodeNum(`/home/${this.settings.username}/Desktop`);
        if (desktopDirIno) {
            const shortcutContent = `[Desktop Entry]\nName=${manifest.name}\nExec=${wapPath}\nIcon=default`;
            this.createFile(desktopDirIno, `${manifest.name}.desktop`, shortcutContent);
        }
        
        this.notify();
    }
    
    async loadApps() {
        const appsDir = this.getVFSNodeByPath('/usr/apps');
        if (appsDir && appsDir.children) {
            for (const appFile of appsDir.children) {
                if (appFile.path.endsWith('.wap')) {
                    try {
                        const data = this.readFileBytesByInode(appFile.ino);
                        const zip = await JSZip.loadAsync(data);
                        const manifestFile = zip.file('manifest.json');
                        if (manifestFile) {
                            const manifest = JSON.parse(await manifestFile.async('string'));
                            this.apps[appFile.path] = { id: appFile.path, name: manifest.name, icon: Icons.File };
                        }
                    } catch(e) {
                        console.error(`Failed to load WAP: ${appFile.path}`, e);
                    }
                }
            }
        }
    }

    installFeature(featureName: string): string {
        if (featureName === 'babylongamedriver') {
            const driversDirIno = this.pathToInodeNum('/usr/drivers');
            if (!driversDirIno) {
                return "Error: System directory /usr/drivers not found.";
            }
            if (this.pathToInodeNum('/usr/drivers/babylongamedriver.drv')) {
                return "babylongamedriver is already installed.";
            }
            this.createFile(driversDirIno, 'babylongamedriver.drv', BABYLON_DRIVER_CODE);
            this.notify();
            return "Successfully installed babylongamedriver.";
        }
        return `Error: Unknown feature '${featureName}'.`;
    }

    async _handleApiCall(action: string, payload: any, process: Process) {
        const cwd = `/home/${this.settings.username}`;

        switch (action) {
            case 'fs:readFile': {
                const { path } = payload;
                if (!path) throw new Error("Path is required for readFile");
                const ino = this.pathToInodeNum(path, cwd);
                if (!ino) throw new Error(`File not found: ${path}`);
                const inode = this.readInode(ino);
                if (!inode || inode.type !== 'file') throw new Error(`${path} is not a file.`);
                return this.readFileBytesByInode(ino);
            }
            case 'fs:writeFile': {
                const { path, data } = payload;
                if (!path || data === undefined) throw new Error("Path and data are required for writeFile");
                
                const content: string | Uint8Array = Array.isArray(data) ? new Uint8Array(data) : data;

                const resolvedPath = this.resolvePath(path, cwd);
                const parentPath = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';
                const filename = resolvedPath.split('/').pop();
                
                if(!filename) throw new Error('Invalid file path for writing');

                const parentIno = this.pathToInodeNum(parentPath);
                if(!parentIno) throw new Error(`Directory not found: ${parentPath}`);

                const existingFileIno = this.pathToInodeNum(resolvedPath);
                if (existingFileIno) {
                    this.updateFileContentByInode(existingFileIno, content);
                } else {
                    this.createFile(parentIno, filename, content);
                }
                return true;
            }
            case 'fs:readDir': {
                const { path } = payload;
                if (!path) throw new Error("Path is required for readDir");
                const node = this.getVFSNodeByPath(path, cwd);
                if (!node || node.type !== 'directory') throw new Error(`Directory not found or not a directory: ${path}`);
                return node.children?.map(c => ({ name: c.name, type: c.type })) || [];
            }
            default:
                throw new Error(`Unknown kernel API action: ${action}`);
        }
    }


    getAppDefinition(appId: string): AppDefinition | null {
        return this.apps[appId] || null;
    }
    
    getAvailableApps(): (AppDefinition & {id: string})[] {
        return Object.entries(this.apps).map(([id, app]) => ({...app, id}));
    }

    getProcessIds = (): number[] => Array.from(this.processPtrs.keys());

    getProcessInfo = (pid: number): Process | null => {
        return (window as any).__processes[pid];
    }
    
    openProcess = async (appId: string, options: { filePath?: string } = {}) => {
        const id = this.nextProcessId++;
        
        let appDef = this.getAppDefinition(appId);
        let titleStr = appDef ? appDef.name : "Unknown App";
        let filePathStr = options.filePath || "";
        let driverStatus: Process['driverStatus'] = 'not_required';
        let finalAppId = appId;
        
        if (appId.endsWith('.desktop')) {
            const desktopFileContent = this.readFileContentByInode(this.pathToInodeNum(appId)!);
            const execMatch = desktopFileContent.match(/Exec=(.*)/);
            if (execMatch && execMatch[1]) {
                 finalAppId = execMatch[1].trim(); // This is the .wap path
                 appDef = this.getAppDefinition(finalAppId);
                 titleStr = appDef?.name || "App";
            }
        }

        if (filePathStr) {
             const node = this.getVFSNodeByPath(filePathStr);
             if (node) titleStr = node.name;
        } else if (finalAppId.endsWith('.wap')) {
            filePathStr = finalAppId;
        }

        // Driver check logic for WAPs
        if (finalAppId.endsWith('.wap')) {
            const ino = this.pathToInodeNum(finalAppId);
            if (ino) {
                try {
                    const fileBytes = this.readFileBytesByInode(ino);
                    const zip = await JSZip.loadAsync(fileBytes);
                    const manifestFile = zip.file('manifest.json');
                    if (manifestFile) {
                        const manifest = JSON.parse(await manifestFile.async('string'));
                        if (manifest.driver === 'babylonjs') {
                            const driverPath = '/usr/drivers/babylongamedriver.drv';
                            driverStatus = this.pathToInodeNum(driverPath) ? 'enabled' : 'disabled';
                        }
                    }
                } catch (e) {
                    console.error("Failed to check WAP manifest for driver:", e);
                }
            }
        }
        
        appDef = this.getAppDefinition(finalAppId);
        if (!appDef && !finalAppId.endsWith('.wap')) {
             console.error(`No app definition found for ${finalAppId}`);
             return null;
        }

        if (!(window as any).__processes) (window as any).__processes = {};
        (window as any).__processes[id] = {
            id, appId: finalAppId, zIndex: 1000 + id,
            x: 50 + (id % 10) * 20, y: 50 + (id % 10) * 20,
            width: 800, height: 600,
            isMaximized: false, isMinimized: false, isFocused: false,
            title: titleStr, filePath: filePathStr, driverStatus,
        };
        this.processPtrs.set(id, id);

        this.focusProcess(id);
        this.notify();
        return id;
    };

    closeProcess = (pid: number) => {
        this.processPtrs.delete(pid);
        delete (window as any).__processes[pid];
        this.focusStack = this.focusStack.filter(id => id !== pid);
        if (this.focusStack.length > 0) {
            this.focusProcess(this.focusStack[this.focusStack.length - 1]);
        }
        this.notify();
    };
    
    focusProcess = (pid: number) => {
        this.focusStack = [pid, ...this.focusStack.filter(id => id !== pid)];
        this.processPtrs.forEach((ptr, id) => {
            const process = (window as any).__processes[id];
            if(!process) return;
            process.isFocused = id === pid;
            process.zIndex = 1000 + this.focusStack.slice().reverse().indexOf(id);
            if (process.isFocused) {
               process.isMinimized = false;
            }
        });
        this.notify();
    };

    updateProcessState = (pid: number, updates: Partial<Process>) => {
        const process = (window as any).__processes[pid];
        if (!process) return;
        Object.assign(process, updates);
        
        if (updates.isMinimized) {
            const newFocusStack = this.focusStack.filter(id => id !== pid);
            if (newFocusStack.length > 0) {
                this.focusProcess(newFocusStack[0]);
            }
            this.focusStack = newFocusStack;
        }
        this.notify();
    };

    triggerBSOD = (message: string) => {
        const bsodDiv = document.createElement('div');
        bsodDiv.className = 'bsod';
        bsodDiv.innerHTML = `
            <h1>:(</h1>
            <p>Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</p>
            <div class="bsod-details">Stop code: ${message}</div>
        `;
        document.body.innerHTML = '';
        document.body.appendChild(bsodDiv);
        document.body.style.backgroundColor = '#0078d4';
    }
}

// --- React Hooks & Context ---
const OSContext = React.createContext<{ kernel: WasmKernel | null; deviceManager: DeviceManager | null }>({ kernel: null, deviceManager: null });

const useOS = () => {
    const context = React.useContext(OSContext);
    if (!context.kernel || !context.deviceManager) throw new Error('useOS must be used within an OSProvider');
    
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => {
        return context.kernel!.subscribe(() => {
            forceUpdate();
            // Debounce saving to avoid excessive writes
            const timer = setTimeout(() => context.deviceManager!.saveDeviceBuffer(), 500);
            return () => clearTimeout(timer);
        });
    }, [context.kernel, context.deviceManager]);
    
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
}
interface AppDefinition { id?: string; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; component?: React.FC<any>; }
interface Inode { ino: number; type: 'file' | 'directory'; mode: number; nlink: number; size: number; mtime: number; firstBlock: number; }
interface VFSNode { path: string; name: string; type: 'file' | 'directory'; ino: number; content?: string; children?: VFSNode[]; }
interface WindowProps { process: Process; onClose: () => void; children: React.ReactNode; }


// --- Components ---

const Window = ({ process, children, onClose }: WindowProps) => {
    const { kernel } = useOS();
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const dragOffset = React.useRef({ x: 0, y: 0 });
    
    const onMouseDown = () => kernel.focusProcess(process.id);
    const onMinimize = () => kernel.updateProcessState(process.id, { isMinimized: true });
    const onMaximize = () => kernel.updateProcessState(process.id, { isMaximized: !process.isMaximized });

    const handleDragStart = (e) => {
        if (process.isMaximized) return;
        setIsDragging(true);
        dragOffset.current = { x: e.clientX - process.x, y: e.clientY - process.y };
        e.preventDefault();
    };

    const handleResizeStart = (e) => {
        if (process.isMaximized) return;
        setIsResizing(true);
        dragOffset.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation(); e.preventDefault();
    };

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                kernel.updateProcessState(process.id, { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
            } else if (isResizing) {
                 kernel.updateProcessState(process.id, {
                    width: Math.max(250, process.width + (e.clientX - dragOffset.current.x)),
                    height: Math.max(150, process.height + (e.clientY - dragOffset.current.y))
                });
                dragOffset.current = { x: e.clientX, y: e.clientY };
            }
        };
        const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, kernel, process]);
    
    let appDef = kernel.getAppDefinition(process.appId);
    if (!appDef) {
        // Fallback for WAPs that don't have a static definition
        if (process.appId.endsWith('.wap')) {
            appDef = { name: process.title || 'Application', icon: Icons.File };
        } else {
             return null;
        }
    }

    const windowStyle = {
        top: `${process.y}px`, left: `${process.x}px`,
        width: `${process.width}px`, height: `${process.height}px`,
        zIndex: process.zIndex, display: process.isMinimized ? 'none' : 'flex',
    };
    
    return e('div', { className: `window ${process.isMaximized ? 'maximized' : ''}`, style: windowStyle, onMouseDown },
        e('div', { className: 'title-bar', onMouseDown: handleDragStart, onDoubleClick: onMaximize },
            e(appDef.icon, { className: 'icon' }),
            e('span', { className: 'title' }, process.title || appDef.name),
            e('div', { className: 'window-controls' },
                e('button', { className: 'window-control minimize', onClick: onMinimize }, e(Icons.Minimize)),
                e('button', { className: 'window-control maximize', onClick: onMaximize }, process.isMaximized ? e(Icons.Restore) : e(Icons.Maximize)),
                e('button', { className: 'window-control close', onClick: onClose }, e(Icons.Close))
            )
        ),
        e('div', { className: 'window-content' }, children),
        e('div', { className: `resize-handle ${process.isMaximized ? 'hidden' : ''}`, onMouseDown: handleResizeStart })
    );
};

const FileExplorer = ({}) => {
    const { kernel } = useOS();
    const [currentPath, setCurrentPath] = React.useState(`/home/${kernel.settings.username}/Documents`);
    const node = kernel.getVFSNodeByPath(currentPath);

    const navigate = (path) => {
        if (kernel.getVFSNodeByPath(path)?.type === 'directory') setCurrentPath(path);
    };
    
    const openFile = async (filePath) => {
        const node = kernel.getVFSNodeByPath(filePath);
        if (node?.type === 'file') {
            const appId = (filePath.endsWith('.desktop') || filePath.endsWith('.wap')) ? filePath : 'TextEditor';
            const options = (appId === 'TextEditor') ? { filePath } : {};
            await kernel.openProcess(appId, options);
        }
    };

    const goUp = () => {
        if (currentPath === '/') return;
        const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
        navigate(parentPath);
    };

    return e('div', { className: 'file-manager' },
        e('div', { className: 'fm-toolbar' },
            e('button', { onClick: goUp, disabled: currentPath === '/' }, e(Icons.Up)),
            e('input', { className: 'fm-path', value: currentPath, readOnly: true })
        ),
        e('div', { className: 'fm-view' },
            node?.type === 'directory' && node.children?.map(item =>
                e('div', {
                    key: item.path, className: 'fm-item',
                    onDoubleClick: async () => item.type === 'directory' ? navigate(item.path) : await openFile(item.path)
                }, e(item.type === 'directory' ? Icons.Folder : (item.name.endsWith('.desktop') ? Icons.DesktopFile : Icons.File), { className: 'icon' }), e('span', null, item.name))
            )
        )
    );
};

const TextEditor = ({ process }) => {
    const { kernel } = useOS();
    const fileNode = process.filePath ? kernel.getVFSNodeByPath(process.filePath) : null;
    const [content, setContent] = React.useState(fileNode?.content || '');
    
    const handleSave = () => {
        if(fileNode) kernel.updateFileContentByInode(fileNode.ino, content);
    };

    React.useEffect(() => {
        if (process.filePath) {
            const currentNode = kernel.getVFSNodeByPath(process.filePath);
            setContent(currentNode?.content || 'Could not load file.');
        }
    }, [process.filePath, kernel]);

    return e('div', { className: 'text-editor-container' },
      e('div', {className: 'text-editor-toolbar'},
        e('span', null, `Editing: ${fileNode?.name || 'Unsaved File'}`),
        e('button', {onClick: handleSave, disabled: !fileNode}, 'Save')
      ),
      e('textarea', { className: 'text-editor-area', value: content, onChange: (e) => setContent(e.target.value) })
    );
};

const WapRunner: React.FC<{ process: Process }> = ({ process }) => {
    const { kernel } = useOS();
    const [htmlContent, setHtmlContent] = React.useState('<body>Loading app...</body>');
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    // Kernel API bridge effect
    React.useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow || event.data?.type !== '__kernel_api_call__') {
                return;
            }
            
            const { id, action, payload } = event.data;
            try {
                const result = await kernel._handleApiCall(action, payload, process);
                
                let transferableResult = result;
                if (result instanceof Uint8Array) {
                    transferableResult = { type: 'Buffer', data: Array.from(result) };
                }

                iframeRef.current?.contentWindow?.postMessage({ id, result: transferableResult }, '*');
            } catch (err) {
                const error = err instanceof Error ? err.message : String(err);
                iframeRef.current?.contentWindow?.postMessage({ id, error }, '*');
            }
        };
        
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);

    }, [kernel, process]);


    // App loading effect
    React.useEffect(() => {
        const loadApp = async () => {
            if (!process.filePath) {
                setHtmlContent('<body>Error: No file path specified.</body>');
                return;
            }
            try {
                const ino = kernel.pathToInodeNum(process.filePath);
                if (!ino) throw new Error('File not found');
                
                const fileBytes = kernel.readFileBytesByInode(ino);
                const zip = await JSZip.loadAsync(fileBytes);
                const indexFile = zip.file('index.html');
                
                if (!indexFile) {
                    setHtmlContent('<body>Error: index.html not found in package.</body>');
                    return;
                }
                let content = await indexFile.async('string');
                
                if (process.driverStatus === 'enabled') {
                    const driverIno = kernel.pathToInodeNum('/usr/drivers/babylongamedriver.drv');
                    if (driverIno) {
                        const driverCode = kernel.readFileContentByInode(driverIno);
                        const driverScript = `<script>${driverCode}</script>`;
                        content = content.replace(/<body([^>]*)>/, `<body$1>${driverScript}`);
                    }
                }
                
                setHtmlContent(content);
            } catch (err) {
                console.error("Error loading WAP:", err);
                setHtmlContent(`<body>Error loading application: ${(err as Error).message}</body>`);
            }
        };
        loadApp();
    }, [process.filePath, process.driverStatus, kernel]);
    
    return e('div', { className: 'wap-runner-container' },
        process.driverStatus === 'disabled' && e('div', { className: 'driver-warning', title: 'High-performance driver not found. Run "featuresmg --install babylongamedriver" in the terminal.' },
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

const Terminal: React.FC = () => {
    const { kernel } = useOS();
    const [cwd, setCwd] = React.useState(`/home/${kernel.settings.username}`);
    const [output, setOutput] = React.useState<{type: string, text: string}[]>([{ type: 'output', text: 'Winux [Version 3.0.0-linux]' }]);
    const [input, setInput] = React.useState('');
    const terminalEndRef = React.useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    React.useEffect(scrollToBottom, [output]);
    
    const print = (text) => setOutput(prev => [...prev, { type: 'output', text: String(text) }]);

    const handleCommand = async (cmd) => {
        const parts = cmd.trim().split(' ').filter(p => p);
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                print('Commands: help, ls, cat, cd, apt-get, clear, whoami, pwd, featuresmg');
                break;
            case 'pwd':
                print(cwd);
                break;
            case 'cd':
                if (!args[0]) { setCwd(`/home/${kernel.settings.username}`); break; }
                const newPath = kernel.resolvePath(args[0], cwd);
                const newPathNode = kernel.getVFSNodeByPath(newPath);
                if (newPathNode && newPathNode.type === 'directory') {
                    setCwd(newPathNode.path);
                } else {
                    print(`cd: no such file or directory: ${args[0]}`);
                }
                break;
            case 'ls':
                const path = args[0] || cwd;
                const node = kernel.getVFSNodeByPath(path, cwd);
                if (node && node.type === 'directory' && node.children) {
                    if (node.children.length === 0) break;
                    print(node.children.map(c => c.name).join('  '));
                } else {
                    print(`ls: cannot access '${path}': No such file or directory`);
                }
                break;
            case 'cat':
                if (!args[0]) { print(`cat: missing operand`); break; }
                const file = kernel.getVFSNodeByPath(args[0], cwd);
                if(file?.type === 'file') {
                    print(file.content);
                } else {
                    print(`cat: ${args[0]}: No such file or directory or is a directory`);
                }
                break;
            case 'apt-get':
                if (!args[0]) { print(`apt-get: missing URL`); break; }
                try {
                    print(`Downloading from ${args[0]}...`);
                    const response = await fetch(args[0]);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.arrayBuffer();
                    const filename = new URL(args[0]).pathname.split('/').pop() || 'downloaded_file';
                    
                    print(`Download complete. Size: ${data.byteLength} bytes.`);

                    if (filename.endsWith('.wap')) {
                        print(`Installing application ${filename}...`);
                        await kernel.installWap(new Uint8Array(data), filename);
                        print(`Successfully installed ${filename}. Find it in the Start Menu or on your Desktop.`);
                    } else {
                        const cwdIno = kernel.pathToInodeNum(cwd);
                        if (cwdIno) {
                            kernel.createFile(cwdIno, filename, new Uint8Array(data));
                            print(`Downloaded and saved as ${filename} in ${cwd}`);
                        } else {
                             print(`Error: Current directory ${cwd} not found.`);
                        }
                    }
                } catch(err) {
                    print(`apt-get error: ${(err as Error).message}`);
                }
                break;
            case 'featuresmg':
                if (args[0] === '--install' && args[1]) {
                    const result = kernel.installFeature(args[1]);
                    print(result);
                } else {
                    print('Usage: featuresmg --install <feature>');
                }
                break;
            case 'clear': setOutput([]); return;
            case 'whoami': print(kernel.settings.username); break;
            default: if (command) print(`${command}: command not found`);
        }
    };
    
    const getPrompt = () => {
        const homeDir = `/home/${kernel.settings.username}`;
        let displayPath = cwd;
        if (cwd.startsWith(homeDir)) {
            displayPath = '~' + cwd.substring(homeDir.length);
        }
        return `${kernel.settings.username}@winuxos:${displayPath}$ `;
    }

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentInput = input.trim();
            setOutput(prev => [...prev, { type: 'input', text: `${getPrompt()}${currentInput}` }]);
            setInput('');
            if (currentInput) await handleCommand(currentInput);
        }
    };
    
    return e('div', { className: 'terminal', onClick: () => (document.querySelector('.terminal-input') as HTMLElement)?.focus() },
        e('div', { className: 'terminal-output' },
            output.map((line, index) => e('div', { key: index }, line.text))
        ),
        e('div', { className: 'terminal-line' },
            e('span', { className: 'terminal-prompt' }, getPrompt()),
            e('input', {
                className: 'terminal-input', type: 'text', value: input,
                onChange: e => setInput(e.target.value), onKeyDown: handleKeyDown, autoFocus: true
            })
        ),
        e('div', { ref: terminalEndRef })
    );
};

const Browser = () => {
    const [url, setUrl] = React.useState('https://google.com/search?igu=1&q=Linux+VFS');
    const [history, setHistory] = React.useState([
        { url: 'https://google.com/search?igu=1&q=Linux+VFS', time: new Date() }
    ]);
    const [historyIndex, setHistoryIndex] = React.useState(0);
    const [view, setView] = React.useState('iframe'); // iframe or history
    const iframeRef = React.useRef(null);

    const navigate = (newUrl, addToHistory = true) => {
        let finalUrl = newUrl;
        if (!/^https?:\/\//i.test(newUrl)) {
             finalUrl = `https://google.com/search?igu=1&q=${encodeURIComponent(newUrl)}`;
        }
        setUrl(finalUrl);
        if (addToHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push({ url: finalUrl, time: new Date() });
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        setView('iframe');
    };

    const handleUrlSubmit = (e) => { e.preventDefault(); navigate(e.target.elements.url.value); };
    const goBack = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); navigate(history[historyIndex - 1].url, false); } };
    const goForward = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); navigate(history[historyIndex + 1].url, false); } };
    const goHome = () => navigate('https://google.com/search?igu=1&q=Linux+VFS');
    const refresh = () => { if (iframeRef.current) iframeRef.current.src = url; };

    return e('div', { className: 'browser-app' },
        e('div', {className: 'browser-bar-container'},
            e('div', { className: 'browser-bar' },
                e('button', { onClick: goBack, disabled: historyIndex === 0 }, e(Icons.Back)),
                e('button', { onClick: goForward, disabled: historyIndex === history.length - 1 }, e(Icons.Forward)),
                e('button', { onClick: refresh }, e(Icons.Refresh)),
                e('button', { onClick: goHome }, e(Icons.Home)),
                e('form', { onSubmit: handleUrlSubmit, style: { flexGrow: 1, display: 'flex' } },
                    e('input', { name: 'url', type: 'text', defaultValue: url, key: url })
                ),
                e('button', { onClick: () => setView(view === 'history' ? 'iframe' : 'history') }, "History")
            )
        ),
        e('div', { className: 'browser-content' },
            view === 'iframe' && e('iframe', { ref: iframeRef, src: url, sandbox: 'allow-forms allow-scripts allow-same-origin' }),
            view === 'history' && e(BrowserHistoryPage, { history: history, navigate: navigate, clearHistory: () => { setHistory([]); setHistoryIndex(-1); } })
        )
    );
};

const BrowserHistoryPage = ({ history, navigate, clearHistory }: { history: {url: string, time: Date}[], navigate: (url: string) => void, clearHistory: () => void }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredHistory = history.filter(item => item.url.includes(searchTerm)).reverse();
    const groupedHistory = filteredHistory.reduce((acc, item) => {
        const date = item.time.toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {} as Record<string, { url: string; time: Date; }[]>);

    return e('div', { className: 'browser-history-page' },
        e('div', { className: 'browser-history-header' },
            e('h1', null, 'History'),
            e('div', { className: 'browser-history-controls' },
                e('div', { className: 'browser-history-search-wrapper' },
                    e(Icons.Search, { className: 'browser-history-search-icon' }),
                    e('input', { type: 'text', placeholder: 'Search history', className: 'browser-history-search', onChange: (e) => setSearchTerm(e.target.value) })
                ),
                e('button', { className: 'browser-history-clear-btn', onClick: clearHistory },
                    e(Icons.Trash),
                    'Clear browsing data'
                )
            )
        ),
        e('div', { className: 'browser-history-list' },
            Object.keys(groupedHistory).length === 0 ? e('div', { className: 'browser-history-empty' }, 'No history entries.')
            : Object.entries(groupedHistory).map(([date, entries]) => e('div', { key: date, className: 'history-date-group' },
                e('h2', { className: 'history-group-title' }, date),
                entries.map(item => e('div', { key: item.time.toISOString(), className: 'history-entry', onClick: () => navigate(item.url) },
                    e('span', { className: 'history-entry-time' }, item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
                    e('img', { className: 'history-entry-icon', src: `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}` }),
                    e('span', { className: 'history-entry-url' }, item.url)
                ))
            ))
        )
    );
};

const Settings = () => {
    const { kernel } = useOS();
    const [activePane, setActivePane] = React.useState('personalization');
    const [wallpaperInput, setWallpaperInput] = React.useState(kernel.settings.wallpaper);

    const handleThemeChange = (e) => {
        kernel.settings.theme = e.target.value;
        document.body.className = e.target.value === 'dark' ? 'dark-theme' : '';
        kernel.notify();
    };
    
    const handleWallpaperChange = () => {
        kernel.settings.wallpaper = wallpaperInput;
        kernel.notify();
    };

    const PersonalizationPane = () => e('div', null,
        e('h2', {className: 'settings-header'}, 'Theme'),
        e('p', null, 'Choose your preferred color mode.'),
        e('div', {className: 'theme-selector'},
          e('label', {className: 'theme-option'}, e('input', {type: 'radio', name: 'theme', value: 'light', checked: kernel.settings.theme === 'light', onChange: handleThemeChange }), 'Light'),
          e('label', {className: 'theme-option'}, e('input', {type: 'radio', name: 'theme', value: 'dark', checked: kernel.settings.theme === 'dark', onChange: handleThemeChange }), 'Dark')
        ),
        e('h2', {className: 'settings-header'}, 'Wallpaper'),
        e('p', null, 'Set a custom wallpaper from a URL.'),
        e('div', {className: 'wallpaper-input-group'},
            e('input', {type: 'text', value: wallpaperInput, onChange: (e) => setWallpaperInput(e.target.value), placeholder: 'Enter image URL'}),
            e('button', {onClick: handleWallpaperChange}, 'Set')
        )
    );

    const AboutPane = () => e('div', null,
        e('h2', {className: 'settings-header'}, 'About Winux OS'),
        e('p', null, 'A web-based operating system demo.'),
        e('pre', { className: 'os-info' }, `
Kernel Version: 3.0 (Multi-block VFS)
Device Size: ${DEVICE_SIZE_MB} MB
Username: ${kernel.settings.username}
        `)
    );

    const panes = {
        personalization: { name: 'Personalization', icon: Icons.Theme, component: PersonalizationPane },
        about: { name: 'About', icon: Icons.About, component: AboutPane },
    };

    return e('div', { className: 'settings-app' },
        e('div', { className: 'settings-sidebar' },
            Object.entries(panes).map(([key, pane]) => e('button', {
                key: key,
                className: `settings-sidebar-btn ${activePane === key ? 'active' : ''}`,
                onClick: () => setActivePane(key),
            }, e(pane.icon), pane.name))
        ),
        e('div', { className: 'settings-content' },
            e('div', { className: 'settings-pane' },
                panes[activePane].component()
            )
        )
    );
};

const AIAssistant = () => {
    const [messages, setMessages] = React.useState([{ text: "Hello! How can I help you today?", from: "assistant" }]);
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const chatRef = React.useRef<GenAIChat | null>(null);
    const conversationEndRef = React.useRef<HTMLDivElement | null>(null);
    
    React.useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = { text: input, from: "user" };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({ model: 'gemini-2.5-flash' });
            }
            const response = await chatRef.current.sendMessage({ message: userMessage.text });
            const htmlText = await marked.parse(response.text);
            setMessages(prev => [...prev, { text: htmlText, from: "assistant" }]);
        } catch (error) {
            console.error("Gemini API error:", error);
            setMessages(prev => [...prev, { text: "Sorry, I encountered an error. Please check the console.", from: "assistant" }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return e('div', { className: 'ai-assistant-app' },
        e('div', { className: 'ai-conversation' },
            messages.map((msg, index) => e('div', { key: index, className: `ai-message ${msg.from}` },
              msg.from === 'assistant' ? e('div', { dangerouslySetInnerHTML: { __html: msg.text } }) : msg.text
            )),
            isLoading && e('div', { className: 'ai-message assistant' }, '...'),
            e('div', { ref: conversationEndRef })
        ),
        e('div', { className: 'ai-input-area' },
            e('textarea', {
                className: 'ai-input', value: input,
                onChange: e => setInput(e.target.value),
                onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } },
                placeholder: 'Type your message...', rows: 1,
            }),
            e('button', { className: 'ai-send-btn', onClick: handleSend, disabled: isLoading }, e(Icons.Send))
        )
    );
};

const KernelMeltdown = ({ process }) => {
    const { kernel } = useOS();
    const handleProceed = () => kernel.triggerBSOD('USER_INITIATED_KERNEL_PANIC');
    const handleCancel = () => kernel.closeProcess(process.id);
    return e('div', {className: 'kernel-meltdown-app'},
        e(Icons.Biohazard, {className: 'icon'}),
        e('h1', null, 'Kernel Meltdown Detected'),
        e('p', null, 'This may result in a system crash. Are you sure you want to proceed?'),
        e('div', {className: 'buttons'},
            e('button', {className: 'proceed-btn', onClick: handleProceed}, 'Proceed'),
            e('button', {className: 'cancel-btn', onClick: handleCancel}, 'Cancel')
        )
    );
}

const DesktopIcon = ({ item, onDoubleClick }) => {
    if (!item) return null;
    
    let icon = Icons.Folder;
    let name = item.name;
    let appId = item.path;
    
    if (item.type === 'file') {
        if (item.name.endsWith('.desktop')) {
            icon = Icons.DesktopFile;
            const nameMatch = item.content?.match(/Name=(.*)/);
            name = nameMatch ? nameMatch[1] : item.name;
        } else {
            icon = Icons.File;
        }
    }

    return e('div', { className: 'desktop-icon', onDoubleClick: () => onDoubleClick(appId, item.type) },
        e(icon), e('span', null, name)
    );
};

const Taskbar = ({ onAppClick, onStartClick, onControlCenterClick }) => {
    const { kernel } = useOS();
    const processIds = kernel.getProcessIds();
    const processes = processIds.map(pid => kernel.getProcessInfo(pid)).filter(Boolean);
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const runningApps = React.useMemo(() => {
        const uniqueAppIds = [...new Set(processes.map(p => p.appId))];
        return uniqueAppIds.map(appId => {
            let appDef = kernel.getAppDefinition(appId);
             if (!appDef && appId.endsWith('.wap')) {
                const process = processes.find(p => p.appId === appId);
                appDef = { name: process?.title || 'Application', icon: Icons.File };
            }
            return {
                appId,
                appDef,
                isActive: processes.some(p => p.appId === appId && p.isFocused)
            }
        }).filter(item => item.appDef);
    }, [processes, kernel]);

    return e('div', { className: 'taskbar' },
        e('button', { className: 'taskbar-item', onClick: onStartClick }, e(Icons.Start)),
        runningApps.map(({ appId, appDef, isActive }) =>
            e('button', {
                key: appId,
                className: `taskbar-item running ${isActive ? 'active' : ''}`,
                onClick: () => onAppClick(appId)
            }, e(appDef.icon))
        ),
        e('div', { className: 'system-tray' },
            e('div', { className: 'system-tray-time' }, time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
            e('button', { className: 'taskbar-item', onClick: onControlCenterClick }, e(Icons.Wifi))
        )
    );
};

const StartMenu = ({ onAppClick, isVisible }) => {
    const { kernel } = useOS();
    
    // Get apps from both built-in and .desktop files
    const desktopNode = kernel.getVFSNodeByPath(`/home/${kernel.settings.username}/Desktop`);
    const desktopApps = desktopNode?.children?.filter(c => c.name.endsWith('.desktop')).map(c => {
         const nameMatch = c.content?.match(/Name=(.*)/);
         const execMatch = c.content?.match(/Exec=(.*)/);
         return {
             id: execMatch ? execMatch[1].trim() : c.path,
             name: nameMatch ? nameMatch[1].trim() : c.name,
             icon: Icons.DesktopFile
         }
    }) || [];

    const builtInApps = kernel.getAvailableApps()
        .filter(app => !app.id.endsWith('.wap'))
        .map(app => ({...app, icon: BUILT_IN_APPS[app.id]?.icon || Icons.File}));

    const allApps = [...builtInApps, ...desktopApps];
    const uniqueApps = allApps.filter((app, index, self) => index === self.findIndex((t) => t.name === app.name));


    if (!isVisible) return null;
    return e('div', { className: 'start-menu-container from-center' },
        e('div', { className: 'start-menu' },
            e('h3', null, 'All Apps'),
            e('div', { className: 'app-grid' },
                uniqueApps.map(app => e('div', { key: app.id, className: 'app-item', onClick: () => onAppClick(app.id) },
                    e(app.icon), e('span', null, app.name)
                ))
            )
        )
    );
};

const ControlCenter = ({ isVisible }) => {
    const { kernel } = useOS();
    if (!isVisible) return null;
    
    return e('div', {className: 'control-center-container'},
      e('div', {className: 'control-center'},
        e('div', {className: 'control-slider-group'},
          e(Icons.Brightness),
          e('input', {
            type: 'range', min: '15', max: '100', // Prevent going full black
            value: kernel.settings.brightness,
            onChange: (e) => {
                kernel.settings.brightness = parseInt(e.target.value, 10);
                kernel.notify();
            },
            className: 'control-slider'
          })
        )
      )
    );
}

const ContextMenu = ({ menu, onSelect }) => {
    if (!menu) return null;
    return e('div', { className: 'context-menu', style: { top: menu.y, left: menu.x } },
        menu.items.map((item, index) => e('div', {
            key: index, className: `context-menu-item ${item.disabled ? 'disabled' : ''}`,
            onClick: () => !item.disabled && onSelect(item.action)
        }, item.label))
    );
};

const WinuxOS: React.FC = () => {
    const { kernel } = useOS();
    const processIds = kernel.getProcessIds();
    const processes = processIds.map(id => kernel.getProcessInfo(id)).filter(Boolean) as Process[];
    const { settings } = kernel;
    const desktopNode = kernel.getVFSNodeByPath(`/home/${settings.username}/Desktop`);

    const [startMenuVisible, setStartMenuVisible] = React.useState(false);
    const [controlCenterVisible, setControlCenterVisible] = React.useState(false);
    const [contextMenu, setContextMenu] = React.useState(null);

    const handleAppClick = async (appId, itemType) => {
        if (itemType === 'directory') {
            await kernel.openProcess('FileExplorer', { filePath: appId });
        } else if (itemType === 'file' && !appId.endsWith('.desktop') && !appId.endsWith('.wap')) {
             await kernel.openProcess('TextEditor', { filePath: appId });
        } else {
            const runningProcesses = processes.filter(p => p.appId === appId || (p.appId.endsWith('.wap') && appId.includes(p.title)));
            if (runningProcesses.length > 0) {
                kernel.focusProcess(runningProcesses[0].id);
            } else {
                await kernel.openProcess(appId);
            }
        }
        closePopups();
    };

    const closePopups = () => {
        setStartMenuVisible(false);
        setControlCenterVisible(false);
        setContextMenu(null);
    }
    
    const handleTaskbarAppClick = async (appId) => {
        const appProcesses = processes.filter(p => p.appId === appId);
        if (appProcesses.length === 0) {
            await kernel.openProcess(appId); return;
        }
        const focusedAppProcess = appProcesses.find(p => p.isFocused);
        if (focusedAppProcess) {
             kernel.updateProcessState(focusedAppProcess.id, { isMinimized: true });
        } else {
            const topProcess = appProcesses.sort((a,b) => b.zIndex - a.zIndex)[0];
            kernel.focusProcess(topProcess.id);
        }
    };
    
    const handleContextMenu = (e) => {
        e.preventDefault();
        closePopups();
        setContextMenu({
            x: e.clientX, y: e.clientY,
            items: [
                { label: 'New Folder', action: 'NEW_FOLDER', disabled: true },
                { label: 'Change Wallpaper', action: () => kernel.openProcess('Settings') },
                { label: 'Trigger Meltdown', action: () => kernel.openProcess('KernelMeltdown') },
            ]
        });
    };
    
    const handleContextMenuSelect = (action) => {
        if (typeof action === 'function') action();
        setContextMenu(null);
    }
    
    const brightnessOpacity = Math.min(0.85, (100 - settings.brightness) / 100);

    return e('div', { className: 'desktop', onClick: closePopups, onContextMenu: handleContextMenu },
        e('img', { className: 'wallpaper', src: settings.wallpaper, alt: '' }),
        e('div', {className: 'brightness-overlay', style: {opacity: brightnessOpacity}}),

        e('div', { className: 'desktop-icons-container' },
            desktopNode?.children?.map(item => e(DesktopIcon, { key: item.path, item: item, onDoubleClick: handleAppClick }))
        ),

        processes.map(p => {
            let appDef = kernel.getAppDefinition(p.appId);
             if (!appDef && p.appId.endsWith('.wap')) {
                 appDef = { name: p.title || 'Application', icon: Icons.File };
            }
            if (!appDef) return null;

            let appContent;
            if (p.appId.endsWith('.wap')) {
                appContent = e(WapRunner, { process: p });
            } else if (appDef.component) {
                appContent = e(appDef.component, { process: p });
            } else {
                 appContent = e('div', null, `Error: No component for ${p.appId}`);
            }

            return e(Window, {
                key: p.id, process: p, onClose: () => kernel.closeProcess(p.id),
                children: appContent
            })
        }),
        
        e(Taskbar, {
            onAppClick: handleTaskbarAppClick,
            onStartClick: (e) => { e.stopPropagation(); setStartMenuVisible(!startMenuVisible); setControlCenterVisible(false); },
            onControlCenterClick: (e) => { e.stopPropagation(); setControlCenterVisible(!controlCenterVisible); setStartMenuVisible(false); }
        }),
        e(StartMenu, { onAppClick: (appId) => handleAppClick(appId, 'app'), isVisible: startMenuVisible }),
        e(ControlCenter, { isVisible: controlCenterVisible }),
        e(ContextMenu, { menu: contextMenu, onSelect: handleContextMenuSelect })
    );
};

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => {
    return e('div', { className: 'boot-screen' }, 
        e(Icons.WinuxLogo),
        e('p', {className: 'loading-text'}, message)
    );
};

const LoginScreen = ({ onLogin, wallpaper, username }) => {
    return e('div', { className: 'login-screen', style: { backgroundImage: `url(${wallpaper})` } },
        e('div', { className: 'login-overlay' }),
        e('div', { className: 'login-box' },
            e('div', { className: 'login-avatar' }, e(Icons.User)),
            e('div', { className: 'login-user' }, username),
            e('button', { className: 'login-button', onClick: () => onLogin()}, 'Sign In')
        )
    );
};

const App = () => {
    const [bootState, setBootState] = React.useState('booting'); // booting -> login -> desktop
    const [os, setOS] = React.useState<{ kernel: WasmKernel | null; deviceManager: DeviceManager | null }>({ kernel: null, deviceManager: null });
    const [loadingMessage, setLoadingMessage] = React.useState('Starting Winux OS...');

    React.useEffect(() => {
        const initOS = async () => {
            try {
                const deviceManager = new DeviceManager();
                setLoadingMessage('Initializing block device...');
                await deviceManager.init();

                let deviceBuffer = await deviceManager.getDeviceBuffer();
                if (!deviceBuffer) {
                    setLoadingMessage('No device found. Creating new one...');
                    await deviceManager.createInitialDevice();
                    deviceBuffer = await deviceManager.getDeviceBuffer();
                }

                if (!deviceBuffer) {
                     throw new Error("Failed to create or load device buffer.");
                }

                setLoadingMessage('Starting kernel...');
                const kernel = new WasmKernel(deviceBuffer);
                await kernel.loadApps();
                
                setOS({ kernel, deviceManager });

                document.body.className = kernel.settings.theme === 'dark' ? 'dark-theme' : '';
                
                setTimeout(() => setBootState('login'), 500);

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

    if (bootState === 'booting' || !os.kernel) {
        return e(LoadingScreen, { message: loadingMessage });
    }

    return e(OSContext.Provider, { value: os },
        bootState === 'login' ? e(LoginScreen, { onLogin: () => setBootState('desktop'), wallpaper: os.kernel.settings.wallpaper, username: os.kernel.settings.username }) :
        e(WinuxOS)
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));