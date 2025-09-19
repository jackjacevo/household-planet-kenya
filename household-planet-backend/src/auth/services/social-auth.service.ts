import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../enums/user-role.enum';
import * as crypto from 'crypto';

export interface SocialProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'apple';
}

@Injectable()
export class SocialAuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async handleSocialLogin(profile: SocialProfile, ipAddress: string, userAgent: string) {
    // Check if user exists with this social provider
    let user = await this.findUserBySocialId(profile.provider, profile.id);

    if (!user) {
      // Check if user exists with this email
      user = await this.prisma.user.findUnique({
        where: { email: profile.email }
      });

      if (user) {
        // Link social account to existing user
        await this.linkSocialAccount(user.id, profile.provider, profile.id);
      } else {
        // Create new user
        user = await this.createUserFromSocialProfile(profile);
      }
    }

    return user;
  }

  async verifyGoogleToken(token: string): Promise<SocialProfile | null> {
    try {
      // TODO: Implement Google OAuth token verification
      // const { OAuth2Client } = require('google-auth-library');
      // const client = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
      // const ticket = await client.verifyIdToken({
      //   idToken: token,
      //   audience: this.configService.get('GOOGLE_CLIENT_ID'),
      // });
      // const payload = ticket.getPayload();
      
      // For now, return mock data for development
      return {
        id: 'google_' + crypto.randomBytes(8).toString('hex'),
        email: 'user@example.com',
        firstName: 'Google',
        lastName: 'User',
        provider: 'google'
      };
    } catch (error) {
      return null;
    }
  }

  async verifyFacebookToken(token: string): Promise<SocialProfile | null> {
    try {
      // TODO: Implement Facebook token verification
      // const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,email,first_name,last_name,picture`);
      // const data = await response.json();
      
      return {
        id: 'facebook_' + crypto.randomBytes(8).toString('hex'),
        email: 'user@example.com',
        firstName: 'Facebook',
        lastName: 'User',
        provider: 'facebook'
      };
    } catch (error) {
      return null;
    }
  }

  async verifyAppleToken(token: string): Promise<SocialProfile | null> {
    try {
      // TODO: Implement Apple Sign-In token verification
      return {
        id: 'apple_' + crypto.randomBytes(8).toString('hex'),
        email: 'user@example.com',
        firstName: 'Apple',
        lastName: 'User',
        provider: 'apple'
      };
    } catch (error) {
      return null;
    }
  }

  private async findUserBySocialId(provider: string, socialId: string) {
    const field = `${provider}Id`;
    return this.prisma.user.findFirst({
      where: { [field]: socialId }
    });
  }

  private async linkSocialAccount(userId: number, provider: string, socialId: string) {
    const field = `${provider}Id`;
    const socialProviders = await this.getSocialProviders(userId);
    
    if (!socialProviders.includes(provider)) {
      socialProviders.push(provider);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        [field]: socialId,
        socialProviders: JSON.stringify(socialProviders)
      }
    });
  }

  private async createUserFromSocialProfile(profile: SocialProfile) {
    return this.prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: `${profile.firstName} ${profile.lastName}`,
        password: crypto.randomBytes(32).toString('hex'), // Random password for social users
        role: UserRole.CUSTOMER,
        emailVerified: true, // Social accounts are pre-verified
        [`${profile.provider}Id`]: profile.id,
        socialProviders: JSON.stringify([profile.provider]),
        avatar: profile.avatar,
      }
    });
  }

  private async getSocialProviders(userId: number): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { socialProviders: true }
    });

    if (!user?.socialProviders) {
      return [];
    }

    try {
      return JSON.parse(user.socialProviders);
    } catch {
      return [];
    }
  }
}
