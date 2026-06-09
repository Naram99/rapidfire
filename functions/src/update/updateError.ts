export default class UpdateError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
    ) {
        super(message);
    }
}
