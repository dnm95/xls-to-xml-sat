import { NextApiRequest, NextApiResponse } from 'next';
import { uploadFile } from '@uploadcare/upload-client'

const fs = require('fs');

export type CreateXMLResponse = {
  response: {
    url: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreateXMLResponse>) {
  const { data, filename } = req.body

  let writeStream = fs.createWriteStream(`/tmp/${filename}`);
  writeStream.write(data);
  writeStream.end();

  writeStream.on('finish', async function () {
    const fileContent = fs.readFileSync(`/tmp/${filename}`);

    const file = await uploadFile(fileContent, {
      publicKey: String(process.env.UPLOADCARE_KEY),
      store: 'auto',
      fileName: filename,
      metadata: {
        subsystem: 'uploader',
        pet: 'cat',
      }
    })

    res.status(200).json({ response: { url: String(file.cdnUrl) } });
  });
}