const Player = require('./Player')

/**
 * @typedef {import('./Server')} Server
 * 
 * @typedef Argument 
 * @property {string} name
 * @property {StringConstructor|NumberConstructor|BooleanConstructor|ObjectConstructor|Player} type
 * @property {boolean} required
 */


class CommandManager {
    /**
     * 
     * @param {Server} server 
     */
    constructor(server) {
        /** @type {Server} */
        this.server = server

        /** @type {Command[]} */
        this.commands = []
        this.plainInput = ""

        new Command("op", this).addArgument("player", Player, true).exec((args) => {
            this.server.database.get("user:" + args.player).then(async doc => {
                doc.admin = true
                await this.server.database.put(doc)
                console.log(`${args.player} is now admin`);
            })
        })

        new Command("money", this).addArgument("type", ["give", "retrive"], true).addArgument("player", Player, true).exec((args) => {
            console.log(JSON.stringify(args));

            this.server.database.get("user:" + args.player).then(async doc => {
                if (args.type === "give") {
                    doc.money = 100
                } else {
                    
                }
                await this.server.database.put(doc)
                console.log(`${args.player} has now admin ${doc.money}$`);
            })
        })
    }
    input(ch, key, setInput) {
        if (!key) return;
        switch (key.name) {
            case 'return':
                console.command(this.plainInput)
                let args = this.plainInput.split(" ")
                let cmd = this.commands.find((c) => c.name === args[0])
                if (cmd) {
                    cmd.call(args.slice(1))
                } else {
                    console.error("Command not found")
                }
                this.plainInput = ""
                setInput(this.plainInput)
                break;
            case 'tab':
                if (this.plainInput) {
                    let styledInput
                    if (this.autocompleteInput) {
                        this.plainInput += this.autocompleteInput
                        this.autocompleteInput = ""
                    }
                    this.plainInput += "  "
                    styledInput = this.plainInput + '{white-bg} {/white-bg}'
                    setInput(styledInput)
                }
            case 'backspace':
                this.plainInput = this.plainInput.slice(0, -1);
            default:
                if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
                    if (!["backspace", "tab", "return", "enter"].includes(key.name)) {
                        this.plainInput += ch
                    }
                    this.autocompleteInput = ""
                    if (this.plainInput) {
                        let styledInput
                        let args = this.plainInput.split(" ")
                        let cmd = this.commands.find((c) => c.name === args[0]) || this.commands.find((c) => c.name.startsWith(args[0]))
                        if (cmd && cmd.name === args[0] && this.plainInput.length === args[0].length) {
                            styledInput = this.plainInput + "{white-bg} {/white-bg}"
                            setInput(styledInput)
                        } else if (cmd && this.plainInput.length === args[0].length) {
                            this.autocompleteInput = cmd.name.slice(this.plainInput.length)
                            styledInput = this.plainInput + `{grey-fg}${this.autocompleteInput.replace(/^(.)/, '{white-bg}$1{/white-bg}')}{/grey-fg}`
                            setInput(styledInput)
                        } else if (cmd && args.length > 1) {
                            let canContinue = true
                            args.slice(1).forEach(async (arg, i) => {
                                if (canContinue) {
                                    let { correct, closest } = await cmd.checkArg(i, arg)
                                    if (!correct) {
                                        canContinue = false
                                        if (closest && i == args.length - 2 && !this.plainInput.endsWith(" ")) {
                                            this.autocompleteInput = closest.slice(arg.length)
                                            args[i + 1] = arg + `{grey-fg}${this.autocompleteInput.replace(/^(.)/, '{white-bg}$1{/white-bg}')}{/grey-fg}`
                                            styledInput = args.join(" ")
                                        } else {
                                            styledInput = `{red-fg}${this.plainInput}{/red-fg}{white-bg} {/white-bg}`
                                        }
                                        setInput(styledInput)
                                    } else if (args.length - 2 === i) {
                                        styledInput = this.plainInput + "{white-bg} {/white-bg}"
                                        setInput(styledInput)
                                    }
                                }
                            })
                        } else {
                            styledInput = `{red-fg}${this.plainInput}{/red-fg}{white-bg} {/white-bg}`
                            setInput(styledInput)
                        }
                    } else {
                        setInput("{white-bg} {/white-bg}")
                    }
                }
                break;
        }
    }

    /**
     * 
     * @param {string} name 
     * @returns {Promise<string[]>}
     */
    getUsers(name) {
        return new Promise((r, e) => {
            this.server.database.allDocs({
                include_docs: true,
                startkey: 'user:' + name,
                endkey: 'user:' + name + '\uffff'
            }).then(result => {
                const users = result.rows.map(row => row.doc._id.replace('user:', ''))
                r(users)
            }).catch(err => {
                e(err)
            })
        })
    }
}

class Command {
    /**
     * 
     * @param {string} name 
     * @param {CommandManager} commandManager 
     */
    constructor(name, commandManager) {
        this.name = name
        this.commandManager = commandManager
        this.commandManager.commands.push(this)

        /** @type {Argument[]} */
        this.args = []

        /** @type {function} */
        this.execution
    }
    addArgument(name, type, required) {
        this.args.push({ name, type, required })
        return this
    }

    /**
     * 
     * @param {function} cb 
     */
    exec(cb) {
        this.execution = cb
    }

    async call(args) {
        let canExecute = true
        let execArgs = {}
        for (let i = 0; i < this.args.length; i++) {
            let arg = args[i]
            let sysArg = this.args[i]
            if (!arg && sysArg.required) {
                canExecute = false
                console.error(`Argument ${i} (${sysArg.name}) is required.`);
            } else {
                const { correct, closest } = await this.checkArg(i, arg)
                if (!correct) {
                    canExecute = false
                    console.error(`Unable to parse argument ${i} (${sysArg.name}).`);
                } else {

                    execArgs[sysArg.name] = arg
                }
            }
            if (i == this.args.length - 1 && canExecute) {
                this.execution.call(this.commandManager, execArgs)
            }
        }
    }

    async checkArg(i, arg) {
        if (i >= this.args.length && arg) {
            return { correct: false }
        } else if (arg) {
            if (this.args[i].type === Player || Array.isArray(this.args[i].type)) {
                let data = this.args[i].type
                if (this.args[i].type === Player) {
                    data = await this.commandManager.getUsers(arg)
                }
                if (!data) {
                    return { correct: false }
                } else if (data.find(u => u === arg)) {
                    return { correct: true }
                } else {
                    let closest = data.find(u => u.startsWith(arg))
                    return { correct: false, closest }
                }
            }
        } else {
            return { correct: true }
        }
    }
}
module.exports = CommandManager