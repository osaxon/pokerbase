export class ApplicationError extends Error {
    constructor(message: string) {
        super(message); // (1)
        this.name = "ApplicationError"; // (2)
    }
}
