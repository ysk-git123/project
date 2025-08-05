// 导入 Web API 类型定义
import type { File, Blob } from '@types/web';

// 确保 File 和 Blob 在全局作用域中可用
declare global {
  // 声明 File 类型
  interface File extends Blob {
    new (blobParts?: BlobPart[], fileName?: string, options?: FilePropertyBag): File;
    readonly lastModified: number;
    readonly name: string;
  }

  // 声明 Blob 类型
  interface Blob {
    new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
    readonly size: number;
    readonly type: string;
    slice(start?: number, end?: number, contentType?: string): Blob;
  }

  // 确保全局对象上有 File 和 Blob 构造函数
  var File: { 
    prototype: File;
    new (blobParts?: BlobPart[], fileName?: string, options?: FilePropertyBag): File;
  };

  var Blob: { 
    prototype: Blob;
    new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
  };
}

// 导出空对象以确保文件被视为模块
export {}