import { Type } from 'io-ts';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';

import { EmptyArray } from './errors';

type Codec = Type<any>;

export function validateCodec(codec: Codec, data: any[] | any) {
  if (Array.isArray(data)) {
    if (!data.length) {
      throw new EmptyArray();
    }

    data.forEach((dataEntry) => {
      throwIfDecodeFails(codec, dataEntry);
    });
  } else {
    throwIfDecodeFails(codec, data);
  }
}

function throwIfDecodeFails(codec: Codec, data: any) {
  const decodingResult = codec.decode(data);
  ThrowReporter.report(decodingResult);
}
