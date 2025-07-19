let Server = require("./Server.js")

const blessed = require('blessed');

const screen = blessed.screen({
    smartCSR: true,
    title: 'Basic RPG',
    dockBorders: true
});

const logBox = blessed.log({
    name: "Basic RPG - Server",
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%-2',
    tags: true,
    border: { type: 'line' },
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: ' ', track: { bg: 'grey' }, style: { bg: 'white' } },
    keys: true,
    vi: true,
});

const input = blessed.box({
    parent: screen,
    bottom: 0,
    content: "> {white-bg} {/white-bg}",
    left: 0,
    border: { type: 'line' },
    width: '100%',
    height: 3,
    inputOnFocus: true,
    tags: true,  
    style: { fg: 'white' },
});

screen.render();

screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

console.log = (...t) => {
    logBox.add(`{green-fg}[INFO]{/green-fg} ${t.join(" ")}`)
}
console.error = (...t) => {
    logBox.add(`{red-fg}[ERROR]{/red-fg} ${t.join(" ")}`)
}
console.debug = (...t) => {
    logBox.add(`{blue-fg}[DEBUG]{/blue-fg} ${t.join(" ")}`)
}
console.command = (...t) => {
    logBox.add(`> ${t.join(" ")}`)
}

let server = new Server()

screen.on('keypress', (ch, key) => {
    server.commandManager.input(ch, key, (text) => {
        input.setContent("> " + text)
        screen.render()
    })
});