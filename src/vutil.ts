import {NextFunction} from "express";

export type X = { marker: 'VibeErrorObj' }
export type FX<T extends { marker: 'VibeErrorObj' }> = (arg: T) => void;

export const nextFunc = (next: NextFunction) => {
  return <T extends { marker: 'VibeErrorObj' }>(v: T) => next();
}

interface HasMarker {
  marker: 'VibeErrorObj'
}

const cleanUp = (v: string[]) => {
  // take stack trace and convert to flat array
  return [v].flat(Infinity).join('').split('\n').map(v => String(v || '').trim())
};

export const toErrorObj = <T extends { marker: 'VibeErrorObj' }>(err: any, id: string, ...args: any[]): T => {

  const v = <any>{
    marker: 'VibeErrorObj',
    traceId: id || null,
    err: err || null,
    errMessage: err && err.message || null,
    errStack: cleanUp([err && err.stack || new Error().stack]),
    details: Array.from(args)
    // details: [val, ...Array.from(args)]
  };

  console.warn("04376165-eb01-49ab-b76b-46b5132d2891", v);

  return v;
};







