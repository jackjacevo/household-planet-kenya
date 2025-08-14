export declare class EncryptionService {
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    private readonly encryptionKey;
    constructor();
    encrypt(text: string): string;
    decrypt(encryptedData: string): string;
    encryptSensitiveData(data: any): string;
    decryptSensitiveData<T>(encryptedData: string): T;
    hashPassword(password: string, saltRounds?: number): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    generateSecureSessionId(): string;
    encryptCreditCard(cardNumber: string): string;
    tokenizeData(data: string): string;
}
