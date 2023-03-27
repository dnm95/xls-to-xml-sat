import { NextApiRequest, NextApiResponse } from 'next';

const LOGIN = process.env.LOGIN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { password } = req.body

  res.status(200).json({ response: { valid: LOGIN === password } });
}