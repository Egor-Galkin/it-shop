import { existsSync, unlinkSync, renameSync } from 'fs';
import { join, basename } from 'path';

export const UPLOADS_DIR = join(process.cwd(), 'uploads', 'devices');

export function deleteFile(filePath: string): boolean {
  try {
    const fileName = basename(filePath);
    const fullPath = join(UPLOADS_DIR, fileName);
    
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

export async function isImageUsed(
  prisma: any,
  imagePath: string,
  excludeDeviceId?: number
): Promise<boolean> {
  const usedAsMain = await prisma.device.count({
    where: {
      img: imagePath,
      id: excludeDeviceId ? { not: excludeDeviceId } : undefined,
    },
  });

  const usedAsExtra = await prisma.deviceImage.count({
    where: {
      img: imagePath,
      deviceId: excludeDeviceId ? { not: excludeDeviceId } : undefined,
    },
  });

  return usedAsMain > 0 || usedAsExtra > 0;
}