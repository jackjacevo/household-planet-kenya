import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as zlib from 'zlib';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    if (req.headers['x-no-compression'] || res.getHeader('content-encoding')) {
      return next();
    }

    const originalJson = res.json;
    res.json = function(obj: any) {
      const jsonString = JSON.stringify(obj);
      
      if (jsonString.length < 1024) {
        return originalJson.call(this, obj);
      }

      if (acceptEncoding.includes('gzip')) {
        const compressed = zlib.gzipSync(jsonString);
        this.setHeader('Content-Encoding', 'gzip');
        this.setHeader('Content-Type', 'application/json');
        this.setHeader('Content-Length', compressed.length);
        return this.end(compressed);
      } else if (acceptEncoding.includes('deflate')) {
        const compressed = zlib.deflateSync(jsonString);
        this.setHeader('Content-Encoding', 'deflate');
        this.setHeader('Content-Type', 'application/json');
        this.setHeader('Content-Length', compressed.length);
        return this.end(compressed);
      }

      return originalJson.call(this, obj);
    };

    next();
  }
}