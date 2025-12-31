import fs from 'node:fs/promises';
import path from 'node:path';

const ENDPOINT =
    'https://us-central1-gen-lang-client-0136115968.cloudfunctions.net/describe';

export const uploadImage = async (imagePath: string): Promise<string> => {
    const resolvedPath = path.resolve(process.cwd(), imagePath);
    const buffer = await fs.readFile(resolvedPath);

    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('image', blob, path.basename(resolvedPath));

    const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: formData,
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}): ${text}`);
    }

    return text;
};

const isMain =
    path.basename(process.argv[1] ?? '') === 'upload.ts' ||
    path.basename(process.argv[1] ?? '') === 'upload.js';

if (isMain) {
    uploadImage('sand battery.png')
        .then((text) => {
            console.log(text);
        })
        .catch((error) => {
            console.error('Failed to upload image', error);
            process.exitCode = 1;
        });
}