export type SignalResponseType<T> = {
    error: boolean;
    message: string;
    data?: T;
};
