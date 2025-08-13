export declare enum SocialProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook",
    APPLE = "apple"
}
export declare class SocialLoginDto {
    provider: SocialProvider;
    accessToken: string;
    idToken?: string;
}
export declare class SocialUserDto {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: SocialProvider;
}
