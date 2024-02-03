import { Request } from 'express';
import { promisify } from 'util';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';

const unlinkAsync = promisify(unlink);
export default class UrlFileUtil {
  static getUrlFileIsExist(req: any, pathImage: string) {
    try {
      const { filename } = req.file;
      return `public/${pathImage}/${filename.replace('images\\', '')}`;
    } catch (error) {
      return '';
    }
  }

  static setUrlWithHosting(req: Request, imageUrl: string) {
    return `${req.protocol}s://${req.get('host')}/${imageUrl}`;
  }

  // static deleteFileAsset(req: Request, imageUrl: string) {
  //   try {
  //     const urlGet = `${req.protocol}s://${req.get('host')}/`;
  //     const substr = imageUrl.split(urlGet);

  //     unlink(`${substr[1]}`);
  //   } catch (error) {
  //     log(error);
  //   }
  // }
  static async deleteFileAsset(req: Request, imageUrl: string): Promise<void> {
    try {
      const urlGet = `${req.protocol}://${req.get('host')}/`;
      const substr = imageUrl.split(urlGet);

      const filePath = join(__dirname, substr[1]); // Assurez-vous d'ajuster le chemin si nécessaire

      await unlinkAsync(filePath);
    } catch (error) {
      console.error(error);
      // Lancez l'erreur à l'appelant ou effectuez une autre gestion des erreurs selon vos besoins.
      throw error;
    }
  }
}
