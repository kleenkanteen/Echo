import ky from 'ky';
import path from 'node:path';

declare const Bun: {
    file(path: string): Blob & {
        exists(): Promise<boolean>;
        name?: string;
    };
    argv: string[];
};

const ENDPOINT =
    'https://us-central1-gen-lang-client-0136115968.cloudfunctions.net/describe';

export const mockImageAnalysis = async (
    imagePath: string,
): Promise<string> => {
    const resolvedPath = imagePath;

    const file = Bun.file(imagePath);

    let formData = new FormData();
    formData.append('image', file);

    const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: formData,
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}): ${text}`);
    }

    console.log(text);
    return text;
};

if (process.argv[1]?.endsWith('image.ts')) {
    const imagePath = path.resolve(process.cwd(), 'sand battery.png');

    mockImageAnalysis(imagePath).catch((error) => {
        console.error('Failed to describe image', error);
        process.exitCode = 1;
    });
}