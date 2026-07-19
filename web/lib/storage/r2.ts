// Implementación FUTURA con Cloudflare R2 (presigned URLs, compatibles S3).
// No se usa hoy. Cuando migres:
//   1. npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
//   2. Rellena las credenciales R2_* en .env.local
//   3. Cambia STORAGE_PROVIDER=r2
// La BD NO cambia: las claves ('fotos/x.webp') son las mismas.
import { StorageProvider, DEFAULT_EXPIRES } from "./types";

export class R2StorageProvider implements StorageProvider {
  async getUrl(_key: string, _expiresIn = DEFAULT_EXPIRES): Promise<string> {
    throw new Error(
      "R2StorageProvider no implementado. Ver instrucciones en r2.ts."
    );
    /* Ejemplo de implementación:
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: _key });
    return await getSignedUrl(client, cmd, { expiresIn: _expiresIn });
    */
  }

  async getUrls(
    keys: string[],
    expiresIn = DEFAULT_EXPIRES
  ): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    for (const k of keys) out[k] = await this.getUrl(k, expiresIn);
    return out;
  }
}
