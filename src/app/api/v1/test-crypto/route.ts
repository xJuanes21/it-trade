import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption"; // Para sacar el pass real de la DB

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""; 

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No Auth" });

    // 1. Obtener credenciales guardadas en BD (Están encriptadas por Next.js usando Hex/CBC)
    const creds = await prisma.credentialsApi.findUnique({ where: { userId: session.user.id } });
    if (!creds) return NextResponse.json({ error: "Sin credenciales. Agregales en /dashboard/configuracion primero." });

    // 2. Extraer el raw string JSON que guardamos antes: {"username":"x", "password":"y"}
    const rawJsonString = decrypt(creds.data);

    const variations: Record<string, string> = {
      raw_json: rawJsonString
    };

    // --- VARIATION 1: Solo Base64 Puro (Pasa muy seguido que lo confunden con encriptación) ---
    variations["1_Solo_Base64"] = Buffer.from(rawJsonString, "utf8").toString("base64");

    // --- VARIATION 2: AES-256-ECB Base64 (ECB NO usa IV, por eso a los devs les encanta probar con esto) ---
    try {
      const cipherECB = crypto.createCipheriv("aes-256-ecb", Buffer.from(ENCRYPTION_KEY), null);
      let encECB = cipherECB.update(rawJsonString, "utf8", "base64");
      encECB += cipherECB.final("base64");
      variations["2_AES_ECB_Base64_NO_IV"] = encECB;
    } catch(e) {}

    // --- VARIATION 3: AES-256-CBC con IV estático de puros Ceros (Muy común en C#/.NET) ---
    try {
      const zeroIV = Buffer.alloc(16, 0); // 16 bytes de zeros
      const cipherCBCZero = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), zeroIV);
      let encCBCZero = cipherCBCZero.update(rawJsonString, "utf8", "base64");
      encCBCZero += cipherCBCZero.final("base64");
      variations["3_AES_CBC_IV_CEROS"] = encCBCZero;
    } catch(e) {}

    // --- VARIATION 4: AES-256-CBC con IV random embebido al inicio `Base64(IV + Cipher)` (Estándar de facto) ---
    try {
      const randomIV = crypto.randomBytes(16);
      const cipherCBCStd = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), randomIV);
      const encryptedBuffer = Buffer.concat([cipherCBCStd.update(rawJsonString, "utf8"), cipherCBCStd.final()]);
      variations["4_AES_CBC_IV_PREPENDED"] = Buffer.concat([randomIV, encryptedBuffer]).toString("base64");
    } catch(e) {}

    // --- VARIATION 5: AES-256-CBC separado por dos puntos pero ambos en Base64 en vez de Hex ---
    try {
      const randomIV = crypto.randomBytes(16);
      const cipherCBCSplit = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), randomIV);
      const encBufferSplit = Buffer.concat([cipherCBCSplit.update(rawJsonString, "utf8"), cipherCBCSplit.final()]);
      variations["5_AES_CBC_BASE64_CON_DOS_PUNTOS"] = randomIV.toString("base64") + ":" + encBufferSplit.toString("base64");
    } catch(e) {}

    return NextResponse.json({
       mensaje: "¡Copia cada uno de estos valores y pégalos en el CP-Data-Type del Swagger hasta que uno funcione!",
       opciones: variations
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
