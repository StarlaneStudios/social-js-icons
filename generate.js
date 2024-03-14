import fs from 'fs/promises';
import { pascal } from 'radash';
import { fileURLToPath } from 'url';
import { relative } from 'path';
import { load } from 'cheerio';

const ICONS = [];
const SOURCES = [
	'icons'
];

function getFilePathData(fileData) {
	const $ = load(fileData, { xmlMode: true });
	const pathElements = $('path');
	const pathData = [];

	pathElements.each((_, element) => {
		pathData.push($(element).attr('d'));
	});

	return pathData;
}

for (const source of SOURCES) {
	const files = await fs.readdir(source);

	for (const file of files) {
		const filePath = new URL(`${source}/${file}`, import.meta.url);
		const fileName = 'sjs' + pascal(file.replace('.svg', ''));

		const fileContents = await fs.readFile(filePath, 'utf8');
		const filePathData = getFilePathData(fileContents);
		
		ICONS.push({
			raw: relative('.', fileURLToPath(filePath)),
			name: fileName,
			path: filePathData.join(' ')
		});
	}
}

let indexText = '';
let markdownText = '| Name | Preview |\n| --- | --- |\n';

ICONS.forEach(icon => {
	indexText += `export const ${icon.name} = '${icon.path}';\n`;
	markdownText += `| \`${icon.name}\` | <img src="${icon.raw}">\n`;
});

fs.writeFile('src/index.ts', indexText);
fs.writeFile('ICONS.md', markdownText);
