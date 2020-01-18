import { LandscapeObject } from '@runejs/cache-parser';

export interface ModifiedLandscapeObject extends LandscapeObject {
    metadata?: { [key: string]: any };
}

export const objectKey = (object: LandscapeObject, level: boolean = false): string => {
    return `${object.x},${object.y}${level ? `,${object.level}` : ''},${object.objectId}`;
};
