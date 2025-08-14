import { CsrfProtectionService } from './csrf-protection.service';
export declare class CsrfController {
    private readonly csrfService;
    constructor(csrfService: CsrfProtectionService);
    getToken(request: any, response: any): any;
}
