interface Session {
    start: number,
    ip: string,
    username: string,
    config?: {
        username: string,
        flags: string,
        hash: string
    }
}

export default Session;
