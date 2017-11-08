export interface Exception {
    stack: any,
    message: string,
    path: string,
    errno?: number,
    code?: string,
    syscall?: string
}