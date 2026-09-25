import * as argon2 from "argon2";

export const generateHash = async (plainTxt: string): Promise<string> => {
  // the ideal argon hashing options for AWS 2 core CPU and 1GB of RAM
  let hashValue = await argon2.hash(plainTxt, {
    type: argon2.argon2id,
    timeCost: 8,
    parallelism: 1,
  });
  return hashValue;
};

export const compareHash = async (
  cipherTxt: string,
  plainTxt: string,
): Promise<boolean> => {
  let match = await argon2.verify(cipherTxt, plainTxt);
  return match;
};
