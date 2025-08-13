import { PushService } from './push.service';
export declare class PushController {
    private pushService;
    constructor(pushService: PushService);
    subscribe(user: any, subscription: any): Promise<{
        success: boolean;
    }>;
    testNotification(user: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    getVapidKey(): {
        publicKey: string;
    };
}
