import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async createPost(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string;
    featuredImage?: string;
    authorId?: string;
    status?: string;
  }) {
    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tags: data.tags,
        featuredImage: data.featuredImage,
        authorId: data.authorId,
        status: data.status || 'DRAFT',
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  async getPosts(params: {
    skip?: number;
    take?: number;
    status?: string;
  }) {
    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    return this.prisma.blogPost.findMany({
      where,
      skip: params.skip || 0,
      take: params.take || 10,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getPostBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug },
    });
  }

  async updatePost(id: string, data: any) {
    const updateData: any = { ...data };
    
    // Set publishedAt when status changes to PUBLISHED
    if (data.status === 'PUBLISHED' && !data.publishedAt) {
      updateData.publishedAt = new Date();
    }
    
    return this.prisma.blogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePost(id: string) {
    return this.prisma.blogPost.delete({
      where: { id },
    });
  }

  async getRelatedPosts(postId: string, limit = 3) {
    return this.prisma.blogPost.findMany({
      where: {
        id: { not: postId },
        status: 'PUBLISHED',
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });
  }
}