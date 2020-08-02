import builder from '../../helpers/builder';

export const UNDEFINED = builder.error({
  code: 400,
  status: 'PARAMETERS UNDEFINED',
  message: 'Parameters for this method is not supplied',
});

export const INVALID_MNEMONIC = builder.error({
  code: 401,
  status: 'INVALID MNEMONIC',
  message: 'The mnemonic phrase you specified is invalid',
});
