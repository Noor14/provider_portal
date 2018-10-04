export interface NgFilesConfig {
  acceptExtensions?: string[] | string;
  maxFilesCount?: number;
  maxFileSize?: number;
  totalFilesSize?: number;
}

export const ngFilesConfigDefault: NgFilesConfig = {
  acceptExtensions: '*',
  maxFilesCount: Infinity,
  maxFileSize: Infinity,
  totalFilesSize: Infinity
};
