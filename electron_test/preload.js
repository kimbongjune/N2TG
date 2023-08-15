const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    "electron", {
        ipcRenderer: {
            send: (channel, data) => {
                ipcRenderer.send(channel, data);
            },
            on: (channel, func) => {
                const subscription = ipcRenderer.on(channel, (event, ...args) => func(...args));
                return subscription;
            }
        }
    }
);